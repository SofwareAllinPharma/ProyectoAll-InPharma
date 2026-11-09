import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from './api';
import { selectAssignedProfile, type ProfileAssignment, type RoleCode } from '../utils/roles';

export interface User {
  mail: string;
  name: string | null;
  roles: RoleCode[];
  perfiles: ProfileAssignment[];
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

  const logout = useCallback(() => {
    setUser(null);
    for (const key of ['accessToken', 'userMail', 'userPerfil', 'activeRole']) localStorage.removeItem(key);
  }, []);

  const applySession = useCallback((current: User) => {
    if (!current.mail || !Array.isArray(current.perfiles)) throw new Error('No se pudo obtener el perfil de la sesión. Iniciá sesión nuevamente.');
    setUser(current);
    localStorage.setItem('userMail', current.mail);
    const profile = selectAssignedProfile(current.perfiles, localStorage.getItem('activeRole'));
    if (profile) localStorage.setItem('userPerfil', String(profile.idPerfil));
    else localStorage.removeItem('userPerfil');
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!localStorage.getItem('accessToken')) { setLoading(false); return; }
    api.get<{ user: User }>('/auth/me')
      .then(({ data }) => { if (!cancelled) applySession(data.user); })
      .catch(() => { if (!cancelled) logout(); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [applySession, logout]);

  const login = async (mail: string, password: string) => {
    setLoading(true);
    logout();
    try {
      const { data } = await api.post<{ accessToken: string }>('/auth/login', { mail, password });
      localStorage.setItem('accessToken', data.accessToken);
      const meRes = await api.get<{ user: User }>('/auth/me');
      applySession(meRes.data.user);
    } catch (error) {
      logout();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const roles = user?.roles ?? [];
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdminSis: roles.includes('ADMINSIS'), isAdminFab: roles.includes('ADMINFAB'), isTecnico: roles.includes('TECNICO') }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- El contexto comparte su hook de acceso.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Export authApi for compatibility with existing code
// eslint-disable-next-line react-refresh/only-export-components -- API de recuperación conservada para los formularios existentes.
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