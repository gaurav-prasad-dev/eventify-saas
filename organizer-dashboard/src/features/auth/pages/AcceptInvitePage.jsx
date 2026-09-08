import React, { useState } from 'react';
import {
  Logo,
  ThemeToggle,
  FormField,
  FormInput,
  ActionButton,
  OtpInput,
} from '@eventify/ui';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, ArrowLeft } from 'lucide-react';

export const AcceptInvitePage = ({ onBackToLogin }) => {
  const { verifyStaffInvite } = useAuth();
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('token') || '';
    }
    return '';
  });
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!token) {
      setError('Invitation token is required.');
      return;
    }
    if (!name || name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (otp.length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await verifyStaffInvite({ invitationToken: token, name, otp });
    } catch (err) {
      setError(err.message || 'Invitation verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 relative transition-colors">
      <div className="absolute top-6 right-8 flex items-center gap-3">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md card-side-shadow rounded-2xl p-8 sm:p-10 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Logo portal="organizer" size="lg" />
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white pt-2">
            Accept Staff Invitation
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs">
            Join your event organization workspace and activate your staff permissions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Invitation Token" required error={!token && error ? 'Token is required' : ''}>
            <FormInput
              placeholder="Paste invitation token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={isLoading}
            />
          </FormField>

          <FormField label="Your Full Name" required>
            <FormInput
              placeholder="e.g. Sarah Jenkins"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </FormField>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
              6-Digit Verification Code <span className="text-rose-500">*</span>
            </label>
            <OtpInput
              value={otp}
              onChange={(val) => {
                setOtp(val);
                if (error) setError('');
              }}
              disabled={isLoading}
              error={!!error}
            />
          </div>

          {error && <p className="text-xs text-rose-500 text-center font-medium mt-2">{error}</p>}

          <ActionButton
            variant="primary"
            size="lg"
            type="submit"
            disabled={otp.length !== 6 || isLoading}
            isLoading={isLoading}
            className="w-full h-11 text-sm font-semibold"
          >
            Activate Staff Account
          </ActionButton>
        </form>

        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 text-center">
          <button
            type="button"
            onClick={onBackToLogin}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Organizer Login
          </button>
        </div>
      </div>
    </div>
  );
};
