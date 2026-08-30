import { useMemo, useRef, useState, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, Clock, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  useContactSetupProfile,
  useMySubAdminLogs,
  useUpdateSubAdminPassword,
} from '../hooks/use-rbac'
import { fetchMySubAdminLogs } from '../api/rbac-api'
import { RbacLoader } from '../components/rbac-loader'
import { UpdatePasswordModal } from '../components/update-password-modal'
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
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
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

const formatDateTime = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

const formatDateOnly = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
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
  const previousRole = (log.metadata?.previousRole as string) || '—'
  const changedTo = (log.metadata?.changedTo as string) || log.action || '—'

  return {
    id: log.id || log._id || log.action,
    previousRole,
    changedTo,
    changedOn: formatDateTime(log.createdAt),
    changedBy: log.performedBy || '—',
    adminNote: log.adminNote || '—',
  }
}

export function MyProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [historyPage, setHistoryPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: HISTORY_SORT_FIELD_MAP,
    defaultSortBy: 'changedOn',
    onPageReset: () => setHistoryPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setHistoryPage(1) })
  const historySectionRef = useRef<HTMLDivElement | null>(null)

  const { data: profileData, isLoading: profileLoading } = useContactSetupProfile(
    Boolean(user && !user.isSuperAdmin),
  )
  const { data: logsData, isLoading: logsLoading } = useMySubAdminLogs({
    page: historyPage,
    limit: PAGE_SIZE,
    ...enhancedSearch.buildSearchParams(),
    ...serverSort.sortParams,
  })

  const subAdmin = profileData?.data.profile
  const logs = useMemo(() => logsData?.data.logs ?? [], [logsData?.data.logs])
  const logsMeta = logsData?.meta
  const roleLabel = subAdmin?.roles.map((role) => role.name).join(', ') || '—'

  const passwordUpdatedAt = useMemo(() => {
    const passwordLog = logs.find((log) => /password/i.test(log.action))
    return passwordLog?.createdAt
  }, [logs])

  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const updatePasswordMutation = useUpdateSubAdminPassword()

  const historyRows = useMemo(() => logs.map(mapLogToRoleHistory), [logs])

  const handleExportData = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      const result = await fetchMySubAdminLogs(params)
      return { data: result.data?.logs ?? [] }
    }
    return createPrefixedListExportHandler(
      fetchForExport,
      ROLE_HISTORY_EXPORT_COLUMN_MAP,
      'my_profile_role_history_export',
      { search: enhancedSearch.globalSearch || undefined },
    )
  }, [enhancedSearch.globalSearch])

  const { onExport, modals: exportFilterModals } = useModuleExportFilters({
    moduleKey: 'rbac-admin-logs',
    onExportData: handleExportData,
  })

  const historyColumns = useMemo<ColumnDef<RoleHistoryRow>[]>(
    () =>
      withServerSortMeta(
        [
          { accessorKey: 'previousRole', header: 'Previous Role' },
          {
            accessorKey: 'changedTo',
            header: 'Changed To',
            cell: ({ row }) => (
              <span className="text-brand-text text-body-sm-semibold inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5">
                {row.original.changedTo}
              </span>
            ),
          },
          { accessorKey: 'changedOn', header: 'Changed On' },
          { accessorKey: 'changedBy', header: 'Changed BY' },
          {
            accessorKey: 'adminNote',
            header: 'Admin Note',
            cell: ({ row }) => (
              <span className="text-brand-text line-clamp-2 max-w-[340px] text-xs">
                {row.original.adminNote}
              </span>
            ),
          },
        ],
        HISTORY_SORT_FIELD_MAP,
      ),
    [],
  )

  const handlePasswordUpdate = useCallback(
    async (data: UpdateSubAdminPasswordPayload) => {
      if (!subAdmin?.id) return
      try {
        await updatePasswordMutation.mutateAsync({
          id: subAdmin.id,
          payload: data,
        })
        toast.success('Password updated successfully')
        setPasswordModalOpen(false)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to update password')
      }
    },
    [subAdmin, updatePasswordMutation],
  )

  if (user?.isSuperAdmin) {
    return (
      <div className="text-brand-muted flex min-h-[40vh] items-center justify-center">
        This page is available for sub-admin accounts only.
      </div>
    )
  }

  if (profileLoading || !subAdmin) {
    return <RbacLoader label="Loading profile..." />
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
          <span>My Profile</span>
        </button>
        <div className="text-body-sm-medium text-muted flex items-center gap-1.5 pl-7">
          <span>Role Based Access</span>
          <span className="text-brand-text/30">/</span>
          <span className="text-brand-text font-bold">My Profile</span>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-brand-text text-sm font-semibold">Admin Overview</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate('/my-tasks')}
            className="ui-cta ui-cta-primary rounded-brand-md inline-flex items-center gap-2 px-4"
          >
            <Clock className="size-4" />
            All Tasks
          </button>
          <button
            type="button"
            onClick={() =>
              historySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            className="ui-cta ui-cta-outline rounded-brand-md border-brand-accent text-brand-accent hover:bg-brand-accent/10 inline-flex items-center gap-2 px-4"
          >
            <Clock className="size-4" />
            View Activity Logs
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
            <p className="text-brand-muted text-xs">First Name</p>
            <p className="text-brand-text mt-1 text-sm font-medium">{subAdmin.firstName || '—'}</p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Last Name</p>
            <p className="text-brand-text mt-1 text-sm font-medium">{subAdmin.lastName || '—'}</p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Email ID</p>
            <p className="text-brand-text mt-1 text-sm font-medium">{subAdmin.email || '—'}</p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Phone number</p>
            <p className="text-brand-text mt-1 text-sm font-medium">{subAdmin.phone || '—'}</p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Role</p>
            <p className="text-brand-text mt-1 text-sm font-medium">{roleLabel}</p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Employee ID</p>
            <p className="text-brand-text mt-1 text-sm font-medium">{subAdmin.employeeId || '—'}</p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Department</p>
            <p className="text-brand-text mt-1 text-sm font-medium">{subAdmin.department || '—'}</p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Date Of Birth</p>
            <p className="text-brand-text mt-1 text-sm font-medium">
              {formatDateOnly(subAdmin.dateOfBirth)}
            </p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Blood Group</p>
            <p className="text-brand-text mt-1 text-sm font-medium">{subAdmin.bloodGroup || '—'}</p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Location</p>
            <p className="text-brand-text mt-1 text-sm font-medium">{subAdmin.location || '—'}</p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Workplace</p>
            <p className="text-brand-text mt-1 text-sm font-medium">
              {subAdmin.workplaceFlexibility || '—'}
            </p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">2FA Status</p>
            <p className="text-brand-text mt-1 text-sm font-medium">
              {subAdmin.mfaEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Last Active</p>
            <p className="text-brand-text mt-1 text-sm font-medium">
              {formatDateTime(subAdmin.lastActionAt || subAdmin.updatedAt)}
            </p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Created By</p>
            <p className="text-brand-text mt-1 text-sm font-medium">
              {subAdmin.createdBy || 'Super Admin'}
            </p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Created At</p>
            <p className="text-brand-text mt-1 text-sm font-medium">
              {formatDateTime(subAdmin.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-brand-muted text-xs">Password Updated</p>
            <p className="text-brand-text mt-1 text-sm font-medium">
              {formatDateTime(passwordUpdatedAt)}
            </p>
            <button
              type="button"
              onClick={() => setPasswordModalOpen(true)}
              className="text-brand-accent decoration-brand-accent/40 text-body-sm-semibold mt-1 underline underline-offset-2"
            >
              Change Password
            </button>
          </div>
        </div>
      </section>

      <section ref={historySectionRef}>
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
          searchPlaceholder="Search by action, note, or module"
          showAdvancedFilter={false}
          onExport={onExport}
          pagination={{
            page: historyPage,
            pageSize: PAGE_SIZE,
            totalItems: logsMeta?.total ?? 0,
            totalPages: logsMeta?.totalPages ?? 1,
            onPageChange: setHistoryPage,
          }}
          resourceLabel="profile logs"
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

      {exportFilterModals}
    </div>
  )
}
