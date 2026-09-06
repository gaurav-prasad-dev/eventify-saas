🗄️ Database Design Summary So Far

We are designing the database for your multi-tenant Event Booking SaaS using:

PostgreSQL as the main database

Because your project has relationships, bookings, payments, transactions, and needs strong consistency.

1. Business Model We Finalized 🏢

Your SaaS platform will support:

Your Event SaaS Platform
        │
        ├── ABC Events
        ├── XYZ Events
        └── Music Events

Each event company is called an:

Organization (Tenant)

Each organization has its own:

Events
Venues
Staff
Bookings
Financial data
Dashboard

Organizations cannot access each other's private data.

2. Customer Logic 🎟️

Customers will have:

ONE PLATFORM ACCOUNT

A customer can book events from multiple organizations.

Example:

Gaurav
  │
  ├── Books ABC Events Event
  ├── Books XYZ Events Event
  └── Books Music Events Event

The relationship happens through:

Customer
   ↓
Booking
   ↓
Event
   ↓
Organization

So currently:

We don't need a separate organization_customers table.

3. Main users Table 👤

Everyone who registers exists in one table:

users

Including:

Customers
Organization owners
Staff
Super Admin

The users table answers:

Who is this person?

Basic data:

id
name
email
phone
password_hash
status
email_verified
created_at
updated_at
4. Organizations 🏢

Every event company that registers gets an organization.

organizations

Example:

ORG1 → ABC Events
ORG2 → XYZ Events

Basic idea:

Organization
   │
   ├── Events
   ├── Venues
   ├── Staff
   └── Business Data
5. Organization Members 👥

We need to know:

Which user belongs to which organization?

For that:

organization_members

Example:

User       Organization      Role
-------------------------------------
Rahul      ABC Events        Owner
Amit       ABC Events        Staff

Concept:

User
  +
Organization
  +
Role
6. Roles 🔐

We decided that organizations should be able to create:

Custom Roles

Example:

Ticket Verifier
Event Manager
Finance Manager
Security Manager
Volunteer

Each organization can create roles based on its needs.

7. Permissions 🔑

Permissions define:

What a person can do

Examples:

CREATE_EVENT
EDIT_EVENT
DELETE_EVENT

VIEW_BOOKINGS

VERIFY_TICKET

VIEW_FINANCES

MANAGE_STAFF
8. Role Permissions

We connect:

Role
 ↓
Permissions

Example:

Role: Ticket Verifier

Permissions:
✓ VIEW_EVENT
✓ VIEW_ATTENDEES
✓ VERIFY_TICKET

But:

✗ DELETE_EVENT
✗ VIEW_FINANCES

The table:

role_permissions
9. Staff Joining Through Invite Link 🔗

Instead of manually creating staff accounts:

Organizer
    ↓
Create Custom Role
    ↓
Assign Permissions
    ↓
Generate Invite Link
    ↓
Send to Staff

Staff:

Open Link
    ↓
Login / Register
    ↓
Accept Invitation
    ↓
Automatically Join Organization
    ↓
Receive Assigned Role
10. Organization Invites

For invite links, we will have:

organization_invites

It will store things like:

organization_id
role_id
token
expires_at
max_uses
created_by
status

Example:

ABC Events
      ↓
Invite Link
      ↓
Role: Ticket Verifier
      ↓
Maximum Uses: 5
      ↓
Expires: 7 Days
📊 Tables Discussed So Far
1. users

2. organizations

3. organization_members

4. roles

5. permissions

6. role_permissions

7. organization_invites
🔥 Overall Relationship
                    USERS
                      │
              ┌───────┴────────┐
              │                │
         Customers        Organization Members
                                │
                                ▼
                       ORGANIZATION_MEMBERS
                          │        │
                          │        │
                    ORGANIZATION  ROLE
                                      │
                                      ▼
                              ROLE_PERMISSIONS
                                      │
                                      ▼
                                PERMISSIONS


Organization
     │
     └── ORGANIZATION_INVITES
               │
               └── Assigned Role

  ------             ------------------------------------------

  ✅ Decision for users

1. Our first table is:

users
├── id
├── first_name
├── last_name
├── email
├── phone
├── password_hash
├── status
├── email_verified
├── created_at
└── updated_at

2. organizations
├── id
├── name
├── slug
├── description
├── email
├── phone
├── logo_url
├── status
├── created_at
└── updated_at

3. organization members

Important Rule 🔥

We should prevent the same user from joining the same organization multiple times.

For example:

Amit → ABC Events ✅

Amit → ABC Events again ❌

So we add a unique constraint:

UNIQUE(user_id, organization_id)

This means:

One user can have only one membership record per organization.

But the same user can join another organization:

Amit → ABC Events → Ticket Verifier
Amit → XYZ Events → Event Manager

✅ Allowed.

How Does a User Become an Organization Member?

Through your invite/join link flow:

Organizer
   ↓
Creates Custom Role
   ↓
Creates Invite Link
   ↓
Sends Link to Employee
   ↓
Employee Registers / Logs In
   ↓
organization_members record created
Final Structure
organization_members
├── id
├── user_id              → users.id
├── organization_id      → organizations.id
├── role_id              → roles.id
├── status
├── joined_at
├── created_at
└── updated_at

4. roles
Important Constraint

We should prevent duplicate role names inside the same organization.

ABC Events

Event Manager ✅
Event Manager again ❌

So:

UNIQUE(organization_id, name)

But this is allowed:

ABC Events → Event Manager ✅
XYZ Events → Event Manager ✅
What is is_system_role? 🤔

When a new organization registers, we might automatically create a default role:

OWNER

Example:

Role: OWNER
is_system_role = true

This helps us protect important roles.

For example:

OWNER → Cannot accidentally be deleted

Custom role:

Role: Ticket Verifier
is_system_role = false

The organization can edit or delete it.

Relationship
Organization
      │
      ├── Role: Owner
      ├── Role: Event Manager
      ├── Role: Ticket Verifier
      └── Role: Finance Manager

Then:

Role
  │
  ├── Assigned to Users
  │
  └── Has Permissions
Final Structure
roles
├── id
├── organization_id → organizations.id
├── name
├── description
├── is_system_role
├── created_at
└── updated_at

5.   Permission

Important Question: Should Permissions Belong to Organizations?
No ❌

Permissions should be created by your SaaS platform, not by individual organizations.

Why?

Because permissions represent system actions.

For example:

VIEW_BOOKINGS
CREATE_EVENT
VERIFY_TICKET

These actions are the same for every organization.

So:

permissions

Platform-level

But:

roles

Organization-level
Example

Your platform has these permissions:

CREATE_EVENT
EDIT_EVENT
DELETE_EVENT
VIEW_EVENT

VIEW_BOOKINGS
MANAGE_BOOKINGS

VERIFY_TICKET

MANAGE_STAFF

VIEW_FINANCES
MANAGE_REFUNDS

Then ABC Events creates:

Role: Ticket Verifier

And assigns:

✓ VIEW_EVENT
✓ VIEW_BOOKINGS
✓ VERIFY_TICKET
Relationship
Platform Permissions
        │
        ▼
   Organization Role
        │
        ▼
      User

Example:

Permission:
VERIFY_TICKET

        ↓

Role:
Ticket Verifier

        ↓

User:
Amit
Final Structure
permissions
├── id
├── name
├── description
└── created_at
Important Constraint
UNIQUE(name)

Because we should not have:

VERIFY_TICKET
VERIFY_TICKET ❌

6. 6️⃣ role_permissions Table 🔗
Why do we need this table?

Because:

One role can have many permissions
One permission can belong to many roles

This is called a Many-to-Many relationship.

Example
Role: Event Manager
CREATE_EVENT
EDIT_EVENT
VIEW_BOOKINGS
Role: Ticket Verifier
VIEW_EVENT
VIEW_BOOKINGS
VERIFY_TICKET

Notice:

VIEW_BOOKINGS

can be used by multiple roles.

So we need a separate connecting table.

Table Structure
role_permissions
Column	Type	Purpose
role_id	UUID	Which role
permission_id	UUID	Which permission
created_at	TIMESTAMP	When assigned
Example Data
role_id       permission_id
--------------------------------
EventManager  CREATE_EVENT
EventManager  EDIT_EVENT
EventManager  VIEW_BOOKINGS

Verifier      VIEW_EVENT
Verifier      VIEW_BOOKINGS
Verifier      VERIFY_TICKET
Visual Flow
ROLE
 │
 ├── CREATE_EVENT
 ├── EDIT_EVENT
 └── VIEW_BOOKINGS

Database-wise:

roles
   │
   │
   ▼
role_permissions
   │
   │
   ▼
permissions
Important Constraint 🔥

We should prevent duplicate assignments.

Event Manager → CREATE_EVENT ✅

Event Manager → CREATE_EVENT again ❌

So:

UNIQUE(role_id, permission_id)
Final Structure
role_permissions
├── role_id          → roles.id
├── permission_id    → permissions.id
└── created_at

7. 7️⃣ organization_invites Table 🔗

This table handles your staff joining/invitation link system.

Flow
Organizer
   ↓
Creates a Role
   ↓
Generates Invite Link
   ↓
Sends Link to Staff
   ↓
Staff Opens Link
   ↓
Login / Register
   ↓
Joins Organization
Table Structure
Column	Type	Purpose
id	UUID	Unique invite ID
organization_id	UUID	Which organization
role_id	UUID	Role assigned through the link
token	VARCHAR	Unique secure invite token
max_uses	INTEGER	Maximum people who can use it
used_count	INTEGER	Number of people who joined
expires_at	TIMESTAMP	Link expiry time
status	ENUM	ACTIVE / EXPIRED / DISABLED
created_by	UUID	Who created the invite
created_at	TIMESTAMP	Creation time
Example

ABC Events creates:

Role: Ticket Verifier

Invite Link:
yourapp.com/join/abc123

Database:

organization_invites

organization_id → ABC Events
role_id         → Ticket Verifier
token           → abc123
max_uses        → 5
used_count      → 2
expires_at      → 10 Sept 2026
status          → ACTIVE
When Staff Uses the Link
Staff opens link
       ↓
System checks token
       ↓
Is link valid?
       ↓
Login / Register
       ↓
Create organization_members record
       ↓
Assign role from role_id
       ↓
Increase used_count
Relationships
organization_invites
       │
       ├── organization_id → organizations
       │
       ├── role_id → roles
       │
       └── created_by → users
Important Rules 🔥
1. Token must be unique
UNIQUE(token)
2. Check expiration
Current Time > expires_at
        ↓
Invite cannot be used
3. Check maximum uses
used_count >= max_uses
        ↓
Invite cannot be used
Current Tables Completed ✅
1. users
2. organizations
3. organization_members
4. roles
5. permissions
6. role_permissions
7. organization_invites

8. Great. Let's complete STEP 5.1 by handling the Super Admin. 👑

8️⃣ How Should Super Admin Work?

You asked earlier:

Super Admin is the owner/admin of the SaaS platform.

Correct.

The Super Admin:

Manages organizations
Manages subscriptions
Can suspend organizations
Views platform-level analytics
Manages the SaaS platform
Should Super Admin Be in organization_members?
❌ No.

Because Super Admin does not belong to:

ABC Events
XYZ Events
Music Events

Super Admin manages the entire platform.

How Do We Store Super Admin?

We have two possible approaches.

Option 1: Add platform_role in the users table ⭐

Example:

users

id       name       platform_role
-----------------------------------
U1       Gaurav     SUPER_ADMIN
U2       Rahul      NULL
U3       Amit       NULL

For normal users:

platform_role = NULL

For Super Admin:

platform_role = SUPER_ADMIN
This is my recommendation for your project.

Simple and easy.

Complete Access Logic 🔥
Customer
users

No organization membership needed.

Staff / Organizer
users
   ↓
organization_members
   ↓
role
   ↓
permissions
Super Admin
users
   ↓
platform_role = SUPER_ADMIN
Complete Diagram
                         USERS
                           │
          ┌────────────────┼─────────────────┐
          │                │                 │
          ▼                ▼                 ▼
      Customer        Super Admin       Organization User
                          │                  │
                          │                  ▼
                    Platform Access   organization_members
                                             │
                                             ▼
                                        organizations
                                             │
                                             ▼
                                           roles
                                             │
                                             ▼
                                      role_permissions
                                             │
                                             ▼
                                       permissions
🔥 One Important Note

We should not add CUSTOMER, STAFF, or ORGANIZER directly as a global role in the users table.

Because a user's role depends on the organization.

For example:

Rahul
│
├── ABC Events → Event Manager
│
└── XYZ Events → Ticket Verifier

But SUPER_ADMIN is different because it is a platform-level role.


9.  🏟️ 5.2.1 — venues Table
Purpose

The venues table stores venues created by an organizer.

Later, the organizer can select that venue while creating an event.

Organization
     ↓
Creates Venues
     ↓
Venue 1
Venue 2
Venue 3
     ↓
Later selects venue for an Event
Database Structure
Column	Type	Purpose
id	UUID	Unique venue ID
organization_id	UUID (FK)	Which organization created this venue
name	VARCHAR	Venue name
description	TEXT	Information about venue
address_line1	VARCHAR	Main address
address_line2	VARCHAR, nullable	Additional address
city	VARCHAR	City
state	VARCHAR	State
country	VARCHAR	Country
postal_code	VARCHAR	PIN code
capacity	INTEGER	Maximum number of people
status	ENUM	ACTIVE / INACTIVE
created_at	TIMESTAMP	Creation time
updated_at	TIMESTAMP	Last update time
Visual Example
venues

V1
├── Organization → ABC Events
├── Name → Phoenix Hall
├── City → Indore
├── Capacity → 500
└── Status → ACTIVE
🔗 Relationship
organizations
      │
      │ 1 Organization
      │
      ▼
venues
      │
      │ 1 Venue can be used by
      │
      ▼
many events

So:

ABC Events
    │
    ├── Phoenix Hall
    │       ├── Comedy Show
    │       └── Music Event
    │
    └── Convention Center
What About Facilities? 🚻🅿️

Examples:

Parking
Air Conditioning
WiFi
Washroom
Wheelchair Access
For now, I recommend NOT storing facilities directly as columns.

❌

has_parking
has_wifi
has_ac
has_washroom

Because later you may have many facilities.

Instead, we can create a separate table later:

venue_facilities

Example:

Phoenix Hall
     │
     ├── Parking
     ├── WiFi
     └── AC
Important Constraints 🔥
Foreign Key
organization_id → organizations.id
Capacity
capacity > 0
Recommended Index
INDEX(organization_id)

Because organizers will frequently query:

Give me all venues of ABC Events
Final venues Table
venues
├── id
├── organization_id        → organizations.id
├── name
├── description
│
├── address_line1
├── address_line2
├── city
├── state
├── country
├── postal_code
│
├── capacity
├── status
│
├── created_at
└── updated_at

10. 🪑 5.2.2 — venue_seating_layouts
Why do we need this table?

A venue might have:

One seating layout
Multiple layouts

Example:

Phoenix Hall
│
├── Default Layout
│
└── Concert Layout

Maybe during a concert, the stage position changes.

So instead of directly putting seats inside venues, we create:

venue_seating_layouts
Table Structure
Column	Purpose
id	Unique layout ID
venue_id	Which venue
name	Layout name
description	Layout details
is_default	Is this the default layout?
status	ACTIVE / INACTIVE
created_at	Creation time
updated_at	Update time
Example
Phoenix Hall

Layout 1:
Name → Default Layout
is_default → true

Layout 2:
Name → Concert Layout
is_default → false
Relationship
Venue
  │
  ├── Seating Layout 1
  │
  └── Seating Layout 2
🪑 5.2.3 — venue_seats

Now we store the actual seats.

Example:

VIP Section

A1  A2  A3  A4

Regular Section

B1  B2  B3  B4
Table Structure
Column	Purpose
id	Unique seat ID
layout_id	Which seating layout
seat_number	A1, A2, B1 etc.
row_number	A, B, C
section	VIP / Regular
seat_type	NORMAL / PREMIUM / etc.
x_position	Position on UI layout
y_position	Position on UI layout
status	ACTIVE / INACTIVE
created_at	Creation time
updated_at	Update time
Why x_position and y_position? 🔥

Because your frontend needs to display seats visually.

For example:

            STAGE

       A1  A2  A3  A4

       B1  B2  B3  B4

The frontend can use:

A1 → x: 10, y: 20
A2 → x: 20, y: 20

B1 → x: 10, y: 30
B2 → x: 20, y: 30

This allows you to build a proper BookMyShow-style seat map.

Relationship So Far
organizations
      │
      ▼
venues
      │
      ▼
venue_seating_layouts
      │
      ▼
venue_seats
🎯 Now the Important Part: Event Customization

Suppose:

Venue: Phoenix Hall
Layout: Default Layout

Seats:

A1
A2
A3
A4

Now we create:

Event: Comedy Night

We should NOT directly change the venue seats.

Why?

Because another event might use the same venue.

Solution: event_seats ⭐

When an event selects a venue and seating layout:

Comedy Night
      ↓
Phoenix Hall
      ↓
Default Layout
      ↓
Seats copied/referenced for event

We create an event-specific seat record.

event_seats
🪑 event_seats Table
Column	Purpose
id	Unique event seat ID
event_id	Which event
venue_seat_id	Original venue seat
seat_number	A1, A2 etc.
section	VIP / Regular
price	Price for this event
status	AVAILABLE / BLOCKED
created_at	Creation time
updated_at	Update time
Example
Venue Layout
A1
A2
A3
A4
Comedy Night
A1 → ₹2,000
A2 → ₹2,000
A3 → BLOCKED
A4 → ₹1,500
Another Event
Music Night

A1 → ₹3,000
A2 → ₹3,000
A3 → ₹3,000
A4 → ₹2,500

This is why event_seats is important.

🔥 Final Option 3 Database Design
VENUE
  │
  ▼
VENUE_SEATING_LAYOUTS
  │
  ▼
VENUE_SEATS
  │
  │  Base / Reusable Layout
  │
  ▼
EVENT
  │
  ▼
EVENT_SEATS
Clear Difference
venue_seats

Stores the permanent seat layout:

Phoenix Hall

A1
A2
A3
A4
event_seats

Stores the event-specific configuration and booking state:

Comedy Night

A1 → ₹2000 → AVAILABLE
A2 → ₹2000 → AVAILABLE
A3 → BLOCKED
📌 Tables Added

So far in Step 5.2:

1. venues
2. venue_seating_layouts
3. venue_seats
4. event_seats (event-level customization)

⚠️ Small note: We haven't designed the actual events table yet. We'll do that next, and then connect event_seats properly.

11. 🎉 5.2.4 — events Table
Purpose

The events table stores information that is common across all sessions.

Example
Event: Zakir Khan Comedy Show
Category: Comedy
Description: Live comedy performance
Organizer: ABC Events

If the event happens on multiple dates, we don't repeat this information.

Database Structure
Column	Type	Purpose
id	UUID	Unique event ID
organization_id	UUID (FK)	Organization that created the event
title	VARCHAR	Event name
slug	VARCHAR	SEO-friendly event URL
description	TEXT	Full event description
event_type	VARCHAR	Comedy, Concert, Conference, etc.
status	ENUM	Event status
created_by	UUID (FK)	User who created the event
created_at	TIMESTAMP	Creation time
updated_at	TIMESTAMP	Last update
Example Data
events

id: E101

Organization: ABC Events
Title: Zakir Khan Comedy Show
Type: Comedy
Status: PUBLISHED
Event Status

I recommend:

DRAFT
PUBLISHED
UNPUBLISHED
CANCELLED
COMPLETED
ARCHIVED
Basic lifecycle:
DRAFT
  ↓
PUBLISHED
  ↓
COMPLETED
  ↓
ARCHIVED
Final events Table
events
├── id
├── organization_id → organizations.id
│
├── title
├── slug
├── description
├── event_type
│
├── status
│
├── created_by → users.id
│
├── created_at
└── updated_at
📅 5.2.5 — event_sessions Table

Now comes the actual date and show information.

Purpose

Each row represents:

One actual occurrence of an event

Example
Zakir Khan Comedy Show
       │
       ├── Session 1 → 20 Sept → 7 PM
       │
       ├── Session 2 → 21 Sept → 7 PM
       │
       └── Session 3 → 22 Sept → 7 PM

Each of these is stored separately.

Database Structure
Column	Type	Purpose
id	UUID	Unique session ID
event_id	UUID (FK)	Which event
venue_id	UUID (FK)	Where it happens
seating_layout_id	UUID (FK, nullable)	Selected seating layout
start_at	TIMESTAMP	Start date and time
end_at	TIMESTAMP	End date and time
is_seated	BOOLEAN	Whether seat selection is required
status	ENUM	Session status
created_at	TIMESTAMP	Creation time
updated_at	TIMESTAMP	Last update
Example
event_sessions

Session 1

Event → Zakir Khan Comedy Show
Venue → Phoenix Hall

Start → 20 Sept, 7 PM
End → 20 Sept, 10 PM

Seated → YES
Layout → Phoenix Default Layout
Why Does venue_id Belong Here?

Because different sessions can happen at different venues.

Example:

Arijit Singh Concert
        │
        ├── Session 1
        │      Venue → Indore Stadium
        │      Date → 20 Sept
        │
        └── Session 2
               Venue → Bhopal Stadium
               Date → 25 Sept
Why Does seating_layout_id Belong Here?

Because each session may use a different layout.

Example:

Phoenix Hall
│
├── Default Layout
│
└── Concert Layout

Session 1 can use:

Default Layout

Session 2 can use:

Concert Layout
Why is is_seated Here Instead of events?

Because seating can potentially be different for each session.

Example:

Same Event

Session 1 → Small venue → Seated

Session 2 → Open ground → Non-seated

So this belongs to the session.

Session Status

I recommend:

SCHEDULED
CANCELLED
COMPLETED

For MVP, this is enough.

Final event_sessions Table
event_sessions
├── id
│
├── event_id → events.id
├── venue_id → venues.id
├── seating_layout_id → venue_seating_layouts.id (nullable)
│
├── start_at
├── end_at
│
├── is_seated
├── status
│
├── created_at
└── updated_at
🔥 Complete Relationship
ORGANIZATION
     │
     ▼
EVENT
     │
     │ One Event
     │
     ├───────────────┐
     ▼               ▼
SESSION 1         SESSION 2
     │               │
     ▼               ▼
Venue A          Venue B
     │               │
Seats            Seats
     │               │
Bookings         Bookings
Important Validation Rules
1. Event belongs to an organization
event.organization_id
        ↓
organizations.id
2. Session must have a valid time
end_at > start_at
3. Seating layout should only be used when:
is_seated = true

Otherwise:

seating_layout_id = NULL
✅ Step 5.2 Progress So Far

We have designed:

5.2.1 → venues
5.2.2 → venue_seating_layouts
5.2.3 → venue_seats
5.2.4 → events
5.2.5 → event_sessions

12. 🪑 5.2.6 — event_seats
First Understand the Difference
venue_seats

These are the permanent/template seats of a venue.

Phoenix Hall Layout

A1  A2  A3  A4
B1  B2  B3  B4

These seats don't know anything about:

Price
Bookings
Availability for a particular event
event_seats

These are the seats for one specific event session.

Example:

Comedy Night
20 Sept, 7 PM
Phoenix Hall

For this session:

A1 → ₹2,000 → AVAILABLE
A2 → ₹2,000 → AVAILABLE
A3 → ₹1,500 → BLOCKED

For another session:

Comedy Night
21 Sept, 7 PM

A1 → ₹1,000 → AVAILABLE
A2 → ₹1,000 → BOOKED

Same venue seat, but different session state.

Database Structure
event_seats
├── id
│
├── event_session_id → event_sessions.id
├── venue_seat_id → venue_seats.id
│
├── price
├── status
│
├── created_at
└── updated_at
Column Explanation
Column	Why?
id	Unique event seat ID
event_session_id	Which event session this seat belongs to
venue_seat_id	Original/template seat
price	Price for this specific session
status	Seat availability
created_at	When created
updated_at	Last update
Example
Venue Seat
venue_seats

ID: VS101
Seat: A1
Layout: Phoenix Default Layout
Event Session
event_sessions

ID: ES101

Comedy Night
20 Sept, 7 PM
Event Seat
event_seats

ID: ETS101

event_session_id → ES101
venue_seat_id → VS101

price → ₹2,000
status → AVAILABLE
🔥 Important Constraint

We must ensure the same venue seat cannot be added twice to the same session.

UNIQUE(event_session_id, venue_seat_id)

This is very important.

Example:

❌ Invalid:

Comedy Session

A1
A1

The database will prevent this.

What Should status Be?

Initially:

AVAILABLE
BLOCKED
BOOKED

But I recommend not putting LOCKED permanently in PostgreSQL.

Why?

Because seat locking is temporary and expires.

Later, we can handle temporary locks using:

Redis

Example:

Redis

seat_lock:
session_101:
seat_A1

User → U123

TTL → 5 minutes

So PostgreSQL:

AVAILABLE
BLOCKED
BOOKED

Redis:

LOCKED temporarily

This is a good production-level approach. ⭐

Example Flow
User clicks A1
Customer
   ↓
Select A1
   ↓
Check event_seats.status
   ↓
AVAILABLE?
   │
   ├── NO → Reject
   │
   └── YES
         ↓
      Lock in Redis
         ↓
      TTL = 5 minutes
Payment Successful
Payment Success
      ↓
Webhook
      ↓
Check Seat Lock
      ↓
Update PostgreSQL

A1 → BOOKED
Complete Seat Architecture
VENUE
  │
  ▼
VENUE_SEATING_LAYOUT
  │
  ▼
VENUE_SEATS
  │
  │ Template
  │
  ▼
EVENT SESSION
  │
  ▼
EVENT_SEATS
  │
  ├── Price
  ├── AVAILABLE
  ├── BLOCKED
  └── BOOKED
My Recommendation for Seat Locking

We will use:

PostgreSQL → Permanent booking data

Redis → Temporary seat locking

This gives us:

Fast locking
Automatic expiry using TTL
Better performance
Reduced database writes
Final event_seats Table
event_seats
├── id
├── event_session_id → event_sessions.id
├── venue_seat_id → venue_seats.id
│
├── price
├── status → AVAILABLE / BLOCKED / BOOKED
│
├── created_at
└── updated_at

UNIQUE(event_session_id, venue_seat_id)
⚠️ One Small Improvement Before Moving On

Currently, venue_seats contains:

section
seat_type
x_position
y_position

When displaying the event seat map, we can join:

event_seats
     +
venue_seats

and get:

Seat → A1
Section → VIP
Position → x, y
Price → event_seats.price
Status → event_seats.status

So we don't need to duplicate that data in event_seats.

✅ Step 5.2.6 Complete

Our hierarchy is now:

Organization
    │
    ▼
Venue
    │
    ▼
Venue Seating Layout
    │
    ▼
Venue Seats
    │
    ▼
Event
    │
    ▼
Event Session
    │
    ▼
Event Seats

13. 🎟️ 5.2.7 — ticket_types
Purpose

This table stores the different ticket categories for an event session.

Examples:

VIP
Regular
General Entry
Early Bird
Database Design
Column	Type	Purpose
id	UUID	Unique ticket type ID
event_session_id	UUID (FK)	Which event session
name	VARCHAR	VIP, Regular, General
description	TEXT, nullable	Ticket details
price	DECIMAL(10,2)	Ticket price
total_quantity	INTEGER, nullable	Total tickets available
status	ENUM	ACTIVE / INACTIVE
sale_start_at	TIMESTAMP, nullable	When ticket sales start
sale_end_at	TIMESTAMP, nullable	When ticket sales end
created_at	TIMESTAMP	Creation time
updated_at	TIMESTAMP	Last update time
Example 1: Non-Seated Event 🎟️
Event Session: Arijit Concert

ticket_types

VIP
Price: ₹2,000
Total Quantity: 500

General
Price: ₹500
Total Quantity: 5,000

Here:

Customer
   ↓
Select VIP
   ↓
Select Quantity: 2
   ↓
Booking
Example 2: Seated Event 🪑
Event Session: Comedy Night

ticket_types

VIP → ₹2,000
Regular → ₹1,000

Then seats are connected:

VIP
 ├── A1
 ├── A2
 └── A3

Regular
 ├── B1
 ├── B2
 └── B3

Here, the customer selects the seat, not ticket quantity directly.

Important: What About total_quantity?

For non-seated events:

total_quantity = REQUIRED

Example:

General → 5,000 tickets

For seated events:

total_quantity = NULL

Because the actual number of available tickets comes from the seats assigned to that ticket type.

Example:

VIP → 20 seats
Regular → 50 seats
Relationship
EVENT SESSION
      │
      ▼
TICKET TYPES
      │
      ├── VIP
      ├── Regular
      └── General

For seated events:

TICKET TYPE
      │
      ▼
EVENT SEATS
Connection with event_seats

We add:

ticket_type_id

to the event_seats table.

So:

event_seats
├── id
├── event_session_id
├── venue_seat_id
├── ticket_type_id → ticket_types.id
├── price
├── status

One Small Improvement ⭐

Since a seat already belongs to a ticket type, we don't necessarily need to store price in both places.

You have two options:

Option A — Simple MVP
ticket_types.price

All VIP seats have the same price.

Option B — Flexible Production Design
ticket_types.price → Default Price

event_seats.price → Individual Seat Price

Example:

VIP → Default ₹2,000

A1 → ₹2,500
A2 → ₹2,000
A3 → ₹1,800
⭐ My recommendation for your project

Use Option B, because it gives you flexibility and demonstrates better database design.

Final ticket_types Table
ticket_types
├── id
├── event_session_id → event_sessions.id
│
├── name
├── description
├── price
│
├── total_quantity (nullable)
│
├── status → ACTIVE / INACTIVE
│
├── sale_start_at (nullable)
├── sale_end_at (nullable)
│
├── created_at
└── updated_at
Important rule:
NON_SEATED → total_quantity required

SEATED → total_quantity can be NULL 

we are using option b here 

14.  .

🎫 Step 6.1 — bookings

First, understand what a booking is.

Example:

Rahul visits the common website:

Comedy Night
↓
20 September, 7 PM
↓
Select A1 + A2
↓
Pay ₹2,000
↓
Booking Created

This entire transaction becomes one booking.

bookings Table
bookings
Column	Type	Purpose
id	UUID	Unique booking ID
booking_number	VARCHAR	Human-readable booking ID
customer_id	UUID (FK)	Customer who booked
event_session_id	UUID (FK)	Session being booked
organization_id	UUID (FK)	Organization that owns the event
booking_status	VARCHAR	Booking status
total_amount	DECIMAL(10,2)	Final booking amount
currency	VARCHAR(10)	INR
created_at	TIMESTAMP	Booking creation time
updated_at	TIMESTAMP	Last update
Why organization_id in Bookings? ⭐

Earlier, we said we could find the organization through:

Booking
 ↓
Event Session
 ↓
Event
 ↓
Organization

That is correct.

But for your business plan, I now recommend adding:

organization_id

directly to bookings.

Why?

Because organizations will frequently query:

Show me:

All my bookings
Today's bookings
My total revenue
My customers
My event history

Having organization_id makes tenant filtering and analytics easier.

WHERE organization_id = ABC

However, we must ensure it always matches the organization that owns the event.

Booking Status

I recommend:

PENDING
CONFIRMED
CANCELLED
EXPIRED
FAILED
Flow:
Customer selects seats
        ↓
PENDING
        ↓
Payment successful
        ↓
CONFIRMED

If payment fails:

PENDING
   ↓
FAILED

If customer doesn't pay before the seat lock expires:

PENDING
   ↓
EXPIRED
Example Record
id: B101

booking_number: BK-2026-001234

customer_id: Rahul

event_session_id: ComedyNight-20Sept

organization_id: ABC-Events

booking_status: CONFIRMED

total_amount: ₹2,000

currency: INR
Important: What Does bookings NOT Store?

It should not directly store:

Seat A1
Seat A2

Because one booking can contain multiple seats.

Example:

Booking BK123

A1
A2
A3

So we need another table:

booking_items
Relationship
CUSTOMER
    │
    ▼
BOOKING
    │
    ├── Event Session
    │
    └── Organization
    │
    ▼
BOOKING ITEMS
    │
    ├── Seat A1
    ├── Seat A2
    └── Seat A3
Final bookings Table
bookings
├── id
├── booking_number (UNIQUE)
│
├── customer_id → users.id
├── event_session_id → event_sessions.id
├── organization_id → organizations.id
│
├── booking_status
├── total_amount
├── currency
│
├── created_at
└── updated_at
Why this fits your SaaS plan

✅ Customer books from the common website
✅ Booking belongs to the specific customer
✅ Booking belongs to the specific event session
✅ Organization can see only its own bookings
✅ Super Admin can see all bookings
✅ Makes future analytics and settlement calculations easier

15. 🎫 Step 6.2 — booking_items
What is booking_items?

A single booking can contain multiple things.

Example: Seated Event
Booking: BK-1001

Seat A1 → ₹1,000
Seat A2 → ₹1,000
Seat A3 → ₹1,000

Instead of storing all seats inside the bookings table, we create separate records in:

booking_items
Database Design
Column	Type	Purpose
id	UUID	Primary Key
booking_id	UUID (FK)	Which booking
event_seat_id	UUID (FK, nullable)	Selected seat
ticket_type_id	UUID (FK, nullable)	Selected ticket type
quantity	INTEGER	Number of tickets
unit_price	DECIMAL(10,2)	Price per ticket/seat
total_price	DECIMAL(10,2)	Final price
created_at	TIMESTAMP	Creation time
🪑 Example 1: Seated Event

Customer selects:

A1 → ₹1,000
A2 → ₹1,000

Database:

booking_items

Item 1:
booking_id → BK100
event_seat_id → A1
ticket_type_id → VIP
quantity → 1
unit_price → ₹1,000
total_price → ₹1,000


Item 2:
booking_id → BK100
event_seat_id → A2
ticket_type_id → VIP
quantity → 1
unit_price → ₹1,000
total_price → ₹1,000
🎟️ Example 2: Non-Seated Event

Customer selects:

VIP Ticket

Quantity → 3
Price → ₹500 each

Database:

booking_items

booking_id → BK200

event_seat_id → NULL

ticket_type_id → VIP

quantity → 3

unit_price → ₹500

total_price → ₹1,500
Why Are Both Fields Nullable?

Because we support two booking types.

Seated
event_seat_id → EXISTS
ticket_type_id → EXISTS

quantity → 1
Non-Seated
event_seat_id → NULL
ticket_type_id → EXISTS

quantity → 3
Simple Logic
booking_items
       │
       ├── 🪑 SEATED EVENT
       │      │
       │      └── event_seat_id
       │
       └── 🎟️ NON-SEATED EVENT
              │
              └── ticket_type_id + quantity
⭐ Important Point: Price Snapshot

Why do we store:

unit_price
total_price

inside booking_items?

Suppose today:

VIP Ticket = ₹1,000

Customer books it.

Tomorrow, the organizer changes the price:

VIP Ticket = ₹1,500

Old booking should still show:

₹1,000 ✅

Therefore, booking tables store the price at the time of booking.

Final Table
booking_items
├── id
│
├── booking_id → bookings.id
│
├── event_seat_id → event_seats.id (nullable)
├── ticket_type_id → ticket_types.id
│
├── quantity
│
├── unit_price
├── total_price
│
└── created_at
One Important Rule 🔥

For a seated event:

1 Seat = 1 Booking Item

For example:

Booking BK100

├── Booking Item → A1
├── Booking Item → A2
└── Booking Item → A3

For a non-seated event:

1 Booking Item = Multiple Tickets

VIP × 3
Relationship
BOOKING
   │
   ▼
BOOKING_ITEMS
   │
   ├── EVENT_SEAT (Seated)
   │
   └── TICKET_TYPE (Non-Seated)

   16. Great. Let's design payments according to your exact business plan.

First, remember the payment flow
Customer books ticket
       ↓
Booking created → PENDING
       ↓
Customer pays on common website
       ↓
Payment Gateway
       ↓
Platform receives payment
       ↓
Payment successful
       ↓
Booking → CONFIRMED
💰 Step 6.3 — payments

This table stores the actual payment attempt and transaction details.

Database Design
Column	Data Type	Purpose
id	UUID	Primary Key
booking_id	UUID	FK → bookings.id
organization_id	UUID	FK → organizations.id
payment_number	VARCHAR(50)	Unique payment reference
amount	DECIMAL(12,2)	Amount customer paid
currency	VARCHAR(10)	Example: INR
payment_status	VARCHAR(30)	Payment status
payment_method	VARCHAR(50)	UPI, CARD, NET_BANKING etc.
payment_gateway	VARCHAR(50)	Payment provider
gateway_payment_id	VARCHAR(255)	Payment ID from gateway
gateway_order_id	VARCHAR(255)	Order ID from gateway
failure_reason	TEXT	Reason if payment fails
paid_at	TIMESTAMP	When payment succeeded
created_at	TIMESTAMP	Payment attempt created
updated_at	TIMESTAMP	Last update
Why do we need organization_id?

The booking already has:

Booking
   ↓
Event Session
   ↓
Event
   ↓
Organization

But for your business model, I recommend keeping:

organization_id

inside payments too.

Because you frequently need:

ABC Events → Total Money Received
ABC Events → Total Refunds
ABC Events → Pending Settlement

This makes financial reporting easier.

Payment Status

I recommend:

PENDING
PROCESSING
SUCCESS
FAILED
CANCELLED
Flow:
Payment Created
      ↓
PENDING
      ↓
Customer paying
      ↓
PROCESSING
      │
      ├── SUCCESS ✅
      │
      └── FAILED ❌
Example: Successful Payment

Customer books:

Comedy Show
Seat A1 + A2

Total = ₹2,000

Payment record:

payment_number: PAY-2026-00125

booking_id: BK-1001

organization_id: ABC-EVENTS

amount: ₹2,000

currency: INR

payment_status: SUCCESS

payment_method: UPI

payment_gateway: Razorpay

gateway_payment_id: pay_xxxxx

paid_at: 2026-09-05 10:30
Example: Failed Payment
amount: ₹2,000

payment_status: FAILED

failure_reason:
"Payment declined by bank"

The booking would eventually become:

EXPIRED

or:

FAILED

depending on our final booking logic.

Important: Can One Booking Have Multiple Payment Attempts?
Yes. ⭐

Example:

Booking BK-100

Attempt 1 → FAILED

Attempt 2 → SUCCESS

So the relationship is:

ONE BOOKING
     │
     ▼
MANY PAYMENTS

This is why we should not store payment details directly inside the bookings table.

Relationship
CUSTOMER
    │
    ▼
BOOKING
    │
    ├───────────────┐
    ▼               ▼
BOOKING ITEMS    PAYMENTS
                    │
                    ▼
              PAYMENT GATEWAY
Important Business Rule 🔥

Only:

payment_status = SUCCESS

should count toward:

Total Money Received

For example:

Payments

SUCCESS → ₹2,000 ✅ Count

FAILED → ₹2,000 ❌ Don't count

PENDING → ₹2,000 ❌ Don't count
Financial Dashboard Calculation
Super Admin:
Total Money Received

SUM(payments.amount)

WHERE payment_status = SUCCESS
Organization:
Total Money Received

SUM(payments.amount)

WHERE organization_id = THEIR_ORGANIZATION_ID
AND payment_status = SUCCESS
Final Table
payments
├── id
│
├── booking_id → bookings.id
├── organization_id → organizations.id
│
├── payment_number (UNIQUE)
│
├── amount
├── currency
│
├── payment_status
│
├── payment_method
├── payment_gateway
│
├── gateway_payment_id
├── gateway_order_id
│
├── failure_reason
│
├── paid_at
├── created_at
└── updated_at
Important Constraints I recommend
UNIQUE(payment_number)

INDEX(booking_id)

INDEX(organization_id)

INDEX(gateway_payment_id)
One important design decision before the next table:

For your platform, I recommend that payments.amount stores the full amount paid by the customer.

Example:

Customer Paid → ₹2,000

We do not deduct platform fees or other charges here.

Those deductions will be stored separately later:

payments → ₹2,000

financial_charges
├── Platform Fee → ₹200
├── Gateway Fee → ₹50

refunds
└── Refund → ₹300

This keeps your financial records clean and makes both the Super Admin and Organization financial dashboards easier to calculate.

17.  🔄 refunds Table
Example:
Customer paid → ₹2,000

Later refund → ₹500

We need to keep a permanent record of that refund.

Database Design
Column	Data Type	Purpose
id	UUID	Primary Key
refund_number	VARCHAR(50)	Unique refund reference
payment_id	UUID	FK → payments.id
booking_id	UUID	FK → bookings.id
organization_id	UUID	FK → organizations.id
amount	DECIMAL(12,2)	Refund amount
currency	VARCHAR(10)	INR
reason	TEXT	Why refund was issued
refund_status	VARCHAR(30)	Refund status
gateway_refund_id	VARCHAR(255)	Refund ID from payment gateway
refunded_by	UUID	FK → users.id
refunded_at	TIMESTAMP	Refund completion time
created_at	TIMESTAMP	Record creation
updated_at	TIMESTAMP	Last update
Refund Status
PENDING
PROCESSING
SUCCESS
FAILED
CANCELLED
Flow:
Super Admin initiates refund
        ↓
PENDING
        ↓
PROCESSING
        │
        ├── SUCCESS ✅
        │
        └── FAILED ❌
Can One Payment Have Multiple Refunds?
Yes. ✅

Example:

Customer Payment → ₹2,000

Refund 1 → ₹500
Refund 2 → ₹300

Total refunded:

₹800

So:

ONE PAYMENT
     │
     ▼
MANY REFUNDS
Important Rule 🔥

The total refund should never exceed the successful payment amount.

Example:

Payment → ₹2,000

Refunded → ₹500

Remaining refundable → ₹1,500

We will enforce this in the application/business logic.

Why organization_id Again?

Because both dashboards need financial data.

Super Admin:
All platform refunds
Event Organization:
Only refunds related to my events

Query:

WHERE organization_id = ABC_ORGANIZATION
Financial Dashboard
Super Admin:
Total Refunds

SUM(refunds.amount)

WHERE refund_status = SUCCESS
Organization:
Total Refunds

SUM(refunds.amount)

WHERE organization_id = MY_ORGANIZATION_ID
AND refund_status = SUCCESS
Example Refund Record
refund_number: REF-2026-00125

payment_id: PAY-100

booking_id: BK-100

organization_id: ABC-EVENTS

amount: ₹500

reason: Customer cancellation

refund_status: SUCCESS

refunded_by: Super Admin

refunded_at: 2026-09-05
Final Structure
refunds
├── id
├── refund_number (UNIQUE)
│
├── payment_id → payments.id
├── booking_id → bookings.id
├── organization_id → organizations.id
│
├── amount
├── currency
├── reason
│
├── refund_status
├── gateway_refund_id
│
├── refunded_by → users.id
│
├── refunded_at
├── created_at
└── updated_at
Important Indexes
UNIQUE(refund_number)

INDEX(payment_id)

INDEX(booking_id)

INDEX(organization_id)

INDEX(refund_status)
Current financial flow:
BOOKING
   ↓
PAYMENT 💰
   ↓
REFUND (if required) 🔄
   ↓
FINANCIAL CHARGES
   ↓
ORGANIZATION SETTLEMENT

18. financial_charges
Column	Data Type	Purpose
id	UUID	Primary Key
payment_id	UUID	FK → payments.id
booking_id	UUID	FK → bookings.id
organization_id	UUID	FK → organizations.id
charge_type	VARCHAR(50)	Type of charge
amount	DECIMAL(12,2)	Charge amount
currency	VARCHAR(10)	INR
description	TEXT	Extra details
created_at	TIMESTAMP	Creation time
updated_at	TIMESTAMP	Last update
charge_type

Initially, we can use:

PLATFORM_FEE
PAYMENT_GATEWAY_FEE
PROCESSING_FEE
TAX
OTHER
Example
Payment: ₹2,000

financial_charges:

PLATFORM_FEE         ₹200
PAYMENT_GATEWAY_FEE  ₹50
OTHER                ₹20
Why connect it to payment_id?

Because charges are generally related to a specific successful payment.

Payment PAY-100
      │
      ├── Platform Fee → ₹200
      ├── Gateway Fee → ₹50
      └── Other Fee → ₹20
Why also store booking_id?

For easier reporting.

You can directly find:

Booking BK-100
   ↓
All charges related to this booking

Again, technically we could find the booking through:

financial_charge
   ↓
payment
   ↓
booking

But storing booking_id makes financial queries easier.

Why organization_id?

Your organization dashboard needs:

ABC EVENTS

Total Platform Fees
Total Gateway Fees
Total Other Charges

Simple query:

WHERE organization_id = ABC
Example Record

Customer pays:

₹2,000
Platform Fee Record
id: FC-001

payment_id: PAY-100

booking_id: BK-100

organization_id: ABC-EVENTS

charge_type: PLATFORM_FEE

amount: ₹200

currency: INR

description:
"10% platform commission"
Gateway Fee Record
charge_type: PAYMENT_GATEWAY_FEE

amount: ₹50
Financial Dashboard Calculation
Super Admin
Total Platform Fee

SUM(amount)

WHERE charge_type = PLATFORM_FEE
Other Charges
SUM(amount)

WHERE charge_type IN (
PAYMENT_GATEWAY_FEE,
PROCESSING_FEE,
OTHER
)
Event Organization

The same calculation:

WHERE organization_id = MY_ORGANIZATION_ID

So ABC Events sees only:

ABC EVENTS

Total Sales        ₹10,00,000

Platform Fee       ₹1,00,000

Other Charges      ₹30,000

Refunds            ₹50,000

Net Payable        ₹8,20,000
Final Table
financial_charges
│
├── id
│
├── payment_id → payments.id
├── booking_id → bookings.id
├── organization_id → organizations.id
│
├── charge_type
├── amount
├── currency
├── description
│
├── created_at
└── updated_at
Recommended Indexes
INDEX(payment_id)

INDEX(booking_id)

INDEX(organization_id)

INDEX(charge_type)

19. Step 6.6 — organization_settlements
What is a settlement?

A settlement means:

The final amount your platform needs to pay to an event organization.

Complete example
ABC Events

Customer Payments       ₹10,00,000
- Platform Fee          ₹1,00,000
- Other Charges           ₹30,000
- Refunds                 ₹50,000
────────────────────────────────
Net Payable             ₹8,20,000

After the event is completed:

Platform → Pays ₹8,20,000 → ABC Events
Why do we need a separate settlement table?

Because payments, refunds, and charges are individual transactions.

But the settlement gives us a financial summary:

"How much money do we currently owe ABC Events?"
Database Design
Column	Data Type	Purpose
id	UUID	Primary Key
settlement_number	VARCHAR(50)	Unique settlement ID
organization_id	UUID	FK → organizations.id
event_id	UUID	FK → events.id
total_sales	DECIMAL(12,2)	Total successful customer payments
total_platform_fee	DECIMAL(12,2)	Total platform fees
total_other_charges	DECIMAL(12,2)	Gateway fees + other charges
total_refunds	DECIMAL(12,2)	Total successful refunds
net_payable	DECIMAL(12,2)	Final amount owed
currency	VARCHAR(10)	INR
status	VARCHAR(30)	Settlement status
calculated_at	TIMESTAMP	When calculation happened
approved_by	UUID	FK → users.id
approved_at	TIMESTAMP	When approved
created_at	TIMESTAMP	Created
updated_at	TIMESTAMP	Updated
⭐ Why event_id instead of only organization_id?

This is important.

Your business plan says:

After an event gets completed, pay the event organization.

So I recommend:

ONE EVENT
   ↓
ONE SETTLEMENT

Example:

ABC Events Organization

Comedy Night
     ↓
Settlement → ₹5,00,000

Music Concert
     ↓
Settlement → ₹10,00,000

This makes your financial records much clearer.

Settlement Calculation
NET PAYABLE

= Total Successful Payments
− Platform Fees
− Other Charges
− Successful Refunds

Example:

Total Sales             ₹10,00,000

Platform Fee
− ₹1,00,000

Other Charges
− ₹30,000

Refunds
− ₹50,000

──────────────────────

Net Payable
= ₹8,20,000
Settlement Status

I recommend:

PENDING
CALCULATED
APPROVED
PARTIALLY_PAID
PAID
FAILED
Flow
Event Completed
      ↓
PENDING
      ↓
Calculate Financial Data
      ↓
CALCULATED
      ↓
Super Admin Reviews
      ↓
APPROVED
      ↓
Money Sent
      ↓
PAID

If payment is split:

APPROVED
    ↓
PARTIALLY_PAID
    ↓
PAID
Example Record
settlement_number: SET-2026-00001

organization_id: ABC-EVENTS

event_id: COMEDY-NIGHT

total_sales: ₹10,00,000

total_platform_fee: ₹1,00,000

total_other_charges: ₹30,000

total_refunds: ₹50,000

net_payable: ₹8,20,000

status: APPROVED
Relationship
ORGANIZATION
      │
      ▼
    EVENTS
      │
      ▼
ORGANIZATION_SETTLEMENT
      │
      ▼
SETTLEMENT_PAYMENTS
Important Design Decision 🔥

I recommend storing these totals inside the settlement table:

total_sales
total_platform_fee
total_other_charges
total_refunds
net_payable

Even though we can calculate them from other tables.

Why?

Because settlement is a financial snapshot.

Once the Super Admin approves:

Settlement = ₹8,20,000

That number should remain recorded permanently, even if something changes later.

Final Table
organization_settlements
│
├── id
├── settlement_number (UNIQUE)
│
├── organization_id → organizations.id
├── event_id → events.id
│
├── total_sales
├── total_platform_fee
├── total_other_charges
├── total_refunds
│
├── net_payable
├── currency
│
├── status
│
├── calculated_at
│
├── approved_by → users.id
├── approved_at
│
├── created_at
└── updated_at
Recommended Constraints
UNIQUE(settlement_number)

UNIQUE(event_id)   ← if one settlement per event

INDEX(organization_id)

INDEX(status)
One important question before the next table

An event can potentially have multiple sessions:

Comedy Night
├── Session 1 → Sept 10
├── Session 2 → Sept 11
└── Session 3 → Sept 12

My recommendation is still:

Create one settlement for the entire event, after all its sessions are completed.


20. Step 6.7 — settlement_payments
What is this table?

organization_settlements tells us:

How much money we owe an event organization.

settlement_payments tells us:

How much money we have actually paid to the organization.

Example

Settlement:

ABC Events

Net Payable → ₹8,20,000

The platform may pay everything at once:

₹8,20,000 → Bank Transfer → ABC Events

Or in parts:

Payment 1 → ₹5,00,000
Payment 2 → ₹3,20,000

Therefore:

ONE SETTLEMENT
       ↓
MANY SETTLEMENT PAYMENTS
Database Design
Column	Data Type	Purpose
id	UUID	Primary Key
settlement_id	UUID	FK → organization_settlements.id
payment_number	VARCHAR(50)	Unique payment reference
amount	DECIMAL(12,2)	Amount paid to organization
currency	VARCHAR(10)	INR
payment_method	VARCHAR(50)	Bank Transfer, UPI, etc.
transaction_reference	VARCHAR(255)	Bank/payment transaction ID
payment_status	VARCHAR(30)	Payment status
failure_reason	TEXT	Reason if payment fails
paid_by	UUID	FK → users.id (Super Admin who initiated payment)
paid_at	TIMESTAMP	When payment succeeded
created_at	TIMESTAMP	Record creation
updated_at	TIMESTAMP	Last update
Payment Status

I recommend:

PENDING
PROCESSING
SUCCESS
FAILED
CANCELLED
Example 1: Full Payment
Settlement: SET-100

Net Payable → ₹8,20,000

One payment:

settlement_payments

payment_number → SP-001

settlement_id → SET-100

amount → ₹8,20,000

payment_method → BANK_TRANSFER

payment_status → SUCCESS

transaction_reference → BANK_TXN_12345

paid_by → Super Admin

paid_at → 2026-09-20

Settlement status becomes:

PAID
Example 2: Partial Payment
Settlement Amount → ₹8,20,000
First Payment
₹5,00,000

Settlement status:

PARTIALLY_PAID
Second Payment
₹3,20,000

Settlement status:

PAID
Important Business Rule 🔥

We calculate:

Total Paid

= SUM(settlement_payments.amount)

WHERE:

payment_status = SUCCESS

Then:

Remaining Amount

= settlement.net_payable
− total_paid
Example
Net Payable → ₹8,20,000

Payment 1 → ₹5,00,000

────────────────

Remaining → ₹3,20,000

After the second payment:

₹3,20,000

Remaining → ₹0

Then:

Settlement Status → PAID
Final Table Structure
settlement_payments
│
├── id
│
├── settlement_id → organization_settlements.id
│
├── payment_number (UNIQUE)
│
├── amount
├── currency
│
├── payment_method
├── transaction_reference
│
├── payment_status
├── failure_reason
│
├── paid_by → users.id
├── paid_at
│
├── created_at
└── updated_at
Recommended Indexes & Constraints
UNIQUE(payment_number)

INDEX(settlement_id)

INDEX(payment_status)

INDEX(paid_by)

You may also want:

INDEX(transaction_reference)

if you frequently search payments using bank transaction IDs.

Complete Financial Flow 🎯

Now your complete system looks like this:

CUSTOMER
   │
   │ Books ticket
   ▼
BOOKING
   │
   ▼
PAYMENT
   │
   │ Customer pays ₹2,000
   ▼
PLATFORM RECEIVES ₹2,000
   │
   ├── Platform Fee → ₹200
   │
   ├── Other Charges → ₹50
   │
   └── Refund → ₹300 (if required)
   │
   ▼
EVENT COMPLETED
   │
   ▼
ORGANIZATION_SETTLEMENT
   │
   │ Net Payable = ₹1,450
   ▼
SETTLEMENT_PAYMENTS
   │
   ▼
EVENT ORGANIZATION RECEIVES MONEY
📊 Dashboard Data
Super Admin can see
Total Money Received
Total Platform Fee
Total Other Charges
Total Refunds
Total Amount Settled

Per Organization Financial Details
Pending Settlements
Completed Settlements
Event Organization can see
Total Ticket Sales
Platform Fees
Other Charges
Refunds

Net Earnings
Amount Received
Pending Amount

Settlement History
Financial Module Completed ✅

We now have:

bookings
booking_items

payments
refunds
financial_charges

organization_settlements
settlement_payments

21. final payment db design 

Final Payment & Financial Database Design 💰

This design follows your exact business plan:

Customer pays on common website
        ↓
Platform receives money
        ↓
Platform Fee + Other Charges
        ↓
Refund (if needed)
        ↓
Event/Settlement period completed
        ↓
Calculate organization payable amount
        ↓
Platform pays Event Organization
1. payments

Stores every customer payment attempt.

Column	Data Type	Constraints / Description
id	UUID	PK
booking_id	UUID	FK → bookings.id
organization_id	UUID	FK → organizations.id
payment_number	VARCHAR(50)	UNIQUE, NOT NULL
amount	DECIMAL(12,2)	NOT NULL
currency	VARCHAR(10)	Default INR
payment_status	VARCHAR(30)	PENDING / PROCESSING / SUCCESS / FAILED / CANCELLED
payment_method	VARCHAR(50)	UPI / CARD / NET_BANKING etc.
payment_gateway	VARCHAR(50)	Razorpay etc.
gateway_order_id	VARCHAR(255)	Gateway order reference
gateway_payment_id	VARCHAR(255)	Gateway payment reference
failure_reason	TEXT	NULL
paid_at	TIMESTAMP	NULL
created_at	TIMESTAMP	NOT NULL
updated_at	TIMESTAMP	NOT NULL
Important relationships
One Booking → Many Payment Attempts
One Organization → Many Payments
2. refunds

Stores money returned to customers.

Column	Data Type	Constraints / Description
id	UUID	PK
refund_number	VARCHAR(50)	UNIQUE
payment_id	UUID	FK → payments.id
booking_id	UUID	FK → bookings.id
organization_id	UUID	FK → organizations.id
amount	DECIMAL(12,2)	NOT NULL
currency	VARCHAR(10)	INR
reason	TEXT	NULL
refund_status	VARCHAR(30)	PENDING / PROCESSING / SUCCESS / FAILED / CANCELLED
gateway_refund_id	VARCHAR(255)	NULL
refunded_by	UUID	FK → users.id
refunded_at	TIMESTAMP	NULL
created_at	TIMESTAMP	NOT NULL
updated_at	TIMESTAMP	NOT NULL
Important rule
Total successful refunds
≤
Successful payment amount
3. financial_charges

Stores all deductions and charges.

Column	Data Type	Constraints / Description
id	UUID	PK
payment_id	UUID	FK → payments.id
booking_id	UUID	FK → bookings.id
organization_id	UUID	FK → organizations.id
charge_type	VARCHAR(50)	Type of charge
amount	DECIMAL(12,2)	NOT NULL
currency	VARCHAR(10)	INR
charge_status	VARCHAR(30)	PENDING / APPLIED / REVERSED
description	TEXT	NULL
created_at	TIMESTAMP	NOT NULL
updated_at	TIMESTAMP	NOT NULL
charge_type
PLATFORM_FEE
PAYMENT_GATEWAY_FEE
PROCESSING_FEE
TAX
OTHER
Example
Customer Paid → ₹2,000

PLATFORM_FEE        → ₹200
PAYMENT_GATEWAY_FEE → ₹50
4. organization_settlements

Stores the main settlement record for an event organization.

This should not be restricted permanently to one event.

It can support:

EVENT settlement
PERIOD settlement
Column	Data Type	Constraints / Description
id	UUID	PK
settlement_number	VARCHAR(50)	UNIQUE
organization_id	UUID	FK → organizations.id
settlement_type	VARCHAR(30)	EVENT / PERIOD
period_start	TIMESTAMP	NULL
period_end	TIMESTAMP	NULL
total_sales	DECIMAL(12,2)	Snapshot
total_platform_fee	DECIMAL(12,2)	Snapshot
total_other_charges	DECIMAL(12,2)	Snapshot
total_refunds	DECIMAL(12,2)	Snapshot
net_payable	DECIMAL(12,2)	Final amount payable
currency	VARCHAR(10)	INR
status	VARCHAR(30)	Settlement status
calculated_at	TIMESTAMP	NULL
approved_by	UUID	FK → users.id, NULL
approved_at	TIMESTAMP	NULL
created_at	TIMESTAMP	NOT NULL
updated_at	TIMESTAMP	NOT NULL
Settlement Status
PENDING
CALCULATED
APPROVED
PARTIALLY_PAID
PAID
FAILED
Formula
Net Payable

= Total Sales
− Platform Fee
− Other Charges
− Refunds
5. settlement_items ⭐

This table tells us:

Exactly what events are included inside a settlement.

This is especially useful when one settlement contains multiple events.

Column	Data Type	Constraints / Description
id	UUID	PK
settlement_id	UUID	FK → organization_settlements.id
event_id	UUID	FK → events.id
total_sales	DECIMAL(12,2)	Event sales snapshot
platform_fee	DECIMAL(12,2)	Event platform fee
other_charges	DECIMAL(12,2)	Event other charges
refunds	DECIMAL(12,2)	Event refunds
net_payable	DECIMAL(12,2)	Final event payable
created_at	TIMESTAMP	NOT NULL
updated_at	TIMESTAMP	NOT NULL
Example
Settlement SET-100

├── Comedy Night
│      Net Payable → ₹5,00,000
│
└── Music Concert
       Net Payable → ₹3,00,000

Total Settlement → ₹8,00,000
Recommended Constraint
UNIQUE(settlement_id, event_id)
6. settlement_payments

Stores the actual money paid to the organization.

Column	Data Type	Constraints / Description
id	UUID	PK
settlement_id	UUID	FK → organization_settlements.id
payment_number	VARCHAR(50)	UNIQUE
amount	DECIMAL(12,2)	Amount paid
currency	VARCHAR(10)	INR
payment_method	VARCHAR(50)	BANK_TRANSFER / UPI etc.
transaction_reference	VARCHAR(255)	Bank transaction ID
payment_status	VARCHAR(30)	PENDING / PROCESSING / SUCCESS / FAILED / CANCELLED
failure_reason	TEXT	NULL
paid_by	UUID	FK → users.id
paid_at	TIMESTAMP	NULL
created_at	TIMESTAMP	NOT NULL
updated_at	TIMESTAMP	NOT NULL
Supports partial payments
Settlement = ₹8,00,000

Payment 1 → ₹5,00,000
Payment 2 → ₹3,00,000

Total Paid → ₹8,00,000

Settlement Status → PAID
🔥 Final Relationship Diagram
                    BOOKINGS
                       │
                       ▼
                    PAYMENTS
                  /          \
                 ▼            ▼
             REFUNDS    FINANCIAL_CHARGES


              ORGANIZATION
                    │
                    ▼
         ORGANIZATION_SETTLEMENTS
                 /            \
                ▼              ▼
       SETTLEMENT_ITEMS   SETTLEMENT_PAYMENTS
                │
                ▼
              EVENTS
📊 Dashboard Calculations
Super Admin Financial Dashboard

Data comes from these tables:

payments
refunds
financial_charges
organization_settlements
settlement_payments

Show:

Total Money Received
Total Platform Fee
Total Other Charges
Total Refunds
Total Settled Amount
Total Pending Settlement

Organization-wise Financial Details
Event Organization Financial Dashboard

Every query filters by:

organization_id

They can see:

Total Ticket Sales
Platform Fees
Other Charges
Refunds

Net Earnings
Amount Received
Pending Amount

Settlement History
✅ Final Financial Tables
PAYMENT MODULE
│
├── payments
├── refunds
└── financial_charges


SETTLEMENT MODULE
│
├── organization_settlements
├── settlement_items
└── settlement_payments

chages in db design for seat locking 

✅ Changes Needed in Your DB Design for Seat Locking
1. Modify event_seats.status
Old:
AVAILABLE
BLOCKED
BOOKED
New:
AVAILABLE
BOOKED
UNAVAILABLE

