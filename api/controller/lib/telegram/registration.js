const fs = require("fs"); 
const Joi = require("joi");

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
        if (fs.existsSync(tenantsFilePath)) {
            const data = fs.readFileSync(tenantsFilePath, 'utf-8');
            tenants = data ? JSON.parse(data) : [];
        }
        tenants.push(newTenant);
        fs.writeFileSync(tenantsFilePath, JSON.stringify(tenants, null, 2));
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

            // Clear registration data from memory
            delete registrationSteps[chatId];

            return sendMessage(messageObj, userInfo, [payButton, ruleButton]);

        default:
            return sendMessage(messageObj, "Sorry, I don't understand.");
    }
}

module.exports = { registrationFlow };