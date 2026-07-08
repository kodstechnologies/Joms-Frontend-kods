import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  ArrowLeft,
  BarChart3,
  ClipboardList,
  ExternalLink,
  Flag,
  UserRound,
} from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  useFlagAuditLog,
  useRoleLogs,
  useSubAdminLogs,
} from '../hooks/use-rbac'
import type { AdminLogSubject, AuditLog } from '../types/rbac'
import { AdminNoteModal } from '../components/admin-note-modal'
import { RoleUsersModal } from '../components/role-users-modal'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

const PAGE_SIZE = 10

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
        'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize',
        isSuccess
          ? 'border-brand-success/25 bg-brand-success/10 text-brand-success'
          : 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger',
      )}
    >
      {isSuccess ? 'Success' : 'Failed'}
    </span>
  )
}

function PreVersionModal({
  log,
  onClose,
}: {
  log: AuditLog | null
  onClose: () => void
}) {
  if (!log) return null

  const previousVersion = log.metadata?.previousVersion as Record<string, unknown> | undefined
  const snapshot = previousVersion ?? log.metadata ?? {}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        className={cn(
          uiTokens.radiusCard,
          uiTokens.borderSubtle,
          'w-full max-w-lg bg-brand-surface p-6 shadow-[0_18px_60px_rgba(0,0,0,0.55)]',
        )}
      >
        <h3 className="text-lg font-semibold text-brand-text">Pre-Version Snapshot</h3>
        <p className="mt-1 text-sm text-brand-muted">
          Previous state captured for action: <span className="text-brand-text">{log.action}</span>
        </p>
        <pre className="mt-4 max-h-72 overflow-auto rounded-brand-md border border-white/10 bg-[#0F0F0F] p-4 text-xs text-brand-text">
          {JSON.stringify(snapshot, null, 2)}
        </pre>
        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
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
        <p className="text-sm text-brand-muted">Loading overview…</p>
      </div>
    )
  }

  const roleLabel = subject.roles.map((r) => r.name).join(', ') || '—'
  const createdBy = subject.createdBy || 'Super Admin'

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-brand-text">Admin Overview</h2>
      <div className={cn(uiTokens.radiusCard, uiTokens.borderSubtle, 'bg-brand-surface p-6')}>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-brand-md bg-brand-accent/10 text-brand-accent">
              <UserRound className="size-4" />
            </div>
            <h3 className="text-base font-semibold text-brand-text">Admin Info</h3>
          </div>
          <p className="text-xs text-brand-muted">
            Created At:{' '}
            <span className="font-medium text-brand-text">{formatOverviewDate(subject.createdAt)}</span>
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-brand-muted">Name</p>
              <button
                type="button"
                onClick={() => onOpenUser(subject.id)}
                className="mt-1 text-base font-semibold text-brand-text underline decoration-brand-muted/40 underline-offset-4 transition-colors hover:text-brand-accent"
              >
                {subject.fullname}
              </button>
            </div>
            <div>
              <p className="text-xs text-brand-muted">Role</p>
              <span className="mt-2 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-brand-text">
                {roleLabel}
              </span>
            </div>
            <div>
              <p className="text-xs text-brand-muted">Status</p>
              <span
                className={cn(
                  'mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize',
                  subject.status === 'active'
                    ? 'border-brand-success/25 bg-brand-success/10 text-brand-success'
                    : 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger',
                )}
              >
                {subject.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-brand-muted">Email ID</p>
              <p className="mt-1 text-sm font-medium text-brand-text">{subject.email}</p>
            </div>
          </div>

          <div className="flex flex-col items-end justify-end">
            <p className="text-xs text-brand-muted">
              Created By: <span className="font-semibold text-brand-text">{createdBy}</span>
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
        <p className="text-sm text-brand-muted">Loading overview…</p>
      </div>
    )
  }

  const createdBy = subject.createdBy || 'Super Admin'

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-brand-text">Admin Overview</h2>
      <div className={cn(uiTokens.radiusCard, uiTokens.borderSubtle, 'bg-brand-surface p-6')}>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-brand-md bg-brand-accent/10 text-brand-accent">
              <UserRound className="size-4" />
            </div>
            <h3 className="text-base font-semibold text-brand-text">Admin Info</h3>
          </div>
          <p className="text-xs text-brand-muted">
            Created At:{' '}
            <span className="font-medium text-brand-text">{formatOverviewDate(subject.createdAt)}</span>
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-xs text-brand-muted">Role</p>
            <span className="mt-2 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-brand-text">
              {subject.name}
            </span>
          </div>
          <div>
            <p className="text-xs text-brand-muted">Status</p>
            <span
              className={cn(
                'mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize',
                subject.status === 'active'
                  ? 'border-brand-success/25 bg-brand-success/10 text-brand-success'
                  : 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger',
              )}
            >
              {subject.status}
            </span>
          </div>
          <div>
            <p className="text-xs text-brand-muted">No. Of Users</p>
            <button
              type="button"
              onClick={() => onViewRoleUsers(subject.id)}
              className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-brand-text transition-colors hover:text-brand-accent"
              aria-label={`View users assigned to ${subject.name}`}
            >
              {String(subject.userCount).padStart(2, '0')}
              <ExternalLink className="size-3.5" />
            </button>
          </div>
          <div>
            <p className="text-xs text-brand-muted">Last Action</p>
            <p className="mt-2 text-sm font-medium text-brand-text">
              {formatOverviewDate(subject.lastActionAt)}
            </p>
          </div>
        </div>

        <p className="mt-5 text-right text-xs text-brand-muted">
          Created By: <span className="font-medium text-brand-text">{createdBy}</span>
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
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [previewLog, setPreviewLog] = useState<AuditLog | null>(null)
  const [selectedAdminNote, setSelectedAdminNote] = useState<string | null>(null)
  const [roleUsersModalId, setRoleUsersModalId] = useState<string | null>(null)

  const logParams = {
    page,
    limit: PAGE_SIZE,
    search: searchQuery || undefined,
  }

  const subAdminLogsQuery = useSubAdminLogs(id, logParams, {
    enabled: Boolean(id) && !isRole,
  })
  const roleLogsQuery = useRoleLogs(id, logParams, {
    enabled: Boolean(id) && isRole,
  })
  const logsQuery = isRole ? roleLogsQuery : subAdminLogsQuery

  const flagMutation = useFlagAuditLog()

  const subject = logsQuery.data?.data.subject
  const logs = logsQuery.data?.data.logs ?? []
  const meta = logsQuery.data?.meta

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
        className="max-w-[220px] truncate text-left text-xs font-medium text-brand-accent underline decoration-brand-accent/40 underline-offset-2 hover:text-brand-gold-from"
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
            onClick={() => setPreviewLog(row.original)}
            className="text-left text-xs font-semibold text-brand-accent underline decoration-brand-accent/40 underline-offset-2 hover:text-brand-gold-from"
          >
            {row.original.action}
          </button>
        ),
      },
      {
        accessorKey: 'module',
        header: 'Module',
        cell: ({ row }) => (
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-brand-text">
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
    ],
    [renderAdminNoteCell],
  )

  const roleColumns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      {
        accessorKey: 'action',
        header: 'Activity',
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => setPreviewLog(row.original)}
            className="text-left text-xs font-semibold text-brand-accent hover:underline"
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
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-brand-text">
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
              <TableActionsItem
                icon={<ClipboardList className="size-3.5" />}
                onClick={() => {
                  setPreviewLog(row.original)
                  setActiveDropdownId(null)
                }}
              >
                View Pre-Version
              </TableActionsItem>
              <TableActionsItem
                icon={<Flag className="size-3.5 text-brand-danger" />}
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
    [activeDropdownId, handleFlag, renderAdminNoteCell],
  )

  const columns = isRole ? roleColumns : userColumns

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => navigate('/settings/access')}
            className="group flex w-fit items-center gap-2 font-heading text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>{pageTitle}</span>
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
            <span className="font-bold text-white">{breadcrumbName}</span>
          </div>
        </div>

        <Button variant="secondary" onClick={() => toast.info('Metrics configuration coming soon')}>
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
        <h2 className="text-lg font-semibold text-brand-text">Action Logs</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Complete history of actions performed by this admin
        </p>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        getRowId={(row) => row.id || row._id || row.action}
        isLoading={logsQuery.isLoading}
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value)
          setPage(1)
        }}
        searchPlaceholder="Search by action, module or note"
        onAdvancedFilter={() => toast.info('Advanced filters coming soon')}
        onExport={() => toast.info('Export coming soon')}
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

      <PreVersionModal log={previewLog} onClose={() => setPreviewLog(null)} />
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
