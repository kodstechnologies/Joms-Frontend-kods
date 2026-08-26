# Playbook: Manage Metrics + Table Columns (Expert Management Pattern)

Share this with other developers when implementing the same **Manage Metrics** + **preference-driven DataTable columns** pattern for another module (venues, services, finance, support, etc.).

This is based on the Expert Management implementation in:

- Frontend: `Joms-Frontend/src/modules/expert`
- Backend: `Joms-backend/services/admin-service` (+ domain services for enrichment)

---

## Goal

1. Every product-spec **column name** appears in **Manage Metrics** (table section).
2. Enabling a column shows it in that module’s **DataTable**.
3. If data exists (or can be derived/batched), **show real values**.
4. If data cannot be tracked without new schema, still show the column as **—** and document it in an MD with reason.
5. Split **one moduleKey per table/tab** when tabs have different column sets.

---

## Architecture (how it works)

```text
Manage Metrics UI (/metrics/:moduleKey)
        │
        ▼
ui-preferences API  (admin-service)
  GET/PUT /admin/ui-preferences/{moduleKey}/table-columns
        │
        ├── catalog  ← tableColumnCatalogs.js (source of truth for ids/labels)
        └── visibleColumnIds ← saved per admin user
        │
        ▼
List page
  useTableColumnPreferences(moduleKey)
  → build column defs by id
  → render only visibleColumnIds (+ select/actions always)
        │
        ▼
List API
  thin row mapper + optional batch enrich
  → returns fields matching column accessors
```

**Important:** Manage Metrics catalogs are **table column catalogs**, not dashboard KPI cards (unless the module also registers dashboard metrics separately).

---

## Step-by-step implementation checklist

### 1) Inventory columns from product specs

For each screen/table:

| Column name (UI label) | kebab-case `id` | Already in API? | Similar existing field? | Source service/model |
| ---------------------- | --------------- | --------------- | ----------------------- | -------------------- |
| Expert ID              | `expert-id`     | yes             | `expertId`              | Partner              |
| …                      | …               | …               | …                       | …                    |

Rules:

- Use **kebab-case ids** consistently (`micro-website-url`, not `microWebsiteUrl`) for preference catalogs.
- Prefer **reusing similar fields** (e.g. Report Category ↔ `issueType`) instead of inventing parallel names.
- Mark fields as:
  - **TRACKABLE_NOW** — join/map/batch from existing data
  - **TRACKABLE_DERIVED** — compute from existing fields
  - **NOT_TRACKABLE** — needs new schema / actor logging → MD only

### 2) Create moduleKeys (one per table)

Example (experts):

| Screen             | moduleKey                  |
| ------------------ | -------------------------- |
| Main experts table | `expert-management`        |
| Pending approvals  | `expert-pending-approvals` |
| Reported           | `expert-reported`          |
| Suspended          | `expert-suspended`         |
| Deleted            | `expert-deleted`           |

Register each key in backend:

- `UI_PREFERENCE_MODULES`
- `MODULE_TABLE_COLUMN_CATALOGS`

### 3) Backend catalog (source of truth)

File: `Joms-backend/services/admin-service/src/config/tableColumnCatalogs.js`

```js
const col = (id, label, type, description, defaultVisible = false) => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

export const MY_MODULE_TABLE_COLUMNS = Object.freeze([
  col('item-id', 'Item ID', 'Text', 'Unique id', true),
  col('name', 'Name', 'Text', 'Display name', true),
  // new columns: defaultVisible false so table stays usable
  col('extra-metric', 'Extra Metric', 'Count', '…', false),
])
```

Then wire:

```js
UI_PREFERENCE_MODULES = [..., "my-module-key"]
MODULE_TABLE_COLUMN_CATALOGS = {
  ...,
  "my-module-key": MY_MODULE_TABLE_COLUMNS,
}
```

### 4) Frontend column config (mirror backend)

File pattern:

`Joms-Frontend/src/modules/<domain>/config/<module>-table-columns.config.ts`

Export:

- `MY_MODULE_KEY`
- `MY_MODULE_TABLE_COLUMNS_CATALOG`
- `DEFAULT_MY_MODULE_VISIBLE_COLUMN_IDS` (filter `defaultVisible`)

Keep **ids/labels in sync** with backend catalog.

### 5) Register in MODULE_METRICS_REGISTRY

File: `Joms-Frontend/src/shared/lib/module-metrics-registry.ts`

```ts
'my-module-key': {
  moduleKey: MY_MODULE_KEY,
  moduleName: 'My Module',
  returnTo: '/my-module/path',
  columns: MY_MODULE_TABLE_COLUMNS_CATALOG.map(...),
  // omit metrics[] if table-columns-only
}
```

This powers `/metrics/:moduleKey` via `SharedModuleMetricsPage`.

Manage Metrics CTA on the list page:

```ts
navigate(`/metrics/my-module-key?returnTo=/my-module/path`)
```

### 6) Preference-driven DataTable on the page

