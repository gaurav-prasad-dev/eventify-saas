import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, setAccessToken } from '../../../shared/api/apiClient';
import { useToast } from '@eventify/ui';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  sendOtp: async () => {},
  verifyOtp: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // On mount: Restore session silently via HTTP-only cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await apiClient.get('/auth/me');
        if (res.data?.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        // No active session or cookie expired
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const sendOtp = async (email) => {
    try {
      const res = await apiClient.post('/auth/otp/send', {
        email: email.trim().toLowerCase(),
        purpose: 'LOGIN',
      });
      toast.success(res.message || 'Verification code sent to your email.');
      return res;
    } catch (err) {
      toast.error(err.message || 'Failed to send verification code.');
      throw err;
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const res = await apiClient.post('/auth/otp/verify', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      if (res.data?.accessToken) {
        setAccessToken(res.data.accessToken);
      }
      if (res.data?.user) {
        setUser(res.data.user);
      }

      toast.success(`Welcome to Eventify, ${res.data?.user?.name || 'Customer'}!`);
      return res.data?.user;
    } catch (err) {
      toast.error(err.message || 'Invalid or expired verification code.');
      throw err;
    }
  };

  const loginWithGoogle = async (idToken) => {
    try {
      const res = await apiClient.post('/auth/google', { idToken });
      if (res.data?.accessToken) {
        setAccessToken(res.data.accessToken);
      }
      if (res.data?.user) {
        setUser(res.data.user);
      }
      toast.success(`Welcome back, ${res.data?.user?.name || 'Customer'}!`);
      return res.data?.user;
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed.');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (err) {
      // Ignore logout API failures
    } finally {
      setAccessToken(null);
      setUser(null);
      toast.info('You have been logged out successfully.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        sendOtp,
        verifyOtp,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
