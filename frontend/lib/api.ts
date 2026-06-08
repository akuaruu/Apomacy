import axios from 'axios';
import Cookies from 'js-cookie';

// Buat instance axios dengan konfigurasi default
const api = axios.create({
  baseURL: '/api', // Menyesuaikan base URL backend
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Otomatis lampirkan token Authorization jika tersedia
api.interceptors.request.use((config) => {
  const token = Cookies.get("apomacy_token"); // ← sesuai handleLogin
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("apomacy_token"); // ← konsisten
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
