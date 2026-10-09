import type { TrendMetric } from '@/modules/payments/config/finance-dashboard.config'
import type { FinanceDashboardSummary } from '@/modules/payments/types/finance-api'
import { formatInr } from '@/modules/payments/utils/finance-mappers'
import { FINANCE_DASHBOARD_LEGACY_METRIC_ID_MAP } from '@/modules/payments/config/finance-dashboard-metrics.config'

export type FinanceDashboardMetricCard = TrendMetric & { id: string }

export { FINANCE_DASHBOARD_LEGACY_METRIC_ID_MAP }

/** Shown when the API has no data source for a metric; never a sample figure. */
export const NO_DATA_VALUE = '—'

function metric(label: string, value: string = NO_DATA_VALUE): TrendMetric {
  // No period-over-period history is recorded yet, so no trend is shown.
  return { label, value, change: '', changeType: 'up' }
}

export function resolveFinanceDashboardMetricId(id: string): string {
  return FINANCE_DASHBOARD_LEGACY_METRIC_ID_MAP[id] ?? id
}

export function buildFinanceDashboardMetricCards(
  summary?: FinanceDashboardSummary | null,
): FinanceDashboardMetricCard[] {
  const cards: FinanceDashboardMetricCard[] = []
  const push = (id: string, label: string, value?: string) => {
    cards.push({ id, ...metric(label, value) })
  }
  const inr = (value: number | undefined) =>
    summary && value != null && Number.isFinite(value) ? formatInr(value) : undefined

  const revenue = summary?.totalPlatformRevenue ?? 0
  const grossMarginValue =
    summary && revenue > 0
      ? `${Math.round((Math.max(0, revenue - summary.pendingPayouts) / revenue) * 100)}%`
      : undefined
  const netProfitValue = summary ? Math.max(0, revenue - summary.pendingPayouts) : undefined
  const refundRateValue =
    summary && revenue > 0 ? `${((summary.disputedAmount / revenue) * 100).toFixed(1)}%` : undefined

  push('total-amount-in-escrow', 'Total Amount in Escrow', inr(summary?.totalInEscrow))
  push('pending-payouts', 'Pending Payouts', inr(summary?.pendingPayouts))
  push('disputed-amount', 'Disputed Amount', inr(summary?.disputedAmount))
  push('gmv', 'Gross Merchandise Value (GMV)', inr(summary?.gmv))
  push('total-platform-revenue', 'Total Platform Revenue', inr(summary?.totalPlatformRevenue))
  push('monthly-recurring-revenue', 'Monthly Recurring Revenue')
  push('platform-gross-margin', 'Platform Gross Margin', grossMarginValue)
  push('net-profit', 'Net Profit', inr(netProfitValue))
  push('average-payout-cycle-time', 'Average Payout Cycle Time')
  push('refund-rate', 'Refund Rate', refundRateValue)
  push('chargeback-rate', 'Chargeback Rate')
  push('net-revenue', 'Net Revenue')
  push('failed-transactions', 'Failed Transactions')
  push('collections-this-month', 'Collections This Month', inr(summary?.collectionsThisMonth))
  push('payouts-released-this-month', 'Payouts Released This Month')
  push('escrow-release-rate', 'Escrow Release Rate')
  push('platform-commission-earned', 'Platform Commission Earned')
  push('service-marketplace-commission', 'Service Marketplace Commission')
  push('event-commission', 'Event Commission')
  push('venue-commission', 'Venue Commission')
  push('revenue-growth', 'Revenue Growth (7D / 30D / 90D / 1Y)')

  return cards
}
