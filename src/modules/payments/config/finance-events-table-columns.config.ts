export const FINANCE_EVENTS_MODULE_KEY = 'finance-events'

export type FinanceEventsTableColumnCatalogItem = {
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
): FinanceEventsTableColumnCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

export const FINANCE_EVENTS_TABLE_COLUMNS_CATALOG: FinanceEventsTableColumnCatalogItem[] = [
  col('promotion-id', 'Promotion ID', 'Text', 'Unique promotion identifier', true),
  col('module', 'Module', 'Text', 'Business vertical', true),
  col('promotion-type', 'Promotion Type', 'Text', 'Type of promotion', true),
  col('entity-name', 'Entity Name', 'Text', 'Promoted entity name', true),
  col('start-date', 'Start Date', 'Date', 'Promotion start date', true),
  col('end-date', 'End Date', 'Date', 'Promotion end date'),
  col('amount-paid', 'Amount Paid', 'Currency', 'Amount paid for promotion', true),
  col('payment-method', 'Payment Method', 'Text', 'Payment method'),
  col('revenue', 'Revenue', 'Currency', 'Promotion revenue', true),
  col('status', 'Status', 'Status', 'Promotion payment status', true),
]

export const FINANCE_EVENTS_LEGACY_COLUMN_ID_MAP: Record<string, string> = {
  'event-id': 'promotion-id',
  'event-name': 'entity-name',
  'event-date': 'start-date',
  'ticket-sales': 'amount-paid',
  'net-revenue': 'revenue',
}

export const DEFAULT_FINANCE_EVENTS_VISIBLE_COLUMN_IDS =
  FINANCE_EVENTS_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )
