'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { apiClient, LoginPayload, RegisterPayload } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  switchRole: (role: UserRole) => Promise<void>;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to format backend user to frontend User type
  const formatUser = (rawUser: any): User => ({
    id: rawUser.id,
    name: rawUser.name,
    email: rawUser.email,
    role: (rawUser.role?.toLowerCase() as UserRole) || 'student',
    department: rawUser.department || undefined,
    institution: rawUser.institution || undefined,
    createdAt: rawUser.created_at || new Date().toISOString(),
  });

  // Restore authenticated session from localStorage on startup
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = typeof window !== 'undefined' ? localStorage.getItem('researchmate_token') : null;
        const savedUserStr = typeof window !== 'undefined' ? localStorage.getItem('researchmate_user') : null;

        if (savedToken) {
          setToken(savedToken);
          if (savedUserStr) {
            try {
              setUser(formatUser(JSON.parse(savedUserStr)));
            } catch (_) {}
          }
          // Validate token with backend /auth/me
          try {
            const me = await apiClient.getMe(savedToken);
            if (me) {
              const formatted = formatUser(me);
              setUser(formatted);
              localStorage.setItem('researchmate_user', JSON.stringify(formatted));
            }
          } catch (err) {
            // Token expired or invalid
            localStorage.removeItem('researchmate_token');
            localStorage.removeItem('researchmate_user');
            setUser(null);
            setToken(null);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const authRes = await apiClient.login(credentials);
      const formatted = formatUser(authRes.user);
      setToken(authRes.access_token);
      setUser(formatted);
      return formatted;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<User> => {
    setIsLoading(true);
    try {
      await apiClient.register(payload);
      // Auto login immediately after registration
      const authRes = await apiClient.login({ email: payload.email, password: payload.password });
      const formatted = formatUser(authRes.user);
      setToken(authRes.access_token);
      setUser(formatted);
      return formatted;
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (newRole: UserRole): Promise<void> => {
    if (!user) return;
    try {
      const updated = await apiClient.updateMe({ role: newRole });
      if (updated) {
        const formatted = formatUser(updated);
        setUser(formatted);
        localStorage.setItem('researchmate_user', JSON.stringify(formatted));
      }
    } catch (_) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      localStorage.setItem('researchmate_user', JSON.stringify(updated));
    }
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const logout = () => {
    apiClient.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        switchRole,
        hasRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
