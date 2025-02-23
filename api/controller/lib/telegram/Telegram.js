const { handleRegistration, registrationSteps, checkTenantsRegistered } = require("./registration");
const { handlePhotoRequest, paymentRequestSteps   } = require("./payment");
const { sendMessage } = require("./messages");
const { payButton, ruleButton, registerButton } = require("./buttons");

function clearSteps(chatId) {
    if (registrationSteps[chatId]) {
        delete registrationSteps[chatId];
    }
    if (paymentRequestSteps[chatId]) {
        delete paymentRequestSteps[chatId];
    }
}

async function handleCallbackQuery(callback_query) {
    const msgObj = callback_query.message;
    const data = callback_query.data;
    
    switch (data) {
        case "pay":
            // paymentRequestSteps[msgObj.chat.id] = { 
            //     step: 1, 
            //     chat_id: msgObj.chat.id, 
            //     photos: []
            // };
            // return sendMessage(msgObj, `Please upload photos for request payment:\n- Water Meter\n- Electricity Meter`);
            return handlePhotoRequest(msgObj);
        
        case "rule":
            const ruleMessage = `កំណត់សម្គាល់:\n\n1. រាល់ការបង់ប្រាក់យឺតលើសពី 5 ថ្ងៃនៃថ្ងៃកំណត់ (ថ្ងៃទី 1 ដើមខែ) នឹងត្រូវពិន័យមួយថ្ងៃ 3 ដុល្លារ។\n2.​ ត្រូវបង់ប្រាក់បន្ទប់,ទឹក,ភ្លើងរាល់ថ្ងៃដើមខែដោយភ្ជាប់មកជាមួយបង្កាន់ដៃមួយសន្លឹក។\n3. ត្រូវធ្វើការផ្លាស់ប្ដូរសម្ភារៈក្នុងបន្ទប់ដែលខូចក្នុងអំឡុងពេលស្នាក់នៅដោយខ្លួនឯង។\n4. ត្រូវជូនដំណឹងដល់ម្ចាស់បន្ទប់យ៉ាងតិចណាស់ 15 ថ្ងៃមុននឹងបញ្ឈប់ការជួលនិងសម្អាតបន្ទប់ឲ្យបានស្អាតមុននឹងចាកចេញបើមិនដូច្នេះទេម្ចាស់បន្ទប់មានសិទ្ធិកាត់ប្រាក់កក់ចំនួន 20 ដុល្លាររបស់លោកអ្នក។\n5. ត្រូវគោរពបទបញ្ជាផ្ទៃក្នុងរបស់បន្ទប់ជួល។`;
            return sendMessage(msgObj, ruleMessage, [payButton, ruleButton]);

        case "register":
            // registrationSteps[msgObj.chat.id] = { 
            //     step: 1, 
            //     chat_id: msgObj.chat.id 
            // };
            // return sendMessage(msgObj, "Enter your full name:\nExample: John Doe");
            return handleRegistration(msgObj);

        default:
            return sendMessage(msgObj, "I don't understand this action.");
    }
}

// handle income messages
async function handleMessage(messageObj) {
    const chatId = messageObj.chat.id;
    const messageText = messageObj.text || " ";
    const messagePhoto = messageObj.photo;

    console.log(messageObj);

    try {
        // Handle Commands
        if (messageText.charAt(0) === "/") {
            const command = messageText.substr(1);
            clearSteps(chatId); // clear on going step, start again!
            return handleCommands(messageObj, command);

        }else if (!registrationSteps[chatId] && !paymentRequestSteps[chatId] && !messagePhoto){
            return sendMessage(messageObj, "Sorry, I don't understand this action.\n\nType /start");
        }        

        // Handle Registration Steps
        if (registrationSteps[chatId]) {
            return handleRegistration(messageObj);
        }

        // Handle upload photo for payment
        if(paymentRequestSteps[chatId]){
            return handlePhotoRequest(messageObj);
        }
        
        // handle error when tenant send photo without click btn (inline keyboard) 'pay now' 
        if (!paymentRequestSteps[chatId] && messagePhoto) {
            return sendMessage(messageObj, "Please click the 'Pay Now' button before sending the photos to request payment!\n\nType /start ");
        }

        
    } catch (error) {
        console.error("Error Message: ",error.message);
    }
}

// handle bot commands
async function handleCommands(messageObj, command) {
    switch (command) {
        case "start":
            clearSteps(messageObj.chat.id);

            // const isRegistered = await checkTenantsRegistered(messageObj.chat.id);
            const isRegistered = true;  // just for testing

            if (isRegistered) {
                return sendMessage(
                    messageObj,
                    `Hello ${messageObj.from.username}, I am UnitNest Bot. What can I help you with today?`,
                    [payButton, ruleButton]
                );
            } else {
                return sendMessage(
                    messageObj,
                    `Hello ${messageObj.from.username}, I am UnitNest Bot. Please register to continue.`,
                    [registerButton]
                );
            }
        default:
            return sendMessage(messageObj, "Sorry, I do not understand.");
    }
}

module.exports = { 
    handleMessage, 
    handleCallbackQuery
};



// async function sendMessage(messageObj, messageText, button = null, photo = null) {
//     if (button != null) {
//         console.log("Sending message with button");
//         return axiosInstance.get("sendMessage", {
//             chat_id: messageObj.chat.id,
//             text: messageText,
//             reply_markup: JSON.stringify({
//                 inline_keyboard: button,
//             }),
//         });
//     } else if (photo != null){
//             console.log("Sending message photo")
//             return axiosInstance.get("sendPhoto",{
//                 chat_id: messageObj.chat.id,
//                 photo: photo,   // fild id / url of photo
//                 caption: messageText,
//             });
//     } else {
//         console.log("Sending message without button");
//         return axiosInstance.get("sendMessage", {
//             chat_id: messageObj.chat.id,
//             text: messageText,
//         });
//     }
// }