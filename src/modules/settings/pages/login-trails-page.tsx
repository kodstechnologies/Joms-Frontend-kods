import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { fetchLoginTrails } from '../api/security-api'
import { useLoginTrails } from '../hooks/use-security'
import { useSettingsModule, useUpdateSettings } from '../hooks/use-settings'
import { securityDefaults } from '../mock/settings.defaults'
import type { LoginTrailRow, SecuritySettings } from '../types/settings'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { DataTable } from '@/shared/components/table/data-table'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { SETTINGS_LOGIN_TRAILS_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import { cn } from '@/shared/lib/cn'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import type { FilterValues } from '@/shared/types/data-filter'
import {
  buildPrefixedListQueryParams,
  createPrefixedListExportHandler,
} from '@/shared/utils/export-filter-utils'

const PAGE_SIZE = 10

const TRAIL_EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (row: LoginTrailRow) => string }
> = {
  date: { header: 'Date', accessor: (row) => exportDisplayValue(row.date) },
  time: { header: 'Time', accessor: (row) => exportDisplayValue(row.time) },
  adminName: { header: 'Admin', accessor: (row) => exportDisplayValue(row.adminName) },
  adminEmail: { header: 'Email', accessor: (row) => exportDisplayValue(row.adminEmail) },
  role: { header: 'Role', accessor: (row) => exportDisplayValue(row.role) },
  ipAddress: { header: 'IP Address', accessor: (row) => exportDisplayValue(row.ipAddress) },
  action: { header: 'Action', accessor: (row) => exportDisplayValue(row.action) },
  status: { header: 'Status', accessor: (row) => exportDisplayValue(row.status) },
  location: { header: 'Location', accessor: (row) => exportDisplayValue(row.location) },
  device: { header: 'Device', accessor: (row) => exportDisplayValue(row.device) },
}

function StatusBadge({ status }: { status: LoginTrailRow['status'] }) {
  if (status === 'success') {
    return <span className="login-trails-status is-success">Success</span>
  }
  if (status === 'failed') {
    return <span className="login-trails-status is-failed">Failed</span>
  }
  return <span className="login-trails-status is-blocked">Blocked</span>
}

export function LoginTrailsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const securityQuery = useSettingsModule('security')
  const updateSecurity = useUpdateSettings('security')
  const securityConfig = (securityQuery.data?.config || securityDefaults) as SecuritySettings
  const loginAlerts = Boolean(securityConfig.loginAlerts)

  const listQueryParams = useMemo(
    () =>
      buildPrefixedListQueryParams(appliedFilters, {
        page,
        limit: PAGE_SIZE,
        ...enhancedSearch.buildSearchParams(),
      }),
    [appliedFilters, enhancedSearch, page],
  )

  const { data: trailsResult, isLoading, refetch, isFetching } = useLoginTrails(listQueryParams)

  const rows = useMemo(() => trailsResult?.data ?? [], [trailsResult?.data])
  const meta = trailsResult?.meta
  const totalPages = meta?.totalPages ?? 1
  const totalItems = meta?.total ?? 0

  const handleApplyFilters = useCallback((values: FilterValues) => {
    toast.success('Filters applied')
    setAppliedFilters(values)
    setPage(1)
  }, [])

  const handleExportData = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      const result = await fetchLoginTrails(params)
      return { data: result.data ?? [] }
    }
    return createPrefixedListExportHandler(
      fetchForExport,
      TRAIL_EXPORT_COLUMN_MAP,
      'login_trails_export',
      { search: enhancedSearch.globalSearch || undefined },
    )
  }, [enhancedSearch.globalSearch])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'login-trails',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

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

        <button
          type="button"
          role="switch"
          aria-checked={loginAlerts}
          aria-label="Login Alerts"
          disabled={updateSecurity.isPending || securityQuery.isLoading}
          onClick={toggleLoginAlerts}
          className="login-trails-alerts"
        >
          <span className={cn('login-trails-switch', loginAlerts && 'is-on')} aria-hidden>
            <span className="login-trails-switch-knob" />
          </span>
          <span className="login-trails-alerts-label">Login Alerts</span>
        </button>
      </div>

      <section className="login-trails-card">
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          searchValue={enhancedSearch.globalSearch}
          onSearchChange={enhancedSearch.setGlobalSearch}
          searchableColumns={SETTINGS_LOGIN_TRAILS_SEARCH_COLUMNS}
          columnSearches={enhancedSearch.columnSearches}
          onColumnSearchChange={enhancedSearch.setColumnSearch}
          onColumnSearchRemove={enhancedSearch.removeColumnSearch}
          onClearAllSearches={enhancedSearch.clearAll}
          searchPlaceholder="Search by name, ID or profession."
          onAdvancedFilter={onAdvancedFilter}
          advancedFilterVariant="primary"
          onExport={onExport}
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
            <button
              type="button"
              className="login-trails-tool-btn"
              disabled={isFetching}
              onClick={() => void refetch()}
            >
              <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} />
              Refresh
            </button>
          }
        />
        {exportFilterModals}
      </section>
    </div>
  )
}
