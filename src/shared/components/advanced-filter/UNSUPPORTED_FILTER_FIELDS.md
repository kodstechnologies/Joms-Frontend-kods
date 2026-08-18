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

**Backend:** `admin-service` + `auth-service` (partner document) + `serviceListing-service` (metrics).  
**Wired pages:** Expert Management, Suspended Experts, Deleted Experts, Pending Approvals.  
**Out of scope:** Reported Experts (separate reports API).

### Unsupported fields

| Section     | UI label                      | Filter key                       | API param(s)                                               | Reason                                                                                                                                   |
| ----------- | ----------------------------- | -------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| By Experts  | Average Response Time (Hours) | `experts.averageResponseTime`    | `averageResponseTimeMin`, `averageResponseTimeMax`         | Mapped in `expertAdvancedFilter.js` but `averageResponseTimeHours` is never populated in `partnerFilterMetrics.service.js` (always `0`). |
| By Experts  | Membership Expiry Date        | `experts.membershipExpiryDate`   | `membershipExpiryDateMin`, `membershipExpiryDateMax`       | No auth or metrics filter implemented.                                                                                                   |
| By Services | Service Promoted              | `services.servicePromoted`       | `servicePromoted`                                          | Not included in `hasServiceShapeFilters()` / `partnerListingFilter.service.js`.                                                          |
| By Orders   | Delays Beyond SLA             | `orders.delaysBeyondSla`         | `delaysBeyondSla`                                          | Listed in order filter keys; no SLA / timeline extension data source.                                                                    |
| By Orders   | Risk based (SEV1 / SEV2)      | `orders.riskBased`               | `riskBased`                                                | No risk / severity data source.                                                                                                          |
| By Orders   | Booking Through Microsite     | `orders.bookingThroughMicrosite` | `bookingThroughMicrositeMin`, `bookingThroughMicrositeMax` | No backend metric or filter.                                                                                                             |

### Partial fields

_None — all previously partial fields are now fully wired (see changelog)._

### Approximations (working, but not exact)

| Section      | UI label                    | Filter key                 | Notes                                                                                |
| ------------ | --------------------------- | -------------------------- | ------------------------------------------------------------------------------------ |
| By Orders    | Number Of Terminated Orders | `orders.terminatedOrders`  | Mapped to `ordersCancelled`, not a dedicated terminated count.                       |
| By Customers | Customer Onboarding Date    | `customers.onboardingDate` | Uses earliest platform activity (payment + listing + chat), not account signup date. |

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

Modules below have filter **UI configs** in `configs/`. Backend audit pending unless noted.

| Module key                    | Config file                             | Filter pipeline status                             | Unsupported fields       |
| ----------------------------- | --------------------------------------- | -------------------------------------------------- | ------------------------ |
| `venue-management`            | `venue-management.config.ts`            | **Wired** — 5 list pages + backend advanced filter | See module section below |
| `venue-category-management`   | `venue-category-management.config.ts`   | **Wired** — 3 list pages + backend advanced filter | See module section above |
| `service-category-management` | `service-category-management.config.ts` | **Wired** — 3 list pages + backend advanced filter | See module section below |
| `communication-management`    | `communication-management.config.ts`    | **Not wired**                                      | _TBD_                    |
| `referral-management`         | `referral-management.config.ts`         | **Not wired**                                      | _TBD_                    |
| `rbac-management`             | `rbac-management.config.ts`             | **Not wired**                                      | _TBD_                    |
| `leaderboard-management`      | `leaderboard-management.config.ts`      | **Not wired**                                      | _TBD_                    |

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
