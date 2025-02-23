const { axiosInstance } = require("../axios");
const axios = require('axios');


function handleRequestBakong(body, res) {
    body.amount = Number(body.amount); // Ensure it's a number

    if (!body.amount || isNaN(body.amount) || body.amount <= 0) {
        return res.status(400).json({ error: "Invalid amount provided, must be greater than 0" });
    }

    const {
        BakongKHQR,
        khqrData,
        IndividualInfo,
    } = require("bakong-khqr");

    const optionalData = {
        currency: khqrData.currency.usd,
        amount: body.amount, // ✅ Use the correct amount
        mobileNumber: "85585382962",
        storeLabel: "Coffee Shop",
        terminalLabel: "Cashier_1",
        purposeOfTransaction: "oversea",
        languagePreference: "km",
        merchantNameAlternateLanguage: "CHENG CHAYLIM",
        merchantCityAlternateLanguage: "PHNOM PENH",
        upiMerchantAccount: "011355318"
    };

    const individualInfo = new IndividualInfo(
        body.bakongID,  // ✅ Use correct field name
        body.username,  
        body.location,
        optionalData
    );

    const KHQR = new BakongKHQR();

    try {
        const individual = KHQR.generateIndividual(individualInfo);
        console.log("QR: " + individual.data.qr);
        console.log("MD5: " + individual.data.md5);

        const decodeValue = BakongKHQR.decode(individual.data.qr);

        res.json({ 
            Decode : decodeValue,
            QR: individual.data.qr,
            MD5: individual.data.md5 
        });

        const QRCode = require('qrcode');

        QRCode.toFile('qrCode.png', individual.data.qr, {
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        }, function (err) {
            if (err) throw err;
            console.log('QR Code has been generated and saved as qrCode.png!');
        });

    } catch (error) {
        console.error("Error generating QR:", error);
        res.status(500).json({ error: "Failed to generate QR code" });
    }
}

async function handleKHQRstatus(md5,res) {
    const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiYzAwMmM4ZTQ3ZGQ5NGZkNyJ9LCJpYXQiOjE3MzcyNTgwMjIsImV4cCI6MTc0NTAzNDAyMn0.gq6xv6in7gKXgpG033rv1_iBO8z8HkcheTD-Ayppd_o";
    const url = "https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5";
    try {
        const response = await axios({
            method: "post",  
            url: url, 
            headers: {
              "Authorization": `Bearer ${TOKEN}`, 
              "Content-Type": "application/json", 
            },
            data:{
                md5: md5,  
              },
            
          });
        console.log("res successfully");
        res.json({data: response.data})
      } catch (error) {

        if (error.response) {
            res.status(error.response.status).json({ Error: error.response.data });
        } else if (error.request) {
            res.status(500).json({ Error: "No response received from the server." });
        } else {
            res.status(500).json({ Error: error.message });
        }
    }
}


module.exports = { handleRequestBakong,handleKHQRstatus };
