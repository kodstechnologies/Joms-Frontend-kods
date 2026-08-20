import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, Check, Star, User, Users, X } from 'lucide-react'
import { toast } from 'sonner'

import { StatCard } from '@/shared/components/dashboard/stat-card'
import { DecisionActionModal } from '@/shared/components/modal/decision-action-modal'
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
import type { FilterValues, ModuleFilterConfig } from '@/shared/types/data-filter'
import { exportDataToFile } from '@/shared/utils/export-utils'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

import { SERVICE_PERFORMANCE_MAX_ACTIVE_METRICS } from '../../config/service-performance-metrics.config'
import {
  useCancelConsultationBooking,
  useConsultationBookings,
  useConsultationPerformance,
} from '../../hooks/use-consultation-drilldown'
import { buildServicePerformanceCards } from '../../utils/service-performance-metrics'
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
import type { ServicePerformance } from '../../type/service-drilldown'

const PAGE_SIZE = 10
const CONSULTATION_KPI_IDS = [
  'activeClients',
  'completedOrders',
  'averageRating',
  'terminatedOrders',
] as const

const METRIC_ICONS = {
  activeClients: Users,
  completedOrders: Check,
  averageRating: Star,
  terminatedOrders: X,
} as const

const formatClientCode = (row: ConsultationBookingRow) => {
  if (row.clientCode) return row.clientCode
  if (!row.clientId) return DASH
  return `CLT-${row.clientId.replace(/-/g, '').slice(-5).toUpperCase()}`
}

const canCancelBooking = (status?: string | null) => {
  const normalized = String(status || '').toLowerCase()
  return !['cancelled', 'canceled', 'completed', 'terminated'].includes(normalized)
}

const buildFilterConfig = (): ModuleFilterConfig => ({
  moduleKey: 'consultation-performance',
  moduleName: 'Consultation Performance',
  sections: [
    {
      id: 'by-booking',
      title: 'By Booking',
      defaultExpanded: true,
      fields: [
        {
          id: 'status',
          label: 'Status',
          type: 'checkbox-group',
          options: [
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
          ],
        },
      ],
    },
  ],
})

export function ConsultationPerformancePage() {
  const { expertId = '', consultationId = '' } = useParams<{
    expertId: string
    consultationId: string
  }>()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string | undefined>()
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null)
  const [paymentBookingId, setPaymentBookingId] = useState<string | null>(null)
  const [cancelBookingRow, setCancelBookingRow] = useState<ConsultationBookingRow | null>(null)
  const [cancelAdminNotes, setCancelAdminNotes] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const filterConfig = useMemo(() => buildFilterConfig(), [])
  const [filterValues, setFilterValues] = useState<FilterValues>(() =>
    createEmptyFilterValuesForConfig(filterConfig),
  )

  const performanceQuery = useConsultationPerformance(consultationId)
  const performance = performanceQuery.data?.data
  const bookingsQuery = useConsultationBookings(consultationId, {
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status,
  })
  const bookings = useMemo(
    () => bookingsQuery.data?.data.items ?? [],
    [bookingsQuery.data?.data.items],
  )
  const pagination = bookingsQuery.data?.data.pagination
  const cancelBooking = useCancelConsultationBooking(consultationId)

  const metricCards = useMemo(
    () =>
      buildServicePerformanceCards(performance as unknown as ServicePerformance).filter((card) =>
        CONSULTATION_KPI_IDS.includes(card.id as (typeof CONSULTATION_KPI_IDS)[number]),
      ),
    [performance],
  )

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

  const handleExport = useCallback(
    (format = 'excel') => {
      if (bookings.length === 0) {
        toast.error('No bookings available to export.')
        return
      }
      const headers = [
        'Client ID',
        'Name',
        'Consultation Name',
        'Status',
        'Slot Duration',
        'Start Date',
        'Price',
      ]
      const rows = bookings.map((booking) => [
        formatClientCode(booking),
        booking.clientName || DASH,
        booking.title,
        titleCase(booking.status),
        booking.durationLabel || DASH,
        formatDateTime(booking.startDate),
        String(booking.price),
      ])
      exportDataToFile(headers, rows, format, 'consultation_bookings_export')
      toast.success(`Exported ${bookings.length} booking(s)`)
      setIsExportOpen(false)
    },
    [bookings],
  )

  const columns = useMemo<ColumnDef<ConsultationBookingRow>[]>(
    () => [
      {
        id: 'client-id',
        header: 'Client ID',
        cell: ({ row }) => (
          <span className="ui-table-id text-muted font-mono text-xs uppercase">
            {formatClientCode(row.original)}
          </span>
        ),
      },
      {
        id: 'client-name',
        header: 'Name',
        cell: ({ row }) => (
          <span className="font-medium text-white">{row.original.clientName || DASH}</span>
        ),
      },
      {
        id: 'consultation-name',
        header: 'Consultation Name',
        cell: ({ row }) => <span className="text-sm text-white">{row.original.title}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusPill status={row.original.status} />,
      },
      {
        id: 'slot-duration',
        header: 'Slot Duration',
        cell: ({ row }) => (
          <span className="text-muted text-sm">{row.original.durationLabel || DASH}</span>
        ),
      },
      {
        id: 'start-date',
        header: 'Start Date',
        cell: ({ row }) => (
          <span className="text-muted text-xs">{formatDateTime(row.original.startDate)}</span>
        ),
      },
      {
        id: 'price',
        header: 'Price',
        cell: ({ row }) => (
          <span className="font-semibold text-white">
            {formatCurrency(row.original.price, row.original.currency)}
          </span>
        ),
      },
      {
        id: 'actions',
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
      },
    ],
    [activeActionMenu, openBooking],
  )

  return (
    <div className="space-y-7 pb-10">
      <ConsultationPaymentDetailsModal
        open={Boolean(paymentBookingId)}
        bookingId={paymentBookingId}
        onClose={() => setPaymentBookingId(null)}
      />

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
          setStatus(undefined)
          setPage(1)
          toast.message('Filters reset')
        }}
        onApply={() => {
          const selected = Array.isArray(filterValues.status) ? filterValues.status : []
          setStatus(selected[0])
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
        data={bookings}
        getRowId={(row) => row.id}
        isLoading={bookingsQuery.isLoading}
        searchValue={search}
        onSearchChange={(value) => {
          setPage(1)
          setSearch(value)
        }}
        searchPlaceholder="Search by client or consultation"
        resourceLabel="bookings"
        emptyMessage="No bookings for this consultation yet."
        showAdvancedFilter
        showExport
        onAdvancedFilter={() => setIsFilterOpen(true)}
        onExport={() => setIsExportOpen(true)}
        onRowClick={openBooking}
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
