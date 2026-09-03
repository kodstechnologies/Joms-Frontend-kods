export type FinanceRefundsTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export const FINANCE_REFUNDS_TABLE_COLUMNS_CATALOG: FinanceRefundsTableColumnCatalogItem[] = [
  {
    id: 'refund-id',
    label: 'Refund ID',
    type: 'Text',
    description: 'Unique refund identifier',
    defaultVisible: true,
  },
  {
    id: 'transaction-id',
    label: 'Transaction ID',
    type: 'Text',
    description: 'Linked transaction identifier',
    defaultVisible: false,
  },
  {
    id: 'module',
    label: 'Module',
    type: 'Text',
    description: 'Business vertical',
    defaultVisible: false,
  },
  {
    id: 'customer-name',
    label: 'Customer Name',
    type: 'Text',
    description: 'Customer display name',
    defaultVisible: false,
  },
  {
    id: 'refund-type',
    label: 'Refund Type',
    type: 'Text',
    description: 'Refund or chargeback type',
    defaultVisible: true,
  },
  {
    id: 'refund-reason',
    label: 'Refund Reason',
    type: 'Text',
    description: 'Reason for refund',
    defaultVisible: true,
  },
  {
    id: 'refund-amount',
    label: 'Refund Amount',
    type: 'Currency',
    description: 'Refund amount',
    defaultVisible: true,
  },
  {
    id: 'refund-mode',
    label: 'Refund Mode',
    type: 'Text',
    description: 'Refund settlement mode',
    defaultVisible: false,
  },
  {
    id: 'initiated-by',
    label: 'Initiated By',
    type: 'Text',
    description: 'Actor who initiated the refund',
    defaultVisible: false,
  },
  {
    id: 'approved-by',
    label: 'Approved By',
    type: 'Text',
    description: 'Actor who approved the refund',
    defaultVisible: false,
  },
  {
    id: 'refund-date',
    label: 'Refund Date',
    type: 'Date',
    description: 'Date the refund was initiated',
    defaultVisible: true,
  },
  {
    id: 'chargeback-flag',
    label: 'Chargeback Flag',
    type: 'Status',
    description: 'Whether record is a chargeback',
    defaultVisible: false,
  },
  {
    id: 'gateway',
    label: 'Gateway',
    type: 'Text',
    description: 'Payment gateway',
    defaultVisible: false,
  },
  {
    id: 'status',
    label: 'Status',
    type: 'Status',
    description: 'Current refund status',
    defaultVisible: true,
  },
]

export const FINANCE_REFUNDS_LEGACY_COLUMN_ID_MAP: Record<string, string> = {
  'record-id': 'refund-id',
  amount: 'refund-amount',
  reason: 'refund-reason',
  'initiated-date': 'refund-date',
  type: 'refund-type',
}

export const DEFAULT_FINANCE_REFUNDS_VISIBLE_COLUMN_IDS =
  FINANCE_REFUNDS_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )
