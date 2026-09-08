const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendSuccess } = require('../../shared/utils/apiResponse');
const venueService = require('./venue.service');

// =========================================================================
// 1. VENUE MASTER CONTROLLERS
// =========================================================================

const createVenue = asyncHandler(async (req, res) => {
  const venue = await venueService.createVenue(req.organizationId, req.user.id, req.body);
  return sendSuccess(res, 201, 'Venue created successfully', venue);
});

const getVenues = asyncHandler(async (req, res) => {
  const { venues, pagination } = await venueService.getVenues(req.organizationId, req.query);
  return sendSuccess(res, 200, 'Venues retrieved successfully', venues, pagination);
});

const getVenueById = asyncHandler(async (req, res) => {
  const venue = await venueService.getVenueById(req.organizationId, req.params.id);
  return sendSuccess(res, 200, 'Venue retrieved successfully', venue);
});

const updateVenue = asyncHandler(async (req, res) => {
  const venue = await venueService.updateVenue(req.organizationId, req.params.id, req.body);
  return sendSuccess(res, 200, 'Venue updated successfully', venue);
});

const setVenueStatus = asyncHandler(async (req, res) => {
  const venue = await venueService.setVenueStatus(req.organizationId, req.params.id, req.body.status);
  return sendSuccess(res, 200, 'Venue status updated successfully', venue);
});

const deleteVenue = asyncHandler(async (req, res) => {
  const venue = await venueService.softDeleteVenue(req.organizationId, req.params.id);
  return sendSuccess(res, 200, 'Venue archived successfully', venue);
});

// =========================================================================
// 2. PER-EVENT COMMERCIAL DEALS / CONTRACTS
// =========================================================================

const createContract = asyncHandler(async (req, res) => {
  const contract = await venueService.createVenueContract(
    req.organizationId,
    req.params.id,
    req.user,
    req.body
  );
  return sendSuccess(res, 201, 'Event deal finalized successfully', contract);
});

const getContracts = asyncHandler(async (req, res) => {
  const { venue, contracts, pagination } = await venueService.getVenueContracts(
    req.organizationId,
    req.params.id,
    req.query
  );
  return sendSuccess(res, 200, 'Historical venue deals retrieved successfully', { venue, contracts }, pagination);
});

const getContractById = asyncHandler(async (req, res) => {
  const contract = await venueService.getVenueContractById(
    req.organizationId,
    req.params.id,
    req.params.contractId
  );
  return sendSuccess(res, 200, 'Venue contract details retrieved successfully', contract);
});

const updateContract = asyncHandler(async (req, res) => {
  const contract = await venueService.updateVenueContract(
    req.organizationId,
    req.params.id,
    req.params.contractId,
    req.body
  );
  return sendSuccess(res, 200, 'Venue contract updated successfully', contract);
});

const recordPayment = asyncHandler(async (req, res) => {
  const contract = await venueService.recordContractPayment(
    req.organizationId,
    req.params.id,
    req.params.contractId,
    req.body
  );
  return sendSuccess(res, 200, 'Payment recorded successfully', contract);
});

// =========================================================================
// 3. SEATING LAYOUT & VISUAL SEAT ENGINE
// =========================================================================

const createLayout = asyncHandler(async (req, res) => {
  const layout = await venueService.createSeatingLayout(
    req.organizationId,
    req.params.id,
    req.body
  );
  return sendSuccess(res, 201, 'Seating layout created successfully', layout);
});

const getLayouts = asyncHandler(async (req, res) => {
  const layouts = await venueService.getVenueLayouts(
    req.organizationId,
    req.params.id
  );
  return sendSuccess(res, 200, 'Venue seating layouts retrieved successfully', layouts);
});

const batchCreateSeats = asyncHandler(async (req, res) => {
  const result = await venueService.batchCreateSeats(
    req.organizationId,
    req.params.id,
    req.params.layoutId,
    req.body.seats
  );
  return sendSuccess(res, 201, 'Seats batch created successfully', result);
});

const getLayoutSeats = asyncHandler(async (req, res) => {
  const result = await venueService.getLayoutSeats(
    req.organizationId,
    req.params.id,
    req.params.layoutId
  );
  return sendSuccess(res, 200, 'Seat map retrieved successfully', result);
});

module.exports = {
  createVenue,
  getVenues,
  getVenueById,
  updateVenue,
  setVenueStatus,
  deleteVenue,
  createContract,
  getContracts,
  getContractById,
  updateContract,
  recordPayment,
  createLayout,
  getLayouts,
  batchCreateSeats,
  getLayoutSeats,
};
