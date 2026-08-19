import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const byFinanceEventsSection: FilterSectionConfig = {
  id: 'by-finance-events',
  title: 'By Event',
  defaultExpanded: true,
  fields: [
    { id: 'eventId', label: 'Event ID', type: 'text', placeholder: 'Enter Event ID' },
    { id: 'eventName', label: 'Event Name', type: 'text', placeholder: 'Enter Event Name' },
    { id: 'organizer', label: 'Organizer', type: 'text', placeholder: 'Enter Organizer' },
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox-group',
      options: [
        { label: 'Paid', value: 'Paid' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Refunded', value: 'Refunded' },
      ],
    },
    { id: 'eventDate', label: 'Event Date', type: 'text', placeholder: 'Enter Event Date' },
  ],
}

const financeEventsFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(byFinanceEventsSection, 'events'),
]

export const financeEventsFilterConfig: ModuleFilterConfig = {
  moduleKey: 'finance-events',
  moduleName: 'Finance Events',
  sections: financeEventsFilterSections,
  exportSections: financeEventsFilterSections,
}
