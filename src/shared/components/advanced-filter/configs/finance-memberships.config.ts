import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const byFinanceMembershipsSection: FilterSectionConfig = {
  id: 'by-finance-memberships',
  title: 'By Membership',
  defaultExpanded: true,
  fields: [
    {
      id: 'subscriptionId',
      label: 'Subscription ID',
      type: 'text',
      placeholder: 'Enter Subscription ID',
    },
    { id: 'name', label: 'Name', type: 'text', placeholder: 'Enter Partner Name' },
    { id: 'planName', label: 'Plan Name', type: 'text', placeholder: 'Enter Plan Name' },
    {
      id: 'amount',
      label: 'Amount',
      type: 'number-range',
      fromPlaceholder: 'Min',
      toPlaceholder: 'Max',
    },
    {
      id: 'billingCycleName',
      label: 'Billing Cycle',
      type: 'text',
      placeholder: 'Enter Billing Cycle',
    },
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox-group',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Expired', value: 'expired' },
      ],
    },
    {
      id: 'startedAt',
      label: 'Start Date',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
    {
      id: 'nextBillingDate',
      label: 'Next Billing',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
    {
      id: 'autoRenew',
      label: 'Auto Renew',
      type: 'checkbox-group',
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
    },
    {
      id: 'sourceApp',
      label: 'Source App',
      type: 'text',
      placeholder: 'Enter Source App',
    },
  ],
}

const financeMembershipsFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(byFinanceMembershipsSection, 'memberships'),
]

export const financeMembershipsFilterConfig: ModuleFilterConfig = {
  moduleKey: 'finance-memberships',
  moduleName: 'Finance Memberships',
  sections: financeMembershipsFilterSections,
  exportSections: financeMembershipsFilterSections,
}
