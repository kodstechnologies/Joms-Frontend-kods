# Settings Module - Tab-wise Integration Status

This document tracks each Settings tab/page and whether it is connected to backend APIs or still static/mock.

## Legend

- API Connected: Reads/writes from backend APIs.
- Static/Mock: UI is static or uses local mock/hardcoded data.
- Mixed: Core data is API-backed, but some UI options are local constants.

## Main Settings Tabs (`/settings/main`)

| Tab                                  | Type                  | API Endpoints                                                                                                                                                                                         | Notes                                                                                   |
| ------------------------------------ | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Platform Controls                    | API Connected (Mixed) | `GET/PUT/POST /settings/platform`                                                                                                                                                                     | Uses API for save/reset; dropdown options come from local option lists.                 |
| Security & Access                    | API Connected (Mixed) | `GET/PUT/POST /settings/security`                                                                                                                                                                     | Uses API for save/reset; some option lists are local constants.                         |
| Notifications                        | API Connected         | `GET/PUT/POST /settings/notifications`                                                                                                                                                                | Fully settings-module API-backed.                                                       |
| Finance & Transactional              | API Connected (Mixed) | `GET/PUT/POST /settings/finance`                                                                                                                                                                      | Uses API for save/reset; a few UI option arrays are local constants.                    |
| Incident Tracking                    | API Connected (Mixed) | `GET /settings/incidents/metrics`, `GET /settings/incidents`, `GET /settings/incidents/:id`, `PATCH /settings/incidents/:id/assign`                                                                   | Incident data/metrics are live; assign modal department/user lists are local constants. |
| Backup Configuration (summary panel) | API Connected         | `GET /settings/backups/metrics`, `GET /settings/backups`, `POST /settings/backups/run`, `POST /settings/backups/:id/restore`, `DELETE /settings/backups/:id`                                          | Live backup jobs + actions.                                                             |
| Templates                            | API Connected         | `GET/PATCH /settings/templates/categories`, `GET /settings/templates/categories/:categoryId/reasons`, `POST/PATCH/DELETE /settings/templates/reasons`, `PATCH /settings/templates/reasons/:id/toggle` | Moderation categories + reasons with default message templates.                         |
| Expert Application                   | API Connected         | `GET/PUT/POST /settings/expert`                                                                                                                                                                       | Save/reset works with settings-service.                                                 |
| Venue Management                     | API Connected         | `GET/PUT/POST /settings/venue`                                                                                                                                                                        | Save/reset works with settings-service.                                                 |
| Service Marketplace                  | API Connected         | `GET/PUT/POST /settings/service`                                                                                                                                                                      | Save/reset works with settings-service.                                                 |

## Additional Settings Routes

| Route                                                | Screen                     | Type                  | API Endpoints                                                                                                                                                                                         | Notes                                                                                     |
| ---------------------------------------------------- | -------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `/settings/backup/configure`                         | Backup Configuration page  | API Connected (Mixed) | `GET/PUT/POST /settings/backup`                                                                                                                                                                       | Core config is API-backed; frequency/retention/storage option arrays are local constants. |
| `/settings/logs`                                     | Settings Logs              | API Connected         | `GET /settings/logs`, `GET /settings/logs/:id`                                                                                                                                                        | Fully API-driven logs list and details.                                                   |
| `/settings/security/locked-accounts`                 | Locked Accounts            | API Connected         | `GET /settings/security/locked-accounts`, `GET /settings/security/locked-accounts/:id`, `POST /settings/security/locked-accounts/:id/unlock`                                                          | Live list + unlock action.                                                                |
| `/settings/security/login-trails`                    | Login Trails               | API Connected         | `GET /settings/security/login-trails`                                                                                                                                                                 | Live list with paging/search.                                                             |
| `/settings/policies`                                 | Policy Management          | API Connected         | `GET/POST /settings/policies`, `GET/PUT /settings/policies/:slug`, `GET/POST /settings/policies/:slug/versions`, `PATCH /settings/policies/:slug/publish`                                             | List/create/detail/timeline are API-backed.                                               |
| `/settings/policies/create`                          | Policy Create              | API Connected         | `POST /settings/policies`                                                                                                                                                                             | Creates draft/active policies.                                                            |
| `/settings/policies/:id`                             | Policy Detail              | API Connected         | `GET /settings/policies/:slug`, `PUT /settings/policies/:slug`                                                                                                                                        | Detail + content update are live.                                                         |
| `/settings/policies/:id/timeline`                    | Policy Timeline            | API Connected         | `GET /settings/policies/:slug`, `GET /settings/policies/:slug/versions`                                                                                                                               | Version history is live.                                                                  |
| `/settings/templates` (and Settings → Templates tab) | Moderation Reason Manager  | API Connected         | `GET/PATCH /settings/templates/categories`, `GET /settings/templates/categories/:categoryId/reasons`, `POST/PATCH/DELETE /settings/templates/reasons`, `PATCH /settings/templates/reasons/:id/toggle` | Categories + reasons with message templates, activate/disable, edit, delete.              |
| `/settings/health`                                   | Platform Health            | Static/Mock           | -                                                                                                                                                                                                     | Uses `healthMetricsMock` and hardcoded chart datasets.                                    |
| `/settings/system`                                   | System Configuration       | Static/Mock           | -                                                                                                                                                                                                     | Placeholder page (coming soon).                                                           |
| `/settings/api-keys`                                 | API Key Management         | Static/Mock           | -                                                                                                                                                                                                     | Placeholder page (coming soon).                                                           |
| `/settings/categories`                               | Category Hub               | Static/Mock           | -                                                                                                                                                                                                     | Navigation hub only; no settings API reads/writes.                                        |
| `/settings/escalations`                              | Escalations                | Static/Mock           | -                                                                                                                                                                                                     | Uses `escalationData` mock.                                                               |
| `/settings/refund-details`                           | Refund Details             | Static/Mock           | -                                                                                                                                                                                                     | Hardcoded static details/actions UI.                                                      |
| `/settings/membership-upgrade-details`               | Membership Upgrade Details | Static/Mock           | -                                                                                                                                                                                                     | Hardcoded static details/actions UI.                                                      |

## Backend Ownership

- Service handling settings APIs: `settings-service`
- Base route: `/settings/*`
- Includes module settings + operational APIs (incidents/backups/security/policies)

## Quick QA Checklist

For API-connected screens:

1. Change any field and click Save.
2. Refresh page and verify persisted value.
3. Click Reset and verify defaults are restored.
4. Check `/settings/logs` for corresponding audit entries.

For static/mock screens:

1. Verify UI rendering and interactions only.
2. No persistence should be expected.
