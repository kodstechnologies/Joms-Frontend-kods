import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Bell, Download, Eye, TrendingUp } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useBranding } from '@/app/providers/use-branding'
import { type InvoiceRow, type InvoiceStatus } from '@/modules/payments/mock/invoices-billing.mock'
import { fetchFinanceInvoiceById, fetchFinanceInvoices } from '@/modules/payments/api/finance-api'
import { useFinanceInvoices } from '@/modules/payments/hooks/use-finance'
import { formatInr, mapInvoiceToRow } from '@/modules/payments/utils/finance-mappers'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { cn } from '@/shared/lib/cn'
import { StatCardSkeleton } from '@/shared/components/ui/skeleton'
import type { FilterValues } from '@/shared/types/data-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildFinanceInvoicesListQueryParams,
  createFinanceInvoicesFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import { downloadInvoiceDocument, invoiceFromFinanceInvoice } from '@/shared/utils/invoice-document'

const PAGE_SIZE = 10

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
  return (
    <div className="bg-brand-surface rounded-xl border border-white/[0.06] p-5">
      <p className="text-body-sm-medium text-muted">{label}</p>
      <p className="text-h2 text-brand-text mt-2 tracking-tight">{value}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-body-sm-semibold bg-brand-positive/15 text-brand-positive inline-flex items-center gap-1 rounded-md px-2 py-0.5">
          <TrendingUp className="size-3" />
          {change}
        </span>
        <span className="text-body-sm text-muted">{changeNote}</span>
      </div>
    </div>
  )
}

function getStatusClassName(status: InvoiceStatus) {
  if (status === 'Paid') return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  if (status === 'Pending') return 'border-brand-accent/25 bg-brand-accent/10 text-brand-accent'
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

export function InvoicesBillingPage() {
  const navigate = useNavigate()
  const { logoUrl } = useBranding()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
      setCurrentPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchQuery])

  const listQueryParams = useMemo(
    () =>
      buildFinanceInvoicesListQueryParams(appliedFilters, {
        page: currentPage,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
      }),
    [appliedFilters, currentPage, debouncedSearch],
  )

  const { data, isLoading, isFetching, isError } = useFinanceInvoices(listQueryParams)

  const rows = useMemo(() => (data?.data?.rows ?? []).map(mapInvoiceToRow), [data])
  const meta = data?.data?.meta

  const handleApplyFilters = useCallback((values: FilterValues) => {
    toast.success('Filters applied')
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      const result = await fetchFinanceInvoices(params)
      return { data: (result.data?.rows ?? []).map(mapInvoiceToRow) }
    }
    return createFinanceInvoicesFilteredExportHandler(
      fetchForExport,
      EXPORT_COLUMN_MAP,
      'finance_invoices_export',
      { search: debouncedSearch || undefined },
    )
  }, [debouncedSearch])

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

  const visibleRowIds = useMemo(() => rows.map((row) => row.id), [rows])
  const allVisibleSelected =
    visibleRowIds.length > 0 && visibleRowIds.every((id) => selectedRowIds.includes(id))
  const someVisibleSelected = visibleRowIds.some((id) => selectedRowIds.includes(id))

  const toggleVisibleRows = useCallback(() => {
    setSelectedRowIds((currentIds) => {
      if (allVisibleSelected) return currentIds.filter((id) => !visibleRowIds.includes(id))
      return Array.from(new Set([...currentIds, ...visibleRowIds]))
    })
  }, [allVisibleSelected, visibleRowIds])

  const toggleRowSelection = useCallback((rowId: string) => {
    setSelectedRowIds((currentIds) =>
      currentIds.includes(rowId) ? currentIds.filter((id) => id !== rowId) : [...currentIds, rowId],
    )
  }, [])

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
            navigate(`/finance/invoices/${record.id}`)
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
              .catch(() => toast.error('Failed to download invoice'))
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
    () => [
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
            className="rounded border-slate-700 bg-transparent"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Select ${row.original.clientName}`}
            checked={selectedRowIds.includes(row.original.id)}
            onChange={() => toggleRowSelection(row.original.id)}
            onClick={(event) => event.stopPropagation()}
            className="rounded border-slate-700 bg-transparent"
          />
        ),
        meta: { headerClassName: 'pl-5', cellClassName: 'pl-5' },
      },
      {
        accessorKey: 'invoiceId',
        header: 'Invoice ID',
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-brand-text font-mono uppercase">
            {row.original.invoiceId}
          </span>
        ),
      },
      { accessorKey: 'clientName', header: 'Client Name' },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => <span className="font-semibold text-white">{row.original.amount}</span>,
      },
      { accessorKey: 'issueDate', header: 'Issue Date' },
      { accessorKey: 'dueDate', header: 'Due Date' },
      { accessorKey: 'description', header: 'Description' },
      {
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
      {
        id: 'actions',
        header: 'Actions',
        meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
        cell: ({ row }) => renderActions(row.original),
      },
    ],
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
      <div>
        <h1 className="text-h2 text-brand-text tracking-tight">Invoices & Billing</h1>
        <p className="text-body-md text-muted mt-1 leading-[20px]">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <StatCardSkeleton key={`invoice-skel-${idx}`} />
            ))
          : invoiceSummaryMetrics.map((metric) => <SummaryCard key={metric.label} {...metric} />)}
      </div>

      {isError ? <p className="text-body-sm text-brand-danger">Failed to load invoices.</p> : null}

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
        resourceLabel="invoices"
        emptyMessage="No invoices found."
      />

      {exportFilterModals}
    </div>
  )
}
