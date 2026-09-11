export const FINANCE_SERVICES_MODULE_KEY = 'finance-services'

export type FinanceServicesTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export const FINANCE_SERVICES_TABLE_COLUMNS_CATALOG: FinanceServicesTableColumnCatalogItem[] = [
  // Existing service-specific columns (keep visible)
  {
    id: 'service-id',
    label: 'Service ID',
    type: 'Text',
    description: 'Unique service identifier',
    defaultVisible: true,
  },
  {
    id: 'name',
    label: 'Name',
    type: 'Text',
    description: 'Service or booking name',
    defaultVisible: true,
  },
  {
    id: 'expert-name',
    label: 'Expert Name',
    type: 'Text',
    description: 'Assigned expert name',
    defaultVisible: true,
  },
  {
    id: 'booking-id',
    label: 'Booking ID',
    type: 'Text',
    description: 'Booking reference identifier',
    defaultVisible: true,
  },
  {
    id: 'user-name',
    label: 'User Name',
    type: 'Text',
    description: 'Customer or user name',
    defaultVisible: true,
  },
  {
    id: 'status',
    label: 'Status',
    type: 'Status',
    description: 'Payment or booking status',
    defaultVisible: true,
  },
  {
    id: 'revenue',
    label: 'Revenue',
    type: 'Currency',
    description: 'Revenue amount',
    defaultVisible: true,
  },
  // Financial Transactions (Excel) — hidden until data exists
  {
    id: 'transaction-id',
    label: 'Transaction ID',
    type: 'Text',
    description: 'Primary transaction reference',
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
    id: 'related-entity-id',
    label: 'Related Entity ID',
    type: 'Text',
    description: 'Related service/entity identifier',
    defaultVisible: false,
  },
  {
    id: 'client-id',
    label: 'Client ID',
    type: 'Text',
    description: 'Client identifier',
    defaultVisible: false,
  },
  {
    id: 'client-name',
    label: 'Client Name',
    type: 'Text',
    description: 'Client display name',
    defaultVisible: false,
  },
  {
    id: 'partner-id',
    label: 'Partner ID',
    type: 'Text',
    description: 'Partner identifier',
    defaultVisible: false,
  },
  {
    id: 'partner-name',
    label: 'Partner Name',
    type: 'Text',
    description: 'Partner display name',
    defaultVisible: false,
  },
  {
    id: 'transaction-date',
    label: 'Transaction Date',
    type: 'Date',
    description: 'Transaction timestamp',
    defaultVisible: false,
  },
  {
    id: 'gross-amount',
    label: 'Gross Amount',
    type: 'Currency',
    description: 'Gross transaction amount',
    defaultVisible: false,
  },
  {
    id: 'discount',
    label: 'Discount',
    type: 'Currency',
    description: 'Discount applied',
    defaultVisible: false,
  },
  {
    id: 'tax',
    label: 'Tax',
    type: 'Currency',
    description: 'Tax amount',
    defaultVisible: false,
  },
  {
    id: 'gateway-charges',
    label: 'Gateway Charges',
    type: 'Currency',
    description: 'Payment gateway charges',
    defaultVisible: false,
  },
  {
    id: 'platform-commission-pct',
    label: 'Platform Commission %',
    type: 'Percentage',
    description: 'Platform commission percentage',
    defaultVisible: false,
  },
  {
    id: 'platform-commission',
    label: 'Platform Commission',
    type: 'Currency',
    description: 'Platform commission amount',
    defaultVisible: false,
  },
  {
    id: 'partner-payout',
    label: 'Partner Payout',
    type: 'Currency',
    description: 'Partner payout amount',
    defaultVisible: false,
  },
  {
    id: 'refund-amount',
    label: 'Refund Amount',
    type: 'Currency',
    description: 'Refunded amount',
    defaultVisible: false,
  },
  {
    id: 'net-revenue',
    label: 'Net Revenue',
    type: 'Currency',
    description: 'Net revenue after deductions',
    defaultVisible: false,
  },
  {
    id: 'net-profit',
    label: 'Net Profit',
    type: 'Currency',
    description: 'Net profit',
    defaultVisible: false,
  },
  {
    id: 'payment-method',
    label: 'Payment Method',
    type: 'Text',
    description: 'Payment method',
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
    id: 'transaction-status',
    label: 'Transaction Status',
    type: 'Status',
    description: 'Transaction status',
    defaultVisible: false,
  },
  {
    id: 'settlement-status',
    label: 'Settlement Status',
    type: 'Status',
    description: 'Settlement status',
    defaultVisible: false,
  },
  {
    id: 'settlement-date',
    label: 'Settlement Date',
    type: 'Date',
    description: 'Settlement date',
    defaultVisible: false,
  },
  {
    id: 'invoice-id',
    label: 'Invoice ID',
    type: 'Text',
    description: 'Related invoice identifier',
    defaultVisible: false,
  },
]

import type { FinanceServiceTab } from '@/modules/payments/types/finance-table-rows'

export const FINANCE_SERVICE_TABS: Array<{ id: FinanceServiceTab; label: string }> = [
  { id: 'all', label: 'All Transaction' },
  { id: 'escrow', label: 'Escrow Holds' },
  { id: 'by-service', label: 'Booking By Service' },
  { id: 'by-consultation', label: 'Booking By Consultation' },
]

export const FINANCE_SERVICES_LEGACY_COLUMN_ID_MAP: Record<string, string> = {
  'service-id': 'service-id',
}

export const DEFAULT_FINANCE_SERVICES_VISIBLE_COLUMN_IDS =
  FINANCE_SERVICES_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )
