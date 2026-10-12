import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { useAddFinanceNote, useFinanceInvoices } from '@/modules/payments/hooks/use-finance'
import { useFinanceRowSelection } from '@/modules/payments/hooks/use-finance-row-selection'
import { formatInr, mapInvoiceToRow } from '@/modules/payments/utils/finance-mappers'
import {
  clearInvoiceReminder,
  formatReminderDateTime,
  listDueInvoiceReminders,
  saveInvoiceReminder,
} from '@/modules/payments/utils/invoice-reminders'
import { SetInvoiceReminderModal } from '@/modules/payments/components/set-invoice-reminder-modal'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import {
  DEFAULT_FINANCE_INVOICES_VISIBLE_COLUMN_IDS,
  FINANCE_INVOICES_METRICS_CATALOG,
  FINANCE_INVOICES_MODULE_KEY,
  FINANCE_INVOICES_TABLE_COLUMNS_CATALOG,
} from '@/modules/payments/config/finance-invoices-table-columns.config'
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
import { assembleFinanceTableColumns } from '@/modules/payments/utils/finance-table-column-utils'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import {
  orderByActiveMetricIds,
  useActiveMetricIds,
} from '@/modules/expert/hooks/use-active-metric-ids'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'

const PAGE_SIZE = 10

const SORT_FIELD_MAP = buildCatalogSortFieldMap(
  FINANCE_INVOICES_TABLE_COLUMNS_CATALOG,
  FINANCE_INVOICE_SORT_OVERRIDES,
)

const EXPORT_COLUMN_MAP: Record<string, { header: string; accessor: (row: InvoiceRow) => string }> =
  {
    'invoice-id': { header: 'Invoice ID', accessor: (row) => exportDisplayValue(row.invoiceId) },
    'client-name': { header: 'Client Name', accessor: (row) => exportDisplayValue(row.clientName) },
    amount: { header: 'Amount', accessor: (row) => exportDisplayValue(row.amount) },
    'issue-date': { header: 'Issue Date', accessor: (row) => exportDisplayValue(row.issueDate) },
    'due-date': { header: 'Due Date', accessor: (row) => exportDisplayValue(row.dueDate) },
    description: { header: 'Description', accessor: (row) => exportDisplayValue(row.description) },
    status: { header: 'Status', accessor: (row) => exportDisplayValue(row.status) },
  }

const INVOICE_COLUMN_LEGACY_ID_MAP: Record<string, string> = {
  'invoice-date': 'issue-date',
  'invoice-status': 'status',
  'payment-status': 'status',
}

