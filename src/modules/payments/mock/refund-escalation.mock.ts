export type RefundAuthorityRole = {
  id: string
  title: string
  description: string
  permissions: string[]
}

export type RefundEscalationRequest = {
  id: string
  requestId: string
  customerId: string
  customerName: string
  membershipStatus: string
  module: string
  category: string
  amount: string
  routedBy: string
  customerComments: string
  internalNotes: string
}

const defaultEscalationRequest: RefundEscalationRequest = {
  id: 'refund-01',
  requestId: 'REF-001',
  customerId: 'SJ_00111',
  customerName: 'Sarah Johnson',
  membershipStatus: 'Basic',
  module: 'Services',
  category: 'Legal',
  amount: '₹5,499',
  routedBy: 'SUPAG_12',
  customerComments: 'Product defect - camera not working',
  internalNotes: 'Product defect - camera not working',
}

const roleDescription = 'Can approve and issue refunds within policy limits'

const rolePermissions = [
  'Approve & issue refunds',
  'Partial refund capability',
  'Reject with reason',
  'Escalate if amount exceeds limit',
]

export const refundAuthorityRolesMock: RefundAuthorityRole[] = [
  {
    id: 'finance-admin',
    title: 'Finance Admin',
    description: roleDescription,
    permissions: rolePermissions,
  },
  {
    id: 'operations-admin',
    title: 'Operations Admin',
    description: roleDescription,
    permissions: rolePermissions,
  },
  {
    id: 'support-lead',
    title: 'Support Lead',
    description: roleDescription,
    permissions: rolePermissions,
  },
  {
    id: 'super-admin',
    title: 'Super Admin',
    description: roleDescription,
    permissions: rolePermissions,
  },
]

export function getRefundEscalationRequestById(id: string): RefundEscalationRequest {
  return { ...defaultEscalationRequest, id }
}
