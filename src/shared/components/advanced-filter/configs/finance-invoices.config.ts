import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const byFinanceInvoicesSection: FilterSectionConfig = {
  id: 'by-finance-invoices',
  title: 'By Invoice',
  defaultExpanded: true,
  fields: [
    { id: 'invoiceId', label: 'Invoice ID', type: 'text', placeholder: 'Enter Invoice Number' },
    { id: 'clientName', label: 'Client Name', type: 'text', placeholder: 'Enter Client Name' },
    {
      id: 'amount',
      label: 'Amount',
      type: 'number-range',
      fromPlaceholder: 'Min',
      toPlaceholder: 'Max',
    },
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox-group',
      options: [
        { label: 'Paid', value: 'Paid' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Overdue', value: 'Overdue' },
      ],
    },
    {
      id: 'module',
      label: 'Description / Module',
      type: 'checkbox-group',
      options: [
        { label: 'Membership', value: 'membership' },
        { label: 'Service', value: 'service' },
        { label: 'Consultation', value: 'consultation' },
        { label: 'Venue', value: 'venue' },
      ],
    },
    {
      id: 'direction',
      label: 'Direction',
      type: 'checkbox-group',
      options: [
        { label: 'Expert to Platform', value: 'expert_to_platform' },
        { label: 'Platform to Expert', value: 'platform_to_expert' },
        { label: 'User to Platform', value: 'user_to_platform' },
      ],
    },
    {
      id: 'issuedAt',
      label: 'Issue Date',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
    {
      id: 'dueDate',
      label: 'Due Date',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
  ],
}

const financeInvoicesFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(byFinanceInvoicesSection, 'invoices'),
]

export const financeInvoicesFilterConfig: ModuleFilterConfig = {
  moduleKey: 'finance-invoices',
  moduleName: 'Finance Invoices',
  sections: financeInvoicesFilterSections,
  exportSections: financeInvoicesFilterSections,
}
