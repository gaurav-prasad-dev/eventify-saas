import React, { useRef, useEffect } from 'react';

export const OtpInput = ({
  value = '',
  onChange,
  length = 6,
  disabled = false,
  error = false,
}) => {
  const inputRefs = useRef([]);

  const digits = value.padEnd(length, ' ').slice(0, length).split('');

  const handleChange = (index, char) => {
    if (disabled) return;
    const digit = char.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit || ' ';
    const newValue = newDigits.join('').trimEnd();
    onChange(newValue);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (disabled) return;
    if (e.key === 'Backspace') {
      if (!digits[index] || digits[index] === ' ') {
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
          const newDigits = [...digits];
          newDigits[index - 1] = ' ';
          onChange(newDigits.join('').trimEnd());
        }
      } else {
        const newDigits = [...digits];
        newDigits[index] = ' ';
        onChange(newDigits.join('').trimEnd());
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    if (disabled) return;
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted) {
      onChange(pasted);
      const nextIndex = Math.min(pasted.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-between gap-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, idx) => {
        const val = digits[idx] === ' ' ? '' : digits[idx];
        return (
          <input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={val || ''}
            disabled={disabled}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className={`w-11 h-12 text-center text-lg font-bold font-mono rounded-lg border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-zinc-800 ${
              error
                ? 'border-rose-500 text-rose-600 bg-rose-50/50 dark:bg-rose-950/20 focus:ring-rose-500'
                : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-50 focus:border-emerald-500 focus:ring-emerald-500'
            }`}
          />
        );
      })}
    </div>
  );
};
