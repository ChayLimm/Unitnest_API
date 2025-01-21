const axios = require("axios"); // Fixed 'rquire' typo

const BOT_TOKEN = "7906784409:AAHfQi0SYgnp1AInLHRYzdrtFHS7nyzP4M4";
const Base_URL = `https://api.telegram.org/bot${BOT_TOKEN}`; 

function getAxiosInstance() { 
    return {
        get(method, params) {
            return axios.get(`/${method}`, { 
                baseURL: Base_URL,
                params,
            });
        },
        post(method, data) { 
            return axios({
                method: "post",
                baseURL: Base_URL,
                url: `/${method}`, 
                data,
            });
        }
    };
}

module.exports = { axiosInstance: getAxiosInstance() };
