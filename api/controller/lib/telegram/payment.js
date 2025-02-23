require('dotenv').config();
const { axiosInstance } = require("../axios");
const { sendMessage } = require("./messages");
const FormData = require('form-data');
const fs = require('fs');

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

                    // Use dummy data for testing
                    const dummyData = [
                        {
                            "Meter Type": "Water",
                            "Meter Number": "12345",
                            "Accuracy": "98%"
                        },
                        {
                            "Meter Type": "Electricity",
                            "Meter Number": "67890",
                            "Accuracy": "95%"
                        }
                    ];

                    // const response = await sendPhotosToAPI(state.photos[0].filePath, state.photos[1].filePath);
                    // if (!response) {
                    //     return sendMessage(msgObj, "Error processing payment request.");
                    // }

                    savePayRequestData(msgObj, dummyData, state);   // Use dummy data for testing
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


// process photo to flask api for detection
async function sendPhotosToAPI(photo1, photo2) {

    const form = new FormData();

    //append photos to form-data
    form.append('photo1', fs.createReadStream(photo1));
    form.append('photo2', fs.createReadStream(photo2));

    try{
        const response = await axiosInstance.post('http://flask_api_url_endpoint', form,{
            headers:{
                // ...form.getHeaders()
                'Content-Type': 'multipart/form-data',
            }
        });
        if (response.status === 200) {
            return response.data;  // Return the JSON data from Flask API
          } else {
            console.error("Error: API request failed with status code", response.status);
            return null;
          }

    }catch(error){
        console.error("Error sending photos to API:", error);
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
        let systemId = "dummy-system-id";  // Replace with actual systemId logic

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
    
        // Prepare the data to json format
        const dataToSave = {
          chatId: msgObj.chat.id,
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