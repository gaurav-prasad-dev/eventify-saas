# Eventify SaaS — Documentation Directory

This directory houses supplementary product documentation, user journey flows, and historical learning/draft notes.

---

## 🤖 For AI Agents & Developers Building Modules

If you are building or modifying backend modules, **do not read the entire `docs/` folder**. All authoritative technical specifications have been promoted directly to the project root:

1. [**`AGENTS.md`**](../AGENTS.md) — Mandatory AI agent rules, coding guardrails, layer conventions (Service → Controller → Route), and safety checks.
2. [**`ARCHITECTURE.md`**](../ARCHITECTURE.md) — Single-Source-of-Truth master blueprint containing:
   - Complete PostgreSQL + Prisma schema (all models, relations, constraints)
   - REST API route directory and HTTP methods
   - Role-Based Access Control (RBAC) matrix
   - High-concurrency seat locking & Redis architecture
3. [**`API_CONTRACTS.md`**](../API_CONTRACTS.md) — Exact request bodies, query params, responses, and status codes per endpoint.

---

## 📁 Directory Breakdown

### 1. `docs/product/` (Product & Business Specifications)
Contains functional requirements, business flows, and future features:
- [`PRD.md`](./product/PRD.md) — Comprehensive Product Requirements Document (features, personas, business model).
- [`userflow.md`](./product/userflow.md) — End-to-end user journeys (booking, seat selection, checkout, door check-in).
- [`laterrequirements.md`](./product/laterrequirements.md) — Post-MVP roadmap models (audit logs, ledger, vendor management).

### 2. `docs/learning-notes/` (Conceptual Notes & Historical Drafts)
Contains conversational mentoring guides and iterative drafts produced during initial system design:
- `dbDesign.md` & `modifieddbdesign.md` — Database design tutorials and table brainstorms (superseded by schema in `ARCHITECTURE.md`).
- `apiDesign.md` — API design process explanation (superseded by `ARCHITECTURE.md` and `API_CONTRACTS.md`).
- `systemarchitecture.md` — Architectural trade-off discussions (monolith vs microservices).
- `projectStructure.md` & `finalprojectstructure.md` — Folder architecture tutorials (codified in `AGENTS.md`).
- `rolesandpermission.md` — Initial role notes (formalized in `ARCHITECTURE.md` Section 7).
- `ProductFoundation.md` — Early feature ideation draft.
- `laststepbeforecode.md` — Early workflow checklist notes (formalized in `AGENTS.md`).
