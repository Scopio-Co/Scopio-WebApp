//(axios)interceptors - intercept the requests  will auto add correct headers 


import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

const api = axios.create({
    baseURL: "http://localhost:8000/api",
});

export default api;
