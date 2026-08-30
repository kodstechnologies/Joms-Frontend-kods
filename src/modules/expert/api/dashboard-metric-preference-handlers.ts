import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import {
  clearLocalDashboardMetricIds,
  readLocalDashboardMetricIds,
  writeLocalDashboardMetricIds,
} from '@/shared/lib/local-ui-preferences'

import {
  fetchDashboardMetricPreferences,
  resetDashboardMetricPreferences,
  saveDashboardMetricPreferences,
  type DashboardMetricCatalogItem,
  type DashboardMetricPreferences,
} from './ui-preferences-api'

type MetricCatalogItem = Pick<
  DashboardMetricCatalogItem,
  'id' | 'label' | 'type' | 'description' | 'defaultActive'
>

export function createDashboardMetricPreferenceApi(config: {
  moduleKey: string
  catalog: readonly MetricCatalogItem[]
  catalogIds: readonly string[]
  defaultIds: readonly string[]
  legacyIdMap?: Record<string, string>
}) {
  const catalogIdSet = new Set(config.catalog.map((metric) => metric.id))
  const catalog = config.catalog.map((metric) => ({
    id: metric.id,
    label: metric.label,
    type: metric.type,
    description: metric.description,
    defaultActive: metric.defaultActive,
  }))

  const build = (activeMetricIds: string[], isDefault: boolean): DashboardMetricPreferences => {
    const resolved = config.legacyIdMap
      ? [...new Set(activeMetricIds.map((id) => config.legacyIdMap![id] ?? id))]
      : activeMetricIds
    const filteredIds = sortIdsByCatalogOrder(
      resolved.filter((id) => catalogIdSet.has(id)),
      [...config.catalogIds],
    )

    return {
      moduleKey: config.moduleKey,
      catalog,
      activeMetricIds: filteredIds.length > 0 ? filteredIds : [...config.defaultIds],
      isDefault,
    }
  }

  return {
    fetch: async (): Promise<DashboardMetricPreferences> => {
      try {
        const data = await fetchDashboardMetricPreferences(config.moduleKey)
        const normalized = build(
          data.activeMetricIds?.length ? data.activeMetricIds : [...config.defaultIds],
          data.isDefault,
        )
        writeLocalDashboardMetricIds(config.moduleKey, normalized.activeMetricIds)
        return normalized
      } catch {
        const localIds = readLocalDashboardMetricIds(config.moduleKey)
        if (localIds) return build(localIds, false)
        return build([...config.defaultIds], true)
      }
    },
    save: async (activeMetricIds: string[]): Promise<DashboardMetricPreferences> => {
      const normalizedIds = build(activeMetricIds, false).activeMetricIds
      writeLocalDashboardMetricIds(config.moduleKey, normalizedIds)

      try {
        const data = await saveDashboardMetricPreferences(config.moduleKey, normalizedIds)
        return build(data.activeMetricIds?.length ? data.activeMetricIds : normalizedIds, false)
      } catch {
        return build(normalizedIds, false)
      }
    },
    reset: async (): Promise<DashboardMetricPreferences> => {
      clearLocalDashboardMetricIds(config.moduleKey)
      try {
        await resetDashboardMetricPreferences(config.moduleKey)
      } catch {
        // Local reset is enough when API is unavailable.
      }
      return build([...config.defaultIds], true)
    },
  }
}
