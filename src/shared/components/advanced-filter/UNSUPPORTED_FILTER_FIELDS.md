# Advanced Filter — Unsupported & Partial Fields

Living reference for admin **Advanced Filters** and **Manage Metrics / Export** modals.  
Update this file whenever filter backend wiring changes.

**Related code**

| Area                       | Path                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| Filter UI configs          | `configs/*.config.ts`, `configs/base-filter-sections.ts`                                     |
| Frontend param mapping     | `src/shared/utils/export-filter-utils.ts`                                                    |
| Expert filters (backend)   | `Joms-backend/services/admin-service/src/utils/expertAdvancedFilter.js`                      |
| Expert metrics             | `Joms-backend/services/serviceListing-service/src/services/partnerFilterMetrics.service.js`  |
| Service filters (backend)  | `Joms-backend/services/serviceListing-service/src/utils/serviceAdvancedFilter.js`            |
| Category filters (backend) | `Joms-backend/services/serviceListing-service/src/utils/categoryAdvancedFilter.js`           |
| Category metrics           | `Joms-backend/services/serviceListing-service/src/services/categoryFilterMetrics.service.js` |
| Partner document filters   | `Joms-backend/services/auth-service/src/repositories/auth.repository.js`                     |

---

## Status legend

| Status            | Meaning                                                                              |
| ----------------- | ------------------------------------------------------------------------------------ |
| **Unsupported**   | UI sends params, but backend does not narrow results (no-op or missing data source). |
| **Partial**       | Filter runs, but only for some option values or with simplified semantics.           |
| **Approximation** | Filter works, but metric meaning differs from the Figma / product label.             |
| **Not wired**     | Module UI exists; list API / export pipeline not connected to advanced filters yet.  |
| **Out of scope**  | Page uses a different API; standard advanced-filter pipeline does not apply.         |

---

## Expert Management (`expert-management`)

**Filter UI:** Expert management fields (`expert-management-filters.config.ts`), shared with Expert Profile Services.

| Section      | Fields                                                                                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| By Experts   | Expert ID, Organization ID, Category, Profession, Account Status, Verification Status, Organisation Type, Pending Payouts, Membership Purchased, Membership Type |
| By Services  | Service Listing Status, Service Promoted, Service Pricing Model, Total Revenue Generated, Discount Applied                                                       |
| By Orders    | Service Order Status, Delays Beyond SLA, Payment Status, Payment Method, Dispute Status, Refund Status, Risk based, Payout Status                                |
| By Customers | Customer Total Orders, Customer Onboarding Date, Customer Cancellation Rate %, Customer Lifetime Spend                                                           |
| By Location  | State/Region + City                                                                                                                                              |

**Backend:** `admin-service` + `auth-service` (partner document) + `serviceListing-service` (metrics).  
**Wired pages:** Expert Management, Suspended Experts, Deleted Experts, Pending Approvals.  
**Out of scope:** Reported Experts (separate reports API).

### Unsupported fields

| Section     | UI label                 | Filter key                 | API param(s)      | Reason                                           |
| ----------- | ------------------------ | -------------------------- | ----------------- | ------------------------------------------------ |
| By Services | Service Promoted         | `services.servicePromoted` | `servicePromoted` | Not included in service listing filter pipeline. |
| By Orders   | Delays Beyond SLA        | `orders.delaysBeyondSla`   | `delaysBeyondSla` | No SLA / timeline extension data source.         |
| By Orders   | Risk based (SEV1 / SEV2) | `orders.riskBased`         | `riskBased`       | No risk / severity data source.                  |

### Partial fields

_None._

### Approximations (working, but not exact)

| Section      | UI label                 | Filter key                 | Notes                                                                                |
| ------------ | ------------------------ | -------------------------- | ------------------------------------------------------------------------------------ |
| By Customers | Customer Onboarding Date | `customers.onboardingDate` | Uses earliest platform activity (payment + listing + chat), not account signup date. |

---

## Service Management (`service-management`)

**Backend:** `serviceListing-service` + `auth-service` (owner filters) + payment batch APIs.  
**Wired pages:** Service Management, Pending Approvals, Suspended Services, Deleted Services.  
**Out of scope:** Reported Services (separate reports API).

### Unsupported fields

