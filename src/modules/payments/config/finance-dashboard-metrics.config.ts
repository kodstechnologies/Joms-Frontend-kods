export const FINANCE_DASHBOARD_MODULE_KEY = 'finance-dashboard'

export type FinanceDashboardMetricSection = 'escrow' | 'revenue-profit' | 'payouts-cash-flow'

export type FinanceDashboardMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
  section: FinanceDashboardMetricSection
}

export const FINANCE_DASHBOARD_METRICS_CATALOG: FinanceDashboardMetricCatalogItem[] = [
  {
    id: 'total-in-escrow',
    label: 'Total In Escrow',
    type: 'Currency',
    description: 'Total funds held in escrow',
    defaultActive: true,
    section: 'escrow',
  },
  {
    id: 'pending-payout',
    label: 'Pending Payout',
    type: 'Currency',
    description: 'Single pending payout amount awaiting release',
    defaultActive: true,
    section: 'escrow',
  },
  {
    id: 'disputed-amount',
    label: 'Disputed Amount',
    type: 'Currency',
    description: 'Total amount under dispute',
    defaultActive: true,
    section: 'escrow',
  },
  {
    id: 'total-platform-revenue',
    label: 'Total Platform Revenue',
    type: 'Currency',
    description: 'Total revenue generated on the platform',
    defaultActive: true,
    section: 'revenue-profit',
  },
  {
    id: 'monthly-recurring-revenue',
    label: 'Monthly Recurring Revenue',
    type: 'Currency',
    description: 'Monthly recurring revenue',
    defaultActive: true,
    section: 'revenue-profit',
  },
  {
    id: 'gross-margin',
    label: 'Gross Margin',
    type: 'Currency',
    description: 'Gross margin across platform transactions',
    defaultActive: true,
    section: 'revenue-profit',
  },
  {
    id: 'net-profit',
    label: 'Net Profit',
    type: 'Currency',
    description: 'Net profit after costs',
    defaultActive: true,
    section: 'revenue-profit',
  },
  {
    id: 'pending-payouts',
    label: 'Pending Payouts',
    type: 'Currency',
    description: 'Total pending payouts awaiting processing',
    defaultActive: true,
    section: 'payouts-cash-flow',
  },
  {
    id: 'avg-payout-cycle-time',
    label: 'Avg. Payout Cycle Time',
    type: 'Average',
    description: 'Average time to complete a payout cycle',
    defaultActive: true,
    section: 'payouts-cash-flow',
  },
  {
    id: 'refund-rate',
    label: 'Refund Rate',
    type: 'Percentage',
    description: 'Percentage of transactions refunded',
    defaultActive: true,
    section: 'payouts-cash-flow',
  },
  {
    id: 'chargeback-rate',
    label: 'Chargeback Rate',
    type: 'Percentage',
    description: 'Percentage of transactions charged back',
    defaultActive: true,
    section: 'payouts-cash-flow',
  },
]

export const FINANCE_DASHBOARD_METRIC_IDS = FINANCE_DASHBOARD_METRICS_CATALOG.map(
  (metric) => metric.id,
)

export const FINANCE_DASHBOARD_METRIC_ID_SET = new Set(FINANCE_DASHBOARD_METRIC_IDS)

export const DEFAULT_FINANCE_DASHBOARD_METRIC_IDS = FINANCE_DASHBOARD_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

export const FINANCE_DASHBOARD_MAX_ACTIVE_METRICS = FINANCE_DASHBOARD_METRICS_CATALOG.length

export const FINANCE_DASHBOARD_SECTIONS: {
  key: FinanceDashboardMetricSection
  title: string | null
  gridClassName: string
  metricIds: string[]
}[] = [
  {
    key: 'escrow',
    title: null,
    gridClassName: 'grid grid-cols-1 gap-3 md:grid-cols-3',
    metricIds: ['total-in-escrow', 'pending-payout', 'disputed-amount'],
  },
  {
    key: 'revenue-profit',
    title: 'Revenue & Profit',
    gridClassName: 'grid grid-cols-2 gap-3 lg:grid-cols-4',
    metricIds: [
      'total-platform-revenue',
      'monthly-recurring-revenue',
      'gross-margin',
      'net-profit',
    ],
  },
  {
    key: 'payouts-cash-flow',
    title: 'Payouts & Cash Flow',
    gridClassName: 'grid grid-cols-2 gap-3 lg:grid-cols-4',
    metricIds: ['pending-payouts', 'avg-payout-cycle-time', 'refund-rate', 'chargeback-rate'],
  },
]
