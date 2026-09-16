import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Eye, SquarePen, Tag, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import type { RevenueOverviewRow } from '@/modules/payments/types/finance-table-rows'
import {
  useAddFinanceNote,
  useEscalateFinance,
  useFinanceRevenue,
  useSoftDeleteFinance,
} from '@/modules/payments/hooks/use-finance'
import { useFinanceRowSelection } from '@/modules/payments/hooks/use-finance-row-selection'
import { fetchFinanceRevenue } from '@/modules/payments/api/finance-api'
import { fetchPartnerDisplayNames } from '@/modules/payments/api/partner-lookup-api'
import {
  DEFAULT_FINANCE_REVENUE_VISIBLE_COLUMN_IDS,
  FINANCE_REVENUE_LEGACY_COLUMN_ID_MAP,
  FINANCE_REVENUE_MODULE_KEY,
  FINANCE_REVENUE_TABLE_COLUMNS_CATALOG,
} from '@/modules/payments/config/finance-revenue-table-columns.config'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import {
  mapPaymentToRevenueRow,
  needsPartnerDisplayName,
} from '@/modules/payments/utils/finance-mappers'
import { escalateUrl } from '@/modules/payments/utils/finance-escalate'
import { AddTagsModal } from '@/shared/components/modals/add-tags-modal'
import { AddFinanceNoteModal } from '@/modules/payments/components/add-finance-note-modal'
import {
  FinanceEscalateDeleteModal,
  type FinanceEscalateDeleteAction,
} from '@/modules/payments/components/finance-escalate-delete-modal'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { buildCatalogSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { FINANCE_REVENUE_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import {
  buildRevenueListQueryParams,
  buildExportColumnMapFromCatalog,
  createRevenueFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import type { FilterValues } from '@/shared/types/data-filter'
import type { FinancePayment } from '@/modules/payments/types/finance-api'

import { FINANCE_PAYMENT_SORT_OVERRIDES } from '@/modules/payments/config/finance-table-sort-fields'
import { FinanceTableStatusBadge } from '@/modules/payments/components/finance-table-status-badge'
import {
  FINANCE_DATA_TABLE_CLASS,
  FINANCE_TABLE_CELL_CLASS,
} from '@/modules/payments/constants/finance-table-styles'
import { FinanceTableCellText } from '@/modules/payments/components/finance-table-cell-text'

const PAGE_SIZE = 10

const SORT_FIELD_MAP = buildCatalogSortFieldMap(
  FINANCE_REVENUE_TABLE_COLUMNS_CATALOG,
  FINANCE_PAYMENT_SORT_OVERRIDES,
)

type RevenueExportRow = RevenueOverviewRow & {
  transactionId?: string
  subCategory?: string
  discounts?: string
  refundAmount?: string
  taxAmount?: string
  netRevenue?: string
  platformCommission?: string
  netProfit?: string
  settlementStatus?: string
  complianceStatus?: string
  lastUpdated?: string
}

const EXPORT_COLUMN_MAP = buildExportColumnMapFromCatalog<RevenueExportRow>(
  FINANCE_REVENUE_TABLE_COLUMNS_CATALOG,
  {
    'transaction-id': (row) => row.transactionId || row.entityId,
    module: (row) => row.module,
    'entity-type': (row) => row.entityType,
    'entity-id': (row) => row.entityId,
    'entity-name': (row) => row.entityName,
    category: (row) => row.category,
    'sub-category': (row) => row.subCategory,
    'owner-type': (row) => row.ownerType,
    'owner-name': (row) => row.ownerName,
    'gross-revenue': (row) => row.grossAmount,
    discounts: (row) => row.discounts,
    'refund-amount': (row) => row.refundAmount,
    'tax-amount': (row) => row.taxAmount,
    'net-revenue': (row) => row.netRevenue,
    'platform-commission': (row) => row.platformCommission,
    'net-profit': (row) => row.netProfit,
    'payment-status': (row) => row.status,
    'settlement-status': (row) => row.settlementStatus,
    'compliance-status': (row) => row.complianceStatus,
    'last-updated': (row) => row.lastUpdated,
  },
)

export function RevenueOverviewPage() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: SORT_FIELD_MAP,
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [tagTarget, setTagTarget] = useState<RevenueOverviewRow | null>(null)
  const [noteTarget, setNoteTarget] = useState<RevenueOverviewRow | null>(null)
  const [rowAction, setRowAction] = useState<FinanceEscalateDeleteAction | null>(null)
  const addNote = useAddFinanceNote()
  const escalate = useEscalateFinance()
  const softDelete = useSoftDeleteFinance()
  const tableColumnPreferencesQuery = useTableColumnPreferences(FINANCE_REVENUE_MODULE_KEY)

  const catalogColumnIds = useMemo(
    () => FINANCE_REVENUE_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_FINANCE_REVENUE_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
    legacyColumnIdMap: FINANCE_REVENUE_LEGACY_COLUMN_ID_MAP,
  })

  const listQueryParams = useMemo(
    () =>
      buildRevenueListQueryParams(appliedFilters, {
        page: currentPage,
        limit: PAGE_SIZE,
        ...enhancedSearch.buildSearchParams(),
        ...serverSort.sortParams,
      }),
    [appliedFilters, currentPage, enhancedSearch, serverSort.sortParams],
  )

  const { data, isLoading, isFetching, isError } = useFinanceRevenue(listQueryParams)

  const payments = useMemo(() => (data?.data?.rows ?? []) as FinancePayment[], [data])

  const partnerIdsNeedingLookup = useMemo(() => {
    const ids = payments
      .filter((payment) => needsPartnerDisplayName(payment))
      .map((payment) => String(payment.partnerId || payment.moduleSnapshot?.partnerId || ''))
      .filter(Boolean)
    return [...new Set(ids)].sort()
  }, [payments])

  const { data: partnerNameMap } = useQuery({
    queryKey: ['finance-revenue-partner-names', partnerIdsNeedingLookup.join(',')],
    queryFn: () => fetchPartnerDisplayNames(partnerIdsNeedingLookup),
    enabled: partnerIdsNeedingLookup.length > 0,
    staleTime: 1000 * 60 * 5,
  })

  const rows = useMemo(
    () => payments.map((payment) => mapPaymentToRevenueRow(payment, partnerNameMap)),
    [payments, partnerNameMap],
  )
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
      const result = await fetchFinanceRevenue(params)
      const payments = (result.data?.rows ?? []) as FinancePayment[]
      const exportLookupIds = [
        ...new Set(
          payments
            .filter((payment) => needsPartnerDisplayName(payment))
            .map((payment) => String(payment.partnerId || payment.moduleSnapshot?.partnerId || ''))
            .filter(Boolean),
        ),
      ]
      const nameMap = exportLookupIds.length ? await fetchPartnerDisplayNames(exportLookupIds) : {}
      return { data: payments.map((payment) => mapPaymentToRevenueRow(payment, nameMap)) }
    }
    return createRevenueFilteredExportHandler(
      fetchForExport,
      EXPORT_COLUMN_MAP,
      'revenue_overview_export',
      { search: enhancedSearch.globalSearch || undefined },
      { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
    )
  }, [catalogColumnIds, enhancedSearch.globalSearch, exportColumnIds])

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
            icon={<SquarePen className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              setNoteTarget(record)
            }}
          >
            Add Internal Notes
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
              navigate(
                escalateUrl(record.id, {
                  kind: 'resource',
                  resourceType: 'Payment',
                  returnTo: '/finance/revenue',
                }),
              )
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
          className="ui-table-checkbox"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={`Select ${row.original.entityName}`}
          checked={selectedRowIds.includes(row.original.id)}
          onChange={() => toggleRowSelection(row.original.id)}
          onClick={(event) => event.stopPropagation()}
          className="ui-table-checkbox"
        />
      ),
      meta: {
        headerClassName: 'pl-5',
        cellClassName: 'pl-5',
      },
    }

    const dataColumnsById: Record<string, ColumnDef<RevenueOverviewRow>> = {
      'transaction-id': {
        id: 'transaction-id',
        header: 'Transaction ID',
        cell: ({ row }) => (
          <span className={cn(FINANCE_TABLE_CELL_CLASS, 'font-mono uppercase')}>
            {(row.original as { transactionId?: string }).transactionId ||
              row.original.entityId ||
              '—'}
          </span>
        ),
      },
      module: {
        accessorKey: 'module',
        header: 'Module',
        cell: ({ row }) => <FinanceTableCellText>{row.original.module}</FinanceTableCellText>,
      },
      'entity-type': {
        accessorKey: 'entityType',
        header: 'Entity Type',
        cell: ({ row }) => <FinanceTableCellText>{row.original.entityType}</FinanceTableCellText>,
      },
      'entity-id': {
        accessorKey: 'entityId',
        header: 'Entity ID',
        cell: ({ row }) => (
          <span className={cn(FINANCE_TABLE_CELL_CLASS, 'font-mono uppercase')}>
            {row.original.entityId}
          </span>
        ),
      },
      'entity-name': {
        accessorKey: 'entityName',
        header: 'Entity Name',
        cell: ({ row }) => (
          <span className={FINANCE_TABLE_CELL_CLASS}>{row.original.entityName}</span>
        ),
      },
      category: {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => <FinanceTableCellText>{row.original.category}</FinanceTableCellText>,
      },
      'sub-category': {
        id: 'sub-category',
        header: 'Sub Category',
        cell: ({ row }) => (row.original as { subCategory?: string }).subCategory || '—',
      },
      'owner-type': {
        accessorKey: 'ownerType',
        header: 'Owner Type',
        cell: ({ row }) => <FinanceTableCellText>{row.original.ownerType}</FinanceTableCellText>,
      },
      'owner-name': {
        accessorKey: 'ownerName',
        header: 'Owner Name',
        cell: ({ row }) => <FinanceTableCellText>{row.original.ownerName}</FinanceTableCellText>,
      },
      'gross-revenue': {
        id: 'gross-revenue',
        accessorKey: 'grossAmount',
        header: 'Gross Revenue',
        cell: ({ row }) => (
          <span className={cn(FINANCE_TABLE_CELL_CLASS, 'font-semibold')}>
            {row.original.grossAmount}
          </span>
        ),
      },
      discounts: {
        id: 'discounts',
        header: 'Discounts',
        cell: ({ row }) => (row.original as { discounts?: string }).discounts || '—',
      },
      'refund-amount': {
        id: 'refund-amount',
        header: 'Refund Amount',
        cell: ({ row }) => (row.original as { refundAmount?: string }).refundAmount || '—',
      },
      'tax-amount': {
        id: 'tax-amount',
        header: 'Tax Amount',
        cell: ({ row }) => (row.original as { taxAmount?: string }).taxAmount || '—',
      },
      'net-revenue': {
        id: 'net-revenue',
        header: 'Net Revenue',
        cell: ({ row }) => (row.original as { netRevenue?: string }).netRevenue || '—',
      },
      'platform-commission': {
        id: 'platform-commission',
        header: 'Platform Commission',
        cell: ({ row }) =>
          (row.original as { platformCommission?: string }).platformCommission || '—',
      },
      'net-profit': {
        id: 'net-profit',
        header: 'Net Profit',
        cell: ({ row }) => (row.original as { netProfit?: string }).netProfit || '—',
      },
      'payment-status': {
        id: 'payment-status',
        accessorKey: 'status',
        header: 'Payment Status',
        cell: ({ row }) => <FinanceTableStatusBadge status={row.original.status} />,
      },
      'settlement-status': {
        id: 'settlement-status',
        header: 'Settlement Status',
        cell: ({ row }) => {
          const status = (row.original as { settlementStatus?: string }).settlementStatus
          return status && status !== '—' ? <FinanceTableStatusBadge status={status} /> : '—'
        },
      },
      'compliance-status': {
        id: 'compliance-status',
        header: 'Compliance Status',
        cell: ({ row }) => {
          const status = (row.original as { complianceStatus?: string }).complianceStatus
          return status && status !== '—' ? <FinanceTableStatusBadge status={status} /> : '—'
        },
      },
      'last-updated': {
        id: 'last-updated',
        header: 'Last Updated',
        cell: ({ row }) => (row.original as { lastUpdated?: string }).lastUpdated || '—',
      },
    }

    const catalogIds = FINANCE_REVENUE_TABLE_COLUMNS_CATALOG.map((column) => column.id)
    const rawVisibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_FINANCE_REVENUE_VISIBLE_COLUMN_IDS
    const visibleIds = sortIdsByCatalogOrder(
      [
        ...new Set(rawVisibleIds.map((id) => FINANCE_REVENUE_LEGACY_COLUMN_ID_MAP[id] ?? id)),
      ].filter((id) => catalogIds.includes(id)),
      catalogIds,
    )

    const preferenceColumns = visibleIds.map((id) => dataColumnsById[id]).filter(Boolean)

    const actionsColumn: ColumnDef<RevenueOverviewRow> = {
      id: 'actions',
      header: 'Actions',
      meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
      cell: ({ row }) => renderActions(row.original),
    }

    return withServerSortMeta([selectColumn, ...preferenceColumns, actionsColumn], SORT_FIELD_MAP)
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
          <p className="ui-page-subtitle mt-1 text-[16px] leading-5 font-medium tracking-normal text-[#FFFFFF80]">
            Manage and monitor all financial transactions
          </p>
          <p className="text-body-sm text-muted mt-3 leading-[20px]">
            <Link to="/finance/dashboard" className="hover:text-brand-text transition-colors">
              Payment &amp; Finance
            </Link>
            <span> / </span>
            <span className="text-brand-text font-semibold">Revenue Overview</span>
          </p>
        </div>
        <Button
          className="ui-manage-metrics"
          onClick={() => navigate('/metrics/finance-revenue?section=table')}
        >
          <ManageMetricsIcon />
          Manage Metrics
        </Button>
      </div>

      {isError ? (
        <p className="text-body-sm text-brand-danger">Failed to load revenue records.</p>
      ) : null}

      <DataTable
        className={FINANCE_DATA_TABLE_CLASS}
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        {...serverSort.dataTableSortProps}
        isLoading={isLoading || isFetching}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={FINANCE_REVENUE_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by transaction ID or partner"
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

      <AddFinanceNoteModal
        open={!!noteTarget}
        isSubmitting={addNote.isPending}
        onClose={() => setNoteTarget(null)}
        onSubmit={(adminNote) => {
          if (!noteTarget) return
          addNote.mutate(
            { id: noteTarget.id, resourceType: 'Payment', adminNote },
            {
              onSuccess: () => {
                toast.success('Note saved')
                setNoteTarget(null)
              },
              onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to save note')),
            },
          )
        }}
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
