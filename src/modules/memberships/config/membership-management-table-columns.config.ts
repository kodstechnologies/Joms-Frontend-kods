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

export const MEMBERSHIPS_MODULE_KEY = 'memberships'

export const MEMBERSHIPS_DASHBOARD_METRICS_CATALOG: MembershipDashboardMetricCatalogItem[] = [
  {
    id: 'total-membership-plans',
    label: 'Total Membership Plans',
    type: 'Count',
    description: 'Total plans configured on platform',
    defaultActive: true,
  },
  {
    id: 'active-membership-plans',
    label: 'Active Membership Plans',
    type: 'Count',
    description: 'Plans currently available for purchase',
    defaultActive: true,
  },
  {
    id: 'total-subscribers',
    label: 'Total Subscribers',
    type: 'Count',
    description: 'Total users with memberships',
    defaultActive: true,
  },
  {
    id: 'active-subscribers',
    label: 'Active Subscribers',
    type: 'Count',
    description: 'Users with active memberships',
    defaultActive: true,
  },
  {
    id: 'expired-memberships',
    label: 'Expired Memberships',
    type: 'Count',
    description: 'Memberships that have expired',
    defaultActive: true,
  },
  {
    id: 'cancelled-memberships',
    label: 'Cancelled Memberships',
    type: 'Count',
    description: 'Cancelled subscriptions',
    defaultActive: true,
  },
  {
    id: 'total-membership-revenue',
    label: 'Total Membership Revenue',
    type: 'Currency',
    description: 'Revenue from memberships',
    defaultActive: true,
  },
  {
    id: 'monthly-recurring-revenue',
    label: 'Monthly Recurring Revenue (MRR)',
    type: 'Currency',
    description: 'Recurring monthly subscription revenue',
    defaultActive: true,
  },
  {
    id: 'revenue-growth-rate',
    label: 'Revenue Growth Rate',
    type: 'Percentage',
    description: 'Growth compared to previous period',
    defaultActive: true,
  },
  {
    id: 'average-revenue-per-subscriber',
    label: 'Average Revenue Per Subscriber',
    type: 'Currency',
    description: 'Average revenue generated per subscriber',
    defaultActive: true,
  },
  {
    id: 'renewal-rate',
    label: 'Renewal Rate',
    type: 'Percentage',
    description: 'Percentage of eligible memberships renewed',
    defaultActive: true,
  },
  {
    id: 'failed-renewals',
    label: 'Failed Renewals',
    type: 'Count',
    description: 'Renewals that failed due to payment issues',
    defaultActive: false,
  },
  {
    id: 'most-subscribed-plan',
    label: 'Most Subscribed Plan',
    type: 'Text',
    description: 'Highest subscribed membership',
    defaultActive: true,
  },
  {
    id: 'subscribers-by-plan',
    label: 'Subscribers by Plan',
    type: 'Text',
    description: 'Number of subscribers under each plan',
    defaultActive: false,
  },
  {
    id: 'membership-upgrades',
    label: 'Membership Upgrades',
    type: 'Count',
    description: 'Users upgraded to a higher plan',
    defaultActive: true,
  },
  {
    id: 'membership-downgrades',
    label: 'Membership Downgrades',
    type: 'Count',
    description: 'Users downgraded to a lower plan',
    defaultActive: false,
  },
  {
    id: 'membership-renewals',
    label: 'Membership Renewals',
    type: 'Count',
    description: 'Users renewed the same plan',
    defaultActive: true,
  },
  {
    id: 'new-subscribers-current-month',
    label: 'New Subscribers (Current Month)',
    type: 'Count',
    description: 'New subscriptions this month',
    defaultActive: true,
  },
  {
    id: 'cancellations-current-month',
    label: 'Membership Cancellations (Current Month)',
    type: 'Count',
    description: 'Monthly cancellations',
    defaultActive: false,
  },
  {
    id: 'most-selected-billing-cycle',
    label: 'Most Selected Billing Cycle',
    type: 'Text',
    description: 'Most popular subscription duration',
    defaultActive: false,
  },
  {
    id: 'trial-to-paid-conversion-rate',
    label: 'Free Trial to Paid Conversion Rate',
    type: 'Percentage',
    description: 'Trial users converted to paid',
    defaultActive: false,
  },
  {
    id: 'most-cancelled-plan',
    label: 'Most Cancelled Plan',
    type: 'Text',
    description: 'Plan with highest cancellations',
    defaultActive: false,
  },
  {
    id: 'churn-rate',
    label: 'Churn Rate',
    type: 'Percentage',
    description: 'Percentage of subscribers lost',
    defaultActive: true,
  },
]

