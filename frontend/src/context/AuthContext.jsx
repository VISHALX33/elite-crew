import React, { createContext, useContext, useState, useEffect } from 'react';

import api from '../utils/api.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const firebaseAuth = async (idToken, userData = null) => {
    const res = await api.post('/users/firebase-auth', { idToken, userData });
    const { user, token } = res.data;
    setUser(user);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    return res.data;
  };

  const login = async (email, password) => {
    const res = await api.post('/users/login', { email, password });
    const { user, token } = res.data;
    setUser(user);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/users/register', userData);
    // Important: Do not set user/token immediately since they need to verify OTP
    return res.data;
  };

  const verifyEmailOtp = async (email, otp) => {
    const res = await api.post('/users/verify-email', { email, otp });
    const { user, token } = res.data;
    setUser(user);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    return res.data;
  };

  const resendOtp = async (email) => {
    const res = await api.post('/users/resend-otp', { email });
    return res.data;
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/users/profile');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  // Custom setUser that updates both state and localStorage
  const setUserAndPersist = (userObj) => {
    setUser(userObj);
    if (userObj) {
      localStorage.setItem('user', JSON.stringify(userObj));
    } else {
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, token, logout, loading, 
      setUser: setUserAndPersist, refreshUser,
      firebaseAuth, login, register, verifyEmailOtp, resendOtp
    }}>
      {children}
    </AuthContext.Provider>
  );
};
