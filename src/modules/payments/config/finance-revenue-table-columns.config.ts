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
    id: 'module',
    label: 'Module',
    type: 'Text',
    description: 'Revenue source module',
    defaultVisible: true,
  },
  {
    id: 'entity-type',
    label: 'Entity Type',
    type: 'Text',
    description: 'Type of revenue entity',
    defaultVisible: true,
  },
  {
    id: 'entity-id',
    label: 'Entity ID',
    type: 'Text',
    description: 'Unique entity identifier',
    defaultVisible: true,
  },
  {
    id: 'entity-name',
    label: 'Entity Name',
    type: 'Text',
    description: 'Display name of the entity',
    defaultVisible: true,
  },
  {
    id: 'category',
    label: 'Category',
    type: 'Text',
    description: 'Revenue category',
    defaultVisible: true,
  },
  {
    id: 'owner-type',
    label: 'Owner Type',
    type: 'Text',
    description: 'Type of revenue owner',
    defaultVisible: true,
  },
  {
    id: 'owner-name',
    label: 'Owner Name',
    type: 'Text',
    description: 'Name of the revenue owner',
    defaultVisible: true,
  },
  {
    id: 'gross-amount',
    label: 'Gross Amount',
    type: 'Currency',
    description: 'Gross transaction amount',
    defaultVisible: true,
  },
  {
    id: 'status',
    label: 'Status',
    type: 'Status',
    description: 'Payment status',
    defaultVisible: true,
  },
]

export const FINANCE_REVENUE_TABLE_COLUMN_IDS = FINANCE_REVENUE_TABLE_COLUMNS_CATALOG.map(
  (column) => column.id,
)

export const DEFAULT_FINANCE_REVENUE_VISIBLE_COLUMN_IDS =
  FINANCE_REVENUE_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )
