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
import { venuesApi } from '../services/venues.api';
import { CreateVenueModal } from '../components/CreateVenueModal';
import { VenueDealsModal } from '../components/VenueDealsModal';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Users,
  FileText,
  CheckCircle,
  Clock,
} from 'lucide-react';

export const VenuesPage = () => {
  const { toast } = useToast();
  const [venues, setVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedVenueForDeals, setSelectedVenueForDeals] = useState(null);

  const loadVenues = async () => {
    setIsLoading(true);
    try {
      const data = await venuesApi.getVenues();
      const list = Array.isArray(data) ? data : (data.venues || data.data || []);
      setVenues(list);
    } catch (err) {
      toast.error('Failed to load venues');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVenues();
  }, []);

  const handleStatusToggle = async (venue) => {
    const nextStatus = venue.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await venuesApi.toggleStatus(venue.id, nextStatus);
      toast.success(`Venue marked as ${nextStatus}`);
      loadVenues();
    } catch (err) {
      toast.error('Failed to update venue status');
    }
  };

  const filteredVenues = venues.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCapacity = venues.reduce((acc, v) => acc + (v.capacity || 0), 0);
  const activeCount = venues.filter((v) => v.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Venues & Real Estate"
        subtitle="Manage physical event locations and commercial rental agreements"
      >
        <ActionButton
          variant="primary"
          icon={<Plus />}
          onClick={() => setIsCreateOpen(true)}
        >
          Add Venue
        </ActionButton>
      </PageHeader>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Venues"
          value={venues.length.toString()}
          subtitle={`${activeCount} active in rotation`}
          icon={<Building2 />}
        />
        <StatCard
          title="Total Capacity"
          value={totalCapacity.toLocaleString()}
          subtitle="Combined attendee limit"
          icon={<Users />}
        />
        <StatCard
          title="Active Contracts"
          value={venues.reduce((acc, v) => acc + (v._count?.contracts || 0), 0).toString()}
          subtitle="Commercial deals in place"
          icon={<FileText />}
        />
      </div>

      {/* 3. Search Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 card-side-shadow">
        <div className="w-72">
          <FormField>
            <FormInput
              placeholder="Search by venue name or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FormField>
        </div>
      </div>

      {/* 4. Venues Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredVenues.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl card-side-shadow space-y-3">
          <Building2 className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-600" />
          <h4 className="text-base font-bold text-slate-800 dark:text-zinc-200">
            No venues found
          </h4>
          <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm mx-auto">
            Get started by registering your organization's event venue. You can then attach commercial rental deals and host events.
          </p>
          <ActionButton
            variant="primary"
            size="sm"
            icon={<Plus />}
            onClick={() => setIsCreateOpen(true)}
          >
            Add Your First Venue
          </ActionButton>
        </div>
      ) : (
        <TableShell
          footer={
            <span>
              Showing <strong className="font-semibold text-slate-700 dark:text-zinc-200">{filteredVenues.length}</strong> of{' '}
              <strong className="font-semibold text-slate-700 dark:text-zinc-200">{venues.length}</strong> venues
            </span>
          }
        >
          <table className="master-table">
            <thead>
              <tr>
                <th>Venue</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Facilities</th>
                <th>Status</th>
                <th className="text-right">Deals & Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVenues.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {v.name}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500 block truncate max-w-xs">
                        {v.address}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="text-slate-700 dark:text-zinc-300 text-xs flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {v.city}{v.state ? `, ${v.state}` : ''}
                    </span>
                  </td>
                  <td className="font-mono font-semibold text-xs">
                    {v.capacity ? v.capacity.toLocaleString() : 'N/A'}
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(v.facilities || []).slice(0, 3).map((f, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                        >
                          {f}
                        </span>
                      ))}
                      {(v.facilities || []).length > 3 && (
                        <span className="text-[10px] text-slate-400">
                          +{v.facilities.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <ActionButton
                        size="sm"
                        variant="outline"
                        icon={<FileText />}
                        onClick={() => setSelectedVenueForDeals(v)}
                      >
                        Manage Deals
                      </ActionButton>
                      <ActionButton
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStatusToggle(v)}
                      >
                        {v.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      )}

      {/* Modals */}
      <CreateVenueModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => loadVenues()}
      />

      <VenueDealsModal
        isOpen={!!selectedVenueForDeals}
        venue={selectedVenueForDeals}
        onClose={() => setSelectedVenueForDeals(null)}
      />
    </div>
  );
};
