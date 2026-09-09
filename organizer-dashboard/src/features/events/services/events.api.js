import { apiClient } from '../../../shared/api/apiClient';

export const eventsApi = {
  /**
   * List organization events with optional filters
   */
  getEvents: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/events?${query}` : '/events';
    const res = await apiClient.get(endpoint);
    const events = Array.isArray(res.data) ? res.data : (res.data?.events || []);
    return {
      events,
      pagination: res.pagination,
      data: events,
    };
  },

  /**
   * Get single event with venue, sessions, and ticket tiers
   */
  getEventById: async (eventId) => {
    const res = await apiClient.get(`/events/${eventId}`);
    return res.data;
  },

  /**
   * Create new event
   */
  createEvent: async (data) => {
    const res = await apiClient.post('/events', data);
    return res.data;
  },

  /**
   * Update existing event
   */
  updateEvent: async (eventId, data) => {
    const res = await apiClient.patch(`/events/${eventId}`, data);
    return res.data;
  },

  /**
   * Upload event media (banner, thumbnail, gallery) via Cloudinary
   */
  uploadMedia: async (eventId, formData) => {
    const res = await apiClient.upload(`/events/${eventId}/images`, formData);
    return res.data;
  },

  /**
   * Add a session / showtime to an event
   */
  addSession: async (eventId, data) => {
    const res = await apiClient.post(`/events/${eventId}/sessions`, data);
    return res.data;
  },

  /**
   * Add a ticket pricing tier to an event
   */
  addTier: async (eventId, data) => {
    const res = await apiClient.post(`/events/${eventId}/tiers`, data);
    return res.data;
  },

  /**
   * Publish an event to the marketplace
   */
  publishEvent: async (eventId) => {
    const res = await apiClient.patch(`/events/${eventId}/publish`, {});
    return res.data;
  },

  /**
   * Cancel an event
   */
  cancelEvent: async (eventId) => {
    const res = await apiClient.patch(`/events/${eventId}/cancel`, {});
    return res.data;
  },

  /**
   * Delete / archive an event
   */
  deleteEvent: async (eventId) => {
    const res = await apiClient.delete(`/events/${eventId}`);
    return res.data;
  },
};
