import { useMemo, useRef, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, Clock, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useContactSetupProfile, useMySubAdminLogs } from '../hooks/use-rbac'
import { RbacLoader } from '../components/rbac-loader'
import type { AuditLog } from '../types/rbac'
import { DataTable } from '@/shared/components/table/data-table'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

const PAGE_SIZE = 10

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
  const [historySearch, setHistorySearch] = useState('')
  const historySectionRef = useRef<HTMLDivElement | null>(null)

  const { data: profileData, isLoading: profileLoading } = useContactSetupProfile(
    Boolean(user && !user.isSuperAdmin),
  )
  const { data: logsData, isLoading: logsLoading } = useMySubAdminLogs({
    page: historyPage,
    limit: PAGE_SIZE,
    search: historySearch || undefined,
  })

  const subAdmin = profileData?.data.profile
  const logs = logsData?.data.logs ?? []
  const logsMeta = logsData?.meta
  const roleLabel = subAdmin?.roles.map((role) => role.name).join(', ') || '—'

  const passwordUpdatedAt = useMemo(() => {
    const passwordLog = logs.find((log) => /password/i.test(log.action))
    return passwordLog?.createdAt
  }, [logs])

  const historyRows = useMemo(() => logs.map(mapLogToRoleHistory), [logs])

  const historyColumns = useMemo<ColumnDef<RoleHistoryRow>[]>(
    () => [
      { accessorKey: 'previousRole', header: 'Previous Role' },
      {
        accessorKey: 'changedTo',
        header: 'Changed To',
        cell: ({ row }) => (
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-brand-text">
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
          <span className="line-clamp-2 max-w-[340px] text-xs text-brand-text">{row.original.adminNote}</span>
        ),
      },
    ],
    [],
  )

  if (user?.isSuperAdmin) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-brand-muted">
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
          onClick={() => navigate(-1)}
          className="group flex w-fit items-center gap-2 font-heading text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>My Profile</span>
        </button>
        <div className="flex items-center gap-1.5 pl-7 text-[12px] font-medium text-[#777777]">
          <span>Role Based Access</span>
          <span className="text-[#333333]">/</span>
          <span className="font-bold text-white">My Profile</span>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-sm font-semibold text-brand-text">Admin Overview</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => toast.info('All tasks coming soon')}
            className="inline-flex items-center gap-2 rounded-brand-md bg-[#E8C489] px-4 py-2.5 text-sm font-semibold text-[#1A1A1A] transition-colors hover:bg-[#F0D4A4]"
          >
            <Clock className="size-4" />
            All Tasks
          </button>
          <button
            type="button"
            onClick={() => historySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="inline-flex items-center gap-2 rounded-brand-md border border-[#E8C489] bg-transparent px-4 py-2.5 text-sm font-semibold text-[#E8C489] transition-colors hover:bg-[#E8C489]/10"
          >
            <Clock className="size-4" />
            View Activity Logs
          </button>
        </div>
      </div>

      <section className={cn(uiTokens.radiusCard, uiTokens.borderSubtle, 'bg-brand-surface p-6')}>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-brand-md bg-brand-accent/10 text-brand-accent">
              <UserRound className="size-4" />
            </div>
            <h3 className="text-base font-semibold text-brand-text">Admin Info</h3>
          </div>
          <span
            className={cn(
              'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize',
              subAdmin.status === 'active'
                ? 'border-brand-success/25 bg-brand-success/10 text-brand-success'
                : 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger',
            )}
          >
            {subAdmin.status}
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <div className="grid size-20 place-items-center overflow-hidden rounded-full border border-white/10 bg-[#111111]">
            {subAdmin.profileImageUrl ? (
              <img src={subAdmin.profileImageUrl} alt={subAdmin.fullname} className="size-full object-cover" />
            ) : (
              <UserRound className="size-9 text-brand-muted" />
            )}
          </div>
          <div>
            <p className="text-xs text-brand-muted">First Name</p>
            <p className="mt-1 text-sm font-medium text-brand-text">{subAdmin.firstName || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-brand-muted">Last Name</p>
            <p className="mt-1 text-sm font-medium text-brand-text">{subAdmin.lastName || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-brand-muted">Role</p>
            <span className="mt-2 inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-brand-text">
              {roleLabel}
            </span>
          </div>
          <div>
            <p className="text-xs text-brand-muted">Job title</p>
            <p className="mt-1 text-sm font-medium text-brand-text">{subAdmin.jobTitle || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-brand-muted">Employee ID</p>
            <p className="mt-1 text-sm font-medium text-brand-text">{subAdmin.employeeId || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-brand-muted">Department</p>
            <p className="mt-1 text-sm font-medium text-brand-text">{subAdmin.department || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-brand-muted">2FA Status</p>
            <p className="mt-1 text-sm font-medium text-brand-text">{subAdmin.mfaEnabled ? 'Enabled' : 'Disabled'}</p>
          </div>
          <div>
            <p className="text-xs text-brand-muted">Workplace</p>
            <p className="mt-1 text-sm font-medium text-brand-text">{subAdmin.workplaceFlexibility || '—'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-brand-muted">Last Active</p>
            <p className="mt-1 text-sm font-medium text-brand-text">{formatDateTime(subAdmin.lastActionAt || subAdmin.updatedAt)}</p>
          </div>
        </div>
      </section>

      <section className={cn(uiTokens.radiusCard, uiTokens.borderSubtle, 'bg-brand-surface p-6')}>
        <div className="mb-5 flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-brand-md bg-brand-accent/10 text-brand-accent">
            <UserRound className="size-4" />
          </div>
          <h3 className="text-base font-semibold text-brand-text">More Details</h3>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <p className="text-xs text-brand-muted">Date Of Birth</p>
            <p className="mt-1 text-sm font-medium text-brand-text">{formatDateOnly(subAdmin.dateOfBirth)}</p>
          </div>
          <div>
            <p className="text-xs text-brand-muted">Email ID</p>
            <p className="mt-1 text-sm font-medium text-brand-text">{subAdmin.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-brand-muted">Phone number</p>
            <p className="mt-1 text-sm font-medium text-brand-text">{subAdmin.phone || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-brand-muted">Blood Group</p>
            <p className="mt-1 text-sm font-medium text-brand-text">{subAdmin.bloodGroup || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-brand-muted">Created By</p>
            <p className="mt-1 text-sm font-medium text-brand-text">{subAdmin.createdBy || 'Super Admin'}</p>
          </div>
          <div>
            <p className="text-xs text-brand-muted">Location</p>
            <p className="mt-1 text-sm font-medium text-brand-text">{subAdmin.location || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-brand-muted">Previous Role</p>
            <p className="mt-1 text-sm font-medium text-brand-text">—</p>
          </div>
          <div>
            <p className="text-xs text-brand-muted">Created At</p>
            <p className="mt-1 text-sm font-medium text-brand-text">{formatDateTime(subAdmin.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-brand-muted">Password Updated</p>
            <p className="mt-1 text-sm font-medium text-brand-text">{formatDateTime(passwordUpdatedAt)}</p>
            <button
              type="button"
              onClick={() => toast.info('Password change from profile will be enabled soon')}
              className="mt-1 text-[11px] text-brand-accent underline decoration-brand-accent/40 underline-offset-2"
            >
              Change Password
            </button>
          </div>
          <div>
            <p className="text-xs text-brand-muted">Emergency contact name</p>
            <p className="mt-1 text-sm font-medium text-brand-text">{subAdmin.emergencyContactName || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-brand-muted">Contact details</p>
            <p className="mt-1 text-sm font-medium text-brand-text">{subAdmin.emergencyContact || '—'}</p>
          </div>
        </div>
      </section>

      <section ref={historySectionRef}>
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-brand-text">Role History &amp; Change Log</h3>
          <p className="mt-1 text-sm text-brand-muted">
            Complete history of actions performed on this admin
          </p>
        </div>
        <DataTable
          columns={historyColumns}
          data={historyRows}
          getRowId={(row) => row.id}
          isLoading={logsLoading}
          searchValue={historySearch}
          onSearchChange={(value) => {
            setHistorySearch(value)
            setHistoryPage(1)
          }}
          searchPlaceholder="Search by action, note, or module"
          showAdvancedFilter={false}
          onExport={() => toast.info('Export coming soon')}
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
    </div>
  )
}
