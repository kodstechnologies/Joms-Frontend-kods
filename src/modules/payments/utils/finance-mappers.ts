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

export { apiErrorMessage } from '@/shared/lib/api-error'

export const formatInr = (amount?: number | null) => {
  const value = Number(amount) || 0
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

export const firstDate = (...values: unknown[]): string | null => {
  for (const value of values) {
    if (value == null || value === '') continue
    const date = new Date(value as string | number | Date)
    if (!Number.isNaN(date.getTime())) return date.toISOString()
  }
  return null
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

export { formatDateTimeEnInFinance as formatDateTime } from '@/shared/lib/format-datetime'

export const formatLongDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const titleCase = (value?: string | null) => {
  if (!value) return '—'
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const PRICING_TYPE_SUFFIX = /\s*\((fixed|tiered|custom|milestone)\)\s*$/i

export const displayServiceTitle = (value?: string | null) => {
  if (!value) return ''
  const cleaned = String(value).replace(PRICING_TYPE_SUFFIX, '').trim()
  return cleaned || String(value)
}

export const formatServiceTypeLabel = (pricingType?: string | null) => {
  if (!pricingType) return '—'
  const fromSuffix = String(pricingType).match(PRICING_TYPE_SUFFIX)?.[1]
  const label = titleCase(fromSuffix || pricingType)
  return /service$/i.test(label) ? label : `${label} Service`
}

export const mapPaymentStatus = (status: string) => {
  if (status === 'paid' || status === 'fulfilled') return 'Paid' as const
  if (status === 'failed' || status === 'expired') return 'Failed' as const
  return 'Pending' as const
}

const firstNonEmpty = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

export const needsPartnerDisplayName = (payment: FinancePayment, snapshotName?: string | null) => {
  const partnerId = firstNonEmpty(payment.partnerId, payment.moduleSnapshot?.partnerId)
  const name = firstNonEmpty(snapshotName, payment.moduleSnapshot?.partnerName)
  if (!partnerId) return false
  if (!name) return true
  if (name === partnerId) return true
  if (name === payment.userId) return true
  return false
}

const roundMoney = (value: unknown) => Math.round((Number(value) || 0) * 100) / 100
const moneyNumber = (value: unknown, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export const derivePaymentMoneyFields = (payment: FinancePayment) => {
  const snapshot = payment.moduleSnapshot || {}
  const moduleData = payment.moduleData || {}
  const gross = roundMoney(payment.amount)
  const discounts = roundMoney(
    payment.discountAmount ??
      snapshot.discountAmount ??
      snapshot.discounts ??
      moduleData.discountAmount ??
      moduleData.discounts,
  )
  const refundAmount = roundMoney(
    payment.refundAmount ?? snapshot.refundAmount ?? snapshot.refunds ?? moduleData.refundAmount,
  )
  const afterDiscounts = roundMoney(gross - discounts)
  const afterRefunds = roundMoney(afterDiscounts - refundAmount)
  const gstRate = moneyNumber(snapshot.taxRate ?? snapshot.taxRateApplied, 18)
  const taxAmount = roundMoney(
    payment.taxAmount ?? snapshot.taxAmount ?? (afterRefunds * gstRate) / 100,
  )
  const isVenue = payment.module === 'venue' || Boolean(snapshot.venueId)
  const isReceivable = payment.direction === 'receivable' || payment.module === 'membership'
  const commissionPct = moneyNumber(
    payment.platformCommissionPercent ?? snapshot.platformCommissionPercent,
    isReceivable ? 0 : isVenue ? 20 : 10,
  )
  const gatewayPct = moneyNumber(snapshot.convenienceFeePercent, 2)
  const platformCommission = roundMoney(
    payment.platformCommission ?? (afterRefunds * commissionPct) / 100,
  )
  const gatewayCharges = roundMoney(
    payment.gatewayCharges ??
      snapshot.gatewayFee ??
      snapshot.convenienceFee ??
      (gross * gatewayPct) / 100,
  )
  const partnerPayout = isReceivable
    ? 0
    : roundMoney(payment.partnerPayout ?? afterRefunds - platformCommission)
  const netRevenue = payment.netRevenue != null ? roundMoney(payment.netRevenue) : afterRefunds
  const netProfit =
    payment.netProfit != null
      ? roundMoney(payment.netProfit)
      : roundMoney(platformCommission - gatewayCharges)

  return {
    discounts,
    refundAmount,
    taxAmount,
    netRevenue,
    platformCommission,
    platformCommissionPercent: commissionPct,
    gatewayCharges,
    partnerPayout,
    netProfit,
  }
}

const formatPct = (value: number) => `${Number(value || 0).toFixed(value % 1 === 0 ? 0 : 2)}%`
const gatewayLabel = (payment: FinancePayment) => {
  const method = String(payment.paymentMethod || '').toUpperCase()
  if (method === 'DUMMY') return 'Dummy'
  if (method.includes('RAZOR') || payment.razorpayPaymentId) return 'Razorpay'
  return method || 'Razorpay'
}

export const mapPaymentToRevenueRow = (
  payment: FinancePayment,
  partnerNameMap?: Record<string, string> | null,
) => {
  const snapshot = payment.moduleSnapshot || {}
  const partnerId = firstNonEmpty(payment.partnerId, snapshot.partnerId)
  const snapshotPartnerName = firstNonEmpty(snapshot.partnerName, payment.moduleData?.partnerName)
  const lookedUp = partnerId && partnerNameMap ? firstNonEmpty(partnerNameMap[partnerId]) : null
  const ownerName =
    (snapshotPartnerName &&
    snapshotPartnerName !== partnerId &&
    snapshotPartnerName !== payment.userId
      ? snapshotPartnerName
      : null) ||
    lookedUp ||
    snapshotPartnerName ||
    partnerId ||
    payment.userId ||
    '—'
  const money = derivePaymentMoneyFields(payment)

  return {
    id: payment._id,
    transactionId: payment.orderId || payment.razorpayPaymentId || payment._id,
    module: titleCase(payment.module),
    entityType: titleCase(payment.pricingType || payment.referenceType || payment.module),
    entityId: payment.referenceId || payment.orderId,
    entityName: (snapshot.title as string) || payment.description || payment.orderId,
    category: (snapshot.category as string) || titleCase(payment.module),
    subCategory:
      firstNonEmpty(snapshot.subCategory, snapshot.subcategory, snapshot.serviceSubCategory) || '—',
    ownerType: payment.userType === 'partner' ? 'Expert' : titleCase(payment.userType),
    ownerName,
    partnerId: partnerId || undefined,
    grossAmount: formatInr(payment.amount),
    discounts: formatInr(money.discounts),
    refundAmount: formatInr(money.refundAmount),
    taxAmount: formatInr(money.taxAmount),
    netRevenue: formatInr(money.netRevenue),
    platformCommission: formatInr(money.platformCommission),
    netProfit: formatInr(money.netProfit),
    status: mapPaymentStatus(payment.status),
    settlementStatus: payment.settlementStatus ? titleCase(payment.settlementStatus) : 'Pending',
    complianceStatus: payment.complianceStatus ? titleCase(payment.complianceStatus) : '—',
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

export const mapPayeeType = (value?: string | null) => {
  if (value === 'venue_partner') return 'Venue Partner'
  if (value === 'expert') return 'Expert'
  if (value === 'organisation') return 'Organisation'
  return titleCase(value)
}

export const mapPayoutStatus = (status: string) => {
  if (status === 'paid') return 'Paid' as const
  if (status === 'failed') return 'Failed' as const
  if (status === 'processing') return 'Processing' as const
  if (status === 'paused_dispute') return 'On Hold' as const
  if (status === 'cancelled') return 'Cancelled' as const
  return 'Pending' as const
}

export const canReleasePayout = (status?: string | null) =>
  ['scheduled', 'pending_approval', 'failed'].includes(String(status || ''))

export const mapPayoutToRow = (payout: FinancePayout) => ({
  id: payout._id,
  payoutId: payout.payoutId,
  recipient: payout.partnerName || payout.partnerId || '—',
  type: titleCase(payout.module || 'payout'),
  amount: formatInr(payout.fees?.netPayable ?? payout.fees?.grossAmount),
  method: payout.bankingSnapshot?.bankReference || payout.settlementPath || 'Bank Transfer',
  initiatedDate: formatDate(payout.scheduledAt || payout.createdAt),
  description: `${titleCase(payout.pricingType || 'payout')} · ${titleCase(payout.status)}`,
  status:
    payout.status === 'paid'
      ? ('Completed' as const)
      : payout.status === 'failed'
        ? ('Failed' as const)
        : ('Pending' as const),
})

export const mapPayoutToAdminRow = (payout: FinancePayout) => {
  const fees = payout.fees || {}
  const taxDeduction = (Number(fees.taxGst) || 0) + (Number(fees.taxTds) || 0)
  return {
    id: payout._id,
    payoutId: payout.payoutId,
    payeeId: payout.partnerId || '—',
    payeeName: payout.partnerName || payout.partnerId || '—',
    payeeType: mapPayeeType(payout.payeeType),
    relatedTransaction:
      payout.relatedTransaction || payout.referenceId || String(payout.paymentId || '—'),
    grossAmount: formatInr(fees.grossAmount),
    platformCommission: formatInr(fees.platformCommission),
    taxDeduction: formatInr(taxDeduction),
    gatewayCharges: formatInr(fees.gatewayCharges),
    netPayout: formatInr(fees.netPayable ?? fees.grossAmount),
    currency: fees.currency || 'INR',
    bankReference: payout.bankingSnapshot?.bankReference || '—',
    scheduledDate: formatDate(payout.scheduledAt || payout.createdAt),
    processedDate: formatDate(payout.paidAt),
    financeApprover: payout.financeApproverId || payout.releasedByAdminId || '—',
    status: mapPayoutStatus(payout.status),
    rawStatus: payout.status,
  }
}

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
  amountValue: Number(dispute.originalAmount) || 0,
  reason: dispute.reason || dispute.summary || '—',
  initiatedDate: formatDate(dispute.createdAt),
  description: dispute.summary || dispute.reason || '—',
  status: mapDisputeStatus(dispute.status),
  rawStatus: dispute.status,
  transactionId: dispute.paymentId || '—',
  paymentId: dispute.paymentId || undefined,
  partnerId: dispute.partnerId || undefined,
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
  amountValue: Number(refund.amount) || 0,
  reason: refund.reason || '—',
  initiatedDate: formatDate(refund.createdAt),
  description: titleCase(refund.refundType),
  status: mapRefundStatus(refund.status),
  rawStatus: refund.status,
  transactionId: refund.paymentId || '—',
  paymentId: refund.paymentId || undefined,
  partnerId: refund.partnerId || undefined,
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
  const money = derivePaymentMoneyFields(payment)
  return {
    id: payment._id,
    tab,
    serviceId: payment.orderId,
    name: displayServiceTitle((snapshot.title as string) || payment.description) || payment.orderId,
    expertName: (snapshot.partnerName as string) || payment.partnerId || '—',
    bookingId: payment.referenceId || payment.orderId,
    userName:
      firstNonEmpty(snapshot.userName, snapshot.clientName, snapshot.username) ||
      payment.userId ||
      '—',
    status: (paid ? 'Paid' : 'Pending') as 'Paid' | 'Pending',
    revenue: formatInr(payment.amount),
    transactionId: payment.orderId || payment.razorpayPaymentId || payment._id,
    module: titleCase(payment.module),
    clientId: payment.userId || '—',
    partnerId: payment.partnerId || firstNonEmpty(snapshot.partnerId) || '—',
    transactionDate: formatDate(payment.createdAt),
    discount: formatInr(money.discounts),
    tax: formatInr(money.taxAmount),
    gatewayCharges: formatInr(money.gatewayCharges),
    platformCommissionPct: formatPct(money.platformCommissionPercent),
    platformCommission: formatInr(money.platformCommission),
    partnerPayout: formatInr(money.partnerPayout),
    refundAmount: formatInr(money.refundAmount),
    netRevenue: formatInr(money.netRevenue),
    netProfit: formatInr(money.netProfit),
    paymentMethod: payment.paymentMethod ? titleCase(payment.paymentMethod) : '—',
    gateway: gatewayLabel(payment),
    settlementStatus: payment.settlementStatus ? titleCase(payment.settlementStatus) : 'Pending',
    settlementDate: formatDate(payment.settlementDate),
    invoiceId: payment.invoiceNumber || '—',
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
  transactionId: String(escrow.transactionId || escrow.paymentOrderId || escrow.paymentId || '—'),
  module: titleCase(escrow.module),
  clientId: escrow.userId || '—',
  partnerId: escrow.partnerId || '—',
  transactionDate: formatDate(escrow.heldAt || escrow.createdAt),
  discount: '—',
  tax: '—',
  gatewayCharges: '—',
  platformCommissionPct: '—',
  platformCommission: formatInr(escrow.platformFee),
  partnerPayout: '—',
  refundAmount: '—',
  netRevenue: formatInr(escrow.amountHeld),
  netProfit: '—',
  paymentMethod: '—',
  gateway: '—',
  settlementStatus: mapEscrowStatus(escrow.status),
  settlementDate: formatDate(escrow.releasedAt),
  invoiceId: '—',
})

export const mapPaymentToVenueRow = (payment: FinancePayment) => {
  const snapshot = (payment.moduleSnapshot || {}) as Record<string, unknown>
  const fulfilled = (payment.fulfillmentResult || {}) as Record<string, unknown>
  const status = mapPaymentStatus(payment.status)
  const money = derivePaymentMoneyFields(payment)
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
    transactionId: payment.orderId || payment.razorpayPaymentId || payment._id,
    module: titleCase(payment.module),
    clientId: payment.userId || firstNonEmpty(snapshot.userId) || '—',
    clientName:
      firstNonEmpty(snapshot.userName, snapshot.clientName, snapshot.username) ||
      payment.userId ||
      '—',
    partnerId: payment.partnerId || firstNonEmpty(snapshot.partnerId) || '—',
    transactionDate: formatDate(payment.createdAt),
    discount: formatInr(money.discounts),
    tax: formatInr(money.taxAmount),
    gatewayCharges: formatInr(money.gatewayCharges),
    platformCommissionPct: formatPct(money.platformCommissionPercent),
    platformCommission: formatInr(money.platformCommission),
    partnerPayout: formatInr(money.partnerPayout),
    refundAmount: formatInr(money.refundAmount),
    netRevenue: formatInr(money.netRevenue),
    netProfit: formatInr(money.netProfit),
    paymentMethod: payment.paymentMethod ? titleCase(payment.paymentMethod) : '—',
    gateway: gatewayLabel(payment),
    settlementStatus: payment.settlementStatus ? titleCase(payment.settlementStatus) : 'Pending',
    settlementDate: formatDate(payment.settlementDate),
    invoiceId: payment.invoiceNumber || '—',
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
