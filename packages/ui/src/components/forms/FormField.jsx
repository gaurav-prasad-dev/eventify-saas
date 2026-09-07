import React from 'react';
import { cn } from '../../utils/cn';

export const FormField = ({
  label,
  required = false,
  error = null,
  hint = null,
  children,
  className = '',
}) => {
  return (
    <div className={cn('space-y-1 w-full', className)}>
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
          {label}
          {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-[11px] text-rose-600 font-medium">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
};
