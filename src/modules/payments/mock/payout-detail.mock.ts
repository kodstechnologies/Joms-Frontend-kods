import type { PayoutStatus } from './payout-management.mock'

export type PayoutDetail = {
  id: string
  payoutId: string
  recipient: string
  type: string
  status: PayoutStatus
  initiatedDate: string
  payoutAmount: string
  commissionDeducted: string
  netRevenue: string
  accountNumber: string
  ifscCode: string
}

const payoutDetails: PayoutDetail[] = [
  {
    id: 'payout-01',
    payoutId: 'PYMT-2023-00042',
    recipient: 'Sarah Wilson',
    type: 'Event (Service)',
    status: 'Pending',
    initiatedDate: '01/02/2023',
    payoutAmount: '$12,500',
    commissionDeducted: '$2,500',
    netRevenue: '$10,000',
    accountNumber: '**** 4512',
    ifscCode: 'HDFC0001234',
  },
  {
    id: 'payout-02',
    payoutId: 'PYMT-2023-00043',
    recipient: 'Alex Johnson',
    type: 'Venue Rental',
    status: 'Pending',
    initiatedDate: '02/02/2023',
    payoutAmount: '$8,200',
    commissionDeducted: '$1,640',
    netRevenue: '$6,560',
    accountNumber: '**** 7890',
    ifscCode: 'ICIC0005678',
  },
]

export function getPayoutDetailById(id: string) {
  return payoutDetails.find((item) => item.id === id) ?? payoutDetails[0]
}
