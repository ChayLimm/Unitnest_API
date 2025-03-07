require('dotenv').config();
const { axiosInstance } = require("../axios");
const { sendMessage } = require("./messages");
const axios = require("axios");
// const FormData = require('form-data');
// const fs = require('fs');

const Token = process.env.BOT_TOKEN;

const paymentRequestSteps = {}; // track users expecting payment images

// Handle photo (image) messages
async function handlePhotoRequest(msgObj) {
    const chatId = msgObj.chat.id;
    const photo = msgObj.photo;
    const msgText = msgObj.text;

    if (!paymentRequestSteps[chatId]) {
        paymentRequestSteps[chatId] = { 
                step: 1, 
                chat_id: msgObj.chat.id, 
                photos: []
            };
            return sendMessage(msgObj, `Please upload photos for request payment:\n- Water Meter\n- Electricity Meter`);
    } 

    const state = paymentRequestSteps[chatId];

    if (state.step == 1) {

        // Ensure that photo is an array and is not empty
        if (!photo || !Array.isArray(photo) || photo.length === 0) {
            if (msgText) {
                return sendMessage(msgObj, "Please send only required photos: Water Meter and Electricity Meter.")     
            }
            return sendMessage(msgObj, "No photo received!!");
        }

        const fileId = photo[photo.length - 1].file_id;   // Get fileId of last photo in array (high size)

        try {
            const photoDetails = await axiosInstance.get(
                "getFile", {file_id: fileId}
            ); // Get file/photo details from Telegram server
            
            if (photoDetails && photoDetails.data && photoDetails.data.result) {
                const photoData = photoDetails.data.result;

                const photoInfo = {
                    chatId: chatId,
                    fileId: fileId,
                    fileSize: photoData.file_size,
                    filePath: photoData.file_path,
                    fileUrl: `https://api.telegram.org/file/bot${Token}/${photoData.file_path}`,
                    caption: msgObj.caption || '',
                    receivedAt: new Date().toLocaleDateString(),
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
                        "Thank you! Your payment request is processing."
                    );
                    state.step = 2; // Completed step for payment request
                    // console.log("Received Both Photo:", state.photos);

                    // // Use dummy data for testing
                    // const dummyData = [
                    //     {
                    //         "Meter Type": "Water",
                    //         "Meter Number": "12345",
                    //         "Accuracy": "98%"
                    //     },
                    //     {
                    //         "Meter Type": "Electricity",
                    //         "Meter Number": "67890",
                    //         "Accuracy": "95%"
                    //     }
                    // ];

                    const response = await sendPhotosToAPI(state.photos[0].fileUrl, state.photos[1].fileUrl);
                    if (!response) {
                        return sendMessage(msgObj, "Error processing payment request.");
                    }

                    savePayRequestData(msgObj, response, state);   // Use dummy data for testing -> use response data from api 
                    delete paymentRequestSteps[chatId]; // Payment request complete
                    state.photos = [];   // Clear stored photos

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

    // // Ensure that photo is an array and is not empty
    // if (!photo || !Array.isArray(photo) || photo.length === 0) {
    //     return sendMessage(msgObj, "No photo received or invalid format.");
    // }
    // if (msgText) {
    //     return sendMessage(msgObj, "Please send the required photos: Water Meter and Electricity Meter.");
    // }


// process photo to flask api for detection img
async function sendPhotosToAPI(photo1Url, photo2Url) {
    try {    
        // console.log("Sending payload to Flask API:", payload); // Debugging

        // Use Axios directly, request POST 
        const response = await axios.post(
            'https://66c0-203-144-80-238.ngrok-free.app/process', 
            { 
                image_urls: [photo1Url, photo2Url] 
            },
            { 
                headers: { 'Content-Type': 'application/json' } 
            }
        );

        console.log("API Response:", response.data); // Debugging

        if (response.status === 200) {
            return response.data; // Return the JSON data from Flask API
        } else {
            console.error("Error: API request failed with status code", response.status);
            return null;
        }
    } catch (error) {
        console.error("Error sending photos to API:", error.message);
        if (error.response) {
            console.error("API Response Error:", error.response.data); // Debugging
        }
        return null;
    }
}

// add system id for notify to correct system of landlord that own the system
// add const system Id (for notify and send data to the right system of landlord)

function savePayRequestData(msgObj, ResponeData, state) {
    if (ResponeData) {
        let waterMeter = null;
        let electricityMeter = null;
        let waterAccuracy = null;
        let electricityAccuracy = null;
        let photo1 = null; 
        let photo2 = null;
        let systemId = "MF3DBs9vbee9yw0jwfBjK9kIGXs2";  // sample systemId for testing

        // Ensure state and photos are available
        if (state && state.photos.length === 2) {
            photo1 = state.photos[0].fileUrl;
            photo2 = state.photos[1].fileUrl;
        }
    
        // Iterate over the photo data to extract meter info
        for (let i in ResponeData){
            let meter = ResponeData[i];
            if (meter['Meter Type'] === 'Water') {
                waterMeter = meter['Meter Number'];
                waterAccuracy = meter['Accuracy'];
            }
            if (meter['Meter Type'] === 'Electricity') {
                electricityMeter = meter['Meter Number'];
                electricityAccuracy = meter['Accuracy'];
            }
        }
    
        // Prepare the data payment request to json format
        const dataToSave = {
            systemID: systemId,
            chatID: msgObj.chat.id,
            date: new Date().toLocaleDateString(),  
            waterMeter: waterMeter,
            electricity: electricityMeter,
            waterAccuracy: waterAccuracy,
            electricityAccuracy: electricityAccuracy,
            photo1URL: photo1,
            Photo2URL: photo2
        };

        console.log('\nRetrive Data From Api after done payment request!!')
        console.log(JSON.stringify(dataToSave, null, 2));  
      } else {
        console.error("No data received from the Flask API");
      }
}

module.exports = {
    handlePhotoRequest,
    paymentRequestSteps
};