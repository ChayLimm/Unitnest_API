
const payButton = [{
    text: "Pay Now", 
    callback_data: "pay" 
}];
const ruleButton = { 
    text: "📜 Rules", 
    callback_data: "rule"
};
const registerButton = { 
    text: "Register", 
    callback_data: "register" 
};
const contactButton = { 
    text: "🔵 Contact Us", 
    callback_data: "contact" 
};
const helpButton = {
    text: " Help",
    callback_data: "help"
}
const yesButton = {
    text: "Yes", 
    callback_data: "yes" 
};
const noButton = { 
    text: "No", 
    callback_data: "no" 
};


module.exports = { 
    payButton, 
    ruleButton, 
    registerButton, 
    contactButton,
    helpButton,
    yesButton, 
    noButton 
};