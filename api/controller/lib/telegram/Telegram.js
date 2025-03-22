
const { handleRegistration, registrationSteps } = require("./registration");
const { handlePhotoRequest, paymentRequestSteps  } = require("./payment");
const { sendMessage } = require("./messages");
const { ruleButton, registerButton, contactButton, helpButton } = require("./buttons");
const { checkTenantsRegistered, fetchRule, fetchContact } = require("../cloud_function/index");


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
    const systemId = "MF3DBs9vbee9yw0jwfBjK9kIGXs2";
    
    switch (data) {
        case "pay":
            return handlePhotoRequest(msgObj);

        case "register":
            return handleRegistration(msgObj);
        
        case "rule":
            const ruleMessage = await fetchRule(systemId);
            return sendMessage(msgObj, ruleMessage, [[ruleButton, contactButton], [helpButton]]);

        case "contact":

            const contactMessage = await fetchContact(systemId);
            return sendMessage(msgObj, contactMessage, [[ruleButton, contactButton], [helpButton]]);

        case "help":

            const helpInfo = `ℹ️ Help Info: \n\n`;
            return sendMessage(msgObj, helpInfo, [[ruleButton, contactButton], [helpButton]]);

        default:
            return sendMessage(msgObj, "⚠️ I don't understand this action.");
    }
}

// handle income messages
async function handleMessage(messageObj) {
    const chatId = messageObj.chat.id;
    const messageText = messageObj.text || " ";
    const messagePhoto = messageObj.photo;
    const messageDoc = messageObj.document; // handle photo in case send as file (doc)

    // const systemId = "MF3DBs9vbee9yw0jwfBjK9kIGXs2";  // use fix systemId for testing first
    // const isRegistered = await checkTenantsRegistered(systemId, chatId);    // check if tenant has registered

    console.log(messageObj);

    try {
        // Handle Commands
        if (messageText.charAt(0) === "/") {
            const command = messageText.substr(1);
            clearSteps(chatId); // clear on going step, start again!
            return handleCommands(messageObj, command);

        }else if (!registrationSteps[chatId] && !paymentRequestSteps[chatId] && !messagePhoto && !messageDoc){
            return sendMessage(messageObj, "⚠️ Sorry, I don't understand this action.\n\n👉 Type /start to begin.");
        }

        // // Ensure user is registered before allowing other interactions
        // if (!isRegistered) {
        //     return sendMessage(messageObj, "⚠️ You need to register first.\n\n👉 Type /start to begin.", [registerButton]);
        // } 


        // Handle Registration Steps
        if (registrationSteps[chatId]) {
            return handleRegistration(messageObj);
        }

        // Handle upload photo for payment
        if(paymentRequestSteps[chatId]){
            return handlePhotoRequest(messageObj);
        }
        
        // Handle cases where a tenant sends a photo without clicking "Pay Now"
        if (!paymentRequestSteps[chatId] && !(messagePhoto || messageDoc)) {
            return sendMessage(
                messageObj,
                "⚠️ Please click the 'Pay Now' button before sending payment photos.\n\n👉 Type /start.",
            );
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

            const systemId = "MF3DBs9vbee9yw0jwfBjK9kIGXs2";  // use fix systemId for testing first
            const isRegistered = await checkTenantsRegistered(systemId, messageObj.chat.id);    // check if tenant has registered

            if (isRegistered) {
                console.log("Check register is true!"); // debug process
                return sendMessage(
                    messageObj,
                    `👋  Hello @${messageObj.from.username}, \n\n\tI am UnitNest Bot. How can I help you today?\n`,
                    [[ruleButton, contactButton], [helpButton]],
                );
            } else {
                console.log("Check register is false!");    // debug process 
                return sendMessage(
                    messageObj,
                    `👋  Hello @${messageObj.from.username}, \n\n\tI am UnitNest Bot. Please register to continue!\n`,
                    [registerButton]
                );
            }
        default:
            return sendMessage(messageObj, "Sorry, I do not understand.");
    }
}

module.exports = { 
    handleMessage, 
    handleCallbackQuery,
    handleCommands
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










