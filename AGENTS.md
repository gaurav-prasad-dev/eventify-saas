# AGENTS.md

## 1. Project Overview

Project Name: Eventify SaaS

Eventify is a multi-tenant Event Management SaaS and Ticket Booking Platform.

The platform has multiple applications:

1. Marketplace
   - Customers can browse events.
   - Customers can book tickets.
   - Customers can manage their bookings.

2. Organizer Dashboard
   - Event organizations can manage their business.
   - Manage venues.
   - Create and manage events.
   - Manage tickets.
   - Manage event staff.
   - View bookings and event-related data.

3. Admin Dashboard
   - Super Admin manages the entire platform.
   - Manage organizations.
   - Manage subscriptions.
   - Manage payments.
   - Manage refunds.
   - Monitor platform activities.

The backend will serve all applications through APIs.

---

## 2. Tech Stack

### Backend

- Node.js
- javaScript
- Express.js

### Database

- PostgreSQL

### ORM

- Prisma

### Validation

- Zod

### API Style

- REST API

### Frontend

- React.js
- Tailwind CSS

Frontend applications will be developed later.

---

## 2.1 🚨 ZERO-TOLERANCE RULES FOR ALL AI AGENTS

> [!CAUTION]
> **MANDATORY HUMAN APPROVAL REQUIRED FOR ALL GIT AND DATABASE OPERATIONS:**
>
> 1. **GIT OPERATIONS — STRICT PERMISSION REQUIRED:**
>    - AI agents MUST NEVER execute `git add`, `git commit`, `git push`, `git pull`, `git checkout`, `git merge`, `git branch`, or `git stash` without EXPLICIT user approval in each instance.
>    - AI agents may ONLY run read-only git inspection commands (`git status`, `git diff`, `git log`) to check work.
>    - Always present proposed file changes to the user and ask for permission before staging, committing, or pushing anything.
>
> 2. **DATABASE OPERATIONS — STRICT PERMISSION REQUIRED:**
>    - AI agents MUST NEVER run `npx prisma migrate dev`, `prisma migrate deploy`, `prisma db push`, `prisma migrate reset`, database seeds, or SQL mutations without EXPLICIT user approval in each instance.
>    - When database changes are needed, prepare and show the `schema.prisma` edits to the user, explain the data impact, and ask for permission before running any migration or database command.

---

## 3. Core Architecture Principles

The project must follow:

- Modular architecture
- Separation of concerns
- Service → Controller → Route pattern
- Multi-tenant architecture
- Scalable folder structure
- Reusable shared utilities
- Consistent API responses
- Centralized error handling

## 4. Project Folder Architecture Rules

The project root structure must follow:

```text
Eventify/
│
├── AGENTS.md
├── docs/
│
├── api/
│
├── marketplace-web/
├── organizer-dashboard/
└── admin-dashboard/
Application Responsibilities
api/

Contains the complete backend application.

The backend serves:

Marketplace
Organizer Dashboard
Admin Dashboard

AI agents must NOT create separate backend applications unless explicitly instructed.

marketplace-web/

Customer-facing application.

Used for:

Browsing events
Viewing event details
Booking tickets
Managing customer bookings
organizer-dashboard/

Used by event organizations to manage:

Organization
Venues
Events
Tickets
Staff
Bookings
admin-dashboard/

Used by Super Admin to manage:

Organizations
Users
Subscriptions
Payments
Refunds
Platform monitoring
4.1 Backend Folder Structure

The backend must follow this structure:

api/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   │
│   ├── config/
│   │
│   ├── modules/
│   │
│   ├── shared/
│   │   ├── middleware/
│   │   ├── errors/
│   │   ├── utils/
│   │   ├── constants/
│   │   └── types/
│   │
│   ├── routes/
│   │
│   ├── app.js
│   └── server.js
│
├── tests/
│
├── package.json
├── .env
└── .env.example
4.2 Folder Responsibilities
prisma/

Contains database-related files.

prisma/
├── schema.prisma
└── migrations/

AI agents must use Prisma for database access.

src/modules/

Contains all business modules.

Examples:

modules/
├── auth/
├── users/
├── organizations/
├── venues/
├── events/
├── tickets/
└── bookings/

Each module should contain only code related to that module.

src/shared/

Contains reusable code shared across multiple modules.

Examples:

shared/
├── middleware/
├── errors/
├── utils/
├── constants/
└── types/

AI agents must NOT place business logic inside shared/.

src/config/

Contains application configuration.

Examples:

Environment configuration
Application configuration
External service configuration
src/routes/

Contains API route registration.

This folder should connect module routes to the main application.

app.js

Responsible for:

Creating the Express application
Registering middleware
Registering routes
Registering global error handling
server.js

Responsible for:

Starting the HTTP server
Loading the application
Handling server startup
4.3 File Creation Rules

AI agents MUST:

Follow the existing folder structure.
Create files only where they logically belong.
Check existing code before creating duplicate utilities.
Reuse existing shared utilities when possible.
Avoid unnecessary folders and files.

AI agents MUST NOT:

Create random folder structures.
Move unrelated files.
Rename existing folders without approval.
Create duplicate configuration files.
Mix unrelated modules together.

4.4 Language Rules

The backend currently uses JavaScript.

AI agents MUST:

Use .js files.
Use JavaScript syntax.
Follow the existing module system used by the project.

AI agents MUST NOT:

Create .ts files.
Add TypeScript configuration.
Convert the project to TypeScript without explicit approval.

## Important Note

I included `shared/types/`, but since you're using **JavaScript**, we may not need that folder initially. JavaScript has no TypeScript types.

We can either:

```text
Option A (Recommended now)
Remove shared/types/

or keep it for future JSDoc/type definitions.


# 5. Module Creation Rules

Every business feature must follow a consistent module structure.

AI agents must NOT randomly create files or skip layers.

---

## 5.1 Standard Module Structure

Example: Venue Module

