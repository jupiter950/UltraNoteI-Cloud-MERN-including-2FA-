import axios from "axios";
import { toast } from 'react-toastify';


export const clientHttp = axios.create({
  baseURL: process.env.NODE_ENV === 'production'? 'https://cloud.ultranote.org/api': 'https://localhost:3600/api',
  timeout: 60000,
});

clientHttp.interceptors.request.use(
  (config) => {
    if (
      localStorage.getItem("user") &&
      localStorage.getItem("token")
    ) {
      const token = localStorage.getItem("token");
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

clientHttp.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error && error.response.data && error.response.data.message) {
      toast.error(error.response.data.message);
    }
    
  }
);