import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, Check, Star, User, Users, X } from 'lucide-react'
import { toast } from 'sonner'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'

import { Button } from '@/shared/components/ui/button'
import { StatCard } from '@/shared/components/dashboard/stat-card'
import { DecisionActionModal } from '@/shared/components/modal/decision-action-modal'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { SERVICE_COLUMN_SORT_FIELDS } from '@/shared/utils/table-sort-field-maps'
import { CONSULTATION_PERFORMANCE_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { buildConsultationPerformanceQueryParams } from '@/shared/utils/export-filter-utils'
import { exportDataToFile } from '@/shared/utils/export-utils'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'

import {
  CONSULTATION_PERFORMANCE_LEGACY_METRIC_ID_MAP,
  CONSULTATION_PERFORMANCE_MAX_ACTIVE_METRICS,
  CONSULTATION_PERFORMANCE_METRIC_IDS,
  CONSULTATION_PERFORMANCE_MODULE_KEY,
  DEFAULT_CONSULTATION_PERFORMANCE_METRIC_IDS,
} from '../../config/consultation-performance-metrics.config'
import {
  CONSULTATION_PERFORMANCE_LEGACY_COLUMN_ID_MAP,
  CONSULTATION_PERFORMANCE_TABLE_COLUMNS_CATALOG,
  DEFAULT_CONSULTATION_PERFORMANCE_VISIBLE_COLUMN_IDS,
} from '../../config/consultation-performance-table-columns.config'
import { orderByActiveMetricIds, useActiveMetricIds } from '../../hooks/use-active-metric-ids'
import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'
import {
  useCancelConsultationBooking,
  useConsultationBookings,
  useConsultationPerformance,
} from '../../hooks/use-consultation-drilldown'
import { buildConsultationPerformanceCards } from '../../utils/service-performance-metrics'
import { ConsultationPaymentDetailsModal } from '../../components/service-drilldown/consultation-payment-details-modal'
import { ShimmerBlock, StatusPill } from '../../components/service-drilldown/drilldown-primitives'
import {
  DASH,
  formatCurrency,
  formatDateTime,
  titleCase,
} from '../../components/service-drilldown/drilldown-format'
import { consultationBookingPath } from '../../lib/service-navigation'
import type { ConsultationBookingRow } from '../../type/consultation-drilldown'

const PAGE_SIZE = 10

const METRIC_ICONS: Record<string, typeof Users> = {
  activeClients: Users,
  completedConsultations: Check,
  averageConsultationRating: Star,
  cancelledConsultations: X,
  totalConsultationsBooked: Users,
  scheduledConsultations: Users,
}

const formatClientCode = (row: ConsultationBookingRow) => {
  if (row.clientCode) return row.clientCode
  if (!row.clientId) return DASH
  return `CLT-${row.clientId.replace(/-/g, '').slice(-5).toUpperCase()}`
}

const canCancelBooking = (status?: string | null) => {
  const normalized = String(status || '').toLowerCase()
  return !['cancelled', 'canceled', 'completed', 'terminated'].includes(normalized)
}

export function ConsultationPerformancePage() {
  const { expertId = '', consultationId = '' } = useParams<{
    expertId: string
    consultationId: string
  }>()
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: SERVICE_COLUMN_SORT_FIELDS,
    onPageReset: () => setPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<Record<string, unknown>>({})
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null)
  const [paymentBookingId, setPaymentBookingId] = useState<string | null>(null)
  const [cancelBookingRow, setCancelBookingRow] = useState<ConsultationBookingRow | null>(null)
  const [cancelAdminNotes, setCancelAdminNotes] = useState('')

  const performanceQuery = useConsultationPerformance(consultationId)
  const performance = performanceQuery.data?.data
  const bookingsQuery = useConsultationBookings(consultationId, {
    page,
    limit: PAGE_SIZE,
    ...serverSort.sortParams,
    ...enhancedSearch.buildSearchParams(),
    ...appliedFilters,
  })
  const bookings = useMemo(
    () => bookingsQuery.data?.data.items ?? [],
    [bookingsQuery.data?.data.items],
  )
  const pagination = bookingsQuery.data?.data.pagination
  const cancelBooking = useCancelConsultationBooking(consultationId)

  const tableColumnPreferencesQuery = useTableColumnPreferences(CONSULTATION_PERFORMANCE_MODULE_KEY)
  const rawActiveMetricIds = useActiveMetricIds(CONSULTATION_PERFORMANCE_MODULE_KEY, [
    ...DEFAULT_CONSULTATION_PERFORMANCE_METRIC_IDS,
  ])
  const orderedMetricIds = useMemo(() => {
    const mapped = rawActiveMetricIds.map(
      (id) => CONSULTATION_PERFORMANCE_LEGACY_METRIC_ID_MAP[id] ?? id,
    )
    return sortIdsByCatalogOrder(
      [...new Set(mapped.filter((id) => CONSULTATION_PERFORMANCE_METRIC_IDS.includes(id)))],
      CONSULTATION_PERFORMANCE_METRIC_IDS,
    )
  }, [rawActiveMetricIds])

  const metricCards = useMemo(
    () =>
      orderByActiveMetricIds(
        buildConsultationPerformanceCards(performance),
        orderedMetricIds,
      ).slice(0, CONSULTATION_PERFORMANCE_MAX_ACTIVE_METRICS),
    [orderedMetricIds, performance],
  )

  const manageMetricsPath = `/metrics/consultation-performance?section=table&returnTo=${encodeURIComponent(
    `/experts/management/profile/${expertId}/consultation/${consultationId}/performance`,
  )}`

  const {
    modals: filterModals,
    onAdvancedFilter,
    onExport,
  } = useModuleExportFilters({
    moduleKey: 'consultation-performance',
    onApplyFilters: (values) => {
      const q = buildConsultationPerformanceQueryParams(values)
      delete q.page
      delete q.limit
      setAppliedFilters(q)
      setPage(1)
    },
    onExportData: (values, format) => {
      if (bookings.length === 0) throw new Error('NO_RECORDS')
      handleExport(format)
    },
  })

  const openBooking = useCallback(
    (booking: ConsultationBookingRow) => {
      navigate(consultationBookingPath(expertId, consultationId, booking.id))
    },
    [consultationId, expertId, navigate],
  )

  const closeCancelModal = () => {
    setCancelBookingRow(null)
    setCancelAdminNotes('')
  }

  const handleCancelConsultation = async () => {
    if (!cancelBookingRow) return
    try {
      await cancelBooking.mutateAsync(cancelBookingRow.id)
      toast.success('Consultation cancelled')
      closeCancelModal()
    } catch {
      toast.error('Failed to cancel the consultation.')
    }
  }

  const dataColumnsById = useMemo<Record<string, ColumnDef<ConsultationBookingRow>>>(
    () => ({
      'booking-id': {
        id: 'booking-id',
        accessorKey: 'bookingId',
        header: 'Booking ID',
        cell: ({ row }) => (
          <span className="ui-table-id text-muted font-mono text-xs uppercase">
            {(row.original.bookingId || row.original.id).slice(-8)}
          </span>
        ),
      },
      'client-id': {
        id: 'client-id',
        accessorFn: (row) => formatClientCode(row),
        header: 'Client ID',
        cell: ({ row }) => (
          <span className="ui-table-id text-muted font-mono text-xs uppercase">
            {formatClientCode(row.original)}
          </span>
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
      status: {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusPill status={row.original.status} />,
      },
      'client-source': {
        id: 'client-source',
        accessorKey: 'clientSource',
        header: 'Client Source',
        cell: ({ row }) => (
          <span className="text-muted text-sm">{row.original.clientSource || DASH}</span>
        ),
      },
      'slot-duration': {
        id: 'slot-duration',
        accessorKey: 'durationLabel',
        header: 'Slot Duration',
        cell: ({ row }) => (
          <span className="text-muted text-sm">{row.original.durationLabel || DASH}</span>
        ),
      },
      'start-time': {
        id: 'start-time',
        accessorKey: 'startDate',
        header: 'Start Time',
        cell: ({ row }) => (
          <span className="text-muted text-xs">{formatDateTime(row.original.startDate)}</span>
        ),
      },
      'end-time': {
        id: 'end-time',
        accessorKey: 'endDate',
        header: 'End Time',
        cell: ({ row }) => (
          <span className="text-muted text-xs">{formatDateTime(row.original.endDate)}</span>
        ),
      },
      'booked-at': {
        id: 'booked-at',
        accessorKey: 'bookedAt',
        header: 'Booked At',
        cell: ({ row }) => (
          <span className="text-muted text-xs">{formatDateTime(row.original.bookedAt)}</span>
        ),
      },
      price: {
        id: 'price',
        accessorKey: 'price',
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
        cell: () => <span className="text-muted text-sm">{DASH}</span>,
      },
      'payment-method': {
        id: 'payment-method',
        header: 'Payment Method',
        cell: () => <span className="text-muted text-sm">{DASH}</span>,
      },
      'transaction-id': {
        id: 'transaction-id',
        header: 'Transaction ID',
        cell: () => <span className="text-muted text-sm">{DASH}</span>,
      },
      rating: {
        id: 'rating',
        header: 'Rating',
        cell: () => <span className="text-muted text-sm">{DASH}</span>,
      },
      'payout-status': {
        id: 'payout-status',
        header: 'Payout Status',
        cell: () => <span className="text-muted text-sm">{DASH}</span>,
      },
      disputed: {
        id: 'disputed',
        header: 'Disputed',
        cell: () => <span className="text-muted text-sm">{DASH}</span>,
      },
      'dispute-period-lapsed': {
        id: 'dispute-period-lapsed',
        header: 'Dispute Period Lapsed',
        cell: () => <span className="text-muted text-sm">{DASH}</span>,
      },
      'dispute-end-date': {
        id: 'dispute-end-date',
        header: 'Dispute Period End Date',
        cell: () => <span className="text-muted text-sm">{DASH}</span>,
      },
      'dispute-raised-at': {
        id: 'dispute-raised-at',
        header: 'Dispute Raised At',
        cell: () => <span className="text-muted text-sm">{DASH}</span>,
      },
      'dispute-ticket-id': {
        id: 'dispute-ticket-id',
        header: 'Dispute / Ticket ID',
        cell: () => <span className="text-muted text-sm">{DASH}</span>,
      },
      'refund-issued': {
        id: 'refund-issued',
        header: 'Refund Issued',
        cell: () => <span className="text-muted text-sm">{DASH}</span>,
      },
      'refund-amount': {
        id: 'refund-amount',
        header: 'Refund Amount',
        cell: () => <span className="text-muted text-sm">{DASH}</span>,
      },
      'refund-status': {
        id: 'refund-status',
        header: 'Refund Status',
        cell: () => <span className="text-muted text-sm">{DASH}</span>,
      },
      'refunded-at': {
        id: 'refunded-at',
        header: 'Refunded At',
        cell: () => <span className="text-muted text-sm">{DASH}</span>,
      },
      'follow-up-period': {
        id: 'follow-up-period',
        header: 'Follow-up Period',
        cell: () => <span className="text-muted text-sm">{DASH}</span>,
      },
      'follow-up-completed': {
        id: 'follow-up-completed',
        header: 'Follow-up Completed',
        cell: () => <span className="text-muted text-sm">{DASH}</span>,
      },
      'last-updated-at': {
        id: 'last-updated-at',
        accessorKey: 'lastUpdatedAt',
        header: 'Last Updated At',
        cell: ({ row }) => (
          <span className="text-muted text-xs">{formatDateTime(row.original.lastUpdatedAt)}</span>
        ),
      },
      'consultation-name': {
        id: 'consultation-name',
        accessorKey: 'title',
        header: 'Consultation Name',
        cell: ({ row }) => <span className="text-sm text-white">{row.original.title}</span>,
      },
    }),
    [],
  )

  const handleExport = useCallback(
    (format = 'excel') => {
      if (bookings.length === 0) {
        toast.error('No bookings available to export.')
        return
      }

      const catalogIds = CONSULTATION_PERFORMANCE_TABLE_COLUMNS_CATALOG.map((column) => column.id)
      const rawIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
        ? tableColumnPreferencesQuery.data.visibleColumnIds
        : DEFAULT_CONSULTATION_PERFORMANCE_VISIBLE_COLUMN_IDS
      const visibleIds = sortIdsByCatalogOrder(
        [
          ...new Set(
            rawIds
              .map((id) => CONSULTATION_PERFORMANCE_LEGACY_COLUMN_ID_MAP[id] ?? id)
              .filter((id) => catalogIds.includes(id)),
          ),
        ],
        catalogIds,
      )
      const exportCols = CONSULTATION_PERFORMANCE_TABLE_COLUMNS_CATALOG.filter((column) =>
        visibleIds.includes(column.id),
      )

      const headers = exportCols.map((column) => column.label)
      const rows = bookings.map((booking) =>
        exportCols.map((column) => {
          switch (column.id) {
            case 'booking-id':
              return booking.bookingId || booking.id
            case 'client-id':
              return formatClientCode(booking)
            case 'client-name':
              return booking.clientName || DASH
            case 'status':
              return titleCase(booking.status)
            case 'client-source':
              return booking.clientSource || DASH
            case 'slot-duration':
              return booking.durationLabel || DASH
            case 'start-time':
              return formatDateTime(booking.startDate)
            case 'end-time':
              return formatDateTime(booking.endDate)
            case 'booked-at':
              return formatDateTime(booking.bookedAt)
            case 'price':
              return String(booking.price)
            case 'consultation-name':
              return booking.title
            case 'last-updated-at':
              return formatDateTime(booking.lastUpdatedAt)
            default:
              return DASH
          }
        }),
      )
      exportDataToFile(headers, rows, format, 'consultation_bookings_export')
      toast.success(`Exported ${bookings.length} booking(s)`)
    },
    [bookings, tableColumnPreferencesQuery.data],
  )

  const columns = useMemo<ColumnDef<ConsultationBookingRow>[]>(() => {
    const catalogIds = CONSULTATION_PERFORMANCE_TABLE_COLUMNS_CATALOG.map((column) => column.id)
    const rawIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_CONSULTATION_PERFORMANCE_VISIBLE_COLUMN_IDS
    const mappedIds = rawIds.map((id) => CONSULTATION_PERFORMANCE_LEGACY_COLUMN_ID_MAP[id] ?? id)
    const visibleIds = sortIdsByCatalogOrder(
      [...new Set(mappedIds.filter((id) => catalogIds.includes(id)))],
      catalogIds,
    )

    const preferenceColumns = visibleIds.map((id) => dataColumnsById[id]).filter(Boolean)

    const actionsColumn: ColumnDef<ConsultationBookingRow> = {
      id: 'actions',
      enableSorting: false,
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const booking = row.original
        return (
          <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
            <TableActionsDropdown
              label="Booking actions"
              isOpen={activeActionMenu === booking.id}
              onOpenChange={(open) => setActiveActionMenu(open ? booking.id : null)}
            >
              <TableActionsItem
                tone="light"
                icon={<User className="size-3.5" />}
                onClick={() => {
                  setActiveActionMenu(null)
                  openBooking(booking)
                }}
              >
                View Details
              </TableActionsItem>
              <TableActionsItem
                tone="light"
                icon={<User className="size-3.5" />}
                onClick={() => {
                  setActiveActionMenu(null)
                  setPaymentBookingId(booking.id)
                }}
              >
                View Payment Details
              </TableActionsItem>
              {canCancelBooking(booking.status) ? (
                <TableActionsItem
                  tone="light"
                  icon={<X className="size-3.5" />}
                  onClick={() => {
                    setActiveActionMenu(null)
                    setCancelAdminNotes('')
                    setCancelBookingRow(booking)
                  }}
                >
                  Cancel Consultation
                </TableActionsItem>
              ) : null}
            </TableActionsDropdown>
          </div>
        )
      },
    }

    return withServerSortMeta([...preferenceColumns, actionsColumn], SERVICE_COLUMN_SORT_FIELDS)
  }, [activeActionMenu, dataColumnsById, openBooking, tableColumnPreferencesQuery.data])

  return (
    <div className="space-y-7 pb-10">
      <ConsultationPaymentDetailsModal
        open={Boolean(paymentBookingId)}
        bookingId={paymentBookingId}
        onClose={() => setPaymentBookingId(null)}
      />

      {filterModals}

      <DecisionActionModal
        open={Boolean(cancelBookingRow)}
        variant="warn"
        title="Cancel Consultation"
        description={`Are you sure you want to cancel ${cancelBookingRow?.title || 'this consultation'} for ${cancelBookingRow?.clientName || 'this client'}? The client will be notified.`}
        submitLabel="Cancel Consultation"
        adminNotes={cancelAdminNotes}
        onAdminNotesChange={setCancelAdminNotes}
        reasonRequired={false}
        onClose={closeCancelModal}
        onSubmit={handleCancelConsultation}
        isSubmitting={cancelBooking.isPending}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigateBackOrFallback(navigate, `/experts/management/profile/${expertId}`)
              }
              className="bg-brand-surface text-muted grid size-8 place-items-center rounded-lg border border-white/10 transition-colors hover:bg-white/5"
            >
              <ArrowLeft className="size-4" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Consultation Performance
            </h1>
          </div>
          <p className="text-muted mt-1.5 pl-11 text-sm">
            {performanceQuery.isLoading ? (
              <span className="inline-block h-4 w-40 animate-pulse rounded bg-white/10 align-middle" />
            ) : (
              performance?.title || 'Consultation'
            )}
          </p>
        </div>

        <Button
          type="button"
          onClick={() => navigate(manageMetricsPath)}
          className="ui-manage-metrics h-10 rounded-xl px-5 text-sm font-semibold sm:w-auto"
        >
          <ManageMetricsIcon className="size-4 shrink-0" />
          Manage Metrics
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {performanceQuery.isLoading
          ? Array.from({ length: CONSULTATION_PERFORMANCE_MAX_ACTIVE_METRICS }).map((_, index) => (
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
        data={bookings}
        getRowId={(row) => row.id}
        isLoading={bookingsQuery.isLoading}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={CONSULTATION_PERFORMANCE_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by client or consultation"
        resourceLabel="bookings"
        emptyMessage="No bookings for this consultation yet."
        showAdvancedFilter
        showExport
        onAdvancedFilter={onAdvancedFilter}
        onExport={onExport}
        onRowClick={openBooking}
        {...serverSort.dataTableSortProps}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          totalItems: pagination?.total ?? 0,
          totalPages: pagination?.pages ?? 0,
          onPageChange: setPage,
        }}
      />
    </div>
  )
}