```text
src/modules/
└── venue/
    ├── venue.service.js
    ├── venue.controller.js
    ├── venue.routes.js
    └── venue.validation.js

Additional files should only be created when genuinely needed.

For example:

venue/
├── venue.service.js
├── venue.controller.js
├── venue.routes.js
├── venue.validation.js
├── venue.constants.js      # Only if needed
└── venue.utils.js          # Only if needed
5.2 New Module Creation Flow

When creating a completely new module, AI agents must follow this process:

Understand Requirements
        ↓
Check Existing Documentation
        ↓
Check Existing Prisma Schema
        ↓
Database Schema Change (if required)
        ↓
Create Prisma Migration
        ↓
Create Zod Validation
        ↓
Create Service
        ↓
Create Controller
        ↓
Create Routes
        ↓
Register Routes
        ↓
Test API
5.3 Database First Rule

Before creating a module, determine whether it requires database changes.

If database changes are required:

Update schema.prisma
        ↓
Review Relationships
        ↓
Create Migration
        ↓
Apply Migration
        ↓
Generate Prisma Client
        ↓
Create Module Logic

AI agents must NOT manually create database tables outside Prisma migrations unless explicitly instructed.

5.4 Validation Rules

Every API that accepts user input must use Zod validation.

Validation must happen before the request reaches the controller.

Example flow:

Client Request
      ↓
Route
      ↓
Validation Middleware
      ↓
Controller
      ↓
Service
      ↓
Database

Validation schemas should remain inside the related module.

Example:

venue/
└── venue.validation.js
5.5 Service Rules

Services contain business logic.

Services are responsible for:

Business rules
Database operations
Data processing
Module-specific logic

Services MUST NOT:

Directly handle HTTP requests
Directly send HTTP responses

Example:

Controller
    ↓
Service
    ↓
Prisma
    ↓
PostgreSQL
5.6 Controller Rules

Controllers handle HTTP requests and responses.

Controllers are responsible for:

Receiving request data
Calling services
Returning responses

Controllers MUST NOT contain complex business logic.

Controllers should remain thin.

Example:

Request
   ↓
Controller
   ↓
Service
   ↓
Response
5.7 Route Rules

Routes are responsible for:

Defining API endpoints
Applying middleware
Applying validation
Calling controllers

Example:

POST /venues
        ↓
Validation Middleware
        ↓
Venue Controller

Routes MUST NOT contain business logic.

5.8 Module Isolation Rules

AI agents must:

Keep module-specific logic inside its module.
Avoid importing unrelated modules unnecessarily.
Reuse shared utilities when appropriate.
Avoid circular dependencies.

AI agents must NOT:

Put Event logic inside the Venue module.
Put Booking logic inside the Ticket module unless required.
Create duplicate utilities.
5.9 Existing Module Changes

When modifying an existing module, AI agents must follow:

Understand Existing Module
        ↓
Check Related Modules
        ↓
Check Database Impact
        ↓
Make Minimal Required Changes
        ↓
Update Validation
        ↓
Update Service
        ↓
Update Controller if needed
        ↓
Update Routes if needed
        ↓
Test Existing Functionality

AI agents must NOT rewrite an entire module when only a small change is required.

5.10 Before Creating a Module

AI agents must first check:

Relevant documentation inside /docs.
Existing database schema.
Existing related modules.
Existing shared utilities.
Existing API conventions.

Do not start coding blindly.


---

# What this rule achieves

Now, whenever you tell an AI agent:

> Create the Venue module

It should understand this flow:

```text
📄 Read docs
      ↓
🗄️ Check Prisma
      ↓
✏️ Update schema if required
      ↓
📦 Migration
      ↓
🛡️ Zod validation
      ↓
⚙️ Service
      ↓
🎮 Controller
      ↓
🛣️ Routes
      ↓
🧪 Test
Current AGENTS.md Progress
✅ 1. Project Overview
✅ 2. Tech Stack
✅ 3. Architecture Principles
✅ 4. Folder Architecture Rules
✅ 5. Module Creation Rules

# 6. Prisma & Database Rules

## 6.1 Database Technology

The project uses:

- PostgreSQL as the database.
- Prisma as the ORM.
- Prisma Client for database queries.

Database schema changes must be managed through Prisma.

---

## 6.2 Prisma Schema Rules

The main database schema is located at:

```text
api/prisma/schema.prisma

AI agents MUST:

Check the existing schema before making changes.
Follow existing naming conventions.
Check relationships before modifying models.
Avoid creating duplicate models.
Keep database relationships clear and properly defined.

AI agents MUST NOT:

Create database tables manually outside Prisma.
Modify unrelated models unnecessarily.
Delete models or fields without explicit approval.
Rename existing database fields without checking their impact.
6.3 Database Change Workflow

Whenever a new feature requires database changes:

Understand Feature Requirements
        ↓
Check Existing Prisma Schema
        ↓
Check Existing Relationships
        ↓
Modify schema.prisma
        ↓
Review Changes
        ↓
Create Prisma Migration
        ↓
Apply Migration
        ↓
Generate Prisma Client
        ↓
Update Application Code
        ↓
Test Database Operations
6.4 Migration Rules

Database changes must use Prisma migrations.

Typical workflow:

schema.prisma changed
        ↓
Create Migration
        ↓
Migration file generated
        ↓
PostgreSQL database updated

AI agents MUST:

Explain what database changes are being made.
Review schema changes before creating migrations.
Use descriptive migration names.
Check whether existing data could be affected.

AI agents MUST NOT:

Delete migration files.
Edit old migrations that have already been applied.
Use destructive database commands without approval.
Reset the database without explicit approval.
6.5 New Model Rules

When creating a new Prisma model, AI agents must check:

Does a similar model already exist?
Does this model belong to another existing module?
What relationships does it require?
Does it require organization or tenant isolation?
What indexes may be required?

Example:

New Feature
    ↓
Does it need a database model?
    ↓
Check existing models
    ↓
Define relationships
    ↓
Add model to schema.prisma
    ↓
Create migration
6.6 Existing Database Changes

Before modifying an existing database model:

Check Existing Model
        ↓
Check Related Models
        ↓
Check Existing Data Impact
        ↓
Make Minimal Change
        ↓
Create Migration
        ↓
Test Existing Functionality

AI agents must avoid unnecessary schema changes.

6.7 Prisma Client Rules

All database operations must use Prisma Client.

Application flow:

Service
   ↓
Prisma Client
   ↓
PostgreSQL

Controllers must NOT directly access Prisma.

Preferred:

Controller
    ↓
Service
    ↓
Prisma

Avoid:

Controller
    ↓
Prisma ❌
6.8 Database Queries

AI agents should:

Select only required fields when appropriate.
Avoid unnecessary database queries.
Use transactions when multiple related database operations must succeed or fail together.
Consider indexes for frequently queried fields.
Avoid N+1 query problems where possible.

Do not optimize prematurely, but avoid obviously inefficient queries.

6.9 Multi-Tenant Data Rules

Eventify is a multi-tenant SaaS platform.

When creating organization-specific data, AI agents must consider:

Organization
      │
      ├── Venues
      ├── Events
      ├── Staff
      └── Other organization data

Organization-specific data must be properly associated with the correct organization.

AI agents must NOT allow one organization to access or modify another organization's data.

Tenant isolation must be considered when designing:

Database models
Prisma queries
Service logic
Authorization logic
6.10 Database Safety & Execution Rules

AI agents MUST NOT run ANY database commands without explicit user approval:

- `npx prisma migrate dev`
- `npx prisma migrate deploy`
- `npx prisma db push`
- `npx prisma migrate reset`
- Database seeds or reset scripts
- Dropping or altering tables
- Deleting data or removing fields

Before running ANY database command or migration, the AI agent MUST:
1. Show the exact schema changes to the user.
2. Explain what will change and whether existing data could be affected.
3. Explicitly ask for user permission before executing the command.

6.11 Before Any Database Change

AI agents must check:

1. Relevant project documentation
2. Existing Prisma schema
3. Existing migrations
4. Related modules
5. Data relationships
6. Tenant isolation requirements

Do not modify the database blindly.


---

# Why this is important for your project

Now your AI agent will follow:

```text
New Event Feature
       ↓
