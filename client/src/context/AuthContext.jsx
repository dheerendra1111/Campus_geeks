import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user has an active session on initial app load
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (data.success && data.data) {
          setUser(data.data);
        }
      } catch (err) {
        // Unauthenticated - expected when no cookie/session exists
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success && data.data) {
        setUser(data.data);
        return data.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Register handler
  const register = async (userData) => {
    setError(null);
    try {
      const { data } = await api.post('/auth/register', userData);
      if (data.success && data.data) {
        setUser(data.data);
        return data.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err.message);
    } finally {
      setUser(null);
    }
  };

  // Update profile handler
  const updateProfile = async (updatedData) => {
    setError(null);
    try {
      const { data } = await api.put('/auth/profile', updatedData);
      if (data.success && data.data) {
        setUser(data.data);
        return data.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        setError,
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
