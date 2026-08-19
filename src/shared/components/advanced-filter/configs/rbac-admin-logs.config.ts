import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const byRbacAdminLogsSection: FilterSectionConfig = {
  id: 'by-rbac-admin-logs',
  title: 'By Action Log',
  defaultExpanded: true,
  fields: [
    { id: 'action', label: 'Activity', type: 'text', placeholder: 'Enter Activity' },
    { id: 'username', label: 'Username', type: 'text', placeholder: 'Enter Username' },
    { id: 'module', label: 'Module', type: 'text', placeholder: 'Enter Module' },
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox-group',
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    { id: 'ipAddress', label: 'IP Address', type: 'text', placeholder: 'Enter IP Address' },
    { id: 'adminNote', label: 'Admin Note', type: 'text', placeholder: 'Enter Admin Note' },
    {
      id: 'createdAt',
      label: 'Timestamp',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
  ],
}

const rbacAdminLogsFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(byRbacAdminLogsSection, 'logs'),
]

export const rbacAdminLogsFilterConfig: ModuleFilterConfig = {
  moduleKey: 'rbac-admin-logs',
  moduleName: 'Action Logs',
  sections: rbacAdminLogsFilterSections,
  exportSections: rbacAdminLogsFilterSections,
}
