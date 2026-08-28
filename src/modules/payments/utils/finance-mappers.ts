import type {
  FinanceDashboardSummary,
  FinanceDispute,
  FinanceEscrowHold,
  FinanceInvoice,
  FinancePayment,
  FinancePayout,
  FinanceReconciliation,
  FinanceRefund,
  FinanceTaxRecord,
} from '../types/finance-api'

export const formatInr = (amount?: number | null) => {
  const value = Number(amount) || 0
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

export const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export const formatDateTime = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const titleCase = (value?: string | null) => {
  if (!value) return '—'
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export const mapPaymentStatus = (status: string) => {
  if (status === 'paid' || status === 'fulfilled') return 'Paid' as const
  if (status === 'failed' || status === 'expired') return 'Failed' as const
  return 'Pending' as const
}

export const mapPaymentToRevenueRow = (payment: FinancePayment) => {
  const snapshot = payment.moduleSnapshot || {}
  return {
    id: payment._id,
    transactionId: payment.orderId || payment.razorpayPaymentId || payment._id,
    module: titleCase(payment.module),
    entityType: titleCase(payment.pricingType || payment.referenceType || payment.module),
    entityId: payment.referenceId || payment.orderId,
    entityName: (snapshot.title as string) || payment.description || payment.orderId,
    category: (snapshot.category as string) || titleCase(payment.module),
    subCategory: (snapshot.subCategory as string) || '—',
    ownerType: payment.userType === 'partner' ? 'Expert' : titleCase(payment.userType),
    ownerName: (snapshot.partnerName as string) || payment.partnerId || payment.userId || '—',
    grossAmount: formatInr(payment.amount),
    discounts: '—',
    refundAmount: '—',
    taxAmount: '—',
    netRevenue: '—',
    platformCommission: '—',
    netProfit: '—',
    status: mapPaymentStatus(payment.status),
    settlementStatus: payment.settlementStatus ? titleCase(payment.settlementStatus) : '—',
    complianceStatus: '—',
    lastUpdated: formatDate(payment.updatedAt || payment.createdAt),
  }
}

export const mapEscrowStatus = (status: string): 'Active' | 'Released' | 'Dispute' => {
  if (status === 'held') return 'Active'
  if (status === 'released_to_payout') return 'Released'
  if (status === 'refunded' || status === 'cancelled') return 'Dispute'
  return 'Active'
}

export const mapEscrowToRow = (escrow: FinanceEscrowHold) => ({
  id: escrow._id,
  tab: 'escrow' as const,
  escrowId: escrow.escrowId,
  transactionId: String(escrow.transactionId || escrow.paymentOrderId || escrow.paymentId),
  type: titleCase(escrow.module || escrow.pricingType),
  amount: formatInr(escrow.amountHeld),
  holdReason: escrow.holdReason || 'Awaiting approval',
  initiatedDate: formatDate(escrow.heldAt || escrow.createdAt),
  expectedRelease: formatDate(escrow.expectedReleaseAt),
  releasedAt: formatDate(escrow.releasedAt),
  status: mapEscrowStatus(escrow.status),
  createdBy: '—',
  lastUpdated: formatDate(escrow.createdAt),
})

export const mapPayoutStatus = (status: string) => {
  if (status === 'paid') return 'Completed' as const
  if (status === 'failed') return 'Failed' as const
  return 'Pending' as const
}

export const mapPayoutToRow = (payout: FinancePayout) => ({
  id: payout._id,
  payoutId: payout.payoutId,
  recipient: payout.partnerName || payout.partnerId,
  type: titleCase(payout.module),
  amount: formatInr(payout.fees?.netPayable ?? payout.fees?.grossAmount),
  method: payout.bankingSnapshot?.bankReference || payout.settlementPath || 'Bank Transfer',
  initiatedDate: formatDate(payout.scheduledAt || payout.createdAt),
  description: `${titleCase(payout.pricingType)} · ${titleCase(payout.status)}`,
  status: mapPayoutStatus(payout.status),
})

export const mapDisputeStatus = (status: string) => {
  if (status === 'resolved_full_refund' || status === 'resolved_partial_refund') {
    return 'Resolved' as const
  }
  if (status === 'rejected') return 'Rejected' as const
  if (status === 'open') return 'Open' as const
  if (status === 'under_review' || status === 'waiting_info') return 'In Review' as const
  if (status === 'escalated') return 'In Review' as const
  return titleCase(status) as 'Resolved' | 'Rejected' | 'Pending' | 'Open' | 'In Review'
}

export const mapRefundStatus = (status: string) => {
  if (status === 'processed') return 'Resolved' as const
  if (status === 'rejected') return 'Rejected' as const
  if (status === 'initiated' || status === 'failed') return 'Pending' as const
  return titleCase(status) as 'Resolved' | 'Rejected' | 'Pending' | 'Open' | 'In Review'
}

export const mapDisputeToRefundRow = (dispute: FinanceDispute) => ({
  id: dispute._id,
  recordId: dispute.disputeId,
  type: (dispute.caseType === 'refund_request' ? 'Refund' : 'Dispute') as 'Refund' | 'Dispute',
  kind: 'dispute' as const,
  relatedEntity: titleCase(dispute.module),
  amount: formatInr(dispute.originalAmount),
  reason: dispute.reason || dispute.summary || '—',
  initiatedDate: formatDate(dispute.createdAt),
  description: dispute.summary || dispute.reason || '—',
  status: mapDisputeStatus(dispute.status),
  rawStatus: dispute.status,
  transactionId: dispute.paymentId || '—',
  module: titleCase(dispute.module),
  customerName: '—',
  refundMode: '—',
  initiatedBy: '—',
  approvedBy: '—',
  chargebackFlag: dispute.caseType === 'chargeback' ? 'Yes' : 'No',
  gateway: '—',
})

export const mapRefundToRow = (refund: FinanceRefund) => ({
  id: refund._id,
  recordId: refund.refundId,
  type: 'Refund' as const,
  kind: 'refund' as const,
  relatedEntity: titleCase(refund.module),
  amount: formatInr(refund.amount),
  reason: refund.reason || '—',
  initiatedDate: formatDate(refund.createdAt),
  description: titleCase(refund.refundType),
  status: mapRefundStatus(refund.status),
  rawStatus: refund.status,
  transactionId: refund.paymentId || '—',
  module: titleCase(refund.module),
  customerName: refund.beneficiary || '—',
  refundMode: refund.refundMode || '—',
  initiatedBy: refund.initiatedBy || '—',
  approvedBy: '—',
  chargebackFlag: 'No',
  gateway: '—',
})

export const mapReconToRow = (row: FinanceReconciliation) => ({
  id: row._id,
  reconciliationId: row.recordId,
  gateway: row.gateway || 'Razorpay',
  transactionId: String(row.gatewayReference || row.paymentId),
  platformRecordId: row.recordId,
  gatewayAmount: formatInr(row.gatewayAmount),
  platformAmount: formatInr(row.platformReceivedAmount),
  difference:
    row.status === 'matched'
      ? ('Matched' as const)
      : row.status === 'resolved'
        ? ('Matched' as const)
        : row.status === 'investigating'
          ? ('Pending' as const)
          : ('Mismatch' as const),
  settlementDate: formatDate(row.settlementDate),
  reconciledBy: '—',
  status: titleCase(row.status),
})

export const mapTaxToRow = (row: FinanceTaxRecord) => ({
  id: row._id,
  recordId: row.taxRecordId,
  entityType: titleCase(row.module),
  entityId: row.partnerId || row.taxRecordId,
  owner: row.partnerId || '—',
  bookingId: row.taxRecordId,
  bookingTitle: row.taxType,
  status: titleCase(row.filingStatus) as 'Completed' | 'Pending' | 'Filed',
  revenue: formatInr(row.taxAmount),
  transactionId: row.paymentId || '—',
  module: titleCase(row.module),
  region: row.region || '—',
  taxType: row.taxType || '—',
  taxRate:
    row.taxRatePercent != null && Number.isFinite(row.taxRatePercent)
      ? `${row.taxRatePercent}%`
      : '—',
  taxAmount: formatInr(row.taxAmount),
  invoiceNumber: row.invoiceNumber || '—',
  filingPeriod: row.filingPeriod || '—',
  filingStatus: titleCase(row.filingStatus),
})

export const mapInvoiceToRow = (row: FinanceInvoice) => ({
  id: row._id,
  invoiceId: row.invoiceNumber,
  clientName: row.clientName || '—',
  amount: formatInr(row.total),
  issueDate: formatDate(row.issuedAt || row.createdAt),
  dueDate: formatDate(row.dueDate),
  description: titleCase(row.module),
  status:
    row.invoiceStatus === 'paid' || row.paymentStatus === 'paid'
      ? ('Paid' as const)
      : row.invoiceStatus === 'cancelled' || row.invoiceStatus === 'void'
        ? ('Overdue' as const)
        : ('Pending' as const),
})

export const mapPaymentToServiceRow = (
  payment: FinancePayment,
  tab: 'all' | 'escrow' | 'by-service' | 'by-consultation' = 'all',
) => {
  const snapshot = payment.moduleSnapshot || {}
  const paid = mapPaymentStatus(payment.status) === 'Paid'
  return {
    id: payment._id,
    tab,
    serviceId: payment.orderId,
    name: (snapshot.title as string) || payment.description || payment.orderId,
    expertName: (snapshot.partnerName as string) || payment.partnerId || '—',
    bookingId: payment.referenceId || payment.orderId,
    userName: (snapshot.userName as string) || payment.userId || '—',
    status: (paid ? 'Paid' : 'Pending') as 'Paid' | 'Pending',
    revenue: formatInr(payment.amount),
  }
}

export const mapEscrowToServiceRow = (escrow: FinanceEscrowHold) => ({
  id: escrow._id,
  tab: 'escrow' as const,
  serviceId: escrow.escrowId,
  name: titleCase(escrow.module),
  expertName: escrow.partnerName || escrow.partnerId || '—',
  bookingId: escrow.referenceId || String(escrow.transactionId || escrow.paymentId),
  userName: escrow.userName || escrow.userId || '—',
  status: (mapEscrowStatus(escrow.status) === 'Released' ? 'Paid' : 'Pending') as
    | 'Paid'
    | 'Pending',
  revenue: formatInr(escrow.amountHeld),
})

export const mapPaymentToVenueRow = (payment: FinancePayment) => {
  const snapshot = (payment.moduleSnapshot || {}) as Record<string, unknown>
  const fulfilled = (payment.fulfillmentResult || {}) as Record<string, unknown>
  const status = mapPaymentStatus(payment.status)
  const venueName =
    (typeof snapshot.venueName === 'string' && snapshot.venueName) ||
    (typeof fulfilled.venueName === 'string' && fulfilled.venueName) ||
    (typeof snapshot.title === 'string' && snapshot.title) ||
    payment.description ||
    'Venue booking'
  return {
    id: payment._id,
    venueId:
      (typeof snapshot.venueId === 'string' && snapshot.venueId) ||
      (typeof fulfilled.venueId === 'string' && fulfilled.venueId) ||
      payment.orderId,
    name: venueName,
    owner:
      (typeof snapshot.partnerName === 'string' && snapshot.partnerName) ||
      payment.partnerId ||
      '—',
    bookingId:
      (typeof fulfilled.bookingId === 'string' && fulfilled.bookingId) ||
      (typeof snapshot.bookingId === 'string' && snapshot.bookingId) ||
      payment.referenceId ||
      payment.orderId,
    bookingTitle:
      (typeof snapshot.title === 'string' && snapshot.title) ||
      titleCase(payment.pricingType || payment.module),
    status: (status === 'Paid' ? 'Completed' : status === 'Failed' ? 'Cancelled' : 'Pending') as
      | 'Completed'
      | 'Pending'
      | 'Cancelled',
    revenue: formatInr(payment.amount),
  }
}

export const mapDashboardSummaryCards = (summary?: FinanceDashboardSummary | null) => {
  if (!summary) return []
  return [
    {
      label: 'Total In Escrow',
      value: formatInr(summary.totalInEscrow),
      change: String(summary.activeEscrows),
      changeType: 'up' as const,
      changeNote: 'active holds',
    },
    {
      label: 'Pending Payout',
      value: formatInr(summary.pendingPayouts),
      change: String(summary.pendingPayoutCount),
      changeType: 'up' as const,
      changeNote: 'pending items',
    },
    {
      label: 'Disputed Amount',
      value: formatInr(summary.disputedAmount),
      change: String(summary.openDisputes),
      changeType: 'up' as const,
      changeNote: 'open disputes',
    },
  ]
}