| Section     | UI label                 | Filter key                   | API param(s)         | Reason                                                                         |
| ----------- | ------------------------ | ---------------------------- | -------------------- | ------------------------------------------------------------------------------ |
| By Services | Service Promoted         | `services.servicePromoted`   | `servicePromoted`    | Explicit no-op in `unsupportedExpertFiltersPass()`; not applied in repository. |
| By Experts  | Category Status          | `experts.categoryStatus`     | `categoryStatus`     | Triggers advanced-filter path; no-op in `unsupportedExpertFiltersPass()`.      |
| By Experts  | Service Performance      | `experts.servicePerformance` | `servicePerformance` | Same — trending / top / low / no-sales not evaluated.                          |
| By Orders   | Delays Beyond SLA        | `orders.delaysBeyondSla`     | `delaysBeyondSla`    | No-op in `listingOrderFiltersPass()`.                                          |
| By Orders   | Risk based (SEV1 / SEV2) | `orders.riskBased`           | `riskBased`          | No-op in `listingOrderFiltersPass()`.                                          |

### Partial fields

_None — all previously partial fields are now fully wired (see changelog)._

### Approximations (working, but not exact)

_None._

---

## Service Category Management (`service-category-management`)

**Backend:** `serviceListing-service` + `auth-service` (expert/location filters) + payment batch APIs.  
**Wired pages:** Category Management (ACTIVE), Paused Categories, Deleted Categories.

### Unsupported fields

| Section     | UI label                 | Filter key                   | API param(s)         | Reason                                           |
| ----------- | ------------------------ | ---------------------------- | -------------------- | ------------------------------------------------ |
| By Services | Service Promoted         | `services.servicePromoted`   | `servicePromoted`    | No promotion data on listings/categories.        |
| By Experts  | Service Performance      | `experts.servicePerformance` | `servicePerformance` | No performance tier data source in filter batch. |
| By Orders   | Delays Beyond SLA        | `orders.delaysBeyondSla`     | `delaysBeyondSla`    | No SLA data source.                              |
| By Orders   | Risk based (SEV1 / SEV2) | `orders.riskBased`           | `riskBased`          | No risk severity data source.                    |

### Partial fields

_None — all previously partial fields are now fully wired (see changelog)._

### Approximations (working, but not exact)

| Section     | UI label                | Filter key                       | Notes                                                          |
| ----------- | ----------------------- | -------------------------------- | -------------------------------------------------------------- |
| By Services | Total Revenue Generated | `services.totalRevenueGenerated` | Sum of approved order revenue for listings under the category. |

---

## Venue Management (`venue-management`)

**Backend:** `venue-service` (document filters + `PartnerSession` booking metrics).  
**Wired pages:** Venue Management, Pending Approvals, Suspended Venues, Rejected Venues, Deleted Venues.  
**Out of scope:** Reported Venues (separate reports API).

### Unsupported fields

| Section     | UI label                     | Filter key                | API param(s)     | Reason                                                                 |
| ----------- | ---------------------------- | ------------------------- | ---------------- | ---------------------------------------------------------------------- |
| By Bookings | Payment Method               | `bookings.paymentMethod`  | `paymentMethod`  | `PartnerSession` has no payment method field.                          |
| By Bookings | Booking Status → **No Show** | `bookings.bookingStatus`  | `bookingStatus`  | No no-show status on sessions; only detected via notes text.           |
| By Bookings | Payment Status → **Partial** | `bookings.paymentStatus`  | `paymentStatus`  | No partial payment status on `PartnerSession`.                         |
| By Bookings | Refunded Status              | `bookings.refundedStatus` | `refundedStatus` | No dedicated refund workflow fields; inferred from session notes only. |

### Partial fields

_None._

### Approximations (working, but not exact)

| Section      | UI label                      | Filter key                   | Notes                                                                              |
| ------------ | ----------------------------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| By Bookings  | Booking Status → **Refunded** | `bookings.bookingStatus`     | Detected when session notes contain "refund".                                      |
| By Bookings  | Payment Status → **Refunded** | `bookings.paymentStatus`     | Same notes-based detection.                                                        |
| By Customers | Registration Date             | `customers.registrationDate` | Uses earliest booking `createdAt` per customer at the venue, not auth signup date. |
| By Venues    | Availability                  | `venues.availability`        | Derived from space weekly availability patterns, not live slot inventory.          |
| By Venues    | Amenities                     | `venues.amenities`           | Resolved from amenity master names + `parkingAvailable` / `inHouseCatering` flags. |

