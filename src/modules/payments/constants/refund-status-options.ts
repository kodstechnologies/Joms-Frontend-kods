import type { StatusOption } from '@/shared/components/modals/change-status-modal'

export const DISPUTE_STATUS_OPTIONS: StatusOption[] = [
  { value: 'open', label: 'Open', description: 'Newly opened case' },
  { value: 'under_review', label: 'Under Review', description: 'Actively being reviewed' },
  { value: 'waiting_info', label: 'Waiting Info', description: 'Pending user / support response' },
  { value: 'escalated', label: 'Escalated', description: 'Escalated to higher authority' },
  {
    value: 'resolved_full_refund',
    label: 'Resolved – Full Refund',
    description: 'Closed with full refund',
  },
  {
    value: 'resolved_partial_refund',
    label: 'Resolved – Partial Refund',
    description: 'Closed with partial refund',
  },
  { value: 'rejected', label: 'Rejected', description: 'Closed with no refund' },
]

export const REFUND_STATUS_OPTIONS: StatusOption[] = [
  { value: 'initiated', label: 'Pending', description: 'Refund initiated / pending processing' },
  { value: 'processed', label: 'Completed', description: 'Refund processed successfully' },
  { value: 'failed', label: 'Failed', description: 'Refund processing failed' },
  { value: 'rejected', label: 'Rejected', description: 'Refund denied' },
]
