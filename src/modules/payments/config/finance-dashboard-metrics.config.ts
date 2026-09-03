import { deriveMetricExports } from '@/shared/lib/define-metrics-catalog'

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

type MetricRow = [
  id: string,
  label: string,
  type: string,
  section: FinanceDashboardMetricSection,
  description: string,
  defaultActive?: boolean,
]

const METRIC_ROWS: MetricRow[] = [
  [
    'total-amount-in-escrow',
    'Total Amount in Escrow',
    'Currency',
    'escrow',
    'Held in escrow',
    true,
  ],
  ['pending-payouts', 'Pending Payouts', 'Currency', 'escrow', 'Awaiting partner release', true],
  ['disputed-amount', 'Disputed Amount', 'Currency', 'escrow', 'Under dispute', true],
  ['escrow-release-rate', 'Escrow Release Rate', 'Percentage', 'escrow', 'Released share'],
  [
    'gmv',
    'Gross Merchandise Value (GMV)',
    'Currency',
    'revenue-profit',
    'Pre-deduction volume',
    true,
  ],
  [
    'total-platform-revenue',
    'Total Platform Revenue',
    'Currency',
    'revenue-profit',
    'Retained revenue',
    true,
  ],
  [
    'monthly-recurring-revenue',
    'Monthly Recurring Revenue (MRR)',
    'Currency',
    'revenue-profit',
    'Active memberships',
    true,
  ],
  [
    'platform-gross-margin',
    'Platform Gross Margin',
    'Percentage',
    'revenue-profit',
    'After partner payouts',
    true,
  ],
  ['net-profit', 'Net Profit', 'Currency', 'revenue-profit', 'After operating costs', true],
  ['net-revenue', 'Net Revenue', 'Currency', 'revenue-profit', 'After refunds/chargebacks'],
  [
    'revenue-growth',
    'Revenue Growth (7D / 30D / 90D / 1Y)',
    'Percentage',
    'revenue-profit',
    'Period growth',
  ],
  [
    'collections-this-month',
    'Collections This Month',
    'Currency',
    'payouts-cash-flow',
    'Successful collections',
    true,
  ],
  [
    'payouts-released-this-month',
    'Payouts Released This Month',
    'Currency',
    'payouts-cash-flow',
    'Processed payouts',
  ],
  [
    'average-payout-cycle-time',
    'Average Payout Cycle Time',
    'Duration',
    'payouts-cash-flow',
    'Completion to payout',
    true,
  ],
  ['refund-rate', 'Refund Rate', 'Percentage', 'payouts-cash-flow', 'Refunded share', true],
  [
    'chargeback-rate',
    'Chargeback Rate',
    'Percentage',
    'payouts-cash-flow',
    'Chargeback share',
    true,
  ],
  ['failed-transactions', 'Failed Transactions', 'Count', 'payouts-cash-flow', 'Failed count'],
  [
    'platform-commission-earned',
    'Platform Commission Earned',
    'Currency',
    'commissions',
    'All-module commission',
  ],
  [
    'service-marketplace-commission',
    'Service Marketplace Commission',
    'Currency',
    'commissions',
    'Services + consultations',
  ],
  ['event-commission', 'Event Commission', 'Currency', 'commissions', 'Events'],
  ['venue-commission', 'Venue Commission', 'Currency', 'commissions', 'Venue bookings'],
]

export const FINANCE_DASHBOARD_METRICS_CATALOG: FinanceDashboardMetricCatalogItem[] =
  METRIC_ROWS.map(([id, label, type, section, description, defaultActive = false]) => ({
    id,
    label,
    type,
    description,
    defaultActive,
    section,
  }))

export const FINANCE_DASHBOARD_LEGACY_METRIC_ID_MAP: Record<string, string> = {
  'total-in-escrow': 'total-amount-in-escrow',
  'pending-payout': 'pending-payouts',
  'gross-margin': 'platform-gross-margin',
  'avg-payout-cycle-time': 'average-payout-cycle-time',
}

const financeDashboardDerived = deriveMetricExports(FINANCE_DASHBOARD_METRICS_CATALOG)
export const FINANCE_DASHBOARD_METRIC_IDS = financeDashboardDerived.ids
export const FINANCE_DASHBOARD_METRIC_ID_SET = financeDashboardDerived.idSet
export const DEFAULT_FINANCE_DASHBOARD_METRIC_IDS = financeDashboardDerived.defaultIds
export const FINANCE_DASHBOARD_MAX_ACTIVE_METRICS = financeDashboardDerived.maxActive

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
