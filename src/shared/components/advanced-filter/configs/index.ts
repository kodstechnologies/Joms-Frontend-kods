import type { ModuleFilterConfig, ModuleFilterKey } from '@/shared/types/data-filter'

import { expertManagementFilterConfig } from './expert-management.config'
import { serviceManagementFilterConfig } from './service-management.config'
import { venueCategoryManagementFilterConfig } from './venue-category-management.config'
import { venueManagementFilterConfig } from './venue-management.config'
import { serviceCategoryManagementFilterConfig } from './service-category-management.config'
import { communicationManagementFilterConfig } from './communication-management.config'
import { referralManagementFilterConfig } from './referral-management.config'
import { revenueOverviewFilterConfig } from './revenue-overview.config'
import { financeServicesFilterConfig } from './finance-services.config'
import { financeVenuesFilterConfig } from './finance-venues.config'
import { financeMembershipsFilterConfig } from './finance-memberships.config'
import { financePayoutsFilterConfig } from './finance-payouts.config'
import { financeRefundsFilterConfig } from './finance-refunds.config'
import { financeTaxFilterConfig } from './finance-tax.config'
import { financeInvoicesFilterConfig } from './finance-invoices.config'
import { financeReconciliationFilterConfig } from './finance-reconciliation.config'
import { financeEscrowFilterConfig } from './finance-escrow.config'
import { financeEventsFilterConfig } from './finance-events.config'
import { financeCategoriesFilterConfig } from './finance-categories.config'
import { expertMembershipsFilterConfig } from './expert-memberships.config'
import { expertClienteleFilterConfig } from './expert-clientele.config'
import { expertProfileServicesFilterConfig } from './expert-profile-services.config'
import { supportTicketsFilterConfig } from './support-tickets.config'
import { rbacManagementFilterConfig } from './rbac-management.config'
import { rbacInvitesFilterConfig } from './rbac-invites.config'
import { rbacAdminLogsFilterConfig } from './rbac-admin-logs.config'
import { settingsLogsFilterConfig } from './settings-logs.config'
import { loginTrailsFilterConfig } from './login-trails.config'
import { incidentsFilterConfig } from './incidents.config'
import { backupsFilterConfig } from './backups.config'
import { escalationsFilterConfig } from './escalations.config'
import { leaderboardManagementFilterConfig } from './leaderboard-management.config'
import { servicePerformanceFilterConfig } from './service-performance.config'
import { consultationPerformanceFilterConfig } from './consultation-performance.config'
import { venueProfileSpacesFilterConfig } from './venue-profile-spaces.config'

export const moduleFilterConfigs: Record<ModuleFilterKey, ModuleFilterConfig> = {
  'expert-management': expertManagementFilterConfig,
  'expert-pending-approvals': expertManagementFilterConfig,
  'expert-reported': expertManagementFilterConfig,
  'expert-suspended': expertManagementFilterConfig,
  'expert-deleted': expertManagementFilterConfig,
  'service-management': serviceManagementFilterConfig,
  'service-pending-approvals': serviceManagementFilterConfig,
  'service-reported': serviceManagementFilterConfig,
  'service-suspended': serviceManagementFilterConfig,
  'service-deleted': serviceManagementFilterConfig,
  'venue-management': venueManagementFilterConfig,
  'service-category-management': serviceCategoryManagementFilterConfig,
  'venue-category-management': venueCategoryManagementFilterConfig,
  'communication-management': communicationManagementFilterConfig,
  'referral-management': referralManagementFilterConfig,
  'finance-revenue': revenueOverviewFilterConfig,
  'finance-services': financeServicesFilterConfig,
  'finance-venues': financeVenuesFilterConfig,
  'finance-memberships': financeMembershipsFilterConfig,
  'finance-payouts': financePayoutsFilterConfig,
  'finance-refunds': financeRefundsFilterConfig,
  'finance-tax': financeTaxFilterConfig,
  'finance-invoices': financeInvoicesFilterConfig,
  'finance-reconciliation': financeReconciliationFilterConfig,
  'finance-escrow': financeEscrowFilterConfig,
  'finance-events': financeEventsFilterConfig,
  'finance-categories': financeCategoriesFilterConfig,
  'expert-memberships': expertMembershipsFilterConfig,
  'expert-clientele': expertClienteleFilterConfig,
  'expert-profile-services': expertProfileServicesFilterConfig,
  'support-tickets': supportTicketsFilterConfig,
  'rbac-management': rbacManagementFilterConfig,
  'rbac-invites': rbacInvitesFilterConfig,
  'rbac-admin-logs': rbacAdminLogsFilterConfig,
  'settings-logs': settingsLogsFilterConfig,
  'login-trails': loginTrailsFilterConfig,
  incidents: incidentsFilterConfig,
  backups: backupsFilterConfig,
  escalations: escalationsFilterConfig,
  'leaderboard-management': leaderboardManagementFilterConfig,
  'service-performance': servicePerformanceFilterConfig,
  'consultation-performance': consultationPerformanceFilterConfig,
  'venue-profile-spaces': venueProfileSpacesFilterConfig,
}

export function getModuleFilterConfig(moduleKey: ModuleFilterKey): ModuleFilterConfig {
  return moduleFilterConfigs[moduleKey]
}
