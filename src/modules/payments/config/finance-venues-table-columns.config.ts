export const FINANCE_VENUES_MODULE_KEY = 'finance-venues'

export type FinanceVenuesTableColumnCatalogItem = {
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
): FinanceVenuesTableColumnCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

export const FINANCE_VENUES_TABLE_COLUMNS_CATALOG: FinanceVenuesTableColumnCatalogItem[] = [
  // Existing venue-specific columns (keep visible)
  col('venue-id', 'Venue ID', 'Text', 'Unique venue identifier', true),
  col('name', 'Name', 'Text', 'Venue name', true),
  col('owner', 'Owner', 'Text', 'Venue owner name', true),
  col('booking-id', 'Booking ID', 'Text', 'Booking reference identifier', true),
  col('booking-title', 'Booking Title', 'Text', 'Booking title or event name', true),
  col('status', 'Status', 'Status', 'Booking or payment status', true),
  col('revenue', 'Revenue', 'Currency', 'Revenue amount', true),
  // Financial Transactions (Excel) — hidden until data exists
  col('transaction-id', 'Transaction ID', 'Text', 'Primary transaction reference'),
  col('module', 'Module', 'Text', 'Business vertical'),
  col('related-entity-id', 'Related Entity ID', 'Text', 'Related venue/entity identifier'),
  col('client-id', 'Client ID', 'Text', 'Client identifier'),
  col('client-name', 'Client Name', 'Text', 'Client display name'),
  col('partner-id', 'Partner ID', 'Text', 'Partner identifier'),
  col('partner-name', 'Partner Name', 'Text', 'Partner display name'),
  col('transaction-date', 'Transaction Date', 'Date', 'Transaction timestamp'),
  col('gross-amount', 'Gross Amount', 'Currency', 'Gross transaction amount'),
  col('discount', 'Discount', 'Currency', 'Discount applied'),
  col('tax', 'Tax', 'Currency', 'Tax amount'),
  col('gateway-charges', 'Gateway Charges', 'Currency', 'Payment gateway charges'),
  col(
    'platform-commission-pct',
    'Platform Commission %',
    'Percentage',
    'Platform commission percentage',
  ),
  col('platform-commission', 'Platform Commission', 'Currency', 'Platform commission amount'),
  col('partner-payout', 'Partner Payout', 'Currency', 'Partner payout amount'),
  col('refund-amount', 'Refund Amount', 'Currency', 'Refunded amount'),
  col('net-revenue', 'Net Revenue', 'Currency', 'Net revenue after deductions'),
  col('net-profit', 'Net Profit', 'Currency', 'Net profit'),
  col('payment-method', 'Payment Method', 'Text', 'Payment method'),
  col('gateway', 'Gateway', 'Text', 'Payment gateway'),
  col('transaction-status', 'Transaction Status', 'Status', 'Transaction status'),
  col('settlement-status', 'Settlement Status', 'Status', 'Settlement status'),
  col('settlement-date', 'Settlement Date', 'Date', 'Settlement date'),
  col('invoice-id', 'Invoice ID', 'Text', 'Related invoice identifier'),
]

export const DEFAULT_FINANCE_VENUES_VISIBLE_COLUMN_IDS =
  FINANCE_VENUES_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )
