import axios from 'axios';
import { isTokenExpired, clearAuthData } from './auth';

const instance = axios.create({
  baseURL: 'http://localhost:3001'
});

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken');
    
    if (token) {
      if (isTokenExpired(token)) {
        clearAuthData();
        window.location.href = '/';
        return Promise.reject('Token expired');
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthData();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default instance; 