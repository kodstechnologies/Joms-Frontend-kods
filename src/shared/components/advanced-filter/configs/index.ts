import type { ModuleFilterConfig, ModuleFilterKey } from '@/shared/types/data-filter'

import { createStandardModuleSections } from './base-filter-sections'
import { serviceManagementFilterConfig } from './service-management.config'
import { venueCategoryManagementFilterConfig } from './venue-category-management.config'
import { venueManagementFilterConfig } from './venue-management.config'

const moduleNames: Record<ModuleFilterKey, string> = {
  'expert-management': 'Expert Management',
  'service-management': 'Service Management',
  'venue-management': 'Venue Management',
  'service-category-management': 'Service Category Management',
  'venue-category-management': 'Venue Category Management',
}

function createModuleConfig(moduleKey: ModuleFilterKey): ModuleFilterConfig {
  return {
    moduleKey,
    moduleName: moduleNames[moduleKey],
    sections: createStandardModuleSections(),
  }
}

export const moduleFilterConfigs: Record<ModuleFilterKey, ModuleFilterConfig> = {
  'expert-management': createModuleConfig('expert-management'),
  'service-management': serviceManagementFilterConfig,
  'venue-management': venueManagementFilterConfig,
  'service-category-management': createModuleConfig('service-category-management'),
  'venue-category-management': venueCategoryManagementFilterConfig,
}

export function getModuleFilterConfig(moduleKey: ModuleFilterKey): ModuleFilterConfig {
  return moduleFilterConfigs[moduleKey]
}
