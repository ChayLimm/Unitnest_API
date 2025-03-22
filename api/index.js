// require('dotenv').config({ path: '/../.env' });
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const serverless = require("serverless-http");
const { savePayRequestData } = require("../api/controller/lib/telegram/payment");
const { handler } = require("./controller/handler");

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = 'https://unitnest-api.vercel.app/telegram';
// const WEBHOOK_URL = 'https://ebb8-118-67-205-224.ngrok-free.app/telegram';

const app = express();
app.use(express.json());
app.use(cors());


app.get('/test', (req, res) => {
    res.send('hello');
});

app.post("/testAPI", async (req, res) =>{
    console.log(req.body);
    // request... 
}); 

app.post("/telegram", async (req, res) => {
    console.log(req.body);
    res.send(await handler(req));
});

app.post("/aimodel", async (req, res) => {
    console.log(req.body);
    try {
        const responseData = req.body; // Assuming the data from Flask is in the request body
        console.log("Received response from Flask:", responseData);

        // extract json reponse into format, store to firebase
        await savePayRequestData(responseData);

        res.status(200).send("Data processed successfully");
    } catch (error) {
        console.error("Error in /aimodel:", error);
        res.status(500).send("Error processing request");
    }
});

app.post("/khqr", async (req, res) => {

    try {
        await handler(req, res);
    } catch (error) {
        console.error("Error in /khqr:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/khqrstatus", async(req, res) => {
    console.log(req.body);
    const md5 = req.body.md5;
    if (!md5) {
        return res.status(400).json({ error: "md5 is required" });
    }
    try {
        await handler(req, res);
    } catch (error) {
        console.error("Error in /khqrstatus:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// console.log(process.env.BOT_TOKEN); // Check if BOT_TOKEN is loaded correctly

// Set webhook for Telegram after deployment
const setWebhook = async () => {
    try {
        const response = await axios.post(
            `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, { url: WEBHOOK_URL }
        );
        console.log('Webhook set successfully:', response.data);
    } catch (error) {
        console.error('Error setting webhook:', error.response ? error.response.data : error.message);
    }
};

setWebhook();


// Export the app for Vercel's serverless function
module.exports = app;
module.exports.handler = serverless(app);
