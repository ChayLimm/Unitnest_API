const { handleMessage , handleCallbackQuery} = require("./lib/telegram/Telegram");
const { handleRequestBakong } = require("./lib/khqr/khqr");

async function handler(req,method){
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
            console.log("handling");
            await handleRequestBakong(body.amount);
        }
    }

    return;
}



module.exports = {handler};