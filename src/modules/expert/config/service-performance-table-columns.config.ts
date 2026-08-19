export type ServicePerformanceTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

/** Orders table columns for a single service listing. */
export const SERVICE_PERFORMANCE_TABLE_COLUMNS_CATALOG: ServicePerformanceTableColumnCatalogItem[] =
  [
    {
      id: 'order-id',
      label: 'Order ID',
      type: 'Text',
      description: 'Unique order or project identifier',
      defaultVisible: false,
    },
    {
      id: 'client-id',
      label: 'Client ID',
      type: 'Text',
      description: 'Unique client identifier',
      defaultVisible: true,
    },
    {
      id: 'client-name',
      label: 'Name',
      type: 'Text',
      description: 'Client display name',
      defaultVisible: true,
    },
    {
      id: 'listing-type',
      label: 'Listing Type',
      type: 'Text',
      description: 'Service or custom listing type',
      defaultVisible: true,
    },
    {
      id: 'order-status',
      label: 'Status',
      type: 'Status',
      description: 'Current order status',
      defaultVisible: true,
    },
    {
      id: 'pricing-type',
      label: 'Pricing Type',
      type: 'Text',
      description: 'Fixed, tiered, custom or milestone',
      defaultVisible: true,
    },
    {
      id: 'start-date',
      label: 'Start Date',
      type: 'Date',
      description: 'Date work started',
      defaultVisible: true,
    },
    {
      id: 'end-date',
      label: 'End Date',
      type: 'Date',
      description: 'Date work ended',
      defaultVisible: true,
    },
    {
      id: 'price',
      label: 'Price',
      type: 'Currency',
      description: 'Order value',
      defaultVisible: true,
    },
    {
      id: 'payment-id',
      label: 'Payment ID',
      type: 'Text',
      description: 'Payment record identifier',
      defaultVisible: false,
    },
    {
      id: 'payment-method',
      label: 'Payment Method',
      type: 'Text',
      description: 'Method used to pay',
      defaultVisible: false,
    },
    {
      id: 'transaction-id',
      label: 'Transaction ID',
      type: 'Text',
      description: 'Gateway transaction reference',
      defaultVisible: false,
    },
    {
      id: 'rating',
      label: 'Rating',
      type: 'Average',
      description: 'Client rating for this order',
      defaultVisible: false,
    },
    {
      id: 'payout-status',
      label: 'Payout Status',
      type: 'Status',
      description: 'Expert payout status',
      defaultVisible: false,
    },
    {
      id: 'disputed',
      label: 'Disputed',
      type: 'Text',
      description: 'Whether a dispute was raised',
      defaultVisible: false,
    },
    {
      id: 'dispute-period-lapsed',
      label: 'Dispute Period Lapsed',
      type: 'Text',
      description: 'Whether the dispute window has closed',
      defaultVisible: false,
    },
    {
      id: 'dispute-end-date',
      label: 'Dispute End Date',
      type: 'Date',
      description: 'End of the dispute window',
      defaultVisible: false,
    },
    {
      id: 'dispute-raised-at',
      label: 'Dispute Raised At',
      type: 'Date',
      description: 'When the dispute was raised',
      defaultVisible: false,
    },
    {
      id: 'dispute-ticket-id',
      label: 'Dispute / Ticket ID',
      type: 'Text',
      description: 'Linked dispute or support ticket',
      defaultVisible: false,
    },
    {
      id: 'refund-issued',
      label: 'Refund Issued',
      type: 'Text',
      description: 'Whether a refund was issued',
      defaultVisible: false,
    },
    {
      id: 'refund-amount',
      label: 'Refund Amount',
      type: 'Currency',
      description: 'Total amount refunded',
      defaultVisible: false,
    },
    {
      id: 'refund-status',
      label: 'Refund Status',
      type: 'Status',
      description: 'Current refund status',
      defaultVisible: false,
    },
    {
      id: 'refunded-at',
      label: 'Refunded At',
      type: 'Date',
      description: 'Date the refund was processed',
      defaultVisible: false,
    },
  ]

export const DEFAULT_SERVICE_PERFORMANCE_VISIBLE_COLUMN_IDS =
  SERVICE_PERFORMANCE_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )
