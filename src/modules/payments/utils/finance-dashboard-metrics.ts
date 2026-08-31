import {
  payoutsCashFlowCardsMock,
  revenueProfitCardsMock,
  topSummaryCardsMock,
  type TrendMetric,
} from '@/modules/payments/mock/finance-dashboard.mock'
import type { FinanceDashboardSummary } from '@/modules/payments/types/finance-api'
import { formatInr } from '@/modules/payments/utils/finance-mappers'
import { FINANCE_DASHBOARD_LEGACY_METRIC_ID_MAP } from '@/modules/payments/config/finance-dashboard-metrics.config'

export type FinanceDashboardMetricCard = TrendMetric & { id: string }

export { FINANCE_DASHBOARD_LEGACY_METRIC_ID_MAP }

const mockById = new Map<string, TrendMetric>()

for (const metric of [
  ...topSummaryCardsMock,
  ...revenueProfitCardsMock,
  ...payoutsCashFlowCardsMock,
]) {
  const catalogId = labelToMetricId(metric.label)
  if (catalogId) mockById.set(catalogId, metric)
}

function labelToMetricId(label: string): string | null {
  const map: Record<string, string> = {
    'Total In Escrow': 'total-amount-in-escrow',
    'Total Amount in Escrow': 'total-amount-in-escrow',
    'Pending Payout': 'pending-payouts',
    'Pending Payouts': 'pending-payouts',
    'Disputed Amount': 'disputed-amount',
    'Total Platform Revenue': 'total-platform-revenue',
    'Monthly Recurring Revenue': 'monthly-recurring-revenue',
    'Monthly Recurring Revenue (MRR)': 'monthly-recurring-revenue',
    'Gross Margin': 'platform-gross-margin',
    'Platform Gross Margin': 'platform-gross-margin',
    'Net Profit': 'net-profit',
    'Avg. Payout Cycle Time': 'average-payout-cycle-time',
    'Average Payout Cycle Time': 'average-payout-cycle-time',
    'Refund Rate': 'refund-rate',
    'Chargeback Rate': 'chargeback-rate',
  }
  return map[label] ?? null
}

function withMockTrend(metric: TrendMetric | undefined | null, fallbackLabel = '—'): TrendMetric {
  if (!metric) {
    return placeholder(fallbackLabel)
  }

  const change = metric.change ?? '—'

  return {
    ...metric,
    change: change.includes('%') ? change : '6.7%',
    changeNote: metric.changeNote ?? 'vs last month',
    changeType: metric.changeType ?? 'up',
  }
}

function placeholder(label: string, value = '—'): TrendMetric {
  return withMockTrend({
    label,
    value,
    change: '—',
    changeType: 'up',
    changeNote: 'vs last month',
  })
}

function mockOrPlaceholder(id: string, label: string, mockValue?: string): TrendMetric {
  return mockById.get(id) ?? placeholder(label, mockValue)
}

export function resolveFinanceDashboardMetricId(id: string): string {
  return FINANCE_DASHBOARD_LEGACY_METRIC_ID_MAP[id] ?? id
}

