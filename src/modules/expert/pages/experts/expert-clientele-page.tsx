import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  CreditCard,
  Eye,
  FileWarning,
  LayoutList,
  MessageSquare,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { ExportDataIcon, ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'
import { useAdminRefundFlow } from '@/modules/payments/hooks/use-admin-refund-flow'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import { useEscalationAssignees } from '@/modules/my-tasks/hooks/use-admin-escalation'
import {
  escalateConsultationApplication,
  escalateServiceApplication,
} from '@/modules/my-tasks/api/escalation-api'

import { fetchExpertClientele } from '../../api/expert-api'
import {
  DEFAULT_EXPERT_CLIENTELE_METRIC_IDS,
  EXPERT_CLIENTELE_METRIC_ID_SET,
  EXPERT_CLIENTELE_METRIC_IDS,
  EXPERT_CLIENTELE_MODULE_KEY,
} from '../../config/expert-clientele-metrics.config'
import {
  DEFAULT_EXPERT_CLIENTELE_VISIBLE_COLUMN_IDS,
  EXPERT_CLIENTELE_TABLE_COLUMNS_CATALOG,
} from '../../config/expert-clientele-table-columns.config'
import { orderByActiveMetricIds, useActiveMetricIds } from '../../hooks/use-active-metric-ids'
import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import { buildExpertClienteleMetricCards } from '../../utils/expert-clientele-metrics'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { Button } from '@/shared/components/ui/button'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { buildDefaultTableSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { EXPERT_CLIENTELE_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { cn } from '@/shared/lib/cn'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import type { FilterValues } from '@/shared/types/data-filter'
import {
  buildPrefixedListQueryParams,
  createPrefixedListExportHandler,
} from '@/shared/utils/export-filter-utils'
import { consultationBookingPath, serviceOrderDetailPath } from '../../lib/service-navigation'

type ClienteleItem = {
  bookingId: string
  clientId: string
  clientName: string
  whatsappNumber?: string | null
  bookingSource?: string
  listingType: string
  listingName?: string
  listingId?: string
  status: string
  pricingType: string
  tierName?: string | null
  bookingDate?: string | null
  startDate?: string | null
  endDate?: string | null
  completionDate?: string | null
  price: number
  orderValue?: number
  customPrice?: number | null
  discount?: number | null
  paymentId?: string | null
  transactionId?: string | null
  paymentMethod?: string | null
  paymentStatus?: string | null
  rating?: number | null
  reviewSubmitted?: boolean
  disputeRaised?: boolean
  disputeStatus?: string | null
  refundIssued?: boolean
  refundAmount?: number | null
  refundStatus?: string | null
  refundId?: string | null
  lastUpdated?: string | null
}

type Metrics = {
  servicesListed: number
  consultationsListed: number
  uniqueClients: number
  uniqueClientsTrend: number
  clientSatisfactionScore: number
  totalOrdersBookings: number
  activeOrdersBookings: number
  completedOrdersBookings: number
  cancelledOrdersBookings: number
  clientsByMembership: Record<string, number>
  repeatClientPercent: number
  nps: number
  npsTrend: number
  avgRating: number
  avgRatingTrend: number
  noOfReviews: number
  noOfReviewsTrend: number
}

const EMPTY_METRICS: Metrics = {
  servicesListed: 0,
  consultationsListed: 0,
  uniqueClients: 0,
  uniqueClientsTrend: 0,
  clientSatisfactionScore: 0,
  totalOrdersBookings: 0,
  activeOrdersBookings: 0,
  completedOrdersBookings: 0,
  cancelledOrdersBookings: 0,
  clientsByMembership: {},
  repeatClientPercent: 0,
  nps: 0,
  npsTrend: 0,
  avgRating: 0,
  avgRatingTrend: 0,
  noOfReviews: 0,
  noOfReviewsTrend: 0,
}

const EMPTY_CLIENTELE_ITEMS: ClienteleItem[] = []
const OPEN_CLIENT_DISPUTE_STATUSES = new Set(['Open', 'Under Review'])

const EXPERT_CLIENTELE_COLUMN_SORT_FIELDS = buildDefaultTableSortFieldMap(
  EXPERT_CLIENTELE_TABLE_COLUMNS_CATALOG.map((column) => column.id),
)

const CLIENTELE_EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (row: ClienteleItem) => string }
> = {
  bookingId: { header: 'Order / Booking ID', accessor: (row) => exportDisplayValue(row.bookingId) },
  clientId: { header: 'Client ID', accessor: (row) => exportDisplayValue(row.clientId) },
  clientName: { header: 'Client Name', accessor: (row) => exportDisplayValue(row.clientName) },
  bookingSource: {
    header: 'Booking Source',
    accessor: (row) => exportDisplayValue(row.bookingSource),
  },
  listingType: { header: 'Listing Type', accessor: (row) => exportDisplayValue(row.listingType) },
  listingName: { header: 'Listing Name', accessor: (row) => exportDisplayValue(row.listingName) },
  status: { header: 'Booking Status', accessor: (row) => exportDisplayValue(row.status) },
  pricingType: { header: 'Pricing Type', accessor: (row) => exportDisplayValue(row.pricingType) },
  bookingDate: {
    header: 'Booking Date',
    accessor: (row) => exportDisplayValue(formatDate(row.bookingDate)),
  },
  orderValue: {
    header: 'Order Value',
    accessor: (row) => exportDisplayValue(formatPrice(row.orderValue ?? row.price)),
  },
  paymentStatus: {
    header: 'Payment Status',
    accessor: (row) => exportDisplayValue(row.paymentStatus),
  },
  rating: {
    header: 'Rating',
    accessor: (row) =>
      row.rating == null ? '—' : exportDisplayValue(Number(row.rating).toFixed(1)),
  },
}

function MetricCardSkeleton() {
  return (
    <div className="rounded-brand-lg bg-brand-surface border border-white/[0.06] p-5">
      <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
      <div className="mt-3 h-8 w-16 animate-pulse rounded bg-white/10" />
      <div className="mt-2 h-3 w-24 animate-pulse rounded bg-white/5" />
    </div>
  )
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-brand-lg bg-brand-surface border border-white/[0.06] p-5">
      <p className="text-body-sm text-muted font-medium">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-white">{value}</p>
      {hint ? <p className="text-muted mt-2 text-xs">{hint}</p> : null}
    </div>
  )
}

const formatDate = (isoStr?: string | null, withTime = false) => {
  if (!isoStr) return '—'
  try {
    const d = new Date(isoStr)
    if (Number.isNaN(d.getTime())) return '—'
    if (withTime) {
      return d.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    }
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

const formatPrice = (val?: number | null) => {
  if (val == null || Number.isNaN(Number(val))) return '₹0.00'
  return `₹${Number(val).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

const statusClass = (status: string) => {
  const normalized = status.toLowerCase()
  if (normalized === 'completed') {
    return 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
  }
  if (normalized === 'in progress' || normalized === 'scheduled' || normalized === 'confirmed') {
    return 'border border-amber-500/30 bg-amber-500/15 text-amber-400'
  }
  if (normalized === 'disputed') {
    return 'border border-violet-500/30 bg-violet-500/15 text-violet-300'
  }
  if (normalized === 'pending') {
    return 'border border-sky-500/30 bg-sky-500/15 text-sky-300'
  }
  return 'border border-rose-500/30 bg-rose-500/15 text-rose-400'
}

export function ExpertClientelePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const expertId = id || ''

  const [page, setPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: EXPERT_CLIENTELE_COLUMN_SORT_FIELDS,
    onPageReset: () => setPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null)
  const [escalateTarget, setEscalateTarget] = useState<ClienteleItem | null>(null)
  const [escalateAdminNotes, setEscalateAdminNotes] = useState('')
  const [selectedEscalationOption, setSelectedEscalationOption] = useState('')
  const [isEscalating, setIsEscalating] = useState(false)
  const { data: assigneesData } = useEscalationAssignees('experts.*')

  const escalationOptions = useMemo<DecisionActionModalOption[]>(
    () =>
      (assigneesData?.data ?? []).map((assignee) => ({
        value: assignee.id,
        label: assignee.fullname || assignee.email || assignee.id,
      })),
    [assigneesData?.data],
  )

  const listQueryParams = useMemo(
    () =>
      buildPrefixedListQueryParams(appliedFilters, {
        page,
        limit: 10,
        ...serverSort.sortParams,
        ...enhancedSearch.buildSearchParams(),
      }),
    [appliedFilters, enhancedSearch, page, serverSort.sortParams],
  )

  const handleApplyFilters = useCallback((values: FilterValues) => {
    toast.success('Filters applied')
    setAppliedFilters(values)
    setPage(1)
  }, [])

  const tableColumnPreferencesQuery = useTableColumnPreferences(EXPERT_CLIENTELE_MODULE_KEY)
  const catalogColumnIds = useMemo(
    () => EXPERT_CLIENTELE_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_EXPERT_CLIENTELE_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
  })

  const handleExportData = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      const result = await fetchExpertClientele(expertId, params)
      return { data: result.data?.items ?? [] }
    }
    return createPrefixedListExportHandler(
      fetchForExport,
      CLIENTELE_EXPORT_COLUMN_MAP,
      'expert_clientele_export',
      { search: enhancedSearch.globalSearch || undefined },
      { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
    )
  }, [catalogColumnIds, enhancedSearch.globalSearch, expertId, exportColumnIds])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'expert-clientele',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const activeMetricIds = useActiveMetricIds(EXPERT_CLIENTELE_MODULE_KEY, [
    ...DEFAULT_EXPERT_CLIENTELE_METRIC_IDS,
  ])

  const filteredActiveMetricIds = useMemo(
    () =>
      sortIdsByCatalogOrder(
        activeMetricIds.filter((metricId) => EXPERT_CLIENTELE_METRIC_ID_SET.has(metricId)),
        EXPERT_CLIENTELE_METRIC_IDS,
      ),
    [activeMetricIds],
  )

  const manageMetricsPath = expertId
    ? `/metrics/expert-clientele?returnTo=${encodeURIComponent(`/experts/management/profile/${expertId}/clientele`)}`
    : '/metrics/expert-clientele'

  const {
    data: res,
    isLoading: loading,
    isError,
    error,
    refetch: refetchClientele,
  } = useQuery({
    queryKey: ['expert-clientele', expertId, listQueryParams],
    queryFn: () => fetchExpertClientele(expertId, listQueryParams),
    enabled: Boolean(expertId),
  })

  useEffect(() => {
    if (!isError) return
    toast.error(getApiErrorMessage(error, 'Failed to load expert clientele'))
  }, [isError, error])

  const d = res?.data
  const expertName = d?.expertName || '—'
  const metrics = useMemo<Metrics>(
    () => ({
      ...EMPTY_METRICS,
      ...(d?.metrics || {}),
      clientsByMembership: d?.metrics?.clientsByMembership || {},
    }),
    [d?.metrics],
  )
  const items: ClienteleItem[] = Array.isArray(d?.items) ? d.items : EMPTY_CLIENTELE_ITEMS
  const total = d?.pagination?.total ?? 0
  const totalPages = d?.pagination?.totalPages ?? 0

  const membershipHint = useMemo(() => {
    const entries = Object.entries(metrics.clientsByMembership || {})
    if (entries.length === 0) return 'No membership breakdown yet'
    return entries.map(([tier, count]) => `${tier}: ${count}`).join(', ')
  }, [metrics.clientsByMembership])

  const resolvePaymentId = useCallback((item: ClienteleItem) => {
    return String(item.paymentId || item.transactionId || '').trim()
  }, [])

  const closeEscalateModal = useCallback(() => {
    setEscalateTarget(null)
    setEscalateAdminNotes('')
    setSelectedEscalationOption('')
  }, [])

  const openCommunicate = useCallback(
    (channel: 'email' | 'push') => {
      if (!expertId) {
        toast.error('Expert partner ID is missing.')
        return
      }
      const params = new URLSearchParams({
        channel,
        audience: 'experts',
        partnerIds: expertId,
      })
      navigate(`/communication/create?${params.toString()}`)
    },
    [expertId, navigate],
  )

  const openViewPaymentDetails = useCallback(
    (item: ClienteleItem) => {
      const paymentId = resolvePaymentId(item)
      if (!paymentId) {
        toast.error('Payment ID is missing for this booking.')
        return
      }
      navigate(`/finance/revenue/${encodeURIComponent(paymentId)}`)
    },
    [navigate, resolvePaymentId],
  )

  const resolveClienteleOrderUrl = useCallback(
    (item: ClienteleItem) => {
      const listingId = String(item.listingId || '').trim()
      const orderId = String(item.bookingId || '').trim()
      if (!expertId || !listingId || !orderId) return ''

      const listingType = String(item.listingType || '')
        .trim()
        .toLowerCase()

      if (listingType.includes('consultation')) {
        return consultationBookingPath(expertId, listingId, orderId)
      }

      // Custom quotations / milestone proposals use the proposal order detail route.
      if (listingType.includes('custom') || item.bookingSource === 'Custom Order') {
        // For custom rows, listingId is the proposal id; service performance expects a service id.
        // Prefer proposal detail under the same service drilldown when possible.
        return serviceOrderDetailPath(expertId, listingId, orderId, 'proposal')
      }

      // Exact service order detail path (not bare expert profile).
      return serviceOrderDetailPath(expertId, listingId, orderId, 'order')
    },
    [expertId],
  )

  const handleEscalateSubmit = useCallback(async () => {
    if (!escalateTarget) return
    if (!expertId) {
      toast.error('Expert partner ID is missing.')
      return
    }
    if (!selectedEscalationOption) {
      toast.error('Please select a sub-admin to assign.')
      return
    }
    if (!escalateAdminNotes.trim()) {
      toast.error('Admin notes are required.')
      return
    }

    const orderUrl = resolveClienteleOrderUrl(escalateTarget)
    if (!orderUrl) {
      toast.error('Order / listing reference is missing for this booking. Cannot escalate.')
      return
    }

    const selectedAssignee = (assigneesData?.data ?? []).find(
      (item) => item.id === selectedEscalationOption,
    )
    const note = escalateAdminNotes.trim()
    const bookingId = String(escalateTarget.bookingId || '').trim()
    const paymentId = resolvePaymentId(escalateTarget)
    const listingId = String(escalateTarget.listingId || '').trim()
    const isConsultation = String(escalateTarget.listingType || '')
      .trim()
      .toLowerCase()
      .includes('consultation')

    setIsEscalating(true)
    try {
      // Escalate the listing entity so My Tasks opens order details (not partner profile/application).
      if (isConsultation) {
        await escalateConsultationApplication(listingId, {
          assigneeSubAdminId: selectedEscalationOption,
          assigneeName: selectedAssignee?.fullname || '',
          adminNote: note,
          entityTitle: `Clientele booking ${bookingId || '—'} — ${expertName}`,
          applicationUrl: orderUrl,
          escalationTarget: 'application',
          partnerId: expertId,
          metadata: {
            source: 'expert_clientele',
            bookingId,
            paymentId: paymentId || undefined,
            listingId,
            listingType: escalateTarget.listingType,
            clientId: escalateTarget.clientId,
            orderUrl,
          },
        })
      } else {
        await escalateServiceApplication(listingId, {
          assigneeSubAdminId: selectedEscalationOption,
          assigneeName: selectedAssignee?.fullname || '',
          adminNote: note,
          entityTitle: `Clientele order ${bookingId || '—'} — ${expertName}`,
          applicationUrl: orderUrl,
          escalationTarget: 'application',
          partnerId: expertId,
          metadata: {
            source: 'expert_clientele',
            bookingId,
            paymentId: paymentId || undefined,
            listingId,
            listingType: escalateTarget.listingType,
            clientId: escalateTarget.clientId,
            orderUrl,
          },
        })
      }
      toast.success('Escalated — assigned admin opens order details from My Tasks')
      closeEscalateModal()
      navigate(orderUrl)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to escalate booking.'))
    } finally {
      setIsEscalating(false)
    }
  }, [
    assigneesData?.data,
    closeEscalateModal,
    escalateAdminNotes,
    escalateTarget,
    expertId,
    expertName,
    navigate,
    resolveClienteleOrderUrl,
    resolvePaymentId,
    selectedEscalationOption,
  ])

  const { openRefund, refundModal } = useAdminRefundFlow({
    onRefunded: () => void refetchClientele(),
  })

  const openProcessRefund = useCallback(
    (item: ClienteleItem) => {
      const existingRefundId = String(item.refundId || '').trim()
      if (existingRefundId) {
        navigate(`/finance/refunds/${encodeURIComponent(existingRefundId)}`)
        return
      }

      openRefund({
        paymentId: resolvePaymentId(item),
        amount: Number(item.orderValue ?? item.price) || 0,
        reason: `Clientele booking ${item.bookingId}`,
        refundRequested:
          Boolean(item.disputeRaised) &&
          OPEN_CLIENT_DISPUTE_STATUSES.has(String(item.disputeStatus || '')),
      })
    },
    [navigate, openRefund, resolvePaymentId],
  )

  const dataColumnsById = useMemo<Record<string, ColumnDef<ClienteleItem>>>(
    () => ({
      'booking-id': {
        id: 'booking-id',
        accessorKey: 'bookingId',
        header: 'Order / Booking ID',
        cell: ({ row }) => (
          <span className="ui-table-id text-muted font-mono text-xs uppercase">
            {row.original.bookingId}
          </span>
        ),
      },
      'client-id': {
        id: 'client-id',
        accessorKey: 'clientId',
        header: 'Client ID',
        cell: ({ row }) => (
          <span className="ui-table-id text-muted font-mono text-xs uppercase">
            {row.original.clientId || '—'}
          </span>
        ),
      },
      'client-name': {
        id: 'client-name',
        accessorKey: 'clientName',
        header: 'Client Name',
        cell: ({ row }) => (
          <span className="font-medium text-white">{row.original.clientName || '—'}</span>
        ),
      },
      'booking-source': {
        id: 'booking-source',
        accessorKey: 'bookingSource',
        header: 'Booking Source',
        cell: ({ row }) => (
          <span className="inline-flex rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/80">
            {row.original.bookingSource || '—'}
          </span>
        ),
      },
      'listing-type': {
        id: 'listing-type',
        accessorKey: 'listingType',
        header: 'Listing Type',
        cell: ({ row }) => (
          <span className="inline-flex rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/80">
            {row.original.listingType || '—'}
          </span>
        ),
      },
      'listing-name': {
        id: 'listing-name',
        accessorKey: 'listingName',
        header: 'Listing Name',
        cell: ({ row }) => (
          <span className="text-muted text-sm">{row.original.listingName || '—'}</span>
        ),
      },
      'booking-status': {
        id: 'booking-status',
        accessorKey: 'status',
        header: 'Booking Status',
        cell: ({ row }) => {
          const status = row.original.status || '—'
          return (
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold capitalize',
                statusClass(status),
              )}
            >
              {status}
            </span>
          )
        },
      },
      'pricing-type': {
        id: 'pricing-type',
        accessorKey: 'pricingType',
        header: 'Pricing Type',
        cell: ({ row }) => (
          <span className="inline-flex rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/80">
            {row.original.pricingType || '—'}
          </span>
        ),
      },
      'booking-date': {
        id: 'booking-date',
        accessorKey: 'bookingDate',
        header: 'Booking Date',
        cell: ({ row }) => (
          <span className="text-muted text-xs">{formatDate(row.original.bookingDate)}</span>
        ),
      },
      'order-value': {
        id: 'order-value',
        accessorKey: 'orderValue',
        header: 'Order Value',
        cell: ({ row }) => (
          <span className="font-semibold text-white">
            {formatPrice(row.original.orderValue ?? row.original.price)}
          </span>
        ),
      },
      'payment-status': {
        id: 'payment-status',
        accessorKey: 'paymentStatus',
        header: 'Payment Status',
        cell: ({ row }) => (
          <span className="inline-flex rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/80">
            {row.original.paymentStatus || '—'}
          </span>
        ),
      },
      rating: {
        id: 'rating',
        accessorKey: 'rating',
        header: 'Rating',
        cell: ({ row }) => (
          <span className="text-muted text-sm">
            {row.original.rating == null ? '—' : `★ ${Number(row.original.rating).toFixed(1)}`}
          </span>
        ),
      },
    }),
    [],
  )

  const columns = useMemo<ColumnDef<ClienteleItem>[]>(() => {
    const catalogIds = EXPERT_CLIENTELE_TABLE_COLUMNS_CATALOG.map((column) => column.id)
    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_EXPERT_CLIENTELE_VISIBLE_COLUMN_IDS
    const preferenceColumns = sortIdsByCatalogOrder(
      visibleIds.filter((id) => catalogIds.includes(id)),
      catalogIds,
    )
      .map((id) => dataColumnsById[id])
      .filter(Boolean)

    const actionsColumn: ColumnDef<ClienteleItem> = {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex justify-end">
            <TableActionsDropdown
              label="Booking actions"
              isOpen={activeActionMenu === item.bookingId}
              onOpenChange={(open) => setActiveActionMenu(open ? item.bookingId : null)}
              menuWidth={240}
              maxVisibleItems={8}
            >
              <TableActionsItem
                tone="light"
                icon={<Eye className="size-3.5" aria-hidden="true" />}
                onClick={() => {
                  setActiveActionMenu(null)
                  const orderUrl = resolveClienteleOrderUrl(item)
                  if (!orderUrl) {
                    toast.error('Order details are not available for this booking.')
                    return
                  }
                  navigate(orderUrl)
                }}
              >
                View Details
              </TableActionsItem>
              <TableActionsItem
                tone="light"
                icon={<User className="size-3.5" aria-hidden="true" />}
                onClick={() => {
                  setActiveActionMenu(null)
                  if (item.clientId && item.clientId !== '—') {
                    toast.message(`Client ID: ${item.clientId}`)
                  } else {
                    toast.error('Client profile is not available for this booking.')
                  }
                }}
              >
                View Client Profile
              </TableActionsItem>
              <TableActionsItem
                tone="light"
                icon={<LayoutList className="size-3.5" aria-hidden="true" />}
                onClick={() => {
                  setActiveActionMenu(null)
                  if (item.listingType === 'Consultation' && item.listingId) {
                    navigate(
                      `/services/management/view/${item.listingId}?type=Consultation&partnerId=${expertId}`,
                    )
                  } else if (item.listingId) {
                    navigate(
                      `/services/management/view/${item.listingId}?type=Service&partnerId=${expertId}`,
                    )
                  } else {
                    toast.error('Listing is not available for this booking.')
                  }
                }}
              >
                View Listing
              </TableActionsItem>
              <TableActionsItem
                tone="light"
                icon={<CreditCard className="size-3.5" aria-hidden="true" />}
                onClick={() => {
                  setActiveActionMenu(null)
                  openViewPaymentDetails(item)
                }}
              >
                View Payment Details
              </TableActionsItem>
              <TableActionsItem
                tone="light"
                icon={<MessageSquare className="size-3.5" aria-hidden="true" />}
                onClick={() => {
                  setActiveActionMenu(null)
                  openCommunicate('email')
                }}
              >
                Communicate with Expert
              </TableActionsItem>
              {item.disputeRaised ? (
                <TableActionsItem
                  tone="light"
                  icon={<FileWarning className="size-3.5" aria-hidden="true" />}
                  onClick={() => {
                    setActiveActionMenu(null)
                    toast.message(
                      item.disputeStatus
                        ? `Dispute status: ${item.disputeStatus}`
                        : 'Dispute linked to this booking',
                    )
                  }}
                >
                  View Dispute
                </TableActionsItem>
              ) : null}
              <TableActionsItem
                tone="light"
                icon={<AlertTriangle className="size-3.5" aria-hidden="true" />}
                onClick={() => {
                  setActiveActionMenu(null)
                  setEscalateTarget(item)
                }}
              >
                Escalate
              </TableActionsItem>
              <TableActionsItem
                tone="light"
                icon={<Banknote className="size-3.5" aria-hidden="true" />}
                onClick={() => {
                  setActiveActionMenu(null)
                  openProcessRefund(item)
                }}
              >
                Process Refund
              </TableActionsItem>
              <TableActionsItem
                tone="light"
                icon={<ExportDataIcon className="size-3.5" />}
                onClick={() => {
                  setActiveActionMenu(null)
                  onExport()
                }}
              >
                Export Booking Record
              </TableActionsItem>
            </TableActionsDropdown>
          </div>
        )
      },
    }

    return withServerSortMeta(
      [...preferenceColumns, actionsColumn],
      EXPERT_CLIENTELE_COLUMN_SORT_FIELDS,
    )
  }, [
    activeActionMenu,
    dataColumnsById,
    expertId,
    navigate,
    onExport,
    openCommunicate,
    openProcessRefund,
    openViewPaymentDetails,
    resolveClienteleOrderUrl,
    tableColumnPreferencesQuery.data,
  ])

  const metricCards = useMemo(() => {
    const allCards = buildExpertClienteleMetricCards(metrics, membershipHint)
    return orderByActiveMetricIds(allCards, filteredActiveMetricIds)
  }, [filteredActiveMetricIds, membershipHint, metrics])

  return (
    <div className="space-y-7 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-brand-surface text-muted grid size-8 place-items-center rounded-lg border border-white/10 transition-colors hover:bg-white/5"
            >
              <ArrowLeft className="size-4" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Clientele</h1>
          </div>
          <p className="text-body-md text-muted mt-1.5 font-medium">
            Expert:{' '}
            {loading ? (
              <span className="inline-block h-4 w-28 animate-pulse rounded bg-white/10 align-middle" />
            ) : (
              <span className="font-semibold text-white">{expertName}</span>
            )}
          </p>
        </div>

        <Button
          type="button"
          onClick={() => navigate(manageMetricsPath)}
          className="ui-manage-metrics"
        >
          <ManageMetricsIcon />
          Manage Metrics
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading
          ? Array.from({ length: filteredActiveMetricIds.length || 12 }).map((_, index) => (
              <MetricCardSkeleton key={`clientele-metric-skeleton-${index}`} />
            ))
          : metricCards.map((card) => (
              <MetricCard key={card.id} label={card.label} value={card.value} hint={card.hint} />
            ))}
      </div>

      <DataTable
        columns={columns}
        data={items}
        getRowId={(row) => row.bookingId}
        isLoading={loading}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={EXPERT_CLIENTELE_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by name, ID or listing"
        resourceLabel="bookings"
        onAdvancedFilter={onAdvancedFilter}
        advancedFilterVariant="primary"
        onExport={onExport}
        {...serverSort.dataTableSortProps}
        pagination={{
          page,
          pageSize: 10,
          totalItems: total,
          totalPages,
          onPageChange: setPage,
        }}
      />
      {exportFilterModals}
      {refundModal}

      <DecisionActionModal
        open={Boolean(escalateTarget)}
        variant="escalate"
        title="Escalate"
        description="Are you sure you want to escalate this booking? The assigned sub-admin will open the order details page from My Tasks."
        submitLabel="Escalate"
        escalationOptions={escalationOptions}
        selectedEscalationOption={selectedEscalationOption}
        onEscalationOptionChange={setSelectedEscalationOption}
        adminNotes={escalateAdminNotes}
        onAdminNotesChange={setEscalateAdminNotes}
        onClose={closeEscalateModal}
        onSubmit={() => {
          void handleEscalateSubmit()
        }}
        isSubmitting={isEscalating}
      />
    </div>
  )
}
