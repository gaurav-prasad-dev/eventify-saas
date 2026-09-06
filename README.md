# Eventify SaaS

> Multi-tenant Event Management SaaS and High-Concurrency Ticket Booking Platform.

---

## 🤖 Instructions for AI Agents & Developers

If you are an **AI Agent** (or human engineer) working on this codebase, **START HERE**:

> [!CAUTION]
> **ZERO-TOLERANCE RULES FOR AI AGENTS:**
> - **NEVER** run any Git modifying commands (`git add`, `git commit`, `git push`, `git pull`, `git checkout`, `git merge`, `git stash`, etc.) without EXPLICIT user approval in each instance.
> - **NEVER** run any database commands (`npx prisma migrate`, `prisma db push`, `prisma migrate reset`, seed scripts, or SQL mutations) without EXPLICIT user approval in each instance.
> - Only read-only inspection commands (`git status`, `git diff`, `git log`) are allowed to check work.

1. **AI Operating Rules:** Read [`AGENTS.md`](./AGENTS.md) — Contains mandatory behavioral rules, git workflows, and language rules (strictly Node.js / JavaScript `.js`, no TypeScript).
2. **Master Architecture & Engineering Blueprint:** Read [`ARCHITECTURE.md`](./ARCHITECTURE.md) — The comprehensive single-source-of-truth document containing:
   - Full system architecture & modular monolith structure
   - Complete PostgreSQL + Prisma database schema with all fields, relations, and constraints
   - Complete REST API route catalog and specifications
   - Role-Based Access Control (RBAC) matrix
   - High-concurrency seat locking and double-booking prevention mechanics
   - Phased implementation roadmap and Definition of Done
3. **API Contracts & Payload Specifications:** Read [`API_CONTRACTS.md`](./API_CONTRACTS.md) — Request body schemas, query parameters, response structures, and HTTP status codes for all endpoints.

---

## 📁 Repository Overview

```text
Eventify/
├── AGENTS.md               # Strict rules and coding standards for AI agents
├── ARCHITECTURE.md         # Master engineering blueprint & system architecture
├── API_CONTRACTS.md        # Complete API request & response specifications
├── README.md               # Repository entry point (this file)
├── docs/                   # Supplementary product specs and design notes
│   ├── README.md           # Guide to documentation folders
│   ├── product/            # PRD, user flows, post-MVP requirements
│   └── learning-notes/     # Conversational tutorials & historical drafts
├── api/                    # Centralized Node.js + Express backend (Modular Monolith)
├── marketplace-web/        # Customer Marketplace (Frontend - Phase 2)
├── organizer-dashboard/    # Organizer SaaS Dashboard (Frontend - Phase 2)
└── admin-dashboard/        # Super Admin Dashboard (Frontend - Phase 2)
```

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js, JavaScript (`.js`)
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Validation:** Zod
- **Cache & Concurrency:** Redis (Seat locking with TTL, caching)
- **Real-Time:** Socket.IO
- **Payments:** Razorpay (Orders, Webhooks, Refunds)
- **Frontends:** React.js, Tailwind CSS (built after core backend modules)
