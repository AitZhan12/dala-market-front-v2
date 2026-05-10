import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'dalamart_auth';

function loadStored(): { user: User | null; token: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { user: null, token: null };
  } catch {
    return { user: null, token: null };
  }
}

// Маппинг ответа бэкенда → User
function mapAuthResponse(data: Record<string, unknown>): User {
  return {
    id: data.userId as number,
    name: (data.name as string) || '',
    email: (data.email as string) || undefined,
    telegramUsername: (data.telegramUsername as string) || undefined,
    role: data.role as User['role'],
    complexId: (data.complexId as number) || undefined,
    complexName: (data.complexName as string) || undefined,
    verified: Boolean(data.isPhoneVerified),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = loadStored();
  const [user, setUser] = useState<User | null>(stored.user);
  const [token, setToken] = useState<string | null>(stored.token);
  const [isLoading, setIsLoading] = useState(!!stored.token);

  // При наличии токена подтягиваем актуальный профиль с бэка
  useEffect(() => {
    if (!stored.token) return;
    authApi.getMe()
      .then(data => {
        const updated: User = {
          id: data.id,
          name: [data.firstName, data.lastName].filter(Boolean).join(' ') || data.firstName || '',
          email: data.email,
          telegramUsername: data.telegramUsername,
          role: stored.user?.role ?? 'USER',
          complexId: data.residentialComplexId,
          complexName: data.residentialComplexName,
          verified: Boolean(data.isPhoneVerified),
        };
        setUser(updated);
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const s = JSON.parse(raw);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...s, user: updated }));
        }
      })
      .catch(() => {
        // токен протух — чистим
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []); // eslint-disable-line

  function persist(u: User, t: string) {
    setUser(u);
    setToken(t);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u, token: t }));
  }

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    persist(mapAuthResponse(data), data.token);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await authApi.register(name, email, password);
    persist(mapAuthResponse(data), data.token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...s, user: updated }));
      }
      return updated;
    });
  }, []);

  const refreshMe = useCallback(async () => {
    const data = await authApi.getMe();
    const updated: User = {
      id: data.id,
      name: [data.firstName, data.lastName].filter(Boolean).join(' ') || '',
      email: data.email,
      role: user?.role ?? 'USER',
      complexId: data.residentialComplexId,
      complexName: data.residentialComplexName,
      verified: Boolean(data.isPhoneVerified),
    };
    updateUser(updated);
  }, [user, updateUser]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