```tsx
const prefs = useTableColumnPreferences(MY_MODULE_KEY)
const dataColumnsById = buildMyModuleColumnsById() // Record<id, ColumnDef>

const visibleIds = prefs.data?.visibleColumnIds?.length
  ? prefs.data.visibleColumnIds
  : DEFAULT_VISIBLE_IDS

const columns = [
  selectColumn, // optional, always shown
  ...visibleIds.map((id) => dataColumnsById[id]).filter(Boolean),
  actionsColumn, // always shown
]
```

Cell rules:

- Real value when present
- `—` when null/missing
- Do **not** preference-gate select/actions columns

### 7) List API enrichment (track what you can)

Pattern used for experts (`formatExpertListItem` + `enrichExpertListRows`):

1. **Map local/entity fields** in the list mapper (phone, status, dates, flags).
2. **Batch-enrich the current page** of IDs (never N+1 if avoidable):
   - memberships batch
   - analytics/filter-metrics/leaderboard batch
   - profile locations / customUrl batch
   - DigiLocker status batch
   - related counts (`$group` by partnerId)
3. Prefer existing internal batch endpoints over per-row detail calls.
4. Derive enums when needed (Yes/No, Temporary/Indefinite, Compliant/Pending).

Expert reference enrichers:

- Partner fields: auth `Partner` select in admin list
- Concierge profile: `profile-service` ConciergeProfile (`customUsername` → customUrl, location, experience)
- Venue: `venue-service` venue location + `venueCategoryId`
- Listings analytics: `serviceListing-service` leaderboard/filter-metrics batches
- DigiLocker: `kyc-service` `/digilocker/internal/status/batch` → Yes/No

### 8) Document NOT_TRACKABLE columns

Create:

`Joms-Frontend/src/modules/<domain>/docs/<module>-columns-not-stored.md`

Only include columns that **cannot** be tracked without new schema. Example shape:

| Column       | Table     | Reason                                 |
| ------------ | --------- | -------------------------------------- |
| Created By   | Main      | No actor stored on create              |
| Suspended By | Suspended | Suspend path does not persist admin id |

Do **not** dump trackable-but-not-yet-wired fields here if you can implement them.

### 9) Acceptance checklist

- [ ] All spec column names appear in Manage Metrics for that moduleKey
- [ ] Enabling a column shows it in the table
- [ ] Trackable columns show real/derived values
- [ ] Untrackable columns show `—` + listed in MD with reason
- [ ] Default visible set keeps the first load readable
- [ ] Similar field names reused (no duplicate parallel fields)
- [ ] Export map updated if export should include new columns (optional)

---

## Expert Management — what we shipped (reference map)

### moduleKeys

- `expert-management`
- `expert-pending-approvals`
- `expert-reported`
- `expert-suspended`
- `expert-deleted`

### Key files

**Backend**

- Catalogs: `admin-service/src/config/tableColumnCatalogs.js`
- List format + enrich: `admin-service/src/services/expert.service.js`
- Reports list mapping: `admin-service/src/repositories/expertReport.repository.js`
- DigiLocker batch: `kyc-service` `/digilocker/internal/status/batch`
- Leaderboard metrics (quotations/proposals/scheduled): `serviceListing-service/.../partnerLeaderboard.service.js`
- Concierge profile location/customUrl enrich: `profile-service/.../partnerLocationInternal.service.js`
- Venue city/state/category enrich: `venue-service/.../venue.repository.js` (`findLocationSummariesByOwnerIds`)

**Frontend**

- Config: `expert/config/expert-management-table-columns.config.ts`
- Column builders: `expert/utils/expert-preference-columns.tsx`
- Pages: `expert/pages/experts/*-page.tsx`
- Registry: `shared/lib/module-metrics-registry.ts`
- Gaps MD: `expert/docs/expert-management-columns-not-stored.md`

### Product decisions applied

- DigiLocker = **Yes/No**
- Micro Website URL = ConciergeProfile **customUrl** (from `customUsername`)
- Scheduled Consultation Bookings = **new/scheduled** consultation bookings (`PartnerSession status=scheduled`)
- Quotations / Proposals counts from **serviceListing**
- Category from category selection (service categories / venue categories)
- **Removed** App Language from expert management catalogs

---

## Recommended approach for another module (copy this order)

1. Collect column specs per table/tab.
2. Create moduleKeys + backend catalogs.
3. Mirror FE configs + registry entries.
4. Wire `useTableColumnPreferences` on each page.
5. Enrich list API for TRACKABLE fields (batch).
6. Write NOT_TRACKABLE MD.
7. Smoke-test Manage Metrics → toggle columns → verify values/`—`.

---

## Anti-patterns to avoid

- One shared moduleKey for tabs with different schemas (reported vs partners).
- Putting analytics formulas into Manage Metrics “dashboard cards” when the request is table columns only.
- Per-row HTTP calls for every metric on a page of 50+ rows.
- Documenting trackable fields as “not stored” instead of wiring them.
- Changing API field names that already exist — map in the FE/catalog instead.
