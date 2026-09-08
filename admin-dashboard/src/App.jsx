import React from 'react';
import {
  ThemeProvider,
  ToastProvider,
  ThemeToggle,
  Logo,
  ActionButton,
} from '@eventify/ui';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import { AdminLoginPage } from './features/auth/pages/AdminLoginPage';
import { OrganizationsPage } from './features/organizations/pages/OrganizationsPage';
import {
  ShieldCheck,
  Building2,
  CreditCard,
  Activity,
  FileText,
  LogOut,
} from 'lucide-react';

function AdminDashboardContent() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors">
      {/* Super Admin Sidebar */}
      <aside className="w-64 bg-zinc-950 dark:bg-zinc-900 text-zinc-100 border-r border-zinc-800 flex flex-col shrink-0 transition-colors">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <Logo portal="admin" />
        </div>

        <nav className="p-4 space-y-1.5 flex-1">
          <a
            href="#orgs"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-800/80 text-emerald-400 border border-emerald-500/20"
          >
            <Building2 className="w-4 h-4 text-emerald-400" />
            Organizations
          </a>
          <a
            href="#subscriptions"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            Subscriptions & Fees
          </a>
          <a
            href="#activity"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <Activity className="w-4 h-4" />
            System Health & Logs
          </a>
          <a
            href="#audit"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <FileText className="w-4 h-4" />
            Audit Reports
          </a>
        </nav>

        {/* Super Admin Profile Footer */}
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 ring-2 ring-emerald-500/50">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="text-xs truncate">
              <p className="font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
                SUPER ADMIN
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-zinc-400 hover:text-rose-400 transition-colors"
            title="Lock Console & Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Console Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-8 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Root Controller:</span>
            <strong className="text-slate-900 dark:text-white font-semibold">
              Eventify SaaS Platform
            </strong>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                Encrypted Root Session
              </span>
            </div>
          </div>
        </header>

        <main className="p-8 flex-1 overflow-auto">
          <OrganizationsPage />
        </main>
      </div>
    </div>
  );
}

function MainApp() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }

  return <AdminDashboardContent />;
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
