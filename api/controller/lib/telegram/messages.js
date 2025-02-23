const { axiosInstance } = require("../axios");

async function sendMessage(messageObj, messageText, button = null, photo = null) {
    try {
        console.log("Sending message with text:", messageText);

        if (button != null) {
            console.log("Sending message with button");
            const response = await axiosInstance.get("sendMessage", {
                chat_id: messageObj.chat.id,
                text: messageText,
                reply_markup: JSON.stringify({ inline_keyboard: button }),
            });
            // console.log("Message sent:", response.data);
        } else if (photo != null) {
            console.log("Sending message photo");
            const response = await axiosInstance.get("sendPhoto", {
                chat_id: messageObj.chat.id,
                photo: photo, // file id / url of photo
                caption: messageText,
            });
            // console.log("Photo sent:", response.data);
        } else {
            console.log("Sending message without button");
            const response = await axiosInstance.get("sendMessage", {
                chat_id: messageObj.chat.id,
                text: messageText,
            });
            // console.log("Message sent:", response.data);
        }
    } catch (error) {
        console.error("Error sending message:", error.message);
    }
}

module.exports = { sendMessage }