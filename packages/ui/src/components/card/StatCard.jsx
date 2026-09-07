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
    <div className={cn('bg-white p-5 rounded-xl border border-slate-200 shadow-sm', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{title}</span>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 [&>svg]:w-4 [&>svg]:h-4">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900 stat-number tracking-tight">
          {value}
        </span>
        {change && (
          <span
            className={cn(
              'text-xs font-semibold px-1.5 py-0.5 rounded',
              isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            )}
          >
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
      )}
    </div>
  );
};
