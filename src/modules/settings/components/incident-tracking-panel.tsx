import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ClipboardList } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'

import { AssignUserModal } from './assign-user-modal'
import {
  DEFAULT_INCIDENT_METRIC_IDS,
  INCIDENT_METRIC_IDS,
  INCIDENT_METRIC_ID_SET,
  INCIDENT_MODULE_KEY,
} from '../config/incident-metrics.config'
import {
  DEFAULT_INCIDENT_TRACKING_VISIBLE_COLUMN_IDS,
  INCIDENT_TRACKING_LEGACY_COLUMN_ID_MAP,
  INCIDENT_TRACKING_TABLE_COLUMNS_CATALOG,
} from '../config/incident-table-columns.config'
import { useAssignIncident, useIncidentMetrics, useIncidents } from '../hooks/use-incidents'
import { fetchIncidents } from '../api/incidents-api'
import type { IncidentRow, IncidentSeverity, IncidentStatus } from '../types/settings'
import { StatCard } from '@/shared/components/dashboard/stat-card'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { buildCatalogSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { SETTINGS_INCIDENTS_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import { ResponsiveGrid } from '@/shared/components/responsive/responsive-grid'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import type { FilterValues } from '@/shared/types/data-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildPrefixedListQueryParams,
  createPrefixedListExportHandler,
} from '@/shared/utils/export-filter-utils'
import {
  orderByActiveMetricIds,
  useActiveMetricIds,
} from '@/modules/expert/hooks/use-active-metric-ids'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import { selectPreferredColumns } from '@/modules/expert/utils/select-preferred-columns'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'

const PAGE_SIZE = 8

type IncidentTrackingPanelProps = {
  highlightIncidentId?: string | null
}

const INCIDENT_SORT_FIELD_MAP = buildCatalogSortFieldMap(INCIDENT_TRACKING_TABLE_COLUMNS_CATALOG)

const dash = (value: string | null | undefined) => (value && String(value).trim() ? value : '—')

const INCIDENT_EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (row: IncidentRow) => string }
> = {
  'incident-id': { header: 'Incident ID', accessor: (row) => exportDisplayValue(row.incidentId) },
  'incident-title': {
    header: 'Incident Title',
    accessor: (row) => exportDisplayValue(dash(row.title)),
  },
  'reported-at': {
    header: 'Reported At',
    accessor: (row) => exportDisplayValue(dash(row.reportedAt || row.createdOn)),
  },
  severity: { header: 'Severity', accessor: (row) => exportDisplayValue(row.severity) },
  'first-response-time': {
    header: 'First Response Time',
    accessor: (row) => exportDisplayValue(dash(row.firstResponseTime)),
  },
  'closed-at': {
    header: 'Closed At',
    accessor: (row) => exportDisplayValue(dash(row.closedAt)),
  },
  module: { header: 'Module', accessor: (row) => exportDisplayValue(row.module) },
  status: { header: 'Status', accessor: (row) => exportDisplayValue(row.status) },
  assignee: {
    header: 'Assignee',
    accessor: (row) => exportDisplayValue(row.assignee || 'Unassigned'),
  },
  'root-cause': {
    header: 'Root Cause',
    accessor: (row) => exportDisplayValue(dash(row.rootCause)),
  },
}

function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  const styles: Record<IncidentSeverity, string> = {
    Low: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    Medium: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    High: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
    Critical: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  }
  return (
    <span
      className={cn(
        'rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
        styles[severity],
      )}
    >
      {severity}
    </span>
  )
}

function StatusBadge({ status }: { status: IncidentStatus }) {
  const styles: Record<IncidentStatus, string> = {
    Open: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    Investigating: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
    Resolved: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  }
  return (
    <span
      className={cn('rounded-full border px-2.5 py-0.5 text-[11px] font-semibold', styles[status])}
    >
      {status}
    </span>
  )
}

