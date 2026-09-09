import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, setAccessToken, setActiveOrgId } from '../../../shared/api/apiClient';
import { useToast } from '@eventify/ui';

const ORGANIZER_ALLOWED_ROLES = [
  'ORGANIZER_OWNER',
  'ORGANIZER_ADMIN',
  'EVENT_MANAGER',
  'TICKET_VERIFIER',
  'SUPER_ADMIN',
];

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  activeOrganization: null,
  sendOtp: async () => {},
  verifyOtp: async () => {},
  verifyStaffInvite: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeOrganization, setActiveOrganization] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const checkUserRoles = (userData) => {
    const roles = userData.roles || [];
    const hasOrgRole = roles.some((r) => ORGANIZER_ALLOWED_ROLES.includes(r));
    return hasOrgRole;
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await apiClient.get('/auth/me');
        if (res.data?.user) {
          const u = res.data.user;
          if (checkUserRoles(u)) {
            setUser(u);
            const firstOrg = u.memberships?.[0]?.organization;
            if (firstOrg) {
              setActiveOrganization(firstOrg);
              setActiveOrgId(firstOrg.id);
            }
          } else {
            setUser(null);
            setActiveOrganization(null);
            setActiveOrgId(null);
          }
        }
      } catch (err) {
        setUser(null);
        setActiveOrganization(null);
        setActiveOrgId(null);
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

      // Role Gatekeeper: Check if user has organizer permissions
      if (!checkUserRoles(userData)) {
        await apiClient.post('/auth/logout', {}).catch(() => {});
        setAccessToken(null);
        setUser(null);
        setActiveOrganization(null);
        setActiveOrgId(null);
        toast.error('Access Denied: You do not have staff or organizer permissions for any organization.');
        throw new Error('Access Denied: Organizer permissions required.');
      }

      if (res.data?.accessToken) {
        setAccessToken(res.data.accessToken);
      }
      setUser(userData);

      const firstOrg = userData.memberships?.[0]?.organization;
      if (firstOrg) {
        setActiveOrganization(firstOrg);
        setActiveOrgId(firstOrg.id);
      }

      toast.success(`Welcome back, ${userData.name}!`);
      return userData;
    } catch (err) {
      if (!err.message.includes('Access Denied')) {
        toast.error(err.message || 'Authentication failed. Please check the code.');
      }
      throw err;
    }
  };

  const verifyStaffInvite = async (token, name) => {
    try {
      const res = await apiClient.post('/auth/staff/invite/accept', {
        token,
        name,
      });

      if (res.data?.accessToken) {
        setAccessToken(res.data.accessToken);
      }
      const userData = res.data?.user;
      setUser(userData);

      const firstOrg = userData?.memberships?.[0]?.organization;
      if (firstOrg) {
        setActiveOrganization(firstOrg);
        setActiveOrgId(firstOrg.id);
      }

      toast.success('Staff invitation accepted! Welcome to the organization.');
      return userData;
    } catch (err) {
      toast.error(err.message || 'Failed to verify staff invitation.');
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
      setActiveOrganization(null);
      setActiveOrgId(null);
      toast.info('Logged out from Organizer ERP.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        activeOrganization,
        sendOtp,
        verifyOtp,
        verifyStaffInvite,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
