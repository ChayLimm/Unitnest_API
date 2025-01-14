const { handleMessage , handleCallbackQuery} = require("./lib/Telegram");

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
    }

    return;
}



module.exports = {handler};