import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const byLoginTrailsSection: FilterSectionConfig = {
  id: 'by-login-trails',
  title: 'By Login Trail',
  defaultExpanded: true,
  fields: [
    { id: 'adminName', label: 'Admin', type: 'text', placeholder: 'Enter Admin Name' },
    { id: 'adminEmail', label: 'Email', type: 'text', placeholder: 'Enter Email' },
    { id: 'role', label: 'Role', type: 'text', placeholder: 'Enter Role' },
    { id: 'ipAddress', label: 'IP Address', type: 'text', placeholder: 'Enter IP Address' },
    { id: 'action', label: 'Action', type: 'text', placeholder: 'Enter Action' },
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox-group',
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Failed', value: 'failed' },
        { label: 'Blocked', value: 'blocked' },
      ],
    },
    { id: 'location', label: 'Location', type: 'text', placeholder: 'Enter Location' },
    { id: 'device', label: 'Device', type: 'text', placeholder: 'Enter Device' },
    {
      id: 'createdAt',
      label: 'Date',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
  ],
}

const loginTrailsFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(byLoginTrailsSection, 'trails'),
]

export const loginTrailsFilterConfig: ModuleFilterConfig = {
  moduleKey: 'login-trails',
  moduleName: 'Login Trails',
  sections: loginTrailsFilterSections,
  exportSections: loginTrailsFilterSections,
}
