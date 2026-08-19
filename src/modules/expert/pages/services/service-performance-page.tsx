import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, Check, SlidersHorizontal, Star, User, Users, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { StatCard } from '@/shared/components/dashboard/stat-card'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import {
  AdvancedFilterSheet,
  ExportDataModal,
} from '@/shared/components/advanced-filter/module-filter-modals'
import { createEmptyFilterValuesForConfig } from '@/shared/components/advanced-filter/filter-utils'
import type { FilterValues, ModuleFilterConfig, RangeFilterValue } from '@/shared/types/data-filter'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { exportDataToFile } from '@/shared/utils/export-utils'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

import {
  DEFAULT_SERVICE_PERFORMANCE_METRIC_IDS,
  SERVICE_PERFORMANCE_MAX_ACTIVE_METRICS,
  SERVICE_PERFORMANCE_METRIC_IDS,
  SERVICE_PERFORMANCE_MODULE_KEY,
} from '../../config/service-performance-metrics.config'
import { SERVICE_PERFORMANCE_TABLE_COLUMNS_CATALOG } from '../../config/service-performance-table-columns.config'
import { orderByActiveMetricIds, useActiveMetricIds } from '../../hooks/use-active-metric-ids'
import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'
import { useServiceOrders, useServicePerformance } from '../../hooks/use-service-drilldown'
import { buildServicePerformanceCards } from '../../utils/service-performance-metrics'
import { PaymentDetailsModal } from '../../components/service-drilldown/payment-details-modal'
import { ShimmerBlock, StatusPill } from '../../components/service-drilldown/drilldown-primitives'
import {
  DASH,
  formatCurrency,
  formatDate,
  formatDateTime,
  titleCase,
} from '../../components/service-drilldown/drilldown-format'
import { serviceDetailPath, serviceOrderDetailPath } from '../../lib/service-navigation'
import type { ServiceOrderRow, ServiceOrdersQuery } from '../../type/service-drilldown'

const PAGE_SIZE = 10

const DESIGN_VISIBLE_COLUMN_IDS = [
  'client-id',
  'client-name',
  'listing-type',
  'order-status',
  'pricing-type',
  'start-date',
  'end-date',
  'price',
] as const

const METRIC_ICONS = {
  activeClients: Users,
  completedOrders: Check,
  averageRating: Star,
  terminatedOrders: X,
} as const

const listingTypeLabel = (order: ServiceOrderRow) =>
  order.engagementType === 'proposal' ? 'Custom' : 'Service'

const formatClientCode = (clientId?: string | null) => {
  if (!clientId) return DASH
  const compact = clientId.replace(/-/g, '').slice(-5).toUpperCase()
  return `CLT-${compact}`
}

const buildFilterConfig = (options: {
  orderStatus: string[]
  paymentMethod: string[]
}): ModuleFilterConfig => ({
  moduleKey: SERVICE_PERFORMANCE_MODULE_KEY,
  moduleName: 'Service Performance',
  sections: [
    {
      id: 'by-order',
      title: 'By Order',
      defaultExpanded: true,
      fields: [
        { id: 'dateRange', label: 'Date Range', type: 'date-range' },
        {
          id: 'orderStatus',
          label: 'Order Status',
          type: 'checkbox-group',
          options: options.orderStatus.map((value) => ({ value, label: titleCase(value) })),
        },
        { id: 'priceRange', label: 'Price Range', type: 'number-range' },
        { id: 'ratingRange', label: 'Rating Range', type: 'number-range' },
      ],
    },
    {
      id: 'by-payment',
      title: 'By Payment',
      fields: [
        {
          id: 'paymentMethod',
          label: 'Payment Method',
          type: 'checkbox-group',
          options: options.paymentMethod.map((value) => ({ value, label: titleCase(value) })),
        },
        {
          id: 'refundStatus',
          label: 'Refund Status',
          type: 'checkbox-group',
          options: [
            { value: 'none', label: 'No Refund' },
            { value: 'processed', label: 'Refunded' },
            { value: 'pending', label: 'Refund Pending' },
            { value: 'failed', label: 'Refund Failed' },
          ],
        },
        {
          id: 'disputeStatus',
          label: 'Dispute Status',
          type: 'checkbox-group',
          options: [
            { value: 'disputed', label: 'Disputed' },
            { value: 'not_disputed', label: 'Not Disputed' },
          ],
        },
      ],
    },
  ],
})

const asRange = (value: FilterValues[string] | undefined): RangeFilterValue =>
  value && typeof value === 'object' && 'from' in value
    ? (value as RangeFilterValue)
    : { from: '', to: '' }