---

## Venue Category Management (`venue-category-management`)

**Backend:** `venue-service` (category document + venues/spaces/`PartnerSession` under each category).  
**Wired pages:** Category Management (active), Paused Categories, Deleted Categories.

### Unsupported fields

| Section     | UI label                     | Filter key                | API param(s)     | Reason                                                                 |
| ----------- | ---------------------------- | ------------------------- | ---------------- | ---------------------------------------------------------------------- |
| By Bookings | Payment Method               | `bookings.paymentMethod`  | `paymentMethod`  | `PartnerSession` has no payment method field.                          |
| By Bookings | Booking Status → **No Show** | `bookings.bookingStatus`  | `bookingStatus`  | No no-show status; only detected via notes text.                       |
| By Bookings | Payment Status → **Partial** | `bookings.paymentStatus`  | `paymentStatus`  | No partial payment status on `PartnerSession`.                         |
| By Bookings | Refunded Status              | `bookings.refundedStatus` | `refundedStatus` | No dedicated refund workflow fields; inferred from session notes only. |

### Partial fields

_None._

### Approximations (working, but not exact)

| Section      | UI label          | Filter key                              | Notes                                                                                    |
| ------------ | ----------------- | --------------------------------------- | ---------------------------------------------------------------------------------------- |
| By Venues    | Venue Type        | `venues.venueType`                      | Matches `venue.venueType` text for indoor/outdoor; many venues store other type strings. |
| By Venues    | Type              | `venues.facilityType`                   | Space model is `auditorium` / `restaurant`; other options use space name heuristics.     |
| By Venues    | Availability      | `venues.availability`                   | Derived from space weekly availability under venues in the category.                     |
| By Venues    | Amenities         | `venues.amenities`                      | Amenity master names + parking/catering flags on venues in the category.                 |
| By Venues    | Location          | `venues.location` / `location.location` | Filters categories that have venues in that state/city.                                  |
| By Customers | Registration Date | `customers.registrationDate`            | Earliest booking `createdAt` per customer at venues in the category.                     |

---

## Communication Management (`communication-management`)

**Backend:** `settings-service` (`listCommunications` + `communicationListQueryValidation`).  
**Wired pages:** Communication Management list.

All modal fields are wired: message ID, title, channel, type, audience, delivery type, status, created by, created on, scheduled at.

### Unsupported fields

_None._

### Partial fields

_None._

### Approximations (working, but not exact)

_None._

---

## Referral Management (`referral-management`)

**Backend:** `admin-service` (`getExpertInvitesService` / `buildFilter`).  
**Wired pages:** Referral Management list.

Filter-worthy model + table fields in the modal: referral ID, referral code, referrer name, referred expert, email, phone, source type, status, referral type, goal progress, email/SMS/WhatsApp sent, created on, sent at, accepted at, expires at.

Left out of the modal (same rule as Communication): invite message body, referrer ID, invite link, delivery request IDs, last delivery error, bulk upload metadata, `updatedAt`.

### Unsupported fields

_None._

### Partial fields

_None._

### Approximations (working, but not exact)

Text fields (IDs, names, email, phone, code) use case-insensitive contains match, not exact equality.

---

## Revenue Overview (`finance-revenue`)

**Backend:** `payment-service` (`listRevenuePayments` + `listQueryValidation`).  
**Wired pages:** Revenue Overview.

Table + filter-worthy Payment fields in the modal: module, entity type, entity ID, entity name, category, owner type, owner name, gross amount, status, payment method, settlement status, fulfillment status, direction, payer type, created on.

Left out of the modal: Razorpay IDs, `moduleData` / `moduleSnapshot` blobs, `fulfillmentResult`, `amountPaise`, gateway/platform received amounts, `failureReason`, `receipt`, `currency`, `softDeleted`, `updatedAt`, raw `userId` / `partnerId` (covered by owner name).

### Unsupported fields

_None._

### Partial fields

_None._

### Approximations (working, but not exact)

