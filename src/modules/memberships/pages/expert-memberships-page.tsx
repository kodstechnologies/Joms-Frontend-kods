import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { CircleArrowDown, CircleArrowUp, CircleX, ClipboardList, Waypoints } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import { MembershipActionModals } from '../components/membership-action-modals'
import { MembershipStatsBar } from '../components/membership-stats-bar'
import {
  DEFAULT_MEMBERSHIPS_VISIBLE_COLUMN_IDS,
  MEMBERSHIPS_MODULE_KEY,
} from '../config/membership-metrics.config'
import { EXPERT_MEMBERSHIP_SORT_FIELD_MAP } from '../config/membership-table-sort-fields'
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
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { Button } from '@/shared/components/ui/button'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { EXPERT_MEMBERSHIPS_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { cn } from '@/shared/lib/cn'
import type { FilterValues } from '@/shared/types/data-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildExpertMembershipsListQueryParams,
  createExpertMembershipsFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'

const MEMBERSHIP_SORT_FIELD_MAP = EXPERT_MEMBERSHIP_SORT_FIELD_MAP

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
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedSubscription, setSelectedSubscription] = useState<MembershipSubscription | null>(
    null,
  )
  const [actionType, setActionType] = useState<
    'upgrade' | 'downgrade' | 'extend' | 'cancel' | null
  >(null)

  const { currentPage, setCurrentPage } = useExpertMembershipStore()
  const serverSort = useServerTableSort({
    sortFieldMap: MEMBERSHIP_SORT_FIELD_MAP,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const listQueryParams = useMemo(
    () =>
      buildExpertMembershipsListQueryParams(appliedFilters, {
        page: currentPage,
        limit: 10,
        ...enhancedSearch.buildSearchParams(),
        ...serverSort.sortParams,
      }),
    [appliedFilters, currentPage, enhancedSearch, serverSort.sortParams],
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
      { search: enhancedSearch.globalSearch || undefined },
    )
  }, [enhancedSearch.globalSearch])

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
          icon={<CircleArrowUp className="size-4" strokeWidth={1.85} />}
          onClick={() => openAction(subscription, 'upgrade')}
        >
          Upgrade plan
        </TableActionsItem>
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
          icon={<CircleX className="size-4" strokeWidth={1.85} />}
          className="ui-table-actions-item-danger"
          onClick={() => openAction(subscription, 'cancel')}
        >
          Cancel Plan
        </TableActionsItem>
      </TableActionsDropdown>
    ),
    [activeDropdownId, navigate, openAction],
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

    return withServerSortMeta([...preferenceColumns, actionsColumn], MEMBERSHIP_SORT_FIELD_MAP)
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
          <ManageMetricsIcon />
          Manage Metrics
        </Button>
      </div>

      <MembershipStatsBar type="expert" />

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
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={EXPERT_MEMBERSHIPS_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by plan or expert name"
        onAdvancedFilter={onAdvancedFilter}
        advancedFilterVariant="primary"
        onExport={onExport}
        {...serverSort.dataTableSortProps}
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
          } catch (error) {
            toast.error(getApiErrorMessage(error, 'Failed to upgrade membership'))
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
          } catch (error) {
            toast.error(getApiErrorMessage(error, 'Failed to downgrade membership'))
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
          } catch (error) {
            toast.error(getApiErrorMessage(error, 'Failed to extend membership'))
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
          } catch (error) {
            toast.error(getApiErrorMessage(error, 'Failed to cancel membership'))
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
