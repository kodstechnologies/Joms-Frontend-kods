import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, BarChart3, RotateCcw, XCircle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useReinviteSubAdmin, useRevokeSubAdminInvite, useSubAdminInvites } from '../hooks/use-rbac'
import type { SubAdminInvite } from '../types/rbac'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

const PAGE_SIZE = 10

const formatTimestamp = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  const time = date.toLocaleString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  const day = date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  })
  return `${time} ${day}`
}

function InviteStatusBadge({ status }: { status: SubAdminInvite['status'] }) {
  const isAccepted = status === 'accepted'
  const isPending = status === 'pending'

  return (
    <span
      className={cn(
        'text-body-sm-semibold inline-flex rounded-full border px-2.5 py-0.5 capitalize',
        isAccepted && 'border-brand-success/25 bg-brand-success/10 text-brand-success',
        isPending && 'border-brand-accent-muted bg-brand-accent/15 text-brand-accent',
        !isAccepted && !isPending && 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger',
      )}
    >
      {isAccepted ? 'Accepted' : isPending ? 'Pending' : 'Revoked'}
    </span>
  )
}

export function SubAdminDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  const { data, isLoading } = useSubAdminInvites(id, {
    page,
    limit: PAGE_SIZE,
    search: searchQuery || undefined,
  })

  const reinviteMutation = useReinviteSubAdmin()
  const revokeMutation = useRevokeSubAdminInvite()

  const subAdmin = data?.data.subAdmin
  const invites = data?.data.invites ?? []
  const meta = data?.meta

  const handleReinvite = useCallback(
    async (inviteId: string) => {
      try {
        await reinviteMutation.mutateAsync(inviteId)
        toast.success('Invite resent successfully')
      } catch {
        toast.error('Failed to resend invite')
      }
      setActiveDropdownId(null)
    },
    [reinviteMutation],
  )

  const handleRevoke = useCallback(
    async (inviteId: string) => {
      try {
        await revokeMutation.mutateAsync(inviteId)
        toast.success('Invite revoked successfully')
      } catch {
        toast.error('Failed to revoke invite')
      }
      setActiveDropdownId(null)
    },
    [revokeMutation],
  )

  const columns = useMemo<ColumnDef<SubAdminInvite>[]>(
    () => [
      { accessorKey: 'inviteId', header: 'Invite ID' },
      { accessorKey: 'username', header: 'Username' },
      { accessorKey: 'roleId', header: 'Role ID' },
      { accessorKey: 'roleName', header: 'RoleName' },
      { accessorKey: 'email', header: 'Email ID' },
      {
        accessorKey: 'sentAt',
        header: 'Time stamp',
        cell: ({ row }) => formatTimestamp(row.original.sentAt || row.original.timestamp),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <InviteStatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
        cell: ({ row }) => (
          <TableActionsDropdown
            label="Open invite actions"
            isOpen={activeDropdownId === row.original.id}
            onOpenChange={(open) => setActiveDropdownId(open ? row.original.id : null)}
          >
            <TableActionsItem
              icon={<RotateCcw className="size-3.5" />}
              onClick={() => handleReinvite(row.original.id)}
            >
              Re-Invite
            </TableActionsItem>
            <TableActionsItem
              icon={<XCircle className="text-brand-danger size-3.5" />}
              onClick={() => handleRevoke(row.original.id)}
            >
              <span className="text-brand-danger">Revoke Invite</span>
            </TableActionsItem>
          </TableActionsDropdown>
        ),
      },
    ],
    [activeDropdownId, handleReinvite, handleRevoke],
  )

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
            <span>User Details</span>
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
            <span>User</span>
            <span className="text-brand-text/30">/</span>
            <span className="text-brand-text font-bold">Invites</span>
          </div>
        </div>

        <Button
          variant="secondary"
          className="ui-manage-metrics"
          onClick={() => navigate('/metrics/rbac-hub')}
        >
          <BarChart3 className="size-4" />
          Manage Metrics
        </Button>
      </div>

      <div>
        <h2 className="text-brand-text text-lg font-semibold">Invite Overview</h2>
        {subAdmin ? (
          <p className="text-brand-muted mt-1 text-sm">
            Invite history for{' '}
            <span className="text-brand-text font-medium">{subAdmin.fullname}</span>
          </p>
        ) : null}
      </div>

      <DataTable
        columns={columns}
        data={invites}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value)
          setPage(1)
        }}
        searchPlaceholder="Search by name, ID or profession"
        onAdvancedFilter={() => toast.info('Advanced filters coming soon')}
        onExport={() => toast.info('Export coming soon')}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          totalItems: meta?.total ?? 0,
          totalPages: meta?.totalPages ?? 1,
          onPageChange: setPage,
        }}
        resourceLabel="requests"
        emptyMessage="No invites found for this user."
      />
    </div>
  )
}
