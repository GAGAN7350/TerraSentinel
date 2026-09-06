import React, { createContext, useContext, useState } from 'react';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('terrasentinel_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('terrasentinel_token') || null;
  });

  const login = (email: string, role: UserRole = 'officer') => {
    const mockUser: User = {
      id: 'usr-demo-01',
      email,
      full_name: role === 'admin' ? 'System Administrator' : 'Field Officer (NER)',
      role,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const mockToken = 'demo-jwt-token-terrasentinel';
    setUser(mockUser);
    setToken(mockToken);
    localStorage.setItem('terrasentinel_user', JSON.stringify(mockUser));
    localStorage.setItem('terrasentinel_token', mockToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('terrasentinel_user');
    localStorage.removeItem('terrasentinel_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
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
