const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendSuccess } = require('../../shared/utils/apiResponse');
const eventService = require('./event.service');

// =========================================================================
// 1. EVENT MASTER CONTROLLERS
// =========================================================================

const createEvent = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.organizationId, req.user.id, req.body);
  return sendSuccess(res, 201, 'Event created successfully', event);
});

const getEvents = asyncHandler(async (req, res) => {
  const { events, pagination } = await eventService.getEvents(req.organizationId, req.query);
  return sendSuccess(res, 200, 'Events retrieved successfully', events, pagination);
});

const getEventById = asyncHandler(async (req, res) => {
  const event = await eventService.getEventById(req.organizationId, req.params.id);
  return sendSuccess(res, 200, 'Event retrieved successfully', event);
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await eventService.updateEvent(req.organizationId, req.params.id, req.body);
  return sendSuccess(res, 200, 'Event updated successfully', event);
});

const uploadMedia = asyncHandler(async (req, res) => {
  const media = await eventService.uploadEventMedia(
    req.organizationId,
    req.params.id,
    req.files,
    req.body
  );
  return sendSuccess(res, 200, 'Event media uploaded successfully', media);
});

const publishEvent = asyncHandler(async (req, res) => {
  const event = await eventService.publishEvent(req.organizationId, req.params.id);
  return sendSuccess(res, 200, 'Event published successfully', event);
});

const cancelEvent = asyncHandler(async (req, res) => {
  const event = await eventService.cancelEvent(req.organizationId, req.params.id);
  return sendSuccess(res, 200, 'Event cancelled successfully', event);
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await eventService.softDeleteEvent(req.organizationId, req.params.id);
  return sendSuccess(res, 200, 'Event archived successfully', event);
});

// =========================================================================
// 2. EVENT SESSIONS / SHOWTIMES
// =========================================================================

const addSession = asyncHandler(async (req, res) => {
  const session = await eventService.addEventSession(req.organizationId, req.params.id, req.body);
  return sendSuccess(res, 201, 'Event session added successfully', session);
});

const getSessions = asyncHandler(async (req, res) => {
  const sessions = await eventService.getEventSessions(req.organizationId, req.params.id);
  return sendSuccess(res, 200, 'Event sessions retrieved successfully', sessions);
});

const updateSession = asyncHandler(async (req, res) => {
  const session = await eventService.updateEventSession(
    req.organizationId,
    req.params.id,
    req.params.sessionId,
    req.body
  );
  return sendSuccess(res, 200, 'Event session updated successfully', session);
});

const deleteSession = asyncHandler(async (req, res) => {
  const result = await eventService.deleteEventSession(
    req.organizationId,
    req.params.id,
    req.params.sessionId
  );
  return sendSuccess(res, 200, 'Event session deleted successfully', result);
});

// =========================================================================
// 3. SEAT & TICKET PRICING TIERS
// =========================================================================

const addTier = asyncHandler(async (req, res) => {
  const tier = await eventService.addTicketTier(req.organizationId, req.params.id, req.body);
  return sendSuccess(res, 201, 'Ticket tier added successfully', tier);
});

const getTiers = asyncHandler(async (req, res) => {
  const tiers = await eventService.getTicketTiers(req.organizationId, req.params.id);
  return sendSuccess(res, 200, 'Ticket tiers retrieved successfully', tiers);
});

const updateTier = asyncHandler(async (req, res) => {
  const tier = await eventService.updateTicketTier(
    req.organizationId,
    req.params.id,
    req.params.tierId,
    req.body
  );
  return sendSuccess(res, 200, 'Ticket tier updated successfully', tier);
});

const deleteTier = asyncHandler(async (req, res) => {
  const result = await eventService.deleteTicketTier(
    req.organizationId,
    req.params.id,
    req.params.tierId
  );
  return sendSuccess(res, 200, 'Ticket tier deleted successfully', result);
});

const getPublicEvents = asyncHandler(async (req, res) => {
  const result = await eventService.getPublicEvents(req.query);
  sendSuccess(res, 200, 'Published events retrieved successfully', result);
});

const getPublicEventDetails = asyncHandler(async (req, res) => {
  const event = await eventService.getPublicEventBySlugOrId(req.params.idOrSlug);
  sendSuccess(res, 200, 'Event details retrieved successfully', { event });
});

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  uploadMedia,
  publishEvent,
  cancelEvent,
  deleteEvent,
  addSession,
  getSessions,
  updateSession,
  deleteSession,
  addTier,
  getTiers,
  updateTier,
  deleteTier,
  getPublicEvents,
  getPublicEventDetails,
};
