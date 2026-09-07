import React from 'react';
import { OrganizationsPage } from './features/organizations/pages/OrganizationsPage';
import { ShieldCheck, Building2, CreditCard, Activity, FileText, Settings } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Super Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-base font-bold tracking-tight flex items-center gap-2 text-white">
            <span className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-black text-sm">
              E
            </span>
            Eventify Admin
          </span>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          <a
            href="#orgs"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-brand-400"
          >
            <Building2 className="w-4 h-4 text-brand-400" />
            Organizations
          </a>
          <a
            href="#subscriptions"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <CreditCard className="w-4 h-4" />
            Subscriptions & Fees
          </a>
          <a
            href="#activity"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <Activity className="w-4 h-4" />
            System Health & Logs
          </a>
          <a
            href="#audit"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <FileText className="w-4 h-4" />
            Audit Reports
          </a>
        </nav>

        <div className="p-4 border-t border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
            SA
          </div>
          <div className="text-xs">
            <p className="font-semibold text-white">Super Admin</p>
            <p className="text-slate-400">Platform Owner</p>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Console: <strong className="text-slate-800">Platform Root Controller</strong>
          </span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-medium text-slate-600">Multi-tenant Security Active</span>
          </div>
        </header>

        <main className="p-8 flex-1">
          <OrganizationsPage />
        </main>
      </div>
    </div>
  );
}
