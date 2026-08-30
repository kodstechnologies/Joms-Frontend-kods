import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, SlidersHorizontal } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useFinanceRowSelection } from '@/modules/payments/hooks/use-finance-row-selection'
import { financeEventRowsMock } from '@/modules/payments/mock/finance-events.mock'
import type {
  FinanceEventRow,
  FinanceEventStatus,
} from '@/modules/payments/types/finance-table-rows'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { sortClientRows, withServerSortMeta } from '@/shared/utils/table-sort'
import { buildCatalogSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { FINANCE_EVENTS_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import type { FilterValues } from '@/shared/types/data-filter'
import { FINANCE_EVENTS_EXPORT_COLUMN_MAP } from '@/modules/payments/utils/finance-export-column-maps'
import {
  createClientFilteredExportHandler,
  rowMatchesClientFilters,
} from '@/shared/utils/export-filter-utils'
import {
  DEFAULT_FINANCE_EVENTS_VISIBLE_COLUMN_IDS,
  FINANCE_EVENTS_LEGACY_COLUMN_ID_MAP,
  FINANCE_EVENTS_MODULE_KEY,
  FINANCE_EVENTS_TABLE_COLUMNS_CATALOG,
} from '@/modules/payments/config/finance-events-table-columns.config'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'

const PAGE_SIZE = 10

const FINANCE_EVENTS_SORT_FIELD_MAP = buildCatalogSortFieldMap(FINANCE_EVENTS_TABLE_COLUMNS_CATALOG)

const EVENT_FILTER_ACCESSORS: Record<string, (row: FinanceEventRow) => string> = {
  eventId: (row) => row.eventId,
  eventName: (row) => row.eventName,
  organizer: (row) => row.organizer,
  status: (row) => row.status,
  eventDate: (row) => row.eventDate,
}

type FinanceEventTab = 'all' | 'ticketing' | 'promotions' | 'publishing'
const financeEventTabs: Array<{ id: FinanceEventTab; label: string }> = [
  { id: 'all', label: 'All Transaction' },
  { id: 'ticketing', label: 'Ticketing' },
  { id: 'promotions', label: 'Promotions' },
  { id: 'publishing', label: 'Publishing' },
]

function getStatusClassName(status: FinanceEventStatus) {
  if (status === 'Paid') return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  if (status === 'Pending') return 'border-brand-accent/25 bg-brand-accent/10 text-brand-accent'
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

export function FinanceEventsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<FinanceEventTab>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: FINANCE_EVENTS_SORT_FIELD_MAP,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  const tableColumnPreferencesQuery = useTableColumnPreferences(FINANCE_EVENTS_MODULE_KEY)

  const catalogColumnIds = useMemo(
    () => FINANCE_EVENTS_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_FINANCE_EVENTS_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
    legacyColumnIdMap: FINANCE_EVENTS_LEGACY_COLUMN_ID_MAP,
  })

  const filteredRows = useMemo(
    () =>
      financeEventRowsMock.filter((row) => {
        if (
          !rowMatchesClientFilters(
            row,
            appliedFilters,
            enhancedSearch.globalSearch,
            EVENT_FILTER_ACCESSORS,
          )
        ) {
          return false
        }
        for (const [colId, val] of Object.entries(enhancedSearch.columnSearches)) {
          if (!val) continue
          const cellVal = String((row as Record<string, unknown>)[colId] ?? '').toLowerCase()
          if (!cellVal.includes(val.toLowerCase())) return false
        }
        return true
      }),
    [appliedFilters, enhancedSearch.columnSearches, enhancedSearch.globalSearch],
  )

  const sortedRows = useMemo(
    () =>
      sortClientRows(
        filteredRows as Array<FinanceEventRow & Record<string, unknown>>,
        serverSort.sortBy,
        serverSort.sortOrder,
      ),
    [filteredRows, serverSort.sortBy, serverSort.sortOrder],
  )

  const totalItems = sortedRows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return sortedRows.slice(start, start + PAGE_SIZE)
  }, [sortedRows, safePage])

  const {
    selectedRowIds,
    setSelectedRowIds,
    allVisibleSelected,
    someVisibleSelected,
    toggleVisibleRows,
    toggleRowSelection,
  } = useFinanceRowSelection(pageRows)

  function handleApplyFilters(values: FilterValues) {
    toast.success('Filters applied')
    setAppliedFilters(values)
    setCurrentPage(1)
  }

  const handleExportData = useMemo(
    () =>
      createClientFilteredExportHandler(
        (values) =>
          financeEventRowsMock.filter((row) =>
            rowMatchesClientFilters(
              row,
              values,
              enhancedSearch.globalSearch,
              EVENT_FILTER_ACCESSORS,
            ),
          ),
        FINANCE_EVENTS_EXPORT_COLUMN_MAP,
        'finance_events_export',
        { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
      ),
    [catalogColumnIds, enhancedSearch.globalSearch, exportColumnIds],
  )

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'finance-events',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const renderActions = useCallback(
    (record: FinanceEventRow) => (
      <TableActionsDropdown
        label="Open event finance actions"
        isOpen={activeDropdownId === record.id}
        onOpenChange={(open) => setActiveDropdownId(open ? record.id : null)}
        menuWidth={174}
      >
        <TableActionsItem
          icon={<Eye className="size-[18px] text-slate-700" aria-hidden="true" />}
          className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => {
            setActiveDropdownId(null)
            toast.message('Event payment detail coming soon')
          }}
        >
          View Details
        </TableActionsItem>
      </TableActionsDropdown>
    ),
    [activeDropdownId],
  )

  const columns = useMemo<ColumnDef<FinanceEventRow>[]>(() => {
    const selectColumn: ColumnDef<FinanceEventRow> = {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          aria-label="Select all events"
          checked={allVisibleSelected}
          ref={(input) => {
            if (input) input.indeterminate = someVisibleSelected && !allVisibleSelected
          }}
          onChange={toggleVisibleRows}
          className="h-[18px] w-[18px] rounded border-slate-700 bg-transparent"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={`Select ${row.original.eventName}`}
          checked={selectedRowIds.includes(row.original.id)}
          onChange={() => toggleRowSelection(row.original.id)}
          onClick={(event) => event.stopPropagation()}
          className="h-[18px] w-[18px] rounded border-slate-700 bg-transparent"
        />
      ),
      meta: { headerClassName: 'pl-5', cellClassName: 'pl-5' },
    }

    const dataColumnsById: Record<string, ColumnDef<FinanceEventRow>> = {
      'promotion-id': {
        id: 'promotion-id',
        accessorKey: 'eventId',
        header: 'Promotion ID',
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-brand-text font-mono uppercase">
            {row.original.eventId}
          </span>
        ),
      },
      module: { id: 'module', header: 'Module', cell: () => 'Events' },
      'promotion-type': { id: 'promotion-type', header: 'Promotion Type', cell: () => '—' },
      'entity-name': {
        id: 'entity-name',
        accessorKey: 'eventName',
        header: 'Entity Name',
      },
      'start-date': {
        id: 'start-date',
        accessorKey: 'eventDate',
        header: 'Start Date',
      },
      'end-date': { id: 'end-date', header: 'End Date', cell: () => '—' },
      'amount-paid': {
        id: 'amount-paid',
        accessorKey: 'ticketSales',
        header: 'Amount Paid',
        cell: ({ row }) => (
          <span className="text-brand-text font-semibold">{row.original.ticketSales}</span>
        ),
      },
      'payment-method': { id: 'payment-method', header: 'Payment Method', cell: () => '—' },
      revenue: {
        id: 'revenue',
        accessorKey: 'netRevenue',
        header: 'Revenue',
        cell: ({ row }) => row.original.netRevenue,
      },
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
    }

    const catalogIds = FINANCE_EVENTS_TABLE_COLUMNS_CATALOG.map((column) => column.id)
    const rawVisibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_FINANCE_EVENTS_VISIBLE_COLUMN_IDS
    const visibleIds = sortIdsByCatalogOrder(
      [...new Set(rawVisibleIds.map((id) => FINANCE_EVENTS_LEGACY_COLUMN_ID_MAP[id] ?? id))].filter(
        (id) => catalogIds.includes(id),
      ),
      catalogIds,
    )

    const preferenceColumns = visibleIds.map((id) => dataColumnsById[id]).filter(Boolean)

    const actionsColumn: ColumnDef<FinanceEventRow> = {
      id: 'actions',
      header: 'Actions',
      meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
      cell: ({ row }) => renderActions(row.original),
    }

    return withServerSortMeta(
      [selectColumn, ...preferenceColumns, actionsColumn],
      FINANCE_EVENTS_SORT_FIELD_MAP,
    )
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
          <h1 className="text-h2 text-brand-text tracking-tight">Events</h1>
          <p className="text-body-sm text-muted mt-1 leading-[20px]">
            Manage and monitor all financial transactions
          </p>
          <p className="text-body-sm text-muted mt-3 leading-[20px]">
            <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
              Finance Management
            </Link>
            <span> / </span>
            <span className="text-brand-text font-semibold">Events</span>
          </p>
        </div>
        <Button className="ui-manage-metrics" onClick={() => navigate('/metrics/finance-events')}>
          <SlidersHorizontal className="size-4" />
          Manage Metrics
        </Button>
      </div>

      <div className="radius-lg bg-brand-surface flex h-[47px] w-full max-w-[1268px] items-center justify-around border border-white/[0.06] p-1">
        {financeEventTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id)
              setCurrentPage(1)
              enhancedSearch.clearAll()
              setSelectedRowIds([])
            }}
            className={cn(
              'text-body-sm flex h-[37px] min-w-[169px] items-center justify-center rounded-md px-10 leading-[20px] transition-colors',
              activeTab === tab.id
                ? 'border border-white/5 bg-[#141414] font-medium text-white'
                : 'text-[#FFFFFF] opacity-50 hover:opacity-100',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={pageRows}
        getRowId={(row) => row.id}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={FINANCE_EVENTS_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by name, ID or profession"
        advancedFilterLabel="Advance Filters"
        onAdvancedFilter={onAdvancedFilter}
        advancedFilterVariant="primary"
        onExport={onExport}
        {...serverSort.dataTableSortProps}
        pagination={{
          page: safePage,
          pageSize: PAGE_SIZE,
          totalItems,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="events"
        emptyMessage="No event finance records found."
      />

      {exportFilterModals}
    </div>
  )
}
