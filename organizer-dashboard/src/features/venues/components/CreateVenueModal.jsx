import React, { useState } from 'react';
import {
  FormField,
  FormInput,
  ActionButton,
  useToast,
} from '@eventify/ui';
import { venuesApi } from '../services/venues.api';
import { X, MapPin, Building, Phone, Mail, User, Users } from 'lucide-react';

export const CreateVenueModal = ({ isOpen, onClose, onCreated }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const initialFormData = {
    name: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    capacity: 500,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    facilities: 'Air Conditioning, Parking, Sound System, WiFi',
    rules: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setError('');
    setFormData(initialFormData);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim() || !formData.city.trim()) {
      setError('Please fill in Venue Name, Address, and City.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim() || undefined,
        country: formData.country.trim() || 'India',
        postalCode: formData.postalCode.trim() || undefined,
        capacity: Number(formData.capacity) || 100,
        contactName: formData.contactName.trim() || undefined,
        contactEmail: formData.contactEmail.trim() || undefined,
        contactPhone: formData.contactPhone.trim() || undefined,
        facilities: formData.facilities
          ? formData.facilities.split(',').map((f) => f.trim()).filter(Boolean)
          : [],
        rules: formData.rules.trim() || undefined,
      };

      const res = await venuesApi.createVenue(payload);
      toast.success('Venue created successfully!');
      setError('');
      setFormData(initialFormData);
      onCreated?.(res.venue || res.data || res);
      onClose();
    } catch (err) {
      const fieldErrors = err.data?.errors
        ?.map((item) => `${item.field ? `${item.field}: ` : ''}${item.message}`)
        .join(', ');
      setError(fieldErrors || err.message || 'Failed to create venue. Please check the fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden card-side-shadow flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Register New Venue
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Create a physical venue master profile for hosting your events
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="create-venue-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-lg text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <FormField label="Venue Name" required>
                <FormInput
                  placeholder="e.g. Grand Convention Hall"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </FormField>
            </div>

            <div className="sm:col-span-2">
              <FormField label="Street Address" required>
                <FormInput
                  placeholder="e.g. Plot 42, Bandra Kurla Complex"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  required
                />
              </FormField>
            </div>

            <div>
              <FormField label="City" required>
                <FormInput
                  placeholder="e.g. Mumbai"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  required
                />
              </FormField>
            </div>

            <div>
              <FormField label="State">
                <FormInput
                  placeholder="e.g. Maharashtra"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                />
              </FormField>
            </div>

            <div>
              <FormField label="Total Capacity" required hint="Max attendee capacity">
                <FormInput
                  type="number"
                  placeholder="500"
                  value={formData.capacity}
                  onChange={(e) => handleChange('capacity', e.target.value)}
                  required
                />
              </FormField>
            </div>

            <div>
              <FormField label="Postal Code">
                <FormInput
                  placeholder="e.g. 400051"
                  value={formData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                />
              </FormField>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">
              Venue Contact & Facilities
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <FormField label="Contact Person">
                  <FormInput
                    placeholder="Manager Name"
                    value={formData.contactName}
                    onChange={(e) => handleChange('contactName', e.target.value)}
                  />
                </FormField>
              </div>

              <div>
                <FormField label="Contact Email">
                  <FormInput
                    type="email"
                    placeholder="manager@venue.com"
                    value={formData.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                  />
                </FormField>
              </div>

              <div>
                <FormField label="Contact Phone">
                  <FormInput
                    placeholder="+91 9876543210"
                    value={formData.contactPhone}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                  />
                </FormField>
              </div>
            </div>

            <div className="mt-3">
              <FormField
                label="Facilities (comma separated)"
                hint="e.g. Parking, AC, Stage, Sound System, WiFi"
              >
                <FormInput
                  placeholder="AC, Parking, Sound System, WiFi"
                  value={formData.facilities}
                  onChange={(e) => handleChange('facilities', e.target.value)}
                />
              </FormField>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50/70 dark:bg-zinc-900/70 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-3">
          <ActionButton
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </ActionButton>
          <ActionButton
            form="create-venue-form"
            type="submit"
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Create Venue
          </ActionButton>
        </div>
      </div>
    </div>
  );
};
