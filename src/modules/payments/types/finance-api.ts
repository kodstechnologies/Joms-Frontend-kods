export type ApiSuccess<T> = {
  success: boolean
  message?: string
  data: T
}

export type ListMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type Paginated<T> = {
  rows: T[]
  meta: ListMeta
}

export type FinanceDashboardSummary = {
  totalInEscrow: number
  activeEscrows: number
  pendingPayouts: number
  pendingPayoutCount: number
  disputedAmount: number
  openDisputes: number
  totalPlatformRevenue: number
  collectionsThisMonth: number
  gmv?: number
}

export type FinancePayment = {
  _id: string
  orderId: string
  module: string
  amount: number
  currency?: string
  status: string
  pricingType?: string | null
  partnerId?: string | null
  userId?: string
  userType?: string
  direction?: string
  referenceType?: string | null
  referenceId?: string | null
  description?: string | null
  paymentMethod?: string | null
  moduleData?: Record<string, unknown> | null
  moduleSnapshot?: Record<string, unknown> | null
  fulfillmentResult?: Record<string, unknown> | null
  linkedPayout?: {
    payoutId: string
    status?: string | null
    paidAt?: string | null
    scheduledAt?: string | null
    initiatedAt?: string | null
  } | null
  linkedEscrow?: {
    escrowId?: string | null
    status?: string | null
    heldAt?: string | null
    releasedAt?: string | null
    expectedReleaseAt?: string | null
  } | null
  razorpayOrderId?: string | null
  razorpayPaymentId?: string | null
  gatewayAmount?: number | null
  platformReceivedAmount?: number | null
  settlementStatus?: string | null
  complianceStatus?: string | null
  refundAmount?: number | null
  discountAmount?: number | null
  taxAmount?: number | null
  netRevenue?: number | null
  platformCommission?: number | null
  platformCommissionPercent?: number | null
  gatewayCharges?: number | null
  partnerPayout?: number | null
  netProfit?: number | null
  invoiceNumber?: string | null
  settlementDate?: string | null
  createdAt?: string
  updatedAt?: string
}

export type FinanceEscrowHold = {
  _id: string
  escrowId: string
  paymentId: string
  partnerId: string
  userId: string
  partnerName?: string | null
  userName?: string | null
  transactionId?: string | null
  paymentOrderId?: string | null
  module: string
  pricingType: 'custom' | 'milestone'
  amountHeld: number
  currency?: string
  holdReason?: string
  platformFee?: number
  releaseAmount?: number
  status: string
  heldAt?: string
  expectedReleaseAt?: string | null
  releasedAt?: string | null
  referenceType?: string
  referenceId?: string
  createdAt?: string
  invoiceId?: string | null
  invoiceNumber?: string | null
  invoicePdfUrl?: string | null
}

export type FinancePayout = {
  _id: string
  payoutId: string
  partnerId: string
  partnerName?: string
  payeeType?: string
  module: string
  pricingType: string
  settlementPath?: string
  paymentId?: string | null
  referenceId?: string | null
  relatedTransaction?: string | null
  fees: {
    grossAmount: number
    platformCommission?: number
    gatewayCharges?: number
    taxGst?: number
    taxTds?: number
    refundAdjustments?: number
    netPayable: number
    currency?: string
  }
  bankingSnapshot?: {
    beneficiaryName?: string | null
    bankName?: string | null
    bankReference?: string | null
    accountNumber?: string | null
    accountNumberMasked?: string | null
    ifscCode?: string | null
  }
  status: string
  scheduledAt?: string
  initiatedAt?: string | null
  paidAt?: string | null
  failedAt?: string | null
  failureReason?: string | null
  financeApproverId?: string | null
  releasedByAdminId?: string | null
  createdAt?: string
}

export type FinanceDispute = {
  _id: string
  disputeId: string
  caseType: string
  module: string
  originalAmount: number
  maxRefundableAmount?: number
  refundedAmount?: number
  reason?: string
  summary?: string
  status: string
  decision?: string | null
  decisionReason?: string | null
  partnerId?: string | null
  userId?: string | null
  raisedBy?: string
  source?: string
  paymentId?: string | null
  razorpayDisputeId?: string | null
  razorpayPaymentId?: string | null
  phase?: string | null
  gatewayStatus?: string | null
  respondBy?: string | null
  amountDeducted?: number
  referenceId?: string | null
  adminNote?: string | null
  adminNotes?: string | null
  supportNote?: string | null
  priority?: string | null
  evidence?: Array<{ type?: string; url?: string; label?: string; uploadedAt?: string }>
  createdAt?: string
  updatedAt?: string
}

export type FinanceRefund = {
  _id: string
  refundId: string
  module: string
  amount: number
  reason?: string
  status: string
  refundType?: string
  paymentId?: string
  partnerId?: string | null
  beneficiary?: string
  razorpayPaymentId?: string | null
  razorpayRefundId?: string | null
  gatewayStatus?: string | null
  chargebackFlag?: boolean
  refundMode?: string | null
  adminNote?: string
  initiatedBy?: string | null
  createdAt?: string
}

export type FinanceReconciliation = {
  _id: string
  recordId: string
  gateway?: string
  paymentId: string
  gatewayAmount: number
  platformReceivedAmount: number
  differenceAmount: number
  status: string
  module?: string
  pricingType?: string | null
  gatewayReference?: string | null
  razorpaySettlementId?: string | null
  settlementDate?: string | null
  currency?: string
  createdAt?: string
  updatedAt?: string
}

export type FinanceTaxRecord = {
  _id: string
  taxRecordId: string
  module: string
  taxType: string
  taxAmount: number
  taxableAmount: number
  filingStatus: string
  partnerId?: string | null
  userId?: string | null
  region?: string
  taxRatePercent?: number | null
  invoiceNumber?: string | null
  filingPeriod?: string | null
  currency?: string
  paymentId?: string
  filedAt?: string | null
  filedByAdminId?: string | null
  createdAt?: string
}

export type FinanceInvoice = {
  _id: string
  invoiceNumber: string
  clientName?: string
  clientEmail?: string | null
  module: string
  total: number
  subtotal?: number
  taxAmount?: number
  platformFee?: number
  invoiceStatus: string
  paymentStatus?: string
  issuedAt?: string
  dueDate?: string | null
  direction?: string
  partnerId?: string | null
  userId?: string | null
  lineItems?: Array<{ label: string; amount: number }>
  createdAt?: string
}

export type FinanceAdminNote = {
  _id: string
  actionId?: string
  resourceType?: string
  resourceId?: string
  action?: string
  adminId?: string
  adminNote: string
  escalateToAdminId?: string | null
  priority?: string | null
  payload?: Record<string, unknown> | null
  createdAt?: string
}

export function financeEscalateAssigneeName(note?: FinanceAdminNote | null): string {
  if (!note) return ''
  const fromPayload = note.payload?.escalateToAdminName
  if (typeof fromPayload === 'string' && fromPayload.trim()) return fromPayload.trim()
  return ''
}

export type FinanceListParams = {
  module?: string
  status?: string
  pricingType?: string
  caseType?: string
  taxType?: string
  filingStatus?: string
  invoiceStatus?: string
  direction?: string
  partnerId?: string
  page?: number
  limit?: number
  search?: string
  entityType?: string
  entityId?: string
  entityName?: string
  category?: string
  ownerType?: string
  ownerName?: string
  userType?: string
  paymentMethod?: string
  settlementStatus?: string
  fulfillmentStatus?: string
  payerType?: string
  amountMin?: string
  amountMax?: string
  createdAtFrom?: string
  createdAtTo?: string
  [key: string]: unknown
}
