import { useMemo, useRef, useState, useCallback, type ReactNode } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, Clock, Upload, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  useContactSetupProfile,
  useMySubAdminLogs,
  useRbacMe,
  useUpdateSubAdminPassword,
} from '../hooks/use-rbac'
import { fetchMySubAdminLogs } from '../api/rbac-api'
import { RbacLoader } from '../components/rbac-loader'
import { UpdatePasswordModal } from '../components/update-password-modal'
import type { AuditLog, SuperAdminSelfProfile, UpdateSubAdminPasswordPayload } from '../types/rbac'
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

const formatOverviewDate = (value?: string | null) => {
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

function SuperAdminProfileView({ profile }: { profile: SuperAdminSelfProfile }) {
  const navigate = useNavigate()
  const isActive = profile.status === 'active'
  const displayName = profile.fullname || `${profile.firstName} ${profile.lastName}`.trim() || '—'

  return (
    <div className="ad-page">
      <div className="ad-header">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/settings/access')}
          className="ad-back"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
          <span>My Profile</span>
        </button>
        <p className="ad-breadcrumb">
          Role Based Access / <span>{displayName}</span>
        </p>
      </div>

      <div className="ad-toolbar">
        <h2 className="ad-overview-tab">Admin Overview</h2>
        <div className="ad-actions">
          <button
            type="button"
            className="ad-btn ad-btn-peach"
            onClick={() => navigate('/settings/access/my-profile/logs')}
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
            {isActive ? 'Active' : profile.status}
          </span>
        </div>

        <div className="ad-info-layout">
          <div className="ad-avatar">
            <UserRound className="size-8" strokeWidth={1.5} aria-hidden="true" />
          </div>

          <div className="ad-info-main">
            <div className="ad-info-row ad-info-row-top">
              <DetailField label="First Name">{profile.firstName || '—'}</DetailField>
              <DetailField label="Last Name">{profile.lastName || '—'}</DetailField>
              <DetailField label="Role">
                <RolePill label={profile.roleLabel || 'Super Admin'} />
              </DetailField>
              <DetailField label="Last Active">
                {formatOverviewDate(profile.lastActionAt || profile.updatedAt)}
              </DetailField>
            </div>
            <div className="ad-info-row">
              <DetailField label="Employee ID">—</DetailField>
              <DetailField label="Department">—</DetailField>
              <DetailField label="2FA Status">
                {profile.mfaEnabled ? 'Enabled' : 'Disabled'}
              </DetailField>
              <DetailField label="Workplace">—</DetailField>
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
          <DetailField label="Date Of Birth">—</DetailField>
          <DetailField label="Email ID">{profile.email || '—'}</DetailField>
          <DetailField label="Phone number">—</DetailField>
          <DetailField label="Blood Group">—</DetailField>
          <DetailField label="Created By">System</DetailField>
          <DetailField label="Location">—</DetailField>
          <DetailField label="Previous Role">—</DetailField>
          <DetailField label="Created At">{formatOverviewDate(profile.createdAt)}</DetailField>
          <DetailField label="Password Updated">—</DetailField>
          <DetailField label="Emergency contact name">—</DetailField>
          <DetailField label="Contact details">—</DetailField>
        </div>
      </section>
    </div>
  )
}

function SubAdminProfileView() {
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
  const isActive = subAdmin?.status === 'active'

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
            cell: ({ row }) => <RolePill label={row.original.changedTo} />,
          },
          { accessorKey: 'changedOn', header: 'Changed On' },
          { accessorKey: 'changedBy', header: 'Changed BY' },
          {
            accessorKey: 'adminNote',
            header: 'Admin Note',
            cell: ({ row }) => (
              <span className="ad-note-cell" title={row.original.adminNote}>
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

  if (profileLoading || !subAdmin) {
    return <RbacLoader label="Loading profile..." />
  }

  const displayName = subAdmin.fullname || `${subAdmin.firstName} ${subAdmin.lastName}`.trim()

  return (
    <div className="ad-page">
      <div className="ad-header">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/settings/access')}
          className="ad-back"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
          <span>My Profile</span>
        </button>
        <p className="ad-breadcrumb">
          Role Based Access / <span>{displayName}</span>
        </p>
      </div>

      <div className="ad-toolbar">
        <h2 className="ad-overview-tab">Admin Overview</h2>
        <div className="ad-actions">
          <button
            type="button"
            className="ad-btn ad-btn-peach"
            onClick={() =>
              historySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
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
          <DetailField label="Previous Role">—</DetailField>
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

      <section className="ad-history" ref={historySectionRef}>
        <div className="ad-history-header">
          <div className="ad-history-heading">
            <h3 className="ad-history-title">Role History &amp; Change Log</h3>
            <p className="ad-history-subtitle">
              Complete history of actions performed on this admin
            </p>
          </div>
          <button type="button" className="ad-export-btn" onClick={onExport}>
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
            searchPlaceholder="Search by action, note, or module"
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

      {exportFilterModals}
    </div>
  )
}

export function MyProfilePage() {
  const user = useAuthStore((state) => state.user)
  const { data: meData, isLoading: meLoading } = useRbacMe()
  const meProfile = meData?.data?.profile

  if (user?.isSuperAdmin) {
    if (meLoading && !meProfile) {
      return <RbacLoader label="Loading profile..." />
    }

    if (!meProfile) {
      const fallbackName = user.fullname || ''
      const [firstName = '', ...rest] = fallbackName.trim().split(/\s+/).filter(Boolean)
      return (
        <SuperAdminProfileView
          profile={{
            id: user.id,
            firstName,
            lastName: rest.join(' '),
            fullname: fallbackName,
            email: user.email || '',
            roleLabel: 'Super Admin',
            status: user.status || 'active',
            mfaEnabled: Boolean(user.mfaEnabled),
            kind: 'superadmin',
            isSuperAdmin: true,
          }}
        />
      )
    }

    return <SuperAdminProfileView profile={meProfile} />
  }

  return <SubAdminProfileView />
}
