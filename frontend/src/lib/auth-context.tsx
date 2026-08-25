'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  logout: () => void;
}

const MOCK_USERS: Record<UserRole, User> = {
  student: {
    id: 'usr_student_01',
    name: 'Yashwanth (Student)',
    email: 'yashwanth@researchmate.ai',
    role: 'student',
    department: 'Computer Science & Engineering',
    institution: 'Research University',
    createdAt: '2026-01-15',
  },
  researcher: {
    id: 'usr_researcher_01',
    name: 'Dr. Steve (AI Researcher)',
    email: 'steveisaiah09@gmail.com',
    role: 'researcher',
    department: 'AI & Data Science Institute',
    institution: 'Research University',
    createdAt: '2025-11-01',
  },
  professor: {
    id: 'usr_professor_01',
    name: 'Prof. Vishal (Faculty Advisor)',
    email: 'vishal.prof@researchmate.ai',
    role: 'professor',
    department: 'School of Advanced Computing',
    institution: 'Research University',
    createdAt: '2025-08-10',
  },
  admin: {
    id: 'usr_admin_01',
    name: 'System Admin',
    email: 'admin@researchmate.ai',
    role: 'admin',
    department: 'Platform Operations',
    institution: 'ResearchMate Core',
    createdAt: '2025-05-01',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(MOCK_USERS.researcher);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate auth token check on initial mount
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const switchRole = (newRole: UserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      setUser(MOCK_USERS[newRole]);
      setIsLoading(false);
    }, 250);
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
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
