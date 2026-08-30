import type { FinanceServiceTab } from '@/modules/payments/types/finance-table-rows'

export const financeServiceTabs: Array<{ id: FinanceServiceTab; label: string }> = [
  { id: 'all', label: 'All Transaction' },
  { id: 'escrow', label: 'Escrow Holds' },
  { id: 'by-service', label: 'Booking By Service' },
  { id: 'by-consultation', label: 'Booking By Consultation' },
]
