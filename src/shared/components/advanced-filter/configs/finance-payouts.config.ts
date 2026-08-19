import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const byFinancePayoutsSection: FilterSectionConfig = {
  id: 'by-finance-payouts',
  title: 'By Payout',
  defaultExpanded: true,
  fields: [
    { id: 'payoutId', label: 'Payout ID', type: 'text', placeholder: 'Enter Payout ID' },
    { id: 'recipient', label: 'Recipient', type: 'text', placeholder: 'Enter Recipient Name' },
    {
      id: 'module',
      label: 'Type',
      type: 'checkbox-group',
      options: [
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
    { id: 'method', label: 'Method', type: 'text', placeholder: 'Enter Method or Bank Reference' },
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox-group',
      options: [
        { label: 'Completed', value: 'Completed' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Failed', value: 'Failed' },
      ],
    },
    {
      id: 'payeeType',
      label: 'Payee Type',
      type: 'checkbox-group',
      options: [
        { label: 'Expert', value: 'expert' },
        { label: 'Venue Partner', value: 'venue_partner' },
        { label: 'Organisation', value: 'organisation' },
      ],
    },
    {
      id: 'pricingType',
      label: 'Pricing Type',
      type: 'checkbox-group',
      options: [
        { label: 'Fixed', value: 'fixed' },
        { label: 'Tiered', value: 'tiered' },
        { label: 'Custom', value: 'custom' },
        { label: 'Milestone', value: 'milestone' },
      ],
    },
    {
      id: 'settlementPath',
      label: 'Settlement Path',
      type: 'checkbox-group',
      options: [
        { label: 'Direct', value: 'direct' },
        { label: 'Via Escrow', value: 'via_escrow' },
      ],
    },
    {
      id: 'scheduledAt',
      label: 'Initiated Date',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
  ],
}

const financePayoutsFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(byFinancePayoutsSection, 'payouts'),
]

export const financePayoutsFilterConfig: ModuleFilterConfig = {
  moduleKey: 'finance-payouts',
  moduleName: 'Finance Payouts',
  sections: financePayoutsFilterSections,
  exportSections: financePayoutsFilterSections,
}
