import type { ModuleFilterConfig } from '@/shared/types/data-filter'

import { expertManagementFilterSections } from './expert-management-filters.config'

export const expertManagementFilterConfig: ModuleFilterConfig = {
  moduleKey: 'expert-management',
  moduleName: 'Expert Management',
  sections: expertManagementFilterSections,
  exportSections: expertManagementFilterSections,
}
