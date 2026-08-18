import type { ModuleFilterConfig } from '@/shared/types/data-filter'

import { createStandardModuleSections } from './base-filter-sections'

/**
 * Full advanced-filter field set for Expert Management.
 * Partner-document filters are handled in auth-service; computed metrics
 * (clients, orders, revenue, reviews, etc.) are evaluated in admin-service.
 */
export const expertManagementFilterConfig: ModuleFilterConfig = {
  moduleKey: 'expert-management',
  moduleName: 'Expert Management',
  sections: createStandardModuleSections(),
}
