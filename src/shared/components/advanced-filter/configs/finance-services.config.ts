import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const byFinanceServicesSection: FilterSectionConfig = {
  id: 'by-finance-services',
  title: 'By Service',
  defaultExpanded: true,
  fields: [
    { id: 'serviceId', label: 'Service ID', type: 'text', placeholder: 'Enter Service ID' },
    { id: 'name', label: 'Name', type: 'text', placeholder: 'Enter Name' },
    { id: 'expertName', label: 'Expert Name', type: 'text', placeholder: 'Enter Expert Name' },
    { id: 'bookingId', label: 'Booking ID', type: 'text', placeholder: 'Enter Booking ID' },
    { id: 'userName', label: 'User Name', type: 'text', placeholder: 'Enter User Name' },
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox-group',
      options: [
        { label: 'Paid', value: 'Paid' },
        { label: 'Pending', value: 'Pending' },
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
      id: 'module',
      label: 'Module',
      type: 'checkbox-group',
      options: [
        { label: 'Service', value: 'service' },
        { label: 'Consultation', value: 'consultation' },
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
      id: 'createdAt',
      label: 'Created On',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
  ],
}

const financeServicesFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(byFinanceServicesSection, 'services'),
]

export const financeServicesFilterConfig: ModuleFilterConfig = {
  moduleKey: 'finance-services',
  moduleName: 'Finance Services',
  sections: financeServicesFilterSections,
  exportSections: financeServicesFilterSections,
}
