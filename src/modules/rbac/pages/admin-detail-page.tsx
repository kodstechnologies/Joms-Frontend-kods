import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, ArrowLeftRight, Clock, UserCheck, UserRound, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { AdminNoteModal } from '../components/admin-note-modal'
import { RbacLoader } from '../components/rbac-loader'
import { UpdatePasswordModal } from '../components/update-password-modal'
import {
  useDeleteSubAdmin,
  useSubAdmin,
  useSubAdminLogs,
  useSuspendSubAdmin,
  useReactivateSubAdmin,
  useUpdateSubAdminPassword,
} from '../hooks/use-rbac'
import { fetchSubAdminLogs } from '../api/rbac-api'
import type { AuditLog, UpdateSubAdminPasswordPayload } from '../types/rbac'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { buildDefaultTableSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { RBAC_ADMIN_LOGS_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import { createPrefixedListExportHandler } from '@/shared/utils/export-filter-utils'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import deleteIcon from '@/assets/JOMS_ICONS-2/icons8-delete.svg'
import { uiTokens } from '@/shared/lib/design-tokens'

const PAGE_SIZE = 10

const ROLE_HISTORY_EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (log: AuditLog) => string }
> = {
  previousRole: {
    header: 'Previous Role',
    accessor: (log) => exportDisplayValue((log.metadata?.previousRole as string) || '—'),
  },
  changedTo: {
    header: 'Changed To',
    accessor: (log) => exportDisplayValue((log.metadata?.changedTo as string) || log.action || '—'),
  },
  changedOn: { header: 'Changed On', accessor: (log) => exportDisplayValue(log.createdAt) },
  changedBy: {
    header: 'Changed BY',
    accessor: (log) => exportDisplayValue(log.performedBy || '—'),
  },
  adminNote: { header: 'Admin Note', accessor: (log) => exportDisplayValue(log.adminNote || '—') },
}

const HISTORY_SORT_FIELD_MAP = {
  ...buildDefaultTableSortFieldMap([
    'previousRole',
    'changedTo',
    'changedOn',
    'changedBy',
    'adminNote',
  ]),
  changedOn: 'createdAt',
}

const goldActionButtonClass =
  'ui-cta ui-cta-primary rounded-brand-md inline-flex items-center gap-2 px-4 py-2.5'

const goldOutlineActionButtonClass =
  'ui-cta ui-cta-outline rounded-brand-md inline-flex items-center gap-2 border-brand-accent px-4 py-2.5 text-brand-accent hover:bg-brand-accent/10'

const darkOutlineActionButtonClass =
  'inline-flex items-center gap-2 rounded-brand-md border border-white/80 bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/5'

const dangerActionButtonClass =
  'ui-cta ui-cta-negative rounded-brand-md inline-flex items-center gap-2 px-4 py-2.5'

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

const formatDateOnly = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

type RoleHistoryRow = {
  id: string
  previousRole: string
  changedTo: string
  changedOn: string
  changedBy: string
  adminNote: string
}

const mapLogToRoleHistory = (log: AuditLog): RoleHistoryRow => {
  const previousVersion = log.metadata?.previousVersion as
    | { roleIds?: string[]; firstName?: string; lastName?: string }
    | undefined

  return {
    id: log.id || log._id || log.action,
    previousRole:
      (log.metadata?.previousRole as string) || (previousVersion ? 'Previous assignment' : '—'),
    changedTo: (log.metadata?.changedTo as string) || log.action,
    changedOn: formatOverviewDate(log.createdAt),
    changedBy: log.performedBy || '—',
    adminNote: log.adminNote || '—',
  }
}

export function AdminDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()

  const [historyPage, setHistoryPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: HISTORY_SORT_FIELD_MAP,
    defaultSortBy: 'changedOn',
    onPageReset: () => setHistoryPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setHistoryPage(1) })
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [selectedAdminNote, setSelectedAdminNote] = useState<string | null>(null)

  const { data: subAdminData, isLoading } = useSubAdmin(id)
  const { data: logsData, isLoading: logsLoading } = useSubAdminLogs(id, {
    page: historyPage,
    limit: PAGE_SIZE,
    ...enhancedSearch.buildSearchParams(),
    ...serverSort.sortParams,
  })

  const suspendMutation = useSuspendSubAdmin()
  const reactivateMutation = useReactivateSubAdmin()
  const deleteMutation = useDeleteSubAdmin()
  const updatePasswordMutation = useUpdateSubAdminPassword()

  const subAdmin = subAdminData?.data
  const logs = useMemo(() => logsData?.data.logs ?? [], [logsData?.data.logs])
  const logsMeta = logsData?.meta
  const roleLabel = subAdmin?.roles.map((role) => role.name).join(', ') || '—'

  const historyRows = useMemo(() => logs.map(mapLogToRoleHistory), [logs])

  const handleExportData = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      const result = await fetchSubAdminLogs(id, params)
      return { data: result.data?.logs ?? [] }
    }
    return createPrefixedListExportHandler(
      fetchForExport,
      ROLE_HISTORY_EXPORT_COLUMN_MAP,
      'admin_role_history_export',
      { search: enhancedSearch.globalSearch || undefined },
    )
  }, [enhancedSearch.globalSearch, id])

  const { onExport, modals: exportFilterModals } = useModuleExportFilters({
    moduleKey: 'rbac-admin-logs',
    onExportData: handleExportData,
  })

  const historyColumns = useMemo<ColumnDef<RoleHistoryRow>[]>(
    () =>
      withServerSortMeta(
        [
          { accessorKey: 'previousRole', header: 'Previous Role' },
          { accessorKey: 'changedTo', header: 'Changed To' },
          { accessorKey: 'changedOn', header: 'Changed On' },
          { accessorKey: 'changedBy', header: 'Changed BY' },
          {
            accessorKey: 'adminNote',
            header: 'Admin Note',
            cell: ({ row }) =>
              row.original.adminNote && row.original.adminNote !== '—' ? (
                <button
                  type="button"
                  onClick={() => setSelectedAdminNote(row.original.adminNote)}
                  className="text-brand-accent decoration-brand-accent/40 hover:text-brand-gold-from max-w-[260px] truncate text-left text-xs font-medium underline underline-offset-2"
                >
                  {row.original.adminNote}
                </button>
              ) : (
                '—'
              ),
          },
        ],
        HISTORY_SORT_FIELD_MAP,
      ),
    [],
  )

  const handleSuspend = useCallback(async () => {
    try {
      await suspendMutation.mutateAsync(id)
      toast.success('Admin suspended')
    } catch {
      toast.error('Failed to suspend admin')
    }
  }, [id, suspendMutation])

  const handleReactivate = useCallback(async () => {
    try {
      await reactivateMutation.mutateAsync(id)
      toast.success('Admin reactivated')
    } catch {
      toast.error('Failed to reactivate admin')
    }
  }, [id, reactivateMutation])

  const handleDelete = useCallback(async () => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Admin deleted')
      navigate('/settings/access')
    } catch {
      toast.error('Failed to delete admin')
    }
  }, [deleteMutation, id, navigate])

  const handlePasswordUpdate = useCallback(
    async (data: UpdateSubAdminPasswordPayload) => {
      try {
        await updatePasswordMutation.mutateAsync({
          id,
          payload: data,
        })
        toast.success('Password updated successfully')
        setPasswordModalOpen(false)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to update password')
      }
    },
    [id, updatePasswordMutation],
  )

  if (isLoading || !subAdmin) {
    return <RbacLoader label="Loading admin details..." />
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/settings/access')}
          className="group font-heading text-h3 text-brand-text hover:text-brand-accent flex w-fit items-center gap-2 font-bold tracking-tight transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Admin Details</span>
        </button>
        <div className="text-body-sm-medium text-muted flex items-center gap-1.5 pl-7">
          <span>Role Based Access</span>
          <span className="text-brand-text/30">/</span>
          <span className="text-brand-text font-bold">{subAdmin.fullname}</span>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-brand-text text-sm font-semibold">Admin Overview</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={goldActionButtonClass}
            onClick={() => navigate(`/settings/access/users/${id}/logs`)}
          >
            <Clock className="size-4" />
            View Activity Logs
          </button>
          <button
            type="button"
            className={goldOutlineActionButtonClass}
            onClick={() => navigate('/my-tasks')}
          >
            <Clock className="size-4" />
            View Assigned Tasks
          </button>
          <button
            type="button"
            className={darkOutlineActionButtonClass}
            onClick={() => navigate(`/settings/access/users/create?edit=${id}`)}
          >
            <ArrowLeftRight className="size-4" />
            Change Role
          </button>
          {subAdmin?.status === 'active' ? (
            <button type="button" className={dangerActionButtonClass} onClick={handleSuspend}>
              <span className="grid size-5 place-items-center rounded-full bg-white/20">
                <X className="size-3" />
              </span>
              Suspend Admin
            </button>
          ) : (
            <button type="button" className={goldActionButtonClass} onClick={handleReactivate}>
              <UserCheck className="size-4" />
              Reactivate Admin
            </button>
          )}
          <button type="button" className={dangerActionButtonClass} onClick={handleDelete}>
            <span className="grid size-5 place-items-center rounded-full bg-white/20">
              <img src={deleteIcon} alt="Delete" className="size-4 invert" />
            </span>
            Delete
          </button>
        </div>
      </div>

      <section className={cn(uiTokens.radiusCard, uiTokens.borderSubtle, 'bg-brand-surface p-6')}>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-brand-md bg-brand-accent/10 text-brand-accent grid size-9 place-items-center">
              <UserRound className="size-4" />
            </div>
            <h3 className="text-brand-text text-base font-semibold">Admin Info</h3>
          </div>
          <span
            className={cn(
              'text-body-sm-semibold rounded-full border px-2.5 py-0.5 capitalize',
              subAdmin.status === 'active'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-400',
            )}
          >
            {subAdmin.status}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div>
            <p className="text-brand-muted text-xs">Full Name</p>
            <p className="text-brand-text mt-1 text-sm font-medium">{subAdmin.fullname}</p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Email ID</p>
            <p className="text-brand-text mt-1 text-sm font-medium">{subAdmin.email}</p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Phone Number</p>
            <p className="text-brand-text mt-1 text-sm font-medium">{subAdmin.phone || '—'}</p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Role</p>
            <p className="text-brand-text mt-1 text-sm font-medium">{roleLabel}</p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Added On</p>
            <p className="text-brand-text mt-1 text-sm font-medium">
              {formatOverviewDate(subAdmin.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Last Active</p>
            <p className="text-brand-text mt-1 text-sm font-medium">
              {formatOverviewDate(subAdmin.lastActionAt)}
            </p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Emergency contact name</p>
            <p className="text-brand-text mt-1 text-sm font-medium">
              {subAdmin.emergencyContactName || '—'}
            </p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Emergency contact details</p>
            <p className="text-brand-text mt-1 text-sm font-medium">
              {subAdmin.emergencyContact || '—'}
            </p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Blood Group</p>
            <p className="text-brand-text mt-1 text-sm font-medium">{subAdmin.bloodGroup || '—'}</p>
          </div>
        </div>
      </section>

      <section className={cn(uiTokens.radiusCard, uiTokens.borderSubtle, 'bg-brand-surface p-6')}>
        <h3 className="text-brand-text mb-4 text-base font-semibold">Security Settings</h3>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-brand-text text-sm font-medium">Password</p>
            <p className="text-brand-muted text-xs">
              Last reset: {formatDateOnly(subAdmin.lastActionAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPasswordModalOpen(true)}
            className="text-brand-accent decoration-brand-accent/40 text-body-sm-semibold underline underline-offset-2"
          >
            Reset Password
          </button>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h3 className="text-brand-text text-lg font-semibold">Role History &amp; Change Log</h3>
          <p className="text-brand-muted mt-1 text-sm">
            Complete history of actions performed on this admin
          </p>
        </div>

        <DataTable
          columns={historyColumns}
          data={historyRows}
          getRowId={(row) => row.id}
          {...serverSort.dataTableSortProps}
          isLoading={logsLoading}
          searchValue={enhancedSearch.globalSearch}
          onSearchChange={enhancedSearch.setGlobalSearch}
          searchableColumns={RBAC_ADMIN_LOGS_SEARCH_COLUMNS}
          columnSearches={enhancedSearch.columnSearches}
          onColumnSearchChange={enhancedSearch.setColumnSearch}
          onColumnSearchRemove={enhancedSearch.removeColumnSearch}
          onClearAllSearches={enhancedSearch.clearAll}
          searchPlaceholder="Search by role, note or action"
          showAdvancedFilter={false}
          onExport={onExport}
          pagination={{
            page: historyPage,
            pageSize: PAGE_SIZE,
            totalItems: logsMeta?.total ?? 0,
            totalPages: logsMeta?.totalPages ?? 1,
            onPageChange: setHistoryPage,
          }}
          resourceLabel="records"
          emptyMessage="No role history found."
        />
      </section>

      <UpdatePasswordModal
        open={passwordModalOpen}
        userName={subAdmin.fullname}
        isSubmitting={updatePasswordMutation.isPending}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handlePasswordUpdate}
      />

      <AdminNoteModal
        open={Boolean(selectedAdminNote)}
        note={selectedAdminNote ?? undefined}
        onClose={() => setSelectedAdminNote(null)}
      />

      {exportFilterModals}
    </div>
  )
}
