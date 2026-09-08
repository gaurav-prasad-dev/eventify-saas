import React, { useState } from 'react';
import {
  PageHeader,
  ActionButton,
  TableShell,
  StatusBadge,
  StatCard,
  FormField,
  FormInput,
} from '@eventify/ui';
import { Plus, Calendar, DollarSign, Users, Download, Search } from 'lucide-react';

const initialEvents = [
  {
    id: 'EVT-1001',
    title: 'Global Tech Summit 2026',
    venue: 'Grand Convention Hall, Hall A',
    date: '15 Oct 2026, 10:00 AM',
    ticketsSold: '450 / 500',
    revenue: '₹4,50,000',
    status: 'ACTIVE',
  },
  {
    id: 'EVT-1002',
    title: 'Indie Rock Music Fest',
    venue: 'Open Grounds Arena',
    date: '28 Oct 2026, 06:00 PM',
    ticketsSold: '1,200 / 2,000',
    revenue: '₹9,60,000',
    status: 'PUBLISHED',
  },
  {
    id: 'EVT-1003',
    title: 'Fintech Leadership Forum',
    venue: 'Skyline Auditorium',
    date: '05 Nov 2026, 09:30 AM',
    ticketsSold: '0 / 250',
    revenue: '₹0',
    status: 'DRAFT',
  },
];

export const EventsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [events] = useState(initialEvents);

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. Standard Page Header */}
      <PageHeader
        title="Events Management"
        subtitle="Create, monitor, and configure ticket sales for your organization"
      >
        <ActionButton variant="outline" icon={<Download />}>
          Export CSV
        </ActionButton>
        <ActionButton variant="primary" icon={<Plus />}>
          Create Event
        </ActionButton>
      </PageHeader>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Events"
          value="12"
          subtitle="3 currently active"
          icon={<Calendar />}
        />
        <StatCard
          title="Tickets Sold"
          value="1,650"
          change="+18.4%"
          isPositive={true}
          icon={<Users />}
        />
        <StatCard
          title="Total Revenue"
          value="₹14,10,000"
          change="+12.1%"
          isPositive={true}
          icon={<DollarSign />}
        />
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 card-side-shadow">
        <div className="w-72">
          <FormField>
            <FormInput
              placeholder="Search events by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FormField>
        </div>
      </div>

      {/* 4. Pre-styled LEGO Table */}
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
              <th>Title</th>
              <th>Venue</th>
              <th>Date</th>
              <th>Tickets Sold</th>
              <th>Revenue</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((evt) => (
              <tr key={evt.id}>
                <td className="font-mono text-xs text-slate-400 dark:text-zinc-500">{evt.id}</td>
                <td className="font-semibold text-slate-900 dark:text-white">{evt.title}</td>
                <td className="text-slate-600 dark:text-zinc-300">{evt.venue}</td>
                <td className="font-mono text-xs text-slate-500 dark:text-zinc-400">{evt.date}</td>
                <td className="font-mono text-xs">{evt.ticketsSold}</td>
                <td className="font-mono font-bold text-slate-900 dark:text-white price-display">
                  {evt.revenue}
                </td>
                <td>
                  <StatusBadge status={evt.status} />
                </td>
                <td className="text-right">
                  <ActionButton size="sm" variant="ghost">
                    Manage
                  </ActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </div>
  );
};
