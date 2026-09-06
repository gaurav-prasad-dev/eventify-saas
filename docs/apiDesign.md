Our API Design Learning Process

For every module, we will follow the same pattern:

1. Understand the feature
        ↓
2. Ask: What actions can the user perform?
        ↓
3. Convert actions into APIs
        ↓
4. Decide HTTP Method
        ↓
5. Design the Endpoint
        ↓
6. Decide who can access it
        ↓
7. Design Request data
        ↓
8. Design Response data


--------------------------------------------------------------------------------------------

🌱 Step 2: What does API Design mean?

Before writing backend code, we make a plan.

For every API, we decide:

1. What does this API do?

2. What URL will it use?

3. Which HTTP method will it use?
   GET / POST / PATCH / DELETE

4. Who can use this API?

5. What data will the frontend send?

6. What data will the backend return?

--------------------------------------------------------------------------------------------
📘 Event Booking SaaS – Final API Endpoint Design
Base URL
/api/v1
1. 🔐 Authentication APIs
Method	Endpoint	Purpose
POST	/auth/customer/register	Customer registration
POST	/auth/staff/register	Staff registration via invitation
GET	/auth/customer/google	Start Google OAuth
GET	/auth/customer/google/callback	Google OAuth callback
POST	/auth/login	Login for all users
POST	/auth/refresh	Generate new access token
POST	/auth/logout	Logout current user
GET	/auth/me	Get current logged-in user
POST	/auth/forgot-password	Send password reset email
POST	/auth/reset-password	Reset password
POST	/auth/change-password	Change password while logged in
POST	/auth/send-verification-otp	Send verification OTP
POST	/auth/verify-email	Verify email using OTP
POST	/auth/resend-verification-otp	Resend verification OTP
2. 👤 Customer Profile APIs
Method	Endpoint	Purpose
GET	/profile	Get my profile
PATCH	/profile	Update my profile
3. 🏢 Organization APIs
Method	Endpoint	Who
POST	/organizations	Super Admin
GET	/organizations	Super Admin
GET	/organizations/:organizationId	Super Admin
GET	/organizations/me	Organization Admin
PATCH	/organizations/:organizationId	Super Admin
PATCH	/organizations/me	Organization Admin
PATCH	/organizations/:organizationId/status	Super Admin
4. 🏟️ Venue APIs
Method	Endpoint	Purpose
POST	/venues	Create venue
GET	/venues	Get venues
GET	/venues/:venueId	Get venue
PATCH	/venues/:venueId	Update venue
PATCH	/venues/:venueId/status	Change venue status
5. 🎭 Venue Section APIs
Method	Endpoint	Purpose
POST	/venues/:venueId/sections	Create section
GET	/venues/:venueId/sections	Get venue sections
GET	/venues/:venueId/sections/:sectionId	Get one section
PATCH	/venues/:venueId/sections/:sectionId	Update section
PATCH	/venues/:venueId/sections/:sectionId/status	Change section status
6. 🎪 Event APIs
Method	Endpoint	Purpose
POST	/events	Create event
GET	/events	Get organization events
GET	/events/:eventId	Get one event
PATCH	/events/:eventId	Update event
PATCH	/events/:eventId/status	Change event status
7. 📊 Event Section / Capacity APIs
Method	Endpoint	Purpose
POST	/events/:eventId/sections	Assign venue section capacity
GET	/events/:eventId/sections	Get event sections
PATCH	/events/:eventId/sections/:eventSectionId	Update assigned capacity
8. 📅 Event Session APIs
Method	Endpoint	Purpose
POST	/events/:eventId/sessions	Create session
GET	/events/:eventId/sessions	Get all sessions
GET	/events/:eventId/sessions/:sessionId	Get one session
PATCH	/events/:eventId/sessions/:sessionId	Update session
PATCH	/events/:eventId/sessions/:sessionId/status	Change session status
9. 🎟️ Ticket Type APIs
Method	Endpoint	Purpose
POST	/events/:eventId/ticket-types	Create ticket type
GET	/events/:eventId/ticket-types	Get ticket types
GET	/events/:eventId/ticket-types/:ticketTypeId	Get one ticket type
PATCH	/events/:eventId/ticket-types/:ticketTypeId	Update ticket type
PATCH	/events/:eventId/ticket-types/:ticketTypeId/status	Change ticket type status
10. 🌍 Public Event APIs
Method	Endpoint	Purpose
GET	/public/events	Browse, search, and filter published events
GET	/public/events/:eventId	Get public event details
GET	/public/events/:eventId/sessions	Get event sessions
GET	/public/events/:eventId/ticket-types	Get ticket types
Search and filters use query parameters
/public/events?search=music
&category=concert
&city=Indore
&startDate=2026-10-01
&endDate=2026-10-30
&minPrice=500
&maxPrice=5000
&page=1
&limit=20
11. 🔒 Booking APIs
Method	Endpoint	Purpose
POST	/bookings/lock	Temporarily lock ticket capacity
POST	/bookings	Create pending booking
GET	/bookings	Get my bookings
GET	/bookings/:bookingId	Get booking details
POST	/bookings/:bookingId/cancel	Cancel booking
12. 💳 Payment APIs
Method	Endpoint	Who
POST	/payments/create-order	Customer frontend
POST	/payments/verify	Customer frontend
POST	/webhooks/razorpay	Razorpay
13. 💰 Refund APIs
Method	Endpoint	Purpose
GET	/bookings/:bookingId/refund	Get refund details and status

Refund processing happens internally:

Customer Cancels
       ↓
Check Cancellation Policy
       ↓
Calculate Refund
       ↓
Call Razorpay Refund API
       ↓
Update Refund Status
14. 🎫 Ticket APIs
Method	Endpoint	Purpose
GET	/bookings/:bookingId/tickets	Get tickets for a booking
GET	/tickets	Get all my tickets
GET	/tickets/:ticketId	Get ticket details + QR code
POST	/tickets/validate	Validate individual ticket QR
15. 👥 Staff Assignment APIs
Method	Endpoint	Purpose
POST	/events/:eventId/staff	Assign staff to event
GET	/events/:eventId/staff	Get assigned staff
DELETE	/events/:eventId/staff/:staffId	Remove staff from event
GET	/staff/events	Get my assigned events
16. 🚪 Check-in APIs
Method	Endpoint	Purpose
POST	/tickets/validate	Validate individual ticket
POST	/bookings/:bookingId/validate	Validate booking/group QR
GET	/events/:eventId/check-ins	View event check-ins

Note: /tickets/validate is listed in both Ticket and Check-in modules because it belongs to the ticket scanning/check-in functionality.

17. ⭐ Review & Rating APIs
Method	Endpoint	Purpose
POST	/events/:eventId/reviews	Create review
GET	/events/:eventId/reviews	Get event reviews
PATCH	/events/:eventId/reviews/:reviewId	Update my review
DELETE	/events/:eventId/reviews/:reviewId	Delete my review
18. 🖼️ Event Media APIs
Method	Endpoint	Purpose
POST	/events/:eventId/media	Upload event media
GET	/events/:eventId/media	Get event media
PATCH	/events/:eventId/media/:mediaId	Update media/order
DELETE	/events/:eventId/media/:mediaId	Delete media
19. 🏷️ Event Category APIs
Method	Endpoint	Purpose
GET	/event-categories	Get all event categories

For Version 1, category management can be handled later by Super Admin.

20. 💼 SaaS Subscription APIs
Method	Endpoint	Purpose
GET	/subscription-plans	Get available plans
GET	/organizations/:organizationId/subscription	Get current subscription
POST	/organizations/:organizationId/subscription	Start subscription
PATCH	/organizations/:organizationId/subscription	Upgrade/change plan
POST	/organizations/:organizationId/subscription/cancel	Cancel subscription
POST	/subscription-payments/create-order	Create subscription payment order
21. 🔔 Notification APIs
Method	Endpoint	Purpose
GET	/notifications	Get my notifications
PATCH	/notifications/:notificationId/read	Mark one as read
PATCH	/notifications/read-all	Mark all as read
Automatic notifications
User Registration
       ↓
Email Verification

Staff Invitation
       ↓
Invitation Email

Booking Confirmed
       ↓
Booking Confirmation

Payment Successful
       ↓
Payment Receipt

Booking Cancelled
       ↓
Cancellation Notification

Refund Completed
       ↓
Refund Notification

Event Coming Soon
       ↓
Event Reminder
🔄 Complete High-Level System Flow
CUSTOMER
   │
   ├── Authentication
   │
   ├── Browse Public Events
   │
   ├── Select Session
   │
   ├── Select Ticket Type
   │
   ├── Lock Capacity 🔒
   │
   ├── Create Booking
   │
   ├── Payment 💳
   │
   ├── Booking Confirmed ✅
   │
   └── Receive Individual Tickets + QR Codes 🎟️


ORGANIZATION ADMIN
   │
   ├── Manage Organization
   ├── Manage Venues
   ├── Manage Venue Sections
   ├── Create Events
   ├── Assign Capacity
   ├── Create Sessions
   ├── Create Ticket Types
   ├── Upload Event Media
   ├── Assign Staff
   └── Manage Subscription


STAFF
   │
   ├── View Assigned Events
   │
   ├── Scan Individual QR
   │
   ├── Scan Group QR
   │
   └── Check-in Customers


SUPER ADMIN
   │
   ├── Create Organizations
   ├── Manage Organizations
   └── Manage Organization Status
⏳ Modules Intentionally Left for Later
1. Organization Dashboard
2. Super Admin Dashboard
3. Analytics APIs
4. Advanced Category Management
5. Promo Codes / Discounts
🎯 Final Result

You now have a solid Version 1 API design covering the complete core flow:

Authentication
    ↓
Organization
    ↓
Venue
    ↓
Event
    ↓
Sessions + Ticket Types
    ↓
Public Event Discovery
    ↓
Booking + Capacity Locking
    ↓
Payment
    ↓
Ticket Generation
    ↓
QR Validation + Check-in
    ↓
Cancellation + Refund

Next recommended step: 
Review this API design once for inconsistencies, then 
move to Request and Response design, where we will design the request body, response body, status codes, and error responses for each API.