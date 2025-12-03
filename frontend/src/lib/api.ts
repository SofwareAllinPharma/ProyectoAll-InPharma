import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

if (!import.meta.env.VITE_API_URL) {
  console.warn(
    '[WARN] No se pudo resolver VITE_API_URL en el build; usando http://localhost:4000 como fallback'
  );
}
console.log('[API] baseURL usada por frontend:', API_BASE);

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de REQUEST: Inyectar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de RESPONSE…
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
