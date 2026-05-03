import axios from 'axios';

let backendUrl = import.meta.env.VITE_API_URL;

if (!backendUrl) {
  backendUrl = import.meta.env.PROD
    ? 'https://task-backend-gkwi.onrender.com'
    : 'http://localhost:10000';
}

// Ensure we don't duplicate /api if the user already included it in VITE_API_URL
const baseURL = backendUrl.endsWith('/api') ? backendUrl : `${backendUrl}/api`;

const API = axios.create({
  baseURL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;