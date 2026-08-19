import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const bySettingsLogsSection: FilterSectionConfig = {
  id: 'by-settings-logs',
  title: 'By Settings Log',
  defaultExpanded: true,
  fields: [
    {
      id: 'createdAt',
      label: 'Timestamp',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
    { id: 'module', label: 'Module', type: 'text', placeholder: 'Enter Module' },
    {
      id: 'action',
      label: 'Action',
      type: 'checkbox-group',
      options: [
        { label: 'Update', value: 'update' },
        { label: 'Reset', value: 'reset' },
        { label: 'Restore', value: 'restore' },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox-group',
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Failed', value: 'failed' },
        { label: 'Pending', value: 'pending' },
      ],
    },
    { id: 'performedBy', label: 'Performed By', type: 'text', placeholder: 'Enter Admin' },
    { id: 'ipAddress', label: 'IP', type: 'text', placeholder: 'Enter IP Address' },
  ],
}

const settingsLogsFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(bySettingsLogsSection, 'logs'),
]

export const settingsLogsFilterConfig: ModuleFilterConfig = {
  moduleKey: 'settings-logs',
  moduleName: 'Settings Logs',
  sections: settingsLogsFilterSections,
  exportSections: settingsLogsFilterSections,
}
