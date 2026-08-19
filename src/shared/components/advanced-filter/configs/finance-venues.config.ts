import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const byFinanceVenuesSection: FilterSectionConfig = {
  id: 'by-finance-venues',
  title: 'By Venue',
  defaultExpanded: true,
  fields: [
    { id: 'venueId', label: 'Venue ID', type: 'text', placeholder: 'Enter Venue ID' },
    { id: 'name', label: 'Name', type: 'text', placeholder: 'Enter Name' },
    { id: 'owner', label: 'Owner', type: 'text', placeholder: 'Enter Owner Name' },
    { id: 'bookingId', label: 'Booking ID', type: 'text', placeholder: 'Enter Booking ID' },
    {
      id: 'bookingTitle',
      label: 'Booking Title',
      type: 'text',
      placeholder: 'Enter Booking Title',
    },
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox-group',
      options: [
        { label: 'Completed', value: 'Completed' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Cancelled', value: 'Cancelled' },
      ],
    },
    {
      id: 'amount',
      label: 'Revenue',
      type: 'number-range',
      fromPlaceholder: 'Min',
      toPlaceholder: 'Max',
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
      id: 'createdAt',
      label: 'Created On',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
  ],
}

const financeVenuesFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(byFinanceVenuesSection, 'venues'),
]

export const financeVenuesFilterConfig: ModuleFilterConfig = {
  moduleKey: 'finance-venues',
  moduleName: 'Finance Venues',
  sections: financeVenuesFilterSections,
  exportSections: financeVenuesFilterSections,
}
