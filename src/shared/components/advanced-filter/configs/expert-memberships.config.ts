import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const byExpertMembershipsSection: FilterSectionConfig = {
  id: 'by-expert-memberships',
  title: 'By Membership',
  defaultExpanded: true,
  fields: [
    { id: 'subscriptionId', label: 'Plan ID', type: 'text', placeholder: 'Enter Plan ID' },
    { id: 'partnerName', label: 'Username', type: 'text', placeholder: 'Enter Username' },
    { id: 'planName', label: 'Plan Name', type: 'text', placeholder: 'Enter Plan Name' },
    {
      id: 'billingCycleName',
      label: 'Plan Cycle',
      type: 'text',
      placeholder: 'Enter Billing Cycle',
    },
    {
      id: 'autoRenew',
      label: 'Auto Renewal',
      type: 'checkbox-group',
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
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
      label: 'Started At',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
    {
      id: 'expiresAt',
      label: 'Expiry At',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
    {
      id: 'purchasedPrice',
      label: 'Price',
      type: 'number-range',
      fromPlaceholder: 'Min',
      toPlaceholder: 'Max',
    },
  ],
}

const expertMembershipsFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(byExpertMembershipsSection, 'memberships'),
]

export const expertMembershipsFilterConfig: ModuleFilterConfig = {
  moduleKey: 'expert-memberships',
  moduleName: 'Expert Memberships',
  sections: expertMembershipsFilterSections,
  exportSections: expertMembershipsFilterSections,
}
