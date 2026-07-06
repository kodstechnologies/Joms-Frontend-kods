export type DisputeEvidenceFile = {
  id: string
  fileName: string
  fileSize: string
  date: string
}

export type DisputeTimelineItem = {
  step: string
  title: string
  actor: string
  timestamp: string
  description: string
}

export type DisputeDetail = {
  id: string
  disputeId: string
  transactionId: string
  openedDate: string
  status: 'Under Review' | 'Resolved' | 'Open'
  moduleType: string
  paymentMode: string
  escalatedBy: string
  escalatedOn: string
  supportReviewSummary: string
  escalationReason: string
  supportRecommendation: string
  detailedNotes: string
  evidenceFiles: DisputeEvidenceFile[]
  userId: string
  userName: string
  userEmail: string
  relatedEntityId: string
  disputeReason: string
  requestInfoReason: string
  submittedEvidenceCount: number
  assignedTo: string
  amount: string
  listedRefundAmount: string
  maxRefundableAmount: number
  platformRetainAmount: string
  userMessage: string
  timeline: DisputeTimelineItem[]
}

const defaultDisputeDetail: DisputeDetail = {
  id: 'refund-02',
  disputeId: 'DIS001',
  transactionId: 'TRA_30001',
  openedDate: '2024-01-12',
  status: 'Under Review',
  moduleType: 'Event',
  paymentMode: 'UPI',
  escalatedBy: 'Tom Rodriguez',
  escalatedOn: 'Jan 23, 2024, 02:30 PM',
  supportReviewSummary:
    'Customer reported service quality issues. Support reviewed the case and found valid concerns regarding deliverables. Recommended escalation due to refund amount exceeding standard approval limits.',
  escalationReason: 'High Amount',
  supportRecommendation: 'Approve Full Refund',
  detailedNotes:
    'Customer reported service quality issues. Support reviewed the case and found valid concerns regarding deliverables. Recommended escalation due to refund amount exceeding standard approval limits.',
  evidenceFiles: Array.from({ length: 6 }, (_, index) => ({
    id: `file-${index + 1}`,
    fileName: 'Screenshot...005',
    fileSize: '8GB',
    date: '12/07/2025',
  })),
  userId: 'USR0001',
  userName: 'Emma Davis',
  userEmail: 'emma.davis@email.com',
  relatedEntityId: 'SER001',
  disputeReason: 'Quality issue in service',
  requestInfoReason: 'Event Cancelled',
  submittedEvidenceCount: 2,
  assignedTo: 'Admin Team',
  amount: '₹15,000',
  listedRefundAmount: '$400',
  maxRefundableAmount: 15000,
  platformRetainAmount: '₹500',
  userMessage:
    "The concert was cancelled by the organizers but I still haven't received my refund. It's been 3 weeks since the cancellation.",
  timeline: [
    {
      step: '01',
      title: 'Dispute Created',
      actor: 'Emma Davis',
      timestamp: '01/12/2026 - 09:45 AM',
      description: 'Customer raised a dispute regarding service quality and incomplete deliverables.',
    },
    {
      step: '02',
      title: 'Assigned to Support',
      actor: 'Support Team',
      timestamp: '01/12/2026 - 11:20 AM',
      description: 'Case assigned to support for initial review and evidence verification.',
    },
    {
      step: '03',
      title: 'Reviewed by Support',
      actor: 'Tom Rodriguez',
      timestamp: '01/23/2026 - 02:00 PM',
      description: 'Support reviewed evidence and recommended full refund approval.',
    },
    {
      step: '04',
      title: 'Escalated to Admin',
      actor: 'Tom Rodriguez',
      timestamp: '01/23/2026 - 02:30 PM',
      description: 'Escalated due to high refund amount requiring admin approval.',
    },
  ],
}

export function getDisputeDetailById(id: string): DisputeDetail {
  return { ...defaultDisputeDetail, id }
}
