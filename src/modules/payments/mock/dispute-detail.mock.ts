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
  assignedTo: string
  amount: string
  userMessage: string
  timeline: DisputeTimelineItem[]
}

const defaultDisputeDetail: DisputeDetail = {
  id: 'refund-02',
  disputeId: 'DIS-2026-00028',
  transactionId: 'TXN-2026-00110',
  openedDate: '2026-01-12',
  status: 'Under Review',
  moduleType: 'Event',
  paymentMode: 'UPI/Credit Card',
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
  userId: 'USR-4421',
  userName: 'Emma Davis',
  userEmail: 'emma.davis@email.com',
  relatedEntityId: 'SER001',
  disputeReason: 'Quality issue in the service',
  assignedTo: 'Admin Team',
  amount: '₹11,000',
  userMessage:
    'The service delivered did not match what was promised during booking. Multiple deliverables were incomplete and the expert was unresponsive after payment.',
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
      title: 'Support Review Started',
      actor: 'Support Team',
      timestamp: '01/12/2026 - 11:20 AM',
      description: 'Case assigned to support for initial review and evidence verification.',
    },
    {
      step: '03',
      title: 'Escalated to Admin',
      actor: 'Tom Rodriguez',
      timestamp: '01/23/2026 - 02:30 PM',
      description: 'Escalated due to high refund amount requiring admin approval.',
    },
    {
      step: '04',
      title: 'Under Admin Review',
      actor: 'Admin Team',
      timestamp: '01/23/2026 - 03:00 PM',
      description: 'Awaiting final decision from admin based on support recommendation.',
    },
  ],
}

export function getDisputeDetailById(id: string): DisputeDetail {
  return { ...defaultDisputeDetail, id }
}
