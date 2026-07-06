export type MembershipStatus = 'Active' | 'Cancelled' | 'Expired' | 'Paused'

export type MembershipSummaryMetric = {
  label: string
  value: string
  change: string
  changeNote: string
}

export type MembershipRow = {
  id: string
  subscriptionId: string
  name: string
  planName: string
  amount: string
  billingCycle: string
  startDate: string
  nextBilling: string
  status: MembershipStatus
}

export const membershipSummaryMetricsMock: MembershipSummaryMetric[] = [
  { label: 'Active Subscriptions', value: '08', change: '+5.2%', changeNote: 'vs last month' },
  { label: 'Started', value: '$487,650', change: '+5.2%', changeNote: 'vs last month' },
  { label: 'Cancelled', value: '$487,650', change: '+5.2%', changeNote: 'vs last month' },
  { label: 'Expired', value: '$487,650', change: '+5.2%', changeNote: 'vs last month' },
]

export const membershipRowsMock: MembershipRow[] = [
  {
    id: 'sub-01',
    subscriptionId: 'PMT_0021',
    name: 'Alex Johnson',
    planName: 'Rising Star',
    amount: '$12,500',
    billingCycle: 'Monthly',
    startDate: '01/02/2023',
    nextBilling: '01/03/2023',
    status: 'Active',
  },
  {
    id: 'sub-02',
    subscriptionId: 'PMT_0022',
    name: 'Rajesh Kumar',
    planName: 'Monthly Duo',
    amount: '₹999',
    billingCycle: 'Monthly',
    startDate: '14/12/2023',
    nextBilling: '15/02/2024',
    status: 'Active',
  },
  {
    id: 'sub-03',
    subscriptionId: 'PMT_0023',
    name: 'Sarah Wilson',
    planName: 'Premium Pro',
    amount: '$24,999',
    billingCycle: 'Yearly',
    startDate: '10/01/2023',
    nextBilling: '10/01/2024',
    status: 'Cancelled',
  },
  {
    id: 'sub-04',
    subscriptionId: 'PMT_0024',
    name: 'Dr. Michael Chen',
    planName: 'Expert Plus',
    amount: '$8,999',
    billingCycle: 'Monthly',
    startDate: '05/06/2022',
    nextBilling: '—',
    status: 'Expired',
  },
]
