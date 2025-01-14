const { axiosInstance } = require("../axios");

function handleRequestBakong(amount) {
    const {
        BakongKHQR,
        khqrData,
        IndividualInfo,
    } = require("bakong-khqr");

    const optionalData = {
        currency: khqrData.currency.usd,
        amount: amount,
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
        "chaylim_cheng@aclb",
        "Cheng ChayLim",
        "PHNOM PENH",
        optionalData
    );

    const KHQR = new BakongKHQR();

    try {
        const individual = KHQR.generateIndividual(individualInfo);
        console.log("QR: " + individual.data.qr);
        console.log("MD5: " + individual.data.md5);
           //generatet the qr
        const QRCode = require('qrcode');
        const fs = require('fs');
        
        const qrString = individual.data.qr;
        
        // Generate and save the QR code as a PNG image
        QRCode.toFile('qrCode.png', qrString, {
        color: {
            dark: '#000000',  // Black color
            light: '#ffffff'  // White background
        }
        }, function (err) {
        if (err) throw err;
        console.log('QR Code has been generated and saved as qrCode.png!');
        });
    } catch (error) {
        console.error("Error generating QR:", error);
    }
 

}

module.exports = { handleRequestBakong };
