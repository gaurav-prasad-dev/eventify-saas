# AI Agent Frontend Workflow & Guardrails

This document provides mandatory operational rules for AI coding agents and developers building frontend features for Eventify SaaS.

---

## 1. Golden Rules for AI Agents

1. **Search Before Creating:**
   - Before writing any UI component, check `packages/ui/src/components/` to see if a primitive already exists.
   - Run grep or file search to see existing patterns in other modules before writing new code.

2. **Zero Duplicate Components:**
   - NEVER create a local `Button.jsx`, `Input.jsx`, `Table.jsx`, or `Badge.jsx` inside a feature directory.
   - Always import primitives from `@eventify/ui`:
     ```jsx
     import { 
       Button, 
       ActionButton, 
       FormField, 
       FormInput, 
       PageHeader, 
       TableShell, 
       StatusBadge,
       Card,
       StatCard,
       EmptyState
     } from '@eventify/ui';
     ```

3. **Strict LEGO Assembly Pattern:**
   - Every UI screen must be constructed by assembling existing building blocks.
   - Do not write raw `<button>` or `<input>` tags.
   - Do not write raw `<table>` tags without wrapping them in `<TableShell>` and applying `className="master-table"`.

4. **Palette Redirection Awareness:**
   - Even if you write `bg-purple-600`, `bg-indigo-600`, or `bg-blue-600`, the build system will redirect it to `--brand-600`.
   - Prefer writing `bg-brand-600` or using `<Button variant="primary">` directly.

---

## 2. Standard Screen Creation Flow

When instructed to create or update a frontend screen:

```text
1. Check Existing Feature Folder
   ↓
2. Create/Verify Feature Structure (components/, context/, api/, data/, pages/)
   ↓
3. Assemble Page using @eventify/ui Primitives
   ↓
4. Wire State & API Fetching in <Module>Context
   ↓
5. Add Route in App router
   ↓
6. Test Responsiveness & Interactive States
```

---

## 3. UI Component Reference Catalog

| Need | Component from `@eventify/ui` | Usage Example |
| :--- | :--- | :--- |
| **Page Title Bar** | `<PageHeader>` | `<PageHeader title="Venues" subtitle="Manage locations"><ActionButton .../></PageHeader>` |
| **Toolbar Button** | `<ActionButton>` | `<ActionButton variant="primary" icon={<Plus />}>Add Venue</ActionButton>` |
| **Form Input** | `<FormField>` + `<FormInput>` | `<FormField label="Venue Name" required><FormInput placeholder="e.g. Grand Arena" /></FormField>` |
| **Data Table** | `<TableShell>` + `.master-table` | `<TableShell footer={...}><table className="master-table">...</table></TableShell>` |
| **Status Display** | `<StatusBadge>` | `<StatusBadge status="ACTIVE" />` |
| **Metric Card** | `<StatCard>` | `<StatCard title="Total Revenue" value="₹1,24,500" change="+14%" icon={<DollarSign />} />` |
| **No-Data State** | `<EmptyState>` | `<EmptyState title="No Events Found" action={<ActionButton>Create Event</ActionButton>} />` |
