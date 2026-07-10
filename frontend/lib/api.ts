import axios from 'axios';

// Buat instance axios dengan konfigurasi default
const api = axios.create({
  baseURL: '/api', // Menyesuaikan base URL backend
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url || "");
    const isAuthenticationRequest =
      requestUrl.includes("/users/login") ||
      requestUrl.includes("/users/register") ||
      requestUrl.includes("/users/session");

    if (
      error.response?.status === 401 &&
      !isAuthenticationRequest
    ) {
      if (typeof window !== "undefined") window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
