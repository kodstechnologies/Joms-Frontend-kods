export type MembershipTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export type MembershipDashboardMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const col = (
  id: string,
  label: string,
  type: string,
  description: string,
  defaultVisible = false,
): MembershipTableColumnCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

const metric = (
  id: string,
  label: string,
  type: string,
  description: string,
  defaultActive = false,
): MembershipDashboardMetricCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultActive,
})

export const MEMBERSHIPS_MODULE_KEY = 'memberships'

export const MEMBERSHIPS_DASHBOARD_METRICS_CATALOG: MembershipDashboardMetricCatalogItem[] = [
  metric(
    'total-membership-plans',
    'Total Membership Plans',
    'Count',
    'Total plans configured on platform',
    true,
  ),
  metric(
    'active-membership-plans',
    'Active Membership Plans',
    'Count',
    'Plans currently available for purchase',
    true,
  ),
  metric('total-subscribers', 'Total Subscribers', 'Count', 'Total users with memberships', true),
  metric(
    'active-subscribers',
    'Active Subscribers',
    'Count',
    'Users with active memberships',
    true,
  ),
  metric(
    'expired-memberships',
    'Expired Memberships',
    'Count',
    'Memberships that have expired',
    true,
  ),
  metric(
    'cancelled-memberships',
    'Cancelled Memberships',
    'Count',
    'Cancelled subscriptions',
    true,
  ),
  metric(
    'total-membership-revenue',
    'Total Membership Revenue',
    'Currency',
    'Revenue from memberships',
    true,
  ),
  metric(
    'monthly-recurring-revenue',
    'Monthly Recurring Revenue (MRR)',
    'Currency',
    'Recurring monthly subscription revenue',
    true,
  ),
  metric(
    'revenue-growth-rate',
    'Revenue Growth Rate',
    'Percentage',
    'Growth compared to previous period',
    true,
  ),
  metric(
    'average-revenue-per-subscriber',
    'Average Revenue Per Subscriber',
    'Currency',
    'Average revenue generated per subscriber',
    true,
  ),
  metric(
    'renewal-rate',
    'Renewal Rate',
    'Percentage',
    'Percentage of eligible memberships renewed',
    true,
  ),
  metric(
    'failed-renewals',
    'Failed Renewals',
    'Count',
    'Renewals that failed due to payment issues',
  ),
  metric(
    'most-subscribed-plan',
    'Most Subscribed Plan',
    'Text',
    'Highest subscribed membership',
    true,
  ),
  metric(
    'subscribers-by-plan',
    'Subscribers by Plan',
    'Text',
    'Number of subscribers under each plan',
  ),
  metric(
    'membership-upgrades',
    'Membership Upgrades',
    'Count',
    'Users upgraded to a higher plan',
    true,
  ),
  metric(
    'membership-downgrades',
    'Membership Downgrades',
    'Count',
    'Users downgraded to a lower plan',
  ),
  metric(
    'membership-renewals',
    'Membership Renewals',
    'Count',
    'Users renewed the same plan',
    true,
  ),
  metric(
    'new-subscribers-current-month',
    'New Subscribers (Current Month)',
    'Count',
    'New subscriptions this month',
    true,
  ),
  metric(
    'cancellations-current-month',
    'Membership Cancellations (Current Month)',
    'Count',
    'Monthly cancellations',
  ),
  metric(
    'most-selected-billing-cycle',
    'Most Selected Billing Cycle',
    'Text',
    'Most popular subscription duration',
  ),
  metric(
    'trial-to-paid-conversion-rate',
    'Free Trial to Paid Conversion Rate',
    'Percentage',
    'Trial users converted to paid',
  ),
  metric('most-cancelled-plan', 'Most Cancelled Plan', 'Text', 'Plan with highest cancellations'),
  metric('churn-rate', 'Churn Rate', 'Percentage', 'Percentage of subscribers lost', true),
]

export const MEMBERSHIPS_TABLE_COLUMNS_CATALOG: MembershipTableColumnCatalogItem[] = [
  col('subscription-id', 'Subscription ID', 'Text', 'Unique subscription identifier', true),
  col('user-id', 'User ID', 'Text', 'Linked Expert/User ID', true),
  col('username', 'Username', 'Text', 'Expert name', true),
  col('plan-id', 'Plan ID', 'Text', 'Membership plan identifier'),
  col('plan-name', 'Plan Name', 'Text', 'Membership name', true),
  col('plan-cycle', 'Plan Cycle', 'Status', 'Billing cycle', true),
  col('subscription-status', 'Subscription Status', 'Status', 'Current status', true),
  col('started-at', 'Started At', 'Date', 'Subscription start date', true),
  col('expiry-at', 'Expiry At', 'Date', 'Subscription expiry date', true),
  col('price-paid', 'Price Paid', 'Currency', 'Amount paid', true),
  col('payment-status', 'Payment Status', 'Status', 'Payment state'),
  col('payment-method', 'Payment Method', 'Status', 'Mode of payment'),
  col('transaction-id', 'Transaction ID', 'Text', 'Payment transaction reference'),
  col('previous-plan-name', 'Previous Plan Name', 'Text', 'Earlier subscription'),
  col('auto-renewal', 'Auto Renewal', 'Status', 'Renewal enabled', true),
  col('next-billing-date', 'Next Billing Date', 'Date', 'Upcoming renewal date'),
  col('source', 'Source', 'Status', 'Subscription source'),
  col('coupon-code', 'Coupon Code', 'Text', 'Applied discount code'),
  col('discount-amount', 'Discount Amount', 'Currency', 'Discount applied'),
  col('last-renewed-at', 'Last Renewed At', 'Date', 'Latest renewal timestamp'),
  col('created-at', 'Created At', 'Date', 'Subscription creation timestamp'),
  col('updated-at', 'Updated At', 'Date', 'Last updated timestamp'),
]

export const DEFAULT_MEMBERSHIPS_VISIBLE_COLUMN_IDS = MEMBERSHIPS_TABLE_COLUMNS_CATALOG.filter(
  (c) => c.defaultVisible,
).map((c) => c.id)

export const DEFAULT_MEMBERSHIPS_ACTIVE_METRIC_IDS = MEMBERSHIPS_DASHBOARD_METRICS_CATALOG.filter(
  (m) => m.defaultActive,
).map((m) => m.id)

export const MEMBERSHIPS_MAX_ACTIVE_METRICS = MEMBERSHIPS_DASHBOARD_METRICS_CATALOG.length

export const MEMBERSHIP_METRICS_CATALOG = MEMBERSHIPS_DASHBOARD_METRICS_CATALOG
export const MEMBERSHIP_METRIC_IDS = MEMBERSHIPS_DASHBOARD_METRICS_CATALOG.map((m) => m.id)
export const MEMBERSHIP_METRIC_ID_SET = new Set(MEMBERSHIP_METRIC_IDS)
export const DEFAULT_MEMBERSHIP_METRIC_IDS = DEFAULT_MEMBERSHIPS_ACTIVE_METRIC_IDS
export const MEMBERSHIP_MAX_ACTIVE_METRICS = MEMBERSHIPS_MAX_ACTIVE_METRICS
