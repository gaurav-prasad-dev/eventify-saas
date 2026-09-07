import React from 'react';
import { cn } from '../../utils/cn';

export const TableShell = ({
  children,
  footer = null,
  className = '',
}) => {
  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden', className)}>
      <div className="overflow-x-auto">
        {children}
      </div>
      {footer && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {footer}
        </div>
      )}
    </div>
  );
};
