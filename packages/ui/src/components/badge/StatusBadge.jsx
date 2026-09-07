import React from 'react';
import { cn } from '../../utils/cn';

const statusConfig = {
  ACTIVE:     { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Active' },
  PUBLISHED:  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Published' },
  CONFIRMED:  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Confirmed' },
  PENDING:    { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   label: 'Pending' },
  DRAFT:      { bg: 'bg-slate-100',  text: 'text-slate-700',   border: 'border-slate-200',   label: 'Draft' },
  CANCELLED:  { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    label: 'Cancelled' },
  SUSPENDED:  { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    label: 'Suspended' },
};

export const StatusBadge = ({
  status = 'DRAFT',
  className = '',
}) => {
  const key = (status || '').toUpperCase();
  const config = statusConfig[key] || statusConfig.DRAFT;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {config.label}
    </span>
  );
};