Check Event Model
       ↓
Check Organization Relationship
       ↓
Modify schema.prisma
       ↓
Review
       ↓
Migration
       ↓
Prisma Client
       ↓
Service Logic

Instead of randomly doing:

❌ Change database
❌ Create random tables
❌ Break relationships
Current Progress
✅ 1. Project Overview
✅ 2. Tech Stack
✅ 3. Architecture Principles
✅ 4. Folder Architecture Rules
✅ 5. Module Creation Rules
✅ 6. Prisma & Database Rules


# 7. API & Validation Rules

## 7.1 API Architecture

All APIs must follow this flow:

```text
Client Request
      ↓
Route
      ↓
Middleware
      ↓
Zod Validation
      ↓
Controller
      ↓
Service
      ↓
Prisma
      ↓
PostgreSQL
      ↓
Response

AI agents must follow this architecture consistently.

7.2 REST API Rules

The project uses REST APIs.

Use appropriate HTTP methods:

GET     → Read data
POST    → Create data
PATCH   → Update data
DELETE  → Delete data

Examples:

GET    /api/v1/events
GET    /api/v1/events/:id

POST   /api/v1/events

PATCH  /api/v1/events/:id

DELETE /api/v1/events/:id
7.3 API Versioning

All APIs must use versioning.

Current version:

/api/v1/

Example:

/api/v1/events
/api/v1/venues
/api/v1/bookings

Do not create APIs without the version prefix unless explicitly instructed.

7.4 Route Rules

Routes are responsible only for:

Defining endpoints.
Applying middleware.
Applying validation.
Calling controllers.

Example flow:

POST /venues
      ↓
Validation Middleware
      ↓
Venue Controller

Routes MUST NOT contain:

Business logic.
Database queries.
Complex calculations.
7.5 Zod Validation Rules

All external input must be validated using Zod.

Validate:

Request body.
Query parameters when needed.
URL parameters when needed.

Example:

POST /api/v1/events

Request Body
      ↓
Zod Validation
      ↓
Controller

Validation must happen before the controller.

7.6 Validation File Rules

Validation schemas should remain inside their related module.

Example:

modules/
└── event/
    ├── event.validation.js
    ├── event.service.js
    ├── event.controller.js
    └── event.routes.js

Do not put module-specific validation inside shared/.

7.7 API Response Rules

All APIs should follow a consistent response structure.

Success response example:

{
  "success": true,
  "message": "Event created successfully",
  "data": {}
}

Error response example:

{
  "success": false,
  "message": "Validation failed",
  "errors": []
}

AI agents should reuse existing response utilities once they are created.

Do not create different response formats for different modules.

7.8 HTTP Status Code Rules

Use appropriate HTTP status codes.

200 → Successful request
201 → Resource created
204 → Successful request with no response body

400 → Bad request
401 → Unauthorized
403 → Forbidden
404 → Resource not found
409 → Conflict

500 → Internal server error

Do not return 200 for every request.

7.9 Controller Rules

Controllers must remain thin.

Controller responsibilities:

Receive Request
      ↓
Extract Validated Data
      ↓
Call Service
      ↓
Return Response

Controllers must NOT:

Contain complex business logic.
Directly query Prisma.
Contain unnecessary calculations.
7.10 Service Rules

Services contain business logic.

Services are responsible for:

Business rules.
Database operations.
Data processing.
Module-specific logic.

Example:

Controller
    ↓
Event Service
    ↓
Prisma
    ↓
PostgreSQL
7.11 Pagination Rules

For APIs returning large lists, pagination should be considered.

Examples:

GET /api/v1/events?page=1&limit=20

Do not return extremely large datasets unnecessarily.

Pagination implementation should follow one consistent project-wide pattern.

7.12 API Documentation Rules

When creating or changing an API, AI agents must check:

- ARCHITECTURE.md (Section 6: API Endpoint Specifications)
- API_CONTRACTS.md

If the actual API intentionally differs from the documented design, the AI agent must:

Explain the difference.
Explain why the change is required.
Ask before making major API design changes.
7.13 Before Creating an API

AI agents must check:

Relevant project documentation.
Existing routes.
Existing validation schemas.
Existing response format.
Authentication requirements.
Authorization requirements.
Tenant isolation requirements.

Do not create APIs blindly.


---

## ✅ What we have now

```text
Request
   ↓
Route
   ↓
Validation
   ↓
Controller
   ↓
Service
   ↓
Prisma
   ↓
PostgreSQL
   ↓
Standard Response
Current AGENTS.md progress
✅ 1. Project Overview
✅ 2. Tech Stack
✅ 3. Architecture Principles
✅ 4. Folder Architecture
✅ 5. Module Creation Rules
✅ 6. Prisma & Database Rules
✅ 7. API & Validation 


# 8. Error Handling & Middleware Rules

## 8.1 Centralized Error Handling

The application must use centralized error handling.

Expected flow:

