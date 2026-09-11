export const FINANCE_VENUES_MODULE_KEY = 'finance-venues'

export type FinanceVenuesTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export const FINANCE_VENUES_TABLE_COLUMNS_CATALOG: FinanceVenuesTableColumnCatalogItem[] = [
  // Existing venue-specific columns (keep visible)
  {
    id: 'venue-id',
    label: 'Venue ID',
    type: 'Text',
    description: 'Unique venue identifier',
    defaultVisible: true,
  },
  {
    id: 'name',
    label: 'Name',
    type: 'Text',
    description: 'Venue name',
    defaultVisible: true,
  },
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
  // Financial Transactions (Excel) — hidden until data exists
  {
    id: 'transaction-id',
    label: 'Transaction ID',
    type: 'Text',
    description: 'Primary transaction reference',
    defaultVisible: false,
  },
  {
    id: 'module',
    label: 'Module',
    type: 'Text',
    description: 'Business vertical',
    defaultVisible: false,
  },
  {
    id: 'related-entity-id',
    label: 'Related Entity ID',
    type: 'Text',
    description: 'Related venue/entity identifier',
    defaultVisible: false,
  },
  {
    id: 'client-id',
    label: 'Client ID',
    type: 'Text',
    description: 'Client identifier',
    defaultVisible: false,
  },
  {
    id: 'client-name',
    label: 'Client Name',
    type: 'Text',
    description: 'Client display name',
    defaultVisible: false,
  },
  {
    id: 'partner-id',
    label: 'Partner ID',
    type: 'Text',
    description: 'Partner identifier',
    defaultVisible: false,
  },
  {
    id: 'partner-name',
    label: 'Partner Name',
    type: 'Text',
    description: 'Partner display name',
    defaultVisible: false,
  },
  {
    id: 'transaction-date',
    label: 'Transaction Date',
    type: 'Date',
    description: 'Transaction timestamp',
    defaultVisible: false,
  },
  {
    id: 'gross-amount',
    label: 'Gross Amount',
    type: 'Currency',
    description: 'Gross transaction amount',
    defaultVisible: false,
  },
  {
    id: 'discount',
    label: 'Discount',
    type: 'Currency',
    description: 'Discount applied',
    defaultVisible: false,
  },
  {
    id: 'tax',
    label: 'Tax',
    type: 'Currency',
    description: 'Tax amount',
    defaultVisible: false,
  },
  {
    id: 'gateway-charges',
    label: 'Gateway Charges',
    type: 'Currency',
    description: 'Payment gateway charges',
    defaultVisible: false,
  },
  {
    id: 'platform-commission-pct',
    label: 'Platform Commission %',
    type: 'Percentage',
    description: 'Platform commission percentage',
    defaultVisible: false,
  },
  {
    id: 'platform-commission',
    label: 'Platform Commission',
    type: 'Currency',
    description: 'Platform commission amount',
    defaultVisible: false,
  },
  {
    id: 'partner-payout',
    label: 'Partner Payout',
    type: 'Currency',
    description: 'Partner payout amount',
    defaultVisible: false,
  },
  {
    id: 'refund-amount',
    label: 'Refund Amount',
    type: 'Currency',
    description: 'Refunded amount',
    defaultVisible: false,
  },
  {
    id: 'net-revenue',
    label: 'Net Revenue',
    type: 'Currency',
    description: 'Net revenue after deductions',
    defaultVisible: false,
  },
  {
    id: 'net-profit',
    label: 'Net Profit',
    type: 'Currency',
    description: 'Net profit',
    defaultVisible: false,
  },
  {
    id: 'payment-method',
    label: 'Payment Method',
    type: 'Text',
    description: 'Payment method',
    defaultVisible: false,
  },
  {
    id: 'gateway',
    label: 'Gateway',
    type: 'Text',
    description: 'Payment gateway',
    defaultVisible: false,
  },
  {
    id: 'transaction-status',
    label: 'Transaction Status',
    type: 'Status',
    description: 'Transaction status',
    defaultVisible: false,
  },
  {
    id: 'settlement-status',
    label: 'Settlement Status',
    type: 'Status',
    description: 'Settlement status',
    defaultVisible: false,
  },
  {
    id: 'settlement-date',
    label: 'Settlement Date',
    type: 'Date',
    description: 'Settlement date',
    defaultVisible: false,
  },
  {
    id: 'invoice-id',
    label: 'Invoice ID',
    type: 'Text',
    description: 'Related invoice identifier',
    defaultVisible: false,
  },
]

export const DEFAULT_FINANCE_VENUES_VISIBLE_COLUMN_IDS =
  FINANCE_VENUES_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )
