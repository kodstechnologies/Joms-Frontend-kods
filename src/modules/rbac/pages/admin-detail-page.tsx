import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, ArrowLeftRight, Clock, Trash2, UserCheck, UserRound, X } from 'lucide-react'
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
import type { AuditLog } from '../types/rbac'
import { DataTable } from '@/shared/components/table/data-table'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

const PAGE_SIZE = 10

const goldActionButtonClass =
  'inline-flex items-center gap-2 rounded-brand-md bg-[#E8C489] px-4 py-2.5 text-sm font-semibold text-[#1A1A1A] transition-colors hover:bg-[#F0D4A4]'

const goldOutlineActionButtonClass =
  'inline-flex items-center gap-2 rounded-brand-md border border-[#E8C489] bg-transparent px-4 py-2.5 text-sm font-semibold text-[#E8C489] transition-colors hover:bg-[#E8C489]/10'

const darkOutlineActionButtonClass =
  'inline-flex items-center gap-2 rounded-brand-md border border-white/80 bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/5'

const dangerActionButtonClass =
  'inline-flex items-center gap-2 rounded-brand-md bg-[#E86B5C] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#D85A4B]'

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
      (log.metadata?.previousRole as string) ||
      (previousVersion ? 'Previous assignment' : '—'),
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
  const [historySearch, setHistorySearch] = useState('')
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [selectedAdminNote, setSelectedAdminNote] = useState<string | null>(null)

  const { data: subAdminData, isLoading } = useSubAdmin(id)
  const { data: logsData, isLoading: logsLoading } = useSubAdminLogs(id, {
    page: historyPage,
    limit: PAGE_SIZE,
    search: historySearch || undefined,
  })

  const suspendMutation = useSuspendSubAdmin()
  const reactivateMutation = useReactivateSubAdmin()
  const deleteMutation = useDeleteSubAdmin()
  const updatePasswordMutation = useUpdateSubAdminPassword()

  const subAdmin = subAdminData?.data
  const logs = logsData?.data.logs ?? []
  const logsMeta = logsData?.meta
  const roleLabel = subAdmin?.roles.map((role) => role.name).join(', ') || '—'

  const historyRows = useMemo(() => logs.map(mapLogToRoleHistory), [logs])

  const historyColumns = useMemo<ColumnDef<RoleHistoryRow>[]>(
    () => [
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
              className="max-w-[260px] truncate text-left text-xs font-medium text-brand-accent underline decoration-brand-accent/40 underline-offset-2 hover:text-brand-gold-from"
            >
              {row.original.adminNote}
            </button>
          ) : (
            '—'
          ),
      },
    ],
    [],
  )

  const handleSuspend = useCallback(async () => {
    if (!id) return
    try {
      await suspendMutation.mutateAsync(id)
      toast.success('User suspended')
    } catch {
      toast.error('Failed to suspend user')
    }
  }, [id, suspendMutation])

  const handleReactivate = useCallback(async () => {
    if (!id) return
    try {
      await reactivateMutation.mutateAsync(id)
      toast.success('User reactivated')
    } catch {
      toast.error('Failed to reactivate user')
    }
  }, [id, reactivateMutation])

  const handleDelete = useCallback(async () => {
    if (!id) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('User deleted')
      navigate('/settings/access')
    } catch {
      toast.error('Failed to delete user')
    }
  }, [deleteMutation, id, navigate])

  const handlePasswordUpdate = useCallback(
    async (payload: {
      oldPassword: string
      newPassword: string
      confirmNewPassword: string
    }) => {
      if (!id) return
      try {
        await updatePasswordMutation.mutateAsync({ id, payload })
        toast.success('Password updated successfully')
        setPasswordModalOpen(false)
      } catch {
        toast.error('Failed to update password')
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
          onClick={() => navigate('/settings/access')}
          className="group flex w-fit items-center gap-2 font-heading text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Admin Details</span>
        </button>
        <div className="flex items-center gap-1.5 pl-7 text-[12px] font-medium text-[#777777]">
          <button
            type="button"
            onClick={() => navigate('/settings/access')}
            className="transition-colors hover:text-white"
          >
            Role Based Access
          </button>
          <span className="text-[#333333]">/</span>
          <span className="font-bold text-white">{subAdmin.fullname}</span>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-sm font-semibold text-brand-text">Admin Overview</h2>
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
            onClick={() => toast.info('Assigned tasks coming soon')}
          >
            <Clock className="size-4" />
            View Assigned Tasks
          </button>
          <button
            type="button"
            className={darkOutlineActionButtonClass}
            onClick={() => toast.info('Change role coming soon')}
          >
            <ArrowLeftRight className="size-4" />
            Change Role
          </button>
          {subAdmin?.status === 'active' ? (
            <button type="button" className={dangerActionButtonClass} onClick={handleSuspend}>
              <span className="grid size-5 place-items-center rounded-full bg-white/20">
                <X className="size-3" />
              </span>
              Suspend
            </button>
          ) : (
            <button type="button" className={goldActionButtonClass} onClick={handleReactivate}>
              <UserCheck className="size-4" />
              Reactivate
            </button>
          )}
          <button type="button" className={dangerActionButtonClass} onClick={handleDelete}>
            <span className="grid size-5 place-items-center rounded-full bg-white/20">
              <Trash2 className="size-3" />
            </span>
            Delete User
          </button>
        </div>
      </div>

      <section>
        <div className={cn(uiTokens.radiusCard, uiTokens.borderSubtle, 'bg-brand-surface p-6')}>
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
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

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-[#111111]">
              {subAdmin.profileImageUrl ? (
                <img
                  src={subAdmin.profileImageUrl}
                  alt={subAdmin.fullname}
                  className="size-full object-cover"
                />
              ) : (
                <UserRound className="size-10 text-brand-muted" />
              )}
            </div>

            <div className="grid flex-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {[
                ['First Name', subAdmin.firstName],
                ['Last Name', subAdmin.lastName],
                ['Role', roleLabel],
                ['Employee ID', subAdmin.employeeId || '—'],
                ['Department', subAdmin.department || '—'],
                ['2FA Status', subAdmin.mfaEnabled ? 'Enabled' : 'Disabled'],
                ['Workplace', subAdmin.workplaceFlexibility || '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-brand-muted">{label}</p>
                  {label === 'Role' ? (
                    <span className="mt-2 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-brand-text">
                      {value}
                    </span>
                  ) : (
                    <p className="mt-1 text-sm font-medium text-brand-text">{value}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="text-right text-xs text-brand-muted lg:min-w-[180px]">
              <p>
                Last Active:{' '}
                <span className="font-medium text-brand-text">
                  {formatOverviewDate(subAdmin.lastActionAt)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-brand-text">More Details</h2>
        <div className={cn(uiTokens.radiusCard, uiTokens.borderSubtle, 'bg-brand-surface p-6')}>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[
              ['Date Of Birth', formatDateOnly(subAdmin.dateOfBirth)],
              ['Email ID', subAdmin.email],
              ['Phone number', subAdmin.phone || '—'],
              ['Blood Group', subAdmin.bloodGroup || '—'],
              ['Created By', subAdmin.createdBy || 'Super Admin'],
              ['Location', subAdmin.location || '—'],
              ['Previous Role', '—'],
              ['Created At', formatOverviewDate(subAdmin.createdAt)],
              ['Emergency contact name', subAdmin.emergencyContactName || '—'],
              ['Contact details', subAdmin.emergencyContact || '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-brand-muted">{label}</p>
                <p className="mt-1 text-sm font-medium text-brand-text">{value}</p>
              </div>
            ))}

            <div>
              <p className="text-xs text-brand-muted">Password Updated</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-brand-text">
                <span>{formatOverviewDate(subAdmin.updatedAt)}</span>
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(true)}
                  className="text-brand-accent underline underline-offset-2 hover:text-brand-gold-from"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-brand-text">Role History &amp; Change Log</h2>
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
          searchPlaceholder="Search by role, note or action"
          showAdvancedFilter={false}
          onExport={() => toast.info('Export coming soon')}
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
    </div>
  )
}
