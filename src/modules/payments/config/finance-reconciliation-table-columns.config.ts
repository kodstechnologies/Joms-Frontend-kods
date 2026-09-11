export const FINANCE_RECONCILIATION_MODULE_KEY = 'finance-reconciliation'

export type FinanceReconciliationTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export const FINANCE_RECONCILIATION_TABLE_COLUMNS_CATALOG: FinanceReconciliationTableColumnCatalogItem[] =
  [
    {
      id: 'reconciliation-id',
      label: 'Reconciliation ID',
      type: 'Text',
      description: 'Unique reconciliation record identifier',
      defaultVisible: true,
    },
    {
      id: 'gateway',
      label: 'Gateway',
      type: 'Text',
      description: 'Payment gateway name',
      defaultVisible: true,
    },
    {
      id: 'transaction-id',
      label: 'Transaction ID',
      type: 'Text',
      description: 'Gateway transaction identifier',
      defaultVisible: true,
    },
    {
      id: 'platform-record-id',
      label: 'Platform Record ID',
      type: 'Text',
      description: 'Internal platform record identifier',
      defaultVisible: false,
    },
    {
      id: 'platform-amount',
      label: 'Platform Amount',
      type: 'Currency',
      description: 'Amount recorded on the platform',
      defaultVisible: true,
    },
    {
      id: 'gateway-amount',
      label: 'Gateway Amount',
      type: 'Currency',
      description: 'Amount reported by the gateway',
      defaultVisible: true,
    },
    {
      id: 'difference',
      label: 'Difference',
      type: 'Status',
      description: 'Reconciliation difference status',
      defaultVisible: true,
    },
    {
      id: 'settlement-date',
      label: 'Settlement Date',
      type: 'Date',
      description: 'Gateway settlement date',
      defaultVisible: true,
    },
    {
      id: 'reconciled-by',
      label: 'Reconciled By',
      type: 'Text',
      description: 'Admin who reconciled the record',
      defaultVisible: true,
    },
    {
      id: 'status',
      label: 'Status',
      type: 'Status',
      description: 'Reconciliation status',
      defaultVisible: true,
    },
  ]

export const DEFAULT_FINANCE_RECONCILIATION_VISIBLE_COLUMN_IDS =
  FINANCE_RECONCILIATION_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )
