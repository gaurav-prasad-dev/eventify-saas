import React, { useState, useEffect } from 'react';

export const CountdownTimer = ({
  seconds = 60,
  onResend,
  isLoading = false,
}) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  if (timeLeft > 0) {
    return (
      <span className="text-xs text-slate-500 dark:text-zinc-400">
        Resend code in <strong className="font-mono text-emerald-600 dark:text-emerald-400">{timeLeft}s</strong>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onResend}
      disabled={isLoading}
      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline focus:outline-none disabled:opacity-50"
    >
      {isLoading ? 'Sending...' : 'Resend verification code'}
    </button>
  );
};