| Section    | UI label    | Filter key           | Notes                                                                               |
| ---------- | ----------- | -------------------- | ----------------------------------------------------------------------------------- |
| By Revenue | Entity Type | `revenue.entityType` | Matches `pricingType` or `referenceType` (the table column is derived from either). |
| By Revenue | Entity Name | `revenue.entityName` | `moduleSnapshot.title` or `description` or `orderId`.                               |
| By Revenue | Category    | `revenue.category`   | `moduleSnapshot.category`, else module name.                                        |
| By Revenue | Owner Type  | `revenue.ownerType`  | Maps Expert → `userType: partner`.                                                  |
| By Revenue | Owner Name  | `revenue.ownerName`  | `moduleSnapshot.partnerName` or `partnerId` / `userId`.                             |
| By Revenue | Status      | `revenue.status`     | Paid → `paid`/`fulfilled`; Pending → `created`; Failed → `failed`/`expired`.        |

---

## Finance Services (`finance-services`)

**Backend:** `payment-service` (`listRevenuePayments` for All / By Service / By Consultation; `listEscrowHolds` for Escrow Holds).  
**Wired pages:** Finance Services (all 4 tabs).

Table fields in the modal: service ID, name, expert name, booking ID, user name, status, revenue. Extra model fields: module, pricing type, created on.

Left out: Razorpay IDs, mixed `moduleData` blobs, `holdReason`, milestone IDs, payout ID, `softDeleted`, `updatedAt`.

### Unsupported fields

_None._

### Partial fields

_None._

### Approximations (working, but not exact)

| Section    | UI label    | Notes                                                                |
| ---------- | ----------- | -------------------------------------------------------------------- |
| By Service | Service ID  | Payments: `orderId`. Escrow: `escrowId`.                             |
| By Service | Name        | Payments: snapshot title / description. Escrow: module name.         |
| By Service | Expert Name | Snapshot `partnerName` or `partnerId`.                               |
| By Service | Booking ID  | `referenceId` or `orderId`.                                          |
| By Service | User Name   | Snapshot user/client name or `userId`.                               |
| By Service | Status      | Table only Paid/Pending. Paid → paid/fulfilled (or escrow released). |

---

## Finance Venues (`finance-venues`)

**Backend:** `payment-service` (`listRevenuePayments`, always `module=venue`).  
**Wired pages:** Finance Venues.

Table fields in the modal: venue ID, name, owner, booking ID, booking title, status, revenue. Extra model fields: pricing type, created on.

Left out: Razorpay IDs, mixed `moduleData` blobs, `fulfillmentResult` (except venue/booking aliases), `softDeleted`, `updatedAt`, raw user/partner IDs.

### Unsupported fields

_None._

### Partial fields

_None._

### Approximations (working, but not exact)

| Section  | UI label      | Notes                                                                               |
| -------- | ------------- | ----------------------------------------------------------------------------------- |
| By Venue | Venue ID      | Snapshot / fulfillment `venueId`, else `orderId`.                                   |
| By Venue | Name          | Snapshot venue name / title or description.                                         |
| By Venue | Owner         | Snapshot `partnerName` or `partnerId`.                                              |
| By Venue | Booking ID    | Fulfillment / snapshot `bookingId`, else `referenceId` / `orderId`.                 |
| By Venue | Booking Title | Snapshot title, else pricing type.                                                  |
| By Venue | Status        | Completed → paid/fulfilled; Pending → created/refunded; Cancelled → failed/expired. |

---

## Remaining finance pages

| Module key               | Backend                        | Wired pages              | Notes                                                                                                      |
| ------------------------ | ------------------------------ | ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `finance-memberships`    | membership-service             | Memberships              | Modal: subscription ID, name, plan, amount, billing cycle, status, start/next billing, auto renew, source. |
| `finance-payouts`        | payment-service `listPayouts`  | Payout Management        | Status Completed/Pending/Failed mapped to stored payout enums. Amount uses `fees.netPayable`.              |
| `finance-refunds`        | `listDisputes` + `listRefunds` | Refunds & Chargebacks    | Type fans out to the matching list(s). Unified status labels mapped per model.                             |
| `finance-tax`            | `listTaxRecords`               | Tax & Compliance         | Booking ID/title are approximations (`taxRecordId` / `taxType`). Revenue filters `taxAmount`.              |
| `finance-invoices`       | `listInvoices`                 | Invoices & Billing       | Paid/Pending/Overdue mapped onto `invoiceStatus` / `paymentStatus`.                                        |
| `finance-reconciliation` | `listReconciliation`           | Financial Reconciliation | Difference column maps Matched/Mismatch/Pending onto stored recon status.                                  |
| `finance-escrow`         | `listEscrowHolds`              | Escrow Management        | Live on All / Escrow Holds. Booking-by-service/consultation tabs stay mock.                                |
| `finance-events`         | _none_                         | Events (mock)            | Client-side filter on mock rows.                                                                           |
| `finance-categories`     | _none_                         | Category (mock)          | Client-side filter on mock rows.                                                                           |

Left out across these: Razorpay IDs, banking account numbers, PDF/CSV URLs, line items, evidence blobs, `softDeleted`, admin actor IDs.

---

## Expert Memberships (`expert-memberships`)

**Backend:** `membership-service` (`buildListFilters`).  
**Wired pages:** Memberships → Experts list.

Modal fields match table columns: plan ID, username, plan name, cycle, auto renew, status, started at, expiry at, purchased price.

### Unsupported fields

_None._

### Partial fields

_None._

### Approximations (working, but not exact)

| Section       | UI label        | Filter key                   | Notes                                                             |
| ------------- | --------------- | ---------------------------- | ----------------------------------------------------------------- |
| By Membership | Purchased Price | `memberships.purchasedPrice` | Mapped to `amountMin` / `amountMax` on the subscription list API. |

---

## Support Tickets (`support-tickets`)

**Backend:** `admin-service` (`buildTicketFilter` / `listPastTicketsService`).  
**Wired pages:** Ticket Management, Past Tickets.

Modal fields: ticket ID, subject, status, priority, category, reporter, assigned to, created on.

### Unsupported fields

_None._

### Partial fields

_None._

### Approximations (working, but not exact)

| Section   | UI label               | Filter key                                | Notes                                                                                      |
| --------- | ---------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| By Ticket | Ticket ID              | `tickets.ticketId`                        | Matches `ticketNumber` or `zohoTicketId` (contains), not the UI `#id` display string only. |
| By Ticket | Reporter / Assigned To | `tickets.reporter` / `tickets.assignedTo` | Name contains-match unless the value is an ObjectId.                                       |
| By Ticket | Category               | `tickets.category`                        | Case-insensitive contains, not exact enum equality.                                        |

---

## RBAC Management (`rbac-management`)

**Backend:** `admin-service` (`listRoles` / `listSubAdmins`).  
**Wired pages:** Settings → Access hub (Users + Roles tables).

**Out of scope:** nested Role Users, Admin Detail activity table, My Profile activity table.

Modal fields follow table columns (users: admin code, name, role code/name, scopes, permissions, MFA, status, last action; roles: code, name, description, scopes, permissions, risk, MFA required, status, user count).

### Unsupported fields

_None._

### Partial fields

| Section  | UI label   | Filter key        | Notes                                                                         |
| -------- | ---------- | ----------------- | ----------------------------------------------------------------------------- |
| By Roles | User Count | `roles.userCount` | When min/max are set, all matching roles are loaded then paginated in memory. |

### Approximations (working, but not exact)

Text fields use case-insensitive contains match. Role code/name on the Users tab resolve via Role lookup.

---

## RBAC Invites (`rbac-invites`)

**Backend:** `admin-service` (`applyInviteFilters`).  
**Wired pages:** Invites overview, Sub-admin invites.

Modal fields: invite ID, username, role ID, role name, email, sent at, status.

### Unsupported fields

_None._

### Partial fields

_None._

### Approximations (working, but not exact)

Text fields use case-insensitive contains match.

---

## RBAC Admin Logs (`rbac-admin-logs`)

**Backend:** `admin-service` (`applyAuditLogFilters`).  
**Wired pages:** Admin / user action logs.

Modal fields: activity, username, module, status, IP, admin note, timestamp.

### Unsupported fields

_None._

### Partial fields

_None._

### Approximations (working, but not exact)

Text fields use case-insensitive contains match.

---

## Settings Logs (`settings-logs`)

**Backend:** `settings-service` (`listSettingsLogs`).  
**Wired pages:** Settings Logs.

Modal fields: timestamp, module, action, status, performed by, IP.

### Unsupported fields

_None._

### Partial fields

_None._

### Approximations (working, but not exact)

Module / performed-by / IP use contains match. Action and status accept comma-separated lists.

---

