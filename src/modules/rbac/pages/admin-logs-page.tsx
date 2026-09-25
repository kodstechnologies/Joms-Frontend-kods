import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, Copy, ExternalLink, FileText, Flag, RotateCcw, UserRound } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ExportDataIcon, ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import {
  useFlagAuditLog,
  useMySubAdminLogs,
  useRoleLogs,
  useRollbackAuditLog,
  useSubAdminLogs,
} from '../hooks/use-rbac'
import { fetchMySubAdminLogs, fetchRoleLogs, fetchSubAdminLogs } from '../api/rbac-api'
import type { AdminLogSubject, AuditLog } from '../types/rbac'
import { AdminNoteModal } from '../components/admin-note-modal'
import { FlagActionModal } from '../components/flag-action-modal'
import { RbacLoader } from '../components/rbac-loader'
import { RoleUsersModal } from '../components/role-users-modal'
import { VersionHistoryPanel } from '../components/version-history-panel'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { buildDefaultTableSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { RBAC_ADMIN_LOGS_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { LogStatusBadge } from '@/shared/components/ui/log-status-badge'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { PageBreadcrumb } from '@/shared/components/navigation/page-breadcrumb'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import type { FilterValues } from '@/shared/types/data-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildPrefixedListQueryParams,
  createPrefixedListExportHandler,
  exportMappedItemsToFile,
} from '@/shared/utils/export-filter-utils'
import { formatDateTimeEnInLogs as formatDateTime } from '@/shared/lib/format-datetime'
import { useDefaultExportFormat } from '@/modules/settings/hooks/use-default-export-format'

const PAGE_SIZE = 10

const USER_LOG_SORT_FIELD_MAP = buildDefaultTableSortFieldMap([
  'action',
  'module',
  'createdAt',
  'status',
  'ipAddress',
  'adminNote',
])
const ROLE_LOG_SORT_FIELD_MAP = buildDefaultTableSortFieldMap([
  'action',
  'username',
  'module',
  'createdAt',
  'status',
  'ipAddress',
  'adminNote',
])

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

const OVERVIEW_LABEL_CLASS = 'admin-info-label'
const OVERVIEW_VALUE_CLASS = 'admin-info-value'

const formatOverviewDate = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
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

function OverviewField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="admin-info-field">
      <p className={OVERVIEW_LABEL_CLASS}>{label}</p>
      {children}
    </div>
  )
}

function RoleNamePill({ label }: { label: string }) {
  return <span className="admin-info-role-pill">{label}</span>
}

function EntityStatusPill({ status }: { status: string }) {
  const isActive = status.toLowerCase() === 'active'
  return (
    <span className={cn('admin-info-status-pill', isActive ? 'is-active' : 'is-inactive')}>
      {isActive ? 'Active' : status}
    </span>
  )
}

function ModulePill({ label }: { label: string }) {
  return (
    <span className="text-brand-text inline-flex rounded-full border border-white/10 bg-[#0A0A0A] px-2.5 py-1 text-sm font-medium">
      {label}
    </span>
  )
}

function AdminInfoCard({
  children,
  createdAt,
  createdBy,
}: {
  children: ReactNode
  createdAt?: string
  createdBy: string
}) {
  return (
    <section className="admin-info-card">
      <div className="admin-info-card-left">
        <div className="admin-info-card-heading">
          <div className="admin-info-avatar">
            <UserRound className="size-4" strokeWidth={1.75} />
          </div>
          <h3 className="admin-info-title">Admin Info</h3>
        </div>
        <div className="admin-info-card-main">{children}</div>
      </div>

      <div className="admin-info-card-right">
        <div className="admin-info-meta">
          <p className={OVERVIEW_LABEL_CLASS}>Created At</p>
          <p className={`${OVERVIEW_VALUE_CLASS} whitespace-nowrap`}>
            {formatOverviewDate(createdAt)}
          </p>
        </div>
        <div className="admin-info-meta">
          <p className={OVERVIEW_LABEL_CLASS}>Created By</p>
          <p className={OVERVIEW_VALUE_CLASS}>{createdBy}</p>
        </div>
      </div>
    </section>
  )
}

