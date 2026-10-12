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

export const FINANCE_PAYOUTS_TABLE_COLUMNS_CATALOG: FinancePayoutsTableColumnCatalogItem[] = [
  {
    id: 'payout-id',
    label: 'Payout ID',
    type: 'Text',
    description: 'Unique payout identifier',
    defaultVisible: true,
  },
  {
    id: 'payee-id',
    label: 'Payee ID',
    type: 'Text',
    description: 'Payee identifier',
    defaultVisible: true,
  },
  {
    id: 'payee-name',
    label: 'Payee Name',
    type: 'Text',
    description: 'Payee display name',
    defaultVisible: true,
  },
  {
    id: 'payee-type',
    label: 'Payee Type',
    type: 'Text',
    description: 'Payee type',
    defaultVisible: true,
  },
  {
    id: 'related-transaction',
    label: 'Related Transaction',
    type: 'Text',
    description: 'Linked transaction reference',
    defaultVisible: false,
  },
  {
    id: 'gross-amount',
    label: 'Gross Amount',
    type: 'Currency',
    description: 'Gross payout amount',
    defaultVisible: true,
  },
  {
    id: 'platform-commission',
    label: 'Platform Commission',
    type: 'Currency',
    description: 'Platform commission deducted',
    defaultVisible: false,
  },
  {
    id: 'tax-deduction',
    label: 'Tax Deduction',
    type: 'Currency',
    description: 'Tax deducted from payout',
    defaultVisible: false,
  },
  {
    id: 'gateway-charges',
    label: 'Gateway Charges',
    type: 'Currency',
    description: 'Gateway charges',
    defaultVisible: false,
  },
  {
    id: 'net-payout',
    label: 'Net Payout',
    type: 'Currency',
    description: 'Net payout amount',
    defaultVisible: true,
  },
  {
    id: 'currency',
    label: 'Currency',
    type: 'Text',
    description: 'Payout currency',
    defaultVisible: false,
  },
  {
    id: 'bank-reference',
    label: 'Bank Reference',
    type: 'Text',
    description: 'Bank settlement reference',
    defaultVisible: true,
  },
  {
    id: 'scheduled-date',
    label: 'Scheduled Date',
    type: 'Date',
    description: 'Scheduled payout date',
    defaultVisible: true,
  },
  {
    id: 'processed-date',
    label: 'Processed Date',
    type: 'Date',
    description: 'Actual processed date',
    defaultVisible: false,
  },
  {
    id: 'payout-status',
    label: 'Payout Status',
    type: 'Status',
    description: 'Current payout status',
    defaultVisible: true,
  },
  {
    id: 'finance-approver',
    label: 'Finance Approver',
    type: 'Text',
    description: 'Approving finance admin',
    defaultVisible: false,
  },
  {
    id: 'recipient',
    label: 'Recipient',
    type: 'Text',
    description: 'Legacy recipient name',
    defaultVisible: true,
  },
  {
    id: 'type',
    label: 'Type',
    type: 'Text',
    description: 'Legacy payout type',
    defaultVisible: true,
  },
  {
    id: 'amount',
    label: 'Amount',
    type: 'Currency',
    description: 'Legacy payout amount',
    defaultVisible: true,
  },
  {
    id: 'method',
    label: 'Method',
    type: 'Text',
    description: 'Legacy settlement method',
    defaultVisible: true,
  },
  {
    id: 'initiated-date',
    label: 'Initiated Date',
    type: 'Date',
    description: 'Legacy initiated date',
    defaultVisible: true,
  },
  {
    id: 'description',
    label: 'Description',
    type: 'Text',
    description: 'Legacy payout description',
    defaultVisible: true,
  },
  {
    id: 'status',
    label: 'Status',
    type: 'Status',
    description: 'Legacy payout status',
    defaultVisible: true,
  },
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
