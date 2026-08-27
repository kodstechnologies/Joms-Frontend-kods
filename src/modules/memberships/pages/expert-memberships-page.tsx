import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  CircleArrowDown,
  CircleArrowUp,
  ClipboardList,
  Flag,
  Tag,
  Waypoints,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { EscalateMembershipUpgradeModal } from '../components/escalate-membership-upgrade-modal'
import { MembershipActionModals } from '../components/membership-action-modals'
import { MembershipStatsBar } from '../components/membership-stats-bar'
import {
  DEFAULT_MEMBERSHIPS_VISIBLE_COLUMN_IDS,
  MEMBERSHIPS_MODULE_KEY,
} from '../config/membership-metrics.config'
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
import { buildMembershipDataColumnsById } from '../utils/membership-preference-columns'
import { fetchExpertSubscriptions } from '../api/membership-subscription-api'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { Button } from '@/shared/components/ui/button'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { AddTagModal } from '@/shared/components/modal/add-tag-modal'
import { useEntityTags } from '@/shared/hooks/use-entity-tags'
import { cn } from '@/shared/lib/cn'
import type { FilterValues } from '@/shared/types/data-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildExpertMembershipsListQueryParams,
  createExpertMembershipsFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'

const EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (row: MembershipSubscription) => string }
> = {
  'subscription-id': {
    header: 'Subscription ID',
    accessor: (row) => exportDisplayValue(row.subscriptionId),
  },
  'user-id': {
    header: 'User ID',
    accessor: (row) => exportDisplayValue(row.userId || row.partnerId),
  },
  username: {
    header: 'Username',
    accessor: (row) => exportDisplayValue(row.username || row.partnerName),
  },
  'plan-id': {
    header: 'Plan ID',
    accessor: (row) => exportDisplayValue(row.planId),
  },
  'plan-name': {
    header: 'Plan Name',
    accessor: (row) => exportDisplayValue(row.planName),
  },
  'plan-cycle': {
    header: 'Plan Cycle',
    accessor: (row) => exportDisplayValue(row.billingCycleName),
  },
  'subscription-status': {
    header: 'Subscription Status',
    accessor: (row) => exportDisplayValue(row.status),
  },
  'started-at': {
    header: 'Started At',
    accessor: (row) => exportDisplayValue(formatMembershipDate(row.startedAt)),
  },
  'expiry-at': {
    header: 'Expiry At',
    accessor: (row) => exportDisplayValue(formatMembershipDate(row.expiresAt)),
  },
  'price-paid': {
    header: 'Price Paid',
    accessor: (row) => exportDisplayValue(formatCurrency(row.purchasedPrice)),
  },
  'payment-status': {
    header: 'Payment Status',
    accessor: (row) => exportDisplayValue(row.paymentStatus),
  },
  'payment-method': {
    header: 'Payment Method',
    accessor: (row) => exportDisplayValue(row.paymentMethod || row.paymentInfo?.paymentMethod),
  },
  'transaction-id': {
    header: 'Transaction ID',
    accessor: (row) => exportDisplayValue(row.transactionId),
  },
  'previous-plan-name': {
    header: 'Previous Plan Name',
    accessor: (row) => exportDisplayValue(row.previousPlanName || row.previousMembership?.planName),
  },
  'auto-renewal': {
    header: 'Auto Renewal',
    accessor: (row) => (row.autoRenew ? 'Yes' : 'No'),
  },
  'next-billing-date': {
    header: 'Next Billing Date',
    accessor: (row) => exportDisplayValue(formatMembershipDate(row.nextBillingDate)),
  },
  source: {
    header: 'Source',
    accessor: (row) => exportDisplayValue(row.source || row.sourceApp),
  },
  'coupon-code': {
    header: 'Coupon Code',
    accessor: (row) => exportDisplayValue(row.couponCode),
  },
  'discount-amount': {
    header: 'Discount Amount',
    accessor: (row) =>
      row.discountAmount == null ? '—' : exportDisplayValue(formatCurrency(row.discountAmount)),
  },
  'last-renewed-at': {
    header: 'Last Renewed At',
    accessor: (row) => exportDisplayValue(formatMembershipDate(row.lastRenewedAt)),
  },
  'created-at': {
    header: 'Created At',
    accessor: (row) => exportDisplayValue(formatMembershipDate(row.createdAt)),
  },
  'updated-at': {
    header: 'Updated At',
    accessor: (row) => exportDisplayValue(formatMembershipDate(row.updatedAt)),
  },
}

