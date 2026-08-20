import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { AlertTriangle, Eye, SlidersHorizontal, Tag, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { type RevenueOverviewRow } from '@/modules/payments/mock/revenue-overview.mock'
import {
  useAddFinanceNote,
  useEscalateFinance,
  useFinanceRevenue,
  useSoftDeleteFinance,
} from '@/modules/payments/hooks/use-finance'
import { fetchFinanceRevenue } from '@/modules/payments/api/finance-api'
import {
  DEFAULT_FINANCE_REVENUE_VISIBLE_COLUMN_IDS,
  FINANCE_REVENUE_MODULE_KEY,
} from '@/modules/payments/config/finance-revenue-table-columns.config'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { mapPaymentToRevenueRow } from '@/modules/payments/utils/finance-mappers'
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
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildRevenueListQueryParams,
  createRevenueFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import type { FilterValues } from '@/shared/types/data-filter'
import type { FinancePayment } from '@/modules/payments/types/finance-api'

const PAGE_SIZE = 10

const EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (row: RevenueOverviewRow) => string }
> = {
  module: { header: 'Module', accessor: (row) => exportDisplayValue(row.module) },
  'entity-type': { header: 'Entity Type', accessor: (row) => exportDisplayValue(row.entityType) },
  'entity-id': { header: 'Entity ID', accessor: (row) => exportDisplayValue(row.entityId) },
  'entity-name': { header: 'Entity Name', accessor: (row) => exportDisplayValue(row.entityName) },
  category: { header: 'Category', accessor: (row) => exportDisplayValue(row.category) },
  'owner-type': { header: 'Owner Type', accessor: (row) => exportDisplayValue(row.ownerType) },
  'owner-name': { header: 'Owner Name', accessor: (row) => exportDisplayValue(row.ownerName) },
  'gross-amount': {
    header: 'Gross Amount',
    accessor: (row) => exportDisplayValue(row.grossAmount),
  },
  status: { header: 'Status', accessor: (row) => exportDisplayValue(row.status) },
}

function getStatusClassName(status: RevenueOverviewRow['status']) {
  if (status === 'Paid') {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  if (status === 'Pending') {
    return 'border-brand-accent/25 bg-brand-accent/10 text-brand-accent'
  }
  return 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger'
}

export function RevenueOverviewPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])
  const [tagTarget, setTagTarget] = useState<RevenueOverviewRow | null>(null)
  const [rowAction, setRowAction] = useState<FinanceEscalateDeleteAction | null>(null)
  const addNote = useAddFinanceNote()
  const escalate = useEscalateFinance()
  const softDelete = useSoftDeleteFinance()
  const tableColumnPreferencesQuery = useTableColumnPreferences(FINANCE_REVENUE_MODULE_KEY)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
      setCurrentPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchQuery])

  const listQueryParams = useMemo(
    () =>
      buildRevenueListQueryParams(appliedFilters, {
        page: currentPage,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
      }),
    [appliedFilters, currentPage, debouncedSearch],
  )

  const { data, isLoading, isFetching, isError } = useFinanceRevenue(listQueryParams)

  const rows = useMemo(() => (data?.data?.rows ?? []).map(mapPaymentToRevenueRow), [data])
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
      return { data: payments.map(mapPaymentToRevenueRow) }
    }
    return createRevenueFilteredExportHandler(
      fetchForExport,
      EXPORT_COLUMN_MAP,
      'revenue_overview_export',
      { search: debouncedSearch || undefined },
    )
  }, [debouncedSearch])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'finance-revenue',
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
    (record: RevenueOverviewRow) => {
      const isOpen = activeDropdownId === record.id

      return (
        <TableActionsDropdown
          label="Open revenue record actions"
          isOpen={isOpen}
          onOpenChange={(open) => setActiveDropdownId(open ? record.id : null)}
          menuWidth={220}
        >
          <TableActionsItem
            icon={<Eye className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              navigate(`/finance/revenue/${record.id}`)
            }}
          >
            View Details
          </TableActionsItem>
          <TableActionsItem
            icon={<Tag className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              setTagTarget(record)
            }}
          >
            Add Tags
          </TableActionsItem>
          <TableActionsItem
            icon={<AlertTriangle className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              setRowAction({ kind: 'escalate', id: record.id, resourceType: 'Payment' })
            }}
          >
            Escalate
          </TableActionsItem>
          <TableActionsItem
            icon={<Trash2 className="text-brand-danger size-3.5" aria-hidden="true" />}
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

  const columns = useMemo<ColumnDef<RevenueOverviewRow>[]>(() => {
    const selectColumn: ColumnDef<RevenueOverviewRow> = {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          aria-label="Select all revenue records"
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
          aria-label={`Select ${row.original.entityName}`}
          checked={selectedRowIds.includes(row.original.id)}
          onChange={() => toggleRowSelection(row.original.id)}
          onClick={(event) => event.stopPropagation()}
          className="h-[18px] w-[18px] rounded border-slate-700 bg-transparent"
        />
      ),
      meta: {
        headerClassName: 'pl-5',
        cellClassName: 'pl-5',
      },
    }

    const dataColumnsById: Record<string, ColumnDef<RevenueOverviewRow>> = {
      module: { accessorKey: 'module', header: 'Module' },
      'entity-type': { accessorKey: 'entityType', header: 'Entity Type' },
      'entity-id': {
        accessorKey: 'entityId',
        header: 'Entity ID',
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-brand-text font-mono uppercase">
            {row.original.entityId}
          </span>
        ),
      },
      'entity-name': {
        accessorKey: 'entityName',
        header: 'Entity Name',
        cell: ({ row }) => (
          <span className="text-brand-text font-medium">{row.original.entityName}</span>
        ),
      },
      category: { accessorKey: 'category', header: 'Category' },
      'owner-type': { accessorKey: 'ownerType', header: 'Owner Type' },
      'owner-name': { accessorKey: 'ownerName', header: 'Owner Name' },
      'gross-amount': {
        accessorKey: 'grossAmount',
        header: 'Gross Amount',
        cell: ({ row }) => (
          <span className="text-brand-text font-semibold">{row.original.grossAmount}</span>
        ),
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

    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_FINANCE_REVENUE_VISIBLE_COLUMN_IDS

    const preferenceColumns = visibleIds.map((id) => dataColumnsById[id]).filter(Boolean)

    const actionsColumn: ColumnDef<RevenueOverviewRow> = {
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
          <h1 className="text-h2 text-brand-text tracking-tight">Revenue Overview</h1>
          <p className="text-body-sm text-muted mt-1 leading-[20px]">
            Manage and monitor all financial transactions
          </p>
          <p className="text-body-sm text-muted mt-3 leading-[20px]">
            <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
              Finance Management
            </Link>
            <span> / </span>
            <span className="text-brand-text font-semibold">Revenue Overview</span>
          </p>
        </div>
        <Button
          className="ui-manage-metrics"
          onClick={() => navigate('/metrics/finance-revenue?section=table')}
        >
          <SlidersHorizontal className="size-4" />
          Manage Metrics
        </Button>
      </div>

      {isError ? (
        <p className="text-body-sm text-brand-danger">Failed to load revenue records.</p>
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
        resourceLabel="payments"
        emptyMessage="No revenue records found."
      />

      <AddTagsModal
        open={!!tagTarget}
        entityLabel="payment"
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
