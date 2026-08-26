import {
  refundSummaryMetricsMock,
  type RefundChargebackRow,
  type RefundSummaryMetric,
} from '@/modules/payments/mock/finance-refunds.mock'
import type { FinanceDashboardSummary } from '@/modules/payments/types/finance-api'
import { formatInr } from '@/modules/payments/utils/finance-mappers'
import { FINANCE_REFUNDS_METRICS_CATALOG } from '@/modules/payments/config/finance-refunds-metrics.config'

export type FinanceRefundsMetricCard = RefundSummaryMetric & { id: string }

const mockByLabel = new Map(refundSummaryMetricsMock.map((metric) => [metric.label, metric]))

function addTrend(metric: RefundSummaryMetric): RefundSummaryMetric {
  const change = metric.change.replace(/^▲\s*/, '')
  return {
    ...metric,
    change: change.includes('%') ? change : '6.7%',
    changeNote: metric.changeNote || 'vs last month',
  }
}

export function buildFinanceRefundsMetricCards(params: {
  rows: RefundChargebackRow[]
  summary?: FinanceDashboardSummary | null
}): FinanceRefundsMetricCard[] {
  const pendingRefunds = params.rows.filter(
    (row) => row.type === 'Refund' && row.status === 'Pending',
  ).length

  const liveValues: Record<string, string> = {
    'pending-refunds':
      pendingRefunds > 0
        ? String(pendingRefunds).padStart(2, '0')
        : mockByLabel.get('Pending Refunds')!.value,
    'active-disputes': mockByLabel.get('Active Disputes')!.value,
    'amount-in-disputed':
      params.summary != null
        ? formatInr(params.summary.disputedAmount)
        : mockByLabel.get('Amount in Disputed')!.value,
    resolved: mockByLabel.get('Resolved')!.value,
  }

  return FINANCE_REFUNDS_METRICS_CATALOG.map((item) => {
    const mock = addTrend(mockByLabel.get(item.label)!)

    return {
      id: item.id,
      label: item.label,
      value: liveValues[item.id] ?? mock.value,
      change: mock.change,
      changeNote: mock.changeNote,
    }
  })
}
