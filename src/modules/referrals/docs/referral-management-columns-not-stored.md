# Referral Management — Columns / Metrics Not Stored

Only items that **cannot** be populated from existing JOMS data without new schema.

| Item                         | Surface           | Reason                                                                                                         |
| ---------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------- |
| Platform Referred Users      | Dashboard         | Invite flow currently stores expert invites only (`Referral` + partner signups). No client/user invite entity. |
| Memberships Unlocked         | Dashboard         | No membership-reward issuance record tied to referral goals.                                                   |
| Pending Rewards              | Dashboard + Table | No `rewardStatus` / reward ledger on Referral or Partner.                                                      |
| Rewards Distributed          | Dashboard + Table | Same — rewards are not issued as trackable records yet.                                                        |
| Reward Distribution Rate     | Dashboard         | Depends on pending/distributed reward counts.                                                                  |
| Reward Status / Type / Value | Table             | No reward fields on `Referral` model.                                                                          |

## Tracked sources (reference)

- **Invite records**: `admin-service` `Referral` collection (platform + expert-named invites).
- **User-to-user / successful signups**: Partner `referredBy` (`auth-service`).
- **Acceptance / platform success / expiry**: Referral `status`, `expiresAt`, delivery flags.
- **Retention**: Referred partners with `createdAt` older than retention window and still active (`lastActiveAt` / not deactivated).
- **Goals completed**: Referral `goalProgress` ≥ max, or partners referred ≥ 10 per referrer.
- **Avg days to goal**: `acceptedAt - createdAt` on accepted invites.
- **Table enrichment**: `formatReferral` + partner email/phone lookup for `referredUserId`.

## Notes

- Manage Metrics moduleKey remains `referrals` (dashboard + table on one page).
- Legacy column prefs (`referrer`, `referred-expert`, `created-at`) still resolve via aliases.
- Goal Progress renders as a % progress bar from `signedUpCount / maxReferrals`.
