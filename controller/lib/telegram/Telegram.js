const { axiosInstance } = require("../axios");

const payButton =  [{ text: "Pay Now", callback_data: "pay" }];
const ruleButotn = [{text: "Rules", callback_data: "rule"}];
const yesButton = [{text: "Yes", callback_data: "yes"}];
const noButton = [{text: "No", callback_data: "no"}];

function sendMessage(messageObj,messageText,button = null){

    if(button != null){
        console.log("sending message with button")
        return axiosInstance.get("sendMessage",{
            chat_id : messageObj.chat.id,
            text: messageText,
            reply_markup: JSON.stringify({
                inline_keyboard: button,
              }),       
        })
    }else
    {
        console.log("sending message without button")
        return axiosInstance.get("sendMessage",{
            chat_id : messageObj.chat.id,
            text: messageText,
        });
               
 }
}

async function handleCallbackQuery(callback_query) {
    const chatId = callback_query.message.chat.id;
    const data = callback_query.data; 

    let replyMessage = "You clicked a button!";
    if (data === "pay") replyMessage = "You clicked Button 1!";
    if (data === "rule") {
        replyMessage = "កំណត់សម្គាល់.\n\n1. រាល់ការបង់ប្រាក់យឺតលើសពី 5 ថ្ងៃនៃថ្ងៃកំណត ់(ថ្ងៃទី 1 ដើមខែ) នឹងត្រូវពិន័យមួយថ្ងៃ 3 ដុល្លារ។\n2. ត្រូវបង់ប្រាក់បន្ទប់,ទឹក,ភ្លើងរាល់ថ្ងៃដើមខែដោយភ្ជាប់មកជា មួយបង្កាន់ដៃមួយសន្លឹក។\n3. ត្រូវធ្វើការផ្លាស់ប្ដូរសម្ភារៈក្នុងបន្ទប់ដែលខូចក្នុងអំឡុងពេល ស្នាក់នៅដោយខ្លួនឯង។\n4. ត្រូវជូនដំណឹងដល់ម្ចាស់បន្ទប់យ៉ាងតិចណាស់15ថ្ងៃមុននឹង បញ្ឈប់ការជួលនិងសម្អាតបន្ទប់ឲ្យបានស្អាតមុននឹងចាកចេញបើមិនដូច្នេះទេម្ចាស់បន្ទប់មានសិទ្ធិកាត់ប្រាក់កក់ចំនួន20ដុល្លាររបស់លោកអ្នក។\n5. ត្រូវគោរពបទបញ្ជាផ្ទៃក្នុងរបស់បន្ទប់ជួល។\n";
        return sendMessage(callback_query.message,replyMessage,[payButton,ruleButotn])
    }
   

    await sendMessage(callback_query.message,replyMessage)
}

function handleMessage(messageObj){
    const messageText = messageObj.text || " ";
    console.log(messageObj);
    if(messageText.charAt(0) == "/"){
        const command = messageText.substr(1);
        switch(command){
            case "start":
                return sendMessage(
                    messageObj,
                    `Hello ${messageObj.from.username}, I am E Monitor, What can i help you with today ?`,[payButton,ruleButotn]);
            default:
                return sendMessage(messageObj,"Sorry, i do not understand");
        }
    }
    if (messageObj.chat.type === 'group' || messageObj.chat.type === 'supergroup') {
        console.log(`Message received in group: ${messageText}`);    
        if (messageText === "hello") {
            sendMessage(
                messageObj,
                "Hello group! How can I assist you today?"
            );
        } else {
            sendMessage(
                messageObj,
                "Sorry, I don't understand that."
            );
        }
    }else { 
        switch (messageObj.text){
            case "hello":
                return sendMessage(messageObj, "hello there!");
                
            default:
                return sendMessage(messageObj,"Sorry, i do not understand");
        }
    }

    
   
    
}

module.exports= {handleMessage, handleCallbackQuery};