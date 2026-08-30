export function financePaymentDetailStatusClass(status: string) {
  if (status === 'Successful' || status === 'Paid') {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  if (status === 'Pending') {
    return 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
  }
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

export function financeServicePaymentStatusClass(status: string) {
  if (status === 'Successful' || status === 'Completed') {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  if (status === 'Pending' || status === 'In Progress') {
    return 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
  }
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

export function financeVenuePaymentStatusClass(status: string) {
  if (
    status === 'Successful' ||
    status === 'Completed' ||
    status === 'Confirmed' ||
    status === 'Approved'
  ) {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  if (status === 'Pending' || status === 'In Progress') {
    return 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
  }
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

export function financeReconciliationStatusClass(status: string) {
  if (status === 'Matched') {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  if (status === 'Pending') {
    return 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
  }
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

export function financeTaxComplianceStatusClass(status: string) {
  if (status === 'Confirmed' || status === 'Approved' || status === 'Filed') {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  if (status === 'Pending' || status === 'Under Review') {
    return 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
  }
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

export function financePayoutStatusClass(status: string) {
  if (status === 'Paid' || status === 'Completed') {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  if (status === 'Pending' || status === 'Processing' || status === 'On Hold') {
    return 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
  }
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

export function financeMembershipStatusClass(status: string) {
  if (status === 'Active') {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  if (status === 'Paused') {
    return 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
  }
  if (status === 'Expired') {
    return 'border-white/15 bg-brand-bg text-muted'
  }
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

export function financeInvoiceStatusClass(status: string) {
  if (status === 'Paid') {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  if (status === 'Pending') {
    return 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
  }
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

export function financeEscrowStatusClass(status: string) {
  if (status === 'Released') {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  if (status === 'Active') {
    return 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
  }
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

export function financeRefundStatusClass(status: string) {
  if (status === 'Processed' || status === 'Resolved') {
    return 'border-brand-positive/40 bg-brand-positive/10 text-brand-positive'
  }
  if (status === 'Rejected') {
    return 'border-brand-danger/40 bg-brand-danger/10 text-brand-danger'
  }
  return 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
}

export const financeEscalationStatusClass =
  'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
