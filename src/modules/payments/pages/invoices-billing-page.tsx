import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Bell, Download, Eye } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'
import { ensureTrendChangeSign, TrendBadge } from '@/shared/components/dashboard/trend-badge'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import { useBranding } from '@/app/providers/use-branding'
import type { InvoiceRow } from '@/modules/payments/types/finance-table-rows'
import { fetchFinanceInvoiceById, fetchFinanceInvoices } from '@/modules/payments/api/finance-api'
import { useFinanceInvoices } from '@/modules/payments/hooks/use-finance'
import { useFinanceRowSelection } from '@/modules/payments/hooks/use-finance-row-selection'
import { formatInr, mapInvoiceToRow } from '@/modules/payments/utils/finance-mappers'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { FINANCE_INVOICES_TABLE_COLUMNS_CATALOG } from '@/modules/payments/config/finance-invoices-table-columns.config'
import { FINANCE_INVOICE_SORT_OVERRIDES } from '@/modules/payments/config/finance-table-sort-fields'
import { buildCatalogSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { FINANCE_INVOICES_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { StatCardSkeleton } from '@/shared/components/ui/skeleton'
import type { FilterValues } from '@/shared/types/data-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildFinanceInvoicesListQueryParams,
  createFinanceInvoicesFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import { downloadInvoiceDocument, invoiceFromFinanceInvoice } from '@/shared/utils/invoice-document'
import { FinanceTableStatusBadge } from '@/modules/payments/components/finance-table-status-badge'
import {
  FINANCE_DATA_TABLE_CLASS,
  FINANCE_TABLE_CELL_CLASS,
} from '@/modules/payments/constants/finance-table-styles'
import { FinanceTableCellText } from '@/modules/payments/components/finance-table-cell-text'

const PAGE_SIZE = 10

const SORT_FIELD_MAP = buildCatalogSortFieldMap(
  FINANCE_INVOICES_TABLE_COLUMNS_CATALOG,
  FINANCE_INVOICE_SORT_OVERRIDES,
)

const EXPORT_COLUMN_MAP: Record<string, { header: string; accessor: (row: InvoiceRow) => string }> =
  {
    invoiceId: { header: 'Invoice ID', accessor: (row) => exportDisplayValue(row.invoiceId) },
    clientName: { header: 'Client Name', accessor: (row) => exportDisplayValue(row.clientName) },
    amount: { header: 'Amount', accessor: (row) => exportDisplayValue(row.amount) },
    issueDate: { header: 'Issue Date', accessor: (row) => exportDisplayValue(row.issueDate) },
    dueDate: { header: 'Due Date', accessor: (row) => exportDisplayValue(row.dueDate) },
    description: { header: 'Description', accessor: (row) => exportDisplayValue(row.description) },
    status: { header: 'Status', accessor: (row) => exportDisplayValue(row.status) },
  }

function SummaryCard({
  label,
  value,
  change,
  changeNote,
}: {
  label: string
  value: string
  change: string
  changeNote: string
}) {
  const isDown = change.trim().startsWith('-')
  const direction = isDown ? 'down' : 'up'
  return (
    <div className="flex h-[130px] w-full max-w-[280px] min-w-0 flex-col rounded-[10px] bg-[#141414] p-2.5">
      <p className="text-[14px] leading-5 font-medium tracking-normal text-[#FFFFFF80]">{label}</p>
      <p className="mt-2.5 text-[20px] leading-5 font-semibold tracking-normal text-white">
        {value}
      </p>
      <div className="mt-auto flex items-center gap-[10px] pt-2">
        <TrendBadge direction={direction}>{ensureTrendChangeSign(change, direction)}</TrendBadge>
        <span className="text-[14px] leading-5 font-medium tracking-normal text-[#FFFFFF80]">
          {changeNote}
        </span>
      </div>
    </div>
  )
}

export function InvoicesBillingPage() {
  const navigate = useNavigate()
  const { logoUrl } = useBranding()
  const [currentPage, setCurrentPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: SORT_FIELD_MAP,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  const listQueryParams = useMemo(
    () =>
      buildFinanceInvoicesListQueryParams(appliedFilters, {
        page: currentPage,
        limit: PAGE_SIZE,
        ...enhancedSearch.buildSearchParams(),
        ...serverSort.sortParams,
      }),
    [appliedFilters, currentPage, enhancedSearch, serverSort.sortParams],
  )

  const { data, isLoading, isFetching, isError } = useFinanceInvoices(listQueryParams)

  const rows = useMemo(() => (data?.data?.rows ?? []).map(mapInvoiceToRow), [data])
  const meta = data?.data?.meta

  const {
    selectedRowIds,
    allVisibleSelected,
    someVisibleSelected,
    toggleVisibleRows,
    toggleRowSelection,
  } = useFinanceRowSelection(rows)

  function handleApplyFilters(values: FilterValues) {
    toast.success('Filters applied')
    setAppliedFilters(values)
    setCurrentPage(1)
  }

  const handleExportData = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      const result = await fetchFinanceInvoices(params)
      return { data: (result.data?.rows ?? []).map(mapInvoiceToRow) }
    }
    return createFinanceInvoicesFilteredExportHandler(
      fetchForExport,
      EXPORT_COLUMN_MAP,
      'finance_invoices_export',
      { search: enhancedSearch.globalSearch || undefined },
    )
  }, [enhancedSearch.globalSearch])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'finance-invoices',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })
  const invoiceSummaryMetrics = [
    {
      label: 'Total Invoices',
      value: String(meta?.total ?? 0),
      change: '—',
      changeNote: 'all invoices',
    },
    {
      label: 'Amount Paid',
      value: formatInr(
        rows
          .filter((r) => r.status === 'Paid')
          .reduce((sum, r) => sum + (Number(String(r.amount).replace(/[^\d.]/g, '')) || 0), 0),
      ),
      change: '—',
      changeNote: 'this page',
    },
    {
      label: 'Pending',
      value: String(rows.filter((r) => r.status === 'Pending').length),
      change: '—',
      changeNote: 'this page',
    },
    {
      label: 'Overdue',
      value: String(rows.filter((r) => r.status === 'Overdue').length),
      change: '—',
      changeNote: 'this page',
    },
  ]

  const renderActions = useCallback(
    (record: InvoiceRow) => (
      <TableActionsDropdown
        label="Open invoice actions"
        isOpen={activeDropdownId === record.id}
        onOpenChange={(open) => setActiveDropdownId(open ? record.id : null)}
        menuWidth={200}
      >
        <TableActionsItem
          icon={<Eye className="size-3.5 text-slate-700" aria-hidden="true" />}
          className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => {
            setActiveDropdownId(null)
            navigate(`/finance/invoices/${encodeURIComponent(record.id)}`)
          }}
        >
          View Invoice
        </TableActionsItem>
        <TableActionsItem
          icon={<Download className="size-3.5 text-slate-700" aria-hidden="true" />}
          className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => {
            setActiveDropdownId(null)
            void fetchFinanceInvoiceById(record.id)
              .then(async (result) => {
                const invoice = result.data
                if (!invoice) throw new Error('Invoice not found')
                await downloadInvoiceDocument(
                  invoiceFromFinanceInvoice(invoice, { logoUrl }),
                  invoice.invoiceNumber,
                )
                toast.success('Invoice downloaded')
              })
              .catch((error) =>
                toast.error(getApiErrorMessage(error, 'Failed to download invoice')),
              )
          }}
        >
          Download Invoice
        </TableActionsItem>
        <TableActionsItem
          icon={<Bell className="size-3.5 text-slate-700" aria-hidden="true" />}
          className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => {
            setActiveDropdownId(null)
            toast.message('Reminder set (static preview)')
          }}
        >
          Set Reminder
        </TableActionsItem>
      </TableActionsDropdown>
    ),
    [activeDropdownId, logoUrl, navigate],
  )

  const columns = useMemo<ColumnDef<InvoiceRow>[]>(
    () =>
      withServerSortMeta(
        [
          {
            id: 'select',
            header: () => (
              <input
                type="checkbox"
                aria-label="Select all invoices"
                checked={allVisibleSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someVisibleSelected && !allVisibleSelected
                }}
                onChange={toggleVisibleRows}
                className="ui-table-checkbox"
              />
            ),
            cell: ({ row }) => (
              <input
                type="checkbox"
                aria-label={`Select ${row.original.clientName}`}
                checked={selectedRowIds.includes(row.original.id)}
                onChange={() => toggleRowSelection(row.original.id)}
                onClick={(event) => event.stopPropagation()}
                className="ui-table-checkbox"
              />
            ),
            meta: { headerClassName: 'pl-5', cellClassName: 'pl-5' },
          },
          {
            accessorKey: 'invoiceId',
            header: 'Invoice ID',
            cell: ({ row }) => (
              <span className={cn(FINANCE_TABLE_CELL_CLASS, 'font-mono uppercase')}>
                {row.original.invoiceId}
              </span>
            ),
          },
          {
            accessorKey: 'clientName',
            header: 'Client Name',
            cell: ({ row }) => (
              <FinanceTableCellText>{row.original.clientName}</FinanceTableCellText>
            ),
          },
          {
            accessorKey: 'amount',
            header: 'Amount',
            cell: ({ row }) => (
              <span className={cn(FINANCE_TABLE_CELL_CLASS, 'font-semibold')}>
                {row.original.amount}
              </span>
            ),
          },
          {
            accessorKey: 'issueDate',
            header: 'Issue Date',
            cell: ({ row }) => (
              <FinanceTableCellText>{row.original.issueDate}</FinanceTableCellText>
            ),
          },
          {
            accessorKey: 'dueDate',
            header: 'Due Date',
            cell: ({ row }) => <FinanceTableCellText>{row.original.dueDate}</FinanceTableCellText>,
          },
          {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => (
              <FinanceTableCellText>{row.original.description}</FinanceTableCellText>
            ),
          },
          {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => <FinanceTableStatusBadge status={row.original.status} />,
          },
          {
            id: 'actions',
            header: 'Actions',
            meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
            cell: ({ row }) => renderActions(row.original),
          },
        ],
        SORT_FIELD_MAP,
      ),
    [
      allVisibleSelected,
      renderActions,
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
          <h1 className="text-h2 text-brand-text tracking-tight">Invoices & Billing</h1>
          <p className="ui-page-subtitle mt-1 text-[16px] leading-5 font-medium tracking-normal text-[#FFFFFF80]">
            Track revenue, payouts, and financial performance
          </p>
          <p className="text-body-sm text-muted mt-3 leading-[20px]">
            <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
              Payment & Finance
            </Link>
            <span> / </span>
            <span className="text-brand-text font-semibold">Invoices & Billing</span>
          </p>
        </div>
        <Button className="ui-manage-metrics" onClick={() => navigate('/metrics/finance-invoices')}>
          <ManageMetricsIcon />
          Manage Metrics
        </Button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] justify-items-start gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <StatCardSkeleton
                key={`invoice-skel-${idx}`}
                className="h-[130px] w-full max-w-[280px] rounded-[10px] border-0 bg-[#141414]"
              />
            ))
          : invoiceSummaryMetrics.map((metric) => <SummaryCard key={metric.label} {...metric} />)}
      </div>

      {isError ? <p className="text-body-sm text-brand-danger">Failed to load invoices.</p> : null}

      <DataTable
        className={FINANCE_DATA_TABLE_CLASS}
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        {...serverSort.dataTableSortProps}
        isLoading={isLoading || isFetching}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={FINANCE_INVOICES_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by invoice ID or partner"
        advancedFilterLabel="Advance Filters"
        onAdvancedFilter={onAdvancedFilter}
        advancedFilterVariant="primary"
        onExport={onExport}
        onRowClick={(row) => navigate(`/finance/invoices/${encodeURIComponent(row.id)}`)}
        pagination={{
          page: meta?.page ?? currentPage,
          pageSize: meta?.limit ?? PAGE_SIZE,
          totalItems: meta?.total ?? 0,
          totalPages: meta?.totalPages ?? 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="invoices"
        emptyMessage="No invoices found."
      />

      {exportFilterModals}
    </div>
  )
}
