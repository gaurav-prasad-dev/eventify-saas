import React, { useState, useEffect } from 'react';
import {
  FormField,
  FormInput,
  ActionButton,
  StatusBadge,
  useToast,
} from '@eventify/ui';
import { venuesApi } from '../services/venues.api';
import {
  X,
  Plus,
  FileText,
  DollarSign,
  Calendar,
  Users,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';

export const VenueDealsModal = ({ isOpen, onClose, venue }) => {
  const { toast } = useToast();
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Payment Recording state
  const [selectedDealForPay, setSelectedDealForPay] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [isRecordingPay, setIsRecordingPay] = useState(false);

  const [dealForm, setDealForm] = useState({
    dealTitle: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    allocatedCapacity: venue?.capacity || 500,
    rentalAmount: '50000',
    securityDeposit: '10000',
    cleaningFee: '2000',
    notes: 'Includes main stage and air conditioning.',
  });

  const loadContracts = async () => {
    if (!venue?.id) return;
    setIsLoading(true);
    try {
      const data = await venuesApi.getVenueContracts(venue.id);
      setDeals(data.contracts || []);
    } catch (err) {
      toast.error('Failed to load venue contracts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && venue?.id) {
      loadContracts();
      setShowAddForm(false);
      setSelectedDealForPay(null);
    }
  }, [isOpen, venue?.id]);

  if (!isOpen || !venue) return null;

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    if (!dealForm.dealTitle.trim()) {
      setError('Please provide a deal title');
      return;
    }

    const start = new Date(dealForm.startDate);
    const end = new Date(dealForm.endDate);
    const diffTime = Math.abs(end - start);
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        dealTitle: dealForm.dealTitle.trim(),
        startDate: new Date(dealForm.startDate).toISOString(),
        endDate: new Date(dealForm.endDate).toISOString(),
        totalDays,
        allocatedCapacity: Number(dealForm.allocatedCapacity) || venue.capacity,
        rentalAmount: Number(dealForm.rentalAmount) || 0,
        securityDeposit: Number(dealForm.securityDeposit) || 0,
        cleaningFee: Number(dealForm.cleaningFee) || 0,
        notes: dealForm.notes,
      };

      await venuesApi.createVenueContract(venue.id, payload);
      toast.success('Commercial deal recorded successfully!');
      setShowAddForm(false);
      setDealForm({
        dealTitle: '',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
        allocatedCapacity: venue.capacity,
        rentalAmount: '50000',
        securityDeposit: '10000',
        cleaningFee: '2000',
        notes: '',
      });
      loadContracts();
    } catch (err) {
      setError(err.message || 'Failed to record deal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async (contractId) => {
    if (!payAmount || Number(payAmount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    setIsRecordingPay(true);
    try {
      await venuesApi.recordPayment(venue.id, contractId, {
        amount: Number(payAmount),
        paymentStatus: 'PARTIALLY_PAID',
      });
      toast.success('Payment recorded successfully!');
      setSelectedDealForPay(null);
      setPayAmount('');
      loadContracts();
    } catch (err) {
      toast.error(err.message || 'Failed to record payment');
    } finally {
      setIsRecordingPay(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden card-side-shadow flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Commercial Deals & Contracts
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Venue: <strong className="text-slate-800 dark:text-zinc-200">{venue.name}</strong> • {venue.city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!showAddForm && (
              <ActionButton
                size="sm"
                variant="primary"
                icon={<Plus />}
                onClick={() => setShowAddForm(true)}
              >
                New Deal
              </ActionButton>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ADD DEAL FORM */}
          {showAddForm ? (
            <form onSubmit={handleCreateDeal} className="space-y-4 p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  Create Commercial Rental Deal
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
                >
                  Cancel
                </button>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-400">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <FormField label="Deal / Contract Title" required>
                    <FormInput
                      placeholder="e.g. Annual Tech Conference 2026 Lease"
                      value={dealForm.dealTitle}
                      onChange={(e) => setDealForm({ ...dealForm, dealTitle: e.target.value })}
                      required
                    />
                  </FormField>
                </div>

                <div>
                  <FormField label="Lease Start Date" required>
                    <FormInput
                      type="date"
                      value={dealForm.startDate}
                      onChange={(e) => setDealForm({ ...dealForm, startDate: e.target.value })}
                      required
                    />
                  </FormField>
                </div>

                <div>
                  <FormField label="Lease End Date" required>
                    <FormInput
                      type="date"
                      value={dealForm.endDate}
                      onChange={(e) => setDealForm({ ...dealForm, endDate: e.target.value })}
                      required
                    />
                  </FormField>
                </div>

                <div>
                  <FormField label="Allocated Capacity" required>
                    <FormInput
                      type="number"
                      value={dealForm.allocatedCapacity}
                      onChange={(e) => setDealForm({ ...dealForm, allocatedCapacity: e.target.value })}
                      required
                    />
                  </FormField>
                </div>

                <div>
                  <FormField label="Rental Amount (₹)" required>
                    <FormInput
                      type="number"
                      placeholder="50000"
                      value={dealForm.rentalAmount}
                      onChange={(e) => setDealForm({ ...dealForm, rentalAmount: e.target.value })}
                      required
                    />
                  </FormField>
                </div>

                <div>
                  <FormField label="Security Deposit (₹)">
                    <FormInput
                      type="number"
                      placeholder="10000"
                      value={dealForm.securityDeposit}
                      onChange={(e) => setDealForm({ ...dealForm, securityDeposit: e.target.value })}
                    />
                  </FormField>
                </div>

                <div>
                  <FormField label="Cleaning / Other Fee (₹)">
                    <FormInput
                      type="number"
                      placeholder="2000"
                      value={dealForm.cleaningFee}
                      onChange={(e) => setDealForm({ ...dealForm, cleaningFee: e.target.value })}
                    />
                  </FormField>
                </div>

                <div className="sm:col-span-2">
                  <FormField label="Deal Terms & Special Conditions">
                    <FormInput
                      placeholder="e.g. 50% advance before move-in, AC setup included"
                      value={dealForm.notes}
                      onChange={(e) => setDealForm({ ...dealForm, notes: e.target.value })}
                    />
                  </FormField>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <ActionButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </ActionButton>
                <ActionButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                >
                  Save Deal
                </ActionButton>
              </div>
            </form>
          ) : null}

          {/* DEALS LIST */}
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-zinc-600" />
              <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                No commercial deals recorded yet
              </p>
              <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm mx-auto">
                Record a commercial rental agreement with this venue to track capacity, costs, and link it with an event.
              </p>
              {!showAddForm && (
                <ActionButton
                  variant="outline"
                  size="sm"
                  icon={<Plus />}
                  onClick={() => setShowAddForm(true)}
                >
                  Create First Deal
                </ActionButton>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {deals.map((deal) => (
                <div
                  key={deal.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {deal.dealTitle}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-zinc-500">
                        ID: {deal.id.slice(0, 8)}... • {deal.totalDays} Days Lease
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        deal.paymentStatus === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : deal.paymentStatus === 'PARTIALLY_PAID'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {deal.paymentStatus}
                      </span>
                      <StatusBadge status={deal.contractStatus} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Capacity</span>
                      <strong className="text-slate-800 dark:text-zinc-200">{deal.allocatedCapacity} seats</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Cost</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono">₹{deal.totalCost}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Paid</span>
                      <strong className="text-slate-700 dark:text-zinc-300 font-mono">₹{deal.paidAmount}</strong>
                    </div>

                    <div className="flex items-center justify-end">
                      {selectedDealForPay?.id === deal.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            placeholder="Amount"
                            className="w-20 px-2 py-1 text-xs rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                          />
                          <button
                            onClick={() => handleRecordPayment(deal.id)}
                            disabled={isRecordingPay}
                            className="px-2 py-1 text-xs font-bold rounded bg-emerald-600 text-white hover:bg-emerald-500"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setSelectedDealForPay(null)}
                            className="text-xs text-slate-400 hover:text-slate-600"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <ActionButton
                          size="sm"
                          variant="ghost"
                          icon={<CreditCard />}
                          onClick={() => {
                            setSelectedDealForPay(deal);
                            setPayAmount('');
                          }}
                        >
                          Record Pay
                        </ActionButton>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/70 dark:bg-zinc-900/70 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
          <ActionButton variant="outline" size="sm" onClick={onClose}>
            Close
          </ActionButton>
        </div>
      </div>
    </div>
  );
};
