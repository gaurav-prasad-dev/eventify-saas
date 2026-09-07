import React from 'react';
import { cn } from '../../utils/cn';

export const EmptyState = ({
  icon = null,
  title,
  description = null,
  action = null,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center flex flex-col items-center justify-center',
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3 [&>svg]:w-6 [&>svg]:h-6">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-slate-500 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
