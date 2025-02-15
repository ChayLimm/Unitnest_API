const { axiosInstance } = require("../axios");
const fs = require("fs"); 
const Joi = require("joi");

const payButton =  [{ text: "Pay Now", callback_data: "pay" }];
const ruleButton = [{text: "Rules", callback_data: "rule"}];
const registerButton = [{ text: "Register", callback_data: "register" }];
const yesButton = [{text: "Yes", callback_data: "yes"}];
const noButton = [{text: "No", callback_data: "no"}];

const registrationSteps = {}; // track user registration steps
const paymentRequestSteps = {}; // track users expecting payment images

function clearSteps(chatId) {
    if (registrationSteps[chatId]) {
        delete registrationSteps[chatId];
    }
    if (paymentRequestSteps[chatId]) {
        delete paymentRequestSteps[chatId];
    }
}


function sendMessage(messageObj,messageText,button = null, photo = null){
    var messageObj1;
    if(messageObj.callback_query){
        messsageObj1 = messageObj.message
    }else {
        messageObj1 = messageObj;
    }

    if(button != null){
        console.log("sending message with button")
        return axiosInstance.get("sendMessage",{
            chat_id : messageObj.chat.id,
            text: messageText,
            reply_markup: JSON.stringify({
                inline_keyboard: button,
              }),       
        })
    }else if (photo != null){
        console.log("Sending message photo")
        return axiosInstance.get("sendPhoto",{
            chat_id: messageObj.chat.id,
            photo: photo,   // fild id / url of photo => array of photo
            caption: messageText,
        })
    }else{
        console.log("sending message without button")
        return axiosInstance.get("sendMessage",{
            chat_id : messageObj.chat.id,
            text: messageText,
        });
               
 }}

async function handleCallbackQuery(callback_query) {
    const msgObj = callback_query.message;
    const data = callback_query.data;

    switch (data) {
        case "pay":
            paymentRequestSteps[msgObj.chat.id] = { step: 1, chat_id: msgObj.chat.id}
            return sendMessage(msgObj, `Please upload photos for request payment:\n- Water Meter\n- Electricity Meter`);
        
        case "rule":
            const ruleMessage = `កំណត់សម្គាល់.\n\n1. រាល់ការបង់ប្រាក់យឺតលើសពី 5 ថ្ងៃនៃថ្ងៃកំណត់ (ថ្ងៃទី 1 ដើមខែ) នឹងត្រូវពិន័យមួយថ្ងៃ 3 ដុល្លារ។\n2. ត្រូវបង់ប្រាក់បន្ទប់,ទឹក,ភ្លើងរាល់ថ្ងៃដើមខែដោយភ្ជាប់មកជាមួយបង្កាន់ដៃមួយសន្លឹក។\n3. ត្រូវធ្វើការផ្លាស់ប្ដូរសម្ភារៈក្នុងបន្ទប់ដែលខូចក្នុងអំឡុងពេលស្នាក់នៅដោយខ្លួនឯង។\n4. ត្រូវជូនដំណឹងដល់ម្ចាស់បន្ទប់យ៉ាងតិចណាស់ 15 ថ្ងៃមុននឹងបញ្ឈប់ការជួលនិងសម្អាតបន្ទប់ឲ្យបានស្អាតមុននឹងចាកចេញបើមិនដូច្នេះទេម្ចាស់បន្ទប់មានសិទ្ធិកាត់ប្រាក់កក់ចំនួន 20 ដុល្លាររបស់លោកអ្នក។\n5. ត្រូវគោរពបទបញ្ជាផ្ទៃក្នុងរបស់បន្ទប់ជួល។`;
            return sendMessage(msgObj, ruleMessage, [payButton, ruleButton]);

        case "register":
            registrationSteps[msgObj.chat.id] = { step: 1, chat_id: msgObj.chat.id };
            return sendMessage(msgObj, "Enter your full name:\nExample: John Doe");

        default:
            return sendMessage(msgObj, "I don't understand this action.");
    }
}

