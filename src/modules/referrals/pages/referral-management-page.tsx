import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Mail, SlidersHorizontal, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import createIcon from '@/assets/JOMS_ICONS-2/icons8-create.svg'

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
} from '../hooks/use-referrals'
import { useReferralStore } from '../store/referral-store'
import type { ExpertInvite } from '../types/referral'
import {
  getReferralStatusClassName,
  getReferralStatusLabel,
  formatReferralDateRange,
} from '../utils/referral-format'
import { REFERRAL_METRIC_DEFINITIONS } from '../utils/referral-metrics-definitions'
import { useActiveMetricIds } from '@/modules/expert/hooks/use-active-metric-ids'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

const REFERRALS_MODULE_KEY = 'referrals'

const DEFAULT_METRIC_IDS = REFERRAL_METRIC_DEFINITIONS.map((metric) => metric.id)

const DEFAULT_VISIBLE_COLUMN_IDS = [
  'referral-id',
  'referrer',
  'referred-expert',
  'source-type',
  'status',
  'goal-progress',
  'created-at',
]

function getApiErrorMessage(err: unknown, fallback: string) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback
  )
}

export function ReferralManagementPage() {
  const navigate = useNavigate()
  const { searchQuery, setSearchQuery, currentPage, setCurrentPage } = useReferralStore()

  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [detailsExpert, setDetailsExpert] = useState<ExpertInvite | null>(null)

  const { data: statsData, isLoading: statsLoading } = useReferralStats()
  const { data: expertData, isLoading: expertLoading } = useExpertInvites({
    page: currentPage,
    limit: 10,
    search: searchQuery || undefined,
  })
  const activeMetricIds = useActiveMetricIds(REFERRALS_MODULE_KEY, DEFAULT_METRIC_IDS)
  const tableColumnPreferencesQuery = useTableColumnPreferences(REFERRALS_MODULE_KEY)

  const createExpertMutation = useCreateExpertInvite()
  const createBulkMutation = useCreateBulkExpertInvites()
  const deleteExpertMutation = useDeleteExpertInvite()
  const resendExpertMutation = useResendExpertInvite()

  const expertInvites = expertData?.data?.invites ?? []
  const meta = expertData?.data?.meta

  const handleResend = useCallback(
    async (id: string) => {
      setActiveDropdownId(null)
      try {
        await resendExpertMutation.mutateAsync(id)
        toast.success('Invitation resent')
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to resend invitation'))
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
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to delete referral'))
      }
    },
    [deleteExpertMutation],
  )

  const renderActions = useCallback(
    (record: ExpertInvite) => {
      const id = record.referralId
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
          <TableActionsItem icon={<Mail className="size-3.5" />} onClick={() => handleResend(id)}>
            Resend Invitation
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

  const expertColumns = useMemo<ColumnDef<ExpertInvite>[]>(() => {
    const dataColumnsById: Record<string, ColumnDef<ExpertInvite>> = {
      'referral-id': {
        id: 'referral-id',
        accessorKey: 'referralId',
        header: 'Referral ID',
      },
      referrer: {
        id: 'referrer',
        accessorKey: 'referrerName',
        header: 'Referrer',
      },
      'referred-expert': {
        id: 'referred-expert',
        accessorKey: 'referredExpertName',
        header: 'Referred Expert',
      },
      'source-type': {
        id: 'source-type',
        accessorKey: 'sourceType',
        header: 'Source Type',
        cell: ({ row }) => <span className="capitalize">{row.original.sourceType}</span>,
      },
      status: {
        id: 'status',
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
      'goal-progress': {
        id: 'goal-progress',
        accessorKey: 'goalProgress',
        header: 'Goal Progress',
        meta: { headerClassName: 'text-center', cellClassName: 'text-center' },
        cell: ({ row }) => (
          <span className="text-brand-text text-sm font-medium">
            {row.original.goalProgress?.signedUpCount ?? 0}/
            {row.original.goalProgress?.maxReferrals ?? 10}
          </span>
        ),
      },
      'created-at': {
        id: 'created-at',
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => {
          const { range, days } = formatReferralDateRange(
            row.original.createdAt,
            row.original.expiresAt,
          )
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-brand-text text-sm font-medium">{range}</span>
              <span className="text-muted text-xs">{days}</span>
            </div>
          )
        },
      },
    }

    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_VISIBLE_COLUMN_IDS

    const preferenceColumns = visibleIds.map((id) => dataColumnsById[id]).filter(Boolean)

    const actionsColumn: ColumnDef<ExpertInvite> = {
      id: 'actions',
      header: 'Actions',
      meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
      cell: ({ row }) => renderActions(row.original),
    }

    return [...preferenceColumns, actionsColumn]
  }, [renderActions, tableColumnPreferencesQuery.data])

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="referral-page-title">Referral Management</h1>
          <p className="referral-page-subtitle mt-1">
            Track and manage user-driven and platform-driven referrals
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <Button
            className="ui-manage-metrics h-9 w-full rounded-xl bg-[#FBC078] px-5 text-sm font-semibold text-black shadow-none hover:bg-[#EEB46A] md:w-auto"
            onClick={() => navigate('/metrics/referrals')}
          >
            <SlidersHorizontal className="size-4" />
            Manage Metrics
          </Button>

          <Button type="button" className="w-full md:w-auto" onClick={() => setInviteOpen(true)}>
            <img src={createIcon} alt="create" className="size-4" />
            Invite New Expert
          </Button>
        </div>
      </div>

      <ReferralStatsBar
        metrics={statsData?.data}
        isLoading={statsLoading}
        activeMetricIds={activeMetricIds}
      />

      <DataTable
        columns={expertColumns}
        data={expertInvites}
        getRowId={(row) => row.referralId}
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
            const result = await createExpertMutation.mutateAsync(payload)
            const delivery = result?.data?.delivery
            if (payload.email && !delivery?.emailSent) {
              toast.warning(
                delivery?.note ||
                  'Invite created, but email was not delivered. Check Brevo config or use Resend.',
              )
            } else {
              toast.success('Invitation sent with your message')
            }
            setInviteOpen(false)
          } catch (err) {
            toast.error(getApiErrorMessage(err, 'Failed to send invitation'))
          }
        }}
        onSubmitBulk={async (payload) => {
          try {
            const result = await createBulkMutation.mutateAsync(payload)
            const count = result?.data?.count ?? result?.data?.invites?.length ?? 0
            const skipped = result?.data?.skipped ?? []
            if (skipped.length) {
              toast.success(
                `Created ${count} invite${count === 1 ? '' : 's'}; skipped ${skipped.length}`,
              )
            } else {
              toast.success(`Sent ${count} invite${count === 1 ? '' : 's'}`)
            }
            setInviteOpen(false)
          } catch (err) {
            toast.error(getApiErrorMessage(err, 'Failed to create bulk expert referrals'))
          }
        }}
      />

      <ReferralDetailsModal
        open={Boolean(detailsExpert)}
        onClose={() => setDetailsExpert(null)}
        expertInvite={detailsExpert}
      />
    </div>
  )
}
