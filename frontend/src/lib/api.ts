import axios from 'axios';
import { getErrorMessage } from '@/lib/errors';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
    if (typeof window !== 'undefined') {
      const status = error.response?.status;
      const isNetwork = error.code === 'ERR_NETWORK' || !error.response;
      const isServerError = status != null && status >= 500;
      if (isNetwork || isServerError) {
        toast.error(getErrorMessage(error, 'Request failed. Please try again.'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
