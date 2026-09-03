export const FINANCE_ESCROW_MODULE_KEY = 'finance-escrow'

export type FinanceEscrowTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export const FINANCE_ESCROW_TABLE_COLUMNS_CATALOG: FinanceEscrowTableColumnCatalogItem[] = [
  {
    id: 'escrow-id',
    label: 'Escrow ID',
    type: 'Text',
    description: 'Unique escrow hold identifier',
    defaultVisible: true,
  },
  {
    id: 'transaction-id',
    label: 'Transaction ID',
    type: 'Text',
    description: 'Related payment or transaction identifier',
    defaultVisible: true,
  },
  {
    id: 'module',
    label: 'Module',
    type: 'Text',
    description: 'Business vertical / escrow module',
    defaultVisible: true,
  },
  {
    id: 'amount',
    label: 'Amount',
    type: 'Currency',
    description: 'Held amount',
    defaultVisible: true,
  },
  {
    id: 'hold-reason',
    label: 'Hold Reason',
    type: 'Text',
    description: 'Reason funds are held',
    defaultVisible: true,
  },
  {
    id: 'hold-created-at',
    label: 'Hold Created At',
    type: 'Date',
    description: 'Date the hold started',
    defaultVisible: true,
  },
  {
    id: 'expected-release',
    label: 'Expected Release',
    type: 'Date',
    description: 'Expected release date',
    defaultVisible: true,
  },
  {
    id: 'released-at',
    label: 'Released At',
    type: 'Date',
    description: 'Actual release timestamp',
    defaultVisible: false,
  },
  {
    id: 'release-status',
    label: 'Release Status',
    type: 'Status',
    description: 'Current escrow release status',
    defaultVisible: true,
  },
  {
    id: 'created-by',
    label: 'Created By',
    type: 'Text',
    description: 'Actor who created the hold',
    defaultVisible: false,
  },
  {
    id: 'last-updated',
    label: 'Last Updated',
    type: 'Date',
    description: 'Latest update timestamp',
    defaultVisible: false,
  },
]

export const FINANCE_ESCROW_LEGACY_COLUMN_ID_MAP: Record<string, string> = {
  type: 'module',
  'initiated-date': 'hold-created-at',
  status: 'release-status',
}

export const DEFAULT_FINANCE_ESCROW_VISIBLE_COLUMN_IDS =
  FINANCE_ESCROW_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )
