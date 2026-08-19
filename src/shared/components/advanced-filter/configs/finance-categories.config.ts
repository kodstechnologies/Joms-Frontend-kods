import type { FilterSectionConfig, ModuleFilterConfig } from '@/shared/types/data-filter'

import { prefixSectionFields } from './base-filter-sections'

const byFinanceCategoriesSection: FilterSectionConfig = {
  id: 'by-finance-categories',
  title: 'By Category',
  defaultExpanded: true,
  fields: [
    {
      id: 'categoryName',
      label: 'Category Name',
      type: 'text',
      placeholder: 'Enter Category Name',
    },
    {
      id: 'module',
      label: 'Module',
      type: 'checkbox-group',
      options: [
        { label: 'Events', value: 'Events' },
        { label: 'Services', value: 'Services' },
        { label: 'Venues', value: 'Venues' },
        { label: 'Memberships', value: 'Memberships' },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox-group',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Paused', value: 'Paused' },
      ],
    },
    { id: 'payoutCycle', label: 'Payout Cycle', type: 'text', placeholder: 'Enter Payout Cycle' },
  ],
}

const financeCategoriesFilterSections: FilterSectionConfig[] = [
  prefixSectionFields(byFinanceCategoriesSection, 'categories'),
]

export const financeCategoriesFilterConfig: ModuleFilterConfig = {
  moduleKey: 'finance-categories',
  moduleName: 'Finance Categories',
  sections: financeCategoriesFilterSections,
  exportSections: financeCategoriesFilterSections,
}
