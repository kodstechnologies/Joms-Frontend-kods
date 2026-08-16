import type { ModuleFilterConfig, ModuleFilterKey } from '@/shared/types/data-filter'

import { createStandardModuleSections } from './base-filter-sections'
import { serviceManagementFilterConfig } from './service-management.config'
import { venueCategoryManagementFilterConfig } from './venue-category-management.config'
import { venueManagementFilterConfig } from './venue-management.config'
import { serviceCategoryManagementFilterConfig } from './service-category-management.config'
import { communicationManagementFilterConfig } from './communication-management.config'
import { referralManagementFilterConfig } from './referral-management.config'
import { rbacManagementFilterConfig } from './rbac-management.config'
import { leaderboardManagementFilterConfig } from './leaderboard-management.config'

const moduleNames: Record<ModuleFilterKey, string> = {
  'expert-management': 'Expert Management',
  'service-management': 'Service Management',
  'venue-management': 'Venue Management',
  'service-category-management': 'Service Category Management',
  'venue-category-management': 'Venue Category Management',
  'communication-management': 'Communication Management',
  'referral-management': 'Referral Management',
  'rbac-management': 'RBAC Management',
  'leaderboard-management': 'Leaderboard Management',
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
  'service-category-management': serviceCategoryManagementFilterConfig,
  'venue-category-management': venueCategoryManagementFilterConfig,
  'communication-management': communicationManagementFilterConfig,
  'referral-management': referralManagementFilterConfig,
  'rbac-management': rbacManagementFilterConfig,
  'leaderboard-management': leaderboardManagementFilterConfig,
}

export function getModuleFilterConfig(moduleKey: ModuleFilterKey): ModuleFilterConfig {
  return moduleFilterConfigs[moduleKey]
}
