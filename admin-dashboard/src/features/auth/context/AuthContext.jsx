import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, setAccessToken } from '../../../shared/api/apiClient';
import { useToast } from '@eventify/ui';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  sendOtp: async () => {},
  verifyOtp: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const isSuperAdmin = (userData) => {
    const roles = userData?.roles || [];
    return roles.includes('SUPER_ADMIN');
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await apiClient.get('/auth/me');
        if (res.data?.user) {
          const u = res.data.user;
          if (isSuperAdmin(u)) {
            setUser(u);
          } else {
            setUser(null);
          }
        }
      } catch (err) {
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
      toast.success(res.message || 'Super Admin verification code dispatched.');
      return res;
    } catch (err) {
      toast.error(err.message || 'Failed to dispatch verification code.');
      throw err;
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const res = await apiClient.post('/auth/otp/verify', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      const userData = res.data?.user;

      // Strict Gate: Only SUPER_ADMIN allowed
      if (!isSuperAdmin(userData)) {
        await apiClient.post('/auth/logout', {}).catch(() => {});
        setAccessToken(null);
        setUser(null);
        toast.error('Access Denied: Super Admin privileges required.');
        throw new Error('Access Denied: Super Admin role required.');
      }

      if (res.data?.accessToken) {
        setAccessToken(res.data.accessToken);
      }
      setUser(userData);

      toast.success(`Platform Controller unlocked. Welcome, ${userData.name}!`);
      return userData;
    } catch (err) {
      if (!err.message.includes('Access Denied')) {
        toast.error(err.message || 'Verification failed. Please check the code.');
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (err) {
    } finally {
      setAccessToken(null);
      setUser(null);
      toast.info('Super Admin console locked. Session terminated.');
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
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
