
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  console.error(
    '[ERROR] VITE_API_URL no está definida. Revise Environment en Dokploy o su archivo .env'
  );
}

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

// Interceptor de RESPONSE: Manejar 401 globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el backend dice 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Evitar loop infinito si el error viene de /auth/login
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('accessToken');
        window.location.href = '/auth/login'; // Redirigir a login
      }
    }
    return Promise.reject(error);
  }
);

// Fetch genérico para endpoints que no quieras usar con axios (Legacy support)
export async function apiFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers ? (init.headers as Record<string, string>) : {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...init,
  });

  let data: unknown = null;
  try { 
    data = await res.json(); 
  } catch (err) {
    console.error('Failed to parse JSON:', err);
  }

  const hasError = (obj: unknown): obj is { error?: string; message?: string } =>
    typeof obj === 'object' && obj !== null && ('error' in obj || 'message' in obj);

  if (!res.ok || (hasError(data) && data.error)) {
    const msg = hasError(data) && (data.error || data.message) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return (data ?? {}) as T;
}