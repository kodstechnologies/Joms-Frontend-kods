import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, Eye, SlidersHorizontal } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { SlaTimerCell } from '../components/sla-timer-cell'
import { TicketPriorityBadge } from '../components/ticket-priority-badge'
import { TicketStatusBadge } from '../components/ticket-status-badge'
import { usePastTickets } from '../hooks/use-support'
import { useSupportStore } from '../store/support-store'
import type { SupportTicket } from '../types/support'
import { getPriorityLabel, getStatusLabel } from '../utils/support-format'
import { fetchPastTickets } from '../api/support-api'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import type { FilterValues } from '@/shared/types/data-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildSupportTicketsListQueryParams,
  createSupportTicketsFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'

export function PastTicketsPage() {
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  const { searchQuery, setSearchQuery, currentPage, setCurrentPage } = useSupportStore()
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const listQueryParams = useMemo(
    () =>
      buildSupportTicketsListQueryParams(appliedFilters, {
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
      }),
    [appliedFilters, currentPage, searchQuery],
  )

  const { data, isLoading } = usePastTickets(userId, listQueryParams)

  const tickets = useMemo(() => data?.data?.tickets ?? [], [data?.data?.tickets])
  const meta = data?.data?.meta
  const pageSize = meta?.limit ?? 10
  const totalPages = meta?.totalPages ?? 1
  const totalItems = meta?.total ?? 0

  const renderActions = useCallback(
    (record: SupportTicket) => (
      <TableActionsDropdown
        label="Open ticket actions"
        isOpen={false}
        onOpenChange={() => {}}
        menuWidth={180}
      >
        <TableActionsItem
          icon={<Eye className="size-3.5 text-slate-700" aria-hidden="true" />}
          className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => navigate(`/support/tickets/${record.id}`)}
        >
          View Details
        </TableActionsItem>
      </TableActionsDropdown>
    ),
    [navigate],
  )

  const columns = useMemo<ColumnDef<SupportTicket>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input type="checkbox" aria-label="Select all" className="rounded border-white/20" />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Select ${row.original.id}`}
            className="rounded border-white/20"
          />
        ),
        meta: { headerClassName: 'pl-5 w-10', cellClassName: 'pl-5 w-10' },
      },
      {
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
      {
        accessorKey: 'subject',
        header: 'Subject',
        cell: ({ row }) => (
          <span className="text-body-sm text-brand-text">{row.original.subject}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <TicketStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => <TicketPriorityBadge priority={row.original.priority} />,
      },
      { accessorKey: 'category', header: 'Category' },
      { accessorKey: 'reporter', header: 'Reporter' },
      { accessorKey: 'assignedTo', header: 'Assigned To' },
      {
        accessorKey: 'slaTimer',
        header: 'SLA Timer',
        cell: ({ row }) => (
          <SlaTimerCell
            slaTimer={row.original.slaTimer}
            slaDueAt={row.original.slaDueAt}
            status={row.original.status}
          />
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
        cell: ({ row }) => renderActions(row.original),
      },
    ],
    [renderActions],
  )

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
    ): Promise<{ data: SupportTicket[] }> => {
      if (!userId) return { data: [] }
      const result = await fetchPastTickets(userId, params)
      return { data: result.data?.tickets ?? [] }
    }
    return createSupportTicketsFilteredExportHandler(
      fetchForExport,
      {
        id: { header: 'Ticket ID', accessor: (ticket) => exportDisplayValue(ticket.id) },
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
        reporter: { header: 'Reporter', accessor: (ticket) => exportDisplayValue(ticket.reporter) },
        assignedTo: {
          header: 'Assigned To',
          accessor: (ticket) => exportDisplayValue(ticket.assignedTo),
        },
      },
      'past_tickets_export',
      { search: searchQuery || undefined },
    )
  }, [searchQuery, userId])

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
      {/* Header */}
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
            <p className="text-body-md text-muted mt-1 leading-5">
              {tickets[0]?.reporter ?? userId ?? 'Reporter'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/metrics/past-tickets')}
          className="ui-manage-metrics ui-cta ui-cta-primary shrink-0"
        >
          <SlidersHorizontal className="icon-sm shrink-0" />
          Manage Metrics
        </button>
      </div>

      <DataTable
        columns={columns}
        data={tickets}
        getRowId={(row) => row.id}
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val)
          setCurrentPage(1)
        }}
        searchPlaceholder="Search by name, ID or profession"
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
