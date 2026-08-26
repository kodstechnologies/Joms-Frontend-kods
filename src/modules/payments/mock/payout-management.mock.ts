export type PayoutStatus =
  | 'Paid'
  | 'Completed'
  | 'Pending'
  | 'Failed'
  | 'Processing'
  | 'On Hold'
  | 'Cancelled'

export type PayoutSummaryMetric = {
  label: string
  value: string
  change: string
  changeNote: string
}

export type PayoutRow = {
  id: string
  payoutId: string
  payeeId: string
  payeeName: string
  payeeType: string
  relatedTransaction: string
  grossAmount: string
  platformCommission: string
  taxDeduction: string
  gatewayCharges: string
  netPayout: string
  currency: string
  bankReference: string
  scheduledDate: string
  processedDate: string
  financeApprover: string
  status: PayoutStatus
  rawStatus: string
}

export const payoutSummaryMetricsMock: PayoutSummaryMetric[] = [
  { label: 'Total Payments', value: '08', change: '+5.2%', changeNote: 'vs last month' },
  { label: 'Completed', value: '$487,650', change: '+5.2%', changeNote: 'vs last month' },
  { label: 'Pending', value: '$487,650', change: '+5.2%', changeNote: 'vs last month' },
  { label: 'Failed', value: '$487,650', change: '+5.2%', changeNote: 'vs last month' },
]

export const payoutRowsMock: PayoutRow[] = [
  {
    id: 'payout-01',
    payoutId: 'PYMT_0021',
    payeeId: 'EXP001',
    payeeName: 'Sarah Wilson',
    payeeType: 'Expert',
    relatedTransaction: 'ORD-0021',
    grossAmount: '₹12,500',
    platformCommission: '₹1,250',
    taxDeduction: '₹0',
    gatewayCharges: '₹0',
    netPayout: '₹11,250',
    currency: 'INR',
    bankReference: '—',
    scheduledDate: '01/02/2023',
    processedDate: '01/02/2023',
    financeApprover: '—',
    status: 'Paid',
    rawStatus: 'paid',
  },
]
