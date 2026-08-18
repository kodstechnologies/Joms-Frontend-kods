export const FINANCE_SERVICES_MODULE_KEY = 'finance-services'

export type FinanceServicesTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export const FINANCE_SERVICES_TABLE_COLUMNS_CATALOG: FinanceServicesTableColumnCatalogItem[] = [
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
]

export const DEFAULT_FINANCE_SERVICES_VISIBLE_COLUMN_IDS =
  FINANCE_SERVICES_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )
