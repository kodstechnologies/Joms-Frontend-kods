import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ClipboardList } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ExportDataIcon, ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { getApiErrorMessage } from '@/shared/lib/api-error'

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
import {
  incidentKeys,
  useAssignIncident,
  useIncidentMetrics,
  useIncidents,
} from '../hooks/use-incidents'
import { useDefaultExportFormat } from '../hooks/use-default-export-format'
import { fetchIncident, fetchIncidents } from '../api/incidents-api'
import { escalateIncidentApplication } from '@/modules/my-tasks/api/escalation-api'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { IncidentRow, IncidentSeverity, IncidentStatus } from '../types/settings'
import { StatCard } from '@/shared/components/dashboard/stat-card'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { buildCatalogSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { SETTINGS_INCIDENTS_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import type { FilterValues } from '@/shared/types/data-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildPrefixedListQueryParams,
  createPrefixedListExportHandler,
  exportMappedItemsToFile,
} from '@/shared/utils/export-filter-utils'
import {
  orderByActiveMetricIds,
  useActiveMetricIds,
} from '@/modules/expert/hooks/use-active-metric-ids'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import { selectPreferredColumns } from '@/modules/expert/utils/select-preferred-columns'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'

const PAGE_SIZE = 10

type IncidentTrackingPanelProps = {
  highlightIncidentId?: string | null
}

const INCIDENT_SORT_FIELD_MAP = buildCatalogSortFieldMap(INCIDENT_TRACKING_TABLE_COLUMNS_CATALOG, {
  'reported-at': 'createdAt',
  'closed-at': 'resolvedAt',
  'root-cause': 'reason',
  'incident-title': 'title',
  'first-response-time': 'firstResponseAt',
})

const dash = (value: string | null | undefined) => (value && String(value).trim() ? value : '—')

const METRIC_TITLE_MAP: Record<string, string> = {
  'open-incidents': 'Active Incidents',
  critical: 'Critical Errors',
  'resolved-mtd': 'Resolved',
  mttr: 'Avg. Resolution Time',
}

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
    header: 'Created On',
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
  return (
    <span className={cn('incident-severity-pill', `is-${severity.toLowerCase()}`)}>{severity}</span>
  )
}

function StatusBadge({ status }: { status: IncidentStatus }) {
  const label = status === 'Investigating' ? 'In-Progress' : status
  const tone = status === 'Investigating' ? 'in-progress' : status === 'Open' ? 'open' : 'resolved'
  return <span className={cn('incident-status-pill', `is-${tone}`)}>{label}</span>
}

const ALL_INCIDENT_COLUMNS: ColumnDef<IncidentRow>[] = [
  {
    id: 'incident-id',
    accessorKey: 'incidentId',
    header: 'Incident ID',
    cell: ({ row }) => <span className="incident-cell-primary">{row.original.incidentId}</span>,
  },
  {
    id: 'incident-title',
    accessorKey: 'title',
    header: 'Incident Title',
    cell: ({ row }) => <span className="incident-cell-muted">{dash(row.original.title)}</span>,
  },
  {
    id: 'reported-at',
    accessorFn: (row) => row.reportedAt || row.createdOn,
    header: 'Created On',
    cell: ({ row }) => (
      <span className="incident-cell-primary">
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
      <span className="incident-cell-muted">{dash(row.original.firstResponseTime)}</span>
    ),
  },
  {
    id: 'closed-at',
    accessorKey: 'closedAt',
    header: 'Closed At',
    cell: ({ row }) => <span className="incident-cell-muted">{dash(row.original.closedAt)}</span>,
  },
  {
    id: 'module',
    accessorKey: 'module',
    header: 'Module',
    cell: ({ row }) => <span className="incident-cell-primary">{row.original.module}</span>,
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
      <span className="incident-cell-primary">{row.original.assignee || 'Unassigned'}</span>
    ),
  },
  {
    id: 'root-cause',
    accessorKey: 'rootCause',
    header: 'Root Cause',
    cell: ({ row }) => <span className="incident-cell-muted">{dash(row.original.rootCause)}</span>,
  },
]

