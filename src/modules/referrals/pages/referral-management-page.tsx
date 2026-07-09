import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { BarChart3, Eye, Mail, Pencil, Trash2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

import { EditRecipientModal } from '../components/edit-recipient-modal'
import { InviteExpertReferralModal } from '../components/invite-expert-referral-modal'
import { ReferralDetailsModal } from '../components/referral-details-modal'
import { ReferralStatsBar } from '../components/referral-stats-bar'
import {
  useCreateBulkExpertInvites,
  useCreateExpertInvite,
  useDeleteExpertInvite,
  useExpertInvites,
  useReferralStats,
  useResendExpertInvite,
  useUpdateExpertInvite,
} from '../hooks/use-referrals'
import { useReferralStore } from '../store/referral-store'
import type { ExpertInvite } from '../types/referral'
import {
  formatReferralDateTime,
  getReferralStatusClassName,
  getReferralStatusLabel,
} from '../utils/referral-format'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

export function ReferralManagementPage() {
  const { searchQuery, setSearchQuery, currentPage, setCurrentPage } = useReferralStore()

  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [detailsExpert, setDetailsExpert] = useState<ExpertInvite | null>(null)
  const [editExpert, setEditExpert] = useState<ExpertInvite | null>(null)

  const { data: statsData } = useReferralStats()
  const { data: expertData, isLoading: expertLoading } = useExpertInvites({
    page: currentPage,
    limit: 10,
    search: searchQuery || undefined,
  })

  const createExpertMutation = useCreateExpertInvite()
  const createBulkMutation = useCreateBulkExpertInvites()
  const updateExpertMutation = useUpdateExpertInvite()
  const deleteExpertMutation = useDeleteExpertInvite()
  const resendExpertMutation = useResendExpertInvite()

  const expertInvites = expertData?.data?.invites ?? []
  const meta = expertData?.data?.meta

  const handleResend = useCallback(
    async (id: string) => {
      setActiveDropdownId(null)
      try {
        await resendExpertMutation.mutateAsync(id)
        toast.success('Expert referral resend queued (delivery pending integration)')
      } catch {
        toast.error('Failed to resend invitation')
      }
    },
    [resendExpertMutation],
  )

  const handleDelete = useCallback(
    async (id: string) => {
      setActiveDropdownId(null)
      try {
        await deleteExpertMutation.mutateAsync(id)
        toast.success('Expert referral deleted')
      } catch {
        toast.error('Failed to delete referral')
      }
    },
    [deleteExpertMutation],
  )

  const renderActions = useCallback(
    (record: ExpertInvite) => {
      const id = record.inviteId
      const isOpen = activeDropdownId === id

      return (
        <TableActionsDropdown
          label="Open expert referral actions"
          isOpen={isOpen}
          onOpenChange={(open) => setActiveDropdownId(open ? id : null)}
          menuWidth={210}
        >
          <TableActionsItem
            icon={<Eye className="size-3.5" />}
            onClick={() => {
              setActiveDropdownId(null)
              setDetailsExpert(record)
            }}
          >
            View Details
          </TableActionsItem>
          <TableActionsItem
            icon={<Mail className="size-3.5" />}
            onClick={() => handleResend(id)}
          >
            Resend Invitation
          </TableActionsItem>
          <TableActionsItem
            icon={<Pencil className="size-3.5" />}
            onClick={() => {
              setActiveDropdownId(null)
              setEditExpert(record)
            }}
          >
            Edit Expert Details
          </TableActionsItem>
          <TableActionsItem
            icon={<Trash2 className="size-3.5 text-rose-300" />}
            onClick={() => handleDelete(id)}
          >
            <span className="text-rose-300">Delete Referral</span>
          </TableActionsItem>
        </TableActionsDropdown>
      )
    },
    [activeDropdownId, handleDelete, handleResend],
  )

  const expertColumns = useMemo<ColumnDef<ExpertInvite>[]>(
    () => [
      { accessorKey: 'inviteId', header: 'Invite ID' },
      { accessorKey: 'invitedExpertName', header: 'Invited Expert' },
      { accessorKey: 'email', header: 'Expert Email' },
      { accessorKey: 'phone', header: 'Expert Phone' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={cn(
              'rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
              getReferralStatusClassName(row.original.status),
            )}
          >
            {getReferralStatusLabel(row.original.status)}
          </span>
        ),
      },
      { accessorKey: 'invitedThrough', header: 'Invited through' },
      {
        accessorKey: 'inviteStatus',
        header: 'Referral Type',
        cell: ({ row }) => (
          <span className="capitalize">{row.original.inviteStatus}</span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => formatReferralDateTime(row.original.createdAt),
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
        cell: ({ row }) => renderActions(row.original),
      },
    ],
    [renderActions],
  )

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Referral Management</h1>
          <p className="mt-1 text-sm text-slate-400 md:text-base">
            Track and manage platform-driven expert referrals
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <Button
            className="h-9 w-full rounded-xl bg-[#FBC078] px-5 text-sm font-semibold text-black shadow-none hover:bg-[#EEB46A] md:w-auto"
            onClick={() => toast.info('Metrics configuration coming soon')}
          >
            <BarChart3 className="size-4" />
            Manage Metrics
          </Button>

          <Button
            className="h-9 w-full rounded-xl bg-[#FBC078] px-5 text-sm font-semibold text-black shadow-none hover:bg-[#EEB46A] md:w-auto"
            onClick={() => setInviteOpen(true)}
          >
            <UserPlus className="size-4" />
            Refer Expert
          </Button>
        </div>
      </div>

      <ReferralStatsBar metrics={statsData?.data} />

      <DataTable
        columns={expertColumns}
        data={expertInvites}
        getRowId={(row) => row.inviteId}
        isLoading={expertLoading}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, ID or email"
        onAdvancedFilter={() => toast.info('Advanced filters coming soon')}
        onExport={() => toast.info('Export coming soon')}
        pagination={{
          page: currentPage,
          pageSize: meta?.limit ?? 10,
          totalItems: meta?.total ?? 0,
          totalPages: meta?.totalPages ?? 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="expert referrals"
        emptyMessage="No expert referrals found."
      />

      <InviteExpertReferralModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        isSubmitting={createExpertMutation.isPending || createBulkMutation.isPending}
        onSubmitManual={async (payload) => {
          try {
            await createExpertMutation.mutateAsync(payload)
            toast.success('Expert referral created')
            setInviteOpen(false)
          } catch {
            toast.error('Failed to create expert referral')
          }
        }}
        onSubmitBulk={async (payload) => {
          try {
            await createBulkMutation.mutateAsync(payload)
            toast.success('Bulk expert referrals created')
            setInviteOpen(false)
          } catch {
            toast.error('Failed to create bulk expert referrals')
          }
        }}
      />

      <ReferralDetailsModal
        open={Boolean(detailsExpert)}
        onClose={() => setDetailsExpert(null)}
        expertInvite={detailsExpert}
      />

      <EditRecipientModal
        open={Boolean(editExpert)}
        onClose={() => setEditExpert(null)}
        initialValues={
          editExpert
            ? {
              name: editExpert.invitedExpertName,
              email: editExpert.email,
              phone: editExpert.phone,
              message: editExpert.message,
            }
            : undefined
        }
        isSubmitting={updateExpertMutation.isPending}
        onSubmit={async (payload) => {
          if (!editExpert) return
          try {
            await updateExpertMutation.mutateAsync({ id: editExpert._id, payload })
            toast.success('Expert details updated')
            setEditExpert(null)
          } catch {
            toast.error('Failed to update expert details')
          }
        }}
      />
    </div>
  )
}
