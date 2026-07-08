import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ClipboardList } from 'lucide-react'
import { toast } from 'sonner'

import { AssignUserModal } from './assign-user-modal'
import { incidentMetricsMock, incidentsMock } from '../mock/incident-tracking.mock'
import type { IncidentRow, IncidentSeverity, IncidentStatus } from '../types/settings'
import { StatCard } from '@/shared/components/dashboard/stat-card'
import { DataTable } from '@/shared/components/table/data-table'
import { ResponsiveGrid } from '@/shared/components/responsive/responsive-grid'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

const PAGE_SIZE = 8

function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  const styles: Record<IncidentSeverity, string> = {
    Low: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    Medium: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    High: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
    Critical: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  }
  return (
    <span className={cn('rounded-full border px-2.5 py-0.5 text-[11px] font-semibold', styles[severity])}>
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
    <span className={cn('rounded-full border px-2.5 py-0.5 text-[11px] font-semibold', styles[status])}>
      {status}
    </span>
  )
}

export function IncidentTrackingPanel() {
  const [incidents, setIncidents] = useState(incidentsMock)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<IncidentRow | null>(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return incidents
    return incidents.filter(
      (row) =>
        row.incidentId.toLowerCase().includes(query) ||
        row.module.toLowerCase().includes(query) ||
        row.assignee.toLowerCase().includes(query),
    )
  }, [incidents, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns = useMemo<ColumnDef<IncidentRow>[]>(
    () => [
      {
        accessorKey: 'incidentId',
        header: 'Incident ID',
        cell: ({ row }) => <span className="font-medium text-white">{row.original.incidentId}</span>,
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
        cell: ({ row }) => <span className="text-slate-400">{row.original.assignee}</span>,
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
        <Button variant="secondary" onClick={() => toast.message('Metrics configuration coming soon')}>
          Manage Metrics
        </Button>
      </div>

      <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={4} gap={4}>
        {incidentMetricsMock.map((metric) => (
          <StatCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            trend={metric.trend}
            hint={metric.hint}
          />
        ))}
      </ResponsiveGrid>

      <div className={cn(uiTokens.radiusCard, uiTokens.borderSubtle, 'bg-brand-surface p-4 sm:p-5')}>
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.id}
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          searchPlaceholder="Search by name, ID or profession"
          onAdvancedFilter={() => toast.message('Advanced filters coming soon')}
          onExport={() => toast.success('Export started')}
          pagination={{
            page,
            pageSize: PAGE_SIZE,
            totalItems: filtered.length,
            totalPages,
            onPageChange: setPage,
          }}
          resourceLabel="incidents"
        />
      </div>

      <AssignUserModal
        open={Boolean(selected)}
        incident={selected}
        onClose={() => setSelected(null)}
        onSubmit={(department, user) => {
          if (!selected) return
          setIncidents((current) =>
            current.map((row) =>
              row.id === selected.id ? { ...row, assignee: user } : row,
            ),
          )
          setSelected(null)
          toast.success(`Assigned ${user} from ${department}`)
        }}
      />
    </div>
  )
}
