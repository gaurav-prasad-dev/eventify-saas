import React, { useState } from 'react';
import {
  ThemeProvider,
  ToastProvider,
  ThemeToggle,
  Logo,
  ActionButton,
} from '@eventify/ui';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import { OrganizerLoginPage } from './features/auth/pages/OrganizerLoginPage';
import { AcceptInvitePage } from './features/auth/pages/AcceptInvitePage';
import { EventsPage } from './features/events/pages/EventsPage';
import { VenuesPage } from './features/venues/pages/VenuesPage';
import {
  Calendar,
  MapPin,
  Ticket,
  Users,
  BarChart3,
  LogOut,
  Building2,
  Shield,
} from 'lucide-react';

function DashboardContent() {
  const { user, activeOrganization, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'venues'

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col shrink-0 transition-colors">
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-zinc-800">
          <Logo portal="organizer" />
        </div>

        <nav className="p-4 space-y-1.5 flex-1">
          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'events'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className={`w-4 h-4 ${activeTab === 'events' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-500'}`} />
            Events
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('venues')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'venues'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className={`w-4 h-4 ${activeTab === 'venues' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-500'}`} />
            Venues & Deals
          </button>
          <a
            href="#tickets"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Ticket className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
            Ticket Tiers
          </a>
          <a
            href="#attendees"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Users className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
            Attendees & Staff
          </a>
          <a
            href="#analytics"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
            Analytics
          </a>
        </nav>

        {/* Organization & User Profile Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 ring-2 ring-emerald-500/50">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
            </div>
            <div className="text-xs truncate">
              <p className="font-semibold text-slate-900 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
                {activeOrganization?.name || user?.roles?.[0] || 'Staff'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            title="Sign out of Organizer ERP"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-8 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Workspace:</span>
            <strong className="text-slate-900 dark:text-white font-semibold">
              {activeOrganization?.name || 'Apex Events Ltd.'}
            </strong>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                Staff Verified
              </span>
            </div>
          </div>
        </header>

        <main className="p-8 flex-1 overflow-auto">
          {activeTab === 'events' && <EventsPage />}
          {activeTab === 'venues' && <VenuesPage />}
        </main>
      </div>
    </div>
  );
}

function MainApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [view, setView] = useState('LOGIN'); // 'LOGIN' | 'INVITE'

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (view === 'INVITE') {
      return <AcceptInvitePage onBackToLogin={() => setView('LOGIN')} />;
    }
    return <OrganizerLoginPage onSwitchToInvite={() => setView('INVITE')} />;
  }

  return <DashboardContent />;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