Meaning:

AVAILABLE → Customer can book it
BOOKED → Successfully purchased
UNAVAILABLE → Organizer manually disables the seat
2. Do NOT add LOCKED to event_seats

Temporary locking should not be permanently stored in this table.

Temporary Lock → Redis
Permanent Booking → Database
3. seat_locks Table → Not needed for now

Since we plan to use Redis:

Customer selects seat
        ↓
Redis creates temporary lock
        ↓
TTL: 5–10 minutes

If payment:

SUCCESS → event_seats.status = BOOKED

If:

FAILED / TIMEOUT → Redis lock automatically expires
Final Changes Summary
DB Changes:

✅ Modify event_seats.status

Old:
AVAILABLE
BLOCKED
BOOKED

New:
AVAILABLE
BOOKED
UNAVAILABLE


❌ No seat_locks table for now

⭐ Redis will handle temporary seat locking later

So your existing Booking DB design does not need any other changes right now.

22. Step 7.1 — What is a Ticket?

After:

Booking → Payment SUCCESS → Booking CONFIRMED

The system generates tickets.

Example

Customer books:

Seat A1
Seat A2

The system creates:

Ticket 1 → Seat A1
Ticket 2 → Seat A2

So generally:

1 person / seat = 1 ticket

🎟️ tickets Table
Column	Type	Purpose
id	UUID	Primary Key
ticket_number	VARCHAR(50)	Unique ticket number
booking_id	UUID	FK → bookings.id
booking_item_id	UUID	FK → booking_items.id
event_id	UUID	FK → events.id
event_session_id	UUID	FK → event_sessions.id
organization_id	UUID	FK → organizations.id
customer_id	UUID	FK → users.id
ticket_status	VARCHAR(30)	Current ticket status
qr_token	VARCHAR(255)	Unique secure token for QR
checked_in_at	TIMESTAMP	Entry time
checked_in_by	UUID	Staff who scanned the ticket
created_at	TIMESTAMP	Creation time
updated_at	TIMESTAMP	Last update
Ticket Status

I recommend:

ACTIVE
USED
CANCELLED
INVALID
Meaning
ACTIVE     → Customer can use the ticket
USED       → Customer already entered
CANCELLED  → Ticket cancelled/refunded
INVALID    → Ticket cannot be used
QR Code Design ⭐

I recommend not storing the actual QR image in the database.

Instead:

tickets

qr_token → random-secure-token

Example:

qr_token:

a8f9xK29mPq7...

Then the QR code contains that token.

At the event entrance:

Staff scans QR
      ↓
System reads qr_token
      ↓
Find Ticket
      ↓
Check ticket_status
      ↓
ACTIVE?
      │
      ├── YES → Allow Entry
      │           ↓
      │        Status → USED
      │
      └── NO → Reject Entry
Example Record

Customer booked Seat A1:

ticket_number → TKT-2026-000001

booking_id → BK-100

booking_item_id → BI-1001

event_id → EVENT-10

event_session_id → SESSION-20

organization_id → ABC-EVENTS

customer_id → USER-100

ticket_status → ACTIVE

qr_token → secure-random-token

checked_in_at → NULL
checked_in_by → NULL
Why booking_item_id? ⭐

Because we need to know exactly what this ticket represents.

Example:

Booking BK-100

Booking Items:

Item 1 → Seat A1
Item 2 → Seat A2

Tickets:

Ticket 1 → Booking Item 1 → A1
Ticket 2 → Booking Item 2 → A2
What About Non-Seated Tickets?

Suppose:

VIP Ticket × 3

Your booking_items record:

VIP
quantity = 3

The system generates:

Ticket 1 → VIP
Ticket 2 → VIP
Ticket 3 → VIP

All three can point to the same:

booking_item_id

So:

One Booking Item
       ↓
Can Generate Many Tickets
Final Structure
tickets
│
├── id
├── ticket_number (UNIQUE)
│
├── booking_id → bookings.id
├── booking_item_id → booking_items.id
│
├── event_id → events.id
├── event_session_id → event_sessions.id
├── organization_id → organizations.id
├── customer_id → users.id
│
├── ticket_status
│
├── qr_token (UNIQUE)
│
├── checked_in_at
├── checked_in_by → users.id
│
├── created_at
└── updated_at
Important Relationships
BOOKING
   │
   ▼
BOOKING_ITEMS
   │
   ▼
TICKETS
   │
   ▼
QR CODE
Recommended Indexes
UNIQUE(ticket_number)
UNIQUE(qr_token)

INDEX(booking_id)
INDEX(event_session_id)
INDEX(organization_id)
INDEX(ticket_status)
Complete Ticket Flow
Payment SUCCESS
      ↓
Booking CONFIRMED
      ↓
Generate Ticket(s)
      ↓
ticket_status = ACTIVE
      ↓
Customer receives QR Ticket
      ↓
Staff scans QR
      ↓
Validate Ticket
      ↓
ACTIVE → USED

23. Step 7.2 — Ticket Check-in History

Currently, the tickets table stores:

ticket_status
checked_in_at
checked_in_by

This is enough for a simple MVP.

But if you want proper history, we should add a separate table:

ticket_checkins
Why?

Example:

Ticket scanned at 6:00 PM → Valid entry

Later scanned again at 6:05 PM → Rejected

We may want to keep both scan records.

Database Design
Column	Type	Purpose
id	UUID	Primary Key
ticket_id	UUID	FK → tickets.id
organization_id	UUID	Event organization
event_session_id	UUID	Event session
checked_in_by	UUID	Staff member
checkin_status	VARCHAR(30)	SUCCESS / REJECTED
rejection_reason	TEXT	Reason for rejection
checked_in_at	TIMESTAMP	Scan time
created_at	TIMESTAMP	Record created
Check-in Flow
Staff scans QR
       ↓
Find Ticket
       ↓
Is ticket ACTIVE?
       │
   ┌───┴────┐
   │        │
  YES       NO
   │        │
   ▼        ▼
SUCCESS   REJECTED
   │
   ▼
Ticket → USED
   │
   ▼
Create ticket_checkins record
Example
ticket_checkins

ticket_id → TKT-100

checked_in_by → Staff-20

checkin_status → SUCCESS

checked_in_at → 6:30 PM

If someone scans again:

ticket_id → TKT-100

checkin_status → REJECTED

rejection_reason → "Ticket already used"

checked_in_at → 6:35 PM
Should We Keep checked_in_at and checked_in_by in tickets?
Yes, I recommend keeping them. ✅

Because:

tickets
→ Shows current/final ticket status quickly

ticket_checkins
→ Complete scan history
Final Ticket Module
tickets
│
└── ticket_checkins
Current complete flow:
Booking
   ↓
Payment SUCCESS
   ↓
Ticket Generated
   ↓
Ticket ACTIVE
   ↓
Staff scans QR
   ↓
ticket_checkins record created
   ↓
Ticket status → USED

24. Step 8.1 — notifications
Purpose

This table stores in-app notifications for:

Customer
Organization Owner
Staff
Super Admin
Database Design
Column	Data Type	Purpose
id	UUID	Primary Key
user_id	UUID	FK → users.id (notification recipient)
organization_id	UUID	FK → organizations.id, nullable
notification_type	VARCHAR(50)	Type of notification
title	VARCHAR(255)	Notification title
message	TEXT	Notification message
related_entity_type	VARCHAR(50)	What this notification belongs to
related_entity_id	UUID	ID of related record
is_read	BOOLEAN	Read or unread
read_at	TIMESTAMP	When user read it
created_at	TIMESTAMP	Notification creation time
1. user_id — Who receives it?

Example:

user_id → Customer A

Notification:
"Your booking has been confirmed"

Every notification belongs to one recipient.

2. organization_id — Why nullable?

For organization-related notifications:

organization_id → ABC Events

But a customer might simply receive a notification related to their booking.

So:

organization_id → NULL (if not needed)

This is useful for filtering organization notifications.

3. notification_type

Examples:

BOOKING_CONFIRMED
PAYMENT_SUCCESS
PAYMENT_FAILED
TICKET_GENERATED
REFUND_SUCCESS

EVENT_REMINDER
EVENT_CANCELLED

STAFF_INVITED
STAFF_JOINED

SETTLEMENT_READY
SETTLEMENT_PAID
4. title and message

Example:

title:
Payment Successful

message:
Your payment of ₹2,000 was successful.
5. Related Entity ⭐

Instead of doing this:

booking_id
payment_id
refund_id
event_id
ticket_id

We use:

related_entity_type
related_entity_id
Example: Booking notification
related_entity_type → BOOKING

related_entity_id → booking-123
Example: Refund notification
related_entity_type → REFUND

related_entity_id → refund-456

This makes the table flexible.

6. is_read
false → Unread 🔴

true → Read ✅
Example Notification

Customer successfully books a ticket:

id → NOT-001

user_id → CUSTOMER-100

organization_id → ABC-EVENTS

notification_type → BOOKING_CONFIRMED

title → Booking Confirmed

message →
"Your booking for Comedy Night has been confirmed."

related_entity_type → BOOKING

related_entity_id → BK-100

is_read → false

read_at → NULL
Final Table
notifications
│
├── id
│
├── user_id → users.id
├── organization_id → organizations.id (nullable)
│
├── notification_type
│
├── title
├── message
│
├── related_entity_type
├── related_entity_id
│
├── is_read
├── read_at
│
└── created_at
Recommended Indexes
INDEX(user_id, is_read)

INDEX(organization_id)

INDEX(notification_type)

INDEX(created_at)
Example Flow
Payment SUCCESS
      ↓
Booking CONFIRMED
      ↓
Ticket Generated
      ↓
Create notifications
      │
      ├── Customer
      │     "Booking Confirmed"
      │
      └── Organization
            "New Booking Received"
Important Note

For now, this table is only for in-app notifications.

Later, if you add:

Email
SMS
Push Notifications

we can create a separate notification delivery/log table.

25. staff_invitations
Column	Data Type	Purpose
id	UUID	Primary Key
organization_id	UUID	FK → organizations.id
invitation_token	VARCHAR(255)	Unique secure token used in joining link
email	VARCHAR(255)	Optional – invited staff email
role_id	UUID	FK → roles.id
invited_by	UUID	FK → users.id
status	VARCHAR(30)	Invitation status
expires_at	TIMESTAMP	Link expiration time
used_at	TIMESTAMP	When invitation was used
created_at	TIMESTAMP	Creation time
updated_at	TIMESTAMP	Last update
Invitation Status
PENDING
USED
EXPIRED
CANCELLED
How the Joining Link Works

Example:

Organization: ABC Events

invitation_token:

x7k92abc...

The system generates a link containing the secure token.

Staff opens link
      ↓
System verifies token
      ↓
Checks:
- Is invitation PENDING?
- Is it expired?
      ↓
Staff registers / logs in
      ↓
Create organization membership
      ↓
Invitation status → USED
Important Question: Should Email Be Required?

I recommend:

email → NULLABLE

Why?

Your organization admin may simply generate a joining link and send it through:

WhatsApp
Email
SMS

However, if they specifically invite one person:

email → staff@email.com

Then only that email should be allowed to use the invitation.

Example
staff_invitations

id → INV-100

organization_id → ABC-EVENTS

invitation_token → secure-random-token

email → NULL

role_id → STAFF_ROLE

invited_by → ADMIN-10

status → PENDING

expires_at → Sept 15

used_at → NULL
Final Structure
staff_invitations
│
├── id
│
├── organization_id → organizations.id
│
├── invitation_token (UNIQUE)
├── email (nullable)
│
├── role_id → roles.id
│
├── invited_by → users.id
│
├── status
├── expires_at
├── used_at
│
├── created_at
└── updated_at
Recommended Indexes
UNIQUE(invitation_token)

INDEX(organization_id)

INDEX(status)

INDEX(expires_at)

26. Step 9.2 — organization_members 👥

This table connects a user to a specific organization.

When staff accepts the invitation:

Staff registers
      ↓
User created in users table
      ↓
organization_members record created
      ↓
Staff officially belongs to organization
Database Design
Column	Type	Purpose
id	UUID	Primary Key
organization_id	UUID	FK → organizations.id
user_id	UUID	FK → users.id
role_id	UUID	FK → roles.id
member_type	VARCHAR(30)	OWNER / ADMIN / STAFF
status	VARCHAR(30)	Membership status
joined_at	TIMESTAMP	When staff joined
created_at	TIMESTAMP	Record creation
updated_at	TIMESTAMP	Last update
Member Type
OWNER
ADMIN
STAFF

This gives us a simple way to identify what kind of organization member they are.

