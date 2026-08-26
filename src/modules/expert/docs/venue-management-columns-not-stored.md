# Venue Management: Table Columns & Dashboard Metrics Implementation Report

This document details the mapping, tracking capabilities, and schema rationale for all columns in **Venue Management** and its sub-tables (**Pending Approvals**, **Reported Venues**, **Suspended Venues**, **Deleted Venues**) as well as **Venue Dashboard** metrics based on the product specification.

---

## 1. Summary of Architecture

- **Backend Catalogs**: Defined in `Joms-backend/services/admin-service/src/config/tableColumnCatalogs.js`
- **UI Preferences Service**: Managed via `/admin/ui-preferences/:moduleKey/table-columns` & `/admin/ui-preferences/:moduleKey/dashboard-metrics`
- **Frontend Config**: Defined in `Joms-Frontend/src/modules/expert/config/venue-management-table-columns.config.ts`
- **Registry**: Integrated into `Joms-Frontend/src/shared/lib/module-metrics-registry.ts`
- **Manage Metrics Route**: `/metrics/:moduleKey?returnTo=...`

---

## 2. Table Column Catalogs & Field Status

### A. Main Venues Table (`venue-management`)

| Column Name                  | Spec ID                  | Type       | Implementation Status | Source / Reason                                                                                                      |
| :--------------------------- | :----------------------- | :--------- | :-------------------- | :------------------------------------------------------------------------------------------------------------------- |
| **Venue ID**                 | `venue-id`               | Text       | ✅ Implemented        | Formatted `VEN-XXXX` from `venue._id` / `venueId`                                                                    |
| **Venue Name**               | `name`                   | Text       | ✅ Implemented        | Plain text `venue.name` / `venue.venueName`                                                                          |
| **Venue Category**           | `category`               | Text       | ✅ Implemented        | Plain text resolved from `venueCategoryId` lookup map                                                                |
| **Venue Type**               | `venue-type`             | Text       | ✅ Implemented        | Plain text `venue.venueType` / `venue.eventType` (Indoor/Outdoor/Hybrid)                                             |
| **Venue Rating**             | `venue-rating`           | Average    | ✅ Implemented        | Aggregated from `VenueReview` (avg rating) or `venue.ratings`                                                        |
| **Venue Location**           | `venue-location`         | Text       | ✅ Implemented        | Formatted address from `venue.location` (address, landmark, city, state)                                             |
| **Venue Status**             | `status`                 | Status     | ✅ Implemented        | Moderation status badge (`in_review`, `active`, `suspended`, `deleted`)                                              |
| **Space ID**                 | `space-id`               | Text       | ✅ Implemented        | Formatted `SPC-XXXX` from linked space `_id`                                                                         |
| **Space Name**               | `space-name`             | Text       | ✅ Implemented        | Plain text `space.name` from linked `spaceModel`                                                                     |
| **Space Category**           | `space-category`         | Text       | ✅ Implemented        | Plain text `space.spaceType` (Meeting Room, Cabin, Open Desk, Hall, etc.)                                            |
| **Space Location**           | `space-location`         | Text       | ✅ Implemented        | Plain text `space.location.address` or fallback to venue location                                                    |
| **Space Type**               | `space-type`             | Text       | ✅ Implemented        | Plain text `space.spaceType` (Indoor, Outdoor)                                                                       |
| **Space Status**             | `space-status`           | Status     | ✅ Implemented        | Status badge `space.status` (Active, Submitted, Suspended, Deleted)                                                  |
| **Space Price**              | `space-price`            | Currency   | ✅ Implemented        | Fetched from `SpacePricing` (`pricePerHour` / `basePrice`)                                                           |
| **Space Rating**             | `space-rating`           | Average    | ✅ Implemented        | Rating from reviews / venue ratings                                                                                  |
| **Revenue**                  | `revenue`                | Currency   | ✅ Implemented        | Aggregated total price from completed `PartnerSession` bookings                                                      |
| **City**                     | `city`                   | Text       | ✅ Implemented        | `venue.location.city` / `venue.city`                                                                                 |
| **Number of Events Hosted**  | `events-hosted`          | Count      | ✅ Implemented        | Aggregated completed bookings with category `'Event'`                                                                |
| **Number of Meetups Hosted** | `meetups-hosted`         | Count      | ✅ Implemented        | Aggregated completed bookings with category `'Meetup'`                                                               |
| **Repeat Booking Rate**      | `repeat-booking-rate`    | Percentage | ⚠️ Untracked (`—`)    | **Reason**: Repeat customer booking calculation requires user retention history across venues. Rendered as `—`.      |
| **Space Utilization %**      | `space-utilization`      | Percentage | ✅ Implemented        | Derived from ratio of completed bookings to total scheduled bookings                                                 |
| **Venue NPS**                | `venue-nps`              | Average    | ⚠️ Untracked (`—`)    | **Reason**: NPS survey scores (promoters vs detractors) are not collected in current review schema. Rendered as `—`. |
| **Host Cancellation Rate**   | `host-cancellation-rate` | Percentage | ✅ Implemented        | Derived from `PartnerSession` where status is cancelled and `bookedBy === 'partner'`                                 |
| **Created At**               | `created-at`             | Date       | ✅ Implemented        | `venue.createdAt`                                                                                                    |
| **Last Updated At**          | `last-updated-at`        | Date       | ✅ Implemented        | `venue.updatedAt`                                                                                                    |

---

### B. Pending Approvals Table (`venue-pending-approvals`)

| Column Name        | Spec ID          | Type   | Implementation Status | Source / Reason                                       |
| :----------------- | :--------------- | :----- | :-------------------- | :---------------------------------------------------- |
| **Venue ID**       | `venue-id`       | Text   | ✅ Implemented        | Formatted `VEN-XXXX`                                  |
| **Venue Name**     | `venue-name`     | Text   | ✅ Implemented        | Plain text `venue.name` / `venue.venueName`           |
| **Venue Category** | `venue-category` | Text   | ✅ Implemented        | Plain text resolved from `venueCategoryId` lookup map |
| **Venue Type**     | `venue-type`     | Text   | ✅ Implemented        | Plain text `venue.venueType` / `venue.eventType`      |
| **Venue Location** | `venue-location` | Text   | ✅ Implemented        | Formatted address from `venue.location`               |
| **Venue Status**   | `venue-status`   | Status | ✅ Implemented        | Pending Approval / In Review status badge             |
| **Space ID**       | `space-id`       | Text   | ✅ Implemented        | Formatted `SPC-XXXX` from linked space                |
| **Space Name**     | `space-name`     | Text   | ✅ Implemented        | Plain text `space.name`                               |
| **Space Category** | `space-category` | Text   | ✅ Implemented        | Plain text `space.spaceType`                          |
| **Space Location** | `space-location` | Text   | ✅ Implemented        | Plain text `space.location.address`                   |
| **Space Type**     | `space-type`     | Text   | ✅ Implemented        | Plain text `space.spaceType`                          |
| **Space Status**   | `space-status`   | Status | ✅ Implemented        | Space review status badge (`submitted` / `pending`)   |
| **City**           | `city`           | Text   | ✅ Implemented        | `venue.location.city`                                 |
| **Submitted At**   | `submitted-at`   | Date   | ✅ Implemented        | `venue.createdAt` / submission timestamp              |
| **Submitted By**   | `submitted-by`   | Text   | ✅ Implemented        | Plain text `venue.ownerId ? 'Host' : 'Admin'`         |

---

### C. Reported Venues Table (`venue-reported`)

| Column Name           | Spec ID             | Type   | Implementation Status | Source / Reason                                        |
| :-------------------- | :------------------ | :----- | :-------------------- | :----------------------------------------------------- |
| **Report ID**         | `report-id`         | Text   | ✅ Implemented        | `report.reportId`                                      |
| **Venue ID**          | `venue-id`          | Text   | ✅ Implemented        | Linked `report.venueId`                                |
| **Venue Name**        | `venue-name`        | Text   | ✅ Implemented        | `report.venueName`                                     |
| **Report Reason**     | `report-reason`     | Text   | ✅ Implemented        | `report.reason` / `report.issueType`                   |
| **Reported By**       | `reported-by`       | Text   | ✅ Implemented        | `report.reporterName` (`report.reporterType`)          |
| **Reported At**       | `reported-at`       | Date   | ✅ Implemented        | `report.submittedAt` / `report.createdAt`              |
| **Escalated By**      | `escalated-by`      | Text   | ✅ Implemented        | Moderation officer (`report.escalatedBy` or `'Admin'`) |
| **Escalation Reason** | `escalation-reason` | Text   | ✅ Implemented        | Internal notes (`report.escalationReason` or `—`)      |
| **Escalated At**      | `escalated-at`      | Date   | ✅ Implemented        | Timestamp if escalated                                 |
| **Compliance Status** | `compliance-status` | Status | ✅ Implemented        | Status badge (`Under Review`, `Resolved`, `Closed`)    |

---

### D. Suspended Venues Table (`venue-suspended`)

| Column Name           | Spec ID             | Type   | Implementation Status | Source / Reason                                                          |
| :-------------------- | :------------------ | :----- | :-------------------- | :----------------------------------------------------------------------- |
| **Suspension ID**     | `suspension-id`     | Text   | ✅ Implemented        | `SUS-XXXX` from venue ID                                                 |
| **Venue ID**          | `venue-id`          | Text   | ✅ Implemented        | Formatted `VEN-XXXX`                                                     |
| **Venue Name**        | `venue-name`        | Text   | ✅ Implemented        | `venue.name` / `venue.venueName`                                         |
| **Suspension Reason** | `suspension-reason` | Text   | ✅ Implemented        | `suspensionDetails.selectedReasons` / `reasonDetails` / policy violation |
| **Suspended By**      | `suspended-by`      | Text   | ✅ Implemented        | Admin who performed suspension                                           |
| **Admin ID**          | `admin-id`          | Text   | ✅ Implemented        | Admin actor ID                                                           |
| **Suspended At**      | `suspended-at`      | Date   | ✅ Implemented        | `suspensionDetails.startDate` / `venue.updatedAt`                        |
| **Suspension Until**  | `suspension-until`  | Date   | ✅ Implemented        | `suspensionDetails.endDate` or `'Permanent'`                             |
| **Escalated By**      | `escalated-by`      | Text   | ✅ Implemented        | Internal escalation actor (`'Admin'`)                                    |
| **Escalation Reason** | `escalation-reason` | Text   | ✅ Implemented        | Internal remarks                                                         |
| **Escalated At**      | `escalated-at`      | Date   | ✅ Implemented        | Escalation date                                                          |
| **Compliance Status** | `compliance-status` | Status | ✅ Implemented        | Review status badge (`Pending Review` / `Resolved`)                      |

---

### E. Deleted Venues Table (`venue-deleted`)

| Column Name           | Spec ID             | Type   | Implementation Status | Source / Reason                                                      |
| :-------------------- | :------------------ | :----- | :-------------------- | :------------------------------------------------------------------- |
| **Deletion ID**       | `deletion-id`       | Text   | ✅ Implemented        | `DEL-XXXX` from venue ID                                             |
| **Venue ID**          | `venue-id`          | Text   | ✅ Implemented        | Formatted `VEN-XXXX`                                                 |
| **Venue Name**        | `venue-name`        | Text   | ✅ Implemented        | `venue.name` / `venue.venueName`                                     |
| **Deleted By**        | `deleted-by`        | Text   | ✅ Implemented        | `deletionDetails.adminNotes ? 'Admin' : 'Host'`                      |
| **Deletion Reason**   | `deletion-reason`   | Text   | ✅ Implemented        | `deletionDetails.selectedReasons` / `reasonDetails` / `venue.reason` |
| **Admin ID**          | `admin-id`          | Text   | ✅ Implemented        | Admin actor ID                                                       |
| **Deleted At**        | `deleted-at`        | Date   | ✅ Implemented        | `venue.deletedAt`                                                    |
| **Escalated By**      | `escalated-by`      | Text   | ✅ Implemented        | Escalation actor                                                     |
| **Escalation Reason** | `escalation-reason` | Text   | ✅ Implemented        | Internal remarks                                                     |
| **Escalated At**      | `escalated-at`      | Date   | ✅ Implemented        | Escalation date                                                      |
| **Compliance Status** | `compliance-status` | Status | ✅ Implemented        | `Archived` / investigation state badge                               |

---

## 3. Venue Management Top Summary Metrics (Exact 8 Spec Cards)

| Metric ID             | Metric Label        | Type       | Default Active | Implementation / Source                                       |
| :-------------------- | :------------------ | :--------- | :------------- | :------------------------------------------------------------ |
| `total-venues-listed` | Total Venues Listed | Count      | Yes            | Aggregated total registered venues in DB                      |
| `active-venues`       | Active Venues       | Count      | Yes            | Venues where `status === 'approved'` & not suspended/deleted  |
| `pending-venues`      | Pending Venues      | Count      | Yes            | Venues where `status === 'submitted'` awaiting admin approval |
| `total-bookings`      | Total Bookings      | Count      | Yes            | Total `PartnerSession` bookings linked to venues              |
| `completed-bookings`  | Completed Bookings  | Count      | Yes            | Bookings with `status === 'completed'`                        |
| `cancellation-pct`    | Cancellation %      | Percentage | Yes            | Percentage of cancelled bookings over total bookings          |
| `total-revenue`       | Total Revenue       | Currency   | Yes            | Sum of `price` for completed paid venue sessions              |
| `avg-venue-ratings`   | Avg. Venue Ratings  | Average    | Yes            | Average rating from `VenueReview` documents                   |

---

## 4. Venue Analytics Dashboard Metrics (28 Spec Metrics)

| Metric ID                      | Metric Label                 | Type       | Default Active | Implementation / Source                         |
| :----------------------------- | :--------------------------- | :--------- | :------------- | :---------------------------------------------- |
| `total-venues`                 | Total Venues                 | Count      | Yes            | Aggregated from `Venue.countDocuments()`        |
| `active-venues`                | Active Venues                | Count      | Yes            | Aggregated from live active venues              |
| `suspended-venues`             | Suspended Venues             | Count      | No             | Count of `isSuspend: true` venues               |
| `reported-venues`              | Reported Venues              | Count      | No             | Count of venues currently reported/under review |
| `deleted-venues`               | Deleted Venues               | Count      | No             | Count of `isDeleted: true` soft deleted venues  |
| `total-spaces`                 | Total Spaces                 | Count      | Yes            | Aggregated from `spaceModel.countDocuments()`   |
| `active-spaces`                | Active Spaces                | Count      | No             | Count of active spaces                          |
| `suspended-spaces`             | Suspended Spaces             | Count      | No             | Count of suspended spaces                       |
| `reported-spaces`              | Reported Spaces              | Count      | No             | Count of spaces under report                    |
| `deleted-spaces`               | Deleted Spaces               | Count      | No             | Count of deleted spaces                         |
| `total-event-bookings`         | Total Event Bookings         | Count      | No             | Bookings where `category === 'Event'`           |
| `total-meetup-bookings`        | Total Meetup Bookings        | Count      | No             | Bookings where `category === 'Meetup'`          |
| `events-per-venue`             | Average Events per Venue     | Average    | No             | Average event bookings per venue                |
| `avg-meetups-per-venue`        | Average Meetups per Venue    | Average    | No             | Average meetup bookings per venue               |
| `total-venue-revenue`          | Total Venue Revenue          | Currency   | Yes            | Total completed bookings revenue                |
| `avg-revenue-per-venue`        | Average Revenue per Venue    | Currency   | No             | Total revenue / total venues                    |
| `avg-revenue-per-space`        | Average Revenue per Space    | Currency   | No             | Total revenue / total spaces                    |
| `avg-booking-value`            | Average Booking Value        | Currency   | No             | Total revenue / completed bookings              |
| `space-utilization-rate`       | Space Utilization Rate       | Percentage | Yes            | Completed vs total scheduled capacity           |
| `space-cancellation-rate`      | Space Cancellation Rate      | Percentage | No             | Cancelled bookings / total bookings %           |
| `avg-venue-rating`             | Average Venue Rating         | Average    | Yes            | Average rating across all venue reviews         |
| `venue-satisfaction-score`     | Venue Satisfaction Score     | Percentage | No             | Positive feedback percentage (rating >= 4)      |
| `repeat-booking-rate`          | Repeat Booking Rate          | Percentage | No             | Returning user booking percentage               |
| `peak-utilization-hours`       | Peak Utilization Hours       | Text       | No             | Peak booking time slot (e.g. `2 PM - 6 PM`)     |
| `total-refund-amount`          | Total Refund Amount          | Currency   | No             | Processed refund transactions                   |
| `refund-rate`                  | Refund Rate                  | Percentage | No             | Refunded bookings %                             |
| `host-cancellation-rate`       | Host Cancellation Rate       | Percentage | No             | Bookings cancelled by host %                    |
| `host-initiated-cancellations` | Host Initiated Cancellations | Count      | No             | Total count of host cancellations               |