export const MEMBERSHIPS_TABLE_COLUMNS_CATALOG: MembershipTableColumnCatalogItem[] = [
  {
    id: 'subscription-id',
    label: 'Subscription ID',
    type: 'Text',
    description: 'Unique subscription identifier',
    defaultVisible: true,
  },
  {
    id: 'user-id',
    label: 'User ID',
    type: 'Text',
    description: 'Linked Expert/User ID',
    defaultVisible: true,
  },
  {
    id: 'username',
    label: 'Username',
    type: 'Text',
    description: 'Expert name',
    defaultVisible: true,
  },
  {
    id: 'plan-id',
    label: 'Plan ID',
    type: 'Text',
    description: 'Membership plan identifier',
    defaultVisible: false,
  },
  {
    id: 'plan-name',
    label: 'Plan Name',
    type: 'Text',
    description: 'Membership name',
    defaultVisible: true,
  },
  {
    id: 'plan-cycle',
    label: 'Plan Cycle',
    type: 'Status',
    description: 'Billing cycle',
    defaultVisible: true,
  },
  {
    id: 'subscription-status',
    label: 'Subscription Status',
    type: 'Status',
    description: 'Current status',
    defaultVisible: true,
  },
  {
    id: 'started-at',
    label: 'Started At',
    type: 'Date',
    description: 'Subscription start date',
    defaultVisible: true,
  },
  {
    id: 'expiry-at',
    label: 'Expiry At',
    type: 'Date',
    description: 'Subscription expiry date',
    defaultVisible: true,
  },
  {
    id: 'price-paid',
    label: 'Price Paid',
    type: 'Currency',
    description: 'Amount paid',
    defaultVisible: true,
  },
  {
    id: 'payment-status',
    label: 'Payment Status',
    type: 'Status',
    description: 'Payment state',
    defaultVisible: false,
  },
  {
    id: 'payment-method',
    label: 'Payment Method',
    type: 'Status',
    description: 'Mode of payment',
    defaultVisible: false,
  },
  {
    id: 'transaction-id',
    label: 'Transaction ID',
    type: 'Text',
    description: 'Payment transaction reference',
    defaultVisible: false,
  },
  {
    id: 'previous-plan-name',
    label: 'Previous Plan Name',
    type: 'Text',
    description: 'Earlier subscription',
    defaultVisible: false,
  },
  {
    id: 'auto-renewal',
    label: 'Auto Renewal',
    type: 'Status',
    description: 'Renewal enabled',
    defaultVisible: true,
  },
  {
    id: 'next-billing-date',
    label: 'Next Billing Date',
    type: 'Date',
    description: 'Upcoming renewal date',
    defaultVisible: false,
  },
  {
    id: 'source',
    label: 'Source',
    type: 'Status',
    description: 'Subscription source',
    defaultVisible: false,
  },
  {
    id: 'coupon-code',
    label: 'Coupon Code',
    type: 'Text',
    description: 'Applied discount code',
    defaultVisible: false,
  },
  {
    id: 'discount-amount',
    label: 'Discount Amount',
    type: 'Currency',
    description: 'Discount applied',
    defaultVisible: false,
  },
  {
    id: 'last-renewed-at',
    label: 'Last Renewed At',
    type: 'Date',
    description: 'Latest renewal timestamp',
    defaultVisible: false,
  },
  {
    id: 'created-at',
    label: 'Created At',
    type: 'Date',
    description: 'Subscription creation timestamp',
    defaultVisible: false,
  },
  {
    id: 'updated-at',
    label: 'Updated At',
    type: 'Date',
    description: 'Last updated timestamp',
    defaultVisible: false,
  },
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