```text
Request
   ↓
Route
   ↓
Controller
   ↓
Service
   ↓
Error Occurs
   ↓
Global Error Middleware
   ↓
Standard Error Response

AI agents must NOT create completely different error handling patterns in each module.

8.2 Global Error Handler

A global error handling middleware must handle application errors consistently.

It should handle:

Validation errors
Custom application errors
Prisma errors
Authentication errors
Unexpected server errors

All errors should return the project's standard error response format.

8.3 Custom Application Errors

Expected business errors should use a consistent custom error approach.

Examples:

Resource not found
Unauthorized access
Forbidden action
Duplicate resource
Invalid business operation

AI agents should reuse the existing error utility once it is created.

Do not create a different error class or error pattern for every module.

8.4 Async Error Handling

Async controller and service errors must be properly forwarded to centralized error handling.

AI agents must NOT:

Leave unhandled promise rejections.
Silently ignore errors.
Use empty catch blocks.

Bad example:

try {
  // code
} catch (error) {
}

Errors must either:

Be handled correctly, or
Be passed to the centralized error handler.
8.5 404 Handling

Unknown routes must return a consistent 404 response.

Example:

GET /api/v1/unknown-route

Response → 404 Not Found

Do not allow unknown API routes to return generic server errors.

8.6 Middleware Rules

Middleware should contain reusable request-processing logic.

Examples:

middleware/
├── error.middleware.js
├── validate.middleware.js
├── auth.middleware.js
└── authorize.middleware.js

Middleware responsibilities may include:

Validation
Authentication
Authorization
Error handling
Request processing

Middleware must NOT contain module-specific business logic.

8.7 Middleware Order

Middleware order is important.

Typical flow:

Request
   ↓
Security Middleware
   ↓
Request Parsing Middleware
   ↓
Routes
   ↓
Validation Middleware
   ↓
Authentication Middleware
   ↓
Authorization Middleware
   ↓
Controller
   ↓
Global Error Handler

AI agents must check the existing middleware order before modifying app.js.

8.8 Validation Middleware

Validation should use a reusable middleware.

Expected flow:

Request
   ↓
Zod Schema
   ↓
Validation Middleware
   ↓
Controller

The validation middleware should be shared.

Module-specific Zod schemas should remain inside their respective modules.

Example:

shared/
└── middleware/
    └── validate.middleware.js

modules/
└── event/
    └── event.validation.js
8.9 Authentication Middleware

Authentication middleware will be implemented when authentication is added.

Authentication middleware should:

Verify user authentication.
Identify the authenticated user.
Attach necessary user information to the request.

Authentication middleware must NOT contain unrelated business logic.

8.10 Authorization Middleware

Authorization should be handled separately from authentication.

Example:

Authentication
      ↓
Who are you?
      ↓
Authorization
      ↓
Are you allowed to do this?

Authorization must consider:

User role
Permissions
Organization access
Tenant isolation
8.11 Error Response Consistency

All errors should follow the project's standard format.

Example:

{
  "success": false,
  "message": "Resource not found",
  "errors": []
}

Do not expose:

Database internals
Stack traces
Sensitive information

to API users in production.

8.12 Before Creating Middleware

AI agents must check:

Does similar middleware already exist?
Can existing middleware be reused?
Is this middleware generic or module-specific?
Where should it be registered?
Will changing middleware affect existing APIs?

Do not create duplicate middleware.


## Important idea

Your architecture will now have:

```text
Request
   ↓
Middleware
   ↓
Validation
   ↓
Controller
   ↓
Service
   ↓
Database
   ↓
Response

If Error ❌
   ↓
Global Error Handler
Current progress
✅ 1. Project Overview
✅ 2. Tech Stack
✅ 3. Architecture Principles
✅ 4. Folder Architecture
✅ 5. Module Creation Rules
✅ 6. Prisma & Database Rules
✅ 7. API & Validation Rules
✅ 8. Error Handling & Middleware Rules

. Authentication & Authorization Rules

## 9.1 User Types

Eventify supports multiple user types:

- Customer
- Organizer
- Organization Staff
- Super Admin

AI agents must check the roles and permissions documentation before implementing authentication or authorization features.

Relevant documentation:

```text
ARCHITECTURE.md (Section 7: Role-Based Access Control)
```
9.2 Authentication vs Authorization

Authentication and authorization must remain separate.

Authentication
      ↓
Who are you?
      ↓
Authorization
      ↓
Are you allowed to perform this action?

Example:

User logs in
      ↓
Authentication verifies identity
      ↓
User information is identified
      ↓
Authorization checks permissions
      ↓
Allow or deny action
9.3 Authentication Rules

Authentication logic should be implemented in the Auth module.

Expected future structure:

modules/
└── auth/
    ├── auth.service.js
    ├── auth.controller.js
    ├── auth.routes.js
    └── auth.validation.js

Authentication middleware should remain inside:

shared/middleware/

AI agents must NOT duplicate authentication logic across multiple modules.

9.4 Authorization Rules

Authorization must check whether the authenticated user has permission to perform the requested action.

Authorization may depend on:

User role
User permissions
Organization membership
Organization ownership
Resource ownership

Example:

Organizer A
      │
      └── Can manage Organization A events

Organizer A
      ❌
      └── Cannot manage Organization B events
9.5 Tenant Isolation

Eventify is a multi-tenant SaaS platform.

Organization data must remain isolated.

Example:

Organization A
├── Events
├── Venues
└── Staff

Organization B
├── Events
├── Venues
└── Staff

AI agents must ensure:

Organization A User
        ❌
Cannot access
        ↓
Organization B Data

Tenant isolation must be enforced through:

Authentication
Authorization
Service logic
Database queries
9.6 Authorization Must Not Trust Client Input

AI agents must NOT trust values sent directly from the frontend for authorization.

Example:

{
  "role": "SUPER_ADMIN"
}

This must NOT automatically give the user Super Admin access.

Authorization information must come from trusted authentication and database data.

9.7 Resource Ownership Checks

When a user accesses or modifies a resource, the application should verify ownership or organization access where required.

Example:

PATCH /api/v1/events/:eventId

        ↓

Authenticated User
        ↓

Does user belong to this organization?
        ↓

Does organization own this event?
        ↓

Allow / Deny
9.8 Authentication Middleware Rules

Authentication middleware should:

Verify user authentication.
Identify the authenticated user.
Attach trusted user information to the request.
Pass control to the next middleware.

Example concept:

Request
   ↓
Authentication Middleware
   ↓
req.user
   ↓
Authorization Middleware
   ↓
Controller

Do not put business logic inside authentication middleware.

9.9 Authorization Middleware Rules

Authorization middleware should handle reusable permission checks.

Example:

Authentication
      ↓
Authorization
      ↓
Controller

Module-specific business ownership checks may remain in the service layer.

Example:

Authorization Middleware
        ↓
Check Role

Service
        ↓
Check Resource Ownership
9.10 Security Rules

AI agents MUST NOT:

Store plain-text passwords.
Expose passwords in API responses.
Trust roles sent directly by the client.
Allow users to access another organization's data.
Put sensitive authentication information in logs.
Hardcode secrets inside source code.

Secrets must be stored using environment variables.

9.11 Before Authentication or Authorization Changes

