import type { MembershipStatus } from './membership-management.mock'

export type MembershipDetail = {
  id: string
  subscriptionId: string
  plan: string
  startDate: string
  status: MembershipStatus
  billingCycle: string
  amount: string
  paymentMethod: string
  lastPayment: string
  nextRenewal: string
  userName: string
  userId: string
  userType: string
  planFeatures: string[]
}

const membershipDetails: MembershipDetail[] = [
  {
    id: 'sub-02',
    subscriptionId: 'SUB-2233-55124',
    plan: 'Monthly Duo',
    startDate: '2023-12-14',
    status: 'Active',
    billingCycle: 'Monthly',
    amount: '₹999',
    paymentMethod: 'UPI',
    lastPayment: '2024-01-15',
    nextRenewal: '2024-02-15',
    userName: 'Rajesh Kumar',
    userId: 'USR-98234',
    userType: 'User',
    planFeatures: [
      'Access to basic networking features',
      'Join up to 5 communities',
      'Attend 2 events per month',
      'Basic profile customization',
    ],
  },
  {
    id: 'sub-01',
    subscriptionId: 'SUB-2233-55120',
    plan: 'Rising Star',
    startDate: '2023-02-01',
    status: 'Active',
    billingCycle: 'Monthly',
    amount: '$12,500',
    paymentMethod: 'Credit Card',
    lastPayment: '2024-01-01',
    nextRenewal: '2024-02-01',
    userName: 'Alex Johnson',
    userId: 'USR-98201',
    userType: 'Expert',
    planFeatures: [
      'Priority listing in search results',
      'Unlimited service proposals',
      'Advanced analytics dashboard',
      'Dedicated account manager',
    ],
  },
]

export function getMembershipDetailById(id: string) {
  return membershipDetails.find((item) => item.id === id) ?? membershipDetails[0]
}
