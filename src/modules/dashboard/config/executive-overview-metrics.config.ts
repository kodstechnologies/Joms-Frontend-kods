export const EXECUTIVE_OVERVIEW_MODULE_KEY = 'executive-overview'

export type ExecutiveOverviewMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

/** Canonical list of exactly 8 executive overview KPI metrics. */
export const EXECUTIVE_OVERVIEW_METRICS_CATALOG: ExecutiveOverviewMetricCatalogItem[] = [
  {
    id: 'total-platform-revenue',
    label: 'Total Platform Revenue',
    type: 'Currency',
    description:
      'All-time paid GMV from services, consultations, venues, and memberships (refunds excluded)',
    defaultActive: true,
  },
  {
    id: 'monthly-recurring-revenue',
    label: 'Monthly Recurring Revenue',
    type: 'Currency',
    description: 'Active membership prices converted to a monthly equivalent',
    defaultActive: true,
  },
  {
    id: 'customer-lifetime-value',
    label: 'Customer Lifetime Value',
    type: 'Currency',
    description: 'All-time paid GMV divided by unique paying users',
    defaultActive: true,
  },
  {
    id: 'gross-margin',
    label: 'Gross Margin',
    type: 'Percentage',
    description: 'Platform take ÷ GMV (membership 100%; others snapshot fee or 10% guardrail)',
    defaultActive: true,
  },
  {
    id: 'active-members',
    label: 'Active Members',
    type: 'Count',
    description: 'Active, unexpired membership subscriptions',
    defaultActive: true,
  },
  {
    id: 'total-events-mtd',
    label: 'Total Events (MTD)',
    type: 'Count',
    description: 'Non-cancelled venue calendar sessions this month',
    defaultActive: true,
  },
  {
    id: 'ltv-cac-ratio',
    label: 'LTV:CAC Ratio',
    type: 'Number',
    description: 'CLV divided by average first membership payment',
    defaultActive: true,
  },
  {
    id: 'net-promoter-score',
    label: 'Net Promoter Score',
    type: 'Number',
    description: 'NPS from approved ratings (5 = promoter, ≤3 = detractor)',
    defaultActive: true,
  },
]

export const EXECUTIVE_OVERVIEW_METRIC_IDS = EXECUTIVE_OVERVIEW_METRICS_CATALOG.map(
  (metric) => metric.id,
)

export const EXECUTIVE_OVERVIEW_METRIC_ID_SET = new Set(EXECUTIVE_OVERVIEW_METRIC_IDS)

export const DEFAULT_EXECUTIVE_METRIC_IDS = EXECUTIVE_OVERVIEW_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)
