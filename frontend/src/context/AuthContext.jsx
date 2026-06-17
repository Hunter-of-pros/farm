import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('farm_token'));
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authCallback, setAuthCallback] = useState(null);

  // Fetch current user details on mount/token change
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          handleLogout();
        }
      } catch (err) {
        console.error('Failed to verify token with auth server:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const triggerLogin = (callback = null) => {
    setAuthCallback(() => callback);
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('farm_token');
    setToken(null);
    setUser(null);
  };

  const sendOtp = async (username, email) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send verification code.');
    return data;
  };

  const verifyOtp = async (username, email, otp, name, password, role) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, otp, name, password, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed.');
    
    if (data.success) {
      localStorage.setItem('farm_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthModalOpen(false);
      
      if (authCallback) {
        authCallback(data.user);
        setAuthCallback(null);
      }
    }
    return data;
  };

  const login = async (username, password) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed.');
    
    if (data.success) {
      localStorage.setItem('farm_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthModalOpen(false);
      
      if (authCallback) {
        authCallback(data.user);
        setAuthCallback(null);
      }
    }
    return data;
  };

  const forgotPassword = async (identity) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to request password reset code.');
    return data;
  };

  const resetPassword = async (email, otp, newPassword) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Password reset failed.');
    return data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthModalOpen,
      setIsAuthModalOpen,
      triggerLogin,
      logout: handleLogout,
      sendOtp,
      verifyOtp,
      login,
      forgotPassword,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
