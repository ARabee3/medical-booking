/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { User, RegisterRequest } from '@/types/global';
import { login as mockLogin, register as mockRegister } from '@/lib/mockApi';
import { queryClient } from '@/lib/queryClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser, access, refresh } = await mockLogin({ email, password });
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      setUser(loggedInUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (request: RegisterRequest) => {
    setIsLoading(true);
    try {
      const { user: newUser, access, refresh } = await mockRegister(request);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    queryClient.clear();
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (role: string) => {
      return user?.role === role;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
