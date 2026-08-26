# Expert Management — Columns Not Stored / Not Trackable

Only columns that **cannot** be populated from existing JOMS data without new schema or actor logging.

| Column             | Table                     | Reason                                                                       |
| ------------------ | ------------------------- | ---------------------------------------------------------------------------- |
| Created By         | Experts Management (main) | Partner registration does not store who created the account (User vs Admin). |
| SLA (Days Pending) | Pending Approvals         | No SLA clock or SLA field on Partner / KYC application.                      |
| Priority           | Pending Approvals         | No application priority field on Partner / `finalReview`.                    |
| Suspended By       | Suspended Experts         | Suspend API stores reason / until dates only; admin actor is not persisted.  |
| Deleted By         | Deleted Experts           | Soft-delete does not store the admin who deactivated the account.            |

## Tracked sources (reference)

- **Designation / City / State / Years of Experience / Micro Website URL (`customUrl`)**: ConciergeProfile (`profile-service`) via locations batch; Venue location + category from `venue-service`.
- **Category**: Partner `basicProfile.serviceCategory` / service categories; Venue `venueCategoryId` names.
- **DigiLocker Verification**: Yes/No from `DigilockerVerification.status === SUCCESS`.
- **Quotations / Proposals / Scheduled Consultation Bookings**: `serviceListing-service` leaderboard metrics batch (`QuotationRequest`, `Proposal`, `PartnerSession` scheduled).

## Notes

- App Language was removed from Expert Management table catalogs per product request.
- Deleted Experts had no separate column image attached; catalog uses the current deleted UI plus already-stored soft-delete fields (`deactivationType`, `deletionDetails.adminNotes`).
