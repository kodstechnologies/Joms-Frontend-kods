/**
 * Finance Refunds & Chargebacks — table column catalog.
 * Source: JOMS Excel → Finance Management → Refunds & Chargebacks (14 cols).
 */

export type FinanceRefundsTableColumnCatalogItem = {
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
): FinanceRefundsTableColumnCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

export const FINANCE_REFUNDS_TABLE_COLUMNS_CATALOG: FinanceRefundsTableColumnCatalogItem[] = [
  col('refund-id', 'Refund ID', 'Text', 'Unique refund identifier', true),
  col('transaction-id', 'Transaction ID', 'Text', 'Linked transaction identifier'),
  col('module', 'Module', 'Text', 'Business vertical'),
  col('customer-name', 'Customer Name', 'Text', 'Customer display name'),
  col('refund-type', 'Refund Type', 'Text', 'Refund or chargeback type', true),
  col('refund-reason', 'Refund Reason', 'Text', 'Reason for refund', true),
  col('refund-amount', 'Refund Amount', 'Currency', 'Refund amount', true),
  col('refund-mode', 'Refund Mode', 'Text', 'Refund settlement mode'),
  col('initiated-by', 'Initiated By', 'Text', 'Actor who initiated the refund'),
  col('approved-by', 'Approved By', 'Text', 'Actor who approved the refund'),
  col('refund-date', 'Refund Date', 'Date', 'Date the refund was initiated', true),
  col('chargeback-flag', 'Chargeback Flag', 'Status', 'Whether record is a chargeback'),
  col('gateway', 'Gateway', 'Text', 'Payment gateway'),
  col('status', 'Status', 'Status', 'Current refund status', true),
]

/** Maps legacy preference ids → current catalog ids. */
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
