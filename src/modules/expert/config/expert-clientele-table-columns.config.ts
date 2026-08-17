export type ExpertClienteleTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

/** Expert Clientele table columns — matches the bookings table. */
export const EXPERT_CLIENTELE_TABLE_COLUMNS_CATALOG: ExpertClienteleTableColumnCatalogItem[] = [
  {
    id: 'booking-id',
    label: 'Order / Booking ID',
    type: 'Text',
    description: 'Unique order or booking identifier',
    defaultVisible: true,
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
    label: 'Client Name',
    type: 'Text',
    description: 'Client display name',
    defaultVisible: true,
  },
  {
    id: 'booking-source',
    label: 'Booking Source',
    type: 'Text',
    description: 'Channel or source of the booking',
    defaultVisible: true,
  },
  {
    id: 'listing-type',
    label: 'Listing Type',
    type: 'Text',
    description: 'Service or consultation listing type',
    defaultVisible: true,
  },
  {
    id: 'listing-name',
    label: 'Listing Name',
    type: 'Text',
    description: 'Name of the booked listing',
    defaultVisible: true,
  },
  {
    id: 'booking-status',
    label: 'Booking Status',
    type: 'Status',
    description: 'Current booking status',
    defaultVisible: true,
  },
  {
    id: 'pricing-type',
    label: 'Pricing Type',
    type: 'Text',
    description: 'Pricing model for the booking',
    defaultVisible: true,
  },
  {
    id: 'booking-date',
    label: 'Booking Date',
    type: 'Date',
    description: 'Date the booking was created',
    defaultVisible: true,
  },
  {
    id: 'order-value',
    label: 'Order Value',
    type: 'Currency',
    description: 'Total order or booking value',
    defaultVisible: true,
  },
  {
    id: 'payment-status',
    label: 'Payment Status',
    type: 'Status',
    description: 'Current payment status',
    defaultVisible: true,
  },
  {
    id: 'rating',
    label: 'Rating',
    type: 'Average',
    description: 'Client rating for the booking',
    defaultVisible: true,
  },
]

export const DEFAULT_EXPERT_CLIENTELE_VISIBLE_COLUMN_IDS =
  EXPERT_CLIENTELE_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )
