// require('dotenv').config({ path: '/../.env' });
require('dotenv').config();
const express = require("express");
const axios = require("axios");
const serverless = require("serverless-http");

const { handler } = require("./controller/handler");

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = 'https://unitnest-api.vercel.app/telegram';

const app = express();
app.use(express.json());

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

app.post("/khqr", async (req, res) => {
    console.log(req.body);
    const amount = req.body.amount;

    if (!amount) {
        return res.status(400).json({ error: "Amount is required" });
    }
    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount provided, must be higher than 0" });
    }

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
console.log(process.env.BOT_TOKEN); // Check if BOT_TOKEN is loaded correctly


// Export the app for Vercel's serverless function
module.exports = app;
module.exports.handler = serverless(app);
