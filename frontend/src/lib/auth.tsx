import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from './api';
import type { RoleCode } from '../utils/roles';

interface User {
  mail: string;
  name: string | null;
  roles: RoleCode[]; 
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (mail: string, pass: string) => Promise<void>;
  logout: () => void;
  isAdminSis: boolean;
  isAdminFab: boolean;
  isTecnico: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app, verificamos si hay token y pedimos los datos del usuario (/auth/me)
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // api ya tiene el interceptor, así que envía el token solo
        const { data } = await api.get('/auth/me'); 
        setUser(data.user);
        // Mantener claves legacy en localStorage para compatibilidad
        try {
          if (data?.user?.mail) localStorage.setItem('userMail', data.user.mail);
          const roles: string[] = data?.user?.roles ?? [];
          // Mapear roles a id de perfil usados en el frontend (1=tecnico,2=adminfab,3=adminsis)
          let perfil = '2';
          if (roles.includes('TECNICO')) perfil = '1';
          else if (roles.includes('ADMINFAB')) perfil = '2';
          else if (roles.includes('ADMINSIS')) perfil = '3';
          localStorage.setItem('userPerfil', perfil);
        } catch (e) {
          // no crítico: seguir si falla el intento de persistir en localStorage
        }
      } catch (error) {
        console.error("Sesión expirada o inválida", error);
        logout(); // Si falla /me, borramos token local
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (mail: string, password: string) => {
    // 1. Petición de login
    const { data } = await api.post('/auth/login', { mail, password });
    
    // 2. IMPORTANTE: Guardar token con el MISMO nombre que espera api.ts
    localStorage.setItem('accessToken', data.accessToken);
    
    // 3. Setear usuario (el endpoint login suele devolver info básica, o llamamos a me)
    // Asumiendo que tu login devuelve { accessToken, user: { mail } }
    // Para tener roles, idealmente haríamos un fetch a /auth/me o el login debería devolver roles.
    // Por seguridad y consistencia, llamemos a /auth/me inmediatamente o usemos lo que devolvió login.
    
    // Opción rápida: Settear lo que viene y luego React hará el re-render.
    // Si tu backend login devuelve user sin roles, fuerza una llamada a /me:
    const meRes = await api.get('/auth/me');
    setUser(meRes.data.user);
    // Guardar en localStorage para compatibilidad con componentes que aún leen las claves
    try {
      if (meRes?.data?.user?.mail) localStorage.setItem('userMail', meRes.data.user.mail);
      const roles: string[] = meRes?.data?.user?.roles ?? [];
      let perfil = '2';
      if (roles.includes('TECNICO')) perfil = '1';
      else if (roles.includes('ADMINFAB')) perfil = '2';
      else if (roles.includes('ADMINSIS')) perfil = '3';
      localStorage.setItem('userPerfil', perfil);
    } catch (e) {
      // ignore
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    localStorage.removeItem('userMail');
    localStorage.removeItem('userPerfil');
    // Opcional: window.location.href = '/login';
  };

  // Helpers de roles
  const roles = user?.roles || [];
  // Asegúrate de mapear los strings que vienen del back a tus códigos
  const isAdminSis = roles.includes('ADMINSIS');
  const isAdminFab = roles.includes('ADMINFAB');
  const isTecnico = roles.includes('TECNICO');

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdminSis, isAdminFab, isTecnico }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Export authApi for compatibility with existing code
export const authApi = {
  forgotPassword: async (mail: string) => {
    const { data } = await api.post('/auth/forgot-password', { mail });
    return data;
  },
  resetPassword: async (mail: string, token: string, newPassword: string) => {
    const { data } = await api.post('/auth/reset-password', { mail, token, newPassword });
    return data;
  }
};