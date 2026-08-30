export const FINANCE_TAX_MODULE_KEY = 'finance-tax'

export type FinanceTaxTableColumnCatalogItem = {
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
): FinanceTaxTableColumnCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

export const FINANCE_TAX_TABLE_COLUMNS_CATALOG: FinanceTaxTableColumnCatalogItem[] = [
  col('tax-record-id', 'Tax Record ID', 'Text', 'Unique tax record identifier', true),
  col('transaction-id', 'Transaction ID', 'Text', 'Linked transaction identifier', true),
  col('module', 'Module', 'Text', 'Business vertical', true),
  col('region', 'Region', 'Text', 'Tax jurisdiction / region', true),
  col('tax-type', 'Tax Type', 'Text', 'Tax type (GST/VAT etc.)', true),
  col('tax-rate', 'Tax Rate', 'Percentage', 'Applicable tax rate'),
  col('tax-amount', 'Tax Amount', 'Currency', 'Calculated tax amount', true),
  col('invoice-number', 'Invoice Number', 'Text', 'Related invoice number'),
  col('filing-period', 'Filing Period', 'Text', 'Tax filing period'),
  col('filing-status', 'Filing Status', 'Status', 'Filing or compliance status', true),
]

export const FINANCE_TAX_LEGACY_COLUMN_ID_MAP: Record<string, string> = {
  'record-id': 'tax-record-id',
  status: 'filing-status',
}

export const DEFAULT_FINANCE_TAX_VISIBLE_COLUMN_IDS = FINANCE_TAX_TABLE_COLUMNS_CATALOG.filter(
  (column) => column.defaultVisible,
).map((column) => column.id)
