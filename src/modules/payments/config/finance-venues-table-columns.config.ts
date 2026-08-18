export const FINANCE_VENUES_MODULE_KEY = 'finance-venues'

export type FinanceVenuesTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export const FINANCE_VENUES_TABLE_COLUMNS_CATALOG: FinanceVenuesTableColumnCatalogItem[] = [
  {
    id: 'venue-id',
    label: 'Venue ID',
    type: 'Text',
    description: 'Unique venue identifier',
    defaultVisible: true,
  },
  { id: 'name', label: 'Name', type: 'Text', description: 'Venue name', defaultVisible: true },
  {
    id: 'owner',
    label: 'Owner',
    type: 'Text',
    description: 'Venue owner name',
    defaultVisible: true,
  },
  {
    id: 'booking-id',
    label: 'Booking ID',
    type: 'Text',
    description: 'Booking reference identifier',
    defaultVisible: true,
  },
  {
    id: 'booking-title',
    label: 'Booking Title',
    type: 'Text',
    description: 'Booking title or event name',
    defaultVisible: true,
  },
  {
    id: 'status',
    label: 'Status',
    type: 'Status',
    description: 'Booking or payment status',
    defaultVisible: true,
  },
  {
    id: 'revenue',
    label: 'Revenue',
    type: 'Currency',
    description: 'Revenue amount',
    defaultVisible: true,
  },
]

export const DEFAULT_FINANCE_VENUES_VISIBLE_COLUMN_IDS =
  FINANCE_VENUES_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )
