import React from 'react';
import { cn } from '../../utils/cn';

export const PageHeader = ({
  title,
  subtitle = null,
  badge = null,
  children = null,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200',
        className
      )}
    >
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {children && (
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {children}
        </div>
      )}
    </div>
  );
};
