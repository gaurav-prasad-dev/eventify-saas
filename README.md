# Eventify SaaS

> Multi-tenant Event Management SaaS and High-Concurrency Ticket Booking Platform.

---

## 🤖 Instructions for AI Agents & Developers

If you are an **AI Agent** (or human engineer) working on this codebase, **START HERE**:

1. **AI Operating Rules:** Read [`AGENTS.md`](./AGENTS.md) — Contains mandatory behavioral rules, git workflows, and language rules (strictly Node.js / JavaScript `.js`, no TypeScript).
2. **Master Architecture & Engineering Blueprint:** Read [`docs/PROJECT_PLAN.md`](./docs/PROJECT_PLAN.md) — The comprehensive single-source-of-truth document containing:
   - Full system architecture
   - Complete PostgreSQL + Prisma database schema with all fields, relations, and constraints
   - Complete REST API route catalog and specifications
   - Role-Based Access Control (RBAC) matrix
   - High-concurrency seat locking and double-booking prevention mechanics
   - Phased implementation roadmap and Definition of Done

---

## 📁 Repository Overview

```text
Eventify/
├── AGENTS.md               # Strict rules for AI agents
├── README.md               # Repository entry point (this file)
├── docs/                   # Master engineering documentation
│   ├── PROJECT_PLAN.md     # Single-source-of-truth project plan & architecture
│   └── ...                 # Additional requirement & design documents
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
