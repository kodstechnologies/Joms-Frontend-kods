# Admin Dashboard Frontend Architecture (Current + Future)

This document describes the current frontend foundation in this repo and the conventions to follow when adding new modules/features and when connecting to the backend.

It’s designed to preserve the existing architecture:
- Feature-based modular structure
- Strict separation of concerns (API/hook/page/shared)
- Type-safe frontend (TypeScript + Zod)
- Server state via TanStack Query only
- UI/auth global state via Zustand only

---

## 1) Tech & State Boundaries (Non-negotiable rules)

### Server state (data fetching / mutations)
- Use **TanStack Query** in `modules/*/hooks/*`
- Page components call only hooks (never call Axios directly)
- API calls live in `modules/*/api/*`

### Global UI/auth state
- Use **Zustand** for:
  - auth session state (`useAuthStore`)
  - any app-wide UI state that is not server data

### Shared utilities/components
- `src/shared/*` is for:
  - UI primitives (cards, buttons, tables, layout primitives)
  - generic helpers (e.g. `cn`, responsive primitives)
  - reusable design tokens
- `src/shared/*` must **not** contain:
  - API calls
  - feature/business logic
  - module-specific data fetching

---

## 2) Current Folder Structure (high-level)

### Root
- `src/main.tsx` – app bootstrap

### App layer (`src/app/*`)
- `src/app/providers/`
  - `app-providers.tsx` – composes global providers (Theme + Query + Toaster)
  - `query-provider.tsx` – TanStack Query provider + Devtools
  - `theme-provider.tsx` – `next-themes` provider
- `src/app/router/`
  - `app-router.tsx` – routes (protected routing + dashboard routes)
  - `protected-route.tsx` – gate for protected pages
- `src/app/layouts/`
  - `dashboard-layout.tsx` – enterprise shell (fixed sidebar + sticky topbar + scrollable main)
  - `components/`
    - `sidebar.tsx`, `sidebar-item.tsx`, `sidebar-group.tsx`, `sidebar-mobile.tsx`
    - `topbar.tsx`
  - `navigation/`
    - `navigation.config.ts` – **data-driven** sidebar navigation config
  - `components/` (responsive primitives are in `shared/`, not here)
- `src/app/store/`
  - `auth-store.ts` – Zustand auth state used across shell + Axios interceptor

### Modules (`src/modules/*`)
Each feature module is isolated and follows:
- `api/` – typed API functions (Axios requests)
- `hooks/` – TanStack Query wrappers (useQuery/useMutation)
- `validations/` – Zod schemas used with React Hook Form
- `pages/` – thin route components (no direct API calls)
- optional `mock/` – typed mock data only

### Shared (`src/shared/*`)
- `components/`
  - `dashboard/` – dashboard UI primitives (cards, stats, chart card, etc.)
  - `form/` – reusable form inputs (e.g. `otp-input.tsx`)
  - `table/` – reusable TanStack Table wrapper (`data-table.tsx`)
  - `responsive/` – global responsive primitives:
    - `page-container.tsx`
    - `responsive-grid.tsx`
  - `ui/` – small UI primitives (`button`, `input`, `card`, etc.)
- `hooks/` – shared hooks (e.g. `use-media-query.ts`)
- `lib/`
  - `axios.ts` – configured Axios instance + auth interceptor
  - `query-client.ts` – TanStack Query client defaults
  - `cn.ts` – className composition
  - `design-tokens.ts` – centralized UI tokens for premium surfaces
- `config/` – environment variables adapter in `src/config/` (see below)
- `types/`, `constants/`, `validations/` – kept for consistent growth

### Config (`src/config/*`)
- `env.ts`
  - reads `import.meta.env` into a typed `env` object

---

## 3) Adding a New Module (future-proof template)

Assume you want to add a new feature called **“reports”**.

### Step A: Create module boundary
Create the folder:
`src/modules/reports/`

Then inside it:
- `api/`
  - `reports-api.ts` (or multiple files)
- `hooks/`
  - `use-reports-query.ts`, `use-update-report-mutation.ts` etc.
- `validations/`
  - Zod schemas for forms/requests
- `pages/`
  - `reports-page.tsx`, `reports-list-page.tsx` (thin)
- optional:
  - `components/` for module-local UI building blocks
  - `mock/` for typed mock data

### Step B: Define API contracts in `api/`
In `src/modules/reports/api/*`:
- export typed functions like:
  - `getReports(...)`
  - `createReport(...)`
  - `updateReport(...)`
- use the shared Axios client:
  - `import { apiClient } from '@/shared/lib/axios'`

