import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, Filter, RefreshCw, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useLoginTrails } from '../hooks/use-security'
import { useSettingsModule, useUpdateSettings } from '../hooks/use-settings'
import { securityDefaults } from '../mock/settings.defaults'
import type { LoginTrailRow, SecuritySettings } from '../types/settings'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { DataTable } from '@/shared/components/table/data-table'
import { cn } from '@/shared/lib/cn'

const PAGE_SIZE = 10

type TrailStatus = LoginTrailRow['status'] | ''

function StatusBadge({ status }: { status: LoginTrailRow['status'] }) {
  if (status === 'success') {
    return <span className="login-trails-status is-success">Success</span>
  }
  if (status === 'failed') {
    return <span className="login-trails-status is-failed">Failed</span>
  }
  return <span className="login-trails-status is-blocked">Blocked</span>
}

function downloadTrailsCsv(rows: LoginTrailRow[]) {
  const headers = [
    'Date',
    'Time',
    'Admin',
    'Email',
    'Role',
    'IP Address',
    'Action',
    'Status',
    'Location',
    'Device',
  ]
  const escape = (value: string) => `"${String(value ?? '').replace(/"/g, '""')}"`
  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      [
        row.date,
        row.time,
        row.adminName || '',
        row.adminEmail || '',
        row.role || '',
        row.ipAddress,
        row.action,
        row.status,
        row.location,
        row.device,
      ]
        .map(escape)
        .join(','),
    ),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `admin-login-trails-${new Date().toISOString().slice(0, 10)}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function LoginTrailsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TrailStatus>('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const securityQuery = useSettingsModule('security')
  const updateSecurity = useUpdateSettings('security')
  const securityConfig = (securityQuery.data?.config || securityDefaults) as SecuritySettings
  const loginAlerts = Boolean(securityConfig.loginAlerts)

  const {
    data: trailsResult,
    isLoading,
    refetch,
    isFetching,
  } = useLoginTrails({
    page,
    limit: PAGE_SIZE,
    search,
    status: statusFilter || undefined,
  })

  const rows = useMemo(() => trailsResult?.data ?? [], [trailsResult?.data])
  const meta = trailsResult?.meta
  const totalPages = meta?.totalPages ?? 1
  const totalItems = meta?.total ?? 0

  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.id))

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(rows.map((row) => row.id)))
  }, [allSelected, rows])

  const toggleOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const columns = useMemo<ColumnDef<LoginTrailRow>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            aria-label="Select all rows"
            checked={allSelected}
            onChange={toggleAll}
            className="security-checkbox-input"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Select row ${row.original.id}`}
            checked={selectedIds.has(row.original.id)}
            onChange={() => toggleOne(row.original.id)}
            className="security-checkbox-input"
          />
        ),
        meta: { headerClassName: 'w-10', cellClassName: 'w-10' },
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => <span className="text-white/80">{row.original.date}</span>,
      },
      {
        accessorKey: 'time',
        header: 'Time',
        cell: ({ row }) => <span className="text-white/60">{row.original.time}</span>,
      },
      {
        accessorKey: 'ipAddress',
        header: 'IP Address',
        cell: ({ row }) => <span className="text-white/80">{row.original.ipAddress || '—'}</span>,
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => <span className="text-white/80">{row.original.action}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ row }) => <span className="text-white/60">{row.original.location || '—'}</span>,
      },
      {
        accessorKey: 'device',
        header: 'Device',
        cell: ({ row }) => <span className="text-white/60">{row.original.device || '—'}</span>,
      },
    ],
    [allSelected, selectedIds, toggleAll, toggleOne],
  )

  const toggleLoginAlerts = () => {
    const next = !loginAlerts
    updateSecurity.mutate(
      { ...securityConfig, loginAlerts: next },
      {
        onSuccess: () => {
          toast.success(next ? 'Login alerts enabled' : 'Login alerts disabled')
        },
        onError: () => toast.error('Failed to update login alerts'),
      },
    )
  }

  const goBack = () =>
    navigateBackOrFallback(navigate, '/settings/main', { state: { settingsTab: 'security' } })

  return (
    <div className="login-trails-page">
      <p className="login-trails-breadcrumb">
        <button type="button" onClick={goBack} className="login-trails-breadcrumb-link">
          Settings
        </button>
        <span> / Platform Controls / Admin Login Trails</span>
      </p>

      <div className="login-trails-heading">
        <div className="login-trails-title-row">
          <button type="button" onClick={goBack} className="login-trails-back" aria-label="Back">
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h1 className="login-trails-title">Admin Login Trails</h1>
            <p className="login-trails-subtitle">
              Manage accounts that have been locked due to security reasons.
            </p>
          </div>
        </div>
      </div>

      <section className="login-trails-card">
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
          searchPlaceholder="Search by name, ID or profession."
          showAdvancedFilter={false}
          showExport={false}
          showSortIcons={false}
          pagination={{
            page,
            pageSize: PAGE_SIZE,
            totalItems,
            totalPages,
            onPageChange: setPage,
          }}
          resourceLabel="users"
          toolbarContent={
            <div className="login-trails-toolbar-actions">
              <div className="login-trails-alerts">
                <div className="security-switch-wrap">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={loginAlerts}
                    aria-label="Login Alerts"
                    disabled={updateSecurity.isPending || securityQuery.isLoading}
                    onClick={toggleLoginAlerts}
                    className={cn('security-switch', loginAlerts && 'is-on')}
                  >
                    <span className="security-switch-knob" />
                  </button>
                  <span className="security-switch-caption">{loginAlerts ? 'ON' : 'OFF'}</span>
                </div>
                <span className="login-trails-alerts-label">Login Alerts</span>
              </div>

              <button
                type="button"
                className="login-trails-tool-btn"
                disabled={isFetching}
                onClick={() => void refetch()}
              >
                <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} />
                Refresh
              </button>
              <button
                type="button"
                className="login-trails-tool-btn"
                onClick={() => setShowFilters((open) => !open)}
              >
                <Filter className="size-4" />
                Advance Filters
              </button>
              <button
                type="button"
                className="login-trails-export-btn"
                onClick={() => {
                  if (!rows.length) {
                    toast.message('No trails to export')
                    return
                  }
                  downloadTrailsCsv(rows)
                  toast.success('Export started')
                }}
              >
                <Upload className="size-4" />
                Export Data
              </button>
            </div>
          }
        />

        {showFilters ? (
          <div className="login-trails-filters">
            <label className="login-trails-filter-label" htmlFor="login-trails-status">
              Status
            </label>
            <select
              id="login-trails-status"
              className="login-trails-filter-select"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as TrailStatus)
                setPage(1)
              }}
            >
              <option value="">All</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="blocked">Blocked</option>
            </select>
            <button
              type="button"
              className="login-trails-tool-btn"
              onClick={() => {
                setStatusFilter('')
                setPage(1)
              }}
            >
              Clear
            </button>
          </div>
        ) : null}
      </section>
    </div>
  )
}
