const express = require("express");
const axios = require("axios"); 
const PORT = process.env.PORT || 4040;
const { handler } = require("./controller");

const BOT_TOKEN = '7906784409:AAFXwfLXl49tMyS0ZdqMliTGmO2p-R174_U';
const WEBHOOK_URL = 'https://3c49-103-16-61-182.ngrok-free.app/telegram';

const app = express();
app.use(express.json());

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

// check the payment status tha pay or nv
app.post("/khqrstatus", async(req,res)=>{
    console.log(req.body);
    const md5 = req.body.md5;
    if (!md5) {
        return res.status(400).json({ error: "md5 is required" }); 
    }
    try {
        await handler(req, res);
    } catch (error) {
        console.error("Error in /khqr:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }

})




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
