import React from 'react';
import { EventsPage } from './features/events/pages/EventsPage';
import { Calendar, MapPin, Ticket, Users, BarChart3, Settings, ShieldCheck } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <span className="text-base font-bold text-brand-600 tracking-tight flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-black text-sm">
              E
            </span>
            Eventify Organizer
          </span>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          <a
            href="#events"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg bg-brand-50 text-brand-700"
          >
            <Calendar className="w-4 h-4 text-brand-600" />
            Events
          </a>
          <a
            href="#venues"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <MapPin className="w-4 h-4 text-slate-400" />
            Venues
          </a>
          <a
            href="#tickets"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Ticket className="w-4 h-4 text-slate-400" />
            Ticket Tiers
          </a>
          <a
            href="#attendees"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Users className="w-4 h-4 text-slate-400" />
            Attendees
          </a>
          <a
            href="#analytics"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <BarChart3 className="w-4 h-4 text-slate-400" />
            Analytics
          </a>
        </nav>

        <div className="p-4 border-t border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
            OP
          </div>
          <div className="text-xs">
            <p className="font-semibold text-slate-800">Apex Events Ltd.</p>
            <p className="text-slate-400">Organizer Portal</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Organization: <strong className="text-slate-800">Apex Events</strong>
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-slate-600">ERP Connected</span>
          </div>
        </header>

        <main className="p-8 flex-1">
          <EventsPage />
        </main>
      </div>
    </div>
  );
}
