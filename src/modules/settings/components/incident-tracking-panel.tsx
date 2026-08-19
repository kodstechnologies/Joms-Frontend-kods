import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ClipboardList } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { AssignUserModal } from './assign-user-modal'
import {
  DEFAULT_INCIDENT_METRIC_IDS,
  INCIDENT_METRIC_IDS,
  INCIDENT_METRIC_ID_SET,
  INCIDENT_MODULE_KEY,
} from '../config/incident-metrics.config'
import { useAssignIncident, useIncidentMetrics, useIncidents } from '../hooks/use-incidents'
import { fetchIncidents } from '../api/incidents-api'
import type { IncidentRow, IncidentSeverity, IncidentStatus } from '../types/settings'
import { StatCard } from '@/shared/components/dashboard/stat-card'
import { DataTable } from '@/shared/components/table/data-table'
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
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'

const PAGE_SIZE = 8

const INCIDENT_EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (row: IncidentRow) => string }
> = {
  incidentId: { header: 'Incident ID', accessor: (row) => exportDisplayValue(row.incidentId) },
  severity: { header: 'Severity', accessor: (row) => exportDisplayValue(row.severity) },
  module: { header: 'Module', accessor: (row) => exportDisplayValue(row.module) },
  status: { header: 'Status', accessor: (row) => exportDisplayValue(row.status) },
  assignee: {
    header: 'Assignee',
    accessor: (row) => exportDisplayValue(row.assignee || 'Unassigned'),
  },
  createdOn: { header: 'Created On', accessor: (row) => exportDisplayValue(row.createdOn) },
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

export function IncidentTrackingPanel() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [selected, setSelected] = useState<IncidentRow | null>(null)

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
        search: search || undefined,
      }),
    [appliedFilters, page, search],
  )

  const { data: incidentsResult, isLoading } = useIncidents(listQueryParams)
  const assignMutation = useAssignIncident()

  const rows = incidentsResult?.data ?? []
  const meta = incidentsResult?.meta
  const totalPages = meta?.totalPages ?? 1
  const totalItems = meta?.total ?? 0

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
      { search: search || undefined },
    )
  }, [search])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'incidents',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const columns = useMemo<ColumnDef<IncidentRow>[]>(
    () => [
      {
        accessorKey: 'incidentId',
        header: 'Incident ID',
        cell: ({ row }) => (
          <span className="font-medium text-white">{row.original.incidentId}</span>
        ),
      },
      {
        accessorKey: 'severity',
        header: 'Severity',
        cell: ({ row }) => <SeverityBadge severity={row.original.severity} />,
      },
      {
        accessorKey: 'module',
        header: 'Module',
        cell: ({ row }) => <span className="text-slate-300">{row.original.module}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'assignee',
        header: 'Assignee',
        cell: ({ row }) => (
          <span className="text-slate-400">{row.original.assignee || 'Unassigned'}</span>
        ),
      },
      {
        accessorKey: 'createdOn',
        header: 'Created On',
        cell: ({ row }) => <span className="text-slate-400">{row.original.createdOn}</span>,
      },
      {
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
      },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Error Reporting & Incident Tracking</h2>
          <p className="text-sm text-slate-400">Track errors & incident in the platform</p>
        </div>
        <Button
          variant="secondary"
          className="ui-manage-metrics"
          onClick={() => navigate('/metrics/incident-tracking')}
        >
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
          isLoading={isLoading}
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
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
        open={Boolean(selected)}
        incident={selected}
        onClose={() => setSelected(null)}
        onSubmit={(department, user, assigneeId) => {
          if (!selected) return
          assignMutation.mutate(
            { id: selected.id, department, assignee: user, assigneeId },
            {
              onSuccess: () => {
                const ticketId = selected.sourceTicketId
                setSelected(null)
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
