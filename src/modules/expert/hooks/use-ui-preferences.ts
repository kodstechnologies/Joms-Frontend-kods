import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchCommunicationDashboardMetricPreferences,
  resetCommunicationDashboardMetricPreferences,
  saveCommunicationDashboardMetricPreferences,
} from '@/modules/communication/api/communication-ui-preferences'
import { COMMUNICATION_MODULE_KEY } from '@/modules/communication/config/communication-metrics.config'
import {
  fetchMembershipDashboardMetricPreferences,
  resetMembershipDashboardMetricPreferences,
  saveMembershipDashboardMetricPreferences,
} from '@/modules/memberships/api/membership-ui-preferences'
import { MEMBERSHIPS_MODULE_KEY } from '@/modules/memberships/config/membership-metrics.config'
import {
  fetchExecutiveDashboardMetricPreferences,
  resetExecutiveDashboardMetricPreferences,
  saveExecutiveDashboardMetricPreferences,
} from '@/modules/dashboard/api/executive-ui-preferences'
import { EXECUTIVE_OVERVIEW_MODULE_KEY } from '@/modules/dashboard/config/executive-overview-metrics.config'
import {
  fetchFinanceDashboardMetricPreferences,
  resetFinanceDashboardMetricPreferences,
  saveFinanceDashboardMetricPreferences,
} from '@/modules/payments/api/finance-dashboard-ui-preferences'
import { FINANCE_DASHBOARD_MODULE_KEY } from '@/modules/payments/config/finance-dashboard-metrics.config'
import {
  fetchFinanceRefundsDashboardMetricPreferences,
  resetFinanceRefundsDashboardMetricPreferences,
  saveFinanceRefundsDashboardMetricPreferences,
} from '@/modules/payments/api/finance-refunds-ui-preferences'
import { FINANCE_REFUNDS_MODULE_KEY } from '@/modules/payments/config/finance-refunds-metrics.config'
import {
  fetchRbacHubDashboardMetricPreferences,
  resetRbacHubDashboardMetricPreferences,
  saveRbacHubDashboardMetricPreferences,
} from '@/modules/rbac/api/rbac-ui-preferences'
import { RBAC_HUB_MODULE_KEY } from '@/modules/rbac/config/rbac-metrics.config'
import {
  fetchSupportDashboardMetricPreferences,
  resetSupportDashboardMetricPreferences,
  saveSupportDashboardMetricPreferences,
} from '@/modules/support-management/api/support-dashboard-ui-preferences'
import { SUPPORT_DASHBOARD_MODULE_KEY } from '@/modules/support-management/config/support-dashboard-metrics.config'
import {
  fetchEscalationsDashboardMetricPreferences,
  resetEscalationsDashboardMetricPreferences,
  saveEscalationsDashboardMetricPreferences,
} from '@/modules/settings/api/escalations-ui-preferences'
import { ESCALATIONS_MODULE_KEY } from '@/modules/settings/config/escalations-metrics.config'
import {
  fetchTicketManagementDashboardMetricPreferences,
  resetTicketManagementDashboardMetricPreferences,
  saveTicketManagementDashboardMetricPreferences,
} from '@/modules/support-management/api/ticket-management-ui-preferences'
import { TICKET_MANAGEMENT_MODULE_KEY } from '@/modules/support-management/config/ticket-management-metrics.config'
import {
  fetchPlatformHealthDashboardMetricPreferences,
  resetPlatformHealthDashboardMetricPreferences,
  savePlatformHealthDashboardMetricPreferences,
} from '@/modules/settings/api/platform-health-ui-preferences'
import { PLATFORM_HEALTH_MODULE_KEY } from '@/modules/settings/config/platform-health-metrics.config'
import {
  fetchExpertProfileAnalyticsDashboardMetricPreferences,
  resetExpertProfileAnalyticsDashboardMetricPreferences,
  saveExpertProfileAnalyticsDashboardMetricPreferences,
} from '@/modules/expert/api/expert-profile-analytics-ui-preferences'
import { EXPERT_PROFILE_ANALYTICS_MODULE_KEY } from '@/modules/expert/config/expert-profile-analytics-metrics.config'
import {
  fetchVenueProfileAnalyticsDashboardMetricPreferences,
  resetVenueProfileAnalyticsDashboardMetricPreferences,
  saveVenueProfileAnalyticsDashboardMetricPreferences,
} from '@/modules/expert/api/venue-profile-analytics-ui-preferences'
import { VENUE_PROFILE_ANALYTICS_MODULE_KEY } from '@/modules/expert/config/venue-profile-analytics-metrics.config'
import {
  fetchVenueViewAnalyticsDashboardMetricPreferences,
  resetVenueViewAnalyticsDashboardMetricPreferences,
  saveVenueViewAnalyticsDashboardMetricPreferences,
} from '@/modules/expert/api/venue-view-analytics-ui-preferences'
import { VENUE_VIEW_ANALYTICS_MODULE_KEY } from '@/modules/expert/config/venue-view-analytics-metrics.config'
import {
  fetchDashboardMetricPreferences,
  fetchTableColumnPreferences,
  resetDashboardMetricPreferences,
  resetTableColumnPreferences,
  saveDashboardMetricPreferences,
  saveTableColumnPreferences,
} from '../api/ui-preferences-api'

