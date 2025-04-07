require('dotenv').config();
const { axiosInstance } = require("../axios");
const { sendMessage } = require("./messages");
const axios = require("axios"); 
const { storeNotification } = require("../cloud_function/index");
// const { v4: uuidv4 } = require('uuid');


const Token = process.env.BOT_TOKEN;
const paymentRequestSteps = {}; // track users expecting payment images

// Handle photo (image) messages
async function handlePhotoRequest(msgObj) {
    const chatId = msgObj.chat.id;
    const photo = msgObj.photo;
    const document = msgObj.document;
    const msgText = msgObj.text;

    if (!paymentRequestSteps[chatId]) {
        paymentRequestSteps[chatId] = { 
                step: 1, 
                chat_id: msgObj.chat.id, 
                photos: []
            };
            return sendMessage(msgObj, `📸 Please upload photos for request payment:\n\n✅ Water Meter\n✅ Electricity Meter`);
    } 

    const state = paymentRequestSteps[chatId];

    if (state.step == 1) {

        // Check if there's a photo or document or text message
        if (msgText) {
            // If it's a text message, inform the user and continue
            return sendMessage(msgObj, "⚠️ Please send the required photos: Water Meter and Electricity Meter.");
        }

        if (photo.length === 0 && !document) {
            return sendMessage(msgObj, "⚠️ Please send the required photos: Water Meter and Electricity Meter.");
        }

        const fileId = photo.length > 0 ? photo[photo.length - 1].file_id : document?.file_id;  // Get fileId of last photo in array -> photo / doc (file image)
        console.log("File ID:", fileId);

        try {
            const photoDetails = await axiosInstance.get(
                "getFile", {file_id: fileId}
            ); // Get file/photo details from Telegram server

            // const photoDetails = await axiosInstance.get(`getFile?file_id=${fileId}`);
            
            if (photoDetails && photoDetails.data && photoDetails.data.result) {
                const photoData = photoDetails.data.result;

                const photoInfo = {
                    chatId: chatId,
                    fileId: fileId,
                    fileSize: photoData.file_size,
                    filePath: photoData.file_path,
                    fileUrl: `https://api.telegram.org/file/bot${Token}/${photoData.file_path}`,
                    caption: msgObj.caption || '',
                    receivedAt: new Date().toISOString(),
                };

                state.photos.push(photoInfo);

                setTimeout(() => {
                    if (state.photos.length === 1) {
                        sendMessage(msgObj, "Please upload the second photo!");
                    }
                }, 600);

                if (state.photos.length === 2){
                    sendMessage(
                        msgObj,
                        "Thank you! Your payment request is processing...!"
                    );
                    state.step = 2; // Completed step for payment request
                    console.log("Received Both Photo:", state.photos);

                    // send to flask api without await
                    sendPhotosToAPI(chatId, state.photos[0].fileUrl, state.photos[1].fileUrl);

                    // Clean up stored request state
                    delete paymentRequestSteps[chatId];  
                    state.photos = []; 
    
                    // Use dummy data for testing
                    // const dummyData = [
                    //     {
                    //         "Meter Type": "Water",
                    //         "Meter Number": "12365",
                    //         "Accuracy": "98%"
                    //     },
                    //     {
                    //         "Meter Type": "Electricity",
                    //         "Meter Number": "67891",
                    //         "Accuracy": "95%"
                    //     }
                    // ];


                    //Send photos to Flask API for processing
                    // const responseData = await sendPhotosToAPI(state.photos[0].fileUrl, state.photos[1].fileUrl);
                    // if (!responseData) {
                    //     return sendMessage(msgObj, "Error processing payment request.");
                    // }

                    // savePayRequestData(msgObj, responseData, state);  
                    // delete paymentRequestSteps[chatId]; // Payment request complete
                    // state.photos = [];   // Clear stored photos

                }
            } else {
                return sendMessage(msgObj, "Failed to retrieve photo, please try again.");
            }

        } catch (error) {
            console.error("Error Photo Upload: ", error.message);
            return sendMessage(msgObj, "Error, cannot get your photo. Please try again!");
        }
    } 
}

// handle post request to ai flask without wait for reponse
function sendPhotosToAPI(chatId, photo1Url, photo2Url) {
    try {
        console.log("Sending payload to Flask API:", photo1Url, photo2Url);

        // Send the POST request without waiting for the response
        axios.post(
            'https://3a87-203-95-199-47.ngrok-free.app/process',
            {   
                chat_id: chatId,
                image_urls: [photo1Url, photo2Url] 
            },
            { 
                headers: { 'Content-Type': 'application/json' },
            }
        );

        console.log("POST request sent to Flask API");
        
    } catch (error) {
        console.error("Error sending photos to API:", error.message);
    }
}

// add system id for notify to correct system of landlord that own the system
// add const system Id (for notify and send data to the right system of landlord)

async function savePayRequestData(responeData) {
    // debug: extract reponse and save to notification
    console.log(`Process extract response format`);
    
    if (responeData) {
        let waterMeter;
        let electricityMeter;
        let waterAccuracy;
        let electricityAccuracy;
        let photo1; 
        let photo2;
        let systemId = "MF3DBs9vbee9yw0jwfBjK9kIGXs2";  // sample systemId for testing
        let dataType = "paymentRequest";
        let status = "pending"; 

        // Extract meter data
        for (let i in responeData.meterData) {
            let meter = responeData.meterData[i];

            if (meter['Meter Type'] === 'Water') {
                waterMeter = parseFloat(meter['Meter Number']); // Convert to float (double)
                waterAccuracy = parseFloat(meter['Accuracy']);
            } else if (meter['Meter Type'] === 'Electricity') {
                electricityMeter = parseFloat(meter['Meter Number']);
                electricityAccuracy = parseFloat(meter['Accuracy']);
            }
        }


        // Assign chatId and photo URLs from the response data
        const chatId = responeData.chat_id.toString();
        photo1 = responeData.url_1;
        photo2 = responeData.url_2;

        // Debug: check both urls in response
        console.log(`URL 1: ${photo1}`);
        console.log(`URL 2: ${photo2}`);

        // Prepare the data payment request to JSON format
        const payReqDataToStore = {
            systemID: systemId,
            chatID: chatId,
            dataType: dataType,
            read: false,
            status: status,
            isApprove: true,
            notifyData: {
                requestDateOn: new Date().toISOString(),
                water: waterMeter,
                electricity: electricityMeter,
                waterAccuracy: waterAccuracy,
                electricityAccuracy: electricityAccuracy,
                photo1URL: photo1,
                photo2URL: photo2
            }
        };

        console.log('\nRetrieve Data From API after payment request is processed!!');
        console.log(JSON.stringify(payReqDataToStore, null, 2));  

        // Store to Firebase in the collection 'notification'
        await storeNotification(systemId, payReqDataToStore);

    } else {
        console.error("No data received from the Flask API");
    }
}


module.exports = {
    handlePhotoRequest,
    paymentRequestSteps,
    savePayRequestData
};


// // ✅ Process API call in background (without blocking response)
// async function processPaymentRequest(chatId, msgObj, state) {
//     // console.log(`send payment request to Flask API`);
//     try {
//         const responseData = await sendPhotosToAPI(chatId, state.photos[0].fileUrl, state.photos[1].fileUrl);
//         if (!responseData) {
//             return sendMessage(msgObj, "Error processing payment request.");
//         }

//         savePayRequestData(msgObj, responseData, state);

//         sendMessage(msgObj, "✅ Your payment request has been successfully processed.");
//     } catch (error) {
//         console.error("Payment Processing Error:", error);
//         sendMessage(msgObj, "⚠️ There was an error processing your request. Please try again.");
//     }
// }


// async function sendPhotosToAPI(chatId, photo1Url, photo2Url) {
//     try {
//         console.log("📤 Sending payload to Flask API:", photo1Url, photo2Url);
//         const response = await axios.post(
//             'https://0cdf-117-20-112-36.ngrok-free.app/process', 
//             { 
//                 chat_id: chatId,
//                 image_urls: [photo1Url, photo2Url] 
//             },
//             { 
//                 headers: { 'Content-Type': 'application/json' } 
//             }
//         );

//         console.log("✅ API Response:", response.data); // Debugging
//         return response.status === 200 ? response.data : null;
//     } catch (error) {
//         console.error("❌ Error sending photos to API:", error.message);
//         if (error.response) console.error("🔴 API Response Error:", error.response.data);
//         return null;
//     }
// }


// function sendPhotosToAPI(chatId, photo1Url, photo2Url) {
//     try {    
//         console.log("Sending payload to Flask API:",photo1Url, photo2Url); // Debugging

//         // Use Axios directly, request POST 
//         const response = axios.post(
//             'https://ac6a-117-20-112-36.ngrok-free.app/process', 
//             {   
//                 chat_id: chatId,
//                 image_urls: [photo1Url, photo2Url] 
//             },
//             { 
//                 headers: { 'Content-Type': 'application/json' },
//             }
//         );

//         console.log("API Response:", response.data); // Debugging

//         if (response.status === 200) {
//             return response.data; // Return the JSON data from Flask API
//         } else {
//             console.error("Error: API request failed with status code", response.status);
//             return null;
//         }
//     } catch (error) {
//         console.error("Error sending photos to API:", error.message);
//         if (error.response) {
//             console.error("API Response Error:", error.response.data); // Debugging
//         }
//         return null;
//     }
// }

// function savePayRequestData(msgObj, ResponeData, state) {
//     // debug: extract reponse and save to notification
//     console.log(`Process extract reponse format`);
//     if (ResponeData) {
//         let waterMeter ;
//         let electricityMeter ;
//         let waterAccuracy;
//         let electricityAccuracy ;
//         let photo1; 
//         let photo2;
//         let systemId = "MF3DBs9vbee9yw0jwfBjK9kIGXs2";  // sample systemId for testing
//         let dataType = "paymentRequest";
//         let status = "pending"; 

//         // Ensure state and photos are available
//         if (state && state.photos.length === 2) {
//             photo1 = state.photos[0].fileUrl;
//             photo2 = state.photos[1].fileUrl;
//         }

//         for (let i in ResponeData){
//             let meter = ResponeData[i];

//             if (meter['Meter Type'] === 'Water') {
//                 waterMeter = parseFloat(meter['Meter Number']); // Convert to float (double)
//                 waterAccuracy = parseFloat(meter['Accuracy']);  
//             }else if (meter['Meter Type'] === 'Electricity') {
//                 electricityMeter = parseFloat(meter['Meter Number']); 
//                 electricityAccuracy = parseFloat(meter['Accuracy']);  
//             }
//         }
    
//         // Prepare the data paymnet request to json format
//         const payReqDataToStore = {
//             // id: uuidv4(),
//             systemID: systemId,
//             chatID: msgObj.chat.id.toString(),
//             dataType: dataType,
//             read: false,
//             status: status,
//             isApprove: false,
//             notifyData:{
//                 requestDateOn: new Date().toISOString(),  
//                 water: waterMeter,
//                 electricity: electricityMeter,
//                 waterAccuracy: waterAccuracy,
//                 electricityAccuracy: electricityAccuracy,
//                 photo1URL: photo1,
//                 photo2URL: photo2
//             }
//         };

//         console.log('\nRetrive Data From Api after done payment request!!')
//         console.log(JSON.stringify(payReqDataToStore, null, 2));  

//         // store to firebase in collection notification
//         storeNotification(systemId, payReqDataToStore);
        
//       } else {
//         console.error("No data received from the Flask API");
//       }
// }