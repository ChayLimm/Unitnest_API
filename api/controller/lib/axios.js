// require('dotenv').config({ path: '/../.env' });
require('dotenv').config();
const axios = require("axios"); // Fixed 'rquire' typo

const BOT_TOKEN = process.env.BOT_TOKEN;
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
