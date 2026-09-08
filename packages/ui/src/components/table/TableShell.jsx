import React from 'react';
import { cn } from '../../utils/cn';

export const TableShell = ({
  children,
  footer = null,
  className = '',
}) => {
  return (
    <div className={cn('card-side-shadow rounded-2xl overflow-hidden', className)}>
      <div className="overflow-x-auto">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-3.5 bg-slate-50/70 dark:bg-zinc-900/70 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          {footer}
        </div>
      )}
    </div>
  );
};
