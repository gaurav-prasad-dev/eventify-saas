import React, { useState } from 'react';
import {
  ThemeProvider,
  ToastProvider,
  ThemeToggle,
  Logo,
  ActionButton,
} from '@eventify/ui';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import { MarketplaceAuthModal } from './features/auth/components/MarketplaceAuthModal';
import { MarketplaceEventsPage } from './features/events/pages/MarketplaceEventsPage';
import { Ticket, User, LogOut, Compass } from 'lucide-react';

function MarketplaceNavbar({ onOpenAuth }) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="h-16 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-6 sm:px-12 flex items-center justify-between sticky top-0 z-40 transition-colors">
      <div className="flex items-center gap-8">
        <Logo portal="marketplace" />

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-zinc-400">
          <a href="#discover" className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <Compass className="w-4 h-4" />
            Discover Events
          </a>
          <a href="#venues" className="hover:text-slate-900 dark:hover:text-white transition-colors">Venues</a>
          <a href="#organizers" className="hover:text-slate-900 dark:hover:text-white transition-colors">Organizer Portal</a>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Dark/Light Mode Switcher */}
        <ThemeToggle />

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <ActionButton variant="outline" size="sm" icon={<Ticket />}>
              My Tickets
            </ActionButton>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover ring-2 ring-emerald-500"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 max-w-[120px] truncate">
                {user?.name}
              </span>
            </div>

            <ActionButton
              variant="ghost"
              size="sm"
              icon={<LogOut />}
              onClick={logout}
              title="Sign Out"
            >
              Logout
            </ActionButton>
          </div>
        ) : (
          <ActionButton
            variant="primary"
            size="sm"
            icon={<User />}
            onClick={onOpenAuth}
          >
            Sign In
          </ActionButton>
        )}
      </div>
    </header>
  );
}

function MainLayout() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors">
      <MarketplaceNavbar onOpenAuth={() => setIsAuthOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10">
        <MarketplaceEventsPage onBookTickets={() => setIsAuthOpen(true)} />
      </main>

      <footer className="bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 py-8 px-6 sm:px-12 text-center text-xs text-slate-400 dark:text-zinc-500 transition-colors">
        <p>© 2026 Eventify SaaS Platform. All rights reserved. Powered by Green & Black Design System.</p>
      </footer>

      <MarketplaceAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
