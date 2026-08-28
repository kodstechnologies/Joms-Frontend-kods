import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, BarChart3, ClipboardList, ExternalLink, Flag, UserRound } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useFlagAuditLog, useRoleLogs, useSubAdminLogs } from '../hooks/use-rbac'
import { fetchRoleLogs, fetchSubAdminLogs } from '../api/rbac-api'
import type { AdminLogSubject, AuditLog } from '../types/rbac'
import { AdminNoteModal } from '../components/admin-note-modal'
import { RbacLoader } from '../components/rbac-loader'
import { RoleUsersModal } from '../components/role-users-modal'
import { VersionHistoryPanel } from '../components/version-history-panel'
import { DataTable } from '@/shared/components/table/data-table'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { RBAC_ADMIN_LOGS_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { uiTokens } from '@/shared/lib/design-tokens'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import type { FilterValues } from '@/shared/types/data-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildPrefixedListQueryParams,
  createPrefixedListExportHandler,
} from '@/shared/utils/export-filter-utils'

const PAGE_SIZE = 10

const LOG_EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (log: AuditLog) => string }
> = {
  action: { header: 'Activity', accessor: (log) => exportDisplayValue(log.action) },
  username: { header: 'Username', accessor: (log) => exportDisplayValue(log.username) },
  module: { header: 'Module', accessor: (log) => exportDisplayValue(log.module) },
  status: { header: 'Status', accessor: (log) => exportDisplayValue(log.status) },
  ipAddress: { header: 'IP Address', accessor: (log) => exportDisplayValue(log.ipAddress) },
  createdAt: { header: 'Timestamp', accessor: (log) => exportDisplayValue(log.createdAt) },
}

const formatDateTime = (value?: string) => {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatOverviewDate = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  const day = date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const time = date.toLocaleString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return `${day}, ${time}`
}

function StatusBadge({ status }: { status: string }) {
  const isSuccess = status.toLowerCase() === 'success'
  return (
    <span
      className={cn(
        'text-body-sm-semibold inline-flex rounded-full border px-2.5 py-0.5 capitalize',
        isSuccess
          ? 'border-brand-success/25 bg-brand-success/10 text-brand-success'
          : 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger',
      )}
    >
      {isSuccess ? 'Success' : 'Failed'}
    </span>
  )
}

function UserOverviewCard({
  subject,
  onOpenUser,
}: {
  subject?: AdminLogSubject
  onOpenUser: (userId: string) => void
}) {
  if (!subject || subject.type !== 'subAdmin') {
    return (
      <div className={cn(uiTokens.radiusCard, uiTokens.borderSubtle, 'bg-brand-surface p-6')}>
        <RbacLoader label="Loading overview..." className="min-h-[120px]" />
      </div>
    )
  }

  const roleLabel = subject.roles.map((r) => r.name).join(', ') || '—'
  const createdBy = subject.createdBy || 'Super Admin'

  return (
    <section>
      <h2 className="text-brand-text mb-3 text-sm font-semibold">Admin Overview</h2>
      <div className={cn(uiTokens.radiusCard, uiTokens.borderSubtle, 'bg-brand-surface p-6')}>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-brand-md bg-brand-accent/10 text-brand-accent grid size-9 place-items-center">
              <UserRound className="size-4" />
            </div>
            <h3 className="text-brand-text text-base font-semibold">Admin Info</h3>
          </div>
          <p className="text-brand-muted text-xs">
            Created At:{' '}
            <span className="text-brand-text font-medium">
              {formatOverviewDate(subject.createdAt)}
            </span>
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="text-brand-muted text-xs">Name</p>
              <button
                type="button"
                onClick={() => onOpenUser(subject.id)}
                className="text-brand-text decoration-brand-muted/40 hover:text-brand-accent mt-1 text-base font-semibold underline underline-offset-4 transition-colors"
              >
                {subject.fullname}
              </button>
            </div>
            <div>
              <p className="text-brand-muted text-xs">Role</p>
              <span className="text-brand-text mt-2 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold">
                {roleLabel}
              </span>
            </div>
            <div>
              <p className="text-brand-muted text-xs">Status</p>
              <span
                className={cn(
                  'text-body-sm-semibold mt-2 inline-flex rounded-full border px-2.5 py-0.5 capitalize',
                  subject.status === 'active'
                    ? 'border-brand-success/25 bg-brand-success/10 text-brand-success'
                    : 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger',
                )}
              >
                {subject.status}
              </span>
            </div>
            <div>
              <p className="text-brand-muted text-xs">Email ID</p>
              <p className="text-brand-text mt-1 text-sm font-medium">{subject.email}</p>
            </div>
          </div>

          <div className="flex flex-col items-end justify-end">
            <p className="text-brand-muted text-xs">
              Created By: <span className="text-brand-text font-semibold">{createdBy}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function RoleOverviewCard({
  subject,
  onViewRoleUsers,
}: {
  subject?: AdminLogSubject
  onViewRoleUsers: (roleId: string) => void
}) {
  if (!subject || subject.type !== 'role') {
    return (
      <div className={cn(uiTokens.radiusCard, uiTokens.borderSubtle, 'bg-brand-surface p-6')}>
        <RbacLoader label="Loading overview..." className="min-h-[120px]" />
      </div>
    )
  }

  const createdBy = subject.createdBy || 'Super Admin'

  return (
    <section>
      <h2 className="text-brand-text mb-3 text-sm font-semibold">Admin Overview</h2>
      <div className={cn(uiTokens.radiusCard, uiTokens.borderSubtle, 'bg-brand-surface p-6')}>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-brand-md bg-brand-accent/10 text-brand-accent grid size-9 place-items-center">
              <UserRound className="size-4" />
            </div>
            <h3 className="text-brand-text text-base font-semibold">Admin Info</h3>
          </div>
          <p className="text-brand-muted text-xs">
            Created At:{' '}
            <span className="text-brand-text font-medium">
              {formatOverviewDate(subject.createdAt)}
            </span>
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-brand-muted text-xs">Role</p>
            <span className="text-brand-text mt-2 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold">
              {subject.name}
            </span>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Status</p>
            <span
              className={cn(
                'text-body-sm-semibold mt-2 inline-flex rounded-full border px-2.5 py-0.5 capitalize',
                subject.status === 'active'
                  ? 'border-brand-success/25 bg-brand-success/10 text-brand-success'
                  : 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger',
              )}
            >
              {subject.status}
            </span>
          </div>
          <div>
            <p className="text-brand-muted text-xs">No. Of Users</p>
            <button
              type="button"
              onClick={() => onViewRoleUsers(subject.id)}
              className="text-brand-text hover:text-brand-accent mt-2 flex items-center gap-1.5 text-sm font-semibold transition-colors"
              aria-label={`View users assigned to ${subject.name}`}
            >
              {String(subject.userCount).padStart(2, '0')}
              <ExternalLink className="size-3.5" />
            </button>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Last Action</p>
            <p className="text-brand-text mt-2 text-sm font-medium">
              {formatOverviewDate(subject.lastActionAt)}
            </p>
          </div>
        </div>

        <p className="text-brand-muted mt-5 text-right text-xs">
          Created By: <span className="text-brand-text font-medium">{createdBy}</span>
        </p>
      </div>
    </section>
  )
}

export function AdminLogsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isRole = location.pathname.includes('/roles/')

  const [page, setPage] = useState(1)
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedAdminNote, setSelectedAdminNote] = useState<string | null>(null)
  const [roleUsersModalId, setRoleUsersModalId] = useState<string | null>(null)

  const logParams = useMemo(
    () =>
      buildPrefixedListQueryParams(appliedFilters, {
        page,
        limit: PAGE_SIZE,
        ...enhancedSearch.buildSearchParams(),
      }),
    [appliedFilters, enhancedSearch, page],
  )
  const historyParams = { page: 1, limit: 50 }

  const subAdminLogsQuery = useSubAdminLogs(id, logParams, {
    enabled: Boolean(id) && !isRole,
  })
  const roleLogsQuery = useRoleLogs(id, logParams, {
    enabled: Boolean(id) && isRole,
  })
  const logsQuery = isRole ? roleLogsQuery : subAdminLogsQuery

  const historySubAdminQuery = useSubAdminLogs(id, historyParams, {
    enabled: Boolean(id) && historyOpen && !isRole,
  })
  const historyRoleQuery = useRoleLogs(id, historyParams, {
    enabled: Boolean(id) && historyOpen && isRole,
  })
  const historyQuery = isRole ? historyRoleQuery : historySubAdminQuery

  const flagMutation = useFlagAuditLog()

  const subject = logsQuery.data?.data.subject
  const logs = logsQuery.data?.data.logs ?? []
  const meta = logsQuery.data?.meta

  const handleApplyFilters = useCallback((values: FilterValues) => {
    toast.success('Filters applied')
    setAppliedFilters(values)
    setPage(1)
  }, [])

  const handleExportData = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      const result = isRole ? await fetchRoleLogs(id, params) : await fetchSubAdminLogs(id, params)
      return { data: result.data?.logs ?? [] }
    }
    return createPrefixedListExportHandler(
      fetchForExport,
      LOG_EXPORT_COLUMN_MAP,
      'rbac_admin_logs_export',
      { search: enhancedSearch.globalSearch || undefined },
    )
  }, [enhancedSearch.globalSearch, id, isRole])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'rbac-admin-logs',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const pageTitle = isRole ? 'Admin Logs' : 'User Logs'
  const breadcrumbName =
    subject?.type === 'role'
      ? subject.name
      : subject?.type === 'subAdmin'
        ? subject.fullname
        : isRole
          ? 'Admin'
          : 'User'

  const handleViewRoleUsers = useCallback((roleId: string) => {
    setRoleUsersModalId(roleId)
  }, [])

  const handleOpenUser = useCallback(
    (userId: string) => {
      navigate(`/settings/access/users/${userId}`)
    },
    [navigate],
  )

  const openHistory = useCallback(() => {
    setHistoryOpen(true)
    setActiveDropdownId(null)
  }, [])

  const handleFlag = useCallback(
    async (logId: string) => {
      try {
        await flagMutation.mutateAsync(logId)
        toast.success('Action flagged')
        logsQuery.refetch()
      } catch {
        toast.error('Failed to flag action')
      }
      setActiveDropdownId(null)
    },
    [flagMutation, logsQuery],
  )

  const renderAdminNoteCell = useCallback((note?: string) => {
    if (!note?.trim()) {
      return <span className="text-brand-muted">—</span>
    }

    return (
      <button
        type="button"
        onClick={() => setSelectedAdminNote(note)}
        className="text-brand-accent decoration-brand-accent/40 hover:text-brand-gold-from max-w-[220px] truncate text-left text-xs font-medium underline underline-offset-2"
        title={note}
      >
        {note}
      </button>
    )
  }, [])

  const userColumns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <button
            type="button"
            onClick={openHistory}
            className="text-brand-accent decoration-brand-accent/40 hover:text-brand-gold-from text-left text-xs font-semibold underline underline-offset-2"
          >
            {row.original.action}
          </button>
        ),
      },
      {
        accessorKey: 'module',
        header: 'Module',
        cell: ({ row }) => (
          <span className="text-brand-text text-body-sm-semibold inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-medium">
            {row.original.module}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Timestamp',
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      { accessorKey: 'ipAddress', header: 'IP Address' },
      {
        accessorKey: 'adminNote',
        header: 'Admin Note',
        cell: ({ row }) => renderAdminNoteCell(row.original.adminNote),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
        cell: ({ row }) => {
          const logId = row.original.id || row.original._id || ''
          return (
            <TableActionsDropdown
              label="Open log actions"
              isOpen={activeDropdownId === logId}
              onOpenChange={(open) => setActiveDropdownId(open ? logId : null)}
            >
              <TableActionsItem icon={<ClipboardList className="size-3.5" />} onClick={openHistory}>
                View Pre-Version
              </TableActionsItem>
              <TableActionsItem
                icon={<Flag className="text-brand-danger size-3.5" />}
                onClick={() => handleFlag(logId)}
              >
                <span className={row.original.flagged ? 'text-brand-muted' : 'text-brand-danger'}>
                  {row.original.flagged ? 'Already Flagged' : 'Flag Action'}
                </span>
              </TableActionsItem>
            </TableActionsDropdown>
          )
        },
      },
    ],
    [activeDropdownId, handleFlag, openHistory, renderAdminNoteCell],
  )

  const roleColumns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      {
        accessorKey: 'action',
        header: 'Activity',
        cell: ({ row }) => (
          <button
            type="button"
            onClick={openHistory}
            className="text-brand-accent text-left text-xs font-semibold hover:underline"
          >
            {row.original.action}
          </button>
        ),
      },
      { accessorKey: 'username', header: 'Username' },
      {
        accessorKey: 'module',
        header: 'Module',
        cell: ({ row }) => (
          <span className="text-brand-text text-body-sm-semibold inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-medium">
            {row.original.module}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Timestamp',
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      { accessorKey: 'ipAddress', header: 'IP Address' },
      {
        accessorKey: 'adminNote',
        header: 'Admin Note',
        cell: ({ row }) => renderAdminNoteCell(row.original.adminNote),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
        cell: ({ row }) => {
          const logId = row.original.id || row.original._id || ''
          return (
            <TableActionsDropdown
              label="Open log actions"
              isOpen={activeDropdownId === logId}
              onOpenChange={(open) => setActiveDropdownId(open ? logId : null)}
            >
              <TableActionsItem icon={<ClipboardList className="size-3.5" />} onClick={openHistory}>
                View Pre-Version
              </TableActionsItem>
              <TableActionsItem
                icon={<Flag className="text-brand-danger size-3.5" />}
                onClick={() => handleFlag(logId)}
              >
                <span className={row.original.flagged ? 'text-brand-muted' : 'text-brand-danger'}>
                  {row.original.flagged ? 'Already Flagged' : 'Flag Action'}
                </span>
              </TableActionsItem>
            </TableActionsDropdown>
          )
        },
      },
    ],
    [activeDropdownId, handleFlag, openHistory, renderAdminNoteCell],
  )

  const columns = isRole ? roleColumns : userColumns

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/settings/access')}
            className="group font-heading text-h3 text-brand-text hover:text-brand-accent flex w-fit items-center gap-2 font-bold tracking-tight transition-colors"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>{pageTitle}</span>
          </button>
          <div className="text-body-sm-medium text-muted flex items-center gap-1.5 pl-7">
            <button
              type="button"
              onClick={() => navigateBackOrFallback(navigate, '/settings/access')}
              className="hover:text-brand-text transition-colors"
            >
              Role Based Access
            </button>
            <span className="text-brand-text/30">/</span>
            <span className="text-brand-text font-bold">{breadcrumbName}</span>
          </div>
        </div>

        <Button
          variant="secondary"
          className="ui-manage-metrics"
          onClick={() => navigate('/metrics/admin-logs')}
        >
          <BarChart3 className="size-4" />
          Manage Metrics
        </Button>
      </div>

      {isRole ? (
        <RoleOverviewCard subject={subject} onViewRoleUsers={handleViewRoleUsers} />
      ) : (
        <UserOverviewCard subject={subject} onOpenUser={handleOpenUser} />
      )}

      <div>
        <h2 className="text-brand-text text-lg font-semibold">Action Logs</h2>
        <p className="text-brand-muted mt-1 text-sm">
          Complete history of actions performed by this admin
        </p>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        getRowId={(row) => row.id || row._id || row.action}
        isLoading={logsQuery.isLoading}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={RBAC_ADMIN_LOGS_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by action, module or note"
        onAdvancedFilter={onAdvancedFilter}
        advancedFilterVariant="primary"
        onExport={onExport}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          totalItems: meta?.total ?? 0,
          totalPages: meta?.totalPages ?? 1,
          onPageChange: setPage,
        }}
        resourceLabel="logs"
        emptyMessage="No action logs found."
      />

      {exportFilterModals}

      <VersionHistoryPanel
        open={historyOpen}
        logs={historyQuery.data?.data.logs ?? logs}
        isLoading={historyQuery.isLoading}
        onClose={() => setHistoryOpen(false)}
        onRolledBack={() => {
          void logsQuery.refetch()
          void historyQuery.refetch()
        }}
      />
      <AdminNoteModal
        open={Boolean(selectedAdminNote)}
        note={selectedAdminNote ?? undefined}
        onClose={() => setSelectedAdminNote(null)}
      />
      <RoleUsersModal
        open={Boolean(roleUsersModalId)}
        roleId={roleUsersModalId ?? ''}
        onClose={() => setRoleUsersModalId(null)}
      />
    </div>
  )
}