function UserOverviewCard({
  subject,
  onOpenUser,
}: {
  subject?: AdminLogSubject
  onOpenUser: (userId: string) => void
}) {
  if (!subject || (subject.type !== 'subAdmin' && subject.type !== 'superadmin')) {
    return (
      <div className="admin-info-card admin-info-card-loading">
        <RbacLoader label="Loading overview..." className="min-h-[120px]" />
      </div>
    )
  }

  const isSuperAdmin = subject.type === 'superadmin'
  const roleLabel = isSuperAdmin
    ? subject.roleLabel || 'Super Admin'
    : subject.roles.map((r) => r.name).join(', ') || '—'
  const createdBy = isSuperAdmin ? 'System' : subject.createdBy || 'Super Admin'
  const displayName = subject.fullname || '—'

  return (
    <AdminInfoCard createdAt={subject.createdAt} createdBy={createdBy}>
      <div className="admin-info-user-grid">
        <OverviewField label="Name">
          <button
            type="button"
            onClick={() => onOpenUser(subject.id)}
            className="admin-info-name-link"
          >
            {displayName}
          </button>
        </OverviewField>
        <OverviewField label="Role">
          <RoleNamePill label={roleLabel} />
        </OverviewField>
        <OverviewField label="Status">
          <EntityStatusPill status={subject.status} />
        </OverviewField>
        <OverviewField label="Email ID">
          <p className={OVERVIEW_VALUE_CLASS}>{subject.email}</p>
        </OverviewField>
      </div>
    </AdminInfoCard>
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
      <div className="admin-info-card admin-info-card-loading">
        <RbacLoader label="Loading overview..." className="min-h-[120px]" />
      </div>
    )
  }

  const createdBy = subject.createdBy || 'Super Admin'

  return (
    <AdminInfoCard createdAt={subject.createdAt} createdBy={createdBy}>
      <div className="admin-info-role-grid">
        <OverviewField label="Role">
          <RoleNamePill label={subject.name} />
        </OverviewField>
        <OverviewField label="Status">
          <EntityStatusPill status={subject.status} />
        </OverviewField>
        <OverviewField label="No. Of Users">
          <button
            type="button"
            onClick={() => onViewRoleUsers(subject.id)}
            className="admin-info-users-link"
            aria-label={`View users assigned to ${subject.name}`}
          >
            {String(subject.userCount).padStart(2, '0')}
            <ExternalLink className="size-3.5" />
          </button>
        </OverviewField>
        <OverviewField label="Last Action">
          <p className={`${OVERVIEW_VALUE_CLASS} whitespace-nowrap`}>
            {formatOverviewDate(subject.lastActionAt)}
          </p>
        </OverviewField>
      </div>
    </AdminInfoCard>
  )
}

