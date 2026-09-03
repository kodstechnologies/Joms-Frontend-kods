export const FINANCE_TABLE_STATUS_BADGE_BASE = 'finance-table-status-badge'

export const FINANCE_TABLE_STATUS_COMPLETED = 'finance-table-status-badge--completed'
export const FINANCE_TABLE_STATUS_DISPUTE = 'finance-table-status-badge--dispute'
export const FINANCE_TABLE_STATUS_FAILED = 'finance-table-status-badge--failed'
export const FINANCE_TABLE_STATUS_PENDING = 'finance-table-status-badge--pending'

const FINANCE_TABLE_COMPLETED_STATUSES = new Set([
  'Completed',
  'Paid',
  'Successful',
  'Resolved',
  'Released',
  'Matched',
  'Filed',
  'Confirmed',
  'Approved',
  'Processed',
  'Active',
])

const FINANCE_TABLE_DISPUTE_STATUSES = new Set(['Dispute', 'Open', 'In Review'])

const FINANCE_TABLE_FAILED_STATUSES = new Set([
  'Failed',
  'Rejected',
  'Cancelled',
  'Overdue',
  'Mismatch',
])

const FINANCE_TABLE_PENDING_STATUSES = new Set([
  'Pending',
  'Processing',
  'On Hold',
  'Paused',
  'Under Review',
  'In Progress',
  'Inactive',
])

export function financeTableStatusToneClass(status: string) {
  if (FINANCE_TABLE_COMPLETED_STATUSES.has(status)) {
    return FINANCE_TABLE_STATUS_COMPLETED
  }
  if (FINANCE_TABLE_DISPUTE_STATUSES.has(status)) {
    return FINANCE_TABLE_STATUS_DISPUTE
  }
  if (FINANCE_TABLE_FAILED_STATUSES.has(status)) {
    return FINANCE_TABLE_STATUS_FAILED
  }
  if (FINANCE_TABLE_PENDING_STATUSES.has(status)) {
    return FINANCE_TABLE_STATUS_PENDING
  }
  return FINANCE_TABLE_STATUS_PENDING
}

export const FINANCE_STATUS_PILL_POSITIVE = 'border-transparent bg-[#0A2B14] text-[#4ADE80]'
export const FINANCE_STATUS_PILL_PENDING = 'border-transparent bg-[#2A2114] text-[#F6CB86]'
export const FINANCE_STATUS_PILL_DANGER = 'border-transparent bg-[#2A0A0B] text-[#F87171]'

export function financePaymentDetailStatusClass(status: string) {
  if (status === 'Successful' || status === 'Paid') {
    return FINANCE_STATUS_PILL_POSITIVE
  }
  if (status === 'Pending') {
    return FINANCE_STATUS_PILL_PENDING
  }
  return FINANCE_STATUS_PILL_DANGER
}

export function financeServicePaymentStatusClass(status: string) {
  if (status === 'Successful' || status === 'Completed') {
    return FINANCE_STATUS_PILL_POSITIVE
  }
  if (status === 'Pending' || status === 'In Progress') {
    return FINANCE_STATUS_PILL_PENDING
  }
  return FINANCE_STATUS_PILL_DANGER
}

export function financeVenuePaymentStatusClass(status: string) {
  if (
    status === 'Successful' ||
    status === 'Completed' ||
    status === 'Confirmed' ||
    status === 'Approved'
  ) {
    return FINANCE_STATUS_PILL_POSITIVE
  }
  if (status === 'Pending' || status === 'In Progress') {
    return FINANCE_STATUS_PILL_PENDING
  }
  return FINANCE_STATUS_PILL_DANGER
}

export function financeReconciliationStatusClass(status: string) {
  if (status === 'Matched') {
    return FINANCE_STATUS_PILL_POSITIVE
  }
  if (status === 'Pending') {
    return FINANCE_STATUS_PILL_PENDING
  }
  return FINANCE_STATUS_PILL_DANGER
}

export function financeTaxComplianceStatusClass(status: string) {
  if (status === 'Confirmed' || status === 'Approved' || status === 'Filed') {
    return FINANCE_STATUS_PILL_POSITIVE
  }
  if (status === 'Pending' || status === 'Under Review') {
    return FINANCE_STATUS_PILL_PENDING
  }
  return FINANCE_STATUS_PILL_DANGER
}

export function financePayoutStatusClass(status: string) {
  if (status === 'Paid' || status === 'Completed') {
    return FINANCE_STATUS_PILL_POSITIVE
  }
  if (status === 'Pending' || status === 'Processing' || status === 'On Hold') {
    return FINANCE_STATUS_PILL_PENDING
  }
  return FINANCE_STATUS_PILL_DANGER
}

export function financeMembershipStatusClass(status: string) {
  if (status === 'Active') {
    return FINANCE_STATUS_PILL_POSITIVE
  }
  if (status === 'Paused') {
    return FINANCE_STATUS_PILL_PENDING
  }
  if (status === 'Expired') {
    return 'border-white/15 bg-brand-bg text-muted'
  }
  return FINANCE_STATUS_PILL_DANGER
}

export function financeInvoiceStatusClass(status: string) {
  if (status === 'Paid') {
    return FINANCE_STATUS_PILL_POSITIVE
  }
  if (status === 'Pending') {
    return FINANCE_STATUS_PILL_PENDING
  }
  return FINANCE_STATUS_PILL_DANGER
}

export function financeEscrowStatusClass(status: string) {
  if (status === 'Released') {
    return FINANCE_STATUS_PILL_POSITIVE
  }
  if (status === 'Active') {
    return FINANCE_STATUS_PILL_PENDING
  }
  return FINANCE_STATUS_PILL_DANGER
}

export function financeRefundStatusClass(status: string) {
  if (status === 'Processed' || status === 'Resolved') {
    return FINANCE_STATUS_PILL_POSITIVE
  }
  if (status === 'Rejected') {
    return FINANCE_STATUS_PILL_DANGER
  }
  return FINANCE_STATUS_PILL_PENDING
}

export const financeEscalationStatusClass = FINANCE_STATUS_PILL_PENDING
