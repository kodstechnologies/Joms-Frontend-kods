import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const byFinanceTaxSection: FilterSectionConfig = {
  id: 'by-finance-tax',
  title: 'By Tax',
  defaultExpanded: true,
  fields: [
    { id: 'recordId', label: 'Record ID', type: 'text', placeholder: 'Enter Record ID' },
    {
      id: 'module',
      label: 'Entity Type',
      type: 'checkbox-group',
      options: [
        { label: 'Membership', value: 'membership' },
        { label: 'Service', value: 'service' },
        { label: 'Consultation', value: 'consultation' },
        { label: 'Venue', value: 'venue' },
      ],
    },
    { id: 'entityId', label: 'Entity ID', type: 'text', placeholder: 'Enter Entity ID' },
    { id: 'owner', label: 'Owner', type: 'text', placeholder: 'Enter Owner ID' },
    { id: 'bookingId', label: 'Booking ID', type: 'text', placeholder: 'Enter Booking or Tax ID' },
    {
      id: 'taxType',
      label: 'Booking Title / Tax Type',
      type: 'checkbox-group',
      options: [
        { label: 'GST', value: 'GST' },
        { label: 'TDS', value: 'TDS' },
      ],
    },
    {
      id: 'filingStatus',
      label: 'Status',
      type: 'checkbox-group',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Filed', value: 'filed' },
        { label: 'Completed', value: 'completed' },
      ],
    },
    {
      id: 'amount',
      label: 'Revenue',
      type: 'number-range',
      fromPlaceholder: 'Min',
      toPlaceholder: 'Max',
    },
    { id: 'region', label: 'Region', type: 'text', placeholder: 'Enter Region' },
    {
      id: 'filingPeriod',
      label: 'Filing Period',
      type: 'text',
      placeholder: 'Enter Filing Period',
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

const financeTaxFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(byFinanceTaxSection, 'tax'),
]

export const financeTaxFilterConfig: ModuleFilterConfig = {
  moduleKey: 'finance-tax',
  moduleName: 'Finance Tax',
  sections: financeTaxFilterSections,
  exportSections: financeTaxFilterSections,
}
