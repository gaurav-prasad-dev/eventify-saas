import React, { useState, useEffect } from 'react';
import {
  PageHeader,
  ActionButton,
  TableShell,
  StatusBadge,
  StatCard,
  FormField,
  FormInput,
  useToast,
} from '@eventify/ui';
import { eventsApi } from '../services/events.api';
import { CreateEventModal } from '../components/CreateEventModal';
import {
  Plus,
  Calendar,
  DollarSign,
  Users,
  Search,
  Sparkles,
  MapPin,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export const EventsPage = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [publishingId, setPublishingId] = useState(null);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await eventsApi.getEvents();
      const list = Array.isArray(data) ? data : (data.events || data.data || []);
      setEvents(list);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handlePublish = async (eventId) => {
    setPublishingId(eventId);
    try {
      await eventsApi.publishEvent(eventId);
      toast.success('Event published live to Marketplace!');
      loadEvents();
    } catch (err) {
      toast.error(err.message || 'Cannot publish event: At least 1 session and 1 ticket tier required.');
    } finally {
      setPublishingId(null);
    }
  };

  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.venue?.name && e.venue.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalEvents = events.length;
  const publishedCount = events.filter((e) => e.status === 'PUBLISHED').length;
  const totalCapacity = events.reduce((acc, e) => acc + (e.totalCapacity || 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. Standard Page Header */}
      <PageHeader
        title="Events Management"
        subtitle="Create, monitor, and publish ticketed events linked to your venues"
      >
        <ActionButton
          variant="primary"
          icon={<Plus />}
          onClick={() => setIsCreateOpen(true)}
        >
          Create Event
        </ActionButton>
      </PageHeader>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Events"
          value={totalEvents.toString()}
          subtitle={`${publishedCount} published live`}
          icon={<Calendar />}
        />
        <StatCard
          title="Live on Marketplace"
          value={publishedCount.toString()}
          subtitle="Discoverable by customers"
          isPositive={publishedCount > 0}
          icon={<Sparkles />}
        />
        <StatCard
          title="Total Event Capacity"
          value={totalCapacity.toLocaleString()}
          subtitle="Configured ticket capacity"
          icon={<Users />}
        />
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 card-side-shadow">
        <div className="w-72">
          <FormField>
            <FormInput
              placeholder="Search by title, category, venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FormField>
        </div>
      </div>

      {/* 4. Pre-styled LEGO Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl card-side-shadow space-y-3">
          <Calendar className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-600" />
          <h4 className="text-base font-bold text-slate-800 dark:text-zinc-200">
            No events found
          </h4>
          <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm mx-auto">
            Create your first event, link it to one of your venues, and publish it to the marketplace.
          </p>
          <ActionButton
            variant="primary"
            size="sm"
            icon={<Plus />}
            onClick={() => setIsCreateOpen(true)}
          >
            Create Your First Event
          </ActionButton>
        </div>
      ) : (
        <TableShell
          footer={
            <span>
              Showing <strong className="font-semibold text-slate-700 dark:text-zinc-200">{filteredEvents.length}</strong> of{' '}
              <strong className="font-semibold text-slate-700 dark:text-zinc-200">{events.length}</strong> events
            </span>
          }
        >
          <table className="master-table">
            <thead>
              <tr>
                <th className="w-24">Event ID</th>
                <th>Title & Category</th>
                <th>Linked Venue</th>
                <th>Dates</th>
                <th>Capacity</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((evt) => {
                const startDateStr = new Date(evt.startDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <tr key={evt.id}>
                    <td className="font-mono text-xs text-slate-400 dark:text-zinc-500">
                      {evt.id.slice(0, 8)}...
                    </td>
                    <td>
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {evt.title}
                        </span>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {evt.category}
                        </span>
                      </div>
                    </td>
                    <td>
                      {evt.venue ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-zinc-300">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>
                            {evt.venue.name} ({evt.venue.city})
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">No venue linked</span>
                      )}
                    </td>
                    <td className="font-mono text-xs text-slate-500 dark:text-zinc-400">
                      {startDateStr}
                    </td>
                    <td className="font-mono text-xs font-semibold">
                      {evt.totalCapacity ? evt.totalCapacity.toLocaleString() : 'Open'}
                    </td>
                    <td>
                      <StatusBadge status={evt.status} />
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {evt.status === 'DRAFT' && (
                          <ActionButton
                            size="sm"
                            variant="primary"
                            icon={<Sparkles />}
                            isLoading={publishingId === evt.id}
                            onClick={() => handlePublish(evt.id)}
                          >
                            Publish
                          </ActionButton>
                        )}
                        {evt.status === 'PUBLISHED' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 pr-2">
                            <CheckCircle2 className="w-4 h-4" /> Live
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableShell>
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => loadEvents()}
      />
    </div>
  );
};
