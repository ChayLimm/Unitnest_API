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
            const response = await axiosInstance.post("sendPhoto", {
                chat_id: messageObj.chat.id,
                photo: photo, // File ID or URL of the photo
                caption: messageText, // changed from `text` to `caption`
            });
            console.log("Photo sent:", response?.data);  // debug
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
        console.log("Error response:", error.response?.data);   // debug, error message
    }
}

module.exports = { sendMessage }