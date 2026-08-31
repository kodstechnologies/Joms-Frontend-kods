import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'

import {
  DEFAULT_ESCALATIONS_METRIC_IDS,
  ESCALATIONS_METRIC_IDS,
  ESCALATIONS_METRIC_ID_SET,
  ESCALATIONS_MODULE_KEY,
} from '../config/escalations-metrics.config'
import { buildEscalationsMetricCards } from '../utils/escalations-metrics'
import {
  useAllEscalations,
  useEscalationMetrics,
} from '@/modules/my-tasks/hooks/use-admin-escalation'
import {
  orderByActiveMetricIds,
  useActiveMetricIds,
} from '@/modules/expert/hooks/use-active-metric-ids'
import { Button } from '@/shared/components/ui/button'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { buildCatalogSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { SETTINGS_ESCALATIONS_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import { StatCard } from '@/shared/components/dashboard/stat-card'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import type { FilterValues } from '@/shared/types/data-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildPrefixedListQueryParams,
  createPrefixedListExportHandler,
} from '@/shared/utils/export-filter-utils'
import { fetchAllEscalations, type EscalationListItem } from '@/modules/my-tasks/api/escalation-api'

import {
  DEFAULT_ESCALATIONS_VISIBLE_COLUMN_IDS,
  ESCALATIONS_LEGACY_COLUMN_ID_MAP,
  ESCALATIONS_TABLE_COLUMNS_CATALOG,
} from '../config/escalations-table-columns.config'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import { selectPreferredColumns } from '@/modules/expert/utils/select-preferred-columns'
import { escalationColumns } from './escalation-table-columns'

const ESCALATION_SORT_FIELD_MAP = buildCatalogSortFieldMap(ESCALATIONS_TABLE_COLUMNS_CATALOG)

const ESCALATION_EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (row: EscalationListItem) => string }
> = {
  'escalation-id': {
    header: 'Escalation ID',
    accessor: (row) => exportDisplayValue(row.escalationId),
  },
  'roles-id': { header: 'Roles ID', accessor: (row) => exportDisplayValue(row.roleId) },
  'role-name': { header: 'Role Name', accessor: (row) => exportDisplayValue(row.roleName) },
  'escalation-type': {
    header: 'Escalation Type',
    accessor: (row) => exportDisplayValue(row.escalationType),
  },
  priority: { header: 'Priority', accessor: (row) => exportDisplayValue(row.priority) },
  status: { header: 'Status', accessor: (row) => exportDisplayValue(row.status) },
  'created-on': { header: 'Created On', accessor: (row) => exportDisplayValue(row.createdOn) },
}

function EscalationMetricCardSkeleton() {
  return (
    <div className="bg-brand-surface flex min-h-[130px] flex-col justify-between gap-3 overflow-hidden rounded-2xl border border-white/10 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3.5 w-24 animate-pulse rounded bg-white/10" />
          <div className="mt-2 h-7 w-20 animate-pulse rounded bg-white/10" />
        </div>
        <div className="size-10 shrink-0 animate-pulse rounded border border-white/10 bg-white/5" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-4 w-12 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-20 animate-pulse rounded bg-white/5" />
      </div>
    </div>
  )
}

export function EscalationDetails() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: ESCALATION_SORT_FIELD_MAP,
    onPageReset: () => setPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const pageSize = 10

  const { data: metricsResponse, isLoading: isMetricsLoading } = useEscalationMetrics()
  const listQueryParams = useMemo(
    () =>
      buildPrefixedListQueryParams(appliedFilters, {
        page,
        limit: pageSize,
        ...enhancedSearch.buildSearchParams(),
        ...serverSort.sortParams,
      }),
    [appliedFilters, enhancedSearch, page, serverSort.sortParams],
  )
  const { data: escalationsResponse, isLoading: isEscalationsLoading } =
    useAllEscalations(listQueryParams)

  const tableColumnPreferencesQuery = useTableColumnPreferences(ESCALATIONS_MODULE_KEY)

  const catalogColumnIds = useMemo(
    () => ESCALATIONS_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_ESCALATIONS_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
    legacyColumnIdMap: ESCALATIONS_LEGACY_COLUMN_ID_MAP,
  })

  const activeMetricIds = useActiveMetricIds(ESCALATIONS_MODULE_KEY, [
    ...DEFAULT_ESCALATIONS_METRIC_IDS,
  ])

  const filteredActiveMetricIds = useMemo(
    () =>
      sortIdsByCatalogOrder(
        activeMetricIds.filter((id) => ESCALATIONS_METRIC_ID_SET.has(id)),
        ESCALATIONS_METRIC_IDS,
      ),
    [activeMetricIds],
  )

  const visibleMetrics = useMemo(() => {
    if (!metricsResponse?.data) return []
    const allMetrics = buildEscalationsMetricCards(metricsResponse?.data)
    return orderByActiveMetricIds(allMetrics, filteredActiveMetricIds)
  }, [filteredActiveMetricIds, metricsResponse?.data])

  const escalations = escalationsResponse?.data?.escalations || []
  const meta = escalationsResponse?.data?.meta

  const handleApplyFilters = useCallback((values: FilterValues) => {
    toast.success('Filters applied')
    setAppliedFilters(values)
    setPage(1)
  }, [])

  const handleExportData = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      const result = await fetchAllEscalations(params)
      return { data: result.data?.escalations ?? [] }
    }
    return createPrefixedListExportHandler(
      fetchForExport,
      ESCALATION_EXPORT_COLUMN_MAP,
      'escalations_export',
      { search: enhancedSearch.globalSearch || undefined },
      { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
    )
  }, [catalogColumnIds, enhancedSearch.globalSearch, exportColumnIds])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'escalations',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const columns = useMemo(() => {
    const rawVisibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_ESCALATIONS_VISIBLE_COLUMN_IDS
    return withServerSortMeta(
      selectPreferredColumns(
        escalationColumns,
        rawVisibleIds,
        DEFAULT_ESCALATIONS_VISIBLE_COLUMN_IDS,
        ESCALATIONS_LEGACY_COLUMN_ID_MAP,
      ),
      ESCALATION_SORT_FIELD_MAP,
    )
  }, [tableColumnPreferencesQuery.data])

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-h2 text-brand-text tracking-tight">All Escalation</h1>
          <p className="text-body-md text-muted mt-1 leading-[20px]">
            Track revenue, payouts, and financial performance
          </p>
        </div>

        <Button
          className="ui-manage-metrics ui-cta ui-cta-primary w-full shrink-0 sm:w-auto"
          onClick={() => navigate('/metrics/escalations?section=table')}
        >
          <ManageMetricsIcon className="size-4 shrink-0" />
          Manage Metrics
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isMetricsLoading || (!metricsResponse?.data && visibleMetrics.length === 0)
          ? Array.from({ length: filteredActiveMetricIds.length || 4 }).map((_, index) => (
              <EscalationMetricCardSkeleton key={`escalation-metric-skeleton-${index}`} />
            ))
          : visibleMetrics.map((metric) => (
              <StatCard
                key={metric.id}
                title={metric.title}
                value={metric.value}
                trend={metric.trend}
              />
            ))}
      </div>

      <DataTable
        columns={columns}
        data={escalations}
        {...serverSort.dataTableSortProps}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={SETTINGS_ESCALATIONS_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by escalation ID or expert"
        advancedFilterLabel="Advance Filters"
        onAdvancedFilter={onAdvancedFilter}
        advancedFilterVariant="primary"
        onExport={onExport}
        isLoading={isEscalationsLoading}
        pagination={{
          page,
          pageSize,
          totalItems: meta?.total ?? escalations.length,
          totalPages: meta?.totalPages ?? 1,
          onPageChange: setPage,
        }}
        resourceLabel="escalations"
      />
      {exportFilterModals}
    </div>
  )
}
