const { handleMessage , handleCallbackQuery} = require("./lib/telegram/Telegram");
const { handleRequestBakong ,handleKHQRstatus} = require("./lib/khqr/khqr");

async function handler(req,res,method){
    const {body} = req;
    if (body) {
        if (body.message) {
            const messageObj = body.message;
            await handleMessage(messageObj);
        }

        if (body.callback_query) {
            const callbackQuery = body.callback_query;
            await handleCallbackQuery(callbackQuery);
        }
        if(body.amount){
            console.log(body.amount);
            await handleRequestBakong(body.amount,res);
        }
        if(body.md5){
            console.log(body.md5);
            await handleKHQRstatus(body.md5,res);
        }
    }

    return;
}



module.exports = {handler};