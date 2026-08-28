export type PayoutStatus = 'Completed' | 'Pending' | 'Failed'

export type PayoutSummaryMetric = {
  label: string
  value: string
  change: string
  changeNote: string
}

export type PayoutRow = {
  id: string
  payoutId: string
  recipient: string
  type: string
  amount: string
  method: string
  initiatedDate: string
  description: string
  status: PayoutStatus
}

export const payoutSummaryMetricsMock: PayoutSummaryMetric[] = [
  { label: 'Total Payments', value: '0', change: '0%', changeNote: 'vs last month' },
  { label: 'Completed', value: '₹0', change: '0%', changeNote: 'vs last month' },
  { label: 'Pending', value: '0', change: '0%', changeNote: 'vs last month' },
  { label: 'Failed', value: '0', change: '0%', changeNote: 'vs last month' },
]

export const payoutRowsMock: PayoutRow[] = [
  {
    id: 'payout-01',
    payoutId: 'PYMT_0021',
    recipient: 'Sarah Wilson',
    type: 'Event (Service)',
    amount: '₹12,500',
    method: 'Credit Card',
    initiatedDate: '01/02/2023',
    description: 'Event hosting payment',
    status: 'Completed',
  },
  {
    id: 'payout-02',
    payoutId: 'PYMT_0022',
    recipient: 'Alex Johnson',
    type: 'Venue Rental',
    amount: '₹8,200',
    method: 'Bank Transfer',
    initiatedDate: '02/02/2023',
    description: 'Venue booking payout',
    status: 'Pending',
  },
  {
    id: 'payout-03',
    payoutId: 'PYMT_0023',
    recipient: 'Rajesh Kumar',
    type: 'Consultation',
    amount: '₹4,500',
    method: 'UPI',
    initiatedDate: '03/02/2023',
    description: 'Expert consultation fee',
    status: 'Completed',
  },
  {
    id: 'payout-04',
    payoutId: 'PYMT_0024',
    recipient: 'Legal Corp Inc.',
    type: 'Service',
    amount: '₹15,000',
    method: 'Credit Card',
    initiatedDate: '04/02/2023',
    description: 'NDA review service payout',
    status: 'Failed',
  },
  {
    id: 'payout-05',
    payoutId: 'PYMT_0025',
    recipient: 'Dr. Michael Chen',
    type: 'Venue',
    amount: '$22,000',
    method: 'Bank Transfer',
    initiatedDate: '05/02/2023',
    description: 'Conference hall rental',
    status: 'Pending',
  },
]