export const tableColumnPreferencesQueryKey = (moduleKey: string) =>
  ['ui-preferences', moduleKey, 'table-columns'] as const

export const dashboardMetricPreferencesQueryKey = (moduleKey: string) =>
  ['ui-preferences', moduleKey, 'dashboard-metrics'] as const

function fetchDashboardMetricPreferencesForModule(moduleKey: string) {
  if (moduleKey === EXECUTIVE_OVERVIEW_MODULE_KEY) {
    return fetchExecutiveDashboardMetricPreferences()
  }
  if (moduleKey === COMMUNICATION_MODULE_KEY) {
    return fetchCommunicationDashboardMetricPreferences()
  }
  if (moduleKey === MEMBERSHIPS_MODULE_KEY) {
    return fetchMembershipDashboardMetricPreferences()
  }
  if (moduleKey === FINANCE_DASHBOARD_MODULE_KEY) {
    return fetchFinanceDashboardMetricPreferences()
  }
  if (moduleKey === PLATFORM_HEALTH_MODULE_KEY) {
    return fetchPlatformHealthDashboardMetricPreferences()
  }
  if (moduleKey === FINANCE_REFUNDS_MODULE_KEY) {
    return fetchFinanceRefundsDashboardMetricPreferences()
  }
  if (moduleKey === RBAC_HUB_MODULE_KEY) {
    return fetchRbacHubDashboardMetricPreferences()
  }
  if (moduleKey === SUPPORT_DASHBOARD_MODULE_KEY) {
    return fetchSupportDashboardMetricPreferences()
  }
  if (moduleKey === ESCALATIONS_MODULE_KEY) {
    return fetchEscalationsDashboardMetricPreferences()
  }
  if (moduleKey === TICKET_MANAGEMENT_MODULE_KEY) {
    return fetchTicketManagementDashboardMetricPreferences()
  }
  if (moduleKey === EXPERT_PROFILE_ANALYTICS_MODULE_KEY) {
    return fetchExpertProfileAnalyticsDashboardMetricPreferences()
  }
  if (moduleKey === VENUE_PROFILE_ANALYTICS_MODULE_KEY) {
    return fetchVenueProfileAnalyticsDashboardMetricPreferences()
  }
  if (moduleKey === VENUE_VIEW_ANALYTICS_MODULE_KEY) {
    return fetchVenueViewAnalyticsDashboardMetricPreferences()
  }
  return fetchDashboardMetricPreferences(moduleKey)
}

function saveDashboardMetricPreferencesForModule(moduleKey: string, activeMetricIds: string[]) {
  if (moduleKey === EXECUTIVE_OVERVIEW_MODULE_KEY) {
    return saveExecutiveDashboardMetricPreferences(activeMetricIds)
  }
  if (moduleKey === COMMUNICATION_MODULE_KEY) {
    return saveCommunicationDashboardMetricPreferences(activeMetricIds)
  }
  if (moduleKey === MEMBERSHIPS_MODULE_KEY) {
    return saveMembershipDashboardMetricPreferences(activeMetricIds)
  }
  if (moduleKey === FINANCE_DASHBOARD_MODULE_KEY) {
    return saveFinanceDashboardMetricPreferences(activeMetricIds)
  }
  if (moduleKey === PLATFORM_HEALTH_MODULE_KEY) {
    return savePlatformHealthDashboardMetricPreferences(activeMetricIds)
  }
  if (moduleKey === FINANCE_REFUNDS_MODULE_KEY) {
    return saveFinanceRefundsDashboardMetricPreferences(activeMetricIds)
  }
  if (moduleKey === RBAC_HUB_MODULE_KEY) {
    return saveRbacHubDashboardMetricPreferences(activeMetricIds)
  }
  if (moduleKey === SUPPORT_DASHBOARD_MODULE_KEY) {
    return saveSupportDashboardMetricPreferences(activeMetricIds)
  }
  if (moduleKey === ESCALATIONS_MODULE_KEY) {
    return saveEscalationsDashboardMetricPreferences(activeMetricIds)
  }
  if (moduleKey === TICKET_MANAGEMENT_MODULE_KEY) {
    return saveTicketManagementDashboardMetricPreferences(activeMetricIds)
  }
  if (moduleKey === EXPERT_PROFILE_ANALYTICS_MODULE_KEY) {
    return saveExpertProfileAnalyticsDashboardMetricPreferences(activeMetricIds)
  }
  if (moduleKey === VENUE_PROFILE_ANALYTICS_MODULE_KEY) {
    return saveVenueProfileAnalyticsDashboardMetricPreferences(activeMetricIds)
  }
  if (moduleKey === VENUE_VIEW_ANALYTICS_MODULE_KEY) {
    return saveVenueViewAnalyticsDashboardMetricPreferences(activeMetricIds)
  }
  return saveDashboardMetricPreferences(moduleKey, activeMetricIds)
}

