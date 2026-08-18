export const MEMBERSHIPS_MODULE_KEY = 'memberships'

export type MembershipMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

/** Exactly 5 membership dashboard metrics — matches the management page cards. */
export const MEMBERSHIP_METRICS_CATALOG: MembershipMetricCatalogItem[] = [
  {
    id: 'total-members',
    label: 'Total Members',
    type: 'Count',
    description: 'Total active membership members',
    defaultActive: true,
  },
  {
    id: 'expired-memberships',
    label: 'Expired Memberships',
    type: 'Count',
    description: 'Memberships that have expired and require attention',
    defaultActive: true,
  },
  {
    id: 'total-revenue',
    label: 'Total Revenue',
    type: 'Currency',
    description: 'Total membership revenue',
    defaultActive: true,
  },
  {
    id: 'renewal-rate',
    label: 'Renewal Rate',
    type: 'Percentage',
    description: 'Membership renewal rate',
    defaultActive: true,
  },
  {
    id: 'most-subscribed-plan',
    label: 'Most Subscribed Plan',
    type: 'Text',
    description: 'Top performing membership plan',
    defaultActive: true,
  },
]

export const MEMBERSHIP_METRIC_IDS = MEMBERSHIP_METRICS_CATALOG.map((metric) => metric.id)

export const MEMBERSHIP_METRIC_ID_SET = new Set(MEMBERSHIP_METRIC_IDS)

export const DEFAULT_MEMBERSHIP_METRIC_IDS = MEMBERSHIP_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const MEMBERSHIP_MAX_ACTIVE_METRICS = MEMBERSHIP_METRICS_CATALOG.length
