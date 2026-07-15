import { adminApiClient } from '@/shared/lib/axios'

export const EXPERT_MANAGEMENT_MODULE_KEY = 'expert-management'

export type TableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export type TableColumnPreferences = {
  moduleKey: string
  catalog: TableColumnCatalogItem[]
  visibleColumnIds: string[]
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
