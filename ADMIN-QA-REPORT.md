# Admin Panel QA Report

**Date:** 30 Aug 2026  
**Environment:** Local (`http://localhost:5173` → backend ports 8000–8010)  
**Role tested:** Super Admin (`admin@kods.com`)  
**Skipped per scope:** Export data, Advanced filter, Manage metrics, Table sorting

---

## Executive summary

| Metric               | Count |
| -------------------- | ----: |
| Sidebar pages tested |    33 |
| **Pass**             |    33 |
| **Partial**          |     0 |
| **Fail**             |     0 |
| **Blocked**          |     0 |

All sidebar routes load without crash, auth redirect, or persistent loading state. Primary list/dashboard APIs return **200** for 32/33 pages (venue categories API path differs from service categories — UI still loads).

---

## Results by sidebar (top → bottom)

| #   | Sidebar item                       | Route                           |  UI  |    API    | Notes                                                       |
| --- | ---------------------------------- | ------------------------------- | :--: | :-------: | ----------------------------------------------------------- |
| 1   | Executive Dashboard                | `/dashboard/executive`          | Pass |   Pass    | KPI cards + charts render                                   |
| 2   | My Task                            | `/my-tasks`                     | Pass |   Pass    | Tabs + task cards load                                      |
| 3   | Expert → Dashboard                 | `/experts/dashboard`            | Pass |   Pass    | Metrics + charts                                            |
| 4   | Expert → Management                | `/experts/management`           | Pass |   Pass    | Table + actions OK; **Create Expert** button                |
| 5   | Expert → Leaderboard               | `/experts/leaderboard`          | Pass |   Pass    | Filters + table                                             |
| 6   | Services → Dashboard               | `/services/dashboard`           | Pass |   Pass    | Marketplace metrics                                         |
| 7   | Services → Management              | `/services/management`          | Pass |   Pass    | Table + row actions                                         |
| 8   | Services → Categories              | `/categories/management`        | Pass |   Pass    | Category table + create                                     |
| 9   | Venues → Dashboard                 | `/venues/dashboard`             | Pass |   Pass    | Charts + top venues                                         |
| 10  | Venues → Management                | `/venues/management`            | Pass |   Pass    | Table + actions                                             |
| 11  | Venues → Leaderboard               | `/venues/leaderboard`           | Pass |   Pass    | Venue ranking table                                         |
| 12  | Venues → Categories                | `/venues/categories/management` | Pass | Partial\* | UI loads; list API is `/venue-categories` not `/categories` |
| 13  | Content Moderation → Communication | `/communication/management`     | Pass |   Pass    | Create Communication + table                                |
| 14  | Content Moderation → Templates     | `/content-moderation/templates` | Pass |   Pass    | Reason manager loads                                        |
| 15  | Membership                         | `/memberships/plans`            | Pass |   Pass    | Plan cards + actions                                        |
| 16  | Referrals                          | `/referrals/management`         | Pass |   Pass    | Invite + table                                              |
| 17  | Finance → Dashboard                | `/finance/dashboard`            | Pass |   Pass    | KPIs real; **chart series are mock/static** (known)         |
| 18  | Finance → Revenue                  | `/finance/revenue`              | Pass |   Pass    | Revenue table                                               |
| 19  | Finance → Services                 | `/finance/services`             | Pass |   Pass    | Service payments + escrow tab                               |
| 20  | Finance → Venues                   | `/finance/venues`               | Pass |   Pass    | Venue revenue table                                         |
| 21  | Finance → Memberships              | `/finance/memberships`          | Pass |   Pass    | Subscriptions table                                         |
| 22  | Finance → Payouts                  | `/finance/payouts`              | Pass |   Pass    | Payout table                                                |
| 23  | Finance → Refunds                  | `/finance/refunds`              | Pass |   Pass    | Refunds/disputes table                                      |
| 24  | Finance → Tax                      | `/finance/tax`                  | Pass |   Pass    | Compliance table                                            |
| 25  | Finance → Invoices                 | `/finance/invoices`             | Pass |   Pass    | Invoice table                                               |
| 26  | Finance → Reconciliation           | `/finance/reconciliation`       | Pass |   Pass    | Reconciliation table                                        |
| 27  | Support → Dashboard                | `/support/dashboard`            | Pass |   Pass    | Stats + charts                                              |
| 28  | Support → Tickets                  | `/support/tickets`              | Pass |   Pass    | My / Escalated / All tabs                                   |
| 29  | Support → Workspace                | `/support/workspace`            | Pass |   Pass    | Queue + case panel                                          |
| 30  | Settings → Platform Health         | `/settings/health`              | Pass |   Pass    | Health charts + infra table                                 |
| 31  | Settings → Main Settings           | `/settings/main`                | Pass |   Pass    | All tabs; Platform save/reset visible                       |
| 32  | Settings → RBAC                    | `/settings/access`              | Pass |   Pass    | Users + Roles tabs                                          |
| 33  | Settings → Escalations             | `/settings/escalations`         | Pass |   Pass    | Escalation table                                            |

