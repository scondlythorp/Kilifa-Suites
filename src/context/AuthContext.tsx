import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setStoredToken, removeStoredToken, getStoredToken } from '../services/apiClient';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'RECEPTIONIST' | 'STAFF' | 'GUEST';
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  register: (data: { name: string; email: string; username?: string; password: string; role?: string }) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string>;
  resetPassword: (token: string, newPassword: string) => Promise<string>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      const stored = getStoredToken();
      if (!stored) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.auth.me();
        if (res?.data) {
          setUser(res.data);
          setTokenState(stored);
        } else {
          throw new Error('Invalid session response');
        }
      } catch (err) {
        // Fail closed: clear invalid/expired token and unauthenticate immediately
        removeStoredToken();
        try {
          localStorage.removeItem('kilifa_active_user');
        } catch {}
        setUser(null);
        setTokenState(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (identifier: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ identifier, password: pass });
      if (res?.token && res?.user) {
        setStoredToken(res.token);
        setTokenState(res.token);
        setUser(res.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; username?: string; password: string; role?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(data);
      if (res?.token && res?.user) {
        setStoredToken(res.token);
        setTokenState(res.token);
        setUser(res.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string): Promise<string> => {
    const res = await api.auth.requestPasswordReset(email);
    return res.message || 'If an account exists, reset instructions have been dispatched.';
  };

  const resetPassword = async (tokenStr: string, newPass: string): Promise<string> => {
    const res = await api.auth.resetPassword(tokenStr, newPass);
    return res.message || 'Password has been updated successfully.';
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore network failure on logout
    } finally {
      removeStoredToken();
      try {
        localStorage.removeItem('kilifa_active_user');
      } catch {}
      setTokenState(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        requestPasswordReset,
        resetPassword,
        logout,
        isAuthenticated: Boolean(user && token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
