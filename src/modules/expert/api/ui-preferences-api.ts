import { adminApiClient } from '@/shared/lib/axios'

export const EXPERT_MANAGEMENT_MODULE_KEY = 'expert-management'
export const EXPERT_PENDING_APPROVALS_MODULE_KEY = 'expert-pending-approvals'
export const EXPERT_REPORTED_MODULE_KEY = 'expert-reported'
export const EXPERT_SUSPENDED_MODULE_KEY = 'expert-suspended'
export const EXPERT_DELETED_MODULE_KEY = 'expert-deleted'
export const EXPERT_DASHBOARD_MODULE_KEY = 'expert-dashboard'
export const SERVICE_MANAGEMENT_MODULE_KEY = 'service-management'
export const SERVICE_PENDING_APPROVALS_MODULE_KEY = 'service-pending-approvals'
export const SERVICE_REPORTED_MODULE_KEY = 'service-reported'
export const SERVICE_SUSPENDED_MODULE_KEY = 'service-suspended'
export const SERVICE_DELETED_MODULE_KEY = 'service-deleted'
export const SERVICE_DASHBOARD_MODULE_KEY = 'service-dashboard'
export const SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY = 'service-category-management'
export const EXPERT_CATEGORY_MANAGEMENT_MODULE_KEY = 'expert-category-management'
export const VENUE_MANAGEMENT_MODULE_KEY = 'venue-management'
export const VENUE_DASHBOARD_MODULE_KEY = 'venue-dashboard'
export const VENUE_CATEGORY_MANAGEMENT_MODULE_KEY = 'venue-category-management'

export type TableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export type DashboardMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

export type TableColumnPreferences = {
  moduleKey: string
  catalog: TableColumnCatalogItem[]
  visibleColumnIds: string[]
  isDefault: boolean
}

export type DashboardMetricPreferences = {
  moduleKey: string
  catalog: DashboardMetricCatalogItem[]
  activeMetricIds: string[]
  isDefault: boolean
}

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export const fetchTableColumnPreferences = async (moduleKey: string) => {
  const response = await adminApiClient.get<ApiEnvelope<TableColumnPreferences>>(
    `/admin/ui-preferences/${moduleKey}/table-columns`,
  )
  return response.data.data
}

export const saveTableColumnPreferences = async (moduleKey: string, visibleColumnIds: string[]) => {
  const response = await adminApiClient.put<ApiEnvelope<TableColumnPreferences>>(
    `/admin/ui-preferences/${moduleKey}/table-columns`,
    { visibleColumnIds },
  )
  return response.data.data
}

export const resetTableColumnPreferences = async (moduleKey: string) => {
  const response = await adminApiClient.post<ApiEnvelope<TableColumnPreferences>>(
    `/admin/ui-preferences/${moduleKey}/table-columns/reset`,
  )
  return response.data.data
}

export const fetchDashboardMetricPreferences = async (moduleKey: string) => {
  const response = await adminApiClient.get<ApiEnvelope<DashboardMetricPreferences>>(
    `/admin/ui-preferences/${moduleKey}/dashboard-metrics`,
  )
  return response.data.data
}

export const saveDashboardMetricPreferences = async (
  moduleKey: string,
  activeMetricIds: string[],
) => {
  const response = await adminApiClient.put<ApiEnvelope<DashboardMetricPreferences>>(
    `/admin/ui-preferences/${moduleKey}/dashboard-metrics`,
    { activeMetricIds },
  )
  return response.data.data
}

export const resetDashboardMetricPreferences = async (moduleKey: string) => {
  const response = await adminApiClient.post<ApiEnvelope<DashboardMetricPreferences>>(
    `/admin/ui-preferences/${moduleKey}/dashboard-metrics/reset`,
  )
  return response.data.data
}
