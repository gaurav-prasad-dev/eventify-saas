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
import { Building2, DollarSign, TrendingUp, ShieldAlert, Plus, Download } from 'lucide-react';

const initialOrgs = [
  {
    id: 'ORG-001',
    name: 'Apex Events Ltd.',
    ownerEmail: 'contact@apexevents.com',
    plan: 'PRO',
    eventsHosted: 12,
    platformFeeEarned: '₹70,500',
    status: 'ACTIVE',
  },
  {
    id: 'ORG-002',
    name: 'Neon Music & Stage',
    ownerEmail: 'admin@neonmusic.io',
    plan: 'ENTERPRISE',
    eventsHosted: 34,
    platformFeeEarned: '₹2,40,000',
    status: 'ACTIVE',
  },
  {
    id: 'ORG-003',
    name: 'Metropolis Expo Hub',
    ownerEmail: 'operations@metropolis.in',
    plan: 'STARTER',
    eventsHosted: 2,
    platformFeeEarned: '₹4,200',
    status: 'PENDING',
  },
];

export const OrganizationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [orgs] = useState(initialOrgs);

  const filteredOrgs = orgs.filter((o) =>
    o.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. Standard Page Header */}
      <PageHeader
        title="Tenant Organizations"
        subtitle="Manage registered event companies, subscriptions, and platform compliance"
      >
        <ActionButton variant="outline" icon={<Download />}>
          Export Audit
        </ActionButton>
        <ActionButton variant="primary" icon={<Plus />}>
          Add Organization
        </ActionButton>
      </PageHeader>

      {/* 2. Platform Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Organizations"
          value="48"
          subtitle="4 onboarding this week"
          icon={<Building2 />}
        />
        <StatCard
          title="Total SaaS Commission"
          value="₹31,45,000"
          change="+24.8%"
          isPositive={true}
          icon={<DollarSign />}
        />
        <StatCard
          title="Platform MRR"
          value="₹8,90,000"
          change="+9.2%"
          isPositive={true}
          icon={<TrendingUp />}
        />
      </div>

      {/* 3. Filter Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="w-72">
          <FormField>
            <FormInput
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FormField>
        </div>
      </div>

      {/* 4. Pre-styled Table */}
      <TableShell
        footer={
          <span>
            Total: <strong className="font-semibold text-slate-700">{orgs.length}</strong> tenant organizations
          </span>
        }
      >
        <table className="master-table">
          <thead>
            <tr>
              <th className="w-24">Org ID</th>
              <th>Organization</th>
              <th>Owner Contact</th>
              <th>Subscription</th>
              <th>Events</th>
              <th>Platform Fees</th>
              <th>Status</th>
              <th className="text-right">Manage</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrgs.map((org) => (
              <tr key={org.id}>
                <td className="font-mono text-xs text-slate-400">{org.id}</td>
                <td className="font-semibold text-slate-800">{org.name}</td>
                <td className="text-slate-600">{org.ownerEmail}</td>
                <td className="font-mono text-xs font-semibold text-brand-600">
                  {org.plan}
                </td>
                <td className="font-mono text-xs">{org.eventsHosted}</td>
                <td className="font-mono font-semibold text-slate-900 price-display">
                  {org.platformFeeEarned}
                </td>
                <td>
                  <StatusBadge status={org.status} />
                </td>
                <td className="text-right">
                  <ActionButton size="sm" variant="ghost">
                    Audit
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
