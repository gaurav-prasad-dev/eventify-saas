Event Booking SaaS — V1 API Design

1. API Design Approach

For every feature, decide:

What the user can do

API endpoint

HTTP method

Access/role

Request data

Response data

Base URL: /api/v1

2. Authentication

Method

Endpoint

Purpose

POST

/auth/customer/register

Customer registration

POST

/auth/staff/register

Staff registration via invitation

GET

/auth/customer/google

Start Google OAuth

GET

/auth/customer/google/callback

OAuth callback

POST

/auth/login

Login

POST

/auth/refresh

Refresh access token

POST

/auth/logout

Logout

GET

/auth/me

Current user

POST

/auth/forgot-password

Send reset email

POST

/auth/reset-password

Reset password

POST

/auth/change-password

Change password

POST

/auth/send-verification-otp

Send verification OTP

POST

/auth/verify-email

Verify email

POST

/auth/resend-verification-otp

Resend OTP

3. Customer Profile

Method

Endpoint

Purpose

GET

/profile

Get my profile

PATCH

/profile

Update my profile

4. Organizations

Super Admin

POST /organizations — Create

GET /organizations — List

GET /organizations/:organizationId — Get

PATCH /organizations/:organizationId — Update

PATCH /organizations/:organizationId/status — Change status

Organization Admin

GET /organizations/me — Get organization

PATCH /organizations/me — Update organization

5. Venues & Sections

Venue

POST /venues — Create

GET /venues — List

GET /venues/:venueId — Get

PATCH /venues/:venueId — Update

PATCH /venues/:venueId/status — Change status

Venue Section

POST /venues/:venueId/sections — Create

GET /venues/:venueId/sections — List

GET /venues/:venueId/sections/:sectionId — Get

PATCH /venues/:venueId/sections/:sectionId — Update

PATCH /venues/:venueId/sections/:sectionId/status — Change status

6. Events

POST /events — Create event

GET /events — Organization events

GET /events/:eventId — Get event

PATCH /events/:eventId — Update

PATCH /events/:eventId/status — Change status

Event Sections / Capacity

POST /events/:eventId/sections — Assign venue section capacity

GET /events/:eventId/sections — Get assigned sections

PATCH /events/:eventId/sections/:eventSectionId — Update capacity

Sessions

POST /events/:eventId/sessions — Create

GET /events/:eventId/sessions — List

GET /events/:eventId/sessions/:sessionId — Get

PATCH /events/:eventId/sessions/:sessionId — Update

PATCH /events/:eventId/sessions/:sessionId/status — Change status

Ticket Types

POST /events/:eventId/ticket-types — Create

GET /events/:eventId/ticket-types — List

GET /events/:eventId/ticket-types/:ticketTypeId — Get

PATCH /events/:eventId/ticket-types/:ticketTypeId — Update

PATCH /events/:eventId/ticket-types/:ticketTypeId/status — Change status

Event Media

POST /events/:eventId/media — Upload

GET /events/:eventId/media — List

PATCH /events/:eventId/media/:mediaId — Update/order

DELETE /events/:eventId/media/:mediaId — Delete

Reviews

POST /events/:eventId/reviews — Create

GET /events/:eventId/reviews — List

PATCH /events/:eventId/reviews/:reviewId — Update my review

DELETE /events/:eventId/reviews/:reviewId — Delete my review

7. Public Event Discovery

GET /public/events — Browse, search, filter published events

GET /public/events/:eventId — Event details

GET /public/events/:eventId/sessions — Sessions

GET /public/events/:eventId/ticket-types — Ticket types

Supported filters include:
search, category, city, startDate, endDate, minPrice, maxPrice, page, limit

Example:
/public/events?search=music&city=Indore&page=1&limit=20

8. Booking & Capacity Locking

POST /bookings/lock — Temporarily lock ticket capacity

POST /bookings — Create pending booking

GET /bookings — My bookings

GET /bookings/:bookingId — Booking details

POST /bookings/:bookingId/cancel — Cancel booking

Important flow:
Select tickets → Lock capacity → Create booking → Payment → Confirm booking

9. Payments & Refunds

Payments

POST /payments/create-order — Create payment order

POST /payments/verify — Verify customer payment

POST /webhooks/razorpay — Razorpay webhook

Refund

GET /bookings/:bookingId/refund — Refund status/details

Refund flow:
Customer cancels → Check cancellation policy → Calculate refund → Razorpay refund → Update refund status

10. Tickets & Check-in

Tickets

GET /bookings/:bookingId/tickets — Booking tickets

GET /tickets — My tickets

GET /tickets/:ticketId — Ticket + QR code

Check-in

POST /tickets/validate — Validate individual QR

POST /bookings/:bookingId/validate — Validate group QR

GET /events/:eventId/check-ins — Event check-ins

/tickets/validate is shared by ticket validation and check-in.

11. Staff Assignment

POST /events/:eventId/staff — Assign staff

GET /events/:eventId/staff — Assigned staff

DELETE /events/:eventId/staff/:staffId — Remove staff

GET /staff/events — My assigned events

12. Subscriptions

GET /subscription-plans — Available plans

GET /organizations/:organizationId/subscription — Current subscription

POST /organizations/:organizationId/subscription — Start subscription

PATCH /organizations/:organizationId/subscription — Change/upgrade plan

POST /organizations/:organizationId/subscription/cancel — Cancel

POST /subscription-payments/create-order — Create payment order

13. Notifications

GET /notifications — My notifications

PATCH /notifications/:notificationId/read — Mark one read

PATCH /notifications/read-all — Mark all read

Automatic notifications are triggered for:

Registration / email verification

Staff invitation

Booking confirmation

Payment receipt

Booking cancellation

Refund completion

Event reminder

14. Role Responsibilities

Customer

Authenticate → Browse events → Select session/tickets → Lock capacity → Book → Pay → Receive tickets + QR

Organization Admin

Manage organization → Venues/sections → Events → Capacity → Sessions → Ticket types → Media → Staff → Subscription

Staff

View assigned events → Scan QR → Check in customers

Super Admin

Create/manage organizations → Manage organization status

15. V1 Business Scope

Included: Authentication, organizations, venues, events, sessions, ticket types, public discovery, capacity locking, bookings, payments, tickets, QR validation, check-in, cancellation/refunds, reviews, media, staff, subscriptions, notifications.

Later: Organization dashboard, Super Admin dashboard, analytics, advanced category management, promo codes/discounts.

16. Core Business Flow

Authentication
→ Organization
→ Venue
→ Event
→ Sessions + Ticket Types
→ Public Event Discovery
→ Capacity Lock
→ Booking
→ Payment
→ Ticket Generation
→ QR Validation + Check-in
→ Cancellation + Refund