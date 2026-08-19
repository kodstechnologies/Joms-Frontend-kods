import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const byIncidentsSection: FilterSectionConfig = {
  id: 'by-incidents',
  title: 'By Incident',
  defaultExpanded: true,
  fields: [
    { id: 'incidentId', label: 'Incident ID', type: 'text', placeholder: 'Enter Incident ID' },
    {
      id: 'severity',
      label: 'Severity',
      type: 'checkbox-group',
      options: [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' },
        { label: 'Critical', value: 'Critical' },
      ],
    },
    { id: 'module', label: 'Module', type: 'text', placeholder: 'Enter Module' },
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox-group',
      options: [
        { label: 'Open', value: 'Open' },
        { label: 'Investigating', value: 'Investigating' },
        { label: 'Resolved', value: 'Resolved' },
      ],
    },
    { id: 'assignee', label: 'Assignee', type: 'text', placeholder: 'Enter Assignee' },
    {
      id: 'createdAt',
      label: 'Created On',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
  ],
}

const incidentsFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(byIncidentsSection, 'incidents'),
]

export const incidentsFilterConfig: ModuleFilterConfig = {
  moduleKey: 'incidents',
  moduleName: 'Incident Tracking',
  sections: incidentsFilterSections,
  exportSections: incidentsFilterSections,
}
