const { handleMessage, handleCallbackQuery } = require("./lib/telegram/Telegram");
const { handleRequestBakong ,handleKHQRstatus} = require("./lib/khqr/khqr");
const { sendMessage } = require("./lib/telegram/messages");

async function handler(req,res,method){

    
    const {body} = req;
    if (body) {
        if (body.message) {
            const messageObj = body.message;
            await handleMessage(messageObj);
        }

        // for handle receipt
        if (body.receipt) {
            const msgObj = {
                chat: {
                    id: parseInt(body.receipt.chat_id)  // Convert chat_id to integer
                }
            };
            console.log("Preparing to send photo to chat_id:", msgObj.chat.id); // debug check before sendMessage
            sendMessage(msgObj, body.receipt.caption, null, body.receipt.photo);
        }

        // for handle sendMessage via bot
        if (body.flutter_call) {
            const msgObj = {
                chat: {
                    id: body.flutter_call.chat_id
                }
            };
            sendMessage(msgObj, body.flutter_call.text, null, null);
        }

        if (body.callback_query) {
            const callbackQuery = body.callback_query;
            await handleCallbackQuery(callbackQuery);
        }
        if(body.bakongAccount){
            console.log(body.bakongAccount.bakongID);
            await handleRequestBakong(body.bakongAccount,res);
        }
        if(body.md5){
            console.log(body.md5);
            await handleKHQRstatus(body.md5,res);
        }
    }

    return;
}



module.exports = {handler};