export function buildFinanceDashboardMetricCards(
  summary?: FinanceDashboardSummary | null,
): FinanceDashboardMetricCard[] {
  const cards: FinanceDashboardMetricCard[] = []

  const push = (id: string, metric: TrendMetric | undefined | null, fallbackLabel?: string) => {
    cards.push({ id, ...withMockTrend(metric, fallbackLabel) })
  }

  push(
    'total-amount-in-escrow',
    summary
      ? {
          label: 'Total Amount in Escrow',
          value: formatInr(summary.totalInEscrow),
          change: '6.7%',
          changeType: 'up',
          changeNote: 'vs last month',
        }
      : mockOrPlaceholder('total-amount-in-escrow', 'Total Amount in Escrow', '₹8,43,290'),
  )

  push(
    'pending-payouts',
    summary
      ? {
          label: 'Pending Payouts',
          value: formatInr(summary.pendingPayouts),
          change: '6.7%',
          changeType: 'up',
          changeNote: 'vs last month',
        }
      : mockOrPlaceholder('pending-payouts', 'Pending Payouts', '₹8,43,290'),
  )

  push(
    'disputed-amount',
    summary
      ? {
          label: 'Disputed Amount',
          value: formatInr(summary.disputedAmount),
          change: '6.7%',
          changeType: 'up',
          changeNote: 'vs last month',
        }
      : mockOrPlaceholder('disputed-amount', 'Disputed Amount', '₹8,43,290'),
  )

  push('gmv', mockOrPlaceholder('gmv', 'Gross Merchandise Value (GMV)', '₹10,00,000'))

  push(
    'total-platform-revenue',
    summary
      ? {
          label: 'Total Platform Revenue',
          value: formatInr(summary.totalPlatformRevenue),
          change: '6.7%',
          changeType: 'up',
          changeNote: 'vs last month',
        }
      : mockOrPlaceholder('total-platform-revenue', 'Total Platform Revenue'),
  )

  push(
    'monthly-recurring-revenue',
    summary
      ? {
          label: 'Monthly Recurring Revenue',
          value: formatInr(summary.collectionsThisMonth),
          change: '0%',
          changeType: 'up',
          changeNote: 'vs last month',
        }
      : mockOrPlaceholder('monthly-recurring-revenue', 'Monthly Recurring Revenue'),
  )

  const grossMarginValue =
    summary && summary.totalPlatformRevenue > 0
      ? `${Math.round((Math.max(0, summary.totalPlatformRevenue - summary.pendingPayouts) / summary.totalPlatformRevenue) * 100)}%`
      : '0%'

  push(
    'platform-gross-margin',
    summary
      ? {
          label: 'Platform Gross Margin',
          value: grossMarginValue,
          change: '0%',
          changeType: 'up',
          changeNote: 'vs last month',
        }
      : mockOrPlaceholder('platform-gross-margin', 'Platform Gross Margin', '0%'),
  )

  const netProfitValue = summary
    ? Math.max(0, summary.totalPlatformRevenue - summary.pendingPayouts)
    : 0

  push(
    'net-profit',
    summary
      ? {
          label: 'Net Profit',
          value: formatInr(netProfitValue),
          change: '0%',
          changeType: 'up',
          changeNote: 'vs last month',
        }
      : mockOrPlaceholder('net-profit', 'Net Profit'),
  )

  push(
    'average-payout-cycle-time',
    mockOrPlaceholder('average-payout-cycle-time', 'Average Payout Cycle Time', '24-48 hrs'),
  )

  const refundRateValue =
    summary && summary.totalPlatformRevenue > 0
      ? `${((summary.disputedAmount / summary.totalPlatformRevenue) * 100).toFixed(1)}%`
      : '0%'

  push(
    'refund-rate',
    summary
      ? {
          label: 'Refund Rate',
          value: refundRateValue,
          change: '0%',
          changeType: 'up',
          changeNote: 'vs last month',
        }
      : mockOrPlaceholder('refund-rate', 'Refund Rate', '0%'),
  )

  push('chargeback-rate', mockOrPlaceholder('chargeback-rate', 'Chargeback Rate', '0%'))
  mockOrPlaceholder('monthly-recurring-revenue', 'Monthly Recurring Revenue (MRR)')

  push(
    'platform-gross-margin',
    mockOrPlaceholder('platform-gross-margin', 'Platform Gross Margin', '42.5%'),
  )

  push('net-profit', mockOrPlaceholder('net-profit', 'Net Profit'))
  push('net-revenue', placeholder('Net Revenue', '₹3,12,400'))
  push('refund-rate', mockOrPlaceholder('refund-rate', 'Refund Rate', '2.4%'))
  push('chargeback-rate', mockOrPlaceholder('chargeback-rate', 'Chargeback Rate', '0.8%'))
  push('failed-transactions', placeholder('Failed Transactions', '14'))

  push(
    'collections-this-month',
    summary
      ? {
          label: 'Collections This Month',
          value: formatInr(summary.collectionsThisMonth),
          change: '6.7%',
          changeType: 'up',
          changeNote: 'vs last month',
        }
      : placeholder('Collections This Month', '₹5,40,000'),
  )

  push('payouts-released-this-month', placeholder('Payouts Released This Month', '₹2,10,000'))
  push(
    'average-payout-cycle-time',
    mockOrPlaceholder('average-payout-cycle-time', 'Average Payout Cycle Time', '3 Days 04:00'),
  )
  push('escrow-release-rate', placeholder('Escrow Release Rate', '78.2%'))
  push('platform-commission-earned', placeholder('Platform Commission Earned', '₹1,15,986'))
  push('service-marketplace-commission', placeholder('Service Marketplace Commission', '₹62,400'))
  push('event-commission', placeholder('Event Commission', '₹28,100'))
  push('venue-commission', placeholder('Venue Commission', '₹25,486'))
  push('revenue-growth', placeholder('Revenue Growth (7D / 30D / 90D / 1Y)', '12.4%'))

  return cards
}
