import { useMemo, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

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
import { StatCard } from '@/shared/components/dashboard/stat-card'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'

import {
  DEFAULT_ESCALATIONS_VISIBLE_COLUMN_IDS,
  ESCALATIONS_TABLE_COLUMNS_CATALOG,
} from '../config/escalations-table-columns.config'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { escalationColumns } from './escalation-table-columns'

export function EscalationDetails() {
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data: metricsResponse, isLoading: isMetricsLoading } = useEscalationMetrics()
  const { data: escalationsResponse, isLoading: isEscalationsLoading } = useAllEscalations({
    page,
    limit: pageSize,
    search: searchValue,
  })

  const tableColumnPreferencesQuery = useTableColumnPreferences(ESCALATIONS_MODULE_KEY)

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
    const allMetrics = buildEscalationsMetricCards(metricsResponse?.data)
    return orderByActiveMetricIds(allMetrics, filteredActiveMetricIds)
  }, [filteredActiveMetricIds, metricsResponse?.data])

  const escalations = escalationsResponse?.data?.escalations || []
  const meta = escalationsResponse?.data?.meta

  const columns = useMemo(() => {
    const catalogIds = ESCALATIONS_TABLE_COLUMNS_CATALOG.map((column) => column.id)
    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_ESCALATIONS_VISIBLE_COLUMN_IDS
    const dataColumnsById = Object.fromEntries(
      escalationColumns.map((column) => [column.id, column] as const),
    )
    const preferenceColumns = sortIdsByCatalogOrder(
      visibleIds.filter((id) => catalogIds.includes(id)),
      catalogIds,
    )
      .map((id) => dataColumnsById[id])
      .filter(Boolean)
    const actionsColumn = dataColumnsById.actions
    return actionsColumn ? [...preferenceColumns, actionsColumn] : preferenceColumns
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
          onClick={() => navigate('/metrics/escalations')}
        >
          <SlidersHorizontal className="size-4" />
          Manage Metrics
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(isMetricsLoading && visibleMetrics.length === 0
          ? filteredActiveMetricIds.map((id) => ({
              id,
              title: 'Loading',
              value: '—',
              trend: { direction: 'up' as const, percentage: 0, label: 'vs last month' },
            }))
          : visibleMetrics
        ).map((metric) => (
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
        searchValue={searchValue}
        onSearchChange={(value) => {
          setSearchValue(value)
          setPage(1)
        }}
        searchPlaceholder="Search by name, ID or profession"
        advancedFilterLabel="Advance Filters"
        onAdvancedFilter={() => {}}
        onExport={() => {}}
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
  )
}