Status
ACTIVE
INACTIVE
SUSPENDED

Example:

organization_id → ABC Events
user_id         → Rahul
role_id         → Ticket Checker Role
member_type     → STAFF
status          → ACTIVE
Important Constraint ⭐

A user should not accidentally join the same organization twice.

UNIQUE(organization_id, user_id)

But the same user can belong to another organization in the future:

Rahul
 ├── ABC Events
 └── XYZ Events
Final Structure
organization_members
│
├── id
├── organization_id → organizations.id
├── user_id → users.id
├── role_id → roles.id
│
├── member_type
├── status
│
├── joined_at
├── created_at
└── updated_at
Staff flow so far
Organization Admin
      ↓
staff_invitations
      ↓
Staff registers
      ↓
users
      ↓
organization_members
      ↓
Staff appears in Organization Staff List

27. Step 9.3 — staff_profiles 👤

This table stores staff-specific details.

We already have general user information in the users table, such as:

Name
Email
Phone

So we should not duplicate those details here.

Why do we need staff_profiles?

Because an organization wants additional employee information:

Employee ID
Date of Joining
Employment Type
Department / Designation
Emergency Contact (optional)
Database Design
Column	Type	Purpose
id	UUID	Primary Key
organization_member_id	UUID	FK → organization_members.id
employee_code	VARCHAR(50)	Organization-specific employee ID
employment_type	VARCHAR(30)	Full-time / Part-time / Contract
designation	VARCHAR(100)	Job title
joining_date	DATE	Employee joining date
emergency_contact_name	VARCHAR(100)	Optional
emergency_contact_phone	VARCHAR(20)	Optional
created_at	TIMESTAMP	Created
updated_at	TIMESTAMP	Updated
Employment Type
FULL_TIME
PART_TIME
CONTRACT
TEMPORARY

Example:

Rahul

Organization: ABC Events

Employee Code: EMP-101

Employment Type: FULL_TIME

Designation: Event Coordinator

Joining Date: 2026-09-05
Important Constraint ⭐

One organization member should have only one staff profile:

UNIQUE(organization_member_id)

Also, employee codes should be unique inside an organization.

For example:

ABC Events → EMP-101
XYZ Events → EMP-101

This should be allowed.

We can handle this through the relationship with organization_members.

Final Structure
staff_profiles
│
├── id
│
├── organization_member_id → organization_members.id
│
├── employee_code
├── employment_type
├── designation
├── joining_date
│
├── emergency_contact_name
├── emergency_contact_phone
│
├── created_at
└── updated_at

28. Step 9.4 — staff_bank_accounts 🏦

This table stores the bank details needed to pay a staff member's:

Monthly Salary
Per-Event Payment
Other Payouts

We keep bank information separate from staff_profiles.

Database Design
Column	Type	Purpose
id	UUID	Primary Key
organization_member_id	UUID	FK → organization_members.id
account_holder_name	VARCHAR(150)	Bank account holder name
bank_name	VARCHAR(150)	Bank name
account_number	VARCHAR(255)	Encrypted bank account number
ifsc_code	VARCHAR(20)	IFSC code
account_type	VARCHAR(30)	SAVINGS / CURRENT
is_primary	BOOLEAN	Primary account for payouts
status	VARCHAR(30)	ACTIVE / INACTIVE
created_at	TIMESTAMP	Created
updated_at	TIMESTAMP	Updated
Why organization_member_id?

Because bank details are connected to the staff member inside a specific organization.

User
  ↓
Organization Member
  ↓
Staff Bank Account

This fits your SaaS model.

Example
Staff: Rahul

Organization: ABC Events

Account Holder Name: Rahul Kumar
Bank: HDFC Bank
Account Number: ********1234
IFSC: HDFC0001234

Primary Account: YES
Status: ACTIVE
Should a Staff Member Have Multiple Bank Accounts?

For now, yes, our design supports it:

Rahul
│
├── Bank Account 1 → Primary
│
└── Bank Account 2 → Secondary

But for your MVP, staff will normally have one primary bank account.

Important Constraint ⭐

Only one primary bank account per staff member.

Conceptually:

One organization_member
        ↓
Only ONE
is_primary = true

This validation can be enforced at the database/application level.

Security Important 🔥

We should not store bank account numbers as plain text.

Instead:

account_number → Encrypted

When displaying:

XXXXXXXX1234

Only authorized organization admins should be able to access bank details.

Final Structure
staff_bank_accounts
│
├── id
│
├── organization_member_id → organization_members.id
│
├── account_holder_name
├── bank_name
├── account_number (ENCRYPTED)
├── ifsc_code
├── account_type
│
├── is_primary
├── status
│
├── created_at
└── updated_at
Staff DB Progress
staff_invitations       ✅
organization_members    ✅
staff_profiles          ✅
staff_bank_accounts     ✅
staff_compensation      ⏭️
staff_event_assignments ⏭️
staff_payouts           ⏭️

29. Step 9.5 — staff_compensation 💰

This table defines how much and how a staff member should be paid.

Since you chose Option C, we support both:

Monthly Salary
+
Per-Event Payment
Why separate staff_compensation from staff_payouts?

Important difference:

staff_compensation
→ How much the staff SHOULD receive

staff_payouts
→ How much the organization ACTUALLY paid

Example:

Staff Salary = ₹30,000/month

This goes into:

staff_compensation

When the organization actually transfers ₹30,000:

staff_payouts
Database Design
Column	Type	Purpose
id	UUID	Primary Key
organization_member_id	UUID	FK → organization_members.id
compensation_type	VARCHAR(30)	MONTHLY / PER_EVENT / BOTH
monthly_salary	DECIMAL(12,2)	Nullable
per_event_amount	DECIMAL(12,2)	Nullable
currency	VARCHAR(10)	INR
effective_from	DATE	When compensation starts
effective_to	DATE	Nullable
status	VARCHAR(30)	ACTIVE / INACTIVE
created_at	TIMESTAMP	Created
updated_at	TIMESTAMP	Updated
Compensation Types
1. Monthly Salary
compensation_type → MONTHLY

monthly_salary → ₹30,000

per_event_amount → NULL
2. Per Event
compensation_type → PER_EVENT

monthly_salary → NULL

per_event_amount → ₹2,000

Meaning:

For every assigned/completed event, the staff member receives ₹2,000.

3. Both ⭐
compensation_type → BOTH

monthly_salary → ₹30,000

per_event_amount → ₹2,000

Meaning:

Monthly Salary → ₹30,000

PLUS

Every Event Worked → ₹2,000
Example
Rahul

Organization → ABC Events

Compensation Type → BOTH

Monthly Salary → ₹30,000

Per Event Amount → ₹2,000

Effective From → 2026-09-01

Status → ACTIVE
Can Salary Change Later? ⭐

Yes.

Example:

Old Salary

₹30,000
Effective: Jan 2026
        ↓
Salary Increased
        ↓
₹40,000
Effective: Oct 2026

We should not update the old record.

Instead:

staff_compensation

Record 1:
₹30,000
effective_from → Jan 2026
effective_to → Sep 2026

Record 2:
₹40,000
effective_from → Oct 2026
effective_to → NULL

This keeps salary history.

Final Structure
staff_compensation
│
├── id
│
├── organization_member_id
│       → organization_members.id
│
├── compensation_type
│       → MONTHLY
│       → PER_EVENT
│       → BOTH
│
├── monthly_salary (nullable)
├── per_event_amount (nullable)
├── currency
│
├── effective_from
├── effective_to
│
├── status
│
├── created_at
└── updated_at
Important Relationship
organization_members
        │
        │ One Staff
        ▼
staff_compensation
        │
        ├── Old Salary Record
        │
        └── Current Salary Record

30. Step 9.6 — staff_event_assignments 👥📅

This table connects a staff member with an event they are assigned to work on.

This is especially important for your PER_EVENT compensation.

Why do we need this table?

Example:

Rahul works for ABC Events

ABC Events creates:

Comedy Show
Music Concert
Corporate Event

Rahul may only work on:

Comedy Show ✅
Music Concert ❌
Corporate Event ✅

So we need to store:

Which staff member is assigned to which event.

Database Design
Column	Type	Purpose
id	UUID	Primary Key
organization_member_id	UUID	FK → organization_members.id
event_id	UUID	FK → events.id
event_session_id	UUID	FK → event_sessions.id, nullable
assignment_role	VARCHAR(100)	Responsibility in this event
status	VARCHAR(30)	Assignment status
assigned_by	UUID	FK → users.id
assigned_at	TIMESTAMP	Assignment date/time
completed_at	TIMESTAMP	When work was completed
created_at	TIMESTAMP	Created
updated_at	TIMESTAMP	Updated
event_session_id — Why nullable?
Assigned to the entire event:
Rahul → Comedy Show
event_id = Comedy Show
event_session_id = NULL
Assigned to a specific session:
Rahul → Comedy Show
          ↓
        7 PM Session
event_id = Comedy Show
event_session_id = SESSION-123
assignment_role

This is the staff member's specific responsibility for that event.

Examples:

TICKET_CHECKER
EVENT_MANAGER
COORDINATOR
SECURITY

This is different from their main organization role.

Example:

Organization Role → STAFF

Event Assignment Role → TICKET_CHECKER
Assignment Status
ASSIGNED
CONFIRMED
COMPLETED
CANCELLED
Meaning:
ASSIGNED
→ Admin assigned the staff

CONFIRMED
→ Staff confirmed availability

COMPLETED
→ Staff completed the event

CANCELLED
→ Assignment cancelled
Example
organization_member_id → Rahul

event_id → Comedy Night

event_session_id → NULL

assignment_role → TICKET_CHECKER

status → COMPLETED

assigned_by → Organization Admin

assigned_at → Sept 10

completed_at → Sept 15
🔥 How does this connect to Per-Event Payment?

This is important.

Suppose Rahul has:

compensation_type → PER_EVENT

per_event_amount → ₹2,000

After the event:

Staff Event Assignment
       ↓
Status = COMPLETED
       ↓
Staff is eligible for ₹2,000
       ↓
Create staff_payout record

So:

staff_event_assignments
          │
          ▼
     COMPLETED
          │
          ▼
     staff_payouts
Final Structure
staff_event_assignments
│
├── id
│
├── organization_member_id
│       → organization_members.id
│
├── event_id
│       → events.id
│
├── event_session_id
│       → event_sessions.id (nullable)
│
├── assignment_role
├── status
│
├── assigned_by
│       → users.id
│
├── assigned_at
├── completed_at
│
├── created_at
└── updated_at
⭐ Important Design Note

We should not store the payment amount directly here.

Because:

staff_event_assignments
→ Stores work assignment

staff_compensation
→ Defines how much they should earn

staff_payouts
→ Stores actual payment

This separation keeps the database clean.

31. Step 9.7 — staff_payouts 💰

This table stores the actual money paid to staff members.

Important difference:
staff_compensation
→ How much staff SHOULD receive

staff_payouts
→ How much staff ACTUALLY received
Example

Rahul has:

Monthly Salary → ₹30,000
Per Event → ₹2,000

At the end of September:

Monthly Salary Payment → ₹30,000

Comedy Event Payment → ₹2,000

Music Event Payment → ₹2,000

Each actual payment can be recorded in staff_payouts.

Database Design
Column	Type	Purpose
id	UUID	Primary Key
organization_member_id	UUID	FK → organization_members.id
staff_bank_account_id	UUID	FK → staff_bank_accounts.id
payout_type	VARCHAR(30)	Type of payment
amount	DECIMAL(12,2)	Amount paid
currency	VARCHAR(10)	INR
staff_event_assignment_id	UUID	FK → staff_event_assignments.id, nullable
payment_period_start	DATE	Salary period start, nullable
payment_period_end	DATE	Salary period end, nullable
status	VARCHAR(30)	Payment status
payment_method	VARCHAR(30)	BANK_TRANSFER etc.
transaction_reference	VARCHAR(255)	Payment transaction ID
paid_at	TIMESTAMP	When payment was completed
created_by	UUID	FK → users.id
created_at	TIMESTAMP	Record creation
updated_at	TIMESTAMP	Last update
payout_type
MONTHLY_SALARY
PER_EVENT
BONUS
OTHER
Example 1: Monthly Salary
organization_member_id → Rahul

payout_type → MONTHLY_SALARY

amount → ₹30,000

payment_period_start → Sept 1

payment_period_end → Sept 30

status → PAID
Example 2: Per-Event Payment
organization_member_id → Rahul

payout_type → PER_EVENT

amount → ₹2,000

staff_event_assignment_id → Rahul's Comedy Event Assignment

