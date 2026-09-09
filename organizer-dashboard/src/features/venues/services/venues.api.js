import { apiClient } from '../../../shared/api/apiClient';

export const venuesApi = {
  /**
   * List all organization venues
   */
  getVenues: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/venues?${query}` : '/venues';
    const res = await apiClient.get(endpoint);
    const venues = Array.isArray(res.data) ? res.data : (res.data?.venues || []);
    return {
      venues,
      pagination: res.pagination,
      data: venues,
    };
  },

  /**
   * Get single venue with contracts and layouts
   */
  getVenueById: async (venueId) => {
    const res = await apiClient.get(`/venues/${venueId}`);
    return res.data;
  },

  /**
   * Create a new venue master record
   */
  createVenue: async (data) => {
    const res = await apiClient.post('/venues', data);
    return res.data;
  },

  /**
   * Update existing venue
   */
  updateVenue: async (venueId, data) => {
    const res = await apiClient.patch(`/venues/${venueId}`, data);
    return res.data;
  },

  /**
   * Toggle venue status (ACTIVE / INACTIVE)
   */
  toggleStatus: async (venueId, status) => {
    const res = await apiClient.patch(`/venues/${venueId}/status`, { status });
    return res.data;
  },

  /**
   * List commercial deals / contracts for a venue
   */
  getVenueContracts: async (venueId) => {
    const res = await apiClient.get(`/venues/${venueId}/contracts`);
    return res.data;
  },

  /**
   * Create a commercial deal with a venue
   */
  createVenueContract: async (venueId, data) => {
    const res = await apiClient.post(`/venues/${venueId}/contracts`, data);
    return res.data;
  },

  /**
   * Record payment for a venue contract
   */
  recordPayment: async (venueId, contractId, data) => {
    const res = await apiClient.patch(
      `/venues/${venueId}/contracts/${contractId}/payment`,
      data
    );
    return res.data;
  },
};
