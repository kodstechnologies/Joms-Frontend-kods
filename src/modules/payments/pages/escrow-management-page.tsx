import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, SlidersHorizontal } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  escrowBookingRowsMock,
  escrowManagementTabs,
  type EscrowBookingRow,
  type EscrowHoldRow,
  type EscrowHoldStatus,
  type EscrowManagementTab,
} from '@/modules/payments/mock/finance-escrow.mock'
import { fetchFinanceEscrow } from '@/modules/payments/api/finance-api'
import { useFinanceEscrow } from '@/modules/payments/hooks/use-finance'
import { mapEscrowToRow } from '@/modules/payments/utils/finance-mappers'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { buildCatalogSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { FINANCE_ESCROW_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import type { FilterValues } from '@/shared/types/data-filter'
import { FINANCE_ESCROW_EXPORT_COLUMN_MAP } from '@/modules/payments/utils/finance-export-column-maps'
import {
  buildFinanceEscrowListQueryParams,
  createFinanceEscrowFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import {
  DEFAULT_FINANCE_ESCROW_VISIBLE_COLUMN_IDS,
  FINANCE_ESCROW_LEGACY_COLUMN_ID_MAP,
  FINANCE_ESCROW_MODULE_KEY,
  FINANCE_ESCROW_TABLE_COLUMNS_CATALOG,
} from '@/modules/payments/config/finance-escrow-table-columns.config'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'

const PAGE_SIZE = 10

const SORT_FIELD_MAP = buildCatalogSortFieldMap(FINANCE_ESCROW_TABLE_COLUMNS_CATALOG)

function getEscrowStatusClassName(status: EscrowHoldStatus) {
  if (status === 'Active' || status === 'Released') {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  return 'border-brand-accent/25 bg-brand-accent/10 text-brand-accent'
}

function getBookingStatusClassName(status: EscrowBookingRow['status']) {
  if (status === 'Paid') {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  return 'border-brand-accent/25 bg-brand-accent/10 text-brand-accent'
}

export function EscrowManagementPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<EscrowManagementTab>('escrow')
  const [currentPage, setCurrentPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: SORT_FIELD_MAP,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])

  const isEscrowTab = activeTab === 'escrow' || activeTab === 'all'

  const listQueryParams = useMemo(
    () =>
      buildFinanceEscrowListQueryParams(appliedFilters, {
        page: currentPage,
        limit: PAGE_SIZE,
        ...enhancedSearch.buildSearchParams(),
        ...serverSort.sortParams,
      }),
    [appliedFilters, currentPage, enhancedSearch, serverSort.sortParams],
  )

  const {
    data: escrowData,
    isLoading,
    isFetching,
    isError,
  } = useFinanceEscrow(listQueryParams, isEscrowTab)

  const tableColumnPreferencesQuery = useTableColumnPreferences(FINANCE_ESCROW_MODULE_KEY)

  const catalogColumnIds = useMemo(
    () => FINANCE_ESCROW_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_FINANCE_ESCROW_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
    legacyColumnIdMap: FINANCE_ESCROW_LEGACY_COLUMN_ID_MAP,
  })

  const liveEscrowRows = useMemo(
    () => (escrowData?.data?.rows ?? []).map(mapEscrowToRow),
    [escrowData],
  )
  const escrowMeta = escrowData?.data?.meta

  const handleApplyFilters = useCallback((values: FilterValues) => {
    toast.success('Filters applied')
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      const result = await fetchFinanceEscrow(params)
      return { data: (result.data?.rows ?? []).map(mapEscrowToRow) }
    }
    return createFinanceEscrowFilteredExportHandler(
      fetchForExport,
      FINANCE_ESCROW_EXPORT_COLUMN_MAP,
      'finance_escrow_export',
      { search: enhancedSearch.globalSearch || undefined },
      { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
    )
  }, [catalogColumnIds, enhancedSearch.globalSearch, exportColumnIds])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'finance-escrow',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const escrowTabRows = useMemo(() => {
    if (activeTab === 'escrow' || activeTab === 'all') return liveEscrowRows
    return []
  }, [activeTab, liveEscrowRows])

  const bookingTabRows = useMemo(
    () => escrowBookingRowsMock.filter((row) => row.tab === activeTab),
    [activeTab],
  )

  const filteredEscrowRows = escrowTabRows

  const filteredBookingRows = useMemo(() => {
    const query = enhancedSearch.globalSearch.trim().toLowerCase()
    if (!query) return bookingTabRows

    return bookingTabRows.filter((row) =>
      [row.serviceId, row.name, row.expertName, row.bookingId, row.userName]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [bookingTabRows, enhancedSearch.globalSearch])

  const totalItems = isEscrowTab
    ? (escrowMeta?.total ?? filteredEscrowRows.length)
    : filteredBookingRows.length
  const totalPages = isEscrowTab
    ? (escrowMeta?.totalPages ?? 1)
    : Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)

  const pageEscrowRows = filteredEscrowRows

  const pageBookingRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredBookingRows.slice(start, start + PAGE_SIZE)
  }, [filteredBookingRows, safePage])

  const pageRows = isEscrowTab ? pageEscrowRows : pageBookingRows
  const visibleRowIds = useMemo(() => pageRows.map((row) => row.id), [pageRows])
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

  const renderEscrowActions = useCallback(
    (record: EscrowHoldRow) => {
      const isOpen = activeDropdownId === record.id

      return (
        <TableActionsDropdown
          label="Open escrow record actions"
          isOpen={isOpen}
          onOpenChange={(open) => setActiveDropdownId(open ? record.id : null)}
          menuWidth={180}
        >
          <TableActionsItem
            icon={<Eye className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              navigate(`/finance/escrow/${record.id}`)
            }}
          >
            View Details
          </TableActionsItem>
        </TableActionsDropdown>
      )
    },
    [activeDropdownId, navigate],
  )

  const renderBookingActions = useCallback(
    (record: EscrowBookingRow) => {
      const isOpen = activeDropdownId === record.id

      return (
        <TableActionsDropdown
          label="Open booking record actions"
          isOpen={isOpen}
          onOpenChange={(open) => setActiveDropdownId(open ? record.id : null)}
          menuWidth={180}
        >
          <TableActionsItem
            icon={<Eye className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              navigate(`/finance/escrow/${record.id}`)
            }}
          >
            View Details
          </TableActionsItem>
        </TableActionsDropdown>
      )
    },
    [activeDropdownId, navigate],
  )

  const escrowColumns = useMemo<ColumnDef<EscrowHoldRow>[]>(() => {
    const selectColumn: ColumnDef<EscrowHoldRow> = {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          aria-label="Select all escrow records"
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
          aria-label={`Select ${row.original.escrowId}`}
          checked={selectedRowIds.includes(row.original.id)}
          onChange={() => toggleRowSelection(row.original.id)}
          onClick={(event) => event.stopPropagation()}
          className="rounded border-slate-700 bg-transparent"
        />
      ),
      meta: { headerClassName: 'pl-5', cellClassName: 'pl-5' },
    }

    const dataColumnsById: Record<string, ColumnDef<EscrowHoldRow>> = {
      'escrow-id': {
        accessorKey: 'escrowId',
        header: 'Escrow ID',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-brand-text font-mono uppercase">
            {row.original.escrowId}
          </span>
        ),
      },
      'transaction-id': {
        accessorKey: 'transactionId',
        header: 'Transaction ID',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-muted font-mono">
            {row.original.transactionId}
          </span>
        ),
      },
      module: {
        id: 'module',
        accessorKey: 'type',
        header: 'Module',
        enableSorting: false,
      },
      amount: {
        accessorKey: 'amount',
        header: 'Amount',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-brand-text font-semibold">{row.original.amount}</span>
        ),
      },
      'hold-reason': {
        accessorKey: 'holdReason',
        header: 'Hold Reason',
        enableSorting: false,
      },
      'hold-created-at': {
        id: 'hold-created-at',
        accessorKey: 'initiatedDate',
        header: 'Hold Created At',
      },
      'expected-release': {
        accessorKey: 'expectedRelease',
        header: 'Expected Release',
        enableSorting: false,
      },
      'released-at': {
        id: 'released-at',
        header: 'Released At',
        cell: ({ row }) => (row.original as { releasedAt?: string }).releasedAt || '—',
      },
      'release-status': {
        id: 'release-status',
        accessorKey: 'status',
        header: 'Release Status',
        cell: ({ row }) => (
          <span
            className={cn(
              'text-body-sm-semibold inline-flex rounded-full border px-2.5 py-0.5',
              getEscrowStatusClassName(row.original.status),
            )}
          >
            {row.original.status}
          </span>
        ),
      },
      'created-by': {
        id: 'created-by',
        header: 'Created By',
        cell: ({ row }) => (row.original as { createdBy?: string }).createdBy || '—',
      },
      'last-updated': {
        id: 'last-updated',
        header: 'Last Updated',
        cell: ({ row }) => (row.original as { lastUpdated?: string }).lastUpdated || '—',
      },
    }

    const catalogIds = FINANCE_ESCROW_TABLE_COLUMNS_CATALOG.map((column) => column.id)
    const rawVisibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_FINANCE_ESCROW_VISIBLE_COLUMN_IDS
    const visibleIds = sortIdsByCatalogOrder(
      [...new Set(rawVisibleIds.map((id) => FINANCE_ESCROW_LEGACY_COLUMN_ID_MAP[id] ?? id))].filter(
        (id) => catalogIds.includes(id),
      ),
      catalogIds,
    )

    const preferenceColumns = visibleIds.map((id) => dataColumnsById[id]).filter(Boolean)

    const actionsColumn: ColumnDef<EscrowHoldRow> = {
      id: 'actions',
      header: 'Actions',
      meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
      cell: ({ row }) => renderEscrowActions(row.original),
    }

    return withServerSortMeta([selectColumn, ...preferenceColumns, actionsColumn], SORT_FIELD_MAP)
  }, [
    allVisibleSelected,
    renderEscrowActions,
    selectedRowIds,
    someVisibleSelected,
    tableColumnPreferencesQuery.data,
    toggleRowSelection,
    toggleVisibleRows,
  ])

  const bookingColumns = useMemo<ColumnDef<EscrowBookingRow>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            aria-label="Select all booking records"
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
        meta: { headerClassName: 'pl-5', cellClassName: 'pl-5' },
      },
      {
        accessorKey: 'serviceId',
        header: 'Service ID',
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-brand-text font-mono uppercase">
            {row.original.serviceId}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => <span className="text-brand-text font-medium">{row.original.name}</span>,
      },
      { accessorKey: 'expertName', header: 'Expert Name' },
      {
        accessorKey: 'bookingId',
        header: 'Booking ID',
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-brand-text font-mono uppercase">
            {row.original.bookingId}
          </span>
        ),
      },
      { accessorKey: 'userName', header: 'User Name' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={cn(
              'text-body-sm-semibold inline-flex rounded-full border px-2.5 py-0.5',
              getBookingStatusClassName(row.original.status),
            )}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: 'revenue',
        header: 'Revenue',
        cell: ({ row }) => (
          <span className="text-brand-text font-semibold">{row.original.revenue}</span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
        cell: ({ row }) => renderBookingActions(row.original),
      },
    ],
    [
      allVisibleSelected,
      renderBookingActions,
      selectedRowIds,
      someVisibleSelected,
      toggleRowSelection,
      toggleVisibleRows,
    ],
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-h2 text-brand-text tracking-tight">Escrow Management</h1>
          <p className="text-body-md text-muted mt-1 leading-[20px]">
            Track revenue, payouts, and financial performance
          </p>
          <p className="text-body-sm text-muted mt-3 leading-[20px]">
            <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
              Finance Management
            </Link>
            <span> / </span>
            <Link to="/finance/services" className="hover:text-brand-text transition-colors">
              Services
            </Link>
          </p>
        </div>
        <Button className="ui-manage-metrics" onClick={() => navigate('/metrics/finance-escrow')}>
          <SlidersHorizontal className="size-4" />
          Manage Metrics
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {escrowManagementTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id)
              setCurrentPage(1)
              enhancedSearch.clearAll()
              setSelectedRowIds([])
              setAppliedFilters({})
            }}
            className={cn(
              'radius-md text-body-sm-semibold px-4 py-2 transition-colors',
              activeTab === tab.id
                ? 'bg-brand-surface text-brand-text'
                : 'text-muted hover:text-brand-text',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isError && isEscrowTab ? (
        <p className="text-body-sm text-brand-danger">Failed to load escrow holds.</p>
      ) : null}

      {isEscrowTab ? (
        <DataTable
          columns={escrowColumns}
          data={pageEscrowRows}
          getRowId={(row) => row.id}
          {...serverSort.dataTableSortProps}
          isLoading={isLoading || isFetching}
          searchValue={enhancedSearch.globalSearch}
          onSearchChange={enhancedSearch.setGlobalSearch}
          searchableColumns={FINANCE_ESCROW_SEARCH_COLUMNS}
          columnSearches={enhancedSearch.columnSearches}
          onColumnSearchChange={enhancedSearch.setColumnSearch}
          onColumnSearchRemove={enhancedSearch.removeColumnSearch}
          onClearAllSearches={enhancedSearch.clearAll}
          searchPlaceholder="Search by name, ID or profession"
          advancedFilterLabel="Advance Filters"
          onAdvancedFilter={onAdvancedFilter}
          advancedFilterVariant="primary"
          onExport={onExport}
          pagination={{
            page: escrowMeta?.page ?? safePage,
            pageSize: escrowMeta?.limit ?? PAGE_SIZE,
            totalItems,
            totalPages,
            onPageChange: setCurrentPage,
          }}
          resourceLabel="escrow holds"
          emptyMessage="No escrow records found."
        />
      ) : (
        <DataTable
          columns={bookingColumns}
          data={pageBookingRows}
          getRowId={(row) => row.id}
          {...serverSort.dataTableSortProps}
          searchValue={enhancedSearch.globalSearch}
          onSearchChange={enhancedSearch.setGlobalSearch}
          searchableColumns={FINANCE_ESCROW_SEARCH_COLUMNS}
          columnSearches={enhancedSearch.columnSearches}
          onColumnSearchChange={enhancedSearch.setColumnSearch}
          onColumnSearchRemove={enhancedSearch.removeColumnSearch}
          onClearAllSearches={enhancedSearch.clearAll}
          searchPlaceholder="Search by name, ID or profession"
          advancedFilterLabel="Advance Filters"
          onAdvancedFilter={onAdvancedFilter}
          advancedFilterVariant="primary"
          onExport={onExport}
          pagination={{
            page: safePage,
            pageSize: PAGE_SIZE,
            totalItems,
            totalPages,
            onPageChange: setCurrentPage,
          }}
          resourceLabel="users"
          emptyMessage="No booking records found."
        />
      )}

      {exportFilterModals}
    </div>
  )
}
