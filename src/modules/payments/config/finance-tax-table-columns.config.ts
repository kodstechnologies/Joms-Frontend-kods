export const FINANCE_TAX_MODULE_KEY = 'finance-tax'

export type FinanceTaxTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export const FINANCE_TAX_TABLE_COLUMNS_CATALOG: FinanceTaxTableColumnCatalogItem[] = [
  {
    id: 'record-id',
    label: 'Record ID',
    type: 'Text',
    description: 'Tax record identifier',
    defaultVisible: true,
  },
  {
    id: 'entity-type',
    label: 'Entity Type',
    type: 'Text',
    description: 'Type of taxed entity',
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
    id: 'owner',
    label: 'Owner',
    type: 'Text',
    description: 'Record owner name',
    defaultVisible: true,
  },
  {
    id: 'booking-id',
    label: 'Booking ID',
    type: 'Text',
    description: 'Related booking identifier',
    defaultVisible: true,
  },
  {
    id: 'booking-title',
    label: 'Booking Title',
    type: 'Text',
    description: 'Related booking title',
    defaultVisible: true,
  },
  {
    id: 'status',
    label: 'Status',
    type: 'Status',
    description: 'Filing or compliance status',
    defaultVisible: true,
  },
  {
    id: 'revenue',
    label: 'Revenue',
    type: 'Currency',
    description: 'Taxable revenue amount',
    defaultVisible: true,
  },
]

export const DEFAULT_FINANCE_TAX_VISIBLE_COLUMN_IDS = FINANCE_TAX_TABLE_COLUMNS_CATALOG.filter(
  (column) => column.defaultVisible,
).map((column) => column.id)
