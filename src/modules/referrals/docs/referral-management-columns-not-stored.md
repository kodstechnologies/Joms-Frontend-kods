# Referral Management — Columns / Metrics Not Stored

Only items that **cannot** be populated from existing JOMS data without new schema.

| Item                                                 | Surface   | Reason                                              |
| ---------------------------------------------------- | --------- | --------------------------------------------------- |
| Platform Referred Users                              | Dashboard | No client/user invite entity yet — count stays `0`. |
| Memberships Unlocked / Pending / Distributed Rewards | Dashboard | No reward ledger yet — API returns `0`.             |
| Reward Status                                        | Table     | No reward field on Referral — shows `—` in UI.      |

**Removed from table:** Reward Type, Reward Value (not stored; columns dropped from catalog).

## Display rules (dashboard API)

API never returns JSON `null`. Numbers use `0`; empty top source uses `"—"`.

| Kind                | Empty / no sample                         |
| ------------------- | ----------------------------------------- |
| Count / % / Average | `0`                                       |
| Top Referral Source | `"—"` (else `Platform` / `User Referral`) |

## Signup Date

Table **Signup Date** = referred partner account `createdAt` (matched by invite email/phone). Falls back to invite `acceptedAt` only if no partner row exists yet.

## Tracked sources (reference)

- **Invite records**: `admin-service` `Referral` collection (platform + expert-named invites).
- **User-to-user / successful signups**: Partner `referredBy` (`auth-service`).
- **Acceptance / platform success / expiry**: Referral `status`, `expiresAt`, delivery flags.
- **Retention**: Referred partners with `createdAt` older than retention window and still active (`lastActiveAt` / not deactivated).
- **Goals completed**: Referral `goalProgress` ≥ max, or partners referred ≥ 10 per referrer.
- **Avg days to goal**: `acceptedAt - createdAt` on accepted invites.
- **Table enrichment**: partner email/phone lookup for `referredUserId` + `signupDate` from Partner `createdAt`.
