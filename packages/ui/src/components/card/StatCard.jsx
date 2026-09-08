import React from 'react';
import { cn } from '../../utils/cn';

export const StatCard = ({
  title,
  value,
  subtitle = null,
  change = null,
  isPositive = true,
  icon = null,
  className = '',
}) => {
  return (
    <div className={cn('card-side-shadow p-6 rounded-2xl', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{title}</span>
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 [&>svg]:w-4.5 [&>svg]:h-4.5">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2.5">
        <span className="text-2xl font-black text-slate-900 dark:text-white stat-number tracking-tight">
          {value}
        </span>
        {change && (
          <span
            className={cn(
              'text-xs font-bold px-2 py-0.5 rounded-full border',
              isPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
            )}
          >
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-400 dark:text-zinc-500">{subtitle}</p>
      )}
    </div>
  );
};
