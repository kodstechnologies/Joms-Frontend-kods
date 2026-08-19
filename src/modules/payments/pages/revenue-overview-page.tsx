import { useCallback, useMemo, useState } from 'react'
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
import { mapPaymentToRevenueRow } from '@/modules/payments/utils/finance-mappers'
import { AddTagsModal } from '@/modules/payments/components/add-tags-modal'
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
import { useModuleExportFilters } from '@/shared/components/advanced-filter/use-module-export-filters'
import { buildFilterParams } from '@/shared/utils/export-filter-utils'
import { exportDataToFile, exportDisplayValue } from '@/shared/utils/export-utils'
import type { FilterValues } from '@/shared/types/data-filter'
import { fetchFinanceRevenue } from '@/modules/payments/api/finance-api'
import type { FinanceListParams, FinancePayment } from '@/modules/payments/types/finance-api'

const PAGE_SIZE = 10

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
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])
  const [tagTarget, setTagTarget] = useState<RevenueOverviewRow | null>(null)
  const [rowAction, setRowAction] = useState<FinanceEscalateDeleteAction | null>(null)
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const addNote = useAddFinanceNote()
  const escalate = useEscalateFinance()
  const softDelete = useSoftDeleteFinance()

  const apiFilterParams = useMemo(() => {
    const params = buildFilterParams(appliedFilters)
    const next: FinanceListParams = {}
    if (params.status) next.status = params.status
    if (params.module) next.module = params.module
    if (params.partnerId) next.partnerId = params.partnerId
    if (params.pricingType) next.pricingType = params.pricingType
    return next
  }, [appliedFilters])

  const { data, isLoading, isFetching, isError } = useFinanceRevenue({
    page: currentPage,
    limit: PAGE_SIZE,
    ...apiFilterParams,
  })

  const rows = useMemo(() => (data?.data?.rows ?? []).map(mapPaymentToRevenueRow), [data])
  const meta = data?.data?.meta

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return rows

    return rows.filter((row) =>
      [
        row.module,
        row.entityType,
        row.entityId,
        row.entityName,
        row.category,
        row.ownerType,
        row.ownerName,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [rows, searchQuery])

  const pageRows = searchQuery.trim() ? filteredRows : rows

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

  const handleApplyFilters = useCallback((values: FilterValues) => {
    setAppliedFilters(values)
    setCurrentPage(1)
  }, [])

  const handleExportData = useCallback(async (values: FilterValues, format: string) => {
    const filterParams = buildFilterParams(values)
    const result = await fetchFinanceRevenue({
      status: filterParams.status,
      module: filterParams.module,
      partnerId: filterParams.partnerId,
      pricingType: filterParams.pricingType,
      page: 1,
      limit: 1000,
    })
    const payments: FinancePayment[] = result?.data?.rows ?? []
    if (payments.length === 0) {
      throw new Error('NO_RECORDS')
    }
    const headers = ['ID', 'Module', 'Order ID', 'Amount', 'Status', 'Created']
    const exportRows = payments.map((payment) => [
      exportDisplayValue(payment._id),
      exportDisplayValue(payment.module),
      exportDisplayValue(payment.orderId),
      exportDisplayValue(payment.amount),
      exportDisplayValue(payment.status),
      exportDisplayValue(payment.createdAt),
    ])
    exportDataToFile(headers, exportRows, format, 'revenue_overview_export')
  }, [])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'finance-revenue',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

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

  const columns = useMemo<ColumnDef<RevenueOverviewRow>[]>(
    () => [
      {
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
      },
      { accessorKey: 'module', header: 'Module' },
      { accessorKey: 'entityType', header: 'Entity Type' },
      {
        accessorKey: 'entityId',
        header: 'Entity ID',
        cell: ({ row }) => (
          <span className="text-body-sm-semibold text-brand-text font-mono uppercase">
            {row.original.entityId}
          </span>
        ),
      },
      {
        accessorKey: 'entityName',
        header: 'Entity Name',
        cell: ({ row }) => (
          <span className="text-brand-text font-medium">{row.original.entityName}</span>
        ),
      },
      { accessorKey: 'category', header: 'Category' },
      { accessorKey: 'ownerType', header: 'Owner Type' },
      { accessorKey: 'ownerName', header: 'Owner Name' },
      {
        accessorKey: 'grossAmount',
        header: 'Gross Amount',
        cell: ({ row }) => (
          <span className="text-brand-text font-semibold">{row.original.grossAmount}</span>
        ),
      },
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
        <Button className="ui-manage-metrics" onClick={() => navigate('/metrics/finance-revenue')}>
          <SlidersHorizontal className="size-4" />
          Manage Metrics
        </Button>
      </div>

      {isError ? (
        <p className="text-body-sm text-brand-danger">Failed to load revenue records.</p>
      ) : null}

      <DataTable
        columns={columns}
        data={pageRows}
        getRowId={(row) => row.id}
        isLoading={isLoading || isFetching}
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value)
          setCurrentPage(1)
        }}
        searchPlaceholder="Search by name, ID or profession"
        advancedFilterLabel="Advance Filters"
        onAdvancedFilter={onAdvancedFilter}
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
      {exportFilterModals}

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
    </div>
  )
}
