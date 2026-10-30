import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, setStoredToken, removeStoredToken, getStoredToken } from '../api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; phone?: string; role?: string }) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: 'customer' | 'admin' | 'delivery_agent') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (getStoredToken()) {
        const res = await api.getCurrentUser();
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      removeStoredToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
    await refreshUser();
  };

  const register = async (payload: { name: string; email: string; password: string; phone?: string; role?: string }) => {
    const res = await api.register(payload);
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
    await refreshUser();
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
  };

  // Demo helper to log into predefined roles with authentic hashed credentials
  const switchDemoRole = async (role: 'customer' | 'admin' | 'delivery_agent') => {
    setIsLoading(true);
    try {
      if (role === 'admin') {
        await login('admin@cravecart.com', 'Admin@123');
      } else if (role === 'delivery_agent') {
        await login('vikram@cravecart.com', 'Agent@123');
      } else {
        // Customer 1: Aarav Sharma (has > 5 orders in September 2026, 20% loyalty)
        await login('aarav@example.com', 'Customer@123');
      }
    } catch (err: any) {
      console.error('Demo role switch error:', err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
