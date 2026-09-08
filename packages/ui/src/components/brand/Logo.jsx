import React from 'react';

export const Logo = ({
  portal = 'marketplace', // 'marketplace' | 'organizer' | 'admin'
  size = 'md',            // 'sm' | 'md' | 'lg'
  className = '',
}) => {
  const portalLabels = {
    marketplace: 'MARKETPLACE',
    organizer: 'ORGANIZER ERP',
    admin: 'SUPER ADMIN',
  };

  const badgeColors = {
    marketplace: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800',
    organizer: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800',
    admin: 'bg-zinc-100 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Geometric Hexagon / Ticket Spark Icon */}
      <div className="relative w-8 h-8 rounded-lg bg-zinc-950 dark:bg-zinc-900 border border-emerald-500/50 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.35)] shrink-0">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="w-4 h-4 text-emerald-400"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="text-base font-black tracking-tight text-zinc-900 dark:text-white">
            EVENTIFY
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>
        {portal && (
          <span className="text-[9px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase mt-0.5">
            {portalLabels[portal] || portal}
          </span>
        )}
      </div>
    </div>
  );
};
