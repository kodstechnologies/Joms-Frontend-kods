import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const byFinanceRefundsSection: FilterSectionConfig = {
  id: 'by-finance-refunds',
  title: 'By Refund',
  defaultExpanded: true,
  fields: [
    { id: 'recordId', label: 'ID', type: 'text', placeholder: 'Enter Record ID' },
    {
      id: 'type',
      label: 'Type',
      type: 'checkbox-group',
      options: [
        { label: 'Dispute', value: 'Dispute' },
        { label: 'Refund', value: 'Refund' },
        { label: 'Chargeback', value: 'Chargeback' },
      ],
    },
    {
      id: 'module',
      label: 'Related Entity',
      type: 'checkbox-group',
      options: [
        { label: 'Membership', value: 'membership' },
        { label: 'Service', value: 'service' },
        { label: 'Consultation', value: 'consultation' },
        { label: 'Venue', value: 'venue' },
      ],
    },
    {
      id: 'amount',
      label: 'Amount',
      type: 'number-range',
      fromPlaceholder: 'Min',
      toPlaceholder: 'Max',
    },
    { id: 'reason', label: 'Reason', type: 'text', placeholder: 'Enter Reason' },
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox-group',
      options: [
        { label: 'Open', value: 'Open' },
        { label: 'In Review', value: 'In Review' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Resolved', value: 'Resolved' },
        { label: 'Rejected', value: 'Rejected' },
      ],
    },
    {
      id: 'refundType',
      label: 'Refund Type',
      type: 'checkbox-group',
      options: [
        { label: 'Full', value: 'full' },
        { label: 'Partial', value: 'partial' },
      ],
    },
    {
      id: 'createdAt',
      label: 'Initiated Date',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
  ],
}

const financeRefundsFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(byFinanceRefundsSection, 'refunds'),
]

export const financeRefundsFilterConfig: ModuleFilterConfig = {
  moduleKey: 'finance-refunds',
  moduleName: 'Finance Refunds',
  sections: financeRefundsFilterSections,
  exportSections: financeRefundsFilterSections,
}
