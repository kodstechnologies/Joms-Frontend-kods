import type { ModuleFilterConfig } from '@/shared/types/data-filter'

import { figmaExpertProfileServicesFilterSections } from './figma-expert-management-filters.config'

/** Figma-exact Advanced Filters — Expert Profile → Service Listings → Services. */
export const expertProfileServicesFilterConfig: ModuleFilterConfig = {
  moduleKey: 'expert-profile-services',
  moduleName: 'Expert Management',
  sections: figmaExpertProfileServicesFilterSections,
  exportSections: figmaExpertProfileServicesFilterSections,
}