// handle income messages
async function handleMessage(messageObj) {
    const chatId = messageObj.chat.id;
    const messageText = messageObj.text || " ";
    const messagePhoto = messageObj.photo;

    console.log(messageObj);

    try {
        // Handle Commands
        if (messageText.charAt(0) === "/") {
            const command = messageText.substr(1);
            handleCommands(messageObj, command);
            clearSteps(chatId); // clear on going step, start again!
        }

        // Handle Registration Steps
        if (registrationSteps[chatId]) {
            return registrationFlow(messageObj);
        }

        // Handle upload photo for payment
        if(paymentRequestSteps[chatId]){
            return handlePhotoRequest(messageObj);
        }
        
        // handle error when tenant send photo without click btn (inline keyboard) 'pay now' 
        if (!paymentRequestSteps[chatId] && messagePhoto) {
            return sendMessage(messageObj, "Please click the 'Pay Now' button before sending the photos to request payment!\n\nType /start ");
        }

        // handle error if tenant just msg text without click any action like button inline or command
        // if (messageText && !paymentRequestSteps[chatId] && !registrationSteps[chatId]) {
        //     sendMessage(messageObj, "Sorry, I don't understand this action.")
        // }
        
    } catch (error) {
        console.error("Error Message: ",error.message);
    }
}

// handle bot commands
async function handleCommands(messageObj, command) {
    switch (command) {
        case "start":
            clearSteps(messageObj.chat.id);

            const isRegistered = checkTenantsRegistered(messageObj.chat.id);
            if (isRegistered) {
                return sendMessage(
                    messageObj,
                    `Hello ${messageObj.from.username}, I am UnitNest Bot. What can I help you with today?`,
                    [payButton, ruleButton]
                );
            } else {
                return sendMessage(
                    messageObj,
                    `Hello ${messageObj.from.username}, I am UnitNest Bot. Please register to continue.`,
                    [registerButton]
                );
            }
        case "help":
            return sendMessage(messageObj, 'Help Info'); // testing command
        default:
            return sendMessage(messageObj, "Sorry, I do not understand.");
    }
}

async function registrationFlow(messageObj) {
    const chatId = messageObj.chat.id;
    const msgText = messageObj.text;
    const step = registrationSteps[chatId].step;

    switch (step) {
        case 1:
            // Validate name
            const { error: nameErr, value: validName } = Joi.object({ name: registrationSchema.extract("name") }).validate({ name: msgText });
            if (nameErr) return sendMessage(messageObj, "Invalid Name, pls re-enter:\nExample: Jonh Doe");
            
            registrationSteps[chatId].name = validName.name; // Store cleaned-up name
            registrationSteps[chatId].step = 2;
            return sendMessage(messageObj, "Enter your phone number:\nExample: 012345678");

        case 2:
            // Validate phone number
            const { error: phoneErr, value: validPhone } = Joi.object({ phone: registrationSchema.extract("phone")}).validate({ phone: msgText });
            if (phoneErr) return sendMessage(messageObj, "Invalid Phone number, pls re-enter:\nExample: 012345678");

            // Store valid phone number
            registrationSteps[chatId].phone = validPhone.phone;
            registrationSteps[chatId].step = 3;
            return sendMessage(messageObj, "Enter your ID Identification number:\nExample: 1234567890");

        case 3:
            // Validate ID card number
            const { error: idIdentifyErr, value: validIdentify } = Joi.object({ idIdentification: registrationSchema.extract("idIdentification")}).validate({ idIdentification: msgText });
            if (idIdentifyErr) return sendMessage(messageObj, "Invalid ID Identification number, pls re-enter:\nExample: 1234567890");

            // Store valid ID card number
            registrationSteps[chatId].id_Identification = validIdentify.idIdentification;
            registrationSteps[chatId].registration_date = new Date().toLocaleDateString();
            
            // Print user info after registration is successful
            const userInfo = `Here is the information you provided:\nName: ${registrationSteps[chatId].name}\nPhone: ${registrationSteps[chatId].phone}\nID Card: ${registrationSteps[chatId].id_Identification}\nRegistration Successful!`;

            // Save the tenant data to file
            const tenant = {
                chatId: chatId,
                name: registrationSteps[chatId].name,
                phone: registrationSteps[chatId].phone,
                idIdentification: registrationSteps[chatId].id_Identification,
                registeredOn: registrationSteps[chatId].registration_date,
            };

            // Save tenant data to file
            saveTenantsRegistration(tenant);

            clearSteps(chatId);

            return sendMessage(messageObj, userInfo, [payButton, ruleButton]);

        default:
            return sendMessage(messageObj, "Sorry, I don't understand.");
    }
}