const ALL_INCIDENT_COLUMNS: ColumnDef<IncidentRow>[] = [
  {
    id: 'incident-id',
    accessorKey: 'incidentId',
    header: 'Incident ID',
    cell: ({ row }) => <span className="font-medium text-white">{row.original.incidentId}</span>,
  },
  {
    id: 'incident-title',
    accessorKey: 'title',
    header: 'Incident Title',
    cell: ({ row }) => <span className="text-slate-300">{dash(row.original.title)}</span>,
  },
  {
    id: 'reported-at',
    accessorFn: (row) => row.reportedAt || row.createdOn,
    header: 'Reported At',
    cell: ({ row }) => (
      <span className="text-slate-400">
        {dash(row.original.reportedAt || row.original.createdOn)}
      </span>
    ),
  },
  {
    id: 'severity',
    accessorKey: 'severity',
    header: 'Severity',
    cell: ({ row }) => <SeverityBadge severity={row.original.severity} />,
  },
  {
    id: 'first-response-time',
    accessorKey: 'firstResponseTime',
    header: 'First Response Time',
    cell: ({ row }) => (
      <span className="text-slate-400">{dash(row.original.firstResponseTime)}</span>
    ),
  },
  {
    id: 'closed-at',
    accessorKey: 'closedAt',
    header: 'Closed At',
    cell: ({ row }) => <span className="text-slate-400">{dash(row.original.closedAt)}</span>,
  },
  {
    id: 'module',
    accessorKey: 'module',
    header: 'Module',
    cell: ({ row }) => <span className="text-slate-300">{row.original.module}</span>,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: 'assignee',
    accessorKey: 'assignee',
    header: 'Assignee',
    cell: ({ row }) => (
      <span className="text-slate-400">{row.original.assignee || 'Unassigned'}</span>
    ),
  },
  {
    id: 'root-cause',
    accessorKey: 'rootCause',
    header: 'Root Cause',
    cell: ({ row }) => <span className="text-slate-400">{dash(row.original.rootCause)}</span>,
  },
]