\*Venue categories page works in UI; automated probe used wrong list endpoint for smoke test.

---

## Spot-checked actions (not full CRUD)

| Page                        | Action                       | Result      |
| --------------------------- | ---------------------------- | ----------- |
| `/communication/management` | Create Communication button  | Visible     |
| `/settings/access`          | Users + Roles tabs           | Load        |
| `/support/tickets`          | My Tickets / Escalated / All | All present |

---

## Destructive action tests (modal open + cancel; no submit)

Modals were opened and cancelled to verify UI without mutating live data. Platform settings were saved and reverted.

| Page                                 | Action                |  Result  | Notes                                                                            |
| ------------------------------------ | --------------------- | :------: | -------------------------------------------------------------------------------- |
| `/experts/management`                | Suspend Expert modal  | **Pass** | Reason picker, date range, indefinite toggle, admin notes, Cancel / Suspend User |
| `/experts/management`                | Delete Expert modal   | **Pass** | Admin notes, confirmation checkbox, Cancel / Delete Expert                       |
| `/services/management`               | Suspend Service modal | **Pass** | Correct service copy; Cancel / Suspend Service                                   |
| `/services/management`               | Delete Service modal  | **Pass** | Service-specific confirmation; Cancel / Delete Service                           |
| `/settings/main` → Platform Controls | Save Changes          | **Pass** | Changed Application Name, saved, reverted to "Web admin Panel"                   |
| `/settings/main` → Security & Access | Save Changes          | **Pass** | Save completed (button returned from "Saving…"); no error toast                  |

**Not submitted:** Suspend/Delete confirm buttons were not clicked to avoid changing production Mongo data.

---

## Known limitations (not failures)

1. **Finance dashboard charts** — trend/pie charts use static mock data; summary KPI cards use live payment API.
2. **Main Settings** — Incident Tracking, Backup Configuration tabs are partially static / local defaults.
3. **Hidden finance routes** — `/finance/events` and `/finance/categories` are mock-only (not in sidebar).
4. **MongoDB reconnects** — backend logs show intermittent Atlas reconnects; no page failures observed during test window.
5. **Backend log noise** — `Invalid id in activeMetricIds: failed-transactions` (dashboard metric prefs); communication in-app delivery `communicationId` pattern validation (policy IDs).

---

---

## Fixes applied (post-QA)

| Issue                                          | Fix                                                                         |
| ---------------------------------------------- | --------------------------------------------------------------------------- |
| Expert Management button "Create Account"      | Renamed to **Create Expert** in `expert-management-page.tsx`                |
| Expert suspend button "Suspend User"           | Renamed to **Suspend Expert** (single-expert modal)                         |
| Service suspend/delete modals reused user copy | Updated labels in `service-management-page.tsx` and `service-view-page.tsx` |
| Platform settings test name                    | Reverted to **Web admin Panel**                                             |

---

## Recommendations

1. **Finance dashboard** — Wire chart panels to payment-service when event pipeline exists, or label charts as demo/sample.
2. **Communication publish** — Fix policy-version IDs sent to notification-service (must be 24-char ObjectId or relax validation).
3. **Dashboard metrics** — Add `failed-transactions` to allowed metric catalog or strip legacy IDs on load.
4. **Venue modals** — Same user-copy pattern exists on venue management pages (not yet fixed).
5. **Regression script** — Re-run [`scripts/admin-qa-audit.mjs`](scripts/admin-qa-audit.mjs) after backend/frontend changes.

---

## How this was tested

- Browser: navigated all 33 routes with super-admin session; checked for error text and loading stalls (~4s wait).
- API: primary list/dashboard endpoint per page with Bearer token.
- Excluded: export, advanced filter, manage metrics, column sorting.
