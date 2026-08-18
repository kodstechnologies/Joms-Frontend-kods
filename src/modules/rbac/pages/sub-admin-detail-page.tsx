import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, BarChart3, RotateCcw, XCircle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useSubAdminInvites } from '../hooks/use-rbac'
import type { SubAdminInvite } from '../types/rbac'
import { InviteStatusBadge } from '../components/invite-status-badge'
import { formatInviteTimestamp } from '../utils/invite-format'
import { InviteActionModals } from '../components/invite-action-modals'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

const PAGE_SIZE = 10

export function SubAdminDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedInvite, setSelectedInvite] = useState<SubAdminInvite | null>(null)
  const [actionMode, setActionMode] = useState<'revoke' | 'reinvite' | null>(null)

  const { data, isLoading } = useSubAdminInvites(id, {
    page,
    limit: PAGE_SIZE,
    search: searchQuery || undefined,
  })

  const subAdmin = data?.data.subAdmin
  const invites = data?.data.invites ?? []
  const meta = data?.meta

  const columns = useMemo<ColumnDef<SubAdminInvite>[]>(
    () => [
      { accessorKey: 'inviteId', header: 'Invite ID' },
      { accessorKey: 'username', header: 'Username' },
      { accessorKey: 'roleId', header: 'Role ID' },
      { accessorKey: 'roleName', header: 'Role Name' },
      { accessorKey: 'email', header: 'Email ID' },
      {
        accessorKey: 'sentAt',
        header: 'Time stamp',
        cell: ({ row }) => formatInviteTimestamp(row.original.sentAt || row.original.timestamp),
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
        cell: ({ row }) => {
          if (row.original.status !== 'pending') {
            return <span className="text-brand-muted text-sm">—</span>
          }

          return (
            <TableActionsDropdown
              label="Open invite actions"
              isOpen={activeDropdownId === row.original.id}
              onOpenChange={(open) => setActiveDropdownId(open ? row.original.id : null)}
            >
              <TableActionsItem
                icon={<RotateCcw className="size-3.5" />}
                onClick={() => {
                  setSelectedInvite(row.original)
                  setActionMode('reinvite')
                  setActiveDropdownId(null)
                }}
              >
                Re-Invite
              </TableActionsItem>
              <TableActionsItem
                icon={<XCircle className="text-brand-danger size-3.5" />}
                onClick={() => {
                  setSelectedInvite(row.original)
                  setActionMode('revoke')
                  setActiveDropdownId(null)
                }}
              >
                <span className="text-brand-danger">Revoke Invite</span>
              </TableActionsItem>
            </TableActionsDropdown>
          )
        },
      },
    ],
    [activeDropdownId],
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
              Role Based Access Control
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

      <InviteActionModals
        invite={selectedInvite}
        mode={actionMode}
        onClose={() => {
          setSelectedInvite(null)
          setActionMode(null)
        }}
      />
    </div>
  )
}
