// src/lib/api.ts
import axios from 'axios';

// 1) Leemos lo que venga del build de Vite
const envApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();

/**
 * Resuelve la base URL de la API de forma robusta.
 * - Prioriza VITE_API_URL
 * - Si no está, intenta inferir a partir del dominio actual
 * - Último fallback: http://localhost:4000 (dev)
 */
function resolveApiBase(): string {
  // a) Si viene desde Vite, usamos eso
  if (envApiUrl) {
    return envApiUrl;
  }

  // b) Si no vino, intentamos deducirla en runtime
  if (typeof window !== 'undefined') {
    const { protocol, host } = window.location;

    // Caso Dokploy: frontend.212-85-0-49.nip.io → backend.212-85-0-49.nip.io
    if (host.startsWith('frontend.')) {
      const rest = host.replace('frontend.', ''); // "212-85-0-49.nip.io"
      return `${protocol}//backend.${rest}`;
    }

    // Caso local dev: Vite en 5173, backend en 4000
    if (host.startsWith('localhost')) {
      return 'http://localhost:4000';
    }
  }

  // c) Último fallback
  console.warn(
    '[WARN] No se pudo resolver VITE_API_URL ni inferir host, usando http://localhost:4000 como fallback.'
  );
  return 'http://localhost:4000';
}

const API_BASE = resolveApiBase();
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

// Interceptor de RESPONSE: Manejar 401 globalmente
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

// Fetch genérico para endpoints legacy
export async function apiFetch<T = unknown>(
  path: string,
  init?: RequestInit
): Promise<T> {
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
    typeof obj === 'object' &&
    obj !== null &&
    ('error' in obj || 'message' in obj);

  if (!res.ok || (hasError(data) && data.error)) {
    const msg =
      (hasError(data) && (data.error || data.message)) ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return (data ?? {}) as T;
}
