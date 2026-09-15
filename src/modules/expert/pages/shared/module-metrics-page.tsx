import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import {
  useDashboardMetricPreferences,
  useResetDashboardMetricPreferences,
  useResetTableColumnPreferences,
  useSaveDashboardMetricPreferences,
  useSaveTableColumnPreferences,
  useTableColumnPreferences,
} from '../../hooks/use-ui-preferences'
import {
  ManageMetrics,
  type ManageMetricsAvailableItem,
  type ManageMetricsListItem,
} from '@/shared/components/manage-metrics'
import { getModuleMetricsDefinition } from '@/shared/lib/module-metrics-registry'
import {
  dedupeCatalogItems,
  dedupeOrderedIds,
  sortIdsByCatalogOrder,
} from '@/shared/lib/dedupe-ids'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import {
  COMMUNICATION_METRICS_CATALOG,
  COMMUNICATION_METRIC_IDS,
  COMMUNICATION_MODULE_KEY,
} from '@/modules/communication/config/communication-metrics.config'
import {
  EXECUTIVE_OVERVIEW_METRICS_CATALOG,
  EXECUTIVE_OVERVIEW_METRIC_IDS,
  EXECUTIVE_OVERVIEW_MODULE_KEY,
} from '@/modules/dashboard/config/executive-overview-metrics.config'
import {
  FINANCE_DASHBOARD_METRICS_CATALOG,
  FINANCE_DASHBOARD_METRIC_IDS,
  FINANCE_DASHBOARD_MODULE_KEY,
} from '@/modules/payments/config/finance-dashboard-metrics.config'
import {
  MEMBERSHIP_METRICS_CATALOG,
  MEMBERSHIP_METRIC_IDS,
  MEMBERSHIPS_MODULE_KEY,
} from '@/modules/memberships/config/membership-metrics.config'
import {
  FINANCE_REFUNDS_METRICS_CATALOG,
  FINANCE_REFUNDS_METRIC_IDS,
  FINANCE_REFUNDS_MODULE_KEY,
} from '@/modules/payments/config/finance-refunds-metrics.config'
import {
  RBAC_HUB_METRICS_CATALOG,
  RBAC_HUB_METRIC_IDS,
  RBAC_HUB_MODULE_KEY,
} from '@/modules/rbac/config/rbac-metrics.config'
import {
  TICKET_MANAGEMENT_METRICS_CATALOG,
  TICKET_MANAGEMENT_METRIC_IDS,
  TICKET_MANAGEMENT_MODULE_KEY,
} from '@/modules/support-management/config/ticket-management-metrics.config'
import {
  SUPPORT_DASHBOARD_METRICS_CATALOG,
  SUPPORT_DASHBOARD_METRIC_IDS,
  SUPPORT_DASHBOARD_MODULE_KEY,
} from '@/modules/support-management/config/support-dashboard-metrics.config'
import {
  ESCALATIONS_METRICS_CATALOG,
  ESCALATIONS_METRIC_IDS,
  ESCALATIONS_MODULE_KEY,
} from '@/modules/settings/config/escalations-metrics.config'
import {
  PLATFORM_HEALTH_METRICS_CATALOG,
  PLATFORM_HEALTH_METRIC_IDS,
  PLATFORM_HEALTH_MODULE_KEY,
} from '@/modules/settings/config/platform-health-metrics.config'
import {
  EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG,
  EXPERT_PROFILE_ANALYTICS_METRIC_IDS,
  EXPERT_PROFILE_ANALYTICS_MODULE_KEY,
} from '@/modules/expert/config/expert-profile-analytics-metrics.config'
import {
  EXPERT_CLIENTELE_METRIC_IDS,
  EXPERT_CLIENTELE_MODULE_KEY,
} from '@/modules/expert/config/expert-clientele-metrics.config'
import {
  VENUE_PROFILE_ANALYTICS_METRICS_CATALOG,
  VENUE_PROFILE_ANALYTICS_METRIC_IDS,
  VENUE_PROFILE_ANALYTICS_MODULE_KEY,
} from '@/modules/expert/config/venue-profile-analytics-metrics.config'
import {
  VENUE_VIEW_ANALYTICS_METRICS_CATALOG,
  VENUE_VIEW_ANALYTICS_METRIC_IDS,
  VENUE_VIEW_ANALYTICS_MODULE_KEY,
} from '@/modules/expert/config/venue-view-analytics-metrics.config'
import {
  SERVICE_CATEGORY_MANAGEMENT_METRICS_CATALOG,
  SERVICE_CATEGORY_MANAGEMENT_METRIC_IDS,
  SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY,
} from '@/modules/expert/config/service-category-management-metrics.config'
import {
  SERVICE_DASHBOARD_METRICS_CATALOG,
  SERVICE_DASHBOARD_METRIC_IDS,
  SERVICE_DASHBOARD_MODULE_KEY,
} from '@/modules/expert/config/service-dashboard-metrics.config'
import {
  VENUE_CATEGORY_MANAGEMENT_METRICS_CATALOG,
  VENUE_CATEGORY_MANAGEMENT_METRIC_IDS,
  VENUE_CATEGORY_MANAGEMENT_MODULE_KEY,
} from '@/modules/expert/config/venue-category-management-metrics.config'

