/**
 * Finance Revenue Overview — table column catalog.
 * Source: JOMS Excel → Finance Management → Revenue Overview Table (20 cols).
 */

export const FINANCE_REVENUE_MODULE_KEY = 'finance-revenue'

export type FinanceRevenueTableColumnCatalogItem = {
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
): FinanceRevenueTableColumnCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

export const FINANCE_REVENUE_TABLE_COLUMNS_CATALOG: FinanceRevenueTableColumnCatalogItem[] = [
  col('transaction-id', 'Transaction ID', 'Text', 'Primary transaction reference', true),
  col('module', 'Module', 'Text', 'Business vertical', true),
  col('entity-type', 'Entity Type', 'Text', 'Transaction type', true),
  col('entity-id', 'Entity ID', 'Text', 'Related entity identifier', true),
  col('entity-name', 'Entity Name', 'Text', 'Name of service/event etc', true),
  col('category', 'Category', 'Text', 'Category', true),
  col('sub-category', 'Sub Category', 'Text', 'Subcategory'),
  col('owner-type', 'Owner Type', 'Text', 'Owner type', true),
  col('owner-name', 'Owner Name', 'Text', 'Owner display name', true),
  col('gross-revenue', 'Gross Revenue', 'Currency', 'Revenue before deductions', true),
  col('discounts', 'Discounts', 'Currency', 'Total discounts'),
  col('refund-amount', 'Refund Amount', 'Currency', 'Refunded amount'),
  col('tax-amount', 'Tax Amount', 'Currency', 'GST/VAT amount'),
  col('net-revenue', 'Net Revenue', 'Currency', 'Revenue after deductions'),
  col('platform-commission', 'Platform Commission', 'Currency', 'Platform earnings'),
  col('net-profit', 'Net Profit', 'Currency', 'Final profit'),
  col('payment-status', 'Payment Status', 'Status', 'Payment state', true),
  col('settlement-status', 'Settlement Status', 'Status', 'Settlement state'),
  col('compliance-status', 'Compliance Status', 'Status', 'Compliance state'),
  col('last-updated', 'Last Updated', 'DateTime', 'Last modification timestamp'),
]

/** Maps legacy preference ids → current catalog ids. */
export const FINANCE_REVENUE_LEGACY_COLUMN_ID_MAP: Record<string, string> = {
  'gross-amount': 'gross-revenue',
  status: 'payment-status',
}

export const FINANCE_REVENUE_TABLE_COLUMN_IDS = FINANCE_REVENUE_TABLE_COLUMNS_CATALOG.map(
  (column) => column.id,
)

export const DEFAULT_FINANCE_REVENUE_VISIBLE_COLUMN_IDS =
  FINANCE_REVENUE_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )
