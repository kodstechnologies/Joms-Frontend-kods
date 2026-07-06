export type FinanceCategoryStatus = 'Active' | 'Paused'

export type FinanceCategoryRow = {
  id: string
  categoryName: string
  module: string
  platformFee: string
  commissionRate: string
  taxRate: string
  payoutCycle: string
  status: FinanceCategoryStatus
}

export const financeCategoryRowsMock: FinanceCategoryRow[] = [
  {
    id: 'cat-01',
    categoryName: 'Technology',
    module: 'Events',
    platformFee: '20%',
    commissionRate: '15%',
    taxRate: '18% GST',
    payoutCycle: 'T+7 days',
    status: 'Active',
  },
  {
    id: 'cat-02',
    categoryName: 'Legal',
    module: 'Services',
    platformFee: '25%',
    commissionRate: '20%',
    taxRate: '18% GST',
    payoutCycle: 'T+3 days',
    status: 'Active',
  },
  {
    id: 'cat-03',
    categoryName: 'Consulting',
    module: 'Services',
    platformFee: '22%',
    commissionRate: '18%',
    taxRate: '18% GST',
    payoutCycle: 'T+5 days',
    status: 'Active',
  },
  {
    id: 'cat-04',
    categoryName: 'Wedding Venues',
    module: 'Venues',
    platformFee: '18%',
    commissionRate: '12%',
    taxRate: '18% GST',
    payoutCycle: 'T+7 days',
    status: 'Active',
  },
  {
    id: 'cat-05',
    categoryName: 'Premium Membership',
    module: 'Memberships',
    platformFee: '10%',
    commissionRate: '5%',
    taxRate: '18% GST',
    payoutCycle: 'Monthly',
    status: 'Paused',
  },
]
