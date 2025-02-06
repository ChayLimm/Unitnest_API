const { axiosInstance } = require("../axios");
const fs = require("fs"); 
const Joi = require("joi");

const payButton =  [{ text: "Pay Now", callback_data: "pay" }];
const ruleButton = [{text: "Rules", callback_data: "rule"}];
const registerButton = [{ text: "Register", callback_data: "register" }];
const yesButton = [{text: "Yes", callback_data: "yes"}];
const noButton = [{text: "No", callback_data: "no"}];

const registrationSteps = {}; // memory to track user registration steps

function sendMessage(messageObj,messageText,button = null){
    var messsageObj1;
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
            // return sendMessage(msgObj, "You clicked the 'Pay Now' button!");
            return sendMessage(msgObj, "Please send image of Water meter and Electricity meter usage of this month")
        
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

function handleMessage(messageObj){
    const chatId = messageObj.chat.id;
    const messageText = messageObj.text || " ";

    console.log(messageObj);

    // Handle Commands
    if(messageText.charAt(0) == "/"){
        const command = messageText.substr(1);
        switch (command) {
            case "start":
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
                return sendMessage(messageObj, 'Help Info');
            default:
                return sendMessage(messageObj, "Sorry, I do not understand.");
        }
    }

    // Handle Registration Steps-Flow
    if (registrationSteps[chatId]) {
        return registrationFlow(messageObj);
    }

    // Handle Image Processing for payment
    
}

function formatValidName(value, helpers) {
    let validName = value
                .trim()
                .replace(/\s+/g, " ") // Replace multiple spaces with a single space
                .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word

        // Handle empty name
        if (!validName) return helpers.error("any.invalid");

        // Corrected regex pattern to allow full names with spaces
        const namePattern = /^[a-zA-Z\u00C0-\u00FF' ]+$/;
        if (!namePattern.test(validName)) return helpers.error("any.invalid");

        // Remove unnecessary words from the name
        const nameIndicators = ["name", "is", "my", "i'm", "am", "called", "call", "full", "first", "last", "middle"];
        let nameParts = validName.split(/\s+/).map(part => part.replace(/'s$/, ""));
        let filteredName = nameParts.filter(part => !nameIndicators.includes(part.toLowerCase())).join(" ");

        // Ensure filteredName is still valid
        if (!filteredName.trim()) return helpers.error("any.invalid");

    return filteredName;  // Return the correctly validated name
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
        const data = fs.readFileSync('./tenants.json', 'utf-8');
        const tenants = JSON.parse(data); // Get arrays data (object)
        for (let i = 0; i < tenants.length; i++) {
            if (tenants[i].chatId === chat_id) {
                return true;
            }
        }
        return false;
    } catch (err) {
        console.error('Error reading file:', err);
        return false;
    }
}

function saveTenantsRegistration(newTenant) {
    try {
        // Check if the file exists, if not, create it with an empty array
        let tenants = [];
        if (fs.existsSync('./tenants.json')) {
            const data = fs.readFileSync('./tenants.json', 'utf-8');
            tenants = JSON.parse(data);
        }
        tenants.push(newTenant);
        fs.writeFileSync('./tenants.json', JSON.stringify(tenants, null, 2));
        console.log('Tenant registration saved successfully.');
    } catch (err) {
        console.error('Error saving tenant registration:', err);
    }
}

async function registrationFlow(messageObj) {
    const chatId = messageObj.chat.id;
    const msgText = messageObj.text;
    const step = registrationSteps[chatId].step;

    switch (step) {
        case 1:
            // Validate name
            const { error: nameErr, value: validName } = Joi.object({ name: registrationSchema.extract("name") })
            .validate({ name: msgText });
        
            if (nameErr) return sendMessage(messageObj, "Invalid Name, pls re-enter:\nExample: Jonh Doe");
            
            registrationSteps[chatId].name = validName.name; // Store cleaned-up name
            registrationSteps[chatId].step = 2;
            return sendMessage(messageObj, "Enter your phone number:\nExample: 012345678");

        case 2:
            // Validate phone number
            const { error: phoneErr, value: validPhone } = Joi.object({ phone: registrationSchema.extract("phone")}).validate({ phone: msgText });
            if (phoneErr) return sendMessage(messageObj, "Invalid Phone number, pls re-enter:\nExample: 012345678");

            // registrationSteps[chatId].phone = msgText;
            registrationSteps[chatId].phone = validPhone.phone;
            registrationSteps[chatId].step = 3;
            return sendMessage(messageObj, "Enter your ID Identification number:\nExample: 1234567890");

        case 3:
            // Validate ID card number
            const { error: idIdentifyErr, value: validIdentify } = Joi.object({ idIdentification: registrationSchema.extract("idIdentification")}).validate({ idIdentification: msgText });
            if (idIdentifyErr) return sendMessage(messageObj, "Invalid ID Identify number, pls re-enter:\nExample: 1234567890");

            // registrationSteps[chatId].id_Identification = msgText;
            registrationSteps[chatId].id_Identification = validIdentify.idIdentification;
            registrationSteps[chatId].registration_date = new Date().toLocaleDateString()
            
            // print user info after register
            const userInfo = `
                Here is the information you provided:
                Name: ${registrationSteps[chatId].name}
                Phone: ${registrationSteps[chatId].phone}
                ID Card: ${registrationSteps[chatId].id_Identification}
                Registration Successful!
            `;

            // Save the data after all steps are complete
            const tenant = {
                chatId: chatId,
                name: registrationSteps[chatId].name,
                phone: registrationSteps[chatId].phone,
                idIdentification: registrationSteps[chatId].id_Identification,
                registeredOn: registrationSteps[chatId].registration_date,
            };

            // Save tenant data to file
            saveTenantsRegistration(tenant);

            delete registrationSteps[chatId]; // Clear data from memory

            return sendMessage(
                messageObj,
                userInfo,
                [payButton, ruleButton]
            );

            // return sendMessage(
            //     messageObj,
            //     "Please waiting for landlord to approve your registration.",
            //     []
            // );

        default:
            return sendMessage(messageObj, "Sorry, I don't understand.");
    }
}

module.exports= {handleMessage, handleCallbackQuery};