const DEFAULT_INVOICE_METRIC_IDS = FINANCE_INVOICES_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)

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
  const [reminderTarget, setReminderTarget] = useState<InvoiceRow | null>(null)
  const addNoteMutation = useAddFinanceNote()
  const tableColumnPreferencesQuery = useTableColumnPreferences(FINANCE_INVOICES_MODULE_KEY)
  const catalogColumnIds = useMemo(
    () => FINANCE_INVOICES_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_FINANCE_INVOICES_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
    legacyColumnIdMap: INVOICE_COLUMN_LEGACY_ID_MAP,
  })
  const activeMetricIds = useActiveMetricIds(
    FINANCE_INVOICES_MODULE_KEY,
    DEFAULT_INVOICE_METRIC_IDS,
  )

  useEffect(() => {
    const due = listDueInvoiceReminders()
    if (!due.length) return
    for (const reminder of due) {
      toast.message(`Invoice reminder: ${reminder.invoiceNumber}`, {
        description: `${formatReminderDateTime(reminder.remindAt)} · ${reminder.message}`,
        duration: 8000,
      })
      clearInvoiceReminder(reminder.invoiceId)
    }
  }, [])

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
      { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
    )
  }, [catalogColumnIds, enhancedSearch.globalSearch, exportColumnIds])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'finance-invoices',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })
  const invoiceSummaryMetrics = useMemo(
    () =>
      orderByActiveMetricIds(
        [
          {
            id: 'total-invoices',
            label: 'Total Invoices',
            value: String(meta?.total ?? 0),
            change: '—',
            changeNote: 'all invoices',
          },
          {
            id: 'amount-paid',
            label: 'Amount Paid',
            value: formatInr(
              rows
                .filter((r) => r.status === 'Paid')
                .reduce(
                  (sum, r) => sum + (Number(String(r.amount).replace(/[^\d.]/g, '')) || 0),
                  0,
                ),
            ),
            change: '—',
            changeNote: 'this page',
          },
          {
            id: 'pending',
            label: 'Pending',
            value: String(rows.filter((r) => r.status === 'Pending').length),
            change: '—',
            changeNote: 'this page',
          },
          {
            id: 'overdue',
            label: 'Overdue',
            value: String(rows.filter((r) => r.status === 'Overdue').length),
            change: '—',
            changeNote: 'this page',
          },
        ],
        activeMetricIds,
      ),
    [activeMetricIds, meta?.total, rows],
  )

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
            setReminderTarget(record)
          }}
        >
          Set Reminder
        </TableActionsItem>
      </TableActionsDropdown>
    ),
    [activeDropdownId, logoUrl, navigate],
  )

  const columns = useMemo<ColumnDef<InvoiceRow>[]>(() => {
    const selectColumn: ColumnDef<InvoiceRow> = {
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
    }

    const dataColumnsById: Record<string, ColumnDef<InvoiceRow>> = {
      'invoice-id': {
        id: 'invoice-id',
        accessorKey: 'invoiceId',
        header: 'Invoice ID',
        cell: ({ row }) => (
          <span className={cn(FINANCE_TABLE_CELL_CLASS, 'font-mono uppercase')}>
            {row.original.invoiceId}
          </span>
        ),
      },
      'client-name': {
        id: 'client-name',
        accessorKey: 'clientName',
        header: 'Client Name',
        cell: ({ row }) => <FinanceTableCellText>{row.original.clientName}</FinanceTableCellText>,
      },
      amount: {
        id: 'amount',
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <span className={cn(FINANCE_TABLE_CELL_CLASS, 'font-semibold')}>
            {row.original.amount}
          </span>
        ),
      },
      'issue-date': {
        id: 'issue-date',
        accessorKey: 'issueDate',
        header: 'Issue Date',
        cell: ({ row }) => <FinanceTableCellText>{row.original.issueDate}</FinanceTableCellText>,
      },
      'due-date': {
        id: 'due-date',
        accessorKey: 'dueDate',
        header: 'Due Date',
        cell: ({ row }) => <FinanceTableCellText>{row.original.dueDate}</FinanceTableCellText>,
      },
      description: {
        id: 'description',
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => <FinanceTableCellText>{row.original.description}</FinanceTableCellText>,
      },
      status: {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <FinanceTableStatusBadge status={row.original.status} />,
      },
    }

    return withServerSortMeta(
      assembleFinanceTableColumns(selectColumn, dataColumnsById, {
        catalogIds: catalogColumnIds,
        visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
        defaultColumnIds: DEFAULT_FINANCE_INVOICES_VISIBLE_COLUMN_IDS,
        legacyColumnIdMap: INVOICE_COLUMN_LEGACY_ID_MAP,
        renderActions,
      }),
      SORT_FIELD_MAP,
    )
  }, [
    allVisibleSelected,
    catalogColumnIds,
    renderActions,
    selectedRowIds,
    someVisibleSelected,
    tableColumnPreferencesQuery.data?.visibleColumnIds,
    toggleRowSelection,
    toggleVisibleRows,
  ])

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
          : invoiceSummaryMetrics.map(({ id, ...metric }) => <SummaryCard key={id} {...metric} />)}
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

      <SetInvoiceReminderModal
        open={Boolean(reminderTarget)}
        invoiceNumber={reminderTarget?.invoiceId || ''}
        clientName={reminderTarget?.clientName || ''}
        isSubmitting={addNoteMutation.isPending}
        onClose={() => {
          if (addNoteMutation.isPending) return
          setReminderTarget(null)
        }}
        onSubmit={async ({ remindAt, message }) => {
          if (!reminderTarget) return
          try {
            const whenLabel = formatReminderDateTime(remindAt)
            await addNoteMutation.mutateAsync({
              id: reminderTarget.id,
              resourceType: 'Invoice',
              adminNote: `Reminder set for ${whenLabel}. ${message}`.trim(),
            })
            saveInvoiceReminder({
              invoiceId: reminderTarget.id,
              invoiceNumber: reminderTarget.invoiceId,
              clientName: reminderTarget.clientName,
              remindAt,
              message,
              createdAt: new Date().toISOString(),
            })
            toast.success(`Reminder set for ${whenLabel}`)
            setReminderTarget(null)
          } catch (error) {
            toast.error(getApiErrorMessage(error, 'Failed to set reminder'))
          }
        }}
      />
    </div>
  )
}
