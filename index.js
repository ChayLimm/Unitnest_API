const express = require("express");
const axios = require("axios"); 
const PORT = process.env.PORT || 4040;
const { handler } = require("./controller");

const BOT_TOKEN = '7731519842:AAEEAnhShMTmCX6fseR5CsERyVvt-t-63n4';
const WEBHOOK_URL = 'https://425d-36-37-169-155.ngrok-free.app';

const app = express();
app.use(express.json());

app.post("*", async (req, res) => {
    console.log(req.body);
    res.send(await handler(req));
});

app.get("*", async (req, res) => {
    res.send("Hello get");
});

// Start the server
app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on Port", PORT);

    // Set webhook after server starts
    const setWebhook = async () => {
        try {
            const response = await axios.post(
                `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,{ url: WEBHOOK_URL }
            );
            console.log('Webhook set successfully:', response.data);
        } catch (error) {
            console.error('Error setting webhook:', error.response ? error.response.data : error.message);
        }
    };

    setWebhook();
});
