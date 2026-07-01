import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { MembershipActionModals } from '../components/membership-action-modals'
import { MembershipStatsBar } from '../components/membership-stats-bar'
import {
  useCancelSubscription,
  useDowngradeSubscription,
  useExpertSubscriptions,
  useExtendSubscription,
  useUpgradeSubscription,
} from '../hooks/use-membership-subscriptions'
import { useExpertMembershipStore } from '../store/expert-membership-store'
import type { MembershipSubscription } from '../types/membership-subscription'
import { formatCurrency, formatMembershipDate } from '../utils/membership-format'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { cn } from '@/shared/lib/cn'

const PLAN_BADGE_COLORS = [
  'bg-rose-500/15 text-rose-300',
  'bg-amber-500/15 text-amber-300',
  'bg-emerald-500/15 text-emerald-300',
  'bg-blue-500/15 text-blue-300',
  'bg-purple-500/15 text-purple-300',
]

export function ExpertMembershipsPage() {
  const navigate = useNavigate()
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedSubscription, setSelectedSubscription] = useState<MembershipSubscription | null>(null)
  const [actionType, setActionType] = useState<'upgrade' | 'downgrade' | 'extend' | 'cancel' | null>(null)

  const { searchQuery, setSearchQuery, activeStatus, setActiveStatus, currentPage, setCurrentPage } =
    useExpertMembershipStore()

  const { data, isLoading } = useExpertSubscriptions({
    search: searchQuery || undefined,
    status: activeStatus === 'all' ? undefined : activeStatus,
    page: currentPage,
    limit: 10,
  })

  const upgradeMutation = useUpgradeSubscription()
  const downgradeMutation = useDowngradeSubscription()
  const extendMutation = useExtendSubscription()
  const cancelMutation = useCancelSubscription()

  const subscriptions = data?.data?.subscriptions ?? []
  const meta = data?.data?.meta

  const openAction = useCallback((subscription: MembershipSubscription, action: typeof actionType) => {
    setSelectedSubscription(subscription)
    setActionType(action)
    setActiveDropdownId(null)
  }, [])

  const closeAction = () => {
    setSelectedSubscription(null)
    setActionType(null)
  }

  const columns = useMemo<ColumnDef<MembershipSubscription>[]>(
    () => [
      {
        accessorKey: 'subscriptionId',
        header: 'Plan ID',
        cell: ({ row }) => (
          <span className="font-medium text-slate-200">{row.original.subscriptionId}</span>
        ),
      },
      {
        accessorKey: 'partnerName',
        header: 'Username',
      },
      {
        accessorKey: 'planName',
        header: 'Plan name',
        cell: ({ row }) => (
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] font-semibold',
              PLAN_BADGE_COLORS[row.index % PLAN_BADGE_COLORS.length],
            )}
          >
            {row.original.planName}
          </span>
        ),
      },
      {
        accessorKey: 'billingCycleName',
        header: 'Plan cycle',
      },
      {
        accessorKey: 'autoRenew',
        header: 'Auto Renewal',
        cell: ({ row }) => (row.original.autoRenew ? 'Yes' : 'No'),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize',
              row.original.status === 'active'
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'bg-orange-500/15 text-orange-300',
            )}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: 'startedAt',
        header: 'Started at',
        cell: ({ row }) => formatMembershipDate(row.original.startedAt),
      },
      {
        accessorKey: 'expiresAt',
        header: 'Expiry at',
        cell: ({ row }) => formatMembershipDate(row.original.expiresAt),
      },
      {
        accessorKey: 'purchasedPrice',
        header: 'Price',
        cell: ({ row }) => formatCurrency(row.original.purchasedPrice),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <TableActionsDropdown
            label={`Actions for ${row.original.partnerName}`}
            isOpen={activeDropdownId === row.original._id}
            onOpenChange={(open) => setActiveDropdownId(open ? row.original._id : null)}
          >
            <TableActionsItem
              icon={<Eye className="size-4" />}
              onClick={() => navigate(`/memberships/experts/${row.original._id}`)}
            >
              View Details
            </TableActionsItem>
            <TableActionsItem onClick={() => openAction(row.original, 'upgrade')}>
              Upgrade plan
            </TableActionsItem>
            <TableActionsItem onClick={() => openAction(row.original, 'downgrade')}>
              Downgrade Plan
            </TableActionsItem>
            <TableActionsItem onClick={() => openAction(row.original, 'extend')}>
              Extend Plan
            </TableActionsItem>
            <TableActionsItem onClick={() => openAction(row.original, 'cancel')}>
              Cancel Plan
            </TableActionsItem>
          </TableActionsDropdown>
        ),
      },
    ],
    [activeDropdownId, navigate, openAction],
  )

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Membership Management"
        subtitle="Manage expert membership subscriptions, lifecycle actions, and plan changes."
      />

      <MembershipStatsBar />

      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        <TabLink active to="/memberships/plans">Membership Plans</TabLink>
        <TabLink disabled>Users Memberships Management</TabLink>
        <TabLink active to="/memberships/experts">Expert Memberships Management</TabLink>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'active', 'expired'] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setActiveStatus(status)}
            className={cn(
              'rounded-full border px-4 py-2 text-xs font-medium capitalize',
              activeStatus === status
                ? 'border-amber-400/40 bg-amber-400/10 text-amber-200'
                : 'border-white/10 text-slate-400',
            )}
          >
            {status === 'all' ? 'All' : status}
            {status !== 'all' && meta?.counts ? ` (${meta.counts[status]})` : ''}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={subscriptions}
        getRowId={(subscription) => subscription._id}
        isLoading={isLoading}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, ID or profession"
        onAdvancedFilter={() => toast.info('Advanced filters coming soon')}
        onExport={() => toast.info('Export coming soon')}
        pagination={{
          page: currentPage,
          pageSize: meta?.limit ?? 10,
          totalItems: meta?.total ?? 0,
          totalPages: meta?.totalPages ?? 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="subscriptions"
      />

      <MembershipActionModals
        subscription={selectedSubscription}
        action={actionType}
        onClose={closeAction}
        isSubmitting={
          upgradeMutation.isPending ||
          downgradeMutation.isPending ||
          extendMutation.isPending ||
          cancelMutation.isPending
        }
        onUpgrade={async (payload) => {
          if (!selectedSubscription) return
          try {
            await upgradeMutation.mutateAsync({
              id: selectedSubscription._id,
              payload: { ...payload, updatedBy: 'Admin' },
            })
            toast.success('Upgrade request submitted')
            closeAction()
          } catch {
            toast.error('Failed to upgrade membership')
          }
        }}
        onDowngrade={async (payload) => {
          if (!selectedSubscription) return
          try {
            await downgradeMutation.mutateAsync({
              id: selectedSubscription._id,
              payload: { ...payload, updatedBy: 'Admin' },
            })
            toast.success('Downgrade request submitted')
            closeAction()
          } catch {
            toast.error('Failed to downgrade membership')
          }
        }}
        onExtend={async (payload) => {
          if (!selectedSubscription) return
          try {
            await extendMutation.mutateAsync({
              id: selectedSubscription._id,
              payload: { ...payload, updatedBy: 'Admin' },
            })
            toast.success('Extension request submitted')
            closeAction()
          } catch {
            toast.error('Failed to extend membership')
          }
        }}
        onCancel={async (payload) => {
          if (!selectedSubscription) return
          try {
            await cancelMutation.mutateAsync({
              id: selectedSubscription._id,
              payload: { ...payload, updatedBy: 'Admin' },
            })
            toast.success('Cancellation request submitted')
            closeAction()
          } catch {
            toast.error('Failed to cancel membership')
          }
        }}
      />
    </div>
  )
}

function TabLink({
  children,
  to,
  active = false,
  disabled = false,
}: {
  children: ReactNode
  to?: string
  active?: boolean
  disabled?: boolean
}) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) {
          toast.info('Users memberships management is not available')
          return
        }
        if (to) navigate(to)
      }}
      className={cn(
        'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
        active ? 'bg-amber-400/10 text-amber-200' : 'text-slate-400',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      {children}
    </button>
  )
}
