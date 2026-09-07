# Frontend Coding Rules

## Principle #1: No External UI Frameworks
- All UI components are **custom-built** using pure Tailwind CSS inside `@eventify/ui` (`packages/ui`).
- Do NOT install or use external component libraries like Material-UI (MUI), Chakra UI, Ant Design, or Bootstrap.
- Custom primitives guarantee total styling control, zero CSS bloat, and pixel-perfect consistency across all Eventify applications.

---

## Principle #2: Strict Feature Module Folder Pattern
Every frontend application (`marketplace-web`, `organizer-dashboard`, `admin-dashboard`) must organize its business logic inside `src/features/<module-name>/`.

Random files, ad-hoc components, or unorganized screens directly in `src/` are strictly prohibited.

Every feature module must strictly follow this structure:
```text
src/features/<module-name>/
├── components/          # Feature-specific subcomponents (e.g. VenueGrid, TicketTierRow)
├── context/             # React Context Provider (state management & data fetching)
│   └── <Module>Context.jsx
├── api/                 # API calls via centralized apiClient
│   └── <module>Api.js
├── data/                # Static constants, table column specs, filter dropdown options
│   └── <module>Constants.js
├── utils/               # Module-specific calculation helpers and formatters
│   └── <module>Utils.js
└── pages/               # Screen page component mounted into router
    └── <Module>Page.jsx
```

---

## Principle #3: Centralized UI Primitives First
- Always import and reuse core UI building blocks from `@eventify/ui`:
  - Buttons: `<Button>`, `<ActionButton>`
  - Forms: `<FormField>`, `<FormInput>`, `<FormSelect>`
  - Layouts: `<PageHeader>`, `<StatCard>`, `<EmptyState>`
  - Tables: `<TableShell>`, `<table className="master-table">`
  - Badges: `<StatusBadge>`, `<Badge>`
  - Cards: `<Card>`, `<CardHeader>`, `<CardTitle>`, `<CardContent>`
- Do NOT write raw HTML `<button>`, `<input>`, or `<table>` tags with random ad-hoc Tailwind classes.

---

## Principle #4: Standard Palette & Typography Guardrails
- Primary Brand Color: `--brand-600` (`#4f46e5`).
- Font Family:
  - All text, headers, labels, and buttons: `'Poppins', sans-serif`.
  - Monetary values (`₹`, `$`), ticket reference codes, serial numbers: `'JetBrains Mono', monospace`.
- Never hardcode arbitrary hex colors (e.g., `#123456`) in inline styles or Tailwind classes.
- Use the predefined tokens:
  - Brand: `bg-brand-600`, `text-brand-600`, `border-brand-600`
  - Surface: `bg-slate-50`, `bg-white`, `border-slate-200`, `text-slate-800`
  - Status: `StatusBadge` variants (`ACTIVE`, `PENDING`, `CANCELLED`, `DRAFT`, `PUBLISHED`)

---

## Principle #5: Centralized API Client
- All HTTP requests to the backend must go through the centralized `apiClient` utility.
- Raw `fetch()` or separate unconfigured `axios` instances inside UI components are prohibited.
- `apiClient` handles:
  - Base URL configuration (`/api/v1`)
  - Automatic `Authorization: Bearer <token>` injection
  - Centralized 401 Unauthorized handling (token refresh or redirect to login)
