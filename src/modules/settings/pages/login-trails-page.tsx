import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { fetchLoginTrails } from '../api/security-api'
import { SettingsSubpageShell } from '../components/settings-subpage-shell'
import { useLoginTrails } from '../hooks/use-security'
import { useSettingsModule, useUpdateSettings } from '../hooks/use-settings'
import { securityDefaults } from '../config/settings.config'
import type { LoginTrailRow, SecuritySettings } from '../types/settings'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { PageBreadcrumb } from '@/shared/components/navigation/page-breadcrumb'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { buildDefaultTableSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { cn } from '@/shared/lib/cn'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import type { FilterValues } from '@/shared/types/data-filter'
import {
  buildLoginTrailsListQueryParams,
  createLoginTrailsFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'

const PAGE_SIZE = 10

const SORT_FIELD_MAP = buildDefaultTableSortFieldMap([
  'date',
  'time',
  'ipAddress',
  'action',
  'status',
  'location',
  'device',
])

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
  if (status === 'warning') {
    return <span className="login-trails-status is-blocked">Warning</span>
  }
  return <span className="login-trails-status is-blocked">Blocked</span>
}

export function LoginTrailsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const resetSelection = useCallback(() => setSelectedIds(new Set()), [])
  const handlePageReset = useCallback(() => {
    resetSelection()
    setPage(1)
  }, [resetSelection])
  const serverSort = useServerTableSort({
    sortFieldMap: SORT_FIELD_MAP,
    defaultSortBy: 'createdAt',
    onPageReset: handlePageReset,
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: handlePageReset })
  const { buildSearchParams, globalSearch } = enhancedSearch

  const securityQuery = useSettingsModule('security')
  const updateSecurity = useUpdateSettings('security')
  const securityConfig = (securityQuery.data?.config || securityDefaults) as SecuritySettings
  const loginAlerts = Boolean(securityConfig.loginAlerts)

  const listQueryParams = useMemo(
    () =>
      buildLoginTrailsListQueryParams(appliedFilters, {
        page,
        limit: PAGE_SIZE,
        ...buildSearchParams(),
        ...serverSort.sortParams,
      }),
    [appliedFilters, buildSearchParams, page, serverSort.sortParams],
  )

  const { data: trailsResult, isLoading, refetch, isFetching } = useLoginTrails(listQueryParams)

  const rows = useMemo(() => trailsResult?.data ?? [], [trailsResult?.data])
  const meta = trailsResult?.meta
  const totalPages = meta?.totalPages ?? 1
  const totalItems = meta?.total ?? 0

  const handlePageChange = useCallback(
    (nextPage: number) => {
      resetSelection()
      setPage(nextPage)
    },
    [resetSelection],
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      resetSelection()
      enhancedSearch.setGlobalSearch(value)
      setPage(1)
    },
    [enhancedSearch, resetSelection],
  )

  const handleApplyFilters = useCallback(
    (values: FilterValues) => {
      toast.success('Filters applied')
      resetSelection()
      setAppliedFilters(values)
      setPage(1)
    },
    [resetSelection],
  )

  const exportBaseParams = useMemo(
    () =>
      buildLoginTrailsListQueryParams(appliedFilters, {
        search: globalSearch || undefined,
      }),
    [appliedFilters, globalSearch],
  )

  const handleExportData = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      const result = await fetchLoginTrails(params)
      return { data: result.data ?? [] }
    }
    return createLoginTrailsFilteredExportHandler(
      fetchForExport,
      TRAIL_EXPORT_COLUMN_MAP,
      'login_trails_export',
      exportBaseParams,
    )
  }, [exportBaseParams])

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
    () =>
      withServerSortMeta(
        [
          {
            id: 'select',
            header: () => (
              <input
                type="checkbox"
                aria-label="Select all rows"
                checked={allSelected}
                onChange={toggleAll}
                className="login-trails-checkbox"
              />
            ),
            cell: ({ row }) => (
              <input
                type="checkbox"
                aria-label={`Select row ${row.original.id}`}
                checked={selectedIds.has(row.original.id)}
                onChange={() => toggleOne(row.original.id)}
                className="login-trails-checkbox"
              />
            ),
            meta: { headerClassName: 'w-10', cellClassName: 'w-10' },
          },
          {
            accessorKey: 'date',
            header: 'Date',
            cell: ({ row }) => <span className="text-white/80">{row.original.date || '—'}</span>,
          },
          {
            accessorKey: 'time',
            header: 'Time',
            cell: ({ row }) => <span className="text-white/60">{row.original.time || '—'}</span>,
          },
          {
            accessorKey: 'ipAddress',
            header: 'IP Address',
            cell: ({ row }) => (
              <span className="text-white/80">{row.original.ipAddress || '—'}</span>
            ),
          },
          {
            accessorKey: 'action',
            header: 'Action',
            cell: ({ row }) => <span className="text-white/80">{row.original.action || '—'}</span>,
          },
          {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
          },
          {
            accessorKey: 'location',
            header: 'Location',
            cell: ({ row }) => (
              <span className="text-white/60">{row.original.location || '—'}</span>
            ),
          },
          {
            accessorKey: 'device',
            header: 'Device',
            cell: ({ row }) => <span className="text-white/60">{row.original.device || '—'}</span>,
          },
        ],
        SORT_FIELD_MAP,
      ),
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
    <SettingsSubpageShell activeTab="security">
      <div className="login-trails-page">
        <div className="login-trails-heading">
          <div className="login-trails-title-row">
            <button type="button" onClick={goBack} className="login-trails-back" aria-label="Back">
              <ArrowLeft className="size-5" />
            </button>
            <div className="min-w-0">
              <h1 className="login-trails-title">Admin Login Trails</h1>
              <div className="login-trails-breadcrumb">
                <PageBreadcrumb
                  items={[
                    { label: 'Settings', to: '/settings/main' },
                    {
                      label: 'Security & Access',
                      to: '/settings/main',
                      state: { settingsTab: 'security' },
                    },
                    { label: 'Admin Login Trails', isActive: true },
                  ]}
                />
              </div>
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

        <p className="login-trails-subtitle login-trails-subtitle-block">
          Monitor all admin login activities and security events
        </p>

        <section className="login-trails-card">
          <DataTable
            columns={columns}
            data={rows}
            getRowId={(row) => row.id}
            isLoading={isLoading}
            loadingRowCount={PAGE_SIZE}
            stickyHeader
            emptyMessage="No login trails found."
            searchValue={globalSearch}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search by admin name, email or IP"
            onAdvancedFilter={onAdvancedFilter}
            advancedFilterLabel="Advance Filters"
            advancedFilterVariant="secondary"
            onExport={onExport}
            {...serverSort.dataTableSortProps}
            pagination={{
              page,
              pageSize: PAGE_SIZE,
              totalItems,
              totalPages,
              onPageChange: handlePageChange,
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
    </SettingsSubpageShell>
  )
}
