import React, { createContext, useState, useContext, useEffect } from 'react';
import { getToken, saveToken, removeToken } from '../utils/tokenHelper';
import { authService } from '../api/authApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth on refresh
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getToken();

    if (token) {
      try {
        const response = await authService.getMe();
        setUser(response.user);
      } catch (error) {
        console.error('Auth check failed:', error);
        removeToken();
      }
    }

    setLoading(false);
  };

  // FIXED LOGIN (IMPORTANT)
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);

      console.log("LOGIN RESPONSE:", response);

      if (response.success) {
        saveToken(response.token);
        setUser(response.user);
      }

      // backend response direct return
      return response;

    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLeader: user?.role === 'leader',
    isEmployee: user?.role === 'employee'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