// Handle photo (image) messages
async function handlePhotoRequest(msgObj) {
    const chatId = msgObj.chat.id;
    const photo = msgObj.photo;

    if (photo && Array.isArray(photo)) {
        const fileId = photo[photo.length - 1].file_id;
        try {
            const fileDetails = await axiosInstance.get("getFile", {file_id: fileId});
            if (fileDetails && fileDetails.data) {
                const fileData = fileDetails.data.result;

                const photoData = {
                    chatId: chatId,
                    fileId: fileId,
                    fileSize: fileData.file_size,
                    filePath: fileData.file_path,
                    fileUrl: `https://api.telegram.org/file/bot${Token}/${fileData.file_path}`,
                    caption: msgObj.caption || '', 
                    receivedAt: new Date().toLocaleDateString(),
                }
                console.log("Received photo data:", JSON.stringify(photoData, null, 2));

            }else{
                console.log("Failed to retrive your photo");
            }
        } catch (error) {
            console.error("Error Message: ", error.message);
        }
    }

}

function formatValidName(value, helpers) {
    let validName = value
                .trim()
                .replace(/\s+/g, " ") // Replace multiple spaces with a single space
                .replace(/\b\w/g, (char) => char.toUpperCase()); 

        if (!validName) return helpers.error("any.invalid");

        // regex pattern to allow full names with spaces
        const namePattern = /^[a-zA-Z\u00C0-\u00FF' ]+$/;
        if (!namePattern.test(validName)) return helpers.error("any.invalid");

        // Remove unnecessary words from the name
        const nameIndicators = ["name", "is", "my", "i'm", "am", "called", "call", "full", "first", "last", "middle"];
        let nameParts = validName.split(/\s+/).map(part => part.replace(/'s$/, ""));
        let filteredName = nameParts.filter(part => !nameIndicators.includes(part.toLowerCase())).join(" ");

        if (!filteredName.trim()) return helpers.error("any.invalid");

    return filteredName; 
}

const registrationSchema = Joi.object({
    name: Joi.string()
        .trim()
        .max(30)
        .custom(formatValidName)
        .required()
        .messages({
            "any.invalid": "Name must contain only letters and spaces.",
        }),

    phone: Joi.string()
        .trim()
        .pattern(/^\d{9,15}$/)
        .required()
        .messages({
            "string.pattern.base": "Phone number must be a digits number.",
        }),
    
    idIdentification: Joi.string()
        .trim()
        .pattern(/^\d{9,15}$/)
        .required()
        .messages({
            "string.pattern.base": "ID card number must be a digits number.",
        }),

});

function checkTenantsRegistered(chat_id) {
    try {
        const data = fs.readFileSync(tenantsFilePath, 'utf-8');
        const tenants = JSON.parse(data); // Get arrays data (object)
        for (let i = 0; i < tenants.length; i++) {
            if (tenants[i].chatId === chat_id) {
                return true;
            }
        }
    } catch (err) {
        console.error('Error reading file:', err);
        return false;
    }
}

function saveTenantsRegistration(newTenant) {
    try {
        let tenants = [];
        if (fs.existsSync('tenants.json')) {
            const data = fs.readFileSync('tenants.json', 'utf-8');
            tenants = data ? JSON.parse(data) : [];
        }
        tenants.push(newTenant);
        fs.writeFileSync('tenants.json', JSON.stringify(tenants, null, 2));
        console.log('Tenant registration saved successfully.');
    } catch (err) {
        console.error('Error saving tenant registration:', err);
    }
}

module.exports= {handleMessage, handleCallbackQuery};


            // return sendMessage(
            //     messageObj,
            //     "Please waiting for landlord to approve your registration.",
            //     []
            // );