export function AdminLogsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isRole = location.pathname.includes('/roles/')
  const isSelfProfile = location.pathname.includes('/my-profile/logs')

  const [page, setPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: isRole ? ROLE_LOG_SORT_FIELD_MAP : USER_LOG_SORT_FIELD_MAP,
    defaultSortBy: 'createdAt',
    onPageReset: () => setPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedAdminNote, setSelectedAdminNote] = useState<string | null>(null)
  const [roleUsersModalId, setRoleUsersModalId] = useState<string | null>(null)
  const [flagLogId, setFlagLogId] = useState<string | null>(null)
  const [rollbackLog, setRollbackLog] = useState<AuditLog | null>(null)
  const { fileFormat } = useDefaultExportFormat()

  const logParams = useMemo(
    () =>
      buildPrefixedListQueryParams(appliedFilters, {
        page,
        limit: PAGE_SIZE,
        ...enhancedSearch.buildSearchParams(),
        ...serverSort.sortParams,
      }),
    [appliedFilters, enhancedSearch, page, serverSort.sortParams],
  )
  const historyParams = { page: 1, limit: 50 }

  const myLogsQuery = useMySubAdminLogs(logParams, {
    enabled: isSelfProfile,
  })
  const subAdminLogsQuery = useSubAdminLogs(id, logParams, {
    enabled: Boolean(id) && !isRole && !isSelfProfile,
  })
  const roleLogsQuery = useRoleLogs(id, logParams, {
    enabled: Boolean(id) && isRole,
  })
  const logsQuery = isSelfProfile ? myLogsQuery : isRole ? roleLogsQuery : subAdminLogsQuery

  const historyMyQuery = useMySubAdminLogs(historyParams, {
    enabled: isSelfProfile && historyOpen,
  })
  const historySubAdminQuery = useSubAdminLogs(id, historyParams, {
    enabled: Boolean(id) && historyOpen && !isRole && !isSelfProfile,
  })
  const historyRoleQuery = useRoleLogs(id, historyParams, {
    enabled: Boolean(id) && historyOpen && isRole,
  })
  const historyQuery = isSelfProfile
    ? historyMyQuery
    : isRole
      ? historyRoleQuery
      : historySubAdminQuery

  const flagMutation = useFlagAuditLog()
  const rollbackMutation = useRollbackAuditLog()

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
      const result = isSelfProfile
        ? await fetchMySubAdminLogs(params)
        : isRole
          ? await fetchRoleLogs(id, params)
          : await fetchSubAdminLogs(id, params)
      return { data: result.data?.logs ?? [] }
    }
    return createPrefixedListExportHandler(
      fetchForExport,
      LOG_EXPORT_COLUMN_MAP,
      'rbac_admin_logs_export',
      { search: enhancedSearch.globalSearch || undefined },
    )
  }, [enhancedSearch.globalSearch, id, isRole, isSelfProfile])

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
  const profileFallback = isSelfProfile ? '/settings/access/my-profile' : '/settings/access'
  const breadcrumbName =
    subject?.type === 'role'
      ? subject.name
      : subject?.type === 'subAdmin'
        ? subject.fullname
        : subject?.type === 'superadmin'
          ? subject.fullname
          : isRole
            ? 'Admin'
            : isSelfProfile
              ? 'My Profile'
              : 'User'

  const handleViewRoleUsers = useCallback((roleId: string) => {
    setRoleUsersModalId(roleId)
  }, [])

  const handleOpenUser = useCallback(
    (userId: string) => {
      if (isSelfProfile || subject?.type === 'superadmin') {
        navigate('/settings/access/my-profile')
        return
      }
      navigate(`/settings/access/users/${userId}`)
    },
    [isSelfProfile, navigate, subject?.type],
  )

  const openHistory = useCallback(() => {
    setHistoryOpen(true)
    setActiveDropdownId(null)
  }, [])

  const handleFlag = useCallback(
    async (payload: { reasons: string[]; note: string }) => {
      void payload
      if (!flagLogId) return
      try {
        await flagMutation.mutateAsync(flagLogId)
        toast.success('Action flagged')
        setFlagLogId(null)
        logsQuery.refetch()
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to flag action'))
      }
    },
    [flagLogId, flagMutation, logsQuery],
  )

  const openFlagModal = useCallback((logId: string) => {
    setFlagLogId(logId)
    setActiveDropdownId(null)
  }, [])

  const copyLogId = useCallback(async (logId: string) => {
    if (!logId) {
      toast.error('Log ID is missing.')
      return
    }
    try {
      await navigator.clipboard.writeText(logId)
      toast.success('Log ID copied')
    } catch {
      toast.error('Failed to copy log ID')
    }
  }, [])

  const confirmRollback = useCallback(async () => {
    const logId = rollbackLog?.id || rollbackLog?._id || ''
    if (!logId) return
    try {
      await rollbackMutation.mutateAsync(logId)
      toast.success('Action rolled back')
      setRollbackLog(null)
      void logsQuery.refetch()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to roll back action'))
    }
  }, [logsQuery, rollbackLog, rollbackMutation])

  const renderAdminNoteCell = useCallback((note?: string) => {
    if (!note?.trim()) {
      return <span className="text-brand-muted">—</span>
    }

    return (
      <button
        type="button"
        onClick={() => setSelectedAdminNote(note)}
        className="text-brand-text max-w-[220px] truncate text-left"
        title={note}
      >
        {note}
      </button>
    )
  }, [])

  const renderLogActions = useCallback(
    (log: AuditLog) => {
      const logId = log.id || log._id || ''
      return (
        <TableActionsDropdown
          label="Open log actions"
          isOpen={activeDropdownId === logId}
          onOpenChange={(open) => setActiveDropdownId(open ? logId : null)}
          maxVisibleItems={8}
        >
          <TableActionsItem icon={<FileText className="size-3.5" />} onClick={openHistory}>
            View Pre-Version
          </TableActionsItem>
          <TableActionsItem
            icon={<Flag className="size-3.5" />}
            onClick={() => {
              if (log.flagged) return
              openFlagModal(logId)
            }}
            className={log.flagged ? undefined : 'ui-table-actions-item-danger'}
          >
            {log.flagged ? 'Already Flagged' : 'Flag Action'}
          </TableActionsItem>
          <TableActionsItem
            icon={<ExportDataIcon className="size-3.5" />}
            onClick={() => {
              setActiveDropdownId(null)
              void exportMappedItemsToFile(
                LOG_EXPORT_COLUMN_MAP,
                [log],
                fileFormat,
                `audit_log_${logId || 'row'}`,
              )
                .then(() => toast.success('Log exported'))
                .catch((error) => toast.error(getApiErrorMessage(error, 'Failed to export log')))
            }}
          >
            Export Logs
          </TableActionsItem>
          <TableActionsItem
            icon={<Copy className="size-3.5" />}
            onClick={() => {
              setActiveDropdownId(null)
              void copyLogId(logId)
            }}
          >
            Copy Log ID
          </TableActionsItem>
          {log.canRollback && !log.rolledBack ? (
            <TableActionsItem
              icon={<RotateCcw className="size-3.5" />}
              onClick={() => {
                setActiveDropdownId(null)
                setRollbackLog(log)
              }}
            >
              Roll Back Action
            </TableActionsItem>
          ) : null}
        </TableActionsDropdown>
      )
    },
    [activeDropdownId, copyLogId, fileFormat, openFlagModal, openHistory],
  )

  const userColumns = useMemo<ColumnDef<AuditLog>[]>(
    () =>
      withServerSortMeta(
        [
          {
            accessorKey: 'action',
            header: 'Action',
            cell: ({ row }) => (
              <button
                type="button"
                onClick={openHistory}
                className="text-brand-text text-left underline underline-offset-2"
              >
                {row.original.action}
              </button>
            ),
          },
          {
            accessorKey: 'module',
            header: 'Module',
            cell: ({ row }) => <ModulePill label={row.original.module} />,
          },
          {
            accessorKey: 'createdAt',
            header: 'Timestamp',
            cell: ({ row }) => formatDateTime(row.original.createdAt),
          },
          {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => <LogStatusBadge status={row.original.status} variant="solid" />,
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
            cell: ({ row }) => renderLogActions(row.original),
          },
        ],
        USER_LOG_SORT_FIELD_MAP,
      ),
    [openHistory, renderAdminNoteCell, renderLogActions],
  )

  const roleColumns = useMemo<ColumnDef<AuditLog>[]>(
    () =>
      withServerSortMeta(
        [
          {
            accessorKey: 'action',
            header: 'Activity',
            cell: ({ row }) => (
              <button
                type="button"
                onClick={openHistory}
                className="text-brand-text text-left underline underline-offset-2"
              >
                {row.original.action}
              </button>
            ),
          },
          { accessorKey: 'username', header: 'Username' },
          {
            accessorKey: 'module',
            header: 'Module',
            cell: ({ row }) => <ModulePill label={row.original.module} />,
          },
          {
            accessorKey: 'createdAt',
            header: 'Timestamp',
            cell: ({ row }) => formatDateTime(row.original.createdAt),
          },
          {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => <LogStatusBadge status={row.original.status} variant="solid" />,
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
            cell: ({ row }) => renderLogActions(row.original),
          },
        ],
        ROLE_LOG_SORT_FIELD_MAP,
      ),
    [openHistory, renderAdminNoteCell, renderLogActions],
  )

  const columns = isRole ? roleColumns : userColumns

  if (logsQuery.isError) {
    return (
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, profileFallback)}
            className="group font-heading text-h3 text-brand-text hover:text-brand-accent flex w-fit items-center gap-2 font-bold tracking-tight transition-colors"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>{pageTitle}</span>
          </button>
        </div>
        <div className="radius-lg bg-brand-surface border border-white/10 p-6">
          <p className="text-brand-text text-base font-semibold">Unable to load user logs</p>
          <p className="text-brand-muted mt-2 text-sm">
            {getApiErrorMessage(logsQuery.error, 'User or sub-admin was not found for this log.')}
          </p>
          <Button
            className="ui-cta ui-cta-primary mt-4"
            onClick={() => navigateBackOrFallback(navigate, '/settings/logs')}
          >
            Back to Setting Logs
          </Button>
        </div>
      </div>
    )
  }

  if (historyOpen) {
    return (
      <VersionHistoryPanel
        open
        logs={historyQuery.data?.data.logs ?? logs}
        isLoading={historyQuery.isLoading}
        onClose={() => setHistoryOpen(false)}
        onRolledBack={() => {
          void logsQuery.refetch()
          void historyQuery.refetch()
        }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, profileFallback)}
            className="group font-heading text-h3 text-brand-text hover:text-brand-accent flex w-fit items-center gap-2 font-bold tracking-tight transition-colors"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>{pageTitle}</span>
          </button>
          <div className="pl-7">
            <PageBreadcrumb
              items={[
                { label: 'Role Based Access Control', to: '/settings/access' },
                { label: breadcrumbName, isActive: true },
              ]}
            />
          </div>
        </div>

        <Button
          variant="secondary"
          className="ui-manage-metrics"
          onClick={() => navigate('/metrics/admin-logs')}
        >
          <ManageMetricsIcon />
          Manage Metrics
        </Button>
      </div>

      {isRole ? (
        <RoleOverviewCard subject={subject} onViewRoleUsers={handleViewRoleUsers} />
      ) : (
        <UserOverviewCard subject={subject} onOpenUser={handleOpenUser} />
      )}

      <div>
        <h2 className="text-brand-text text-2xl leading-6 font-semibold">Action Logs</h2>
        <p className="mt-1 text-sm text-white/50">
          Complete history of actions performed by this admin
        </p>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        getRowId={(row) => row.id || row._id || row.action}
        {...serverSort.dataTableSortProps}
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

      <AdminNoteModal
        open={Boolean(selectedAdminNote)}
        note={selectedAdminNote ?? undefined}
        onClose={() => setSelectedAdminNote(null)}
      />
      <FlagActionModal
        open={Boolean(flagLogId)}
        onClose={() => setFlagLogId(null)}
        onConfirm={handleFlag}
        isSubmitting={flagMutation.isPending}
      />
      {rollbackLog ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 p-4">
          <div className="bg-brand-surface w-full max-w-md rounded-xl border border-white/10 p-6">
            <h3 className="text-brand-text text-lg font-semibold">Roll back this action?</h3>
            <p className="text-muted mt-2 text-sm">
              This restores the previous version
              {rollbackLog.previousRole ? (
                <>
                  {' '}
                  <span className="text-brand-text font-medium">{rollbackLog.previousRole}</span>
                </>
              ) : null}{' '}
              recorded in log {rollbackLog.id || rollbackLog._id}.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="secondary"
                disabled={rollbackMutation.isPending}
                onClick={() => setRollbackLog(null)}
              >
                Cancel
              </Button>
              <Button
                disabled={rollbackMutation.isPending}
                onClick={() => {
                  void confirmRollback()
                }}
              >
                Roll Back
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      <RoleUsersModal
        open={Boolean(roleUsersModalId)}
        roleId={roleUsersModalId ?? ''}
        onClose={() => setRoleUsersModalId(null)}
      />
    </div>
  )
}
