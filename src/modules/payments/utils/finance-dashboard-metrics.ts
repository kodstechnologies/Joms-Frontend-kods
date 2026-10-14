import { type TrendMetric } from '@/modules/payments/config/finance-dashboard.config'
import type { FinanceDashboardSummary } from '@/modules/payments/types/finance-api'
import { formatInr } from '@/modules/payments/utils/finance-mappers'
import { FINANCE_DASHBOARD_LEGACY_METRIC_ID_MAP } from '@/modules/payments/config/finance-dashboard-metrics.config'

export type FinanceDashboardMetricCard = TrendMetric & { id: string }

export { FINANCE_DASHBOARD_LEGACY_METRIC_ID_MAP }

function withDesignTrend(metric: TrendMetric | undefined | null, fallbackLabel = '—'): TrendMetric {
  if (!metric) {
    return placeholder(fallbackLabel)
  }

  const change = metric.change ?? '—'
  const hasPercent = change.includes('%')

  return {
    ...metric,
    change: hasPercent ? change : '—',
    changeNote: hasPercent ? (metric.changeNote ?? 'vs last month') : undefined,
    changeType: metric.changeType ?? 'up',
  }
}

function placeholder(label: string, value = '—'): TrendMetric {
  return withDesignTrend({
    label,
    value,
    change: '—',
    changeType: 'up',
    changeNote: 'vs last month',
  })
}

export function resolveFinanceDashboardMetricId(id: string): string {
  return FINANCE_DASHBOARD_LEGACY_METRIC_ID_MAP[id] ?? id
}

function liveMoney(
  summary: FinanceDashboardSummary | null | undefined,
  value: number | undefined,
  label: string,
): TrendMetric {
  if (!summary) return { label, value: '—', change: '—', changeType: 'up' }
  return { label, value: formatInr(value ?? 0), change: '—', changeType: 'up' }
}

function livePercent(
  summary: FinanceDashboardSummary | null | undefined,
  value: number | undefined,
  label: string,
): TrendMetric {
  if (!summary) return { label, value: '—', change: '—', changeType: 'up' }
  return { label, value: `${value ?? 0}%`, change: '—', changeType: 'up' }
}

function liveCount(
  summary: FinanceDashboardSummary | null | undefined,
  value: number | undefined,
  label: string,
): TrendMetric {
  if (!summary) return { label, value: '—', change: '—', changeType: 'up' }
  return { label, value: String(value ?? 0), change: '—', changeType: 'up' }
}

function monthChange(
  value: number | undefined,
): Pick<TrendMetric, 'change' | 'changeType' | 'changeNote'> {
  const change = value ?? 0
  return {
    change: `${change}%`,
    changeType: change < 0 ? 'down' : 'up',
    changeNote: 'vs last month',
  }
}

export function buildFinanceDashboardMetricCards(
  summary?: FinanceDashboardSummary | null,
): FinanceDashboardMetricCard[] {
  const cards: FinanceDashboardMetricCard[] = []

  const push = (id: string, metric: TrendMetric | undefined | null, fallbackLabel?: string) => {
    cards.push({ id, ...withDesignTrend(metric, fallbackLabel) })
  }

  const growth = summary
    ? monthChange(summary.revenueGrowth)
    : { change: '—', changeType: 'up' as const }

  push('total-amount-in-escrow', {
    ...liveMoney(summary, summary?.totalInEscrow, 'Total Amount in Escrow'),
  })
  push('pending-payouts', liveMoney(summary, summary?.pendingPayouts, 'Pending Payouts'))
  push('disputed-amount', liveMoney(summary, summary?.disputedAmount, 'Disputed Amount'))
  push('gmv', liveMoney(summary, summary?.gmv, 'Gross Merchandise Value (GMV)'))
  push(
    'total-platform-revenue',
    liveMoney(summary, summary?.totalPlatformRevenue, 'Total Platform Revenue'),
  )
  push(
    'monthly-recurring-revenue',
    liveMoney(summary, summary?.charts?.monthlyComparison.at(-1)?.mrr, 'Monthly Recurring Revenue'),
  )
  push(
    'platform-gross-margin',
    livePercent(summary, summary?.platformGrossMargin, 'Platform Gross Margin'),
  )
  push('net-profit', liveMoney(summary, summary?.netProfit, 'Net Profit'))
  push('net-revenue', liveMoney(summary, summary?.netRevenue, 'Net Revenue'))
  push('revenue-growth', {
    label: 'Revenue Growth',
    value: summary ? `${summary.revenueGrowth ?? 0}%` : '—',
    ...growth,
  })
  push('collections-this-month', {
    ...liveMoney(summary, summary?.collectionsThisMonth, 'Collections This Month'),
    ...growth,
  })
  push(
    'payouts-released-this-month',
    liveMoney(summary, summary?.payoutsReleasedThisMonth, 'Payouts Released This Month'),
  )
  push(
    'average-payout-cycle-time',
    summary
      ? {
          label: 'Average Payout Cycle Time',
          value:
            summary.averagePayoutCycleDays == null ? '—' : `${summary.averagePayoutCycleDays} days`,
          change: '—',
          changeType: 'up',
        }
      : { label: 'Average Payout Cycle Time', value: '—', change: '—', changeType: 'up' },
  )
  push('refund-rate', livePercent(summary, summary?.refundRate, 'Refund Rate'))
  push('chargeback-rate', livePercent(summary, summary?.chargebackRate, 'Chargeback Rate'))
  push(
    'failed-transactions',
    liveCount(summary, summary?.failedTransactions, 'Failed Transactions'),
  )
  push(
    'escrow-release-rate',
    livePercent(summary, summary?.escrowReleaseRate, 'Escrow Release Rate'),
  )
  push(
    'platform-commission-earned',
    liveMoney(summary, summary?.platformCommissionEarned, 'Platform Commission Earned'),
  )
  push(
    'service-marketplace-commission',
    liveMoney(summary, summary?.serviceMarketplaceCommission, 'Service Marketplace Commission'),
  )
  push('event-commission', liveMoney(summary, summary?.eventCommission, 'Event Commission'))
  push('venue-commission', liveMoney(summary, summary?.venueCommission, 'Venue Commission'))

  return cards
}
