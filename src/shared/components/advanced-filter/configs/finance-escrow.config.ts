import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const byFinanceEscrowSection: FilterSectionConfig = {
  id: 'by-finance-escrow',
  title: 'By Escrow',
  defaultExpanded: true,
  fields: [
    { id: 'escrowId', label: 'Escrow ID', type: 'text', placeholder: 'Enter Escrow ID' },
    {
      id: 'transactionId',
      label: 'Transaction ID',
      type: 'text',
      placeholder: 'Enter Transaction or Order ID',
    },
    {
      id: 'pricingType',
      label: 'Type',
      type: 'checkbox-group',
      options: [
        { label: 'Custom', value: 'custom' },
        { label: 'Milestone', value: 'milestone' },
      ],
    },
    {
      id: 'amount',
      label: 'Amount',
      type: 'number-range',
      fromPlaceholder: 'Min',
      toPlaceholder: 'Max',
    },
    { id: 'holdReason', label: 'Hold Reason', type: 'text', placeholder: 'Enter Hold Reason' },
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox-group',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Released', value: 'Released' },
        { label: 'Dispute', value: 'Dispute' },
      ],
    },
    {
      id: 'module',
      label: 'Module',
      type: 'checkbox-group',
      options: [
        { label: 'Service', value: 'service' },
        { label: 'Consultation', value: 'consultation' },
        { label: 'Venue', value: 'venue' },
      ],
    },
    {
      id: 'expectedReleaseAt',
      label: 'Expected Release',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
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

const financeEscrowFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(byFinanceEscrowSection, 'escrow'),
]

export const financeEscrowFilterConfig: ModuleFilterConfig = {
  moduleKey: 'finance-escrow',
  moduleName: 'Finance Escrow',
  sections: financeEscrowFilterSections,
  exportSections: financeEscrowFilterSections,
}
