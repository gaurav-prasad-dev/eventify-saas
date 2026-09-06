Modified Database Design – Multi-Tenant Event Booking SaaS

Final modified database design based on your SaaS business plan.

Platform & Authentication

users

organizations

organization_members

roles

permissions

role_permissions

organization_invitations

Venue Management

venues

venue_seating_layouts

venue_seats

Event Management

events

event_sessions

ticket_types

event_seats

Future Booking Module

bookings

booking_items

payments

tickets

users

id UUID PK

name VARCHAR

email VARCHAR UNIQUE

password_hash VARCHAR

phone VARCHAR nullable

status

created_at

updated_at

organizations

id UUID PK

name

slug UNIQUE

status ACTIVE/SUSPENDED

created_at

updated_at

organization_members

id UUID PK

organization_id FK

user_id FK

role_id FK

status

joined_at

UNIQUE(organization_id, user_id)

roles

id UUID PK

organization_id FK nullable for system roles

name

description

permissions

id UUID PK

name UNIQUE

description

role_permissions

role_id FK

permission_id FK

UNIQUE(role_id, permission_id)

organization_invitations

id UUID PK

organization_id FK

role_id FK

token UNIQUE

expires_at

max_uses nullable

used_count default 0

status

created_by FK

created_at

venues

id UUID PK

organization_id FK

name

address

capacity

status

created_at

updated_at

venue_seating_layouts

id UUID PK

venue_id FK

name

description nullable

is_default

status

created_at

updated_at

venue_seats

id UUID PK

layout_id FK

seat_number

row_number nullable

section nullable

seat_type nullable

x_position

y_position

status

UNIQUE(layout_id, seat_number)

events

id UUID PK

organization_id FK

title

slug UNIQUE

description

event_type

status DRAFT/PUBLISHED/UNPUBLISHED/ARCHIVED

created_by FK

created_at

updated_at

event_sessions

id UUID PK

event_id FK

venue_id FK

seating_layout_id FK nullable

booking_type SEATED/NON_SEATED

start_at

end_at

status SCHEDULED/CANCELLED/COMPLETED

created_at

updated_at

ticket_types

id UUID PK

event_session_id FK

name

description nullable

price DECIMAL(10,2)

total_quantity nullable

status

sale_start_at nullable

sale_end_at nullable

created_at

updated_at

event_seats

id UUID PK

event_session_id FK

venue_seat_id FK

ticket_type_id FK

price DECIMAL(10,2)

status AVAILABLE/BLOCKED/BOOKED

created_at

updated_at

UNIQUE(event_session_id, venue_seat_id)

Important Changes Made

Changed is_seated to booking_type (SEATED / NON_SEATED).

Added organization_invitations for staff joining links.

Added UNIQUE constraints to prevent duplicate venue seats and event seats.

Roles support organization-specific custom roles; global system roles may have organization_id = NULL.

Customers remain global users and can book events from multiple organizations.

Events belong to organizations for tenant isolation.

Ticket types belong to event sessions because sessions may have different pricing.

Final Relationship Overview

USERS → ORGANIZATION_MEMBERS → ORGANIZATIONS
ORGANIZATIONS → VENUES → VENUE_SEATING_LAYOUTS → VENUE_SEATS
ORGANIZATIONS → EVENTS → EVENT_SESSIONS → TICKET_TYPES
EVENT_SESSIONS → EVENT_SEATS → VENUE_SEATS
ROLES → ROLE_PERMISSIONS → PERMISSIONS


-------------------------------------------------------

Complete Database Design – Multi-Tenant Event Booking SaaS

This version includes all tables, columns, data types, relationships, and key constraints designed so far.

users

Column

Data Type

Constraints / Description

id

UUID

PK

name

VARCHAR(100)

NOT NULL

email

VARCHAR(255)

UNIQUE, NOT NULL

password_hash

VARCHAR(255)

NOT NULL

phone

VARCHAR(20)

NULL

status

VARCHAR(20)

ACTIVE / INACTIVE

created_at

TIMESTAMP

NOT NULL

updated_at

TIMESTAMP

NOT NULL

organizations

Column

Data Type

Constraints / Description

id

UUID

PK

name

VARCHAR(150)

NOT NULL

slug

VARCHAR(150)

UNIQUE

status

VARCHAR(20)

ACTIVE / SUSPENDED

created_at

TIMESTAMP

NOT NULL

updated_at

TIMESTAMP

NOT NULL

organization_members

Column

Data Type

Constraints / Description

id

UUID

PK

organization_id

UUID

FK → organizations.id

user_id

UUID

FK → users.id

role_id

UUID

FK → roles.id

status

VARCHAR(20)

ACTIVE / INACTIVE

joined_at

TIMESTAMP

NULL

created_at

TIMESTAMP

NOT NULL

updated_at

TIMESTAMP

NOT NULL

Important Constraint(s):

UNIQUE(organization_id, user_id)

roles

Column

Data Type

Constraints / Description

id

UUID

PK

organization_id

UUID

FK → organizations.id, NULL for global/system role

name

VARCHAR(100)

NOT NULL

description

TEXT

NULL

created_at

TIMESTAMP

NOT NULL

permissions

Column

Data Type

Constraints / Description

id

UUID

PK

name

VARCHAR(100)

