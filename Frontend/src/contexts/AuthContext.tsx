import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, Usuario } from '../services/auth.service';

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  loading: boolean;
  isImpersonating: boolean;
  login: (email: string, senha: string) => Promise<void>;
  impersonate: (userId: string) => Promise<void>;
  returnToAdmin: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) {
      setToken(stored);
      setIsImpersonating(Boolean(localStorage.getItem('admin_session')));
      authService
        .me()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, senha: string) => {
    const res = await authService.login(email, senha);
    localStorage.removeItem('admin_session');
    localStorage.setItem('token', res.access_token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
    setIsImpersonating(false);
  };

  const impersonate = async (userId: string) => {
    if (!user || !token || user.perfil !== 'admin') return;

    localStorage.setItem('admin_session', JSON.stringify({ token, user }));
    const res = await authService.impersonate(userId);
    localStorage.setItem('token', res.access_token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
    setIsImpersonating(true);
  };

  const returnToAdmin = () => {
    const raw = localStorage.getItem('admin_session');
    if (!raw) return;
    try {
      const session = JSON.parse(raw) as { token: string; user: Usuario };
      localStorage.setItem('token', session.token);
      localStorage.setItem('user', JSON.stringify(session.user));
      setToken(session.token);
      setUser(session.user);
      setIsImpersonating(false);
      localStorage.removeItem('admin_session');
    } catch {
      localStorage.removeItem('admin_session');
      setIsImpersonating(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('admin_session');
    setToken(null);
    setUser(null);
    setIsImpersonating(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, isImpersonating, login, impersonate, returnToAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