export type MetricsSection = 'dashboard' | 'table' | 'all'

export type ModuleMetricsPageConfig = {
  moduleKey: string
  moduleName?: string
  returnTo?: string

  includeDashboard?: boolean

  includeTableColumns?: boolean

  section?: MetricsSection
  maxActiveMetrics?: number
}

function parseSectionParam(value: string | null): MetricsSection | undefined {
  if (value === 'dashboard' || value === 'table' || value === 'all') return value
  return undefined
}

export function ModuleMetricsPage({
  moduleKey,
  moduleName: moduleNameProp,
  returnTo: returnToProp,
  includeDashboard: includeDashboardProp,
  includeTableColumns: includeTableColumnsProp,
  section: sectionProp,
  maxActiveMetrics: maxActiveProp,
}: ModuleMetricsPageConfig) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const registry = getModuleMetricsDefinition(moduleKey)

  const moduleName = moduleNameProp ?? registry?.moduleName ?? 'Module'
  const returnTo = returnToProp ?? registry?.returnTo ?? '/'
  const maxActiveMetrics =
    maxActiveProp ?? registry?.maxActiveMetrics ?? registry?.metrics?.length ?? 999

  const section = sectionProp ?? parseSectionParam(searchParams.get('section')) ?? 'all'

  const wantsDashboard = section === 'dashboard' || section === 'all'
  const wantsTable = section === 'table' || section === 'all'

  const includeDashboard = includeDashboardProp ?? wantsDashboard
  const includeTableColumns = includeTableColumnsProp ?? wantsTable

  const goBack = () => navigateBackOrFallback(navigate, returnTo)

  const columnsQuery = useTableColumnPreferences(moduleKey, includeTableColumns)
  const metricsQuery = useDashboardMetricPreferences(moduleKey, includeDashboard)

  const saveColumnsMutation = useSaveTableColumnPreferences(moduleKey)
  const resetColumnsMutation = useResetTableColumnPreferences(moduleKey)
  const saveMetricsMutation = useSaveDashboardMetricPreferences(moduleKey)
  const resetMetricsMutation = useResetDashboardMetricPreferences(moduleKey)

  const resolvedMetricCatalog = useMemo(() => {
    if (!includeDashboard) return []

    if (moduleKey === EXECUTIVE_OVERVIEW_MODULE_KEY) {
      return EXECUTIVE_OVERVIEW_METRICS_CATALOG
    }

    if (moduleKey === COMMUNICATION_MODULE_KEY) {
      return COMMUNICATION_METRICS_CATALOG
    }

    if (moduleKey === MEMBERSHIPS_MODULE_KEY) {
      return MEMBERSHIP_METRICS_CATALOG
    }

    if (moduleKey === FINANCE_DASHBOARD_MODULE_KEY) {
      return FINANCE_DASHBOARD_METRICS_CATALOG
    }

    if (moduleKey === PLATFORM_HEALTH_MODULE_KEY) {
      return PLATFORM_HEALTH_METRICS_CATALOG
    }

    if (moduleKey === FINANCE_REFUNDS_MODULE_KEY) {
      return FINANCE_REFUNDS_METRICS_CATALOG
    }

    if (moduleKey === RBAC_HUB_MODULE_KEY) {
      return RBAC_HUB_METRICS_CATALOG
    }

    if (moduleKey === SUPPORT_DASHBOARD_MODULE_KEY) {
      return SUPPORT_DASHBOARD_METRICS_CATALOG
    }

    if (moduleKey === ESCALATIONS_MODULE_KEY) {
      return ESCALATIONS_METRICS_CATALOG
    }

    if (moduleKey === TICKET_MANAGEMENT_MODULE_KEY) {
      return TICKET_MANAGEMENT_METRICS_CATALOG
    }

    if (moduleKey === EXPERT_PROFILE_ANALYTICS_MODULE_KEY) {
      return EXPERT_PROFILE_ANALYTICS_METRICS_CATALOG
    }

    if (moduleKey === VENUE_PROFILE_ANALYTICS_MODULE_KEY) {
      return VENUE_PROFILE_ANALYTICS_METRICS_CATALOG
    }

    if (moduleKey === VENUE_VIEW_ANALYTICS_MODULE_KEY) {
      return VENUE_VIEW_ANALYTICS_METRICS_CATALOG
    }

    if (moduleKey === SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY) {
      return SERVICE_CATEGORY_MANAGEMENT_METRICS_CATALOG
    }

    if (moduleKey === SERVICE_DASHBOARD_MODULE_KEY) {
      return SERVICE_DASHBOARD_METRICS_CATALOG
    }

    if (moduleKey === VENUE_CATEGORY_MANAGEMENT_MODULE_KEY) {
      return VENUE_CATEGORY_MANAGEMENT_METRICS_CATALOG
    }

    const serverCatalog = (metricsQuery.data?.catalog ?? []).map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: Boolean(item.defaultActive),
    }))
    const frontendCatalog = (registry?.metrics ?? []).map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: Boolean(item.defaultActive),
    }))

    const rawCatalog = serverCatalog.length > 0 ? serverCatalog : frontendCatalog
    const seen = new Set<string>()

    return rawCatalog.filter((item) => {
      if (!item.id || seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
  }, [includeDashboard, metricsQuery.data?.catalog, moduleKey, registry?.metrics])

  const resolvedColumnCatalog = useMemo(() => {
    if (!includeTableColumns) return []

    const serverCatalog = (columnsQuery.data?.catalog ?? []).map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible !== false,
    }))
    const frontendCatalog = (registry?.columns ?? []).map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible !== false,
    }))

    const rawCatalog =
      frontendCatalog.length > 0 ? [...frontendCatalog, ...serverCatalog] : serverCatalog

    return dedupeCatalogItems(rawCatalog)
  }, [columnsQuery.data?.catalog, includeTableColumns, registry?.columns])

  const resolvedVisibleIds = useMemo(() => {
    const catalogIdSet = new Set(resolvedColumnCatalog.map((item) => item.id))
    const defaultIds = resolvedColumnCatalog
      .filter((item) => ('defaultVisible' in item ? item.defaultVisible : true))
      .map((item) => item.id)
    const ids = columnsQuery.data?.visibleColumnIds?.length
      ? columnsQuery.data.visibleColumnIds
      : defaultIds
    const filtered = dedupeOrderedIds(ids).filter((id) => catalogIdSet.has(id))
    const result = filtered.length > 0 ? filtered : defaultIds
    return sortIdsByCatalogOrder(
      result,
      resolvedColumnCatalog.map((item) => item.id),
    )
  }, [columnsQuery.data, resolvedColumnCatalog])

  const resolvedActiveIds = useMemo(() => {
    const catalogIdSet = new Set(resolvedMetricCatalog.map((item) => item.id))
    const defaultIds = resolvedMetricCatalog
      .filter((item) => item.defaultActive)
      .map((item) => item.id)
    const ids = metricsQuery.data?.activeMetricIds?.length
      ? metricsQuery.data.activeMetricIds
      : defaultIds
    const filtered = dedupeOrderedIds(ids).filter((id) => catalogIdSet.has(id))
    const result = filtered.length > 0 ? filtered : defaultIds

    if (moduleKey === COMMUNICATION_MODULE_KEY) {
      return sortIdsByCatalogOrder(result, COMMUNICATION_METRIC_IDS)
    }
    if (moduleKey === EXECUTIVE_OVERVIEW_MODULE_KEY) {
      return sortIdsByCatalogOrder(result, EXECUTIVE_OVERVIEW_METRIC_IDS)
    }
    if (moduleKey === MEMBERSHIPS_MODULE_KEY) {
      return sortIdsByCatalogOrder(result, MEMBERSHIP_METRIC_IDS)
    }
    if (moduleKey === FINANCE_DASHBOARD_MODULE_KEY) {
      return sortIdsByCatalogOrder(result, FINANCE_DASHBOARD_METRIC_IDS)
    }
    if (moduleKey === PLATFORM_HEALTH_MODULE_KEY) {
      return sortIdsByCatalogOrder(result, PLATFORM_HEALTH_METRIC_IDS)
    }
    if (moduleKey === FINANCE_REFUNDS_MODULE_KEY) {
      return sortIdsByCatalogOrder(result, FINANCE_REFUNDS_METRIC_IDS)
    }
    if (moduleKey === RBAC_HUB_MODULE_KEY) {
      return sortIdsByCatalogOrder(result, RBAC_HUB_METRIC_IDS)
    }
    if (moduleKey === SUPPORT_DASHBOARD_MODULE_KEY) {
      return sortIdsByCatalogOrder(result, SUPPORT_DASHBOARD_METRIC_IDS)
    }
    if (moduleKey === ESCALATIONS_MODULE_KEY) {
      return sortIdsByCatalogOrder(result, ESCALATIONS_METRIC_IDS)
    }
    if (moduleKey === TICKET_MANAGEMENT_MODULE_KEY) {
      return sortIdsByCatalogOrder(result, TICKET_MANAGEMENT_METRIC_IDS)
    }
    if (moduleKey === EXPERT_PROFILE_ANALYTICS_MODULE_KEY) {
      return sortIdsByCatalogOrder(result, EXPERT_PROFILE_ANALYTICS_METRIC_IDS)
    }
    if (moduleKey === VENUE_PROFILE_ANALYTICS_MODULE_KEY) {
      return sortIdsByCatalogOrder(result, VENUE_PROFILE_ANALYTICS_METRIC_IDS)
    }
    if (moduleKey === VENUE_VIEW_ANALYTICS_MODULE_KEY) {
      return sortIdsByCatalogOrder(result, VENUE_VIEW_ANALYTICS_METRIC_IDS)
    }
    if (moduleKey === SERVICE_CATEGORY_MANAGEMENT_MODULE_KEY) {
      return sortIdsByCatalogOrder(result, SERVICE_CATEGORY_MANAGEMENT_METRIC_IDS)
    }
    if (moduleKey === SERVICE_DASHBOARD_MODULE_KEY) {
      return sortIdsByCatalogOrder(result, SERVICE_DASHBOARD_METRIC_IDS)
    }
    if (moduleKey === VENUE_CATEGORY_MANAGEMENT_MODULE_KEY) {
      return sortIdsByCatalogOrder(result, VENUE_CATEGORY_MANAGEMENT_METRIC_IDS)
    }
    if (moduleKey === EXPERT_CLIENTELE_MODULE_KEY) {
      return sortIdsByCatalogOrder(result, EXPERT_CLIENTELE_METRIC_IDS)
    }

    return result
  }, [metricsQuery.data, moduleKey, resolvedMetricCatalog])

  const { visibleColumns, hiddenColumns } = useMemo(() => {
    const catalogById = new Map(resolvedColumnCatalog.map((column) => [column.id, column]))
    const visibleSet = new Set<string>()

    const visible: ManageMetricsListItem[] = []
    for (const id of resolvedVisibleIds) {
      if (visibleSet.has(id)) continue
      const column = catalogById.get(id)
      if (!column) continue
      visibleSet.add(id)
      visible.push({
        id: column.id,
        label: column.label,
        type: column.type,
        description: column.description,
      })
    }

    const hidden: ManageMetricsAvailableItem[] = []
    const hiddenSeen = new Set<string>()
    for (const column of resolvedColumnCatalog) {
      if (visibleSet.has(column.id) || hiddenSeen.has(column.id)) continue
      hiddenSeen.add(column.id)
      hidden.push({
        id: column.id,
        title: column.label,
        description: column.description,
        type: column.type,
      })
    }

    return { visibleColumns: visible, hiddenColumns: hidden }
  }, [resolvedColumnCatalog, resolvedVisibleIds])

  const { activeMetrics, availableMetrics } = useMemo(() => {
    const catalogById = new Map(resolvedMetricCatalog.map((metric) => [metric.id, metric]))
    const activeSet = new Set<string>()

    const active: ManageMetricsListItem[] = []
    for (const id of resolvedActiveIds) {
      if (activeSet.has(id)) continue
      const metric = catalogById.get(id)
      if (!metric) continue
      activeSet.add(id)
      active.push({
        id: metric.id,
        label: metric.label,
        type: metric.type,
        description: metric.description,
      })
    }

    const available: ManageMetricsAvailableItem[] = []
    const availableSeen = new Set<string>()
    for (const metric of resolvedMetricCatalog) {
      if (activeSet.has(metric.id) || availableSeen.has(metric.id)) continue
      availableSeen.add(metric.id)
      available.push({
        id: metric.id,
        title: metric.label,
        description: metric.description,
        type: metric.type,
      })
    }

    return { activeMetrics: active, availableMetrics: available }
  }, [resolvedActiveIds, resolvedMetricCatalog])

  const isLoading =
    (includeTableColumns && columnsQuery.isLoading) || (includeDashboard && metricsQuery.isLoading)

  const isSaving =
    saveColumnsMutation.isPending ||
    resetColumnsMutation.isPending ||
    saveMetricsMutation.isPending ||
    resetMetricsMutation.isPending

  // Only render sections that were requested AND have catalog data
  const showDashboard = includeDashboard && resolvedMetricCatalog.length > 0
  const showTableColumns = includeTableColumns && resolvedColumnCatalog.length > 0

  return (
    <ManageMetrics
      moduleName={moduleName}
      isLoading={isLoading}
      isSaving={isSaving}
      loadingLabel="Loading preferences…"
      dashboard={
        showDashboard
          ? {
              active: activeMetrics,
              available: availableMetrics,
              maxActive: maxActiveMetrics,
              onReset: () => {
                resetMetricsMutation.mutate(undefined, {
                  onSuccess: () => toast.success('Dashboard metrics reset to default'),
                  onError: (error) =>
                    toast.error(getApiErrorMessage(error, 'Failed to reset dashboard metrics')),
                })
              },
            }
          : undefined
      }
      tableColumns={
        showTableColumns
          ? {
              visible: visibleColumns,
              hidden: hiddenColumns,
              onReset: () => {
                resetColumnsMutation.mutate(undefined, {
                  onSuccess: () => toast.success('Column preferences reset to default'),
                  onError: (error) =>
                    toast.error(getApiErrorMessage(error, 'Failed to reset column preferences')),
                })
              },
            }
          : undefined
      }
      onBack={goBack}
      onCancel={goBack}
      onSave={async ({ activeMetricIds, visibleColumnIds }) => {
        try {
          const tasks: Promise<unknown>[] = []

          if (showDashboard && activeMetricIds?.length) {
            const catalogIdSet = new Set(resolvedMetricCatalog.map((item) => item.id))
            const normalizedActiveIds = dedupeOrderedIds(activeMetricIds).filter((id) =>
              catalogIdSet.has(id),
            )
            tasks.push(saveMetricsMutation.mutateAsync(normalizedActiveIds))
          } else if (showDashboard && !activeMetricIds?.length) {
            toast.error('At least one active metric is required')
            return
          }

          if (showTableColumns && visibleColumnIds?.length) {
            tasks.push(saveColumnsMutation.mutateAsync(visibleColumnIds))
          } else if (showTableColumns && !visibleColumnIds?.length) {
            toast.error('At least one visible column is required')
            return
          }

          await Promise.all(tasks)
          toast.success('Metrics configuration saved')
          goBack()
        } catch (error) {
          toast.error(getApiErrorMessage(error, 'Failed to save metrics configuration'))
        }
      }}
    />
  )
}
