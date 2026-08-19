import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const byFinanceReconSection: FilterSectionConfig = {
  id: 'by-finance-reconciliation',
  title: 'By Reconciliation',
  defaultExpanded: true,
  fields: [
    {
      id: 'recordId',
      label: 'Reconciliation ID',
      type: 'text',
      placeholder: 'Enter Reconciliation ID',
    },
    { id: 'gateway', label: 'Gateway', type: 'text', placeholder: 'Enter Gateway' },
    {
      id: 'transactionId',
      label: 'Transaction ID',
      type: 'text',
      placeholder: 'Enter Gateway Reference or Payment ID',
    },
    {
      id: 'status',
      label: 'Difference',
      type: 'checkbox-group',
      options: [
        { label: 'Matched', value: 'Matched' },
        { label: 'Mismatch', value: 'Mismatch' },
        { label: 'Pending', value: 'Pending' },
      ],
    },
    {
      id: 'module',
      label: 'Module',
      type: 'checkbox-group',
      options: [
        { label: 'Membership', value: 'membership' },
        { label: 'Service', value: 'service' },
        { label: 'Consultation', value: 'consultation' },
        { label: 'Venue', value: 'venue' },
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
      id: 'gatewayAmount',
      label: 'Gateway Amount',
      type: 'number-range',
      fromPlaceholder: 'Min',
      toPlaceholder: 'Max',
    },
    {
      id: 'platformAmount',
      label: 'Platform Amount',
      type: 'number-range',
      fromPlaceholder: 'Min',
      toPlaceholder: 'Max',
    },
    {
      id: 'settlementDate',
      label: 'Settlement Date',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
  ],
}

const financeReconFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(byFinanceReconSection, 'recon'),
]

export const financeReconciliationFilterConfig: ModuleFilterConfig = {
  moduleKey: 'finance-reconciliation',
  moduleName: 'Finance Reconciliation',
  sections: financeReconFilterSections,
  exportSections: financeReconFilterSections,
}
