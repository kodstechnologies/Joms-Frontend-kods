export const FINANCE_REVENUE_MODULE_KEY = 'finance-revenue'

export type FinanceRevenueTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export const FINANCE_REVENUE_TABLE_COLUMNS_CATALOG: FinanceRevenueTableColumnCatalogItem[] = [
  {
    id: 'transaction-id',
    label: 'Transaction ID',
    type: 'Text',
    description: 'Primary transaction reference',
    defaultVisible: true,
  },
  {
    id: 'module',
    label: 'Module',
    type: 'Text',
    description: 'Business vertical',
    defaultVisible: true,
  },
  {
    id: 'entity-type',
    label: 'Entity Type',
    type: 'Text',
    description: 'Transaction type',
    defaultVisible: true,
  },
  {
    id: 'entity-id',
    label: 'Entity ID',
    type: 'Text',
    description: 'Related entity identifier',
    defaultVisible: true,
  },
  {
    id: 'entity-name',
    label: 'Entity Name',
    type: 'Text',
    description: 'Name of service/event etc',
    defaultVisible: true,
  },
  {
    id: 'category',
    label: 'Category',
    type: 'Text',
    description: 'Category',
    defaultVisible: true,
  },
  {
    id: 'sub-category',
    label: 'Sub Category',
    type: 'Text',
    description: 'Subcategory',
    defaultVisible: false,
  },
  {
    id: 'owner-type',
    label: 'Owner Type',
    type: 'Text',
    description: 'Owner type',
    defaultVisible: true,
  },
  {
    id: 'owner-name',
    label: 'Owner Name',
    type: 'Text',
    description: 'Owner display name',
    defaultVisible: true,
  },
  {
    id: 'gross-revenue',
    label: 'Gross Revenue',
    type: 'Currency',
    description: 'Revenue before deductions',
    defaultVisible: true,
  },
  {
    id: 'discounts',
    label: 'Discounts',
    type: 'Currency',
    description: 'Total discounts',
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
    id: 'tax-amount',
    label: 'Tax Amount',
    type: 'Currency',
    description: 'GST/VAT amount',
    defaultVisible: false,
  },
  {
    id: 'net-revenue',
    label: 'Net Revenue',
    type: 'Currency',
    description: 'Revenue after deductions',
    defaultVisible: false,
  },
  {
    id: 'platform-commission',
    label: 'Platform Commission',
    type: 'Currency',
    description: 'Platform earnings',
    defaultVisible: false,
  },
  {
    id: 'net-profit',
    label: 'Net Profit',
    type: 'Currency',
    description: 'Final profit',
    defaultVisible: false,
  },
  {
    id: 'payment-status',
    label: 'Payment Status',
    type: 'Status',
    description: 'Payment state',
    defaultVisible: true,
  },
  {
    id: 'settlement-status',
    label: 'Settlement Status',
    type: 'Status',
    description: 'Settlement state',
    defaultVisible: false,
  },
  {
    id: 'compliance-status',
    label: 'Compliance Status',
    type: 'Status',
    description: 'Compliance state',
    defaultVisible: false,
  },
  {
    id: 'last-updated',
    label: 'Last Updated',
    type: 'DateTime',
    description: 'Last modification timestamp',
    defaultVisible: false,
  },
]

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