AI agents must check:

ARCHITECTURE.md (Section 7: RBAC Matrix)
Existing Prisma user models.
Existing authentication middleware.
Existing authorization middleware.
Organization and tenant relationships.
Existing API behavior.

Do not redesign the authentication system without approval.


---

## Simple Architecture

Your future request flow will look like:

```text
User Request
     ↓
Authentication
     ↓
Who is the user?
     ↓
Authorization
     ↓
Does the user have permission?
     ↓
Tenant / Organization Check
     ↓
Controller
     ↓
Service
     ↓
Database
Current Progress
✅ 1. Project Overview
✅ 2. Tech Stack
✅ 3. Architecture Principles
✅ 4. Folder Architecture Rules
✅ 5. Module Creation Rules
✅ 6. Prisma & Database Rules
✅ 7. API & Validation Rules
✅ 8. Error Handling & Middleware Rules
✅ 9. Authentication & Authorization Rules

# 10. Code Quality & Naming Conventions

## 10.1 General Code Quality Rules

AI agents MUST:

- Write clean and readable code.
- Prefer simple solutions over unnecessary complexity.
- Follow existing project patterns.
- Avoid duplicate code.
- Reuse existing utilities when appropriate.
- Keep functions focused on a single responsibility.
- Make minimal changes required for the task.

AI agents MUST NOT:

- Rewrite unrelated code.
- Refactor unrelated modules without approval.
- Add unnecessary dependencies.
- Create overly complex abstractions for simple functionality.

---

## 10.2 File Naming Rules

Use lowercase file names with descriptive names.

Examples:

```text
event.service.js
event.controller.js
event.routes.js
event.validation.js

auth.middleware.js
error.middleware.js
validate.middleware.js

Do not use inconsistent names such as:

EventService.js
eventService.js
EVENT_SERVICE.js
10.3 Folder Naming Rules

Use lowercase names.

Examples:

modules/
events/
venues/
bookings/
shared/
middleware/

Use clear and meaningful folder names.

10.4 JavaScript Naming Rules
Variables

Use camelCase:

const eventName = "Music Festival";
const bookingCount = 10;
Functions

Use camelCase and meaningful action names:

createEvent();
getEventById();
updateVenue();
deleteBooking();

Avoid unclear names:

doStuff();
handleData();
process();

unless their purpose is obvious from the context.

10.5 Constants

Use UPPER_SNAKE_CASE for true constants.

Example:

const MAX_TICKET_LIMIT = 10;
const DEFAULT_PAGE_SIZE = 20;
10.6 Database Naming Rules

Prisma model names should use PascalCase.

Example:

model User {
}

model Organization {
}

model Event {
}

Database fields should follow the existing Prisma naming convention consistently.

Do not introduce a different naming style without approval.

10.7 API Naming Rules

Use plural nouns for resource routes.

Correct:

/api/v1/events
/api/v1/venues
/api/v1/bookings

Avoid:

/api/v1/getEvents
/api/v1/createEvent

Use HTTP methods to represent actions.

Example:

GET    /events
POST   /events
PATCH  /events/:id
DELETE /events/:id
10.8 Function Design Rules

Functions should:

Have one clear responsibility.
Use meaningful names.
Avoid excessive nesting.
Avoid being unnecessarily long.

If a function becomes too complex, consider splitting it into smaller functions.

Do not split functions unnecessarily if doing so makes the code harder to understand.

10.9 Comments

Comments should explain:

Why something is done.
Complex business logic.
Non-obvious decisions.

Do NOT add comments that simply repeat obvious code.

Bad:

// Create event
createEvent();

Better:

// Prevent publishing an event until at least one ticket type exists.
10.10 Dependency Rules

Before adding a new dependency, AI agents must check:

Is this functionality already available in the project?
Can Node.js or an existing dependency handle it?
Is the dependency actually necessary?

AI agents MUST NOT install unnecessary packages.

Any new dependency should be mentioned in the implementation summary.

10.11 Code Change Rules

Before modifying existing code:

Read Existing Code
       ↓
Understand Current Flow
       ↓
Identify Required Change
       ↓
Make Minimal Changes
       ↓
Test Existing Functionality

AI agents must avoid large unnecessary changes.

10.12 Code Completion Requirements

Before declaring a coding task complete, AI agents must:

Check for syntax errors.
Check imports and exports.
Verify affected API routes.
Verify validation.
Check database queries if applicable.
Check error handling.
Run relevant tests or checks if available.

The AI agent must clearly report:

Files created.
Files modified.
Database changes.
New dependencies.
Testing performed.
Any remaining limitations.

---

### Why Step 10 is important

Now every AI agent will follow:

```text
Same File Naming
      +
Same Folder Naming
      +
Same API Naming
      +
Clean Code Rules
      +
Minimal Changes
      =
Consistent Codebase


# 11. Git & AI Agent Workflow Rules

## 11.1 Before Starting Any Task

Before making changes, AI agents must:

1. Read the relevant documentation in `/docs`.
2. Read `AGENTS.md`.
3. Check the current Git branch.
4. Check the existing code related to the task.
5. Check for uncommitted changes.

Recommended commands:

```bash
git status
git branch

AI agents must NOT start making changes blindly.

11.2 Feature Branch Rule

New features should be developed in separate branches when appropriate.

Naming convention:

feature/auth
feature/organization
feature/venue
feature/event
feature/ticket
feature/booking

Bug fixes:

fix/event-validation
fix/booking-payment

Do not use unclear branch names such as:

test123
new-code
changes
final
11.3 AI Agent Scope Rules

Before starting a task, the AI agent must understand:

What feature needs to be built.
Which module is affected.
Which files may need changes.
Whether database changes are required.
Whether existing APIs may be affected.

The AI agent must focus only on the requested task.

AI agents MUST NOT:

Modify unrelated modules.
Refactor unrelated code.
Change project architecture without approval.
Delete existing functionality without approval.
11.4 Required AI Agent Workflow

For every coding task:

Read AGENTS.md
       ↓
Read Relevant Documentation
       ↓
Check Git Status
       ↓
Understand Existing Code
       ↓
Create Implementation Plan
       ↓
Make Required Changes
       ↓
Check Changed Files
       ↓
Run Application / Tests
       ↓
Review Database Changes
       ↓
Report Final Changes
11.5 Before Making Changes

The AI agent should first inspect:

Relevant Module
      +
Related Modules
      +
Shared Utilities
      +
Prisma Schema
      +
Existing API Routes

Do not create duplicate functionality.

11.6 After Making Changes

After completing a task, the AI agent must check:

git status
git diff

The AI agent should review:

Files created
Files modified
Unexpected changes
Unrelated changes
11.7 Testing Before Commit

Before recommending a commit, verify when applicable:

Application starts successfully.
Modified APIs work correctly.
Validation works.
Error handling works.
Database queries work.
Existing functionality is not obviously broken.

Do not claim code is fully tested if tests were not actually run.

11.8 Git Commit Rules

Use clear commit messages.

Recommended format:

type: short description

Examples:

feat: add venue module
feat: add event creation API
fix: validate ticket quantity
fix: prevent cross organization access
chore: configure prisma
docs: update API documentation

Commit types:

feat     → New feature
fix      → Bug fix
chore    → Configuration or maintenance
docs     → Documentation changes
refactor → Code restructuring without feature changes
test     → Test-related changes
11.9 AI Agents Must Never Run Git Modifying Commands Without Approval

AI agents MUST NEVER execute any of the following Git commands without explicit user instruction:

- `git add` (do not stage files automatically)
- `git commit`
- `git push`
- `git pull`
- `git checkout` / `git switch`
- `git merge`
- `git branch` (creation or deletion)
- `git stash`

AI agents may ONLY run read-only inspection commands:
- `git status`
- `git diff`
- `git log`

The AI agent must always:
1. Complete the code change.
2. Show the proposed changes via `git status` or `git diff`.
3. Explain what was changed.
4. Ask the user for approval BEFORE running any git staging, commit, push, or pull command.
11.10 Before Merge

Before merging a feature branch:

Review Feature
      ↓
Check Git Diff
      ↓
Test Application
      ↓
Check Database Migration
      ↓
Check Unrelated Changes
      ↓
Merge

The merge should not happen blindly.

11.11 Required Final Report From AI Agents

After completing a task, the AI agent must provide:

Summary

Briefly explain what was implemented.

Files Created
Example:
src/modules/venue/venue.service.js
src/modules/venue/venue.controller.js
Files Modified

List all modified files.

Database Changes

Explain:

Prisma schema changes
Migration created
Database impact
Dependencies Added

List any new packages.

Testing

Clearly state:

What commands were run.
What was tested.
What was NOT tested.
Remaining Work

Mention anything that still needs to be completed.

11.12 Never Hide Changes

AI agents must clearly report unexpected changes.

If the AI agent discovers unrelated modifications already present in the working directory, it must NOT:

Delete them.
Overwrite them.
Commit them.

The AI agent should inform the user before proceeding.


---

# What Step 11 gives you

Now your workflow with AI agents becomes:

```text
You Give Task
     ↓
AI Reads AGENTS.md
     ↓
AI Checks Git Status
     ↓
AI Reads Relevant Code
     ↓
AI Creates Plan
     ↓
AI Makes Changes
     ↓
AI Tests Code
     ↓
git diff
     ↓
AI Reports Everything
     ↓
YOU Review
     ↓
YOU Decide:
Commit / Push / Continue
Current Progress
✅ Step 1  Project Overview
✅ Step 2  Tech Stack
✅ Step 3  Architecture Principles
✅ Step 4  Folder Architecture
✅ Step 5  Module Creation Rules
✅ Step 6  Prisma & Database Rules
✅ Step 7  API & Validation Rules
✅ Step 8  Error Handling & Middleware
✅ Step 9  Authentication & Authorization
✅ Step 10 Code Quality & Naming
✅ Step 11 Git & AI Agent Workflow

12. Testing & Definition of Done Rules

## 12.1 Definition of Done

A feature must NOT be considered complete simply because the code has been written.

A feature is considered complete only when applicable requirements have been checked.

```text
Requirements Implemented
        ↓
Validation Works
        ↓
Error Handling Works
        ↓
Database Operations Work
        ↓
API Tested
        ↓
Existing Functionality Checked
        ↓
Code Reviewed
        ↓
Feature Complete
12.2 Before Declaring a Feature Complete

AI agents must verify, when applicable:

Requirements are implemented.
Correct files were created or modified.
Zod validation works.
API routes work correctly.
Authentication works where required.
Authorization works where required.
Tenant isolation is checked where required.
Database operations work.
Error handling works.
API responses follow the standard format.
12.3 Testing Rules

Testing should happen at appropriate levels.

Basic Checks

AI agents must check:

Application starts successfully.
No obvious syntax errors exist.
Imports and exports work correctly.
Routes are correctly registered.
API Testing

When an API is created or modified, test when possible:

Valid Request
     ↓
Expected Success Response

Invalid Request
     ↓
Validation Error

Unauthorized Request
     ↓
401 Error

Forbidden Request
     ↓
403 Error

Invalid Resource
     ↓
404 Error

Not every API will require all scenarios, but relevant cases must be considered.

12.4 Database Testing

When database changes are made, verify:

Prisma schema is valid.
Migration was created successfully.
Migration applied successfully.
Prisma Client works correctly.
Required records can be created or retrieved.
Relationships work correctly.

AI agents must clearly report database changes.

12.5 Existing Functionality Protection

When modifying an existing module:

Existing Feature
      ↓
Make Change
      ↓
Test New Functionality
      ↓
Check Existing Functionality

AI agents must consider whether the new change could break existing APIs or database relationships.

Do not assume existing functionality still works without checking relevant areas.

12.6 No Fake Testing

AI agents MUST NOT say:

"Everything is tested successfully"

unless actual testing was performed.

The AI agent must clearly distinguish between:

Tested

and:

Not Tested

Example:

Tested:
- Server starts successfully.
- POST /venues tested.

Not Tested:
- Automated tests not yet implemented.
- Authorization not tested.
12.7 Test Failure Rules

If testing fails, AI agents must:

Clearly report the failure.
Explain the likely cause.
Avoid hiding or ignoring the error.
Fix the issue only within the requested scope.
Re-test after fixing when possible.

AI agents must NOT silently ignore failing tests.

12.8 Definition of Done Checklist

Before marking a feature complete, check:

[ ] Requirements completed

[ ] Correct architecture followed

[ ] Validation added or updated

[ ] Service logic implemented

[ ] Controller implemented or updated

[ ] Routes implemented or updated

[ ] Error handling checked

[ ] Database changes reviewed

[ ] Prisma migration created if required

[ ] Authentication checked if required

[ ] Authorization checked if required

[ ] Tenant isolation checked if required

[ ] API tested

[ ] Existing related functionality checked

[ ] No unrelated files modified

[ ] git diff reviewed

[ ] Final implementation report provided
12.9 AI Agent Completion Report

Before declaring the task complete, the AI agent must provide:

Implementation Summary

What was implemented?

Files Created

List all newly created files.

Files Modified

List all modified files.

Database Changes

Explain:

Prisma schema changes.
Migration created.
Database impact.
Testing Performed

Clearly list what was actually tested.

Not Tested

Clearly list anything that was not tested.

Remaining Work

Mention any known limitations or future work.

12.10 Important Rule

Writing code does NOT mean the feature is complete.

A feature should follow:

Plan
 ↓
Implement
 ↓
Review
 ↓
Test
 ↓
Check Database
 ↓
Review git diff
 ↓
Report
 ↓
Complete

---

# Why this step is important

Sometimes AI agents do this:

```text
Write Code
   ↓
"Done!" ❌

But your rules now require:

Write Code
   ↓
Test
   ↓
Check Errors
   ↓
Check Database
   ↓
Review Changes
   ↓
Report Honestly
   ↓
Done ✅
Current Progress
✅ 1–11 Completed
✅ 12 Testing & Definition of Done

# 13. Security & Environment Rules

## 13.1 Environment Variables

Sensitive configuration must use environment variables.

Examples:

- Database URL
- JWT secrets
- API keys
- Payment provider secrets
- Email credentials
- Cloud service credentials

Example:

```text
DATABASE_URL=
JWT_SECRET=

AI agents MUST NOT hardcode secrets directly inside source code.

13.2 .env Rules

The .env file contains sensitive information.

AI agents MUST ensure:

.env

is included in .gitignore.

The .env file must NEVER be committed to GitHub.

13.3 .env.example

The project should provide:

.env.example

Example:

DATABASE_URL=
PORT=
JWT_SECRET=

The .env.example file must NOT contain real secrets.

It should only contain variable names and safe example values.

13.4 Secret Handling Rules

AI agents MUST NOT:

Hardcode passwords.
Hardcode database credentials.
Hardcode API keys.
Hardcode JWT secrets.
Commit secrets to GitHub.
Log sensitive credentials.

Bad:

const password = "my-secret-password";

Bad:

const jwtSecret = "super-secret-key";

Correct approach:

Environment Variables
        ↓
Configuration
        ↓
Application
13.5 Password Security

When authentication is implemented:

AI agents MUST:

Never store plain-text passwords.
Hash passwords using a secure password hashing library.
Never return passwords in API responses.
Never log passwords.
13.6 API Security

AI agents should consider appropriate security measures such as:

Input validation.
Authentication.
Authorization.
Rate limiting when needed.
Secure HTTP headers when implemented.
Proper CORS configuration.

Do not add security packages unnecessarily before they are required.

13.7 Database Security

AI agents MUST:

Use environment variables for database connections.
Use Prisma for database access.
Avoid exposing database errors directly to users.
Avoid logging sensitive database credentials.

Production database credentials must never be committed to the repository.

13.8 Logging Rules

Logs must NOT contain:

Passwords
JWT tokens
API keys
Database URLs
Payment credentials
Sensitive personal information unless explicitly required and handled safely
13.9 Authentication Secrets

Authentication secrets must:

Come from environment variables.
Never be hardcoded.
Never be committed to GitHub.

AI agents must not generate or expose real production secrets in source code.

13.10 Before Adding a New External Service

Before adding services such as:

Payment providers
Email services
Cloud storage
SMS providers

AI agents must:

Check whether the service is required.
Store credentials using environment variables.
Avoid committing credentials.
Update .env.example if new variables are required.
Explain any new dependencies.
13.11 Security Before Deployment

Before production deployment, verify:

[ ] .env is ignored by Git

[ ] No secrets are committed

[ ] Production database URL is secure

[ ] Authentication secrets are configured

[ ] Sensitive errors are not exposed

[ ] CORS is configured correctly

[ ] Environment variables are configured

[ ] Debug mode is disabled where applicable
13.12 Important Security Rule

If an AI agent discovers a secret accidentally exposed in code:

Do not repeat or expose the secret unnecessarily.
Inform the user.
Recommend removing the secret from the source code.
Recommend rotating the secret if it was committed or exposed.
Move the secret to environment variables.

Never silently ignore exposed credentials.


---

## Current Progress

```text
✅ Step 1–12 Completed
✅ Step 13 Security & Environment Rules

# 14. Documentation & AI Agent Communication Rules

## 14.1 Documentation Rules

Before implementing a feature, AI agents must check the relevant master architecture files:

```text
Root Architectural Documents:
├── AGENTS.md            # AI Rules, Guardrails & Code Standards
├── ARCHITECTURE.md      # Master Engineering Blueprint (DB Schema, API Routes, RBAC)
└── API_CONTRACTS.md     # Endpoint Request/Response Payloads & Status Codes

