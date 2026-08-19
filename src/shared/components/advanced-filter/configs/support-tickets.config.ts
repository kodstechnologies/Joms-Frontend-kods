import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const bySupportTicketsSection: FilterSectionConfig = {
  id: 'by-support-tickets',
  title: 'By Ticket',
  defaultExpanded: true,
  fields: [
    { id: 'ticketId', label: 'Ticket ID', type: 'text', placeholder: 'Enter Ticket ID' },
    { id: 'subject', label: 'Subject', type: 'text', placeholder: 'Enter Subject' },
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox-group',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'On Hold', value: 'on_hold' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    {
      id: 'priority',
      label: 'Priority',
      type: 'checkbox-group',
      options: [
        { label: 'Critical', value: 'critical' },
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' },
      ],
    },
    { id: 'category', label: 'Category', type: 'text', placeholder: 'Enter Category' },
    { id: 'reporter', label: 'Reporter', type: 'text', placeholder: 'Enter Reporter' },
    { id: 'assignedTo', label: 'Assigned To', type: 'text', placeholder: 'Enter Assignee' },
    {
      id: 'createdAt',
      label: 'Created On',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
  ],
}

const supportTicketsFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(bySupportTicketsSection, 'tickets'),
]

export const supportTicketsFilterConfig: ModuleFilterConfig = {
  moduleKey: 'support-tickets',
  moduleName: 'Ticket Management',
  sections: supportTicketsFilterSections,
  exportSections: supportTicketsFilterSections,
}
