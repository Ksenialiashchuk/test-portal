import axios from 'axios';
import { message } from 'antd';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1337';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    const status = error.response?.status;
    const isNetwork = error.code === 'ERR_NETWORK' || !error.response;
    const isServerError = status != null && status >= 500;
    
    if (isNetwork || isServerError) {
      message.error('Request failed. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
