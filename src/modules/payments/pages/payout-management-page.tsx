import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Banknote, Eye, SquarePen, TrendingUp } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { AddFinanceNoteModal } from '@/modules/payments/components/add-finance-note-modal'
import { fetchFinancePayouts } from '@/modules/payments/api/finance-api'
import {
  useAddFinanceNote,
  useFinanceDashboard,
  useFinancePayouts,
  useReleasePayout,
} from '@/modules/payments/hooks/use-finance'
import {
  canReleasePayout,
  formatInr,
  mapPayoutToRow,
} from '@/modules/payments/utils/finance-mappers'
import type { PayoutRow, PayoutStatus } from '@/modules/payments/mock/payout-management.mock'
import { PermissionGate } from '@/modules/rbac/components/permission-gate'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { cn } from '@/shared/lib/cn'
import { PERMISSION_LEVELS } from '@/shared/lib/permissions'
import type { FilterValues } from '@/shared/types/data-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildFinancePayoutsListQueryParams,
  createFinancePayoutsFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'

const PAGE_SIZE = 10

const EXPORT_COLUMN_MAP: Record<string, { header: string; accessor: (row: PayoutRow) => string }> =
  {
    payoutId: { header: 'Payout ID', accessor: (row) => exportDisplayValue(row.payoutId) },
    payeeId: { header: 'Payee ID', accessor: (row) => exportDisplayValue(row.payeeId) },
    payeeName: { header: 'Payee Name', accessor: (row) => exportDisplayValue(row.payeeName) },
    payeeType: { header: 'Payee Type', accessor: (row) => exportDisplayValue(row.payeeType) },
    relatedTransaction: {
      header: 'Related Transaction',
      accessor: (row) => exportDisplayValue(row.relatedTransaction),
    },
    grossAmount: { header: 'Gross Amount', accessor: (row) => exportDisplayValue(row.grossAmount) },
    platformCommission: {
      header: 'Platform Commission',
      accessor: (row) => exportDisplayValue(row.platformCommission),
    },
    taxDeduction: {
      header: 'Tax Deduction',
      accessor: (row) => exportDisplayValue(row.taxDeduction),
    },
    gatewayCharges: {
      header: 'Gateway Charges',
      accessor: (row) => exportDisplayValue(row.gatewayCharges),
    },
    netPayout: { header: 'Net Payout', accessor: (row) => exportDisplayValue(row.netPayout) },
    currency: { header: 'Currency', accessor: (row) => exportDisplayValue(row.currency) },
    bankReference: {
      header: 'Bank Reference',
      accessor: (row) => exportDisplayValue(row.bankReference),
    },
    scheduledDate: {
      header: 'Scheduled Date',
      accessor: (row) => exportDisplayValue(row.scheduledDate),
    },
    processedDate: {
      header: 'Processed Date',
      accessor: (row) => exportDisplayValue(row.processedDate),
    },
    status: { header: 'Payout Status', accessor: (row) => exportDisplayValue(row.status) },
    financeApprover: {
      header: 'Finance Approver',
      accessor: (row) => exportDisplayValue(row.financeApprover),
    },
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
    <div className="radius-lg bg-brand-surface border border-white/[0.06] p-5">
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

function getStatusClassName(status: PayoutStatus) {
  if (status === 'Paid' || status === 'Completed') {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  if (status === 'Pending' || status === 'Processing') {
    return 'border-brand-accent/25 bg-brand-accent/10 text-brand-accent'
  }
  if (status === 'On Hold') return 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

export function PayoutManagementPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])
  const [rowAction, setRowAction] = useState<{ type: 'release' | 'note'; row: PayoutRow } | null>(
    null,
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
      setCurrentPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchQuery])

  const listQueryParams = useMemo(
    () =>
      buildFinancePayoutsListQueryParams(appliedFilters, {
        page: currentPage,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
      }),
    [appliedFilters, currentPage, debouncedSearch],
  )

  const { data, isLoading, isFetching, isError } = useFinancePayouts(listQueryParams)
  const dashboardQuery = useFinanceDashboard()
  const releaseMutation = useReleasePayout()
  const noteMutation = useAddFinanceNote()

  const rows = useMemo(() => (data?.data?.rows ?? []).map(mapPayoutToRow), [data])
  const meta = data?.data?.meta
  const summary = dashboardQuery.data?.data

  const handleApplyFilters = useCallback((values: FilterValues) => {
    toast.success('Filters applied')
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      const result = await fetchFinancePayouts(params)
      return { data: (result.data?.rows ?? []).map(mapPayoutToRow) }
    }
    return createFinancePayoutsFilteredExportHandler(
      fetchForExport,
      EXPORT_COLUMN_MAP,
      'finance_payouts_export',
      { search: debouncedSearch || undefined },
    )
  }, [debouncedSearch])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'finance-payouts',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const summaryCards = [
    {
      label: 'Total Payments',
      value: String(meta?.total ?? 0),
      change: '—',
      changeNote: 'all payouts',
    },
    {
      label: 'Pending',
      value: formatInr(summary?.pendingPayouts ?? 0),
      change: String(summary?.pendingPayoutCount ?? 0),
      changeNote: 'awaiting release',
    },
    {
      label: 'Completed',
      value: formatInr(summary?.totalPlatformRevenue ?? 0),
      change: '—',
      changeNote: 'platform captured',
    },
    {
      label: 'Failed',
      value: String(rows.filter((r) => r.status === 'Failed').length),
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
    (record: PayoutRow) => (
      <TableActionsDropdown
        label="Open payout actions"
        isOpen={activeDropdownId === record.id}
        onOpenChange={(open) => setActiveDropdownId(open ? record.id : null)}
        menuWidth={220}
      >
        <TableActionsItem
          icon={<Eye className="size-3.5 text-slate-700" aria-hidden="true" />}
          className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => {
            setActiveDropdownId(null)
            navigate(`/finance/payouts/${record.id}`)
          }}
        >
          View Details
        </TableActionsItem>
        {canReleasePayout(record.rawStatus) ? (
          <PermissionGate
            permission="finance.approve_payout"
            minLevel={PERMISSION_LEVELS.SECONDARY_APPROVAL}
          >
            <TableActionsItem
              icon={<Banknote className="size-3.5 text-slate-700" aria-hidden="true" />}
              className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
              onClick={() => {
                setActiveDropdownId(null)
                setRowAction({ type: 'release', row: record })
              }}
            >
              Release Payout
            </TableActionsItem>
          </PermissionGate>
        ) : null}
        <TableActionsItem
          icon={<SquarePen className="size-3.5 text-slate-700" aria-hidden="true" />}
          className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => {
            setActiveDropdownId(null)
            setRowAction({ type: 'note', row: record })
          }}
        >
          Add Internal Note
        </TableActionsItem>
      </TableActionsDropdown>
    ),
    [activeDropdownId, navigate],
  )

  const columns = useMemo<ColumnDef<PayoutRow>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            aria-label="Select all payouts"
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
            aria-label={`Select ${row.original.payeeName}`}
            checked={selectedRowIds.includes(row.original.id)}
            onChange={() => toggleRowSelection(row.original.id)}
            onClick={(event) => event.stopPropagation()}
            className="rounded border-slate-700 bg-transparent"
          />
        ),
        meta: { headerClassName: 'pl-5', cellClassName: 'pl-5' },
      },
      { accessorKey: 'payoutId', header: 'Payout ID' },
      { accessorKey: 'payeeId', header: 'Payee ID' },
      { accessorKey: 'payeeName', header: 'Payee Name' },
      { accessorKey: 'payeeType', header: 'Payee Type' },
      { accessorKey: 'relatedTransaction', header: 'Related Transaction' },
      { accessorKey: 'grossAmount', header: 'Gross Amount' },
      { accessorKey: 'platformCommission', header: 'Platform Commission' },
      { accessorKey: 'taxDeduction', header: 'Tax Deduction' },
      { accessorKey: 'gatewayCharges', header: 'Gateway Charges' },
      { accessorKey: 'netPayout', header: 'Net Payout' },
      { accessorKey: 'currency', header: 'Currency' },
      { accessorKey: 'bankReference', header: 'Bank Reference' },
      { accessorKey: 'scheduledDate', header: 'Scheduled Date' },
      { accessorKey: 'processedDate', header: 'Processed Date' },
      {
        accessorKey: 'status',
        header: 'Payout Status',
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
      { accessorKey: 'financeApprover', header: 'Finance Approver' },
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
        <h1 className="text-h2 text-brand-text tracking-tight">Payout Management</h1>
        <p className="text-body-md text-muted mt-1 leading-[20px]">
          Track revenue, payouts, and financial performance
        </p>
        <p className="text-body-sm text-muted mt-3 leading-[20px]">
          <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
            Payment & Finance
          </Link>
          <span> / </span>
          <span className="text-brand-text font-semibold">Payout Management</span>
        </p>
      </div>

      {isError ? <p className="text-body-sm text-brand-danger">Failed to load payouts.</p> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((metric) => (
          <SummaryCard key={metric.label} {...metric} />
        ))}
      </div>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        isLoading={isLoading || isFetching}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by payout ID or payee name"
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
        resourceLabel="payouts"
        emptyMessage="No payout records found."
      />

      {exportFilterModals}

      <AddFinanceNoteModal
        open={rowAction?.type === 'release'}
        title="Release Payout"
        description="Record the manual bank transfer, then mark this payout as paid."
        placeholder="Enter release note"
        submitLabel="Release Payout"
        submittingLabel="Releasing..."
        extraField={{
          label: 'Transfer Reference (UTR)',
          placeholder: 'Enter bank UTR / reference',
          required: true,
          minLength: 6,
        }}
        isSubmitting={releaseMutation.isPending}
        onClose={() => setRowAction(null)}
        onSubmit={(adminNote, bankReference) => {
          if (!rowAction || !bankReference) {
            toast.error('Bank transfer reference (UTR) is required')
            return
          }
          releaseMutation.mutate(
            { id: rowAction.row.id, adminNote, bankReference },
            {
              onSuccess: () => {
                toast.success('Payout marked as paid')
                setRowAction(null)
              },
              onError: (err) => {
                const msg =
                  (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message || 'Release failed'
                toast.error(msg)
              },
            },
          )
        }}
      />

      <AddFinanceNoteModal
        open={rowAction?.type === 'note'}
        isSubmitting={noteMutation.isPending}
        onClose={() => setRowAction(null)}
        onSubmit={(adminNote) => {
          if (!rowAction) return
          noteMutation.mutate(
            { id: rowAction.row.id, resourceType: 'Payout', adminNote },
            {
              onSuccess: () => {
                toast.success('Note saved')
                setRowAction(null)
              },
              onError: () => toast.error('Failed to save note'),
            },
          )
        }}
      />
    </div>
  )
}
