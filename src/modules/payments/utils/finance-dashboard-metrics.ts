import {
  payoutsCashFlowCardsMock,
  revenueProfitCardsMock,
  topSummaryCardsMock,
  type TrendMetric,
} from '@/modules/payments/mock/finance-dashboard.mock'
import type { FinanceDashboardSummary } from '@/modules/payments/types/finance-api'
import { formatInr } from '@/modules/payments/utils/finance-mappers'

export type FinanceDashboardMetricCard = TrendMetric & { id: string }

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
    'Total In Escrow': 'total-in-escrow',
    'Pending Payout': 'pending-payout',
    'Disputed Amount': 'disputed-amount',
    'Total Platform Revenue': 'total-platform-revenue',
    'Monthly Recurring Revenue': 'monthly-recurring-revenue',
    'Gross Margin': 'gross-margin',
    'Net Profit': 'net-profit',
    'Pending Payouts': 'pending-payouts',
    'Avg. Payout Cycle Time': 'avg-payout-cycle-time',
    'Refund Rate': 'refund-rate',
    'Chargeback Rate': 'chargeback-rate',
  }
  return map[label] ?? null
}

function addTrend(metric: TrendMetric): TrendMetric {
  return {
    ...metric,
    change: metric.change.includes('%') ? metric.change : '6.7%',
    changeNote: metric.changeNote ?? 'vs last month',
    changeType: metric.changeType ?? 'up',
  }
}

export function buildFinanceDashboardMetricCards(
  summary?: FinanceDashboardSummary | null,
): FinanceDashboardMetricCard[] {
  const cards: FinanceDashboardMetricCard[] = []

  const push = (id: string, metric: TrendMetric) => {
    cards.push({ id, ...addTrend(metric) })
  }

  push(
    'total-in-escrow',
    summary
      ? {
          label: 'Total In Escrow',
          value: formatInr(summary.totalInEscrow),
          change: '6.7%',
          changeType: 'up',
          changeNote: 'vs last month',
        }
      : mockById.get('total-in-escrow')!,
  )

  push(
    'pending-payout',
    summary
      ? {
          label: 'Pending Payout',
          value: formatInr(summary.pendingPayouts),
          change: '6.7%',
          changeType: 'up',
          changeNote: 'vs last month',
        }
      : mockById.get('pending-payout')!,
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
      : mockById.get('disputed-amount')!,
  )

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
      : mockById.get('total-platform-revenue')!,
  )

  push('monthly-recurring-revenue', mockById.get('monthly-recurring-revenue')!)
  push('gross-margin', mockById.get('gross-margin')!)
  push('net-profit', mockById.get('net-profit')!)
  push('pending-payouts', mockById.get('pending-payouts')!)
  push('avg-payout-cycle-time', mockById.get('avg-payout-cycle-time')!)
  push('refund-rate', mockById.get('refund-rate')!)
  push('chargeback-rate', mockById.get('chargeback-rate')!)

  return cards
}
