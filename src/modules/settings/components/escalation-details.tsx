import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
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
  buildEscalationsListQueryParams,
  createEscalationsFilteredExportHandler,
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

const ESCALATION_SORT_FIELD_MAP = buildCatalogSortFieldMap(ESCALATIONS_TABLE_COLUMNS_CATALOG, {
  'escalation-id': 'escalationId',
  'roles-id': 'roleId',
  'role-name': 'roleName',
  'escalation-type': 'escalationType',
  'created-on': 'createdOn',
})

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

function rowKey(row: EscalationListItem) {
  return `${row.entityType}:${row.entityId}`
}

function EscalationMetricCardSkeleton() {
  return <div className="escalation-stats-skeleton" />
}

export function EscalationDetails() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const serverSort = useServerTableSort({
    sortFieldMap: ESCALATION_SORT_FIELD_MAP,
    defaultSortBy: 'created-on',
    defaultSortOrder: 'desc',
    onPageReset: () => setPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setPage(1) })
  const { buildSearchParams, globalSearch } = enhancedSearch
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const pageSize = 10

  const { data: metricsResponse, isLoading: isMetricsLoading } = useEscalationMetrics()
  const listQueryParams = useMemo(
    () =>
      buildEscalationsListQueryParams(appliedFilters, {
        page,
        limit: pageSize,
        ...buildSearchParams(),
        ...serverSort.sortParams,
      }),
    [appliedFilters, buildSearchParams, page, serverSort.sortParams],
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

  const visibleKeys = useMemo(() => escalations.map(rowKey), [escalations])
  const allSelected = visibleKeys.length > 0 && visibleKeys.every((key) => selectedIds.has(key))

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (visibleKeys.every((key) => next.has(key))) {
        visibleKeys.forEach((key) => next.delete(key))
      } else {
        visibleKeys.forEach((key) => next.add(key))
      }
      return next
    })
  }, [visibleKeys])

  const toggleOne = useCallback((key: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

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
    return createEscalationsFilteredExportHandler(
      fetchForExport,
      ESCALATION_EXPORT_COLUMN_MAP,
      'escalations_export',
      { search: globalSearch || undefined },
      { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
    )
  }, [catalogColumnIds, exportColumnIds, globalSearch])

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

    const selectColumn: ColumnDef<EscalationListItem> = {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          aria-label="Select all escalations"
          checked={allSelected}
          onChange={toggleAll}
          className="escalation-checkbox"
        />
      ),
      cell: ({ row }) => {
        const key = rowKey(row.original)
        return (
          <input
            type="checkbox"
            aria-label={`Select ${row.original.escalationId}`}
            checked={selectedIds.has(key)}
            onChange={() => toggleOne(key)}
            onClick={(event) => event.stopPropagation()}
            className="escalation-checkbox"
          />
        )
      },
      meta: { headerClassName: 'w-10 pl-2', cellClassName: 'w-10 pl-2' },
    }

    return withServerSortMeta(
      [
        selectColumn,
        ...selectPreferredColumns(
          escalationColumns,
          rawVisibleIds,
          DEFAULT_ESCALATIONS_VISIBLE_COLUMN_IDS,
          ESCALATIONS_LEGACY_COLUMN_ID_MAP,
        ),
      ],
      ESCALATION_SORT_FIELD_MAP,
    )
  }, [allSelected, selectedIds, tableColumnPreferencesQuery.data, toggleAll, toggleOne])

  return (
    <div className="escalation-page">
      <div className="escalation-header">
        <div>
          <h1 className="referral-page-title">All Escalation</h1>
          <p className="referral-page-subtitle mt-1">
            Track revenue, payouts, and financial performance
          </p>
        </div>

        <Button
          variant="secondary"
          className="ui-manage-metrics inline-flex items-center gap-2"
          onClick={() => navigate('/metrics/escalations?section=table')}
        >
          <ManageMetricsIcon className="size-4 shrink-0" />
          Manage Metrics
        </Button>
      </div>

      <div className="escalation-stats-grid">
        {isMetricsLoading || (!metricsResponse?.data && visibleMetrics.length === 0)
          ? Array.from({ length: filteredActiveMetricIds.length || 4 }).map((_, index) => (
              <EscalationMetricCardSkeleton key={`escalation-metric-skeleton-${index}`} />
            ))
          : visibleMetrics.map((metric) => (
              <StatCard
                key={metric.id}
                className="escalation-stat-card"
                title={metric.title}
                value={metric.value}
                trend={metric.trend}
              />
            ))}
      </div>

      <div className="escalation-table-card">
        <DataTable
          columns={columns}
          data={escalations}
          getRowId={rowKey}
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
      </div>
      {exportFilterModals}
    </div>
  )
}
