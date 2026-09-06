# Event Booking SaaS – Final API Request & Response Summary

## Standard Response Format

### Success

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

---

# 1. Authentication

### POST `/auth/customer/register`

**Request:** name, email, password
**Response:** userId, email, verification status
**Status:** `201`, `400`, `409`

### POST `/auth/staff/register`

**Request:** invitationToken, name, email, password
**Response:** staff user details
**Status:** `201`, `400`, `401`, `409`

### GET `/auth/customer/google`

**Request:** No body
**Response:** Redirect to Google OAuth

### GET `/auth/customer/google/callback`

**Request:** OAuth authorization data
**Response:** access token, refresh token, user data

### POST `/auth/login`

**Request:** email, password
**Response:** access token, refresh token, user details
**Status:** `200`, `400`, `401`

### POST `/auth/refresh`

**Request:** refresh token (usually cookie)
**Response:** new access token
**Status:** `200`, `401`

### POST `/auth/logout`

**Request:** refresh token/cookie
**Response:** logout confirmation
**Status:** `200`

### GET `/auth/me`

**Request:** access token
**Response:** current user details
**Status:** `200`, `401`

### POST `/auth/forgot-password`

**Request:** email
**Response:** reset OTP/email confirmation
**Status:** `200`

### POST `/auth/reset-password`

**Request:** email, OTP/token, newPassword
**Response:** password reset confirmation
**Status:** `200`, `400`

### POST `/auth/change-password`

**Request:** currentPassword, newPassword
**Response:** password changed confirmation
**Status:** `200`, `401`

### POST `/auth/send-verification-otp`

**Request:** email
**Response:** OTP sent confirmation

### POST `/auth/verify-email`

**Request:** email, OTP
**Response:** email verification confirmation

### POST `/auth/resend-verification-otp`

**Request:** email
**Response:** new OTP sent confirmation

---

# 2. Customer Profile

### GET `/profile`

**Request:** Access token
**Response:** customer profile

### PATCH `/profile`

**Request:** name, phone, profile details
**Response:** updated profile

---

# 3. Organizations

### POST `/organizations`

**Request:** organization details
**Response:** created organization
**Access:** Super Admin

### GET `/organizations`

**Request:** page, limit, search (query parameters)
**Response:** organization list

### GET `/organizations/:organizationId`

**Request:** organizationId
**Response:** organization details

### GET `/organizations/me`

**Request:** access token
**Response:** current user's organization

### PATCH `/organizations/:organizationId`

**Request:** organization fields to update
**Response:** updated organization

### PATCH `/organizations/me`

**Request:** organization fields to update
**Response:** updated organization

### PATCH `/organizations/:organizationId/status`

**Request:** status
**Response:** updated organization status

---

# 4. Venues

### POST `/venues`

**Request:** venue name, location, maximumCapacity
**Response:** created venue

### GET `/venues`

**Request:** page, limit, search
**Response:** venue list

### GET `/venues/:venueId`

**Request:** venueId
**Response:** venue details

### PATCH `/venues/:venueId`

**Request:** updated venue fields
**Response:** updated venue

### PATCH `/venues/:venueId/status`

**Request:** status
**Response:** updated status

---

# 5. Venue Sections

### POST `/venues/:venueId/sections`

**Request:** section name, maximumCapacity
**Response:** created section

### GET `/venues/:venueId/sections`

**Request:** venueId
**Response:** section list

### GET `/venues/:venueId/sections/:sectionId`

**Request:** venueId, sectionId
**Response:** section details

### PATCH `/venues/:venueId/sections/:sectionId`

**Request:** updated section details
**Response:** updated section

### PATCH `/venues/:venueId/sections/:sectionId/status`

**Request:** status
**Response:** updated status

---

# 6. Events

### POST `/events`

**Request:** event details, venueId, dates, description
**Response:** created event

### GET `/events`

**Request:** page, limit, status
**Response:** organization event list

### GET `/events/:eventId`

**Request:** eventId
**Response:** event details

### PATCH `/events/:eventId`

**Request:** fields to update
**Response:** updated event

### PATCH `/events/:eventId/status`

**Request:** status
**Response:** updated event status

---

# 7. Event Sections / Capacity

### POST `/events/:eventId/sections`

**Request:** venueSectionId, assignedCapacity
**Response:** created event section

### GET `/events/:eventId/sections`

**Request:** eventId
**Response:** assigned sections and capacities

### PATCH `/events/:eventId/sections/:eventSectionId`

**Request:** assignedCapacity
**Response:** updated capacity

---

# 8. Event Sessions

### POST `/events/:eventId/sessions`

**Request:** session name, startDateTime, endDateTime
**Response:** created session

### GET `/events/:eventId/sessions`

**Request:** eventId
**Response:** session list

### GET `/events/:eventId/sessions/:sessionId`

**Request:** IDs
**Response:** session details

### PATCH `/events/:eventId/sessions/:sessionId`

**Request:** fields to update
**Response:** updated session

### PATCH `/events/:eventId/sessions/:sessionId/status`

**Request:** status
**Response:** updated status

---

# 9. Ticket Types

### POST `/events/:eventId/ticket-types`

**Request:** name, price, capacity/section assignment
**Response:** created ticket type

### GET `/events/:eventId/ticket-types`

**Response:** ticket type list

### GET `/events/:eventId/ticket-types/:ticketTypeId`

**Response:** ticket type details

### PATCH `/events/:eventId/ticket-types/:ticketTypeId`

**Request:** name, price, details
**Response:** updated ticket type

### PATCH `/events/:eventId/ticket-types/:ticketTypeId/status`

**Request:** status
**Response:** updated status

---

# 10. Public Events

### GET `/public/events`

