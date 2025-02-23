const fs = require("fs"); 
const Joi = require("joi");
const { sendMessage } = require("./messages");
const { payButton, ruleButton } = require("./buttons");

const registrationSteps = {}; // track user registration steps

async function checkTenantsRegistered(chat_id) {
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
        const data = fs.readFileSync('./tenants.json', 'utf-8');
        const tenants = JSON.parse(data);
        tenants.push(newTenant);
        fs.writeFileSync('./tenants.json', JSON.stringify(tenants, null, 2));
    } catch (err) {
        console.error('Error reading file:', err);
    }
}

function formatValidName(value, helpers) {
    let validName = value
                .trim()
                .replace(/\s+/g, " ") // Replace multiple spaces with a single space
                .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word

    if (!validName) return helpers.error("any.invalid");

    // Corrected regex pattern to allow full names with spaces
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
        .pattern(/^\+?\d{9,15}$/) // Allows an optional '+' followed by 9-15 digits
        .required()
        .messages({
            "string.pattern.base": "Phone number must be a 9/10 digits number.",
        }),
    
    idIdentification: Joi.string()
        .trim()
        .pattern(/^\d{10,12}$/)
        .required()
        .messages({
            "string.pattern.base": "ID card number must be a 10/12 digits number.",
        }),

});

async function handleRegistration(messageObj) {
    const chatId = messageObj.chat.id;
    const msgText = messageObj.text;
    const step = registrationSteps[chatId]?.step;

    // check step, initailized step of registration to keep tack
    if (!registrationSteps[chatId]) {
            registrationSteps[chatId] = { 
                step: 1, 
                chat_id: messageObj.chat.id 
            };
            return sendMessage(messageObj, "Enter your full name:\nExample: John Doe");
    }

    // flow of register following steps
    switch (step) {
        case 1:
            // Validate name
            const { error: nameErr, value: validName } = Joi.object({ name: registrationSchema.extract("name") })
            .validate({ name: msgText });
            if (nameErr) return sendMessage(messageObj, "Invalid Name, pls re-enter:\nExample: Jonh Doe");
            
            registrationSteps[chatId].name = validName.name; // Store cleaned-up name
            registrationSteps[chatId].step = 2;
            return sendMessage(messageObj, "Enter your phone number:\nExample: 012345678 or +85512345678");

        case 2:
            // Validate phone number
            const { error: phoneErr, value: validPhone } = Joi.object({ phone: registrationSchema.extract("phone")}).validate({ phone: msgText });
            if (phoneErr) return sendMessage(messageObj, "Invalid Phone number, pls re-enter:\nExample: 012345678 or +85512345678");

            registrationSteps[chatId].phone = validPhone.phone;
            registrationSteps[chatId].step = 3;
            return sendMessage(messageObj, "Enter your ID Identification number:\nExample: 1234567890");

        case 3:
            // Validate ID card number
            const { error: idIdentifyErr, value: validIdentify } = Joi.object({ idIdentification: registrationSchema.extract("idIdentification")}).validate({ idIdentification: msgText });
            if (idIdentifyErr) return sendMessage(messageObj, "Invalid ID Identify number, pls re-enter:\nExample: 1234567890");
            
            registrationSteps[chatId].id_Identification = validIdentify.idIdentification;
            registrationSteps[chatId].registration_date = new Date().toLocaleDateString()

            // Prepare the data into JSON forma after all steps are complete
            const tenant = {
                chatId: chatId,
                name: registrationSteps[chatId].name,
                phone: registrationSteps[chatId].phone,
                idIdentification: registrationSteps[chatId].id_Identification,
                registeredOn: registrationSteps[chatId].registration_date,
            };

            console.log("Received Registration data:", JSON.stringify(tenant, null, 2));

            // Save tenant data to file
            // saveTenantsRegistration(tenant);
            delete registrationSteps[chatId]; // Registration complete

            return sendMessage(
                messageObj,
                "Welcome! Your registration is successful.Here are the options that u can proceed with.",
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

module.exports = { 
    checkTenantsRegistered, 
    saveTenantsRegistration,
    registrationSteps,
    handleRegistration
 };

