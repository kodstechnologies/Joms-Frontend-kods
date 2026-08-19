export type FinanceRefundsTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export const FINANCE_REFUNDS_TABLE_COLUMNS_CATALOG: FinanceRefundsTableColumnCatalogItem[] = [
  {
    id: 'record-id',
    label: 'ID',
    type: 'Text',
    description: 'Refund or dispute record identifier',
    defaultVisible: true,
  },
  {
    id: 'type',
    label: 'Type',
    type: 'Text',
    description: 'Record type (refund or dispute)',
    defaultVisible: true,
  },
  {
    id: 'related-entity',
    label: 'Related Entity',
    type: 'Text',
    description: 'Related booking or transaction entity',
    defaultVisible: true,
  },
  {
    id: 'amount',
    label: 'Amount',
    type: 'Currency',
    description: 'Refund or dispute amount',
    defaultVisible: true,
  },
  {
    id: 'reason',
    label: 'Reason',
    type: 'Text',
    description: 'Reason for refund or dispute',
    defaultVisible: true,
  },
  {
    id: 'initiated-date',
    label: 'Initiated Date',
    type: 'Date',
    description: 'Date the case was initiated',
    defaultVisible: true,
  },
  {
    id: 'description',
    label: 'Description',
    type: 'Text',
    description: 'Additional case description',
    defaultVisible: true,
  },
  {
    id: 'status',
    label: 'Status',
    type: 'Status',
    description: 'Current case status',
    defaultVisible: true,
  },
]

export const DEFAULT_FINANCE_REFUNDS_VISIBLE_COLUMN_IDS =
  FINANCE_REFUNDS_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )
