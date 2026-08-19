import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const byBackupsSection: FilterSectionConfig = {
  id: 'by-backups',
  title: 'By Backup',
  defaultExpanded: true,
  fields: [
    { id: 'name', label: 'Backup ID / Name', type: 'text', placeholder: 'Enter Backup Name' },
    {
      id: 'type',
      label: 'Type',
      type: 'checkbox-group',
      options: [
        { label: 'Automatic', value: 'Automatic' },
        { label: 'Manual', value: 'Manual' },
      ],
    },
    {
      id: 'scope',
      label: 'Scope',
      type: 'checkbox-group',
      options: [
        { label: 'Full System', value: 'Full System' },
        { label: 'Partial', value: 'Partial' },
      ],
    },
    { id: 'createdBy', label: 'Created By', type: 'text', placeholder: 'Enter Created By' },
    {
      id: 'createdAt',
      label: 'Timestamp',
      type: 'date-range',
      fromPlaceholder: 'From',
      toPlaceholder: 'To',
    },
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox-group',
      options: [
        { label: 'Completed', value: 'Completed' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Failed', value: 'Failed' },
      ],
    },
  ],
}

const backupsFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(byBackupsSection, 'backups'),
]

export const backupsFilterConfig: ModuleFilterConfig = {
  moduleKey: 'backups',
  moduleName: 'Backups & Restore',
  sections: backupsFilterSections,
  exportSections: backupsFilterSections,
}