### Step C: Wrap server calls in `hooks/`
In `src/modules/reports/hooks/*`:
- use TanStack Query:
  - `useQuery({ queryKey, queryFn })`
  - `useMutation({ mutationFn })`
- keep hooks responsible for:
  - invalidation (`queryClient.invalidateQueries`)
  - loading/error state mapping (if needed)

### Step D: Keep `pages/` thin
In `src/modules/reports/pages/*`:
- call only module hooks
- for forms:
  - React Hook Form + Zod resolver
  - handle submit by calling mutations from hooks
- no Axios usage directly

### Step E: Route + sidebar entry (if needed)
- Routing is defined in `src/app/router/app-router.tsx`
- Sidebar items are **data-driven** from:
  - `src/app/layouts/navigation/navigation.config.ts`

Update:
- add new children or new navigation group
- ensure `to` matches the route path

---

## 4) Connecting Frontend to Backend (effective strategy)

This repo already implements an “enterprise” approach using:
- `src/config/env.ts` for environment config
- `src/shared/lib/axios.ts` for Axios base client + auth injection
- TanStack Query for server state lifecycle
- Zustand for session state + request auth

### 4.1 Environment variables
The backend base URL is:
- `VITE_API_BASE_URL` (default: `/api`)

File:
- `src/config/env.ts`

### 4.2 Central Axios instance + auth interceptor
File:
- `src/shared/lib/axios.ts`

Behavior:
- Axios uses `env.apiBaseUrl`
- request interceptor injects:
  - `Authorization: Bearer <accessToken>`
  - from Zustand `useAuthStore.getState().accessToken`

### 4.3 Recommended API implementation style
In `modules/*/api/*`:
- define DTO types:
  - request payload types
  - response payload types
- return `response.data` from typed calls
- throw on failures (let React Query handle error states)

### 4.4 Error + UI handling policy
Recommended:
- show user feedback at the **page level** or within hooks using query error boundaries
- avoid heavy UI logic in `api/`

---

## 5) Responsive & Layout Standards (reuse globally)

### Page container
Use:
`src/shared/components/responsive/page-container.tsx`

This standardizes:
- max width
- horizontal padding across breakpoints

### Responsive grid utility
Use:
`src/shared/components/responsive/responsive-grid.tsx`

Patterns:
- mobile single-column
- tablet 2-column
- desktop 3/4-column layouts

### Sidebar + topbar shell behavior
Enterprise shell:
- desktop sidebar fixed (`position: fixed`)
- topbar sticky/visible
- only main content scrolls (`overflow-y-auto` on main)
- mobile drawer uses overlay + Escape/outside-click behavior

Primary shell:
- `src/app/layouts/dashboard-layout.tsx`

---

## 6) Coding Standards (consistent enterprise quality)

### File naming
- `camelCase` for files like:
  - `use-login-mutation.ts`
  - `executive-overview-page.tsx`
- `kebab-case` for folders is already the convention:
  - `modules/auth/validations/`

### Component rules
- Pages: thin, composition-first
- Shared UI: reusable, no API calls, no business logic
- Module UI: module-local composition if it depends on module-specific data types

### Type safety & validation
- Use Zod for:
  - request payload validation (especially for forms)
  - typed inference with `z.infer<>`
- Use explicit DTO types in API

### Avoid duplication
- Reuse existing dashboard primitives in `shared/components/dashboard/*`
- Reuse table wrapper in `shared/components/table/*`
- Reuse modal/base components if/when you add module dialogs

---

## 7) Quick Example (How to add “Reports → List Page”)

1. Create:
   - `src/modules/reports/api/reports-api.ts`
   - `src/modules/reports/hooks/use-reports-query.ts`
   - `src/modules/reports/pages/reports-list-page.tsx`
2. Add route in:
   - `src/app/router/app-router.tsx`
3. Add sidebar nav item in:
   - `src/app/layouts/navigation/navigation.config.ts`
4. Use shared UI primitives:
   - `DashboardCard`, `ResponsiveGrid`, `DataTable`, etc.

---

## 8) “Do / Don’t” Checklist (to protect architecture)

Do:
- Keep API calls in `modules/*/api/*`
- Keep query/mutation logic in `modules/*/hooks/*`
- Keep pages thin (compose UI + call hooks)
- Keep global/session state in Zustand (`src/app/store/*`)
- Use `apiClient` from `src/shared/lib/axios.ts`
- Use `PageContainer` and `ResponsiveGrid` for consistent layout

Don’t:
- Put business logic or API calls in `shared/components`
- Call Axios directly from pages
- Mix server state into Zustand (use TanStack Query)
- Rewrite components unnecessarily

