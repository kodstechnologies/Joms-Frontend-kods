/**
 * Consultation Performance — Bookings table column catalog.
 * Source: JOMS_KODS_Web_Admin_Panel_full_data → Consultation Performance → Bookings Table.
 * Keep ids kebab-case to match Manage Metrics / ui-preferences.
 */

export type ConsultationPerformanceTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

const col = (
  id: string,
  label: string,
  type: string,
  description: string,
  defaultVisible = false,
): ConsultationPerformanceTableColumnCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

export const CONSULTATION_PERFORMANCE_TABLE_COLUMNS_CATALOG: ConsultationPerformanceTableColumnCatalogItem[] =
  [
    col('booking-id', 'Booking ID', 'Text', 'Unique booking identifier', true),
    col('client-id', 'Client ID', 'Text', 'Customer identifier', true),
    col('client-name', 'Client Name', 'Text', 'Customer name', true),
    col('status', 'Status', 'Status', 'Current booking status', true),
    col('client-source', 'Client Source', 'Text', 'Booking origin'),
    col('slot-duration', 'Slot Duration', 'Text', 'Reserved consultation duration', true),
    col('start-time', 'Start Time', 'Date', 'Scheduled start time', true),
    col('end-time', 'End Time', 'Date', 'Scheduled end time'),
    col('booked-at', 'Booked At', 'Date', 'Booking creation timestamp'),
    col('price', 'Price', 'Currency', 'Amount paid', true),
    col('payment-id', 'Payment ID', 'Text', 'Internal payment identifier'),
    col('payment-method', 'Payment Method', 'Text', 'Payment channel'),
    col('transaction-id', 'Transaction ID', 'Text', 'Gateway reference'),
    col('rating', 'Rating', 'Average', 'Client rating'),
    col('payout-status', 'Payout Status', 'Status', 'Expert payout status'),
    col('disputed', 'Disputed', 'Text', 'Booking disputed'),
    col('dispute-period-lapsed', 'Dispute Period Lapsed', 'Text', 'Dispute window expired'),
    col('dispute-end-date', 'Dispute Period End Date', 'Date', 'Last date to raise dispute'),
    col('dispute-raised-at', 'Dispute Raised At', 'Date', 'Dispute timestamp'),
    col('dispute-ticket-id', 'Dispute / Ticket ID', 'Text', 'Linked dispute identifier'),
    col('refund-issued', 'Refund Issued', 'Text', 'Refund processed'),
    col('refund-amount', 'Refund Amount', 'Currency', 'Amount refunded'),
    col('refund-status', 'Refund Status', 'Status', 'Refund workflow'),
    col('refunded-at', 'Refunded At', 'Date', 'Refund completion timestamp'),
    col('follow-up-period', 'Follow-up Period', 'Text', 'Allowed follow-up duration'),
    col('follow-up-completed', 'Follow-up Completed', 'Text', 'Follow-up concluded'),
    col('last-updated-at', 'Last Updated At', 'Date', 'Latest modification'),
    // Product extra shown on current UI
    col('consultation-name', 'Consultation Name', 'Text', 'Consultation listing title'),
  ]

export const DEFAULT_CONSULTATION_PERFORMANCE_VISIBLE_COLUMN_IDS =
  CONSULTATION_PERFORMANCE_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )

export const CONSULTATION_PERFORMANCE_LEGACY_COLUMN_ID_MAP: Record<string, string> = {
  bookingId: 'booking-id',
  clientId: 'client-id',
  clientName: 'client-name',
  name: 'client-name',
  consultationName: 'consultation-name',
  title: 'consultation-name',
  startDate: 'start-time',
  'start-date': 'start-time',
  endDate: 'end-time',
  'end-date': 'end-time',
  slotDuration: 'slot-duration',
  durationLabel: 'slot-duration',
  bookedAt: 'booked-at',
  clientSource: 'client-source',
  paymentId: 'payment-id',
  paymentMethod: 'payment-method',
  transactionId: 'transaction-id',
  payoutStatus: 'payout-status',
  disputePeriodLapsed: 'dispute-period-lapsed',
  disputeEndDate: 'dispute-end-date',
  disputeRaisedAt: 'dispute-raised-at',
  disputeTicketId: 'dispute-ticket-id',
  refundIssued: 'refund-issued',
  refundAmount: 'refund-amount',
  refundStatus: 'refund-status',
  refundedAt: 'refunded-at',
  followUpPeriod: 'follow-up-period',
  followUpCompleted: 'follow-up-completed',
  lastUpdatedAt: 'last-updated-at',
}