UNIQUE, NOT NULL

description

TEXT

NULL

role_permissions

Column

Data Type

Constraints / Description

role_id

UUID

FK → roles.id

permission_id

UUID

FK → permissions.id

Important Constraint(s):

UNIQUE(role_id, permission_id)

organization_invitations

Column

Data Type

Constraints / Description

id

UUID

PK

organization_id

UUID

FK → organizations.id

role_id

UUID

FK → roles.id

token

VARCHAR(255)

UNIQUE, NOT NULL

expires_at

TIMESTAMP

NOT NULL

max_uses

INTEGER

NULL

used_count

INTEGER

DEFAULT 0

status

VARCHAR(20)

ACTIVE / EXPIRED / DISABLED

created_by

UUID

FK → users.id

created_at

TIMESTAMP

NOT NULL

venues

Column

Data Type

Constraints / Description

id

UUID

PK

organization_id

UUID

FK → organizations.id

name

VARCHAR(150)

NOT NULL

address

TEXT

NOT NULL

capacity

INTEGER

NULL

status

VARCHAR(20)

ACTIVE / INACTIVE

created_at

TIMESTAMP

NOT NULL

updated_at

TIMESTAMP

NOT NULL

venue_seating_layouts

Column

Data Type

Constraints / Description

id

UUID

PK

venue_id

UUID

FK → venues.id

name

VARCHAR(150)

NOT NULL

description

TEXT

NULL

is_default

BOOLEAN

DEFAULT FALSE

status

VARCHAR(20)

ACTIVE / INACTIVE

created_at

TIMESTAMP

NOT NULL

updated_at

TIMESTAMP

NOT NULL

venue_seats

Column

Data Type

Constraints / Description

id

UUID

PK

layout_id

UUID

FK → venue_seating_layouts.id

seat_number

VARCHAR(20)

NOT NULL

row_number

VARCHAR(20)

NULL

section

VARCHAR(100)

NULL

seat_type

VARCHAR(50)

NULL

x_position

DECIMAL(10,2)

NOT NULL

y_position

DECIMAL(10,2)

NOT NULL

status

VARCHAR(20)

ACTIVE / INACTIVE

created_at

TIMESTAMP

NOT NULL

updated_at

TIMESTAMP

NOT NULL

Important Constraint(s):

UNIQUE(layout_id, seat_number)

events

Column

Data Type

Constraints / Description

id

UUID

PK

organization_id

UUID

FK → organizations.id

title

VARCHAR(255)

NOT NULL

slug

VARCHAR(255)

UNIQUE, NOT NULL

description

TEXT

NULL

event_type

VARCHAR(100)

NOT NULL

status

VARCHAR(20)

DRAFT / PUBLISHED / UNPUBLISHED / ARCHIVED

created_by

UUID

FK → users.id

created_at

TIMESTAMP

NOT NULL

updated_at

TIMESTAMP

NOT NULL

event_sessions

Column

Data Type

Constraints / Description

id

UUID

PK

event_id

UUID

FK → events.id

venue_id

UUID

FK → venues.id

seating_layout_id

UUID

FK → venue_seating_layouts.id, NULL

booking_type

VARCHAR(20)

SEATED / NON_SEATED

start_at

TIMESTAMP

NOT NULL

end_at

TIMESTAMP

NOT NULL

status

VARCHAR(20)

SCHEDULED / CANCELLED / COMPLETED

created_at

TIMESTAMP

NOT NULL

updated_at

TIMESTAMP

NOT NULL

ticket_types

Column

Data Type

Constraints / Description

id

UUID

PK

event_session_id

UUID

FK → event_sessions.id

name

VARCHAR(100)

NOT NULL

description

TEXT

NULL

price

DECIMAL(10,2)

NOT NULL

total_quantity

INTEGER

NULL

status

VARCHAR(20)

ACTIVE / INACTIVE

sale_start_at

TIMESTAMP

NULL

sale_end_at

TIMESTAMP

NULL

created_at

TIMESTAMP

NOT NULL

updated_at

TIMESTAMP

NOT NULL

event_seats

Column

Data Type

Constraints / Description

id

UUID

PK

event_session_id

UUID

FK → event_sessions.id

venue_seat_id

UUID

FK → venue_seats.id

ticket_type_id

UUID

FK → ticket_types.id

price

DECIMAL(10,2)

NOT NULL

status

VARCHAR(20)

AVAILABLE / BLOCKED / BOOKED

created_at

TIMESTAMP

NOT NULL

updated_at

TIMESTAMP

NOT NULL

Important Constraint(s):

UNIQUE(event_session_id, venue_seat_id)

Final Relationship Overview

users
 ├── organization_members → organizations
 └── customers (bookings will be added next)

organizations
 ├── organization_invitations
 ├── venues → venue_seating_layouts → venue_seats
 └── events → event_sessions
                  ├── ticket_types
                  └── event_seats → venue_seats

roles → role_permissions → permissions

Important Business Rules

Customers are global platform users and can book events from multiple organizations.

Organization members only access data for organizations they belong to.

Each event belongs to exactly one organization.

Each event can have multiple sessions.

SEATED sessions use venue layouts and event_seats.

NON_SEATED sessions use ticket_types and ticket quantities.

Temporary seat locks will later be handled using Redis.