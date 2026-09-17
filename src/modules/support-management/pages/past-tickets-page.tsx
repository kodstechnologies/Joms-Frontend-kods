import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft } from 'lucide-react'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { SlaTimerCell } from '../components/sla-timer-cell'
import { TicketPriorityBadge } from '../components/ticket-priority-badge'
import { TicketStatusBadge } from '../components/ticket-status-badge'
import {
  DEFAULT_PAST_TICKETS_VISIBLE_COLUMN_IDS,
  PAST_TICKETS_LEGACY_COLUMN_ID_MAP,
  PAST_TICKETS_MODULE_KEY,
  PAST_TICKETS_TABLE_COLUMNS_CATALOG,
} from '../config/past-tickets-table-columns.config'
import { usePastTickets } from '../hooks/use-support'
import { useSupportStore } from '../store/support-store'
import type { SupportTicket } from '../types/support'
import {
  dashIfEmpty,
  formatTicketDateTime,
  formatTicketDurationHms,
  getPriorityLabel,
  getStatusLabel,
} from '../utils/support-format'
import { fetchPastTickets } from '../api/support-api'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { buildCatalogSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { SUPPORT_TICKET_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import type { FilterValues } from '@/shared/types/data-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildSupportTicketsListQueryParams,
  createSupportTicketsFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'

const PAST_TICKET_SORT_FIELD_MAP = buildCatalogSortFieldMap(PAST_TICKETS_TABLE_COLUMNS_CATALOG)

const EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (ticket: SupportTicket) => string }
> = {
  'ticket-id': { header: 'Ticket ID', accessor: (ticket) => exportDisplayValue(ticket.id) },
  subject: { header: 'Subject', accessor: (ticket) => exportDisplayValue(ticket.subject) },
  status: {
    header: 'Status',
    accessor: (ticket) => exportDisplayValue(getStatusLabel(ticket.status)),
  },
  priority: {
    header: 'Priority',
    accessor: (ticket) => exportDisplayValue(getPriorityLabel(ticket.priority)),
  },
  category: { header: 'Category', accessor: (ticket) => exportDisplayValue(ticket.category) },
  'sla-timer': {
    header: 'SLA Timer',
    accessor: (ticket) => exportDisplayValue(ticket.slaTimer),
  },
  'assigned-on': {
    header: 'Assigned On',
    accessor: (ticket) => exportDisplayValue(formatTicketDateTime(ticket.assignedAt)),
  },
  'assigned-by': {
    header: 'Assigned By',
    accessor: (ticket) => exportDisplayValue(dashIfEmpty(ticket.assignedBy)),
  },
  'assigned-to': {
    header: 'Assigned To',
    accessor: (ticket) => exportDisplayValue(ticket.assignedTo),
  },
  'resolved-at': {
    header: 'Resolved At',
    accessor: (ticket) => exportDisplayValue(formatTicketDateTime(ticket.resolvedAt)),
  },
  'resolved-by': {
    header: 'Resolved By',
    accessor: (ticket) => exportDisplayValue(dashIfEmpty(ticket.resolvedBy)),
  },
  'resolution-time': {
    header: 'Resolution Time',
    accessor: (ticket) =>
      exportDisplayValue(
        formatTicketDurationHms(ticket.resolutionTime, ticket.createdAt, ticket.resolvedAt),
      ),
  },
  'last-updated-at': {
    header: 'Last Updated At',
    accessor: (ticket) =>
      exportDisplayValue(formatTicketDateTime(ticket.lastUpdatedAt || ticket.createdAt)),
  },
}

export function PastTicketsPage() {
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  const { currentPage, setCurrentPage } = useSupportStore()
  const serverSort = useServerTableSort({
    sortFieldMap: PAST_TICKET_SORT_FIELD_MAP,
    defaultSortBy: 'last-updated-at',
    defaultSortOrder: 'desc',
    onPageReset: () => setCurrentPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const { buildSearchParams } = enhancedSearch
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const tableColumnPreferencesQuery = useTableColumnPreferences(PAST_TICKETS_MODULE_KEY)

  const catalogColumnIds = useMemo(
    () => PAST_TICKETS_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_PAST_TICKETS_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
    legacyColumnIdMap: PAST_TICKETS_LEGACY_COLUMN_ID_MAP,
  })

  const listQueryParams = useMemo(
    () =>
      buildSupportTicketsListQueryParams(appliedFilters, {
        page: currentPage,
        limit: 10,
        ...buildSearchParams(),
        ...serverSort.sortParams,
      }),
    [appliedFilters, buildSearchParams, currentPage, serverSort.sortParams],
  )

  const { data, isLoading } = usePastTickets(userId, listQueryParams)

  const tickets = useMemo(() => data?.data?.tickets ?? [], [data?.data?.tickets])
  const meta = data?.data?.meta
  const pageSize = meta?.limit ?? 10
  const totalPages = meta?.totalPages ?? 1
  const totalItems = meta?.total ?? 0

  const columns = useMemo<ColumnDef<SupportTicket>[]>(() => {
    const nowrap = {
      headerClassName: 'whitespace-nowrap',
      cellClassName: 'whitespace-nowrap',
    }
    const dateCell = (value?: string | null) => (
      <span className="text-body-sm text-brand-text whitespace-nowrap tabular-nums">
        {formatTicketDateTime(value)}
      </span>
    )

    const selectColumn: ColumnDef<SupportTicket> = {
      id: 'select',
      header: () => <input type="checkbox" aria-label="Select all" className="ui-table-checkbox" />,
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={`Select ${row.original.id}`}
          className="ui-table-checkbox"
        />
      ),
      meta: { headerClassName: 'pl-5 w-10', cellClassName: 'pl-5 w-10' },
    }

    const dataColumnsById: Record<string, ColumnDef<SupportTicket>> = {
      'ticket-id': {
        id: 'ticket-id',
        accessorKey: 'id',
        header: 'Ticket ID',
        cell: ({ row }) => (
          <Link
            to={`/support/tickets/${row.original.id}`}
            className="text-body-sm-semibold text-brand-accent font-mono hover:underline"
          >
            #{row.original.id}
          </Link>
        ),
      },
      subject: {
        id: 'subject',
        accessorKey: 'subject',
        header: 'Subject',
        cell: ({ row }) => (
          <span className="text-body-sm text-brand-text">{row.original.subject}</span>
        ),
      },
      status: {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <TicketStatusBadge status={row.original.status} />,
      },
      priority: {
        id: 'priority',
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => <TicketPriorityBadge priority={row.original.priority} />,
      },
      category: {
        id: 'category',
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => dashIfEmpty(row.original.category),
      },
      'sla-timer': {
        id: 'sla-timer',
        accessorKey: 'slaTimer',
        header: 'SLA Timer',
        cell: ({ row }) => (
          <SlaTimerCell
            slaTimer={row.original.slaTimer}
            slaDueAt={row.original.slaDueAt}
            status={row.original.status}
          />
        ),
        meta: nowrap,
      },
      'assigned-on': {
        id: 'assigned-on',
        accessorKey: 'assignedAt',
        header: 'Assigned On',
        cell: ({ row }) => dateCell(row.original.assignedAt),
        meta: nowrap,
      },
      'assigned-by': {
        id: 'assigned-by',
        accessorKey: 'assignedBy',
        header: 'Assigned By',
        cell: ({ row }) => dashIfEmpty(row.original.assignedBy),
      },
      'assigned-to': {
        id: 'assigned-to',
        accessorKey: 'assignedTo',
        header: 'Assigned To',
        cell: ({ row }) => dashIfEmpty(row.original.assignedTo),
      },
      'resolved-at': {
        id: 'resolved-at',
        accessorKey: 'resolvedAt',
        header: 'Resolved At',
        cell: ({ row }) => dateCell(row.original.resolvedAt),
        meta: nowrap,
      },
      'resolved-by': {
        id: 'resolved-by',
        accessorKey: 'resolvedBy',
        header: 'Resolved By',
        cell: ({ row }) => dashIfEmpty(row.original.resolvedBy),
      },
      'resolution-time': {
        id: 'resolution-time',
        accessorKey: 'resolutionTime',
        header: 'Resolution Time',
        cell: ({ row }) => (
          <span className="text-body-sm text-brand-text whitespace-nowrap tabular-nums">
            {formatTicketDurationHms(
              row.original.resolutionTime,
              row.original.createdAtIso,
              row.original.resolvedAt,
            )}
          </span>
        ),
        meta: nowrap,
      },
      'last-updated-at': {
        id: 'last-updated-at',
        accessorKey: 'lastUpdatedAt',
        header: 'Last Updated At',
        cell: ({ row }) => dateCell(row.original.lastUpdatedAt),
        meta: nowrap,
      },
    }

    const catalogIds = PAST_TICKETS_TABLE_COLUMNS_CATALOG.map((column) => column.id)
    const rawVisibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_PAST_TICKETS_VISIBLE_COLUMN_IDS

    const preferenceColumns = sortIdsByCatalogOrder(
      [...new Set(rawVisibleIds.map((id) => PAST_TICKETS_LEGACY_COLUMN_ID_MAP[id] ?? id))].filter(
        (id) => catalogIds.includes(id),
      ),
      catalogIds,
    )
      .map((id) => dataColumnsById[id])
      .filter(Boolean)

    return withServerSortMeta([selectColumn, ...preferenceColumns], PAST_TICKET_SORT_FIELD_MAP)
  }, [tableColumnPreferencesQuery.data])

  const handleApplyFilters = useCallback(
    (values: FilterValues) => {
      toast.success('Filters applied')
      setAppliedFilters(values)
      setCurrentPage(1)
    },
    [setCurrentPage],
  )

  const handleExportData = useMemo(() => {
    const fetchForExport = async (
      params: Record<string, unknown>,
    ): Promise<{
      data: SupportTicket[]
      meta?: { page: number; limit: number; total: number; totalPages: number }
    }> => {
      if (!userId) return { data: [] }
      const result = await fetchPastTickets(userId, params)
      return {
        data: result.data?.tickets ?? [],
        meta: result.data?.meta,
      }
    }
    return createSupportTicketsFilteredExportHandler(
      fetchForExport,
      EXPORT_COLUMN_MAP,
      'past_tickets_export',
      { search: enhancedSearch.globalSearch || undefined },
      { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
    )
  }, [catalogColumnIds, enhancedSearch.globalSearch, exportColumnIds, userId])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'support-tickets',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/support/workspace')}
            className="text-muted hover:text-brand-text mt-1 grid size-6 shrink-0 place-items-center rounded transition-colors"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-h2 text-brand-text tracking-tight">Past Tickets</h1>
            <p className="ui-page-subtitle mt-1 text-[16px] leading-5 font-medium tracking-normal text-[#FFFFFF80]">
              {tickets[0]?.reporter ?? userId ?? 'Reporter'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/metrics/past-tickets?section=table')}
          className="ui-manage-metrics ui-cta ui-cta-primary shrink-0"
        >
          <ManageMetricsIcon />
          Manage Metrics
        </button>
      </div>

      <DataTable
        columns={columns}
        data={tickets}
        getRowId={(row) => row.id}
        {...serverSort.dataTableSortProps}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={SUPPORT_TICKET_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by ticket ID or subject"
        advancedFilterLabel="Advance Filters"
        onAdvancedFilter={onAdvancedFilter}
        advancedFilterVariant="primary"
        onExport={onExport}
        isLoading={isLoading}
        pagination={{
          page: currentPage,
          pageSize,
          totalItems,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="tickets"
        emptyMessage="No past tickets found."
      />
      {exportFilterModals}
    </div>
  )
}
