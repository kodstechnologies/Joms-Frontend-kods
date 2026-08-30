export const FINANCE_DASHBOARD_MODULE_KEY = 'finance-dashboard'

export type FinanceDashboardMetricSection =
  'escrow' | 'revenue-profit' | 'payouts-cash-flow' | 'commissions'

export type FinanceDashboardMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
  section: FinanceDashboardMetricSection
}

const metric = (
  id: string,
  label: string,
  type: string,
  description: string,
  section: FinanceDashboardMetricSection,
  defaultActive = false,
): FinanceDashboardMetricCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultActive,
  section,
})

export const FINANCE_DASHBOARD_METRICS_CATALOG: FinanceDashboardMetricCatalogItem[] = [
  metric(
    'total-amount-in-escrow',
    'Total Amount in Escrow',
    'Currency',
    'Funds currently held in escrow awaiting payout or dispute resolution',
    'escrow',
    true,
  ),
  metric(
    'pending-payouts',
    'Pending Payouts',
    'Currency',
    'Payout amount pending release to partners',
    'escrow',
    true,
  ),
  metric(
    'disputed-amount',
    'Disputed Amount',
    'Currency',
    'Funds currently under dispute',
    'escrow',
    true,
  ),
  metric(
    'escrow-release-rate',
    'Escrow Release Rate',
    'Percentage',
    'Percentage of escrow funds released',
    'escrow',
  ),
  metric(
    'gmv',
    'Gross Merchandise Value (GMV)',
    'Currency',
    'Total transaction value before deductions',
    'revenue-profit',
    true,
  ),
  metric(
    'total-platform-revenue',
    'Total Platform Revenue',
    'Currency',
    'Revenue retained by the platform',
    'revenue-profit',
    true,
  ),
  metric(
    'monthly-recurring-revenue',
    'Monthly Recurring Revenue (MRR)',
    'Currency',
    'Revenue from active recurring memberships',
    'revenue-profit',
    true,
  ),
  metric(
    'platform-gross-margin',
    'Platform Gross Margin',
    'Percentage',
    'Margin after partner payouts',
    'revenue-profit',
    true,
  ),
  metric(
    'net-profit',
    'Net Profit',
    'Currency',
    'Net platform earnings after operating expenses',
    'revenue-profit',
    true,
  ),
  metric(
    'net-revenue',
    'Net Revenue',
    'Currency',
    'Revenue after refunds and chargebacks',
    'revenue-profit',
  ),
  metric(
    'revenue-growth',
    'Revenue Growth (7D / 30D / 90D / 1Y)',
    'Percentage',
    'Revenue growth across selected period',
    'revenue-profit',
  ),
  metric(
    'collections-this-month',
    'Collections This Month',
    'Currency',
    'Total payments successfully collected during the current month',
    'payouts-cash-flow',
    true,
  ),
  metric(
    'payouts-released-this-month',
    'Payouts Released This Month',
    'Currency',
    'Total payouts processed during the current month',
    'payouts-cash-flow',
  ),
  metric(
    'average-payout-cycle-time',
    'Average Payout Cycle Time',
    'Duration',
    'Average duration from service completion to payout',
    'payouts-cash-flow',
    true,
  ),
  metric(
    'refund-rate',
    'Refund Rate',
    'Percentage',
    'Percentage of refunded transactions',
    'payouts-cash-flow',
    true,
  ),
  metric(
    'chargeback-rate',
    'Chargeback Rate',
    'Percentage',
    'Percentage of chargeback transactions',
    'payouts-cash-flow',
    true,
  ),
  metric(
    'failed-transactions',
    'Failed Transactions',
    'Count',
    'Transactions that failed',
    'payouts-cash-flow',
  ),
  metric(
    'platform-commission-earned',
    'Platform Commission Earned',
    'Currency',
    'Total commission earned across all modules',
    'commissions',
  ),
  metric(
    'service-marketplace-commission',
    'Service Marketplace Commission',
    'Currency',
    'Commission earned from services and consultations',
    'commissions',
  ),
  metric(
    'event-commission',
    'Event Commission',
    'Currency',
    'Commission earned from events',
    'commissions',
  ),
  metric(
    'venue-commission',
    'Venue Commission',
    'Currency',
    'Commission earned from venue bookings',
    'commissions',
  ),
]

export const FINANCE_DASHBOARD_LEGACY_METRIC_ID_MAP: Record<string, string> = {
  'total-in-escrow': 'total-amount-in-escrow',
  'pending-payout': 'pending-payouts',
  'gross-margin': 'platform-gross-margin',
  'avg-payout-cycle-time': 'average-payout-cycle-time',
}

export const FINANCE_DASHBOARD_METRIC_IDS = FINANCE_DASHBOARD_METRICS_CATALOG.map(
  (metricItem) => metricItem.id,
)

export const FINANCE_DASHBOARD_METRIC_ID_SET = new Set(FINANCE_DASHBOARD_METRIC_IDS)

export const DEFAULT_FINANCE_DASHBOARD_METRIC_IDS = FINANCE_DASHBOARD_METRICS_CATALOG.filter(
  (metricItem) => metricItem.defaultActive,
).map((metricItem) => metricItem.id)

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
    metricIds: [
      'total-amount-in-escrow',
      'pending-payouts',
      'disputed-amount',
      'escrow-release-rate',
    ],
  },
  {
    key: 'revenue-profit',
    title: 'Revenue & Profit',
    gridClassName: 'grid grid-cols-2 gap-3 lg:grid-cols-4',
    metricIds: [
      'gmv',
      'total-platform-revenue',
      'monthly-recurring-revenue',
      'platform-gross-margin',
      'net-profit',
      'net-revenue',
      'revenue-growth',
    ],
  },
  {
    key: 'payouts-cash-flow',
    title: 'Payouts & Cash Flow',
    gridClassName: 'grid grid-cols-2 gap-3 lg:grid-cols-4',
    metricIds: [
      'collections-this-month',
      'payouts-released-this-month',
      'average-payout-cycle-time',
      'refund-rate',
      'chargeback-rate',
      'failed-transactions',
    ],
  },
  {
    key: 'commissions',
    title: 'Commissions',
    gridClassName: 'grid grid-cols-2 gap-3 lg:grid-cols-4',
    metricIds: [
      'platform-commission-earned',
      'service-marketplace-commission',
      'event-commission',
      'venue-commission',
    ],
  },
]
