export const EXECUTIVE_OVERVIEW_MODULE_KEY = 'executive-overview'

export type ExecutiveOverviewMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

export const EXECUTIVE_OVERVIEW_METRICS_CATALOG: ExecutiveOverviewMetricCatalogItem[] = [
  {
    id: 'total-platform-revenue',
    label: 'Total Platform Revenue',
    type: 'Currency',
    description: 'Total revenue generated across the platform',
    defaultActive: true,
  },
  {
    id: 'monthly-recurring-revenue',
    label: 'Monthly Recurring Revenue',
    type: 'Currency',
    description: 'Predictable monthly subscription revenue',
    defaultActive: true,
  },
  {
    id: 'customer-lifetime-value',
    label: 'Customer Lifetime Value',
    type: 'Currency',
    description: 'Average revenue per customer over their lifetime',
    defaultActive: true,
  },
  {
    id: 'gross-margin',
    label: 'Gross Margin',
    type: 'Percentage',
    description: 'Revenue minus direct costs as a percentage',
    defaultActive: true,
  },
  {
    id: 'active-members',
    label: 'Active Members',
    type: 'Count',
    description: 'Currently active platform members',
    defaultActive: true,
  },
  {
    id: 'total-events-mtd',
    label: 'Total Events (MTD)',
    type: 'Count',
    description: 'Events hosted month to date',
    defaultActive: true,
  },
  {
    id: 'ltv-cac-ratio',
    label: 'LTV:CAC Ratio',
    type: 'Number',
    description: 'Customer lifetime value to acquisition cost ratio',
    defaultActive: true,
  },
  {
    id: 'net-promoter-score',
    label: 'Net Promoter Score',
    type: 'Number',
    description: 'Customer loyalty and satisfaction score',
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
