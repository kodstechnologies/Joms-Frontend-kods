/**
 * Finance Reconciliation — table column catalog.
 * Source: JOMS Excel → Finance Management → Financial Reconciliation.
 */

export const FINANCE_RECONCILIATION_MODULE_KEY = 'finance-reconciliation'

export type FinanceReconciliationTableColumnCatalogItem = {
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
): FinanceReconciliationTableColumnCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

export const FINANCE_RECONCILIATION_TABLE_COLUMNS_CATALOG: FinanceReconciliationTableColumnCatalogItem[] =
  [
    col(
      'reconciliation-id',
      'Reconciliation ID',
      'Text',
      'Unique reconciliation record identifier',
      true,
    ),
    col('gateway', 'Gateway', 'Text', 'Payment gateway name', true),
    col('transaction-id', 'Transaction ID', 'Text', 'Gateway transaction identifier', true),
    col('platform-record-id', 'Platform Record ID', 'Text', 'Internal platform record identifier'),
    col('platform-amount', 'Platform Amount', 'Currency', 'Amount recorded on the platform', true),
    col('gateway-amount', 'Gateway Amount', 'Currency', 'Amount reported by the gateway', true),
    col('difference', 'Difference', 'Status', 'Reconciliation difference status', true),
    col('settlement-date', 'Settlement Date', 'Date', 'Gateway settlement date', true),
    col('reconciled-by', 'Reconciled By', 'Text', 'Admin who reconciled the record', true),
    col('status', 'Status', 'Status', 'Reconciliation status', true),
  ]

export const DEFAULT_FINANCE_RECONCILIATION_VISIBLE_COLUMN_IDS =
  FINANCE_RECONCILIATION_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )
