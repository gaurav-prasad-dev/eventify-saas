import { apiClient } from '../../../shared/api/apiClient';

export const marketplaceEventsApi = {
  /**
   * Fetch published events for marketplace visitors
   * @param {Object} params - { search, category, city, page, limit }
   */
  getPublishedEvents: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/public/events?${query}` : '/public/events';
    const res = await apiClient.get(endpoint);
    return res.data;
  },

  /**
   * Fetch full details for a single published event by ID or slug
   * @param {string} idOrSlug
   */
  getEventDetails: async (idOrSlug) => {
    const res = await apiClient.get(`/public/events/${idOrSlug}`);
    return res.data;
  },
};
