import React, { useState } from 'react';
import {
  AuthModal,
  Logo,
  FormField,
  FormInput,
  ActionButton,
  OtpInput,
  GoogleButton,
  CountdownTimer,
} from '@eventify/ui';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';

export const MarketplaceAuthModal = ({ isOpen, onClose }) => {
  const { sendOtp, verifyOtp, loginWithGoogle } = useAuth();
  const [step, setStep] = useState('EMAIL'); // 'EMAIL' | 'OTP'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await sendOtp(email);
      setStep('OTP');
      setOtp('');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await verifyOtp(email, otp);
      onClose();
      setStep('EMAIL');
      setEmail('');
      setOtp('');
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // 1. If Google Client ID is configured, use official Google Identity Services
    if (googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (response.credential) {
              await loginWithGoogle(response.credential);
              onClose();
            }
          },
        });
        window.google.accounts.id.prompt();
        setIsLoading(false);
        return;
      } catch (err) {
        console.warn('Google One-Tap prompt error:', err);
      }
    }

    // 2. Local development fallback: test Google account login
    try {
      const devEmail = email.trim() || 'google.customer@gmail.com';
      await loginWithGoogle(`dev_google_${devEmail}`);
      onClose();
    } catch (err) {
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await sendOtp(email);
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthModal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        {/* Branding */}
        <div className="flex justify-center">
          <Logo portal="marketplace" />
        </div>

        {step === 'EMAIL' ? (
          <>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Welcome to Eventify
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Sign in to book tickets, manage reservations, and get instant QR passes.
              </p>
            </div>

            {/* Google OAuth Option */}
            <div className="space-y-3">
              <GoogleButton
                onClick={handleGoogleSignIn}
                isLoading={isLoading}
                text="Continue with Google"
              />

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 dark:border-zinc-800 w-full" />
                <span className="bg-white dark:bg-zinc-900 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 absolute">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email OTP Form */}
            <form onSubmit={handleSendOtp} className="space-y-4">
              <FormField
                label="Email Address"
                required
                error={error}
                hint="We will email you a one-time login code."
              >
                <FormInput
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  disabled={isLoading}
                  autoFocus
                />
              </FormField>

              <ActionButton
                variant="primary"
                size="lg"
                type="submit"
                isLoading={isLoading}
                className="w-full h-11"
              >
                Send Verification Code
              </ActionButton>
            </form>
          </>
        ) : (
          <>
            <div className="text-center space-y-1">
              <button
                onClick={() => setStep('EMAIL')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 mb-2 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change email
              </button>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Enter Verification Code
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                We sent a 6-digit code to{' '}
                <strong className="text-slate-900 dark:text-white font-medium">{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="py-2">
                <OtpInput
                  value={otp}
                  onChange={(val) => {
                    setOtp(val);
                    if (error) setError('');
                  }}
                  disabled={isLoading}
                  error={!!error}
                />
                {error && <p className="text-xs text-rose-500 text-center font-medium mt-2">{error}</p>}
              </div>

              <ActionButton
                variant="primary"
                size="lg"
                type="submit"
                disabled={otp.length !== 6 || isLoading}
                isLoading={isLoading}
                className="w-full h-11"
              >
                Verify & Sign In
              </ActionButton>

              <div className="text-center pt-1">
                <CountdownTimer
                  seconds={60}
                  onResend={handleResend}
                  isLoading={isLoading}
                />
              </div>
            </form>
          </>
        )}

        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Passwordless & Secured by Eventify Guard</span>
        </div>
      </div>
    </AuthModal>
  );
};
