import axios from 'axios';

// 1) Leemos la env que inyecta Vite en build (si existe)
const rawEnv = import.meta.env.VITE_API_URL as string | undefined;
let API_BASE = rawEnv?.trim();

// 2) Si no hay env, resolvemos según el hostname
if (!API_BASE) {
  const host = window.location.hostname;

  if (host === 'allinpharma.farmaceuticosasociados.com') {
    // PROD real
    API_BASE = 'https://api.allinpharma.farmaceuticosasociados.com';
  } else if (host.endsWith('nip.io')) {
    // Tu entorno de pruebas anterior en Dokploy
    API_BASE = 'https://backend.212-85-0-49.nip.io';
  } else {
    // Local dev
    API_BASE = 'http://localhost:4000';
  }

  console.warn('[WARN] VITE_API_URL no definida en build, usando API_BASE por hostname:', API_BASE);
} else {
  console.log('[INFO] VITE_API_URL desde build:', API_BASE);
}

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de REQUEST: inyectar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de RESPONSE: manejar 401 globalmente
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

// Helper para fetch “legacy” si lo usan en algún lado
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
  if (res.status !== 204 && res.headers.get('content-length') !== '0') {
    try {
      data = await res.json();
    } catch {
      // body vacío o no es JSON
    }
  }

  const hasError = (obj: unknown): obj is { error?: string; message?: string } =>
    typeof obj === 'object' && obj !== null && ('error' in obj || 'message' in obj);

  if (!res.ok || (hasError(data) && data.error)) {
    const msg = (hasError(data) && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return (data ?? {}) as T;
}