**Query Parameters:**

* search
* category
* city
* startDate
* endDate
* minPrice
* maxPrice
* page
* limit

**Response:** published events list

### GET `/public/events/:eventId`

**Response:** complete public event details

### GET `/public/events/:eventId/sessions`

**Response:** available sessions

### GET `/public/events/:eventId/ticket-types`

**Response:** available ticket types

---

# 11. Booking

### POST `/bookings/lock`

**Request:** eventId, sessionId, ticketTypeId, quantity
**Response:** lockId, expiry time
**Status:** `200`, `400`, `409`

### POST `/bookings`

**Request:** lockId and booking details
**Response:** bookingId, booking status
**Status:** `201`

### GET `/bookings`

**Query:** page, limit, status
**Response:** customer's booking list

### GET `/bookings/:bookingId`

**Response:** complete booking details

### POST `/bookings/:bookingId/cancel`

**Request:** cancellation reason (optional)
**Response:** cancellation status, refund information

---

# 12. Payments

### POST `/payments/create-order`

**Request:** bookingId
**Response:** Razorpay orderId, amount, currency

### POST `/payments/verify`

**Request:** razorpayPaymentId, razorpayOrderId, signature
**Response:** payment status, booking status

### POST `/webhooks/razorpay`

**Request:** Razorpay webhook payload
**Response:** acknowledgement

---

# 13. Refund

### GET `/bookings/:bookingId/refund`

**Response:**

* refund status
* refund amount
* refund ID

---

# 14. Tickets

### GET `/bookings/:bookingId/tickets`

**Response:** all tickets belonging to booking

### GET `/tickets`

**Query:** page, limit, status
**Response:** logged-in customer's tickets

### GET `/tickets/:ticketId`

**Response:**

* ticket details
* ticket number
* event details
* QR code
* ticket status

### POST `/tickets/validate`

**Request:** QR data / ticket token
**Response:**

* valid or invalid
* ticket status
* check-in result

---

# 15. Staff Assignment

### POST `/events/:eventId/staff`

**Request:** staffId / staffIds
**Response:** assigned staff details

### GET `/events/:eventId/staff`

**Response:** assigned staff list

### DELETE `/events/:eventId/staff/:staffId`

**Response:** staff removal confirmation

### GET `/staff/events`

**Response:** events assigned to logged-in staff

---

# 16. Group QR & Check-ins

### POST `/bookings/:bookingId/validate`

**Request:** QR data
**Response:**

* validation result
* checked-in tickets
* remaining tickets

### GET `/events/:eventId/check-ins`

**Query:** page, limit, date
**Response:** check-in records

---

# 17. Reviews & Ratings

### POST `/events/:eventId/reviews`

**Request:** rating, review text
**Response:** created review

### GET `/events/:eventId/reviews`

**Query:** page, limit
**Response:** reviews and rating summary

### PATCH `/events/:eventId/reviews/:reviewId`

**Request:** rating and/or review text
**Response:** updated review

### DELETE `/events/:eventId/reviews/:reviewId`

**Response:** deletion confirmation

---

# 18. Event Media

### POST `/events/:eventId/media`

**Request:** image/file, mediaType
**Response:** uploaded media details and URL

### GET `/events/:eventId/media`

**Response:** event media list

### PATCH `/events/:eventId/media/:mediaId`

**Request:** mediaType, displayOrder
**Response:** updated media

### DELETE `/events/:eventId/media/:mediaId`

**Response:** deletion confirmation

---

# 19. Event Categories

### GET `/event-categories`

**Response:**

```text
Category ID
Category Name
```

---

# 20. SaaS Subscription

### GET `/subscription-plans`

**Response:** available subscription plans

### GET `/organizations/:organizationId/subscription`

**Response:**

* current plan
* status
* start date
* expiry date
* limits

### POST `/organizations/:organizationId/subscription`

**Request:** planId
**Response:** subscription details

### PATCH `/organizations/:organizationId/subscription`

**Request:** new planId
**Response:** updated subscription

### POST `/organizations/:organizationId/subscription/cancel`

**Response:** cancellation confirmation

### POST `/subscription-payments/create-order`

**Request:** subscriptionId
**Response:** Razorpay order details

---

# 21. Notifications

### GET `/notifications`

**Query:** page, limit, unreadOnly
**Response:** notification list

### PATCH `/notifications/:notificationId/read`

**Response:** notification marked as read

### PATCH `/notifications/read-all`

**Response:** all notifications marked as read

---

# Common Status Codes

| Status Code | Meaning              |
| ----------- | -------------------- |
| `200`       | Request successful   |
| `201`       | Resource created     |
| `400`       | Invalid request data |
| `401`       | Not authenticated    |
| `403`       | No permission        |
| `404`       | Resource not found   |
| `409`       | Conflict             |
| `500`       | Server error         |

---

# Short Final Summary

For every API, we will have:

```text
Endpoint
   ↓
Who can access it
   ↓
Request
├── Body
├── URL Parameters
└── Query Parameters
   ↓
Backend Processing
   ↓
Response
├── Success
├── Message
└── Data
   ↓
Error Response
   ↓
Status Code
```

## Example

```text
POST /bookings

Frontend
   ↓
Sends Request Data
   ↓
Backend Validates Data
   ↓
Creates Booking
   ↓
Returns

201 Created
+
Booking Data
```

# What We Have Completed

```text
1. Database Design
        ↓
2. API Endpoint Design
        ↓
3. Request & Response Summary
```

# Next Step

The next step should be to **review the complete database design and API design together**, checking:

```text
Database Table
      ↕
API Endpoint
      ↕
Request Data
      ↕
Response Data
```

This will help us find any missing tables, fields, or APIs before starting backend development.
