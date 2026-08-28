import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { AlertTriangle, Eye, SlidersHorizontal, Tag, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { type FinanceVenueRow } from '@/modules/payments/mock/finance-venues.mock'
import {
  useAddFinanceNote,
  useEscalateFinance,
  useFinanceRevenue,
  useSoftDeleteFinance,
} from '@/modules/payments/hooks/use-finance'
import { fetchFinanceRevenue } from '@/modules/payments/api/finance-api'
import { mapPaymentToVenueRow } from '@/modules/payments/utils/finance-mappers'
import {
  DEFAULT_FINANCE_VENUES_VISIBLE_COLUMN_IDS,
  FINANCE_VENUES_MODULE_KEY,
  FINANCE_VENUES_TABLE_COLUMNS_CATALOG,
} from '@/modules/payments/config/finance-venues-table-columns.config'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { AddTagsModal } from '@/shared/components/modals/add-tags-modal'
import {
  FinanceEscalateDeleteModal,
  type FinanceEscalateDeleteAction,
} from '@/modules/payments/components/finance-escalate-delete-modal'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { FINANCE_VENUES_EXPORT_COLUMN_MAP } from '@/modules/payments/utils/finance-export-column-maps'
import {
  buildFinanceVenuesListQueryParams,
  createFinanceVenuesFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import type { FilterValues } from '@/shared/types/data-filter'
import type { FinancePayment } from '@/modules/payments/types/finance-api'

const PAGE_SIZE = 10

function getStatusClassName(status: FinanceVenueRow['status']) {
  if (status === 'Completed') {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  if (status === 'Pending') {
    return 'border-brand-accent/25 bg-brand-accent/10 text-brand-accent'
  }
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

export function FinanceVenuesPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])
  const [tagTarget, setTagTarget] = useState<FinanceVenueRow | null>(null)
  const [rowAction, setRowAction] = useState<FinanceEscalateDeleteAction | null>(null)
  const addNote = useAddFinanceNote()
  const escalate = useEscalateFinance()
  const softDelete = useSoftDeleteFinance()
  const tableColumnPreferencesQuery = useTableColumnPreferences(FINANCE_VENUES_MODULE_KEY)

  const catalogColumnIds = useMemo(
    () => FINANCE_VENUES_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_FINANCE_VENUES_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
      setCurrentPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchQuery])

  const listQueryParams = useMemo(
    () =>
      buildFinanceVenuesListQueryParams(appliedFilters, {
        page: currentPage,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
      }),
    [appliedFilters, currentPage, debouncedSearch],
  )

  const { data, isLoading, isFetching, isError } = useFinanceRevenue(listQueryParams)

  const rows = useMemo(() => (data?.data?.rows ?? []).map(mapPaymentToVenueRow), [data])
  const meta = data?.data?.meta

  const handleApplyFilters = useCallback((values: FilterValues) => {
    toast.success('Filters applied')
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      const result = await fetchFinanceRevenue(params)
      const payments = (result.data?.rows ?? []) as FinancePayment[]
      return { data: payments.map(mapPaymentToVenueRow) }
    }
    return createFinanceVenuesFilteredExportHandler(
      fetchForExport,
      FINANCE_VENUES_EXPORT_COLUMN_MAP,
      'finance_venues_export',
      { search: debouncedSearch || undefined },
      { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
    )
  }, [catalogColumnIds, debouncedSearch, exportColumnIds])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'finance-venues',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const visibleRowIds = useMemo(() => rows.map((row) => row.id), [rows])
  const allVisibleSelected =
    visibleRowIds.length > 0 && visibleRowIds.every((id) => selectedRowIds.includes(id))
  const someVisibleSelected = visibleRowIds.some((id) => selectedRowIds.includes(id))

  const toggleVisibleRows = useCallback(() => {
    setSelectedRowIds((currentIds) => {
      if (allVisibleSelected) {
        return currentIds.filter((id) => !visibleRowIds.includes(id))
      }
      return Array.from(new Set([...currentIds, ...visibleRowIds]))
    })
  }, [allVisibleSelected, visibleRowIds])

  const toggleRowSelection = useCallback((rowId: string) => {
    setSelectedRowIds((currentIds) =>
      currentIds.includes(rowId) ? currentIds.filter((id) => id !== rowId) : [...currentIds, rowId],
    )
  }, [])

  const renderActions = useCallback(
    (record: FinanceVenueRow) => {
      const isOpen = activeDropdownId === record.id

      return (
        <TableActionsDropdown
          label="Open venue record actions"
          isOpen={isOpen}
          onOpenChange={(open) => setActiveDropdownId(open ? record.id : null)}
          menuWidth={174}
        >
          <TableActionsItem
            icon={<Eye className="size-[18px] text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              navigate(`/finance/venues/${record.id}`)
            }}
          >
            View Details
          </TableActionsItem>
          <TableActionsItem
            icon={<Tag className="size-[18px] text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              setTagTarget(record)
            }}
          >
            Add Tags
          </TableActionsItem>
          <TableActionsItem
            icon={<AlertTriangle className="size-[18px] text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              setRowAction({ kind: 'escalate', id: record.id, resourceType: 'Payment' })
            }}
          >
            Escalate
          </TableActionsItem>
          <TableActionsItem
            icon={<Trash2 className="text-brand-danger size-[18px]" aria-hidden="true" />}
            className="text-brand-danger hover:bg-brand-danger/10 hover:text-brand-danger"
            onClick={() => {
              setActiveDropdownId(null)
              setRowAction({ kind: 'delete', id: record.id, resourceType: 'Payment' })
            }}
          >
            Delete
          </TableActionsItem>
        </TableActionsDropdown>
      )
    },
    [activeDropdownId, navigate],
  )

  const columns = useMemo<ColumnDef<FinanceVenueRow>[]>(() => {
    const selectColumn: ColumnDef<FinanceVenueRow> = {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          aria-label="Select all venue records"
          checked={allVisibleSelected}
          ref={(input) => {
            if (input) input.indeterminate = someVisibleSelected && !allVisibleSelected
          }}
          onChange={toggleVisibleRows}
          className="rounded border-slate-700 bg-transparent"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={`Select ${row.original.name}`}
          checked={selectedRowIds.includes(row.original.id)}
          onChange={() => toggleRowSelection(row.original.id)}
          onClick={(event) => event.stopPropagation()}
          className="rounded border-slate-700 bg-transparent"
        />
      ),
      meta: {
        headerClassName: 'pl-5',
        cellClassName: 'pl-5',
      },
    }

    const dataColumnsById: Record<string, ColumnDef<FinanceVenueRow>> = {
      'venue-id': {
        accessorKey: 'venueId',
        header: 'Venue ID',
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-brand-text font-mono uppercase">
            {row.original.venueId}
          </span>
        ),
      },
      name: {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => <span className="text-brand-text font-medium">{row.original.name}</span>,
      },
      owner: { accessorKey: 'owner', header: 'Owner' },
      'booking-id': {
        accessorKey: 'bookingId',
        header: 'Booking ID',
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-brand-text font-mono uppercase">
            {row.original.bookingId}
          </span>
        ),
      },
      'booking-title': { accessorKey: 'bookingTitle', header: 'Booking Title' },
      status: {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={cn(
              'text-body-sm-semibold inline-flex rounded-full border px-2.5 py-0.5',
              getStatusClassName(row.original.status),
            )}
          >
            {row.original.status}
          </span>
        ),
      },
      revenue: {
        accessorKey: 'revenue',
        header: 'Revenue',
        cell: ({ row }) => (
          <span className="text-brand-text font-semibold">{row.original.revenue}</span>
        ),
      },
      'transaction-id': { id: 'transaction-id', header: 'Transaction ID', cell: () => '—' },
      module: { id: 'module', header: 'Module', cell: () => '—' },
      'related-entity-id': {
        id: 'related-entity-id',
        header: 'Related Entity ID',
        cell: ({ row }) => row.original.venueId || '—',
      },
      'client-id': { id: 'client-id', header: 'Client ID', cell: () => '—' },
      'client-name': { id: 'client-name', header: 'Client Name', cell: () => '—' },
      'partner-id': { id: 'partner-id', header: 'Partner ID', cell: () => '—' },
      'partner-name': {
        id: 'partner-name',
        header: 'Partner Name',
        cell: ({ row }) => row.original.owner || '—',
      },
      'transaction-date': { id: 'transaction-date', header: 'Transaction Date', cell: () => '—' },
      'gross-amount': {
        id: 'gross-amount',
        header: 'Gross Amount',
        cell: ({ row }) => row.original.revenue || '—',
      },
      discount: { id: 'discount', header: 'Discount', cell: () => '—' },
      tax: { id: 'tax', header: 'Tax', cell: () => '—' },
      'gateway-charges': { id: 'gateway-charges', header: 'Gateway Charges', cell: () => '—' },
      'platform-commission-pct': {
        id: 'platform-commission-pct',
        header: 'Platform Commission %',
        cell: () => '—',
      },
      'platform-commission': {
        id: 'platform-commission',
        header: 'Platform Commission',
        cell: () => '—',
      },
      'partner-payout': { id: 'partner-payout', header: 'Partner Payout', cell: () => '—' },
      'refund-amount': { id: 'refund-amount', header: 'Refund Amount', cell: () => '—' },
      'net-revenue': { id: 'net-revenue', header: 'Net Revenue', cell: () => '—' },
      'net-profit': { id: 'net-profit', header: 'Net Profit', cell: () => '—' },
      'payment-method': { id: 'payment-method', header: 'Payment Method', cell: () => '—' },
      gateway: { id: 'gateway', header: 'Gateway', cell: () => '—' },
      'transaction-status': {
        id: 'transaction-status',
        header: 'Transaction Status',
        cell: ({ row }) => row.original.status || '—',
      },
      'settlement-status': {
        id: 'settlement-status',
        header: 'Settlement Status',
        cell: () => '—',
      },
      'settlement-date': { id: 'settlement-date', header: 'Settlement Date', cell: () => '—' },
      'invoice-id': { id: 'invoice-id', header: 'Invoice ID', cell: () => '—' },
    }

    const catalogIds = FINANCE_VENUES_TABLE_COLUMNS_CATALOG.map((column) => column.id)
    const rawVisibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_FINANCE_VENUES_VISIBLE_COLUMN_IDS
    const visibleIds = sortIdsByCatalogOrder(
      rawVisibleIds.filter((id) => catalogIds.includes(id)),
      catalogIds,
    )

    const preferenceColumns = visibleIds.map((id) => dataColumnsById[id]).filter(Boolean)

    const actionsColumn: ColumnDef<FinanceVenueRow> = {
      id: 'actions',
      header: 'Actions',
      meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
      cell: ({ row }) => renderActions(row.original),
    }

    return [selectColumn, ...preferenceColumns, actionsColumn]
  }, [
    allVisibleSelected,
    renderActions,
    selectedRowIds,
    someVisibleSelected,
    tableColumnPreferencesQuery.data,
    toggleRowSelection,
    toggleVisibleRows,
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-h2 text-brand-text tracking-tight">Venues</h1>
          <p className="text-body-sm text-muted mt-1 leading-[20px]">
            Manage venue bookings, rentals, deposits, and payments
          </p>
          <p className="text-body-sm text-muted mt-3 leading-[20px]">
            <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
              Finance Management
            </Link>
            <span> / </span>
            <span className="text-brand-text font-semibold">Venues</span>
          </p>
        </div>
        <Button
          className="ui-manage-metrics"
          onClick={() => navigate('/metrics/finance-venues?section=table')}
        >
          <SlidersHorizontal className="size-4" />
          Manage Metrics
        </Button>
      </div>

      {isError ? (
        <p className="text-body-sm text-brand-danger">Failed to load venue records.</p>
      ) : null}

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        isLoading={isLoading || isFetching}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, ID or profession"
        advancedFilterLabel="Advance Filters"
        onAdvancedFilter={onAdvancedFilter}
        advancedFilterVariant="primary"
        onExport={onExport}
        pagination={{
          page: meta?.page ?? currentPage,
          pageSize: meta?.limit ?? PAGE_SIZE,
          totalItems: meta?.total ?? 0,
          totalPages: meta?.totalPages ?? 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="venues"
        emptyMessage="No venue records found."
      />

      <AddTagsModal
        open={!!tagTarget}
        entityLabel="venue payment"
        onClose={() => setTagTarget(null)}
        onSubmit={async ({ tags, adminNotes }) => {
          if (!tagTarget) return
          try {
            await addNote.mutateAsync({
              id: tagTarget.id,
              resourceType: 'Payment',
              adminNote: `[Tags: ${tags.join(', ')}] ${adminNotes}`,
            })
            toast.success('Tags added')
            setTagTarget(null)
          } catch (err) {
            const msg =
              (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
              'Failed to add tags'
            toast.error(msg)
            throw err
          }
        }}
      />

      <FinanceEscalateDeleteModal
        action={rowAction}
        onClose={() => setRowAction(null)}
        escalate={escalate}
        softDelete={softDelete}
      />

      {exportFilterModals}
    </div>
  )
}
