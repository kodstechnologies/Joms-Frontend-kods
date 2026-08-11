import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

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
import { navigateBackOrFallback } from '@/shared/lib/navigation'

export type MetricsSection = 'dashboard' | 'table' | 'all'

export type ModuleMetricsPageConfig = {
  moduleKey: string
  moduleName?: string
  returnTo?: string
  /** Force dashboard section on/off. When omitted, derived from `section` + catalogs. */
  includeDashboard?: boolean
  /** Force table section on/off. When omitted, derived from `section` + catalogs. */
  includeTableColumns?: boolean
  /**
   * Which sections to show:
   * - `dashboard` → cards/metrics only
   * - `table` → table columns only
   * - `all` → both (when catalogs exist)
   * Can also be set via `?section=` query param.
   */
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
  const maxActiveMetrics = maxActiveProp ?? registry?.maxActiveMetrics ?? 8

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
    const frontendCatalog = (registry?.metrics ?? []).map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: Boolean(item.defaultActive),
    }))
    if (frontendCatalog.length) return frontendCatalog
    return metricsQuery.data?.catalog ?? []
  }, [includeDashboard, metricsQuery.data?.catalog, registry?.metrics])

  const resolvedColumnCatalog = useMemo(() => {
    if (!includeTableColumns) return []
    const frontendCatalog = (registry?.columns ?? []).map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible !== false,
    }))
    if (frontendCatalog.length) return frontendCatalog
    return columnsQuery.data?.catalog ?? []
  }, [columnsQuery.data?.catalog, includeTableColumns, registry?.columns])

  const resolvedVisibleIds = useMemo(() => {
    if (columnsQuery.data?.visibleColumnIds?.length) return columnsQuery.data.visibleColumnIds
    return resolvedColumnCatalog
      .filter((item) => ('defaultVisible' in item ? item.defaultVisible : true))
      .map((item) => item.id)
  }, [columnsQuery.data, resolvedColumnCatalog])

  const resolvedActiveIds = useMemo(() => {
    if (metricsQuery.data?.activeMetricIds?.length) return metricsQuery.data.activeMetricIds
    return resolvedMetricCatalog.filter((item) => item.defaultActive).map((item) => item.id)
  }, [metricsQuery.data, resolvedMetricCatalog])

  const { visibleColumns, hiddenColumns } = useMemo(() => {
    const catalog = resolvedColumnCatalog
    const visibleIds = resolvedVisibleIds
    const visibleSet = new Set(visibleIds)

    const visible: ManageMetricsListItem[] = visibleIds
      .map((id) => catalog.find((column) => column.id === id))
      .filter(Boolean)
      .map((column) => ({
        id: column!.id,
        label: column!.label,
        type: column!.type,
        description: column!.description,
      }))

    const hidden: ManageMetricsAvailableItem[] = catalog
      .filter((column) => !visibleSet.has(column.id))
      .map((column) => ({
        id: column.id,
        title: column.label,
        description: column.description,
        type: column.type,
      }))

    return { visibleColumns: visible, hiddenColumns: hidden }
  }, [resolvedColumnCatalog, resolvedVisibleIds])

  const { activeMetrics, availableMetrics } = useMemo(() => {
    const catalog = resolvedMetricCatalog
    const activeIds = resolvedActiveIds
    const activeSet = new Set(activeIds)

    const active: ManageMetricsListItem[] = activeIds
      .map((id) => catalog.find((metric) => metric.id === id))
      .filter(Boolean)
      .map((metric) => ({
        id: metric!.id,
        label: metric!.label,
        type: metric!.type,
        description: metric!.description,
      }))

    const available: ManageMetricsAvailableItem[] = catalog
      .filter((metric) => !activeSet.has(metric.id))
      .map((metric) => ({
        id: metric.id,
        title: metric.label,
        description: metric.description,
        type: metric.type,
      }))

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
                  onError: () => toast.error('Failed to reset dashboard metrics'),
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
                  onError: () => toast.error('Failed to reset column preferences'),
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
            tasks.push(saveMetricsMutation.mutateAsync(activeMetricIds))
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
        } catch {
          toast.error('Failed to save metrics configuration')
        }
      }}
    />
  )
}
