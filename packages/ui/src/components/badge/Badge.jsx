import React from 'react';
import { cn } from '../../utils/cn';

const badgeVariants = {
  primary: 'bg-brand-50 text-brand-700 border-brand-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger:  'bg-rose-50 text-rose-700 border-rose-200',
};

export const Badge = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
