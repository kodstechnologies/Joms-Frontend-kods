export type RevenueOverviewStatus = 'Paid' | 'Pending' | 'Failed'

export type RevenueOverviewRow = {
  id: string
  module: string
  entityType: string
  entityId: string
  entityName: string
  category: string
  ownerType: string
  ownerName: string
  grossAmount: string
  status: RevenueOverviewStatus
}

export type FinanceVenueStatus = 'Completed' | 'Pending' | 'Cancelled'

export type FinanceVenueRow = {
  id: string
  venueId: string
  name: string
  owner: string
  bookingId: string
  bookingTitle: string
  status: FinanceVenueStatus
  revenue: string
}

export type FinanceServiceTab = 'all' | 'escrow' | 'by-service' | 'by-consultation'

export type FinanceServiceStatus = 'Paid' | 'Pending'

export type FinanceServiceRow = {
  id: string
  tab: FinanceServiceTab
  serviceId: string
  name: string
  expertName: string
  bookingId: string
  userName: string
  status: FinanceServiceStatus
  revenue: string
}

export type TaxComplianceStatus = 'Completed' | 'Pending' | 'Filed'

export type TaxComplianceRow = {
  id: string
  recordId: string
  entityType: string
  entityId: string
  owner: string
  bookingId: string
  bookingTitle: string
  status: TaxComplianceStatus
  revenue: string
}

export type ReconciliationDifference = 'Matched' | 'Mismatch' | 'Pending'

export type FinanceReconciliationRow = {
  id: string
  reconciliationId: string
  gateway: string
  transactionId: string
  platformRecordId: string
  gatewayAmount: string
  platformAmount: string
  difference: ReconciliationDifference
}

export type RefundChargebackStatus = 'Resolved' | 'Rejected' | 'Pending' | 'Open' | 'In Review'

export type RefundChargebackType = 'Refund' | 'Dispute'

export type RefundSummaryMetric = {
  label: string
  value: string
  change: string
  changeNote: string
}

export type RefundChargebackRow = {
  id: string
  recordId: string
  type: RefundChargebackType
  kind?: 'dispute' | 'refund'
  relatedEntity: string
  amount: string
  reason: string
  initiatedDate: string
  description: string
  status: RefundChargebackStatus
  rawStatus?: string
}

export type PayoutStatus = 'Completed' | 'Pending' | 'Failed'

export type PayoutRow = {
  id: string
  payoutId: string
  recipient: string
  type: string
  amount: string
  method: string
  initiatedDate: string
  description: string
  status: PayoutStatus
}

export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue'

export type InvoiceRow = {
  id: string
  invoiceId: string
  clientName: string
  amount: string
  issueDate: string
  dueDate: string
  description: string
  status: InvoiceStatus
}

export type FinanceEventStatus = 'Paid' | 'Pending' | 'Refunded'

export type FinanceEventRow = {
  id: string
  eventId: string
  eventName: string
  organizer: string
  ticketSales: string
  platformFee: string
  netRevenue: string
  eventDate: string
  status: FinanceEventStatus
}

export type FinanceCategoryStatus = 'Active' | 'Paused'

export type FinanceCategoryRow = {
  id: string
  categoryName: string
  module: string
  platformFee: string
  commissionRate: string
  taxRate: string
  payoutCycle: string
  status: FinanceCategoryStatus
}

export type MembershipSummaryMetric = {
  label: string
  value: string
  change: string
  changeNote: string
}

export type EscrowManagementTab = 'all' | 'escrow' | 'by-service' | 'by-consultation'

export type EscrowHoldStatus = 'Active' | 'Released' | 'Dispute'

export type EscrowHoldRow = {
  id: string
  tab: EscrowManagementTab
  escrowId: string
  transactionId: string
  type: string
  amount: string
  holdReason: string
  initiatedDate: string
  expectedRelease: string
  status: EscrowHoldStatus
}

export type EscrowBookingRow = {
  id: string
  tab: EscrowManagementTab
  serviceId: string
  name: string
  expertName: string
  bookingId: string
  userName: string
  status: 'Paid' | 'Pending'
  revenue: string
}
