import React, { useState } from 'react';
import {
  PageHeader,
  ActionButton,
  Button,
  Card,
  CardContent,
  CardFooter,
  Badge,
  FormField,
  FormInput,
} from '@eventify/ui';
import { Calendar, MapPin, Ticket, Search, Sparkles } from 'lucide-react';

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

export const MarketplaceEventsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = featuredEvents.filter(
    (e) =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Hero Banner using Brand Tokens */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-700 to-brand-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-sm border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Live Experience Booking Platform
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Discover & Book Live Experiences
          </h1>
          <p className="text-xs text-brand-100 max-w-lg">
            Find the most exciting tech conferences, music concerts, and business workshops in your city. Instant QR ticket delivery.
          </p>
        </div>
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
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="primary">All Events ({filteredEvents.length})</Badge>
          <Badge variant="neutral">Conferences</Badge>
          <Badge variant="neutral">Music</Badge>
          <Badge variant="neutral">Workshops</Badge>
        </div>
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((evt) => (
          <Card key={evt.id} className="flex flex-col justify-between hover:shadow-card transition-shadow">
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="primary">{evt.category}</Badge>
                <span className="font-mono text-xs text-slate-400">{evt.id}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                {evt.title}
              </h3>

              <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span>{evt.date} • {evt.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{evt.venue}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs text-slate-400">By {evt.organizer}</span>
                <span className="text-xs font-semibold text-emerald-600">
                  {evt.availableSeats} seats left
                </span>
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">From</span>
                <span className="text-lg font-bold font-mono text-slate-900 price-display">
                  {evt.price}
                </span>
              </div>
              <ActionButton variant="primary" size="md" icon={<Ticket />}>
                Book Tickets
              </ActionButton>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
