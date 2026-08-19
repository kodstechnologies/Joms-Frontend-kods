import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const byEscalationsSection: FilterSectionConfig = {
  id: 'by-escalations',
  title: 'By Escalation',
  defaultExpanded: true,
  fields: [
    {
      id: 'escalationId',
      label: 'Escalation ID',
      type: 'text',
      placeholder: 'Enter Escalation ID',
    },
    { id: 'roleId', label: 'Roles ID', type: 'text', placeholder: 'Enter Role ID' },
    { id: 'roleName', label: 'Role Name', type: 'text', placeholder: 'Enter Role Name' },
    { id: 'escalationType', label: 'Escalation Type', type: 'text', placeholder: 'Enter Type' },
    {
      id: 'priority',
      label: 'Priority',
      type: 'checkbox-group',
      options: [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' },
        { label: 'Critical', value: 'Critical' },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox-group',
      options: [
        { label: 'Open', value: 'Open' },
        { label: 'In Review', value: 'In Review' },
        { label: 'Resolved', value: 'Resolved' },
      ],
    },
    {
      id: 'createdOn',
      label: 'Created On',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
  ],
}

const escalationsFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(byEscalationsSection, 'escalations'),
]

export const escalationsFilterConfig: ModuleFilterConfig = {
  moduleKey: 'escalations',
  moduleName: 'Escalations',
  sections: escalationsFilterSections,
  exportSections: escalationsFilterSections,
}
