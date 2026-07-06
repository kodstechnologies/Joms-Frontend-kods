export type RefundAuthorityRole = {
  id: string
  title: string
  description: string
  permissions: string[]
}

export type RefundEscalationRequest = {
  id: string
  requestId: string
  customerName: string
  amount: string
  reason: string
  moduleType: string
  serviceType: string
  paymentMode: string
}

const defaultEscalationRequest: RefundEscalationRequest = {
  id: 'refund-02',
  requestId: 'REF-001',
  customerName: 'Sarah Johnson',
  amount: '₹5,499',
  reason: 'Product defect - camera not working',
  moduleType: 'Service',
  serviceType: 'Consultation',
  paymentMode: 'UPI/Credit Card',
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
