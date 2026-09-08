import React, { useState } from 'react';
import {
  Logo,
  ThemeToggle,
  FormField,
  FormInput,
  ActionButton,
  OtpInput,
  CountdownTimer,
} from '@eventify/ui';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Building2, ShieldCheck, Mail } from 'lucide-react';

export const OrganizerLoginPage = ({ onSwitchToInvite }) => {
  const { sendOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid work email.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await sendOtp(email);
      setStep('OTP');
      setOtp('');
    } catch (err) {
      setError(err.message || 'Failed to dispatch verification code.');
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
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 relative transition-colors">
      {/* Top Bar with Theme Toggle */}
      <div className="absolute top-6 right-8 flex items-center gap-3">
        <ThemeToggle />
      </div>

      {/* Main Card with Geometric Side Shadow */}
      <div className="w-full max-w-md card-side-shadow rounded-2xl p-8 sm:p-10 space-y-7">
        <div className="flex flex-col items-center text-center space-y-2">
          <Logo portal="organizer" size="lg" />
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white pt-2">
            Organizer Portal Login
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs">
            Enter your organizer or staff work email to receive a passwordless access code.
          </p>
        </div>

        {step === 'EMAIL' ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <FormField
              label="Work Email Address"
              required
              error={error}
              hint="Requires an active organization membership or owner account."
            >
              <FormInput
                type="email"
                placeholder="organizer@company.com"
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
              className="w-full h-11 text-sm font-semibold"
            >
              Send Access Code
            </ActionButton>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="text-center space-y-1">
              <button
                type="button"
                onClick={() => setStep('EMAIL')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 mb-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change email
              </button>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Code sent to <strong className="text-slate-900 dark:text-white">{email}</strong>
              </p>
            </div>

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
              {error && <p className="text-xs text-rose-500 text-center font-medium mt-2.5">{error}</p>}
            </div>

            <ActionButton
              variant="primary"
              size="lg"
              type="submit"
              disabled={otp.length !== 6 || isLoading}
              isLoading={isLoading}
              className="w-full h-11 text-sm font-semibold"
            >
              Verify & Enter Dashboard
            </ActionButton>

            <div className="text-center pt-1">
              <CountdownTimer
                seconds={60}
                onResend={handleSendOtp}
                isLoading={isLoading}
              />
            </div>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-400 dark:text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Role-Gated SaaS ERP</span>
          </div>
          {onSwitchToInvite && (
            <button
              onClick={onSwitchToInvite}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              Have an invite?
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
