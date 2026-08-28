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

function withDisplayTrend(metric: RefundSummaryMetric): RefundSummaryMetric {
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

  const activeDisputes =
    params.summary?.openDisputes ??
    params.rows.filter(
      (row) =>
        row.type === 'Dispute' &&
        (row.status === 'Open' || row.status === 'In Review' || row.status === 'Pending'),
    ).length

  const resolvedCount = params.rows.filter((row) => row.status === 'Resolved').length

  const liveValues: Record<string, string> = {
    'pending-refunds': String(pendingRefunds).padStart(2, '0'),
    'active-disputes': String(activeDisputes).padStart(2, '0'),
    'amount-in-disputed': params.summary != null ? formatInr(params.summary.disputedAmount) : '₹0',
    resolved: String(resolvedCount).padStart(2, '0'),
  }

  return FINANCE_REFUNDS_METRICS_CATALOG.map((item) => {
    const mock = withDisplayTrend(mockByLabel.get(item.label)!)

    return {
      id: item.id,
      label: item.label,
      value: liveValues[item.id] ?? mock.value,
      change: mock.change,
      changeNote: mock.changeNote,
    }
  })
}
