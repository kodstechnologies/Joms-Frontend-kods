/** Keep ids kebab-case to match Manage Metrics / ui-preferences. */

export type ServicePerformanceTableColumnCatalogItem = {
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
): ServicePerformanceTableColumnCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

export const SERVICE_PERFORMANCE_TABLE_COLUMNS_CATALOG: ServicePerformanceTableColumnCatalogItem[] =
  [
    col('order-id', 'Order ID', 'Text', 'Unique order identifier', true),
    col('client-id', 'Client ID', 'Text', 'Customer identifier', true),
    col('client-name', 'Client Name', 'Text', 'Customer name', true),
    col('client-source', 'Client Source', 'Text', 'Order origin'),
    col('client-phone', 'Client Phone Number', 'Text', 'Registered contact number'),
    col('order-status', 'Order Status', 'Status', 'Current workflow status', true),
    col('ordered-at', 'Ordered At', 'Date', 'Order creation timestamp', true),
    col('start-date', 'Start Date', 'Date', 'Service start date'),
    col('end-date', 'End Date', 'Date', 'Service completion date'),
    col('delivery-duration', 'Delivery Duration', 'Text', 'Total fulfillment time'),
    col('price', 'Price', 'Currency', 'Final amount paid', true),
    col('payment-id', 'Payment ID', 'Text', 'Internal payment identifier'),
    col('payment-method', 'Payment Method', 'Text', 'Payment channel'),
    col('transaction-id', 'Transaction ID', 'Text', 'Gateway reference'),
    col('rating', 'Rating', 'Average', 'Customer rating', true),
    col('payout-status', 'Payout Status', 'Status', 'Expert payout state', true),
    col('disputed', 'Disputed', 'Text', 'Whether order is disputed'),
    col('dispute-period-lapsed', 'Dispute Period Lapsed', 'Text', 'Dispute window expired'),
    col('dispute-end-date', 'Dispute Period End Date', 'Date', 'Last date to raise dispute'),
    col('dispute-raised-at', 'Dispute Raised At', 'Date', 'Timestamp of dispute'),
    col('dispute-ticket-id', 'Dispute / Ticket ID', 'Text', 'Linked dispute identifier'),
    col('refund-issued', 'Refund Issued', 'Text', 'Refund processed'),
    col('refund-amount', 'Refund Amount', 'Currency', 'Amount refunded'),
    col('refund-status', 'Refund Status', 'Status', 'Refund workflow'),
    col('refunded-at', 'Refunded At', 'Date', 'Refund completion timestamp'),
    // Product extras (not in Excel Orders Table)
    col('listing-type', 'Listing Type', 'Text', 'Service or custom listing type'),
    col('pricing-type', 'Pricing Type', 'Text', 'Fixed, tiered, custom or milestone'),
  ]

export const DEFAULT_SERVICE_PERFORMANCE_VISIBLE_COLUMN_IDS =
  SERVICE_PERFORMANCE_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )

/** Maps legacy preference ids → current catalog ids. */
export const SERVICE_PERFORMANCE_LEGACY_COLUMN_ID_MAP: Record<string, string> = {
  orderId: 'order-id',
  clientId: 'client-id',
  clientName: 'client-name',
  name: 'client-name',
  listingType: 'listing-type',
  orderStatus: 'order-status',
  status: 'order-status',
  pricingType: 'pricing-type',
  clientSource: 'client-source',
  clientPhone: 'client-phone',
  orderedAt: 'ordered-at',
  startDate: 'start-date',
  endDate: 'end-date',
  deliveryDuration: 'delivery-duration',
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
}
