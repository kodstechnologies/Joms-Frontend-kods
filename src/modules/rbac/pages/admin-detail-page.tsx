import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  ArrowLeft,
  ArrowLeftRight,
  Clock,
  Trash2,
  Upload,
  UserCheck,
  UserRound,
  X,
} from 'lucide-react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
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
import { RBAC_ADMIN_LOGS_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import { createPrefixedListExportHandler } from '@/shared/utils/export-filter-utils'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { PageBreadcrumb } from '@/shared/components/navigation/page-breadcrumb'

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
  previousRole: 'previousRole',
  changedTo: 'changedTo',
  changedOn: 'createdAt',
  changedBy: 'changedBy',
  adminNote: 'adminNote',
}

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
    { roleIds?: string[]; firstName?: string; lastName?: string } | undefined

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

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="ad-field">
      <p className="ad-field-label">{label}</p>
      <div className="ad-field-value">{children}</div>
    </div>
  )
}

function RolePill({ label }: { label: string }) {
  if (!label || label === '—') return <span>—</span>
  return <span className="rbac-role-name-pill">{label}</span>
}

export function AdminDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const authUser = useAuthStore((state) => state.user)

  const [historyPage, setHistoryPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: HISTORY_SORT_FIELD_MAP,
    defaultSortBy: 'changedOn',
    onPageReset: () => setHistoryPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setHistoryPage(1) })
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [selectedAdminNote, setSelectedAdminNote] = useState<string | null>(null)

  const isOwnSuperAdminProfile = Boolean(authUser?.isSuperAdmin && id && id === authUser.id)

  const { data: subAdminData, isLoading } = useSubAdmin(isOwnSuperAdminProfile ? '' : id)
  const { data: logsData, isLoading: logsLoading } = useSubAdminLogs(
    isOwnSuperAdminProfile ? '' : id,
    {
      page: historyPage,
      limit: PAGE_SIZE,
      ...enhancedSearch.buildSearchParams(),
      ...serverSort.sortParams,
    },
  )

  const suspendMutation = useSuspendSubAdmin()
  const reactivateMutation = useReactivateSubAdmin()
  const deleteMutation = useDeleteSubAdmin()
  const updatePasswordMutation = useUpdateSubAdminPassword()

  const subAdmin = subAdminData?.data
  const logs = useMemo(() => logsData?.data.logs ?? [], [logsData?.data.logs])
  const logsMeta = logsData?.meta
  const roleLabel = subAdmin?.roles.map((role) => role.name).join(', ') || '—'

  const historyRows = useMemo(() => logs.map(mapLogToRoleHistory), [logs])

  const passwordUpdatedAt = useMemo(() => {
    const passwordLog = logs.find((log) => /password/i.test(log.action))
    return passwordLog?.createdAt
  }, [logs])

  const previousRoleLabel = useMemo(() => {
    const withPrevious = historyRows.find((row) => row.previousRole && row.previousRole !== '—')
    return withPrevious?.previousRole || '—'
  }, [historyRows])

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

  if (isOwnSuperAdminProfile) {
    return <Navigate to="/settings/access/my-profile" replace />
  }

  const historyColumns = useMemo<ColumnDef<RoleHistoryRow>[]>(
    () =>
      withServerSortMeta(
        [
          {
            accessorKey: 'previousRole',
            header: 'Previous Role',
            cell: ({ row }) => (
              <span className="ad-history-plain">{row.original.previousRole || '—'}</span>
            ),
          },
          {
            accessorKey: 'changedTo',
            header: 'Changed To',
            cell: ({ row }) => <RolePill label={row.original.changedTo} />,
          },
          {
            accessorKey: 'changedOn',
            header: 'Changed On',
            cell: ({ row }) => <span className="ad-history-plain">{row.original.changedOn}</span>,
          },
          {
            accessorKey: 'changedBy',
            header: 'Changed BY',
            cell: ({ row }) => <span className="ad-history-plain">{row.original.changedBy}</span>,
          },
          {
            accessorKey: 'adminNote',
            header: 'Admin Note',
            cell: ({ row }) =>
              row.original.adminNote && row.original.adminNote !== '—' ? (
                <button
                  type="button"
                  onClick={() => setSelectedAdminNote(row.original.adminNote)}
                  className="ad-note-cell"
                  title={row.original.adminNote}
                >
                  {row.original.adminNote}
                </button>
              ) : (
                <span className="ad-note-cell">—</span>
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

  const isActive = subAdmin.status === 'active'

  return (
    <div className="ad-page">
      <div className="ad-header">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/settings/access')}
          className="ad-back"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
          <span>Admin Details</span>
        </button>
        <div className="ad-breadcrumb">
          <PageBreadcrumb
            items={[
              { label: 'Role Based Access Control', to: '/settings/access' },
              { label: subAdmin.fullname, isActive: true },
            ]}
          />
        </div>
      </div>

      <div className="ad-toolbar">
        <h2 className="ad-overview-tab">Admin Overview</h2>
        <div className="ad-actions">
          <button
            type="button"
            className="ad-btn ad-btn-peach"
            onClick={() => navigate(`/settings/access/users/${id}/logs`)}
          >
            <Clock className="size-4" aria-hidden="true" />
            View Activity Logs
          </button>
          <button
            type="button"
            className="ad-btn ad-btn-peach"
            onClick={() => navigate('/my-tasks')}
          >
            <Clock className="size-4" aria-hidden="true" />
            View Assigned Tasks
          </button>
          <button
            type="button"
            className="ad-btn ad-btn-outline"
            onClick={() => navigate(`/settings/access/users/create?edit=${id}`)}
          >
            <ArrowLeftRight className="size-4" aria-hidden="true" />
            Change Role
          </button>
          {isActive ? (
            <button type="button" className="ad-btn ad-btn-danger" onClick={handleSuspend}>
              <span className="ad-btn-icon-circle">
                <X className="size-3" aria-hidden="true" />
              </span>
              Suspend
            </button>
          ) : (
            <button type="button" className="ad-btn ad-btn-peach" onClick={handleReactivate}>
              <UserCheck className="size-4" aria-hidden="true" />
              Reactivate
            </button>
          )}
          <button type="button" className="ad-btn ad-btn-danger" onClick={handleDelete}>
            <Trash2 className="size-4" aria-hidden="true" />
            Delete User
          </button>
        </div>
      </div>

      <section className="ad-card">
        <div className="ad-card-heading">
          <div className="ad-card-title-wrap">
            <span className="ad-card-icon" aria-hidden="true">
              <UserRound className="size-4" />
            </span>
            <h3 className="ad-card-title">Admin Info</h3>
          </div>
          <span className={cn('ad-status-pill', isActive ? 'is-active' : 'is-inactive')}>
            {isActive ? 'Active' : subAdmin.status}
          </span>
        </div>

        <div className="ad-info-layout">
          <div className="ad-avatar">
            {subAdmin.profileImageUrl ? (
              <img src={subAdmin.profileImageUrl} alt="" className="ad-avatar-img" />
            ) : (
              <UserRound className="size-8" strokeWidth={1.5} aria-hidden="true" />
            )}
          </div>

          <div className="ad-info-main">
            <div className="ad-info-row ad-info-row-top">
              <DetailField label="First Name">{subAdmin.firstName || '—'}</DetailField>
              <DetailField label="Last Name">{subAdmin.lastName || '—'}</DetailField>
              <DetailField label="Role">
                <RolePill label={roleLabel} />
              </DetailField>
              <DetailField label="Last Active">
                {formatOverviewDate(subAdmin.lastActionAt || subAdmin.updatedAt)}
              </DetailField>
            </div>
            <div className="ad-info-row">
              <DetailField label="Employee ID">{subAdmin.employeeId || '—'}</DetailField>
              <DetailField label="Department">{subAdmin.department || '—'}</DetailField>
              <DetailField label="2FA Status">
                {subAdmin.mfaEnabled ? 'Enabled' : 'Disabled'}
              </DetailField>
              <DetailField label="Workplace">{subAdmin.workplaceFlexibility || '—'}</DetailField>
            </div>
          </div>
        </div>
      </section>

      <section className="ad-card">
        <div className="ad-card-heading">
          <div className="ad-card-title-wrap">
            <span className="ad-card-icon" aria-hidden="true">
              <UserRound className="size-4" />
            </span>
            <h3 className="ad-card-title">More Details</h3>
          </div>
        </div>

        <div className="ad-more-grid">
          <DetailField label="Date Of Birth">{formatDateOnly(subAdmin.dateOfBirth)}</DetailField>
          <DetailField label="Email ID">{subAdmin.email || '—'}</DetailField>
          <DetailField label="Phone number">{subAdmin.phone || '—'}</DetailField>
          <DetailField label="Blood Group">{subAdmin.bloodGroup || '—'}</DetailField>
          <DetailField label="Created By">{subAdmin.createdBy || 'Super Admin'}</DetailField>
          <DetailField label="Location">{subAdmin.location || '—'}</DetailField>
          <DetailField label="Previous Role">{previousRoleLabel}</DetailField>
          <DetailField label="Created At">{formatOverviewDate(subAdmin.createdAt)}</DetailField>
          <DetailField label="Password Updated">
            <div className="ad-password-wrap">
              <span>{formatDateOnly(passwordUpdatedAt)}</span>
              <button
                type="button"
                onClick={() => setPasswordModalOpen(true)}
                className="ad-change-password"
              >
                Change Password
              </button>
            </div>
          </DetailField>
          <DetailField label="Emergency contact name">
            {subAdmin.emergencyContactName || '—'}
          </DetailField>
          <DetailField label="Contact details">{subAdmin.emergencyContact || '—'}</DetailField>
        </div>
      </section>

      <section className="ad-history">
        <div className="ad-history-header">
          <div className="ad-history-heading">
            <h3 className="ad-history-title">Role History &amp; Change Log</h3>
            <p className="ad-history-subtitle">
              Complete history of actions performed on this admin
            </p>
          </div>
          <button type="button" className="ad-export-btn" onClick={onExport}>
            <Upload className="size-4" aria-hidden="true" />
            Export Data
          </button>
        </div>

        <div className="ad-history-table">
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
            showSearch
            showAdvancedFilter={false}
            showExport={false}
            showRecordCount={false}
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
        </div>
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
