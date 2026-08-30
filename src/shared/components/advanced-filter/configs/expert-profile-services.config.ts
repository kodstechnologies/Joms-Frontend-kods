import type { ModuleFilterConfig } from '@/shared/types/data-filter'

import { expertProfileServicesFilterSections } from './expert-management-filters.config'

export const expertProfileServicesFilterConfig: ModuleFilterConfig = {
  moduleKey: 'expert-profile-services',
  moduleName: 'Expert Management',
  sections: expertProfileServicesFilterSections,
  exportSections: expertProfileServicesFilterSections,
}
