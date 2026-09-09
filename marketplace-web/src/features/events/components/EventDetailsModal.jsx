import React from 'react';
import { ActionButton, Badge } from '@eventify/ui';
import {
  X,
  Calendar,
  MapPin,
  Ticket,
  Clock,
  Building2,
  ShieldAlert,
  Sparkles,
  Share2,
} from 'lucide-react';

export const EventDetailsModal = ({ isOpen, onClose, event, onBookTickets }) => {
  if (!isOpen || !event) return null;

  const startDateStr = new Date(event.startDate).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const bannerImage =
    event.bannerUrl ||
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden card-side-shadow flex flex-col max-h-[92vh]">
        {/* Banner Media Hero */}
        <div className="relative h-60 sm:h-72 w-full shrink-0 overflow-hidden bg-zinc-950">
          <img
            src={bannerImage}
            alt={event.title}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

          {/* Close & Share Floating Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Floating Badges */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500 text-zinc-950 shadow-lg">
                  {event.category}
                </span>
                {event.ageRestriction && event.ageRestriction !== 'ALL_AGES' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-800/80 text-zinc-200 border border-zinc-700/60 backdrop-blur-sm">
                    {event.ageRestriction}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white line-clamp-2">
                {event.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-zinc-200">
          {/* Organizer Attribution Pill */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 ring-2 ring-emerald-500/40">
                {event.organization?.name ? event.organization.name.charAt(0).toUpperCase() : 'O'}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">
                  Organized by
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {event.organization?.name || 'Verified Event Organizer'}
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="w-3.5 h-3.5" /> Direct Partner
            </span>
          </div>

          {/* Venue & Location Card */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              <MapPin className="w-4 h-4 text-emerald-500" />
              Venue & Location
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {event.venue?.name || 'Venue to be announced'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                {event.venue?.address ? `${event.venue.address}, ` : ''}
                {event.venue?.city ? `${event.venue.city}, ` : ''}
                {event.venue?.state || event.venue?.country || ''}
              </p>
            </div>

            {event.venue?.facilities && event.venue.facilities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                {event.venue.facilities.map((fac, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-medium"
                  >
                    ✓ {fac}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              About This Experience
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Showtimes / Sessions */}
          {event.sessions && event.sessions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-500" />
                Scheduled Showtimes & Agenda
              </h4>

              <div className="space-y-2">
                {event.sessions.map((sess) => {
                  const sTime = new Date(sess.startTime).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const eTime = new Date(sess.endTime).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={sess.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {sess.title}
                        </span>
                        <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
                          {startDateStr}
                        </span>
                      </div>
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {sTime} – {eTime}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ticket Pricing Tiers */}
          {event.ticketTiers && event.ticketTiers.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-emerald-500" />
                Ticket Categories & Pricing
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.ticketTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {tier.name}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase">
                          {tier.seatType || 'STANDARD'}
                        </span>
                      </div>
                      <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 block mt-1">
                        ₹{Number(tier.price).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between border-t border-slate-200/50 dark:border-zinc-700/50 pt-2">
                      <span>Available</span>
                      <strong className="text-slate-800 dark:text-zinc-200">
                        {tier.availableQuantity ?? tier.totalQuantity} seats left
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block">
              Starting From
            </span>
            <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
              ₹{Number(event.startingPrice || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ActionButton variant="outline" size="md" onClick={onClose}>
              Close
            </ActionButton>
            <ActionButton
              variant="primary"
              size="md"
              icon={<Ticket />}
              onClick={() => {
                onClose();
                onBookTickets?.(event);
              }}
            >
              Book Tickets Now
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
};
