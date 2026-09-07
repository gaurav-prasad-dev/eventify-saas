import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ children, className = '', ...props }) => (
  <div className={cn('bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden', className)} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={cn('px-5 py-4 border-b border-slate-100 flex items-center justify-between', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={cn('text-sm font-semibold text-slate-800', className)} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={cn('p-5', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={cn('px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5', className)} {...props}>
    {children}
  </div>
);
