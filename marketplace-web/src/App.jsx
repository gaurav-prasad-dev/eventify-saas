import React from 'react';
import { MarketplaceEventsPage } from './features/events/pages/MarketplaceEventsPage';
import { ActionButton, Button } from '@eventify/ui';
import { Ticket, User, Compass } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Customer Navbar */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-black text-sm">
              E
            </span>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              Eventify
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#discover" className="text-brand-600 flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              Discover Events
            </a>
            <a href="#venues" className="hover:text-slate-900">Venues</a>
            <a href="#pricing" className="hover:text-slate-900">Organizer SaaS</a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ActionButton variant="outline" size="sm" icon={<Ticket />}>
            My Tickets
          </ActionButton>
          <ActionButton variant="primary" size="sm" icon={<User />}>
            Sign In
          </ActionButton>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10">
        <MarketplaceEventsPage />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-6 sm:px-12 text-center text-xs text-slate-400">
        <p>© 2026 Eventify SaaS Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
