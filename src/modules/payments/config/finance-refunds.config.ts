import type { RefundSummaryMetric } from '@/modules/payments/types/finance-table-rows'

/** Design-time refund summary cards — Figma finance refunds spec. */
export const refundSummarySamples: RefundSummaryMetric[] = [
  {
    label: 'Pending Refunds',
    value: '0',
    change: '0%',
    changeNote: 'vs last month',
  },
  {
    label: 'Active Disputes',
    value: '0',
    change: '0%',
    changeNote: 'vs last month',
  },
  {
    label: 'Amount in Disputed',
    value: '₹0',
    change: '0%',
    changeNote: 'vs last month',
  },
  {
    label: 'Resolved',
    value: '0',
    change: '0%',
    changeNote: 'vs last month',
  },
]