status → PAID

This lets us know exactly which event the payment was for.

Payment Status

I recommend:

PENDING
PROCESSING
PAID
FAILED
CANCELLED
Final Table Structure
staff_payouts
│
├── id
│
├── organization_member_id
│       → organization_members.id
│
├── staff_bank_account_id
│       → staff_bank_accounts.id
│
├── payout_type
├── amount
├── currency
│
├── staff_event_assignment_id (nullable)
│       → staff_event_assignments.id
│
├── payment_period_start (nullable)
├── payment_period_end (nullable)
│
├── status
│
├── payment_method
├── transaction_reference
├── paid_at
│
├── created_by → users.id
│
├── created_at
└── updated_at
Complete Staff Payment Flow
Staff joins organization
        ↓
staff_profiles
        ↓
staff_compensation
        ↓
Monthly Salary / Per Event Amount defined
        ↓
Staff works on event
        ↓
staff_event_assignments → COMPLETED
        ↓
Admin creates payout
        ↓
staff_payouts
        ↓
Money paid
        ↓
status = PAID
Staff Module is now almost complete ✅
staff_invitations        ✅
organization_members     ✅
staff_profiles           ✅
staff_bank_accounts      ✅
staff_compensation       ✅
staff_event_assignments  ✅
staff_payouts            ✅

32. Step 10 — Final event_media Database Design

Since you want to support both images and videos, this design will work for both.

event_media
Column	Type	Purpose
id	UUID	Primary Key
event_id	UUID	FK → events.id
organization_id	UUID	FK → organizations.id
media_type	VARCHAR(20)	IMAGE / VIDEO
media_role	VARCHAR(30)	BANNER / POSTER / GALLERY / PROMOTIONAL_VIDEO
media_url	TEXT	URL of image/video
storage_key	VARCHAR(500)	Cloud storage file key
thumbnail_url	TEXT	Thumbnail, mainly for videos
display_order	INT	Display order
is_active	BOOLEAN	Active or hidden
uploaded_by	UUID	FK → users.id
created_at	TIMESTAMP	Upload time
updated_at	TIMESTAMP	Last update
1. media_type
IMAGE
VIDEO
2. media_role
BANNER
POSTER
GALLERY
PROMOTIONAL_VIDEO

Example:

Comedy Night
│
├── IMAGE → BANNER
├── IMAGE → POSTER
├── IMAGE → GALLERY
├── IMAGE → GALLERY
│
└── VIDEO → PROMOTIONAL_VIDEO
Example Image
event_id → EVENT-101

media_type → IMAGE

media_role → BANNER

media_url → cloud-storage-url

display_order → 1
Example Video
event_id → EVENT-101

media_type → VIDEO

media_role → PROMOTIONAL_VIDEO

media_url → cloud-storage-url

thumbnail_url → cloud-storage-thumbnail-url
Final Structure
event_media
│
├── id
│
├── event_id → events.id
├── organization_id → organizations.id
│
├── media_type
├── media_role
│
├── media_url
├── storage_key
├── thumbnail_url (nullable)
│
├── display_order
├── is_active
│
├── uploaded_by → users.id
│
├── created_at
└── updated_at
Recommended Constraints
INDEX(event_id)

INDEX(organization_id)

INDEX(event_id, media_role)
Important rule

We should allow:

Many GALLERY images
Many PROMOTIONAL_VIDEO videos

But for an MVP, you may want to enforce:

Only ONE active BANNER per event
Only ONE active POSTER per event
Storage Flow
Organization uploads Image/Video
            ↓
Cloud Storage
(S3 / Cloudinary)
            ↓
Returns URL + Storage Key
            ↓
Save metadata in event_media table

✅ Event Media module is complete.

33.   ⭐ Final Reviews & Ratings DB Design
Table: event_reviews
Column	Type	Description
id	UUID	Primary Key
event_id	UUID	FK → events.id
organization_id	UUID	FK → organizations.id
user_id	UUID	FK → users.id
booking_id	UUID	FK → bookings.id
rating	SMALLINT	Rating from 1 to 5
review	TEXT	Customer's review
status	VARCHAR(30)	Review status
created_at	TIMESTAMP	Review creation time
updated_at	TIMESTAMP	Last update
Structure
event_reviews
│
├── id
│
├── event_id → events.id
├── organization_id → organizations.id
│
├── user_id → users.id
├── booking_id → bookings.id
│
├── rating
├── review
├── status
│
├── created_at
└── updated_at
Rating Rule
CHECK(rating BETWEEN 1 AND 5)
Unique Rule ⭐
UNIQUE(user_id, event_id)

Meaning:

One customer can review one event only once.

Status
PUBLISHED
HIDDEN
PUBLISHED → Visible publicly
HIDDEN → Hidden by Super Admin for spam/abuse
Final Business Rules
✅ Customer must have booked the event
✅ One review per customer per event
✅ Rating must be between 1–5
❌ Customer cannot edit review
❌ Customer cannot delete review
✅ Super Admin can hide inappropriate reviews
Final flow
Customer books event
       ↓
Event happens
       ↓
Customer submits review
       ↓
Review permanently stored
       ↓
status = PUBLISHED

This completes the Reviews & Ratings module.

34. 1️⃣ subscription_plans

This table stores the main plan information, limits, and features.

Column	Type	Description
id	UUID	Primary Key
name	VARCHAR(100)	Plan name, e.g. FREE, PRO
description	TEXT	Description of the plan
max_events	INT	Maximum events allowed
max_staff	INT	Maximum staff allowed
max_venues	INT	Maximum venues allowed
features	JSON / JSONB	Additional features
is_active	BOOLEAN	Whether the plan is available
created_at	TIMESTAMP	Creation time
updated_at	TIMESTAMP	Last update time
Structure
subscription_plans
│
├── id
├── name
├── description
│
├── max_events
├── max_staff
├── max_venues
│
├── features
├── is_active
│
├── created_at
└── updated_at
2️⃣ subscription_plan_prices

This table stores the Monthly and Yearly prices.

Column	Type	Description
id	UUID	Primary Key
subscription_plan_id	UUID	FK → subscription_plans.id
billing_interval	VARCHAR(20)	MONTHLY / YEARLY
price	DECIMAL(12,2)	Subscription price
currency	VARCHAR(10)	Currency, e.g. INR
is_active	BOOLEAN	Whether this pricing option is active
created_at	TIMESTAMP	Creation time
updated_at	TIMESTAMP	Last update time
Structure
subscription_plan_prices
│
├── id
│
├── subscription_plan_id
│       → subscription_plans.id
│
├── billing_interval
│       → MONTHLY
│       → YEARLY
│
├── price
├── currency
├── is_active
│
├── created_at
└── updated_at
🔗 Relationship
subscription_plans
       │
       │ One Plan
       ▼
subscription_plan_prices
       │
       ├── Monthly Price
       │
       └── Yearly Price
Example
PRO Plan
│
├── Limits
│   ├── Events → 20
│   ├── Staff → 50
│   └── Venues → 10
│
├── Features
│   ├── Analytics → Yes
│   └── Advanced Features → Yes
│
└── Prices
    │
    ├── MONTHLY → ₹999
    │
    └── YEARLY → ₹9,999
⭐ Important Constraints
subscription_plans:
UNIQUE(name)
subscription_plan_prices:
UNIQUE(subscription_plan_id, billing_interval)

This ensures one plan cannot accidentally have two Monthly prices or two Yearly prices.

36. Step 12.2 — organization_subscriptions 💳

This table records which subscription plan an organization has chosen and keeps its subscription history.

Flow
Organization registers
       ↓
Chooses PRO plan
       ↓
Chooses MONTHLY or YEARLY
       ↓
Payment successful
       ↓
Subscription becomes ACTIVE
organization_subscriptions
Column	Type	Description
id	UUID	Primary Key
organization_id	UUID	FK → organizations.id
subscription_plan_id	UUID	FK → subscription_plans.id
subscription_plan_price_id	UUID	FK → subscription_plan_prices.id
status	VARCHAR(30)	Subscription status
started_at	TIMESTAMP	Subscription start date
expires_at	TIMESTAMP	Subscription expiry date
cancelled_at	TIMESTAMP	Cancellation date, nullable
created_at	TIMESTAMP	Record creation
updated_at	TIMESTAMP	Last update
Why store both subscription_plan_id and subscription_plan_price_id?

Example:

Plan → PRO
Price Option → YEARLY → ₹9,999

So:

subscription_plan_id
        ↓
PRO

subscription_plan_price_id
        ↓
PRO YEARLY PRICE

This makes queries easier and clearly identifies the billing option.

Subscription Status
PENDING
ACTIVE
EXPIRED
CANCELLED
PAST_DUE
Meaning
PENDING
→ Organization selected plan but payment isn't completed

ACTIVE
→ Organization can use the plan

EXPIRED
→ Subscription period ended

CANCELLED
→ Organization cancelled subscription

PAST_DUE
→ Renewal payment failed or is overdue
Example
organization_id → ABC Events

subscription_plan_id → PRO

subscription_plan_price_id → PRO YEARLY

status → ACTIVE

started_at → 2026-09-05

expires_at → 2027-09-05
Final Structure
organization_subscriptions
│
├── id
│
├── organization_id
│       → organizations.id
│
├── subscription_plan_id
│       → subscription_plans.id
│
├── subscription_plan_price_id
│       → subscription_plan_prices.id
│
├── status
│
├── started_at
├── expires_at
├── cancelled_at (nullable)
│
├── created_at
└── updated_at
Relationship
organizations
      │
      ▼
organization_subscriptions
      │
      ├── subscription_plans
      │
      └── subscription_plan_prices

37. Step 12.3 — subscription_payments 💳💰

This table records the actual payments made by organizations for their SaaS subscriptions.

Remember, this is different from customer event payments.

Customer Event Payment
→ Customer pays for an event ticket

Subscription Payment
→ Organization pays to use your SaaS platform
Flow
Organization selects PRO Plan
        ↓
Selects MONTHLY
        ↓
Payment initiated
        ↓
Payment successful
        ↓
subscription_payments created
        ↓
organization_subscription → ACTIVE
subscription_payments
Column	Type	Description
id	UUID	Primary Key
organization_id	UUID	FK → organizations.id
organization_subscription_id	UUID	FK → organization_subscriptions.id
subscription_plan_price_id	UUID	FK → subscription_plan_prices.id
amount	DECIMAL(12,2)	Amount paid
currency	VARCHAR(10)	INR
status	VARCHAR(30)	Payment status
payment_method	VARCHAR(30)	CARD / UPI / BANK_TRANSFER etc.
payment_gateway	VARCHAR(50)	Razorpay, Stripe, etc.
gateway_payment_id	VARCHAR(255)	Payment gateway transaction ID
paid_at	TIMESTAMP	When payment was successful
created_at	TIMESTAMP	Payment record created
updated_at	TIMESTAMP	Last update
Payment Status
PENDING
PROCESSING
SUCCESS
FAILED
REFUNDED
Example

Suppose:

Organization → ABC Events

Plan → PRO

Billing → YEARLY

Price → ₹9,999

Then:

subscription_payments

organization_id → ABC Events

organization_subscription_id → SUB-101

subscription_plan_price_id → PRO YEARLY

amount → ₹9,999

currency → INR

status → SUCCESS

payment_method → UPI

payment_gateway → Razorpay

gateway_payment_id → pay_xxxxxxxxx

paid_at → 2026-09-05
Important Design Point ⭐
Why store amount separately?

Suppose today:

PRO YEARLY → ₹9,999

Later, Super Admin changes it to:

PRO YEARLY → ₹12,999

Old payment records should still show:

₹9,999

Therefore:

subscription_plan_prices
→ Current plan price

subscription_payments.amount
→ Actual amount paid historically
Final Structure
subscription_payments
│
├── id
│
├── organization_id
│       → organizations.id
│
├── organization_subscription_id
│       → organization_subscriptions.id
│
├── subscription_plan_price_id
│       → subscription_plan_prices.id
│
├── amount
├── currency
│
├── status
│
├── payment_method
├── payment_gateway
├── gateway_payment_id
│
├── paid_at
│
├── created_at
└── updated_at
Complete SaaS Subscription Flow
SUPER ADMIN
    │
    ▼
subscription_plans
    │
    ▼
subscription_plan_prices
    │
    ▼
Organization chooses plan
    │
    ▼
organization_subscriptions
    │
    ▼
Organization pays
    │
    ▼
subscription_payments
SaaS Subscription Module So Far
subscription_plans              ✅
subscription_plan_prices        ✅
organization_subscriptions      ✅
subscription_payments           ✅ 