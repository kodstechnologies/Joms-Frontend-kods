# Service Management — Columns Not Stored / Not Trackable

Only columns that **cannot** be populated from existing JOMS data without new schema.

| Column            | Table                     | Reason                                                         |
| ----------------- | ------------------------- | -------------------------------------------------------------- |
| Promoted          | Service Management (main) | No promoted / featured flag on ServiceListing or Consultation. |
| Compliance Status | Suspended Services        | No compliance workflow field on listing `suspensionDetails`.   |

## Tracked sources (reference)

- **Pricing / Tier / Discount / Final Price**: Listing `pricingType`, `fixedPricing`, `tieredPricing`, consultation `pricingOptions`.
- **Expert Rating / Account Status**: Partner review summaries (`profile-service`) + Partner `isBlocked` / `isDeactivated` (`auth-service`).
- **Listing Average Rating**: `POST /profile/internal/services/review-summaries`.
- **Transactions / Bookings / Revenue / Cancellation / Repeat Booking % / Disputes**: `listingFilterMetrics.service.js` (orders, sessions, disputes).
- **Suspended By / Deleted By / Deleted By ID**: Latest `ServiceListingRevision` actors for `suspended` / `deleted`.
- **Restore Eligible**: `deletedAt` within 21 days (same rule as restore API).
- **Reported table**: `ServiceReport` (`reportId`, `issueType`, `reporterType`, `reporterId`, `investigationStatus`, `investigatingAdmin`).

## Notes

- Existing preference ids (`service-id`, `name`, `pricing`, …) were kept so saved admin column prefs stay valid; labels now match the Listing ID / Base Price specs.
- Consultations use `CON###` listing ids; services use `SER###` (page-scoped display ids).
