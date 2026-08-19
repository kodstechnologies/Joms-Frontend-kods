import type { OrderMilestone } from '../../type/service-drilldown'

export type StatusTone = 'success' | 'active' | 'idle' | 'danger'

export function resolveEngagementTone(
  paymentStatus?: string | null,
  workStatus?: string | null,
): StatusTone {
  if (workStatus === 'disputed' || workStatus === 'terminated') return 'danger'
  if (workStatus === 'approved' || workStatus === 'completed' || paymentStatus === 'paid') {
    if (workStatus === 'approved' || workStatus === 'completed') return 'success'
  }
  if (
    workStatus === 'ongoing' ||
    workStatus === 'review_pending' ||
    paymentStatus === 'partially_paid'
  ) {
    return 'active'
  }
  if (paymentStatus === 'paid' && workStatus === 'ongoing') return 'active'
  return workStatus ? 'active' : 'idle'
}

export function milestoneChrome(milestone: OrderMilestone) {
  const status = milestone.status
  const paid = milestone.paymentStatus === 'paid' || status === 'payment_completed'

  if (status === 'disputed' || status === 'terminated') {
    return {
      tone: 'danger' as StatusTone,
      paymentLabel: paid ? 'Paid' : 'Not yet',
      workLabel: status === 'disputed' ? 'Disputed' : 'Terminated',
    }
  }
  if (status === 'approved' || status === 'payment_completed') {
    return { tone: 'success' as StatusTone, paymentLabel: 'Paid', workLabel: 'Completed' }
  }
  if (status === 'ongoing' || status === 'review_pending' || status === 'approval_pending') {
    return {
      tone: 'active' as StatusTone,
      paymentLabel: paid ? 'Paid' : 'Pending',
      workLabel: status === 'review_pending' ? 'Pending Review' : 'Ongoing',
    }
  }
  return { tone: 'idle' as StatusTone, paymentLabel: 'Not yet', workLabel: 'Yet to start' }
}