## Login Trails (`login-trails`)

**Backend:** `settings-service` (`listLoginTrails`).  
**Wired pages:** Admin Login Trails.

Modal fields: admin, email, role, IP, action, status, location, device, date.

### Unsupported fields

_None._

### Partial fields

_None._

### Approximations (working, but not exact)

Text fields use case-insensitive contains match. Date range filters `createdAt` (the table Date/Time columns are derived from that).

---

## Incidents (`incidents`)

**Backend:** `settings-service` (`listIncidents`).  
**Wired pages:** Platform Health → Incident Tracking.

Modal fields: incident ID, severity, module, status, assignee, created on.

### Unsupported fields

_None._

### Partial fields

_None._

### Approximations (working, but not exact)

Incident ID / module / assignee use contains match. Severity and status accept comma-separated lists.

---

## Backups (`backups`)

**Backend:** `settings-service` (backup job list).  
**Wired pages:** Platform Health → Backups & Restore.

Modal fields: name, type, scope, created by, timestamp, status.

### Unsupported fields

_None._

### Partial fields

_None._

### Approximations (working, but not exact)

Name / created-by use contains match.

---

## Escalations (`escalations`)

**Backend:** `admin-service` (`listAllEscalationsService`).  
**Wired pages:** Settings → All Escalation.

Modal fields: escalation ID, role ID, role name, type, priority, status, created on.

### Unsupported fields

_None._

### Partial fields

| Section       | UI label | Filter key           | Notes                                                                   |
| ------------- | -------- | -------------------- | ----------------------------------------------------------------------- |
| By Escalation | Status   | `escalations.status` | Derived UI status is applied after fetch (pagination totals can drift). |

### Approximations (working, but not exact)

| Section       | UI label        | Filter key                   | Notes                                                                  |
| ------------- | --------------- | ---------------------------- | ---------------------------------------------------------------------- |
| By Escalation | Escalation ID   | `escalations.escalationId`   | Matches `entityId` / `entityTitle`, not only the formatted display ID. |
| By Escalation | Roles ID        | `escalations.roleId`         | Matches `escalatedToSubAdminId`.                                       |
| By Escalation | Escalation Type | `escalations.escalationType` | Matches `entityType` / `escalationTarget` / `entityTitle`.             |
| By Escalation | Created On      | `escalations.createdOn`      | Filters `escalatedAt`.                                                 |

---

## Expert Clientele (`expert-clientele`)

**Backend:** `serviceListing-service` (`getPartnerClienteleMetricsService`).  
**Wired pages:** Expert profile → Clientele.

Modal fields match the bookings table: order/booking ID, client ID, client name, booking source, listing type, listing name, booking status, pricing type, booking date, order value, payment status, rating.

### Unsupported fields

_None._

### Partial fields

| Section    | UI label | Filter key         | Notes                                     |
| ---------- | -------- | ------------------ | ----------------------------------------- |
| By Booking | Rating   | `clientele.rating` | Most bookings have no per-row rating yet. |

### Approximations (working, but not exact)

Text fields use case-insensitive contains match. Status/source/type fields accept comma-separated checkbox values.

---

## Expert Profile Services (`expert-profile-services`)

**Backend:** `serviceListing-service` (`getServicesByExpertIdService`).  
**Wired pages:** Expert profile → Service Listings → **Services** sub-tab only.

**Filter UI:** Figma-exact fields only (`expert-profile-services.config.ts`):

| Section                                                                                                | Fields                                                                                                                            |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| By Experts                                                                                             | Account Status, Verification Status, Organisation Type, Pending Payouts, Membership Purchased, Membership Type                    |
| By Services                                                                                            | Service Listing Status, Service Promoted, Service Pricing Model, Total Revenue Generated, Discount Applied                        |
| By Orders                                                                                              | Service Order Status, Delays Beyond SLA, Payment Status, Payment Method, Dispute Status, Refund Status, Risk based, Payout Status |
| By Customers                                                                                           | Customer Total Orders, Customer Onboarding Date, Customer Cancellation Rate %, Customer Lifetime Spend                            |
| **Backend:** `admin-service` + `auth-service` (partner document) + `serviceListing-service` (metrics). |
| **Wired pages:** Expert Management, Suspended Experts, Deleted Experts, Pending Approvals.             |
| **Out of scope:** Reported Experts (separate reports API).                                             |

### Unsupported fields

| Section     | UI label          | Filter key                 | Reason                                                        |
| ----------- | ----------------- | -------------------------- | ------------------------------------------------------------- |
| By Services | Service Promoted  | `services.servicePromoted` | No promoted flag on service listing model yet (no-op filter). |
| By Orders   | Delays Beyond SLA | `orders.delaysBeyondSla`   | No SLA timeline data on orders (no-op filter).                |
| By Orders   | Risk based        | `orders.riskBased`         | No risk/SEV data on orders (no-op filter).                    |

### Partial fields

| Section      | UI label                 | Notes                                                          |
| ------------ | ------------------------ | -------------------------------------------------------------- |
| By Customers | Customer Onboarding Date | Uses earliest order date per customer on the listing as proxy. |

---

Modules below have filter **UI configs** in `configs/`. Backend audit pending unless noted.

| Module key                    | Config file                             | Filter pipeline status                               | Unsupported fields          |
| ----------------------------- | --------------------------------------- | ---------------------------------------------------- | --------------------------- |
| `venue-management`            | `venue-management.config.ts`            | **Wired** — 5 list pages + backend advanced filter   | See module section above    |
| `venue-category-management`   | `venue-category-management.config.ts`   | **Wired** — 3 list pages + backend advanced filter   | See module section above    |
| `service-category-management` | `service-category-management.config.ts` | **Wired** — 3 list pages + backend advanced filter   | See module section above    |
| `communication-management`    | `communication-management.config.ts`    | **Wired** — list page + settings-service filters     | See module section above    |
| `referral-management`         | `referral-management.config.ts`         | **Wired** — list page + admin-service filters        | See module section above    |
| `finance-revenue`             | `revenue-overview.config.ts`            | **Wired** — list page + payment-service filters      | See module section above    |
| `finance-services`            | `finance-services.config.ts`            | **Wired** — 4 tabs + payment/escrow list filters     | See module section above    |
| `finance-venues`              | `finance-venues.config.ts`              | **Wired** — list page + payment-service filters      | See module section above    |
| `finance-memberships`         | `finance-memberships.config.ts`         | **Wired** — membership-service list filters          | See remaining finance pages |
| `finance-payouts`             | `finance-payouts.config.ts`             | **Wired** — payout list + payment-service filters    | See remaining finance pages |
| `finance-refunds`             | `finance-refunds.config.ts`             | **Wired** — disputes + refunds lists                 | See remaining finance pages |
| `finance-tax`                 | `finance-tax.config.ts`                 | **Wired** — tax list + payment-service filters       | See remaining finance pages |
| `finance-invoices`            | `finance-invoices.config.ts`            | **Wired** — invoice list + payment-service filters   | See remaining finance pages |
| `finance-reconciliation`      | `finance-reconciliation.config.ts`      | **Wired** — recon list + payment-service filters     | See remaining finance pages |
| `finance-escrow`              | `finance-escrow.config.ts`              | **Wired** — live escrow tabs                         | See remaining finance pages |
| `finance-events`              | `finance-events.config.ts`              | **Client-only** — mock rows, no payment pipeline     | See remaining finance pages |
| `finance-categories`          | `finance-categories.config.ts`          | **Client-only** — mock rows, no finance category API | See remaining finance pages |
| `expert-memberships`          | `expert-memberships.config.ts`          | **Wired** — memberships experts list                 | See module section above    |
| `support-tickets`             | `support-tickets.config.ts`             | **Wired** — ticket management + past tickets         | See module section above    |
| `rbac-management`             | `rbac-management.config.ts`             | **Wired** — access hub users + roles                 | See module section above    |
| `rbac-invites`                | `rbac-invites.config.ts`                | **Wired** — invites overview + sub-admin invites     | See module section above    |
| `rbac-admin-logs`             | `rbac-admin-logs.config.ts`             | **Wired** — admin action logs                        | See module section above    |
| `settings-logs`               | `settings-logs.config.ts`               | **Wired** — settings logs                            | See module section above    |
| `login-trails`                | `login-trails.config.ts`                | **Wired** — admin login trails                       | See module section above    |
| `incidents`                   | `incidents.config.ts`                   | **Wired** — incident tracking                        | See module section above    |
| `backups`                     | `backups.config.ts`                     | **Wired** — backups & restore                        | See module section above    |
| `escalations`                 | `escalations.config.ts`                 | **Wired** — all escalations                          | See module section above    |
| `expert-clientele`            | `expert-clientele.config.ts`            | **Wired** — expert profile clientele bookings        | See module section above    |
| `expert-profile-services`     | `expert-profile-services.config.ts`     | **Wired** — expert profile service listings          | See module section above    |
| `leaderboard-management`      | `leaderboard-management.config.ts`      | **Out of scope** — Expert Application module         | —                           |

