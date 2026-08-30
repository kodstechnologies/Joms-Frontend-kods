export const FINANCE_PAYOUTS_MODULE_KEY = 'finance-payouts'

export type FinancePayoutsTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export type FinancePayoutsMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const col = (
  id: string,
  label: string,
  type: string,
  description: string,
  defaultVisible = false,
): FinancePayoutsTableColumnCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

export const FINANCE_PAYOUTS_TABLE_COLUMNS_CATALOG: FinancePayoutsTableColumnCatalogItem[] = [
  col('payout-id', 'Payout ID', 'Text', 'Unique payout identifier', true),
  col('payee-id', 'Payee ID', 'Text', 'Payee identifier', true),
  col('payee-name', 'Payee Name', 'Text', 'Payee display name', true),
  col('payee-type', 'Payee Type', 'Text', 'Payee type', true),
  col('related-transaction', 'Related Transaction', 'Text', 'Linked transaction reference'),
  col('gross-amount', 'Gross Amount', 'Currency', 'Gross payout amount', true),
  col('platform-commission', 'Platform Commission', 'Currency', 'Platform commission deducted'),
  col('tax-deduction', 'Tax Deduction', 'Currency', 'Tax deducted from payout'),
  col('gateway-charges', 'Gateway Charges', 'Currency', 'Gateway charges'),
  col('net-payout', 'Net Payout', 'Currency', 'Net payout amount', true),
  col('currency', 'Currency', 'Text', 'Payout currency'),
  col('bank-reference', 'Bank Reference', 'Text', 'Bank settlement reference', true),
  col('scheduled-date', 'Scheduled Date', 'Date', 'Scheduled payout date', true),
  col('processed-date', 'Processed Date', 'Date', 'Actual processed date'),
  col('payout-status', 'Payout Status', 'Status', 'Current payout status', true),
  col('finance-approver', 'Finance Approver', 'Text', 'Approving finance admin'),
  // Legacy columns kept visible so existing UI does not empty
  col('recipient', 'Recipient', 'Text', 'Legacy recipient name', true),
  col('type', 'Type', 'Text', 'Legacy payout type', true),
  col('amount', 'Amount', 'Currency', 'Legacy payout amount', true),
  col('method', 'Method', 'Text', 'Legacy settlement method', true),
  col('initiated-date', 'Initiated Date', 'Date', 'Legacy initiated date', true),
  col('description', 'Description', 'Text', 'Legacy payout description', true),
  col('status', 'Status', 'Status', 'Legacy payout status', true),
]

export const FINANCE_PAYOUTS_METRICS_CATALOG: FinancePayoutsMetricCatalogItem[] = [
  {
    id: 'total-payments',
    label: 'Total Payments',
    type: 'Count',
    description: 'Total payout records',
    defaultActive: true,
  },
  {
    id: 'pending',
    label: 'Pending',
    type: 'Currency',
    description: 'Amount awaiting payout release',
    defaultActive: true,
  },
  {
    id: 'completed',
    label: 'Completed',
    type: 'Currency',
    description: 'Completed payout amount',
    defaultActive: true,
  },
  {
    id: 'failed',
    label: 'Failed',
    type: 'Count',
    description: 'Failed payouts',
    defaultActive: true,
  },
]

export const FINANCE_PAYOUTS_MAX_ACTIVE_METRICS = FINANCE_PAYOUTS_METRICS_CATALOG.length

export const DEFAULT_FINANCE_PAYOUTS_VISIBLE_COLUMN_IDS =
  FINANCE_PAYOUTS_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )
