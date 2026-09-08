import React, { useState } from 'react';
import {
  ActionButton,
  Badge,
  FormField,
  FormInput,
} from '@eventify/ui';
import { Calendar, MapPin, Ticket, Sparkles } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';

const featuredEvents = [
  {
    id: 'EVT-1001',
    title: 'Global Tech Summit 2026',
    organizer: 'Apex Events Ltd.',
    category: 'Conference',
    date: '15 Oct 2026',
    time: '10:00 AM',
    venue: 'Grand Convention Hall, Hall A',
    price: '₹1,500',
    availableSeats: 50,
  },
  {
    id: 'EVT-1002',
    title: 'Indie Rock Music Fest',
    organizer: 'Neon Music & Stage',
    category: 'Music Concert',
    date: '28 Oct 2026',
    time: '06:00 PM',
    venue: 'Open Grounds Arena',
    price: '₹800',
    availableSeats: 800,
  },
  {
    id: 'EVT-1004',
    title: 'Startup Pitch & Networking Night',
    organizer: 'Apex Events Ltd.',
    category: 'Networking',
    date: '12 Nov 2026',
    time: '07:00 PM',
    venue: 'Skyline Hub, Floor 14',
    price: '₹499',
    availableSeats: 35,
  },
];

export const MarketplaceEventsPage = ({ onBookTickets }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { isAuthenticated } = useAuth();

  const filteredEvents = featuredEvents.filter(
    (e) =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBooking = (evt) => {
    if (!isAuthenticated && onBookTickets) {
      onBookTickets();
    } else {
      alert(`Booking initiated for ${evt.title}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner: Emerald Green & Obsidian Black */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-emerald-950 border border-emerald-500/30 rounded-2xl p-8 sm:p-12 text-white card-side-shadow relative overflow-hidden">
        <div className="max-w-2xl space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Live Experience Booking Platform
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Discover & Book Unforgettable Experiences
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-lg leading-relaxed">
            Find the most exciting tech conferences, music concerts, and workshops in your city. Direct organizer verification & instant QR tickets.
          </p>
        </div>

        {/* Ambient Emerald Accent Glow */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <FormField>
            <FormInput
              placeholder="Search by event name, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FormField>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto pb-1">
          <Badge variant="primary">All Events ({filteredEvents.length})</Badge>
          <Badge variant="neutral">Conferences</Badge>
          <Badge variant="neutral">Concerts</Badge>
          <Badge variant="neutral">Workshops</Badge>
        </div>
      </div>

      {/* Event Cards Grid with Geometric Side Shadow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="card-side-shadow rounded-2xl flex flex-col justify-between overflow-hidden"
          >
            <div className="p-6 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {evt.category}
                </span>
                <span className="font-mono text-xs text-slate-400 dark:text-zinc-500">{evt.id}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                {evt.title}
              </h3>

              <div className="space-y-2 text-xs text-slate-500 dark:text-zinc-400 pt-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{evt.date} • {evt.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                  <span className="truncate">{evt.venue}</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800">
                <span className="text-xs text-slate-400 dark:text-zinc-500">By {evt.organizer}</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {evt.availableSeats} seats left
                </span>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/70 dark:bg-zinc-900/70 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block">Price</span>
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-white price-display">
                  {evt.price}
                </span>
              </div>
              <ActionButton
                variant="primary"
                size="md"
                icon={<Ticket />}
                onClick={() => handleBooking(evt)}
              >
                Book Tickets
              </ActionButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
