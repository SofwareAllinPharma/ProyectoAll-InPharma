
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE?.toString() || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_BASE,
});

// Añadir interceptor para inyectar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Fetch genérico para endpoints que no quieras usar con axios
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