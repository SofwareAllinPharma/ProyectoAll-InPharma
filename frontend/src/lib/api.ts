// src/lib/api.ts
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export function getToken() {
  return localStorage.getItem('token');
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

// ── util: tomar mensaje de error de forma typesafe ────────────────────────────
function pickErrorMessage(data: unknown): string {
  if (typeof data === 'object' && data !== null) {
    const rec = data as Record<string, unknown>;
    if (typeof rec.error === 'string') return rec.error;
    if (typeof rec.message === 'string') return rec.message;
  }
  return 'Request failed';
}

// Uso: apiFetch<TRespuesta>(...)
export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  // Intentamos parsear JSON, pero mantenemos el tipo como `unknown`
  let data: unknown = undefined;
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    try { data = await res.json(); } catch { /* ignore parse errors */ }
  }

  if (!res.ok) {
    if (res.status === 401) setToken(null); // token inválido/expirado
    throw new Error(pickErrorMessage(data));
  }

  // Si no hubo body, devolvemos {} como T para evitar undefined en usos comunes
  return (data as T) ?? ({} as T);
}
