import React, { useState, useEffect } from 'react';
import {
  FormField,
  FormInput,
  ActionButton,
  useToast,
} from '@eventify/ui';
import { eventsApi } from '../services/events.api';
import { venuesApi } from '../../venues/services/venues.api';
import {
  X,
  Calendar,
  MapPin,
  Ticket,
  Upload,
  Sparkles,
  DollarSign,
  FileText,
  Clock,
  Layers,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'TECH', label: 'Tech & AI' },
  { value: 'MUSIC', label: 'Music & Concert' },
  { value: 'WORKSHOP', label: 'Workshop & Learning' },
  { value: 'CONFERENCE', label: 'Business & Conference' },
  { value: 'COMEDY', label: 'Standup Comedy' },
  { value: 'SPORTS', label: 'Sports & Fitness' },
  { value: 'THEATRE', label: 'Theatre & Arts' },
  { value: 'FESTIVAL', label: 'Cultural Festival' },
  { value: 'OTHER', label: 'Other' },
];

export const CreateEventModal = ({ isOpen, onClose, onCreated }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('DETAILS'); // 'DETAILS' | 'VENUE' | 'TIERS'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Venues and Deals data
  const [venues, setVenues] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [isLoadingVenues, setIsLoadingVenues] = useState(true);

  // Form State
  const [eventData, setEventData] = useState({
    title: '',
    category: 'TECH',
    shortDescription: '',
    description: '',
    startDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 86400000 * 7 + 3600000 * 4).toISOString().slice(0, 16),
    venueId: '',
    venueContractId: '',
    ageRestriction: 'ALL_AGES',
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
  });

  // Media upload file
  const [bannerFile, setBannerFile] = useState(null);

  // Session State
  const [sessionData, setSessionData] = useState({
    title: 'Main Keynote & Stage',
    startTime: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 86400000 * 7 + 3600000 * 4).toISOString().slice(0, 16),
  });

  // Ticket Tier State
  const [tierData, setTierData] = useState({
    name: 'General Admission',
    price: '499',
    totalQuantity: '100',
  });

  // Load venues on open
  useEffect(() => {
    if (!isOpen) return;

    const loadVenues = async () => {
      setIsLoadingVenues(true);
      try {
        const res = await venuesApi.getVenues({ status: 'ACTIVE' });
        const list = Array.isArray(res) ? res : (res.venues || res.data || []);
        setVenues(list);
        if (list.length > 0 && !eventData.venueId) {
          setEventData((prev) => ({ ...prev, venueId: list[0].id }));
        }
      } catch (err) {
        toast.error('Failed to load active venues');
      } finally {
        setIsLoadingVenues(false);
      }
    };
    loadVenues();
  }, [isOpen]);

  // Load contracts when venueId changes
  useEffect(() => {
    if (!eventData.venueId) {
      setContracts([]);
      return;
    }

    const loadContracts = async () => {
      try {
        const res = await venuesApi.getVenueContracts(eventData.venueId);
        setContracts(res.contracts || []);
      } catch (err) {
        setContracts([]);
      }
    };
    loadContracts();
  }, [eventData.venueId]);

  if (!isOpen) return null;

  const handleCreate = async (shouldPublish = false) => {
    if (!eventData.title.trim()) {
      setActiveTab('DETAILS');
      setError('Please provide an event title.');
      return;
    }
    if (!eventData.venueId) {
      setActiveTab('VENUE');
      setError('Please select a venue for your event.');
      return;
    }
    if (!eventData.description.trim()) {
      setActiveTab('DETAILS');
      setError('Please provide an event description.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      // 1. Create Event Draft
      const payload = {
        title: eventData.title.trim(),
        category: eventData.category,
        description: eventData.description.trim(),
        shortDescription: eventData.shortDescription.trim() || undefined,
        startDate: new Date(eventData.startDate).toISOString(),
        endDate: new Date(eventData.endDate).toISOString(),
        venueId: eventData.venueId,
        venueContractId: eventData.venueContractId || undefined,
        bannerUrl: eventData.bannerUrl.trim() || undefined,
        ageRestriction: eventData.ageRestriction,
      };

      const res = await eventsApi.createEvent(payload);
      const createdEvent = res.event || res;

      // 2. Upload banner image to Cloudinary if file was selected
      if (bannerFile) {
        try {
          const formData = new FormData();
          formData.append('banner', bannerFile);
          await eventsApi.uploadMedia(createdEvent.id, formData);
        } catch (mediaErr) {
          console.warn('Cloudinary upload error:', mediaErr);
        }
      }

      // 3. Add initial showtime / session
      if (sessionData.title) {
        await eventsApi.addSession(createdEvent.id, {
          title: sessionData.title.trim(),
          startTime: new Date(sessionData.startTime).toISOString(),
          endTime: new Date(sessionData.endTime).toISOString(),
        });
      }

      // 4. Add initial ticket tier
      if (tierData.name && tierData.price) {
        await eventsApi.addTier(createdEvent.id, {
          name: tierData.name.trim(),
          price: Number(tierData.price),
          totalQuantity: Number(tierData.totalQuantity) || 50,
        });
      }

      // 5. Publish if requested
      if (shouldPublish) {
        await eventsApi.publishEvent(createdEvent.id);
        toast.success('Event published live to Marketplace!');
      } else {
        toast.success('Event draft created successfully!');
      }

      onCreated?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create event. Please verify all fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden card-side-shadow flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create & Publish Event
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Link with physical venues, configure tickets, and broadcast to the marketplace
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 dark:border-zinc-800 px-6 bg-slate-50/50 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={() => setActiveTab('DETAILS')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'DETAILS'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            1. Event Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('VENUE')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'VENUE'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            2. Link Venue & Deal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TIERS')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'TIERS'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            3. Showtimes & Tickets
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 rounded-lg text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* TAB 1: DETAILS */}
          {activeTab === 'DETAILS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <FormField label="Event Title" required>
                    <FormInput
                      placeholder="e.g. Global Tech Summit 2026"
                      value={eventData.title}
                      onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                      required
                    />
                  </FormField>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                    Event Category *
                  </label>
                  <select
                    className="w-full h-10 px-3 text-xs rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    value={eventData.category}
                    onChange={(e) => setEventData({ ...eventData, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                    Age Restriction
                  </label>
                  <select
                    className="w-full h-10 px-3 text-xs rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    value={eventData.ageRestriction}
                    onChange={(e) => setEventData({ ...eventData, ageRestriction: e.target.value })}
                  >
                    <option value="ALL_AGES">All Ages Welcome</option>
                    <option value="16+">16+ Only</option>
                    <option value="18+">18+ Adults Only</option>
                    <option value="21+">21+ Only</option>
                  </select>
                </div>

                <div>
                  <FormField label="Start Date & Time" required>
                    <FormInput
                      type="datetime-local"
                      value={eventData.startDate}
                      onChange={(e) => setEventData({ ...eventData, startDate: e.target.value })}
                      required
                    />
                  </FormField>
                </div>

                <div>
                  <FormField label="End Date & Time" required>
                    <FormInput
                      type="datetime-local"
                      value={eventData.endDate}
                      onChange={(e) => setEventData({ ...eventData, endDate: e.target.value })}
                      required
                    />
                  </FormField>
                </div>

                <div className="sm:col-span-2">
                  <FormField label="Short Catchphrase / Tagline">
                    <FormInput
                      placeholder="The premier annual conference bringing together tech pioneers."
                      value={eventData.shortDescription}
                      onChange={(e) => setEventData({ ...eventData, shortDescription: e.target.value })}
                    />
                  </FormField>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                    Event Description *
                  </label>
                  <textarea
                    rows={3}
                    className="w-full p-3 text-xs rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Provide complete event details, agenda, and instructions for attendees..."
                    value={eventData.description}
                    onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                    required
                  />
                </div>

                {/* Cloudinary Banner Support */}
                <div className="sm:col-span-2 space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">
                    Banner Media (Image URL or Upload via Cloudinary)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField label="Direct Image URL">
                      <FormInput
                        placeholder="https://images.unsplash.com/..."
                        value={eventData.bannerUrl}
                        onChange={(e) => setEventData({ ...eventData, bannerUrl: e.target.value })}
                      />
                    </FormField>

                    <div>
                      <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 block mb-1">
                        Upload to Cloudinary
                      </label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-zinc-800 dark:file:text-emerald-400"
                        onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LINK VENUE & COMMERCIAL DEAL */}
          {activeTab === 'VENUE' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-emerald-900 dark:text-emerald-300 font-semibold block">
                    Real Estate & Venue Contract Scoping
                  </strong>
                  <p className="text-slate-600 dark:text-zinc-400 mt-0.5">
                    Select where the event will be held. If your organization negotiated a commercial rental deal with this venue, link it here to back-link costs and capacity limits.
                  </p>
                </div>
              </div>

              {isLoadingVenues ? (
                <div className="py-8 flex justify-center">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : venues.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                    No active venues found
                  </p>
                  <p className="text-xs text-slate-500">
                    Please go to the "Venues" tab first to create your physical venue.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Select Venue */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                      Choose Physical Venue *
                    </label>
                    <select
                      className="w-full h-11 px-3 text-xs font-semibold rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      value={eventData.venueId}
                      onChange={(e) =>
                        setEventData({
                          ...eventData,
                          venueId: e.target.value,
                          venueContractId: '', // Reset contract when venue changes
                        })
                      }
                      required
                    >
                      <option value="">-- Select a venue --</option>
                      {venues.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.city}, Capacity: {v.capacity.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Commercial Deal / Contract */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                      Link Commercial Deal / Contract (Optional)
                    </label>
                    {contracts.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-1">
                        No commercial deals recorded for this venue yet. (You can still host the event without a deal).
                      </p>
                    ) : (
                      <select
                        className="w-full h-11 px-3 text-xs rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        value={eventData.venueContractId}
                        onChange={(e) =>
                          setEventData({ ...eventData, venueContractId: e.target.value })
                        }
                      >
                        <option value="">-- None (Standard venue hosting) --</option>
                        {contracts.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.dealTitle} • Cost: ₹{c.totalCost} • Cap: {c.allocatedCapacity} seats ({c.paymentStatus})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SHOWTIMES & TICKET TIERS */}
          {activeTab === 'TIERS' && (
            <div className="space-y-6">
              {/* Session Setup */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-200">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  Primary Event Showtime / Session
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <FormField label="Session Title">
                      <FormInput
                        placeholder="Keynote Session"
                        value={sessionData.title}
                        onChange={(e) => setSessionData({ ...sessionData, title: e.target.value })}
                      />
                    </FormField>
                  </div>
                  <div>
                    <FormField label="Start Showtime">
                      <FormInput
                        type="datetime-local"
                        value={sessionData.startTime}
                        onChange={(e) => setSessionData({ ...sessionData, startTime: e.target.value })}
                      />
                    </FormField>
                  </div>
                  <div>
                    <FormField label="End Showtime">
                      <FormInput
                        type="datetime-local"
                        value={sessionData.endTime}
                        onChange={(e) => setSessionData({ ...sessionData, endTime: e.target.value })}
                      />
                    </FormField>
                  </div>
                </div>
              </div>

              {/* Ticket Tier Setup */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-200">
                  <Ticket className="w-4 h-4 text-emerald-500" />
                  Primary Ticket Pricing Tier
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <FormField label="Tier Name" required>
                      <FormInput
                        placeholder="e.g. General Admission"
                        value={tierData.name}
                        onChange={(e) => setTierData({ ...tierData, name: e.target.value })}
                        required
                      />
                    </FormField>
                  </div>
                  <div>
                    <FormField label="Ticket Price (₹)" required>
                      <FormInput
                        type="number"
                        placeholder="499"
                        value={tierData.price}
                        onChange={(e) => setTierData({ ...tierData, price: e.target.value })}
                        required
                      />
                    </FormField>
                  </div>
                  <div>
                    <FormField label="Total Ticket Inventory" required>
                      <FormInput
                        type="number"
                        placeholder="100"
                        value={tierData.totalQuantity}
                        onChange={(e) => setTierData({ ...tierData, totalQuantity: e.target.value })}
                        required
                      />
                    </FormField>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/50 text-xs text-slate-500 dark:text-zinc-400">
                💡 <strong className="text-slate-800 dark:text-zinc-200">Publishing Guardrails:</strong> An event requires at least 1 scheduled showtime and 1 active ticket tier to be published live to the marketplace.
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50/70 dark:bg-zinc-900/70 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            {activeTab !== 'DETAILS' && (
              <ActionButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setActiveTab(activeTab === 'TIERS' ? 'VENUE' : 'DETAILS')
                }
              >
                Back
              </ActionButton>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== 'TIERS' ? (
              <ActionButton
                type="button"
                variant="primary"
                size="sm"
                onClick={() =>
                  setActiveTab(activeTab === 'DETAILS' ? 'VENUE' : 'TIERS')
                }
              >
                Next Step
              </ActionButton>
            ) : (
              <>
                <ActionButton
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => handleCreate(false)}
                >
                  Save as Draft
                </ActionButton>
                <ActionButton
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={<Sparkles />}
                  isLoading={isSubmitting}
                  onClick={() => handleCreate(true)}
                >
                  Publish to Marketplace
                </ActionButton>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
