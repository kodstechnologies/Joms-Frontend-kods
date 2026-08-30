export const FINANCE_ESCROW_MODULE_KEY = 'finance-escrow'

export type FinanceEscrowTableColumnCatalogItem = {
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
): FinanceEscrowTableColumnCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

export const FINANCE_ESCROW_TABLE_COLUMNS_CATALOG: FinanceEscrowTableColumnCatalogItem[] = [
  col('escrow-id', 'Escrow ID', 'Text', 'Unique escrow hold identifier', true),
  col(
    'transaction-id',
    'Transaction ID',
    'Text',
    'Related payment or transaction identifier',
    true,
  ),
  col('module', 'Module', 'Text', 'Business vertical / escrow module', true),
  col('amount', 'Amount', 'Currency', 'Held amount', true),
  col('hold-reason', 'Hold Reason', 'Text', 'Reason funds are held', true),
  col('hold-created-at', 'Hold Created At', 'Date', 'Date the hold started', true),
  col('expected-release', 'Expected Release', 'Date', 'Expected release date', true),
  col('released-at', 'Released At', 'Date', 'Actual release timestamp'),
  col('release-status', 'Release Status', 'Status', 'Current escrow release status', true),
  col('created-by', 'Created By', 'Text', 'Actor who created the hold'),
  col('last-updated', 'Last Updated', 'Date', 'Latest update timestamp'),
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