function resetDashboardMetricPreferencesForModule(moduleKey: string) {
  if (moduleKey === EXECUTIVE_OVERVIEW_MODULE_KEY) {
    return resetExecutiveDashboardMetricPreferences()
  }
  if (moduleKey === COMMUNICATION_MODULE_KEY) {
    return resetCommunicationDashboardMetricPreferences()
  }
  if (moduleKey === MEMBERSHIPS_MODULE_KEY) {
    return resetMembershipDashboardMetricPreferences()
  }
  if (moduleKey === FINANCE_DASHBOARD_MODULE_KEY) {
    return resetFinanceDashboardMetricPreferences()
  }
  if (moduleKey === PLATFORM_HEALTH_MODULE_KEY) {
    return resetPlatformHealthDashboardMetricPreferences()
  }
  if (moduleKey === FINANCE_REFUNDS_MODULE_KEY) {
    return resetFinanceRefundsDashboardMetricPreferences()
  }
  if (moduleKey === RBAC_HUB_MODULE_KEY) {
    return resetRbacHubDashboardMetricPreferences()
  }
  if (moduleKey === SUPPORT_DASHBOARD_MODULE_KEY) {
    return resetSupportDashboardMetricPreferences()
  }
  if (moduleKey === ESCALATIONS_MODULE_KEY) {
    return resetEscalationsDashboardMetricPreferences()
  }
  if (moduleKey === TICKET_MANAGEMENT_MODULE_KEY) {
    return resetTicketManagementDashboardMetricPreferences()
  }
  if (moduleKey === EXPERT_PROFILE_ANALYTICS_MODULE_KEY) {
    return resetExpertProfileAnalyticsDashboardMetricPreferences()
  }
  if (moduleKey === VENUE_PROFILE_ANALYTICS_MODULE_KEY) {
    return resetVenueProfileAnalyticsDashboardMetricPreferences()
  }
  if (moduleKey === VENUE_VIEW_ANALYTICS_MODULE_KEY) {
    return resetVenueViewAnalyticsDashboardMetricPreferences()
  }
  return resetDashboardMetricPreferences(moduleKey)
}

export const useTableColumnPreferences = (moduleKey: string, enabled = true) => {
  return useQuery({
    queryKey: tableColumnPreferencesQueryKey(moduleKey),
    queryFn: () => fetchTableColumnPreferences(moduleKey),
    enabled: Boolean(moduleKey) && enabled,
  })
}

export const useSaveTableColumnPreferences = (moduleKey: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (visibleColumnIds: string[]) =>
      saveTableColumnPreferences(moduleKey, visibleColumnIds),
    onSuccess: (data) => {
      queryClient.setQueryData(tableColumnPreferencesQueryKey(moduleKey), data)
    },
  })
}

export const useResetTableColumnPreferences = (moduleKey: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => resetTableColumnPreferences(moduleKey),
    onSuccess: (data) => {
      queryClient.setQueryData(tableColumnPreferencesQueryKey(moduleKey), data)
    },
  })
}

export const useDashboardMetricPreferences = (moduleKey: string, enabled = true) => {
  return useQuery({
    queryKey: dashboardMetricPreferencesQueryKey(moduleKey),
    queryFn: () => fetchDashboardMetricPreferencesForModule(moduleKey),
    enabled: Boolean(moduleKey) && enabled,
  })
}

export const useSaveDashboardMetricPreferences = (moduleKey: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (activeMetricIds: string[]) =>
      saveDashboardMetricPreferencesForModule(moduleKey, activeMetricIds),
    onSuccess: (data) => {
      queryClient.setQueryData(dashboardMetricPreferencesQueryKey(moduleKey), data)
    },
  })
}

export const useResetDashboardMetricPreferences = (moduleKey: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => resetDashboardMetricPreferencesForModule(moduleKey),
    onSuccess: (data) => {
      queryClient.setQueryData(dashboardMetricPreferencesQueryKey(moduleKey), data)
    },
  })
}