export function ExpertMembershipsPage() {
  const navigate = useNavigate()
  const isSuperAdmin = useAuthStore((state) => state.user?.isSuperAdmin)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedSubscription, setSelectedSubscription] = useState<MembershipSubscription | null>(
    null,
  )
  const [actionType, setActionType] = useState<
    'upgrade' | 'downgrade' | 'extend' | 'cancel' | null
  >(null)
  const [escalateOpen, setEscalateOpen] = useState(false)
  const { tagModalOpen, openTagModal, closeTagModal, saveTags, initialTags } = useEntityTags()

  const { searchQuery, setSearchQuery, currentPage, setCurrentPage } = useExpertMembershipStore()
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const listQueryParams = useMemo(
    () =>
      buildExpertMembershipsListQueryParams(appliedFilters, {
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
      }),
    [appliedFilters, currentPage, searchQuery],
  )

  const { data, isLoading } = useExpertSubscriptions(listQueryParams)
  const tableColumnPreferencesQuery = useTableColumnPreferences(MEMBERSHIPS_MODULE_KEY)

  const upgradeMutation = useUpgradeSubscription()
  const downgradeMutation = useDowngradeSubscription()
  const extendMutation = useExtendSubscription()
  const cancelMutation = useCancelSubscription()

  const subscriptions = data?.data?.subscriptions ?? []
  const meta = data?.data?.meta

  const handleApplyFilters = useCallback(
    (values: FilterValues) => {
      toast.success('Filters applied')
      setAppliedFilters(values)
      setCurrentPage(1)
    },
    [setCurrentPage],
  )

  const handleExportData = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      const result = await fetchExpertSubscriptions(params)
      return { data: result.data?.subscriptions ?? [] }
    }
    return createExpertMembershipsFilteredExportHandler(
      fetchForExport,
      EXPORT_COLUMN_MAP,
      'expert_memberships_export',
      { search: searchQuery || undefined },
    )
  }, [searchQuery])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'expert-memberships',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const openAction = useCallback(
    (subscription: MembershipSubscription, action: typeof actionType) => {
      setSelectedSubscription(subscription)
      setActionType(action)
      setActiveDropdownId(null)
    },
    [],
  )

  const closeAction = () => {
    setSelectedSubscription(null)
    setActionType(null)
  }

  const renderActions = useCallback(
    (subscription: MembershipSubscription) => (
      <TableActionsDropdown
        label={`Actions for ${subscription.partnerName}`}
        isOpen={activeDropdownId === subscription._id}
        onOpenChange={(open) => setActiveDropdownId(open ? subscription._id : null)}
        menuWidth={180}
      >
        <TableActionsItem
          icon={<ClipboardList className="size-4" strokeWidth={1.85} />}
          onClick={() => navigate(`/memberships/experts/${subscription._id}`)}
        >
          View Details
        </TableActionsItem>
        <TableActionsItem
          icon={<Tag className="size-4" strokeWidth={1.85} />}
          onClick={() => {
            setActiveDropdownId(null)
            openTagModal(subscription._id)
          }}
        >
          Add Tags
        </TableActionsItem>
        <TableActionsItem
          icon={<CircleArrowUp className="size-4" strokeWidth={1.85} />}
          onClick={() => openAction(subscription, 'upgrade')}
        >
          Upgrade plan
        </TableActionsItem>
        {isSuperAdmin ? (
          <TableActionsItem
            icon={<Flag className="size-4" strokeWidth={1.85} />}
            onClick={() => {
              setActiveDropdownId(null)
              setSelectedSubscription(subscription)
              setEscalateOpen(true)
            }}
          >
            Escalate Upgrade
          </TableActionsItem>
        ) : null}
        <TableActionsItem
          icon={<CircleArrowDown className="size-4" strokeWidth={1.85} />}
          onClick={() => openAction(subscription, 'downgrade')}
        >
          Downgrade Plan
        </TableActionsItem>
        <TableActionsItem
          icon={<Waypoints className="size-4" strokeWidth={1.85} />}
          onClick={() => openAction(subscription, 'extend')}
        >
          Extend Plan
        </TableActionsItem>
        <TableActionsItem
          icon={<CancelPlanIcon />}
          className="text-brand-danger hover:bg-brand-danger/8 hover:text-brand-danger"
          onClick={() => openAction(subscription, 'cancel')}
        >
          Cancel Plan
        </TableActionsItem>
      </TableActionsDropdown>
    ),
    [activeDropdownId, isSuperAdmin, navigate, openAction, openTagModal],
  )

  const columns = useMemo<ColumnDef<MembershipSubscription>[]>(() => {
    const dataColumnsById = buildMembershipDataColumnsById()
    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_MEMBERSHIPS_VISIBLE_COLUMN_IDS

    const preferenceColumns = visibleIds.map((id) => dataColumnsById[id]).filter(Boolean)

    const actionsColumn: ColumnDef<MembershipSubscription> = {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => renderActions(row.original),
    }

    return [...preferenceColumns, actionsColumn]
  }, [renderActions, tableColumnPreferencesQuery.data])

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <SectionHeader
          title="Membership Management"
          subtitle="Manage expert membership subscriptions, lifecycle actions, and plan changes."
        />
        <Button
          className="ui-manage-metrics ui-cta ui-cta-primary h-9 w-full px-5 md:w-auto"
          onClick={() =>
            navigate(
              `/metrics/${MEMBERSHIPS_MODULE_KEY}?returnTo=/memberships/experts&section=dashboard`,
            )
          }
        >
          Manage Metrics
        </Button>
      </div>

      <MembershipStatsBar />

      <div className="flex justify-center">
        <div className="bg-brand-bg inline-flex flex-wrap items-center justify-center gap-1 rounded-xl border border-white/10 p-1">
          <TabLink to="/memberships/plans">Membership Plans</TabLink>
          <TabLink active to="/memberships/experts">
            Expert Memberships Management
          </TabLink>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={subscriptions}
        getRowId={(subscription) => subscription._id}
        isLoading={isLoading}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, ID or profession"
        onAdvancedFilter={onAdvancedFilter}
        advancedFilterVariant="primary"
        onExport={onExport}
        pagination={{
          page: currentPage,
          pageSize: meta?.limit ?? 10,
          totalItems: meta?.total ?? 0,
          totalPages: meta?.totalPages ?? 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="subscriptions"
      />

      {exportFilterModals}

      <EscalateMembershipUpgradeModal
        open={escalateOpen}
        subscription={selectedSubscription}
        onClose={() => {
          setEscalateOpen(false)
          setSelectedSubscription(null)
        }}
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

      <AddTagModal
        open={tagModalOpen}
        onClose={closeTagModal}
        initialTags={initialTags}
        onSubmit={saveTags}
      />
    </div>
  )
}

function CancelPlanIcon() {
  return (
    <span className="bg-brand-danger inline-flex size-4 items-center justify-center rounded-full">
      <X className="size-2.5 text-white" strokeWidth={3} />
    </span>
  )
}

function TabLink({
  children,
  to,
  active = false,
}: {
  children: ReactNode
  to?: string
  active?: boolean
}) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => {
        if (to) navigate(to)
      }}
      className={cn(
        'text-body-md-medium rounded-lg px-5 py-2.5 transition-colors',
        active ? 'bg-black text-white shadow-sm' : 'text-muted hover:text-white',
      )}
    >
      {children}
    </button>
  )
}