export function IncidentTrackingPanel({ highlightIncidentId = null }: IncidentTrackingPanelProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { fileFormat } = useDefaultExportFormat()
  const [page, setPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const serverSort = useServerTableSort({
    sortFieldMap: INCIDENT_SORT_FIELD_MAP,
    defaultSortBy: 'reported-at',
    defaultSortOrder: 'desc',
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
      cards.map((metric) => ({
        ...metric,
        id: metric.id!,
        title: METRIC_TITLE_MAP[metric.id!] || metric.title,
      })),
      filteredActiveMetricIds,
    )
  }, [filteredActiveMetricIds, metrics])

  const deepLinkId = String(highlightIncidentId || '').trim()

  const listQueryParams = useMemo(() => {
    // Deep-link from My Tasks: ignore advanced filters so assigned row is not filtered out.
    const filters = deepLinkId ? {} : appliedFilters
    return buildPrefixedListQueryParams(filters, {
      page: deepLinkId ? 1 : page,
      limit: PAGE_SIZE,
      ...(deepLinkId
        ? { incidentId: deepLinkId, search: deepLinkId }
        : {
            ...enhancedSearch.buildSearchParams(),
            ...serverSort.sortParams,
          }),
    })
  }, [appliedFilters, deepLinkId, enhancedSearch, page, serverSort.sortParams])

  const { data: incidentsResult, isLoading } = useIncidents(listQueryParams)
  const assignMutation = useAssignIncident()

  const deepLinkQuery = useQuery({
    queryKey: [...incidentKeys.all, 'deeplink', deepLinkId],
    queryFn: () => fetchIncident(deepLinkId),
    enabled: Boolean(deepLinkId),
    retry: false,
  })

  const rows = useMemo(() => {
    const list = incidentsResult?.data ?? []
    const deepLinked = deepLinkQuery.data
    if (!deepLinked) return list
    if (list.some((row) => row.id === deepLinked.id || row.incidentId === deepLinked.incidentId)) {
      return list
    }
    return [deepLinked, ...list]
  }, [deepLinkQuery.data, incidentsResult?.data])

  const meta = incidentsResult?.meta
  const totalPages = meta?.totalPages ?? 1
  const totalItems = Math.max(meta?.total ?? 0, rows.length)

  const deepLinkNotifiedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!deepLinkId) return
    setPage(1)
    setAppliedFilters({})
    enhancedSearch.setGlobalSearch(deepLinkId)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when deep-link id changes
  }, [deepLinkId])

  const highlightedRow = useMemo(() => {
    if (!deepLinkId || isLoading || deepLinkQuery.isLoading) return null
    return (
      rows.find(
        (row) =>
          row.incidentId === deepLinkId ||
          row.id === deepLinkId ||
          String(row.incidentId || '').toLowerCase() === deepLinkId.toLowerCase(),
      ) ??
      deepLinkQuery.data ??
      null
    )
  }, [deepLinkId, deepLinkQuery.data, deepLinkQuery.isLoading, isLoading, rows])

  // Only open Assign modal from explicit action — not from My Tasks deep-link.
  const selectedRow = selected

  useEffect(() => {
    if (!deepLinkId || isLoading || deepLinkQuery.isLoading || deepLinkQuery.isFetching) return
    if (deepLinkNotifiedRef.current === deepLinkId) return
    deepLinkNotifiedRef.current = deepLinkId

    if (highlightedRow || deepLinkQuery.data) {
      const code = highlightedRow?.incidentId || deepLinkQuery.data?.incidentId || deepLinkId
      toast.message(`Showing assigned incident ${code}`)
      return
    }

    if (deepLinkQuery.isError) {
      toast.error(`Incident ${deepLinkId} was not found`)
    }
  }, [
    deepLinkId,
    deepLinkQuery.data,
    deepLinkQuery.isError,
    deepLinkQuery.isFetching,
    deepLinkQuery.isLoading,
    highlightedRow,
    isLoading,
  ])

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

  const handleExportIncidentRow = useCallback(
    async (incident: IncidentRow) => {
      try {
        await exportMappedItemsToFile(
          INCIDENT_EXPORT_COLUMN_MAP,
          [incident],
          fileFormat,
          `incident_${incident.incidentId || incident.id}`,
          {
            columnIds: exportColumnIds,
            catalogOrder: catalogColumnIds,
          },
        )
        toast.success('Incident exported')
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to export incident'))
      }
    },
    [catalogColumnIds, exportColumnIds, fileFormat],
  )

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
      meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
      cell: ({ row }) => {
        const incident = row.original
        const isOpen = activeDropdownId === incident.id
        return (
          <TableActionsDropdown
            label={`Open actions for ${incident.incidentId}`}
            isOpen={isOpen}
            onOpenChange={(open) => setActiveDropdownId(open ? incident.id : null)}
            menuWidth={200}
            maxVisibleItems={8}
          >
            <TableActionsItem
              icon={<ClipboardList className="size-3.5" />}
              onClick={() => {
                setActiveDropdownId(null)
                setSelected(incident)
              }}
            >
              Assign Incident
            </TableActionsItem>
            <TableActionsItem
              icon={<ExportDataIcon className="size-3.5" />}
              onClick={() => {
                setActiveDropdownId(null)
                void handleExportIncidentRow(incident)
              }}
            >
              Export Incident
            </TableActionsItem>
          </TableActionsDropdown>
        )
      },
    }

    return withServerSortMeta(
      [...preferenceColumns.filter((column) => column.id !== 'actions'), actionsColumn],
      INCIDENT_SORT_FIELD_MAP,
    )
  }, [activeDropdownId, handleExportIncidentRow, tableColumnPreferencesQuery.data])

  return (
    <div className="incident-page">
      <div className="incident-header">
        <div>
          <h2 className="referral-page-title">Error Reporting &amp; Incident Tracking</h2>
          <p className="referral-page-subtitle mt-1">Track errors &amp; incident in the platform</p>
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

      <div className="incident-stats-grid">
        {metricsLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="incident-stats-skeleton" />
            ))
          : metricCards.map((metric) => (
              <StatCard
                key={metric.id}
                className="incident-stat-card"
                title={metric.title}
                value={metric.value}
                trend={metric.trend}
                hint={metric.hint}
              />
            ))}
      </div>

      <div className="incident-table-card">
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
          resourceLabel="users"
        />
      </div>

      {exportFilterModals}

      <AssignUserModal
        open={Boolean(selectedRow)}
        incident={selectedRow}
        onClose={() => {
          setSelected(null)
        }}
        onSubmit={(department, user, assigneeId) => {
          if (!selectedRow) return
          assignMutation.mutate(
            { id: selectedRow.id, department, assignee: user, assigneeId },
            {
              onSuccess: async () => {
                const ticketId = selectedRow.sourceTicketId
                const applicationUrl = `/settings/main?tab=incident&incidentId=${encodeURIComponent(
                  selectedRow.incidentId || selectedRow.id,
                )}`
                try {
                  await escalateIncidentApplication(selectedRow.id, {
                    assigneeSubAdminId: assigneeId,
                    assigneeName: user,
                    adminNote: `Assigned incident ${selectedRow.incidentId} to ${user} (${department})`,
                    entityTitle:
                      selectedRow.title ||
                      selectedRow.incidentId ||
                      `Incident ${selectedRow.incidentId || selectedRow.id}`,
                    applicationUrl,
                    escalationTarget: 'application',
                    priority: 'High',
                    metadata: {
                      source: 'incident_tracking',
                      incidentId: selectedRow.incidentId,
                      department,
                      orderUrl: applicationUrl,
                      sourceTicketId: ticketId || undefined,
                    },
                  })
                  void queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
                  void queryClient.invalidateQueries({ queryKey: ['all-escalations'] })
                } catch (error) {
                  toast.error(
                    getApiErrorMessage(
                      error,
                      'Incident assigned, but failed to add it to My Tasks.',
                    ),
                  )
                }

                setSelected(null)
                toast.success(`Assigned to ${user} — appears in their My Tasks`, {
                  action: {
                    label: 'Open My Tasks',
                    onClick: () => navigate('/my-tasks'),
                  },
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