When adding a module section, copy this template:

```markdown
## {Module Name} (`{module-key}`)

**Backend:** `{service}`  
**Wired pages:** …

### Unsupported fields

| Section | UI label | Filter key | API param(s) | Reason |
| ------- | -------- | ---------- | ------------ | ------ |

### Partial fields

| Section | UI label | Filter key | Notes |
| ------- | -------- | ---------- | ----- |

### Approximations

| Section | UI label | Filter key | Notes |
| ------- | -------- | ---------- | ----- |
```

---

## Shared unsupported patterns (likely repeat across modules)

These fields appear in multiple configs (`base-filter-sections.ts` or module-specific configs). Expect the same gaps until a dedicated data source is built:

| Pattern                          | Typical filter key                    | Blocker                                                                       |
| -------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------- |
| Service promoted (yes/no)        | `*.servicePromoted`                   | No promotion flag on listing / category documents                             |
| Delays beyond SLA                | `*.delaysBeyondSla`                   | No SLA breach tracking on orders                                              |
| Risk SEV1 / SEV2                 | `*.riskBased`                         | No risk severity model on orders                                              |
| Category status (expert context) | `experts.categoryStatus`              | Not passed to auth / listing owner lookup                                     |
| Service performance tiers        | `experts.servicePerformance`          | Insights exist elsewhere but not in admin filter batch                        |
| Average response time            | `experts.averageResponseTime`         | Metric not populated in filter batch pipeline                                 |
| Membership expiry date           | `experts.membershipExpiryDate`        | Membership service has reminders; no admin list filter                        |
| Booking through microsite        | `orders.bookingThroughMicrosite`      | No microsite booking counter in metrics                                       |
| Organisation type “Others”       | `experts.organisationType` = `others` | **Resolved** — GST registered partners not matching company/agency heuristics |

---

## Changelog

| Date       | Change                                                                                                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-18 | Initial doc: Expert Management + Service Management audited; placeholder sections for remaining modules.                                                                                                                            |
| 2026-08-18 | Service Category Management: backend advanced filters + 3 list pages wired.                                                                                                                                                         |
| 2026-08-18 | **Partial → full:** Organisation Type “Others” (auth heuristics); Category Status “Draft” (preview listings under category); Revenue Generated date range (approved revenue in range); Location on categories (expert auth lookup). |
| 2026-08-18 | Venue Management: Figma-aligned filter config + backend advanced filters + 5 list pages wired.                                                                                                                                      |
| 2026-08-18 | Venue Category Management: Figma-aligned filter config + backend advanced filters + 3 list pages wired.                                                                                                                             |
| 2026-08-18 | Communication Management: added Delivery Type + Scheduled At to the modal; list/export wired to `settings-service` (including `deliveryType` and scheduled date range).                                                             |
| 2026-08-18 | Referral Management: modal aligned to model + table fields; list/export wired to `admin-service`.                                                                                                                                   |
| 2026-08-18 | Revenue Overview: modal aligned to Payment model + table columns; list/export wired to `payment-service`.                                                                                                                           |
| 2026-08-18 | Finance Services: modal aligned to table + Payment/EscrowHold fields; 4 tabs + export wired.                                                                                                                                        |
| 2026-08-18 | Finance Venues: modal aligned to table + Payment venue fields; list/export wired to `payment-service`.                                                                                                                              |
| 2026-08-19 | Remaining Payment & Finance pages: Memberships, Payouts, Refunds, Tax, Invoices, Reconciliation, Escrow, Events, Categories.                                                                                                        |
| 2026-08-19 | Expert Clientele: advanced filters + export wired for expert profile bookings table.                                                                                                                                                |
| 2026-08-19 | Expert Management: modal trimmed to Figma-exact fields (shared figma config).                                                                                                                                                       |
