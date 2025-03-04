// const { handleMessage , handleCallbackQuery} = require("./lib/telegram/telegram");
const { handleMessage, handleCallbackQuery } = require("./lib/telegram/Telegram");
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