Supplementary Documentation:
docs/
├── README.md
├── product/             # PRD, user flows, post-MVP requirements
└── learning-notes/      # Conversational tutorials & design drafts
```

AI agents must use documentation as the source of truth unless the existing implementation has been intentionally updated.

14.2 When Documentation Must Be Updated

Documentation should be updated when a change significantly affects:

Database design
API design
System architecture
Roles and permissions
Project structure
Major user flows

Minor internal implementation changes do not require documentation updates.

14.3 Database Documentation Changes

If a significant database design change is required:

Existing Database Design
        ↓
Identify Required Change
        ↓
Explain Change
        ↓
Update dbDesign.md if approved
        ↓
Update schema.prisma
        ↓
Create Migration

AI agents must not silently redesign the database.

14.4 API Documentation Changes

If an API significantly changes from the documented design, the AI agent must:

Explain the difference.
Explain why the change is needed.
Ask for approval if it is a major change.
Update API_CONTRACTS.md and ARCHITECTURE.md after approval.

Minor implementation details do not require unnecessary documentation changes.

14.5 Architecture Changes

AI agents MUST ask for approval before making major changes to:

Project architecture
Folder structure
Module structure
Authentication architecture
Authorization architecture
Multi-tenant architecture

AI agents must NOT silently redesign the application.

14.6 When AI Agents Should Ask Before Proceeding

AI agents must ask for clarification or approval when:

Requirements are unclear.
A destructive database operation is required.
A major architecture change is needed.
Existing functionality must be significantly changed.
A documented design conflicts with the requested implementation.
A change could affect multiple modules significantly.

For small implementation decisions, AI agents should use reasonable judgment and continue.

14.7 AI Agent Communication Before Coding

For significant tasks, the AI agent should provide:

Task Understanding
      ↓
Implementation Plan
      ↓
Files Expected to Change
      ↓
Database Impact
      ↓
Dependencies Required

Then proceed according to the user's instructions.

14.8 Do Not Ask Unnecessary Questions

AI agents should NOT stop work for unnecessary clarification.

If:

The task is clear.
The architecture already defines the approach.
Existing code provides the pattern.

Then the AI agent should continue using the existing project conventions.

14.9 Required Communication During Important Changes

If the AI agent discovers an unexpected issue, it must clearly report:

What was discovered.
Why it matters.
Which files or modules may be affected.
Recommended options.

The AI agent must not hide unexpected architectural or database issues.

14.10 Documentation Accuracy

AI agents must NOT:

Update documentation without updating relevant implementation when claiming a feature exists.
Claim documentation is accurate without checking relevant changes.
Leave documentation intentionally misleading.

Documentation should reflect major architectural and product decisions.

14.11 Final Communication Rules

After completing a task, the AI agent must clearly provide:

1. What Was Done

Brief implementation summary.

2. Files Created

List newly created files.

3. Files Modified

List modified files.

4. Database Changes

Explain schema and migration changes.

5. Dependencies Added

List new dependencies, if any.

6. Testing Performed

Clearly state actual tests performed.

7. Documentation Updated

List documentation changed, if applicable.

8. Remaining Work

Mention known limitations or unfinished work.

14.12 Important Rule

AI agents must communicate important decisions.

They must NOT silently:

Change architecture.
Change database design.
Change API contracts.
Delete important functionality.
Modify unrelated modules.

Major changes require explanation and approval.


---

# Your AI Agent Rule File Progress

You now have:

```text
✅ 1. Project Overview
✅ 2. Tech Stack
✅ 3. Architecture Principles
✅ 4. Folder Architecture Rules
✅ 5. Module Creation Rules
✅ 6. Prisma & Database Rules
✅ 7. API & Validation Rules
✅ 8. Error Handling & Middleware
✅ 9. Authentication & Authorization
✅ 10. Code Quality & Naming
✅ 11. Git & AI Agent Workflow
✅ 12. Testing & Definition of Done
✅ 13. Security & Environment
✅ 14. Documentation & Communication Rules

# 15. AI Agent Master Workflow

## 15.1 Mandatory Workflow

For every coding task, AI agents must follow this process:

```text
Receive Task
     ↓
Read AGENTS.md
     ↓
Read Relevant Documentation
     ↓
Check Git Status and Current Branch
     ↓
Inspect Existing Code
     ↓
Understand Requirements
     ↓
Create Implementation Plan
     ↓
Check Database Impact
     ↓
Implement Changes
     ↓
Run Validation / Tests
     ↓
Review Database Changes
     ↓
Review Git Diff
     ↓
Provide Final Report
15.2 Step 1 — Understand the Task

Before writing code, determine:

What feature is requested?
Which module is affected?
Is this a new module or an existing module change?
Which APIs are required?
Is authentication required?
Is authorization required?
Is tenant isolation required?

Do not start coding blindly.

15.3 Step 2 — Read Project Rules

AI agents must read:

AGENTS.md
ARCHITECTURE.md
API_CONTRACTS.md

Then read supplementary documentation from docs/ if domain context is required.

The existing project architecture and documentation should be followed.

15.4 Step 3 — Check Current Project State

Before making changes, inspect:

git status
git branch

Then inspect relevant:

Modules
Routes
Shared utilities
Prisma schema
Existing APIs

Do not overwrite unrelated existing work.

15.5 Step 4 — Create an Implementation Plan

For significant tasks, identify:

Files to create.
Files to modify.
Database changes required.
Migration required or not.
Dependencies required or not.
APIs affected.

Keep the plan focused and avoid unnecessary changes.

15.6 Step 5 — Database Check

If database changes are required:

Check Existing Schema
       ↓
Check Relationships
       ↓
Check Tenant Requirements
       ↓
Update schema.prisma
       ↓
Review Changes
       ↓
Create Migration
       ↓
Test Database Operations

If no database changes are required, do not modify Prisma unnecessarily.

15.7 Step 6 — Implement Using Project Architecture

Follow:

Route
  ↓
Validation
  ↓
Controller
  ↓
Service
  ↓
Prisma
  ↓
PostgreSQL

For new modules, follow the standard module structure.

Do not mix business logic into controllers or routes.

15.8 Step 7 — Security Check

Before completing the task, check:

Input validation.
Authentication requirements.
Authorization requirements.
Organization access.
Tenant isolation.
Sensitive data exposure.

Do not trust authorization data directly from the client.

15.9 Step 8 — Testing

Test relevant functionality.

When applicable, verify:

Valid Request       → Expected Success

Invalid Request     → Validation Error

Unauthorized User   → 401

Forbidden User      → 403

Missing Resource    → 404

Database changes should also be tested.

Do not claim testing was performed unless it actually was.

15.10 Step 9 — Review Changes

Before completing the task:

git status
git diff

Review:

Files created.
Files modified.
Unexpected changes.
Unrelated modifications.

Do not modify, delete, or commit unrelated changes.

15.11 Step 10 — Final Report

After completing the task, provide:

Implementation Summary

What was implemented?

Files Created

List all new files.

Files Modified

List all modified files.

Database Changes

Explain:

Prisma changes.
Migration created.
Data impact.
Dependencies Added

List any new packages.

Testing Performed

Clearly state what was actually tested.

Not Tested

Clearly state anything not tested.

Remaining Work

Mention known limitations or next steps.

15.12 Git Rules

AI agents must NEVER automatically:
- Run `git add` (stage changes)
- Run `git commit`
- Run `git push`
- Run `git pull`
- Run `git merge`
- Create or delete branches

Unless explicitly instructed and approved by the user for that specific action.

The AI agent should complete the implementation, run read-only git inspection (`git status`), and allow the user to review and decide when to stage, commit, or push changes.

Final Rule

AI agents must prioritize:

Correctness
    ↓
Security
    ↓
Existing Architecture
    ↓
Minimal Changes
    ↓
Testing
    ↓
Clear Communication

Do not prioritize speed over correctness.


---

# 🎉 Your AGENTS.md is now complete

You now have **15 sections** covering:

```text
1.  Project Overview
2.  Tech Stack
3.  Architecture Principles
4.  Folder Architecture
5.  Module Creation Rules
6.  Prisma & Database Rules
7.  API & Validation Rules
8.  Error Handling & Middleware
9.  Authentication & Authorization
10. Code Quality & Naming
11. Git & AI Agent Workflow
12. Testing & Definition of Done
13. Security & Environment
14. Documentation & Communication
15. AI Agent Master Workflow