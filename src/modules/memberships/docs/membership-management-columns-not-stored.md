# Membership Management — Columns / Metrics Not Stored

Only items that **cannot** be populated from existing JOMS data without new schema.

| Item                               | Surface   | Reason                                                                         |
| ---------------------------------- | --------- | ------------------------------------------------------------------------------ |
| Failed Renewals                    | Dashboard | No failed renewal / payment-retry ledger on subscriptions — API returns `0`.   |
| Free Trial to Paid Conversion Rate | Dashboard | Trial conversion is not tracked on `MembershipSubscription` — API returns `0`. |
| Coupon Code                        | Table     | No coupon field on subscription model — shows `—`.                             |
| Discount Amount                    | Table     | No discount amount stored on subscription — shows `—`.                         |

## Display rules (dashboard API)

API never returns JSON `null` for metrics. Numbers use `0`; empty text uses `"—"`.

## Tracked sources (reference)

- **Plans**: `membership-service` Membership plan collection (`status`, counts).
- **Subscriptions**: `MembershipSubscription` (`status`, `purchasedPrice`, `billingCycleName`, `actionHistory`, `previousMembership`, `paymentInfo`, dates).
- **MRR**: Active subscriptions converted to monthly-equivalent by billing cycle.
- **Payment Status / Method / Transaction ID**: Derived from `paymentInfo` (+ complimentary admin assignments).
- **Source**: Derived from `upgradedBy` / `sourceApp`.
- **Last Renewed At**: Latest extend/renew/upgrade/downgrade `actionHistory.performedAt`, else `paymentInfo.lastPaymentAt`.