const asList = (value: FilterValues[string] | undefined): string[] =>
  Array.isArray(value) ? value : []

const buildQueryFromFilters = (values: FilterValues): ServiceOrdersQuery => {
  const dateRange = asRange(values.dateRange)
  const priceRange = asRange(values.priceRange)
  const ratingRange = asRange(values.ratingRange)
  const disputeStatus = asList(values.disputeStatus)

  return {
    dateFrom: dateRange.from || undefined,
    dateTo: dateRange.to || undefined,
    minPrice: priceRange.from || undefined,
    maxPrice: priceRange.to || undefined,
    minRating: ratingRange.from || undefined,
    maxRating: ratingRange.to || undefined,
    orderStatus: asList(values.orderStatus).join(',') || undefined,
    paymentMethod: asList(values.paymentMethod).join(',') || undefined,
    refundStatus: asList(values.refundStatus).join(',') || undefined,
    disputeStatus: disputeStatus.length === 1 ? disputeStatus[0] : undefined,
  }
}

export function ServicePerformancePage() {
  const { expertId = '', serviceId = '' } = useParams<{ expertId: string; serviceId: string }>()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [appliedFilters, setAppliedFilters] = useState<ServiceOrdersQuery>({})
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null)
  const [paymentModalOrder, setPaymentModalOrder] = useState<ServiceOrderRow | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)

  const performanceQuery = useServicePerformance(serviceId)
  const performance = performanceQuery.data?.data

  const ordersQuery = useServiceOrders(serviceId, {
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    ...appliedFilters,
  })
  const ordersData = ordersQuery.data?.data
  const orders = useMemo(() => ordersData?.orders ?? [], [ordersData?.orders])

  const filterConfig = useMemo(
    () =>
      buildFilterConfig({
        orderStatus: ordersData?.filterOptions.orderStatus ?? [],
        paymentMethod: ordersData?.filterOptions.paymentMethod ?? [],
      }),
    [ordersData?.filterOptions.orderStatus, ordersData?.filterOptions.paymentMethod],
  )

  const [filterValues, setFilterValues] = useState<FilterValues>(() =>
    createEmptyFilterValuesForConfig(buildFilterConfig({ orderStatus: [], paymentMethod: [] })),
  )

  const tableColumnPreferencesQuery = useTableColumnPreferences(SERVICE_PERFORMANCE_MODULE_KEY)
  const activeMetricIds = useActiveMetricIds(SERVICE_PERFORMANCE_MODULE_KEY, [
    ...DEFAULT_SERVICE_PERFORMANCE_METRIC_IDS,
  ])

  const orderedMetricIds = useMemo(
    () => sortIdsByCatalogOrder(activeMetricIds, SERVICE_PERFORMANCE_METRIC_IDS),
    [activeMetricIds],
  )

  const metricCards = useMemo(
    () =>
      orderByActiveMetricIds(buildServicePerformanceCards(performance), orderedMetricIds).slice(
        0,
        SERVICE_PERFORMANCE_MAX_ACTIVE_METRICS,
      ),
    [orderedMetricIds, performance],
  )

  const manageMetricsPath = `/metrics/service-performance?returnTo=${encodeURIComponent(
    `/experts/management/profile/${expertId}/service/${serviceId}/performance`,
  )}`

  const openOrderDetail = useCallback(
    (order: ServiceOrderRow) => {
      navigate(serviceOrderDetailPath(expertId, serviceId, order.id, order.engagementType))
    },
    [expertId, navigate, serviceId],
  )

  const handleExport = useCallback(
    (format = 'excel') => {
      if (orders.length === 0) {
        toast.error('No orders available to export.')
        return
      }

      const headers = [
        'Order ID',
        'Client ID',
        'Client Name',
        'Order Status',
        'Ordered At',
        'Start Date',
        'End Date',
        'Delivery Duration',
        'Price',
        'Payment ID',
        'Payment Method',
        'Transaction ID',
        'Rating',
        'Payout Status',
        'Disputed',
        'Dispute Raised At',
        'Dispute End Date',
        'Dispute / Ticket ID',
        'Refund Issued',
        'Refund Amount',
        'Refund Status',
        'Refunded At',
      ]

      const rows = orders.map((order) => [
        order.orderId,
        order.clientId,
        order.clientName || DASH,
        titleCase(order.orderStatus),
        formatDate(order.orderedAt),
        formatDate(order.startDate),
        formatDate(order.endDate),
        order.deliveryDuration || DASH,
        String(order.price),
        order.paymentId || DASH,
        order.paymentMethod || DASH,
        order.transactionId || DASH,
        order.rating === null ? DASH : String(order.rating),
        order.payoutStatusLabel || DASH,
        order.disputed ? 'Yes' : 'No',
        formatDate(order.disputeRaisedAt),
        formatDate(order.disputeEndDate),
        order.disputeId || order.supportTicketId || DASH,
        order.refundIssued ? 'Yes' : 'No',
        order.refundAmount === null ? DASH : String(order.refundAmount),
        order.refundStatus || DASH,
        formatDate(order.refundedAt),
      ])

      exportDataToFile(headers, rows, format, 'service_orders_export')
      toast.success(`Exported ${orders.length} order(s)`)
      setIsExportOpen(false)
    },
    [orders],
  )

  const dataColumnsById = useMemo<Record<string, ColumnDef<ServiceOrderRow>>>(
    () => ({
      'order-id': {
        id: 'order-id',
        header: 'Order ID',
        cell: ({ row }) => (
          <span className="ui-table-id text-muted font-mono text-xs uppercase">
            {row.original.orderId.slice(-8)}
          </span>
        ),
      },
      'client-id': {
        id: 'client-id',
        header: 'Client ID',
        cell: ({ row }) => (
          <span className="ui-table-id text-muted font-mono text-xs uppercase">
            {formatClientCode(row.original.clientId)}
          </span>
        ),
      },
      'client-name': {
        id: 'client-name',
        header: 'Name',
        cell: ({ row }) => (
          <span className="font-medium text-white">{row.original.clientName || DASH}</span>
        ),
      },
      'listing-type': {
        id: 'listing-type',
        header: 'Listing Type',
        cell: ({ row }) => (
          <span className="text-sm text-white">{listingTypeLabel(row.original)}</span>
        ),
      },
      'order-status': {
        id: 'order-status',
        header: 'Status',
        cell: ({ row }) => <StatusPill status={row.original.orderStatus} />,
      },
      'pricing-type': {
        id: 'pricing-type',
        header: 'Pricing Type',
        cell: ({ row }) => (
          <span className="text-sm text-white">{titleCase(row.original.pricingType)}</span>
        ),
      },
      'client-source': {
        id: 'client-source',
        header: 'Client Source',
        cell: ({ row }) => (
          <span className="text-muted text-sm">{row.original.clientSource || DASH}</span>
        ),
      },
      'client-phone': {
        id: 'client-phone',
        header: 'Client Phone',
        cell: ({ row }) => (
          <span className="text-muted text-sm">{row.original.clientPhone || DASH}</span>
        ),
      },
      'ordered-at': {
        id: 'ordered-at',
        header: 'Ordered At',
        cell: ({ row }) => (
          <span className="text-muted text-xs">{formatDate(row.original.orderedAt)}</span>
        ),
      },
      'start-date': {
        id: 'start-date',
        header: 'Start Date',
        cell: ({ row }) => (
          <span className="text-muted text-xs">{formatDateTime(row.original.startDate)}</span>
        ),
      },
      'end-date': {
        id: 'end-date',
        header: 'End Date',
        cell: ({ row }) => (
          <span className="text-muted text-xs">{formatDateTime(row.original.endDate)}</span>
        ),
      },
      'delivery-duration': {
        id: 'delivery-duration',
        header: 'Delivery Duration',
        cell: ({ row }) => (
          <span className="text-muted text-sm">{row.original.deliveryDuration || DASH}</span>
        ),
      },
      price: {
        id: 'price',
        header: 'Price',
        cell: ({ row }) => (
          <span className="font-semibold text-white">
            {formatCurrency(row.original.price, row.original.currency)}
          </span>
        ),
      },
      'payment-id': {
        id: 'payment-id',
        header: 'Payment ID',
        cell: ({ row }) => (
          <span className="ui-table-id text-muted font-mono text-xs">
            {row.original.paymentId || DASH}
          </span>
        ),
      },
      'payment-method': {
        id: 'payment-method',
        header: 'Payment Method',
        cell: ({ row }) => (
          <span className="text-muted text-sm">
            {row.original.paymentMethod ? titleCase(row.original.paymentMethod) : DASH}
          </span>
        ),
      },
      'transaction-id': {
        id: 'transaction-id',
        header: 'Transaction ID',
        cell: ({ row }) => (
          <span className="ui-table-id text-muted font-mono text-xs">
            {row.original.transactionId || DASH}
          </span>
        ),
      },
      rating: {
        id: 'rating',
        header: 'Rating',
        cell: ({ row }) => (
          <span className="text-muted text-sm">
            {row.original.rating === null ? DASH : `★ ${row.original.rating.toFixed(1)}`}
          </span>
        ),
      },
      'payout-status': {
        id: 'payout-status',
        header: 'Payout Status',
        cell: ({ row }) =>
          row.original.payoutStatus ? (
            <StatusPill
              status={row.original.payoutStatus}
              label={row.original.payoutStatusLabel || undefined}
            />
          ) : (
            <span className="text-muted text-sm">{DASH}</span>
          ),
      },
      disputed: {
        id: 'disputed',
        header: 'Disputed',
        cell: ({ row }) => (
          <span className="text-muted text-sm">{row.original.disputed ? 'Yes' : 'No'}</span>
        ),
      },
      'dispute-period-lapsed': {
        id: 'dispute-period-lapsed',
        header: 'Dispute Period Lapsed',
        cell: ({ row }) => (
          <span className="text-muted text-sm">
            {row.original.disputePeriodLapsed === null
              ? DASH
              : row.original.disputePeriodLapsed
                ? 'Yes'
                : 'No'}
          </span>
        ),
      },
      'dispute-end-date': {
        id: 'dispute-end-date',
        header: 'Dispute End Date',
        cell: ({ row }) => (
          <span className="text-muted text-xs">{formatDate(row.original.disputeEndDate)}</span>
        ),
      },
      'dispute-raised-at': {
        id: 'dispute-raised-at',
        header: 'Dispute Raised At',
        cell: ({ row }) => (
          <span className="text-muted text-xs">{formatDate(row.original.disputeRaisedAt)}</span>
        ),
      },
      'dispute-ticket-id': {
        id: 'dispute-ticket-id',
        header: 'Dispute / Ticket ID',
        cell: ({ row }) => (
          <span className="ui-table-id text-muted font-mono text-xs">
            {row.original.disputeId || row.original.supportTicketId || DASH}
          </span>
        ),
      },
      'refund-issued': {
        id: 'refund-issued',
        header: 'Refund Issued',
        cell: ({ row }) => (
          <span className="text-muted text-sm">{row.original.refundIssued ? 'Yes' : 'No'}</span>
        ),
      },
      'refund-amount': {
        id: 'refund-amount',
        header: 'Refund Amount',
        cell: ({ row }) => (
          <span className="text-muted text-sm">
            {row.original.refundAmount === null
              ? DASH
              : formatCurrency(row.original.refundAmount, row.original.currency)}
          </span>
        ),
      },
      'refund-status': {
        id: 'refund-status',
        header: 'Refund Status',
        cell: ({ row }) =>
          row.original.refundStatus ? (
            <StatusPill status={row.original.refundStatus} />
          ) : (
            <span className="text-muted text-sm">{DASH}</span>
          ),
      },
      'refunded-at': {
        id: 'refunded-at',
        header: 'Refunded At',
        cell: ({ row }) => (
          <span className="text-muted text-xs">{formatDate(row.original.refundedAt)}</span>
        ),
      },
    }),
    [],
  )

  const columns = useMemo<ColumnDef<ServiceOrderRow>[]>(() => {
    const catalogIds = SERVICE_PERFORMANCE_TABLE_COLUMNS_CATALOG.map((column) => column.id)
    const savedIds = tableColumnPreferencesQuery.data?.visibleColumnIds ?? []
    const visibleIds =
      savedIds.includes('listing-type') && savedIds.includes('pricing-type')
        ? savedIds.filter((id) => catalogIds.includes(id))
        : [...DESIGN_VISIBLE_COLUMN_IDS]

    const preferenceColumns = sortIdsByCatalogOrder(visibleIds, catalogIds)
      .map((id) => dataColumnsById[id])
      .filter(Boolean)

    const actionsColumn: ColumnDef<ServiceOrderRow> = {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="flex justify-end">
            <TableActionsDropdown
              label="Order actions"
              isOpen={activeActionMenu === order.id}
              onOpenChange={(open) => setActiveActionMenu(open ? order.id : null)}
            >
              <TableActionsItem
                tone="light"
                icon={<User className="size-3.5" />}
                onClick={() => {
                  setActiveActionMenu(null)
                  openOrderDetail(order)
                }}
              >
                View Details
              </TableActionsItem>
              <TableActionsItem
                tone="light"
                icon={<User className="size-3.5" />}
                onClick={() => {
                  setActiveActionMenu(null)
                  setPaymentModalOrder(order)
                }}
              >
                View Payment Details
              </TableActionsItem>
            </TableActionsDropdown>
          </div>
        )
      },
    }

    return [...preferenceColumns, actionsColumn]
  }, [activeActionMenu, dataColumnsById, openOrderDetail, tableColumnPreferencesQuery.data])

  const serviceTitle = performance?.service.title || ordersData?.service.title || 'Service'

  return (
    <div className="space-y-7 pb-10">
      <PaymentDetailsModal
        open={Boolean(paymentModalOrder)}
        orderId={paymentModalOrder?.id ?? null}
        orderType={paymentModalOrder?.engagementType}
        fallbackService={{
          title: paymentModalOrder?.title || serviceTitle,
          category: ordersData?.service.category,
          pricingType: paymentModalOrder?.pricingType || ordersData?.service.pricingType,
          image: paymentModalOrder?.serviceImage || ordersData?.service.image,
        }}
        onClose={() => setPaymentModalOrder(null)}
      />

      <AdvancedFilterSheet
        open={isFilterOpen}
        config={filterConfig}
        values={filterValues}
        onChange={(fieldId, value) =>
          setFilterValues((current) => ({ ...current, [fieldId]: value }))
        }
        onClose={() => setIsFilterOpen(false)}
        onReset={() => {
          const empty = createEmptyFilterValuesForConfig(filterConfig)
          setFilterValues(empty)
          setAppliedFilters({})
          setPage(1)
          toast.message('Filters reset')
        }}
        onApply={() => {
          setAppliedFilters(buildQueryFromFilters(filterValues))
          setPage(1)
          setIsFilterOpen(false)
        }}
      />

      <ExportDataModal
        open={isExportOpen}
        config={filterConfig}
        values={filterValues}
        onChange={(fieldId, value) =>
          setFilterValues((current) => ({ ...current, [fieldId]: value }))
        }
        onClose={() => setIsExportOpen(false)}
        onExport={handleExport}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigateBackOrFallback(navigate, serviceDetailPath(expertId, serviceId))
              }
              className="bg-brand-surface text-muted grid size-8 place-items-center rounded-lg border border-white/10 transition-colors hover:bg-white/5"
            >
              <ArrowLeft className="size-4" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Service Performance
            </h1>
          </div>
          <p className="text-muted mt-1.5 pl-11 text-sm">
            {performanceQuery.isLoading ? (
              <span className="inline-block h-4 w-40 animate-pulse rounded bg-white/10 align-middle" />
            ) : (
              serviceTitle
            )}
          </p>
        </div>

        <Button
          type="button"
          onClick={() => navigate(manageMetricsPath)}
          className="ui-manage-metrics h-10 rounded-xl px-5 text-sm font-semibold sm:w-auto"
        >
          <SlidersHorizontal className="size-4" />
          Manage Metrics
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {performanceQuery.isLoading
          ? Array.from({ length: SERVICE_PERFORMANCE_MAX_ACTIVE_METRICS }).map((_, index) => (
              <ShimmerBlock key={`kpi-skeleton-${index}`} className="h-28 w-full" />
            ))
          : metricCards.map((card) => (
              <StatCard
                key={card.id}
                title={card.label}
                value={card.value}
                icon={METRIC_ICONS[card.id as keyof typeof METRIC_ICONS]}
                hint={card.notInstrumented ? card.hint : undefined}
                trend={
                  card.deltaPercent === null || card.notInstrumented
                    ? undefined
                    : {
                        direction: card.deltaPercent >= 0 ? 'up' : 'down',
                        percentage: Math.abs(card.deltaPercent),
                        label: 'vs last month',
                      }
                }
              />
            ))}
      </div>

      <DataTable
        columns={columns}
        data={orders}
        getRowId={(row) => row.id}
        isLoading={ordersQuery.isLoading}
        searchValue={search}
        onSearchChange={(value) => {
          setPage(1)
          setSearch(value)
        }}
        searchPlaceholder="Search by name, ID or profession"
        resourceLabel="orders"
        emptyMessage="No orders placed for this service yet."
        showAdvancedFilter
        showExport
        onAdvancedFilter={() => setIsFilterOpen(true)}
        onExport={() => setIsExportOpen(true)}
        onRowClick={openOrderDetail}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          totalItems: ordersData?.total ?? 0,
          totalPages: ordersData?.pages ?? 0,
          onPageChange: setPage,
        }}
      />
    </div>
  )
}
