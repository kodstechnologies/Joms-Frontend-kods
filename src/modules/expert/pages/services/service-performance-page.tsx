import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Check,
  CreditCard,
  Eye,
  MessageSquare,
  Receipt,
  Star,
  Users,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { ExportDataIcon, ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { useAdminRefundFlow } from '@/modules/payments/hooks/use-admin-refund-flow'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import { useEscalationAssignees } from '@/modules/my-tasks/hooks/use-admin-escalation'
import { escalateServiceApplication } from '@/modules/my-tasks/api/escalation-api'

import { Button } from '@/shared/components/ui/button'
import { StatCard } from '@/shared/components/dashboard/stat-card'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { SERVICE_PERFORMANCE_COLUMN_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { SERVICE_PERFORMANCE_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { buildServicePerformanceQueryParams } from '@/shared/utils/export-filter-utils'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { exportDataToFile } from '@/shared/utils/export-utils'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

import {
  DEFAULT_SERVICE_PERFORMANCE_METRIC_IDS,
  SERVICE_PERFORMANCE_MAX_ACTIVE_METRICS,
  SERVICE_PERFORMANCE_METRIC_IDS,
  SERVICE_PERFORMANCE_MODULE_KEY,
} from '../../config/service-performance-metrics.config'
import {
  DEFAULT_SERVICE_PERFORMANCE_VISIBLE_COLUMN_IDS,
  SERVICE_PERFORMANCE_LEGACY_COLUMN_ID_MAP,
  SERVICE_PERFORMANCE_TABLE_COLUMNS_CATALOG,
} from '../../config/service-performance-table-columns.config'
import { orderByActiveMetricIds, useActiveMetricIds } from '../../hooks/use-active-metric-ids'
import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'
import { useServiceOrders, useServicePerformance } from '../../hooks/use-service-drilldown'
import { buildServicePerformanceCards } from '../../utils/service-performance-metrics'
import { PaymentDetailsModal } from '../../components/service-drilldown/payment-details-modal'
import {
  ShimmerBlock,
  TableStatusPill,
} from '../../components/service-drilldown/drilldown-primitives'
import {
  DASH,
  formatCurrency,
  formatDate,
  titleCase,
} from '../../components/service-drilldown/drilldown-format'
import { renderTableDateTimeCell } from '@/shared/components/table/table-datetime-column'
import { serviceDetailPath, serviceOrderDetailPath } from '../../lib/service-navigation'
import type { ServiceOrderRow, ServiceOrdersQuery } from '../../type/service-drilldown'

const PAGE_SIZE = 10

const METRIC_ICONS: Record<string, typeof Users> = {
  activeClients: Users,
  completedOrders: Check,
  averageRating: Star,
  terminatedOrders: X,
  totalOrders: Users,
  inProgressOrders: Users,
}

const listingTypeLabel = (order: ServiceOrderRow) =>
  order.engagementType === 'proposal' ? 'Custom' : 'Service'

const formatClientCode = (clientId?: string | null) => {
  if (!clientId) return DASH
  const compact = clientId.replace(/-/g, '').slice(-5).toUpperCase()
  return `CLT-${compact}`
}

export function ServicePerformancePage() {
  const { expertId = '', serviceId = '' } = useParams<{ expertId: string; serviceId: string }>()
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const serverSort = useServerTableSort({
    defaultSortBy: 'ordered-at',
    sortFieldMap: SERVICE_PERFORMANCE_COLUMN_SORT_FIELDS,
    onPageReset: () => setPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<ServiceOrdersQuery>({})
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null)
  const [paymentModalOrder, setPaymentModalOrder] = useState<ServiceOrderRow | null>(null)
  const [escalateTarget, setEscalateTarget] = useState<ServiceOrderRow | null>(null)
  const [escalateAdminNotes, setEscalateAdminNotes] = useState('')
  const [selectedEscalationOption, setSelectedEscalationOption] = useState('')
  const [isEscalating, setIsEscalating] = useState(false)

  const { data: assigneesData } = useEscalationAssignees('services.*')
  const escalationOptions: DecisionActionModalOption[] = useMemo(
    () =>
      (assigneesData?.data ?? []).map((assignee) => ({
        label: assignee.fullname,
        value: assignee.id,
      })),
    [assigneesData?.data],
  )

  const performanceQuery = useServicePerformance(serviceId)
  const performance = performanceQuery.data?.data

  const ordersQuery = useServiceOrders(serviceId, {
    page,
    limit: PAGE_SIZE,
    ...serverSort.sortParams,
    ...enhancedSearch.buildSearchParams(),
    ...appliedFilters,
  })
  const ordersData = ordersQuery.data?.data
  const orders = useMemo(() => ordersData?.orders ?? [], [ordersData?.orders])

  const {
    modals: filterModals,
    onAdvancedFilter,
    onExport,
  } = useModuleExportFilters({
    moduleKey: 'service-performance',
    onApplyFilters: (values) => {
      const q = buildServicePerformanceQueryParams(values) as Record<string, unknown>
      delete q.page
      delete q.limit
      setAppliedFilters(q as ServiceOrdersQuery)
      setPage(1)
    },
    onExportData: (values, format) => {
      if (orders.length === 0) throw new Error('NO_RECORDS')
      handleExport(format)
    },
  })

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

  const manageMetricsPath = `/metrics/service-performance?section=table&returnTo=${encodeURIComponent(
    `/experts/management/profile/${expertId}/service/${serviceId}/performance`,
  )}`

  const openOrderDetail = useCallback(
    (order: ServiceOrderRow) => {
      navigate(serviceOrderDetailPath(expertId, serviceId, order.id, order.engagementType))
    },
    [expertId, navigate, serviceId],
  )

  const resolvePaymentId = useCallback((order: ServiceOrderRow) => {
    return String(order.paymentId || order.transactionId || '').trim()
  }, [])

  const resolveOrderUrl = useCallback(
    (order: ServiceOrderRow) =>
      serviceOrderDetailPath(expertId, serviceId, order.id, order.engagementType),
    [expertId, serviceId],
  )

  const openCommunicateWithExpert = useCallback(
    (order?: ServiceOrderRow) => {
      const partnerId = String(order?.partnerId || expertId || '').trim()
      if (!partnerId) {
        toast.error('Expert partner ID is missing.')
        return
      }
      const params = new URLSearchParams({
        channel: 'email',
        audience: 'experts',
        partnerIds: partnerId,
      })
      navigate(`/communication/create?${params.toString()}`)
    },
    [expertId, navigate],
  )

  const openViewRefundDetails = useCallback(
    (order: ServiceOrderRow) => {
      const refundId = String(order.refundId || '').trim()
      if (!refundId) {
        toast.error('No refund record found for this order.')
        return
      }
      navigate(`/finance/refunds/${encodeURIComponent(refundId)}`)
    },
    [navigate],
  )

  const { openRefund, refundModal } = useAdminRefundFlow({
    onRefunded: () => void ordersQuery.refetch(),
  })

  const openProcessRefund = useCallback(
    (order: ServiceOrderRow) => {
      const existingRefundId = String(order.refundId || '').trim()
      if (existingRefundId) {
        navigate(`/finance/refunds/${encodeURIComponent(existingRefundId)}`)
        return
      }

      openRefund({
        paymentId: resolvePaymentId(order),
        amount: Number(order.totalPaid ?? order.price) || 0,
        currency: order.currency,
        reason: `Service order ${order.orderId}`,
        refundRequested: Boolean(order.refundRequested),
      })
    },
    [navigate, openRefund, resolvePaymentId],
  )

  const closeEscalateModal = useCallback(() => {
    setEscalateTarget(null)
    setEscalateAdminNotes('')
    setSelectedEscalationOption('')
  }, [])

  const handleEscalateSubmit = useCallback(async () => {
    if (!escalateTarget) return
    if (!selectedEscalationOption) {
      toast.error('Please select a sub-admin to assign.')
      return
    }
    if (!escalateAdminNotes.trim()) {
      toast.error('Admin notes are required.')
      return
    }

    const orderUrl = resolveOrderUrl(escalateTarget)
    const selectedAssignee = (assigneesData?.data ?? []).find(
      (item) => item.id === selectedEscalationOption,
    )
    const paymentId = resolvePaymentId(escalateTarget)

    setIsEscalating(true)
    try {
      await escalateServiceApplication(serviceId, {
        assigneeSubAdminId: selectedEscalationOption,
        assigneeName: selectedAssignee?.fullname || '',
        adminNote: escalateAdminNotes.trim(),
        entityTitle: `Service order ${escalateTarget.orderId} — ${escalateTarget.title || performance?.service.title || 'Service'}`,
        applicationUrl: orderUrl,
        escalationTarget: 'application',
        partnerId: String(escalateTarget.partnerId || expertId || ''),
        metadata: {
          source: 'service_performance',
          orderId: escalateTarget.id,
          paymentId: paymentId || undefined,
          serviceId,
          clientId: escalateTarget.clientId,
          orderUrl,
        },
      })
      toast.success('Escalated — assigned admin opens order details from My Tasks')
      closeEscalateModal()
      navigate(orderUrl)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to escalate order.'))
    } finally {
      setIsEscalating(false)
    }
  }, [
    assigneesData?.data,
    closeEscalateModal,
    escalateAdminNotes,
    escalateTarget,
    expertId,
    navigate,
    performance?.service.title,
    resolveOrderUrl,
    resolvePaymentId,
    selectedEscalationOption,
    serviceId,
  ])

  const buildOrderExportCells = useCallback(
    (order: ServiceOrderRow, exportCols: { id: string; label: string }[]) =>
      exportCols.map((column) => {
        switch (column.id) {
          case 'order-id':
            return order.orderId
          case 'client-id':
            return formatClientCode(order.clientId)
          case 'client-name':
            return order.clientName || DASH
          case 'client-source':
            return order.clientSource || DASH
          case 'client-phone':
            return order.clientPhone || DASH
          case 'order-status':
            return titleCase(order.orderStatus)
          case 'ordered-at':
            return formatDate(order.orderedAt)
          case 'start-date':
            return formatDate(order.startDate)
          case 'end-date':
            return formatDate(order.endDate)
          case 'delivery-duration':
            return order.deliveryDuration || DASH
          case 'price':
            return String(order.price)
          case 'payment-id':
            return order.paymentId || DASH
          case 'payment-method':
            return order.paymentMethod || DASH
          case 'transaction-id':
            return order.transactionId || DASH
          case 'rating':
            return order.rating === null ? DASH : String(order.rating)
          case 'payout-status':
            return order.payoutStatusLabel || DASH
          case 'disputed':
            return order.disputed ? 'Yes' : 'No'
          case 'dispute-end-date':
            return formatDate(order.disputeEndDate)
          case 'dispute-raised-at':
            return formatDate(order.disputeRaisedAt)
          case 'dispute-ticket-id':
            return order.disputeId || order.supportTicketId || DASH
          case 'refund-issued':
            return order.refundIssued ? 'Yes' : 'No'
          case 'refund-amount':
            return order.refundAmount === null ? DASH : String(order.refundAmount)
          case 'refund-status':
            return order.refundStatus || DASH
          case 'refunded-at':
            return formatDate(order.refundedAt)
          case 'listing-type':
            return listingTypeLabel(order)
          default:
            return DASH
        }
      }),
    [],
  )

  const getVisibleExportColumns = useCallback(() => {
    const catalogIds = SERVICE_PERFORMANCE_TABLE_COLUMNS_CATALOG.map((column) => column.id)
    const rawIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_SERVICE_PERFORMANCE_VISIBLE_COLUMN_IDS
    const visibleIds = sortIdsByCatalogOrder(
      [
        ...new Set(
          rawIds
            .map((id) => SERVICE_PERFORMANCE_LEGACY_COLUMN_ID_MAP[id] ?? id)
            .filter((id) => catalogIds.includes(id)),
        ),
      ],
      catalogIds,
    )
    return SERVICE_PERFORMANCE_TABLE_COLUMNS_CATALOG.filter((column) =>
      visibleIds.includes(column.id),
    )
  }, [tableColumnPreferencesQuery.data?.visibleColumnIds])

  const handleExportOrderRow = useCallback(
    (order: ServiceOrderRow, format = 'excel') => {
      const exportCols = getVisibleExportColumns()
      const headers = exportCols.map((column) => column.label)
      const rows = [buildOrderExportCells(order, exportCols)]
      exportDataToFile(headers, rows, format, `service_order_${order.orderId || order.id}`)
      toast.success('Order exported')
    },
    [buildOrderExportCells, getVisibleExportColumns],
  )

  const handleExport = useCallback(
    (format = 'excel') => {
      if (orders.length === 0) {
        toast.error('No orders available to export.')
        return
      }

      const exportCols = getVisibleExportColumns()
      const headers = exportCols.map((column) => column.label)
      const rows = orders.map((order) => buildOrderExportCells(order, exportCols))

      exportDataToFile(headers, rows, format, 'service_orders_export')
      toast.success(`Exported ${orders.length} order(s)`)
    },
    [buildOrderExportCells, getVisibleExportColumns, orders],
  )

  const dataColumnsById = useMemo<Record<string, ColumnDef<ServiceOrderRow>>>(
    () => ({
      'order-id': {
        id: 'order-id',
        accessorKey: 'orderId',
        header: 'Order ID',
        cell: ({ row }) => (
          <span className="ui-table-id uppercase">{row.original.orderId.slice(-8)}</span>
        ),
      },
      'client-id': {
        id: 'client-id',
        accessorKey: 'clientId',
        header: 'Client ID',
        cell: ({ row }) => (
          <span className="ui-table-id uppercase">{formatClientCode(row.original.clientId)}</span>
        ),
      },
      'client-name': {
        id: 'client-name',
        accessorKey: 'clientName',
        header: 'Client Name',
        cell: ({ row }) => (
          <span className="font-medium text-white">{row.original.clientName || DASH}</span>
        ),
      },
      'listing-type': {
        id: 'listing-type',
        accessorFn: (row) => listingTypeLabel(row),
        header: 'Listing Type',
        cell: ({ row }) => listingTypeLabel(row.original),
      },
      'order-status': {
        id: 'order-status',
        accessorKey: 'orderStatus',
        header: 'Order Status',
        cell: ({ row }) => <TableStatusPill status={row.original.orderStatus} />,
      },
      'pricing-type': {
        id: 'pricing-type',
        accessorKey: 'pricingType',
        header: 'Pricing Type',
        cell: ({ row }) => titleCase(row.original.pricingType) || DASH,
      },
      'client-source': {
        id: 'client-source',
        accessorKey: 'clientSource',
        header: 'Client Source',
        cell: ({ row }) => row.original.clientSource || DASH,
      },
      'client-phone': {
        id: 'client-phone',
        accessorKey: 'clientPhone',
        header: 'Client Phone Number',
        cell: ({ row }) => row.original.clientPhone || DASH,
      },
      'ordered-at': {
        id: 'ordered-at',
        accessorKey: 'orderedAt',
        header: 'Ordered At',
        cell: ({ row }) => renderTableDateTimeCell(row.original.orderedAt),
      },
      'start-date': {
        id: 'start-date',
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: ({ row }) => renderTableDateTimeCell(row.original.startDate),
      },
      'end-date': {
        id: 'end-date',
        accessorKey: 'endDate',
        header: 'End Date',
        cell: ({ row }) => renderTableDateTimeCell(row.original.endDate),
      },
      'delivery-duration': {
        id: 'delivery-duration',
        accessorKey: 'deliveryDuration',
        header: 'Delivery Duration',
        cell: ({ row }) => row.original.deliveryDuration || DASH,
      },
      price: {
        id: 'price',
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => formatCurrency(row.original.price, row.original.currency),
      },
      'payment-id': {
        id: 'payment-id',
        accessorKey: 'paymentId',
        header: 'Payment ID',
        cell: ({ row }) => <span className="ui-table-id">{row.original.paymentId || DASH}</span>,
      },
      'payment-method': {
        id: 'payment-method',
        accessorKey: 'paymentMethod',
        header: 'Payment Method',
        cell: ({ row }) =>
          row.original.paymentMethod ? titleCase(row.original.paymentMethod) : DASH,
      },
      'transaction-id': {
        id: 'transaction-id',
        accessorKey: 'transactionId',
        header: 'Transaction ID',
        cell: ({ row }) => (
          <span className="ui-table-id">{row.original.transactionId || DASH}</span>
        ),
      },
      rating: {
        id: 'rating',
        accessorKey: 'rating',
        header: 'Rating',
        cell: ({ row }) =>
          row.original.rating === null ? DASH : `★ ${row.original.rating.toFixed(1)}`,
      },
      'payout-status': {
        id: 'payout-status',
        accessorKey: 'payoutStatus',
        header: 'Payout Status',
        cell: ({ row }) => (
          <TableStatusPill
            status={row.original.payoutStatus}
            label={row.original.payoutStatusLabel || undefined}
          />
        ),
      },
      disputed: {
        id: 'disputed',
        accessorKey: 'disputed',
        header: 'Disputed',
        cell: ({ row }) => (row.original.disputed ? 'Yes' : 'No'),
      },
      'dispute-period-lapsed': {
        id: 'dispute-period-lapsed',
        accessorKey: 'disputePeriodLapsed',
        header: 'Dispute Period Lapsed',
        cell: ({ row }) =>
          row.original.disputePeriodLapsed === null
            ? DASH
            : row.original.disputePeriodLapsed
              ? 'Yes'
              : 'No',
      },
      'dispute-end-date': {
        id: 'dispute-end-date',
        accessorKey: 'disputeEndDate',
        header: 'Dispute Period End Date',
        cell: ({ row }) => renderTableDateTimeCell(row.original.disputeEndDate),
      },
      'dispute-raised-at': {
        id: 'dispute-raised-at',
        accessorKey: 'disputeRaisedAt',
        header: 'Dispute Raised At',
        cell: ({ row }) => renderTableDateTimeCell(row.original.disputeRaisedAt),
      },
      'dispute-ticket-id': {
        id: 'dispute-ticket-id',
        accessorFn: (row) => row.disputeId || row.supportTicketId || '',
        header: 'Dispute / Ticket ID',
        cell: ({ row }) => (
          <span className="ui-table-id">
            {row.original.disputeId || row.original.supportTicketId || DASH}
          </span>
        ),
      },
      'refund-issued': {
        id: 'refund-issued',
        accessorKey: 'refundIssued',
        header: 'Refund Issued',
        cell: ({ row }) => (row.original.refundIssued ? 'Yes' : 'No'),
      },
      'refund-amount': {
        id: 'refund-amount',
        accessorKey: 'refundAmount',
        header: 'Refund Amount',
        cell: ({ row }) =>
          row.original.refundAmount === null
            ? DASH
            : formatCurrency(row.original.refundAmount, row.original.currency),
      },
      'refund-status': {
        id: 'refund-status',
        accessorKey: 'refundStatus',
        header: 'Refund Status',
        cell: ({ row }) => <TableStatusPill status={row.original.refundStatus} />,
      },
      'refunded-at': {
        id: 'refunded-at',
        accessorKey: 'refundedAt',
        header: 'Refunded At',
        cell: ({ row }) => renderTableDateTimeCell(row.original.refundedAt),
      },
    }),
    [],
  )

  const columns = useMemo<ColumnDef<ServiceOrderRow>[]>(() => {
    const catalogIds = SERVICE_PERFORMANCE_TABLE_COLUMNS_CATALOG.map((column) => column.id)
    const rawIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_SERVICE_PERFORMANCE_VISIBLE_COLUMN_IDS
    const mappedIds = rawIds.map((id) => SERVICE_PERFORMANCE_LEGACY_COLUMN_ID_MAP[id] ?? id)
    const visibleIds = sortIdsByCatalogOrder(
      [...new Set(mappedIds.filter((id) => catalogIds.includes(id)))],
      catalogIds,
    )

    const preferenceColumns = visibleIds.map((id) => dataColumnsById[id]).filter(Boolean)

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
              menuWidth={240}
              maxVisibleItems={8}
            >
              <TableActionsItem
                tone="light"
                icon={<Eye className="size-3.5" />}
                onClick={() => {
                  setActiveActionMenu(null)
                  openOrderDetail(order)
                }}
              >
                View Order Details
              </TableActionsItem>
              <TableActionsItem
                tone="light"
                icon={<CreditCard className="size-3.5" />}
                onClick={() => {
                  setActiveActionMenu(null)
                  setPaymentModalOrder(order)
                }}
              >
                View Payment Details
              </TableActionsItem>
              <TableActionsItem
                tone="light"
                icon={<Receipt className="size-3.5" />}
                onClick={() => {
                  setActiveActionMenu(null)
                  openViewRefundDetails(order)
                }}
              >
                View Refund Details
              </TableActionsItem>
              <TableActionsItem
                tone="light"
                icon={<AlertTriangle className="size-3.5" />}
                onClick={() => {
                  setActiveActionMenu(null)
                  setEscalateTarget(order)
                }}
              >
                Escalate Order
              </TableActionsItem>
              <TableActionsItem
                tone="light"
                icon={<MessageSquare className="size-3.5" />}
                onClick={() => {
                  setActiveActionMenu(null)
                  openCommunicateWithExpert(order)
                }}
              >
                Communicate with Expert
              </TableActionsItem>
              <TableActionsItem
                tone="light"
                icon={<Banknote className="size-3.5" />}
                onClick={() => {
                  setActiveActionMenu(null)
                  openProcessRefund(order)
                }}
              >
                Process Refund
              </TableActionsItem>
              <TableActionsItem
                tone="light"
                icon={<ExportDataIcon className="size-3.5" />}
                onClick={() => {
                  setActiveActionMenu(null)
                  handleExportOrderRow(order)
                }}
              >
                Export Order
              </TableActionsItem>
            </TableActionsDropdown>
          </div>
        )
      },
    }

    return withServerSortMeta(
      [...preferenceColumns, actionsColumn],
      SERVICE_PERFORMANCE_COLUMN_SORT_FIELDS,
    )
  }, [
    activeActionMenu,
    dataColumnsById,
    handleExportOrderRow,
    openCommunicateWithExpert,
    openOrderDetail,
    openProcessRefund,
    openViewRefundDetails,
    tableColumnPreferencesQuery.data,
  ])

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

      <DecisionActionModal
        open={Boolean(escalateTarget)}
        variant="escalate"
        title="Escalate Order"
        description="Are you sure you want to escalate this order to compliance? It will be reviewed by the selected sub-admin."
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

      {filterModals}
      {refundModal}

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
          className="ui-manage-metrics"
        >
          <ManageMetricsIcon />
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
                icon={METRIC_ICONS[card.id] || Users}
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
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={SERVICE_PERFORMANCE_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by service name or ID"
        resourceLabel="orders"
        emptyMessage="No orders placed for this service yet."
        showAdvancedFilter
        showExport
        onAdvancedFilter={onAdvancedFilter}
        onExport={onExport}
        onRowClick={openOrderDetail}
        {...serverSort.dataTableSortProps}
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
