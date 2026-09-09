import React, { useState, useEffect } from 'react';
import {
  ActionButton,
  Badge,
  FormField,
  FormInput,
  useToast,
} from '@eventify/ui';
import { marketplaceEventsApi } from '../services/marketplaceEvents.api';
import { EventDetailsModal } from '../components/EventDetailsModal';
import { Calendar, MapPin, Ticket, Sparkles, Search, Layers } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';

const CATEGORY_FILTERS = [
  { id: 'ALL', label: 'All Events' },
  { id: 'TECH', label: 'Tech & AI' },
  { id: 'MUSIC', label: 'Concerts' },
  { id: 'WORKSHOP', label: 'Workshops' },
  { id: 'CONFERENCE', label: 'Conferences' },
  { id: 'COMEDY', label: 'Comedy' },
];

export const MarketplaceEventsPage = ({ onBookTickets }) => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Event Details Modal state
  const [selectedEvent, setSelectedEvent] = useState(null);

  const loadPublishedEvents = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const data = await marketplaceEventsApi.getPublishedEvents(params);
      setEvents(data.events || []);
    } catch (err) {
      console.warn('Failed to load published marketplace events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPublishedEvents();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  const handleBooking = (evt) => {
    if (!isAuthenticated && onBookTickets) {
      onBookTickets();
    } else {
      setSelectedEvent(evt);
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
              placeholder="Search events by title, venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FormField>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto pb-1 max-w-full">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Event Cards Grid */}
      {isLoading ? (
        <div className="py-24 flex justify-center">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl card-side-shadow space-y-4 p-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/50 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No published events in this category yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            Event organizers can create events, link them to physical venues, and publish them from the{' '}
            <strong className="text-slate-700 dark:text-zinc-300">Organizer Portal (:3001)</strong>. Once published, they will appear right here in real-time!
          </p>
          {selectedCategory !== 'ALL' && (
            <ActionButton
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory('ALL')}
            >
              Show All Categories
            </ActionButton>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => {
            const startDateStr = new Date(evt.startDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            const fallbackImage =
              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80';

            return (
              <div
                key={evt.id}
                onClick={() => setSelectedEvent(evt)}
                className="card-side-shadow rounded-2xl flex flex-col justify-between overflow-hidden cursor-pointer hover:border-emerald-500/50 transition-all group"
              >
                {/* Event Image Banner */}
                <div className="relative h-44 w-full overflow-hidden bg-zinc-900">
                  <img
                    src={evt.bannerUrl || fallbackImage}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-zinc-950 shadow-sm">
                    {evt.category}
                  </span>
                </div>

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {evt.title}
                    </h3>

                    <div className="space-y-1.5 text-xs text-slate-500 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{startDateStr}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                        <span className="truncate">
                          {evt.venue ? `${evt.venue.name} • ${evt.venue.city}` : 'Venue TBA'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 text-xs">
                    <span className="text-slate-400 dark:text-zinc-500">
                      By {evt.organization?.name || 'Verified Host'}
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {evt.availableTickets > 0 ? `${evt.availableTickets} tickets left` : 'Open Entry'}
                    </span>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50/70 dark:bg-zinc-900/70 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block">
                      Starting From
                    </span>
                    <span className="text-lg font-bold font-mono text-slate-900 dark:text-white price-display">
                      ₹{Number(evt.startingPrice || 0).toLocaleString()}
                    </span>
                  </div>
                  <ActionButton
                    variant="primary"
                    size="sm"
                    icon={<Ticket />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBooking(evt);
                    }}
                  >
                    View Details
                  </ActionButton>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={!!selectedEvent}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onBookTickets={onBookTickets}
      />
    </div>
  );
};
