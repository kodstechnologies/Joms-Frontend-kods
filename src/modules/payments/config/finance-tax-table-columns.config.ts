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
    id: 'tax-record-id',
    label: 'Tax Record ID',
    type: 'Text',
    description: 'Unique tax record identifier',
    defaultVisible: true,
  },
  {
    id: 'transaction-id',
    label: 'Transaction ID',
    type: 'Text',
    description: 'Linked transaction identifier',
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
    id: 'region',
    label: 'Region',
    type: 'Text',
    description: 'Tax jurisdiction / region',
    defaultVisible: true,
  },
  {
    id: 'tax-type',
    label: 'Tax Type',
    type: 'Text',
    description: 'Tax type (GST/VAT etc.)',
    defaultVisible: true,
  },
  {
    id: 'tax-rate',
    label: 'Tax Rate',
    type: 'Percentage',
    description: 'Applicable tax rate',
    defaultVisible: false,
  },
  {
    id: 'tax-amount',
    label: 'Tax Amount',
    type: 'Currency',
    description: 'Calculated tax amount',
    defaultVisible: true,
  },
  {
    id: 'invoice-number',
    label: 'Invoice Number',
    type: 'Text',
    description: 'Related invoice number',
    defaultVisible: false,
  },
  {
    id: 'filing-period',
    label: 'Filing Period',
    type: 'Text',
    description: 'Tax filing period',
    defaultVisible: false,
  },
  {
    id: 'filing-status',
    label: 'Filing Status',
    type: 'Status',
    description: 'Filing or compliance status',
    defaultVisible: true,
  },
]

export const FINANCE_TAX_LEGACY_COLUMN_ID_MAP: Record<string, string> = {
  'record-id': 'tax-record-id',
  status: 'filing-status',
}

export const DEFAULT_FINANCE_TAX_VISIBLE_COLUMN_IDS = FINANCE_TAX_TABLE_COLUMNS_CATALOG.filter(
  (column) => column.defaultVisible,
).map((column) => column.id)
