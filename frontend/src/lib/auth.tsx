import React, { createContext, useContext, useEffect, useState } from 'react';
import { api }  from './api';
import { apiFetch } from './api';
// --- Centralización de llamadas forgot/reset ---
export type OkResponse = { ok: true };

// eslint-disable-next-line react-refresh/only-export-components
export const authApi = {
  forgotPassword: (mail: string) =>
    apiFetch<OkResponse>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ mail }),
    }),

  resetPassword: (mail: string, token: string, newPassword: string) =>
    apiFetch<OkResponse>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ mail, token, newPassword }),
    }),
};

type User = {
  mail: string | null;
  name: string | null;
  roles: string[];
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (mail: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // Si hay token en localStorage, inicializamos loading en true para evitar
  // que RequireAuth redirija antes de que fetchMe termine en un refresh.
  const [loading, setLoading] = useState<boolean>(() => !!localStorage.getItem('accessToken'));

  useEffect(() => {
    // intentar recuperar usuario al iniciar si hay token
    if (localStorage.getItem('accessToken')) {
      fetchMe().catch((err) => {
        // Si el token es inválido o expiró, backend típicamente devuelve 401
        const status = (err as any)?.response?.status;
        if (status === 401) {
          localStorage.removeItem('accessToken');
          setUser(null);
        } else {
          // No forzamos logout automático por otros errores de red
          console.error('fetchMe failed (non-401):', err);
        }
      });
    }
    
  }, []);

  async function fetchMe() {
    setLoading(true);
    try {
      const resp = await api.get('/auth/me');
      setUser(resp.data.user ?? null);
    } finally {
      setLoading(false);
    }
  }

  async function login(mail: string, password: string) {
    setLoading(true);
    try {
      const resp = await api.post('/auth/login', { mail, password });
      const token = resp.data?.accessToken as string | undefined;
      if (!token) throw new Error('No se recibió token');
      localStorage.setItem('accessToken', token);
      await fetchMe();
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch {
      // ignorar
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

export default AuthContext;
