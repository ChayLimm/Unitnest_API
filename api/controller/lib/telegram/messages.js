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
            console.log("Message sent:", response.data);    // debug
        } else if (photo != null) {
            try {
                console.log("Sending message with photo, photo URL:", photo);
                const response = await axiosInstance.post("sendPhoto", {
                    chat_id: messageObj.chat.id,
                    photo: photo, 
                    caption: messageText,
                });
                console.log("Photo sent:", response.data);  // debug
            } catch (error) {
                console.error("Error sending photo:", error.response?.data || error.message);
            }

            // console.log("Sending message with photo");
            // const response = await axiosInstance.post("sendPhoto", {
            //     chat_id: messageObj.chat.id,
            //     photo: photo, // File ID or URL of the photo
            //     caption: messageText,
            // });
            // // console.log("Debug Get Send Photo!");
            // console.log("Photo sent:", response?.data);  // debug
        } else {
            console.log("Sending message without button");
            const response = await axiosInstance.get("sendMessage", {
                chat_id: messageObj.chat.id,
                text: messageText,
            });
            console.log("Message sent:", response.data);    // debug
        }
    } catch (error) {
        console.error("Error sending message:", error.message);
        console.log("Error response:", error.response?.data);   // debug, error message
    }
}

module.exports = { sendMessage }