export function IncidentTrackingPanel({ highlightIncidentId = null }: IncidentTrackingPanelProps) {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: INCIDENT_SORT_FIELD_MAP,
    onPageReset: () => setPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [selected, setSelected] = useState<IncidentRow | null>(null)

  const tableColumnPreferencesQuery = useTableColumnPreferences(INCIDENT_MODULE_KEY)

  const catalogColumnIds = useMemo(
    () => INCIDENT_TRACKING_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_INCIDENT_TRACKING_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
    legacyColumnIdMap: INCIDENT_TRACKING_LEGACY_COLUMN_ID_MAP,
  })

  const activeMetricIds = useActiveMetricIds(INCIDENT_MODULE_KEY, DEFAULT_INCIDENT_METRIC_IDS)
  const filteredActiveMetricIds = useMemo(
    () =>
      sortIdsByCatalogOrder(
        activeMetricIds.filter((id) => INCIDENT_METRIC_ID_SET.has(id)),
        INCIDENT_METRIC_IDS,
      ),
    [activeMetricIds],
  )

  const { data: metrics = [], isLoading: metricsLoading } = useIncidentMetrics()
  const metricCards = useMemo(() => {
    const cards = metrics.filter((metric) => metric.id && INCIDENT_METRIC_ID_SET.has(metric.id))
    return orderByActiveMetricIds(
      cards.map((metric) => ({ ...metric, id: metric.id! })),
      filteredActiveMetricIds,
    )
  }, [filteredActiveMetricIds, metrics])

  const listQueryParams = useMemo(
    () =>
      buildPrefixedListQueryParams(appliedFilters, {
        page,
        limit: PAGE_SIZE,
        ...enhancedSearch.buildSearchParams(),
        ...serverSort.sortParams,
      }),
    [appliedFilters, enhancedSearch, page, serverSort.sortParams],
  )

  const { data: incidentsResult, isLoading } = useIncidents(listQueryParams)
  const assignMutation = useAssignIncident()

  const rows = useMemo(() => incidentsResult?.data ?? [], [incidentsResult?.data])
  const meta = incidentsResult?.meta
  const totalPages = meta?.totalPages ?? 1
  const totalItems = meta?.total ?? 0

  const [highlightDismissedId, setHighlightDismissedId] = useState<string | null>(null)

  const highlightedRow = useMemo(() => {
    const incidentId = String(highlightIncidentId || '').trim()
    if (!incidentId || isLoading || !rows.length) return null
    return rows.find((row) => row.incidentId === incidentId || row.id === incidentId) ?? null
  }, [highlightIncidentId, isLoading, rows])

  const activeHighlightId = String(highlightIncidentId || '').trim()
  const selectedRow =
    selected ??
    (highlightedRow && highlightDismissedId !== activeHighlightId ? highlightedRow : null)

  const handleApplyFilters = useCallback((values: FilterValues) => {
    toast.success('Filters applied')
    setAppliedFilters(values)
    setPage(1)
  }, [])

  const handleExportData = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      const result = await fetchIncidents(params)
      return { data: result.data ?? [] }
    }
    return createPrefixedListExportHandler(
      fetchForExport,
      INCIDENT_EXPORT_COLUMN_MAP,
      'incidents_export',
      { search: enhancedSearch.globalSearch || undefined },
      { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
    )
  }, [catalogColumnIds, enhancedSearch.globalSearch, exportColumnIds])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'incidents',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const columns = useMemo(() => {
    const rawVisibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_INCIDENT_TRACKING_VISIBLE_COLUMN_IDS

    const preferenceColumns = selectPreferredColumns(
      ALL_INCIDENT_COLUMNS,
      rawVisibleIds,
      DEFAULT_INCIDENT_TRACKING_VISIBLE_COLUMN_IDS,
      INCIDENT_TRACKING_LEGACY_COLUMN_ID_MAP,
    )

    const actionsColumn: ColumnDef<IncidentRow> = {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => setSelected(row.original)}
          className="rounded p-1 text-slate-500 hover:bg-white/5 hover:text-white"
          aria-label="Assign user"
        >
          <ClipboardList className="size-4" />
        </button>
      ),
    }

    return withServerSortMeta(
      [...preferenceColumns.filter((column) => column.id !== 'actions'), actionsColumn],
      INCIDENT_SORT_FIELD_MAP,
    )
  }, [tableColumnPreferencesQuery.data])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Error Reporting & Incident Tracking</h2>
          <p className="text-sm text-slate-400">Track errors & incident in the platform</p>
        </div>
        <Button
          variant="secondary"
          className="ui-manage-metrics inline-flex items-center gap-2"
          onClick={() => navigate('/metrics/incident-tracking?section=table')}
        >
          <ManageMetricsIcon className="size-4 shrink-0" />
          Manage Metrics
        </Button>
      </div>

      <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={4} gap={4}>
        {metricsLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-xl bg-white/5" />
            ))
          : metricCards.map((metric) => (
              <StatCard
                key={metric.id}
                title={metric.title}
                value={metric.value}
                trend={metric.trend}
                hint={metric.hint}
              />
            ))}
      </ResponsiveGrid>

      <div
        className={cn(uiTokens.radiusCard, uiTokens.borderSubtle, 'bg-brand-surface p-4 sm:p-5')}
      >
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.id}
          {...serverSort.dataTableSortProps}
          isLoading={isLoading}
          searchValue={enhancedSearch.globalSearch}
          onSearchChange={enhancedSearch.setGlobalSearch}
          searchableColumns={SETTINGS_INCIDENTS_SEARCH_COLUMNS}
          columnSearches={enhancedSearch.columnSearches}
          onColumnSearchChange={enhancedSearch.setColumnSearch}
          onColumnSearchRemove={enhancedSearch.removeColumnSearch}
          onClearAllSearches={enhancedSearch.clearAll}
          searchPlaceholder="Search by name, ID or profession"
          onAdvancedFilter={onAdvancedFilter}
          advancedFilterVariant="primary"
          onExport={onExport}
          pagination={{
            page,
            pageSize: PAGE_SIZE,
            totalItems,
            totalPages,
            onPageChange: setPage,
          }}
          resourceLabel="incidents"
        />
      </div>

      {exportFilterModals}

      <AssignUserModal
        open={Boolean(selectedRow)}
        incident={selectedRow}
        onClose={() => {
          setSelected(null)
          if (highlightedRow) {
            setHighlightDismissedId(activeHighlightId)
          }
        }}
        onSubmit={(department, user, assigneeId) => {
          if (!selectedRow) return
          assignMutation.mutate(
            { id: selectedRow.id, department, assignee: user, assigneeId },
            {
              onSuccess: () => {
                const ticketId = selectedRow.sourceTicketId
                setSelected(null)
                setHighlightDismissedId(activeHighlightId)
                toast.success(`Assigned ${user} from ${department}`, {
                  action: ticketId
                    ? {
                        label: 'Open ticket',
                        onClick: () => navigate(`/support/tickets/${ticketId}`),
                      }
                    : undefined,
                })
              },
              onError: () => toast.error('Failed to assign incident'),
            },
          )
        }}
      />
    </div>
  )
}
