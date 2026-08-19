import type { ModuleFilterConfig } from '@/shared/types/data-filter'

import { figmaExpertManagementFilterSections } from './figma-expert-management-filters.config'

/** Figma-exact Advanced Filters — Expert Management list pages. */
export const expertManagementFilterConfig: ModuleFilterConfig = {
  moduleKey: 'expert-management',
  moduleName: 'Expert Management',
  sections: figmaExpertManagementFilterSections,
  exportSections: figmaExpertManagementFilterSections,
}
