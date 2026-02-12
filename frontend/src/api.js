//(axios)interceptors - intercept the requests  will auto add correct headers 


import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
export default api;

//instead of raw axios we can now use api which we just customized nowww
