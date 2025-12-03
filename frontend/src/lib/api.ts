import axios from 'axios';

// =====================
// BASE URL
// =====================
const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  console.error(
    '[ERROR] VITE_API_URL no está definida. Se está usando http://localhost:4000 como fallback.'
  );
}

export const api = axios.create({
  baseURL: API_BASE ?? 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// =====================
// REQUEST interceptor
// =====================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// =====================
// RESPONSE interceptor
// =====================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('accessToken');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);
