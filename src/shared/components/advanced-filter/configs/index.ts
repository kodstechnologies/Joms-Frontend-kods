import type { ModuleFilterConfig, ModuleFilterKey } from '@/shared/types/data-filter'

import { expertManagementFilterConfig } from './expert-management.config'
import { serviceManagementFilterConfig } from './service-management.config'
import { venueCategoryManagementFilterConfig } from './venue-category-management.config'
import { venueManagementFilterConfig } from './venue-management.config'
import { serviceCategoryManagementFilterConfig } from './service-category-management.config'
import { communicationManagementFilterConfig } from './communication-management.config'
import { referralManagementFilterConfig } from './referral-management.config'
import { rbacManagementFilterConfig } from './rbac-management.config'
import { leaderboardManagementFilterConfig } from './leaderboard-management.config'

export const moduleFilterConfigs: Record<ModuleFilterKey, ModuleFilterConfig> = {
  'expert-management': expertManagementFilterConfig,
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
