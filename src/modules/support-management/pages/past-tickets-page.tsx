import { useCallback, useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, Eye, SlidersHorizontal } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { TicketPriorityBadge } from '../components/ticket-priority-badge'
import { TicketStatusBadge } from '../components/ticket-status-badge'
import { pastTicketsMock } from '../mock/support.mock'
import { useSupportStore } from '../store/support-store'
import type { SupportTicket } from '../types/support'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

export function PastTicketsPage() {
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  const { searchQuery, setSearchQuery, currentPage, setCurrentPage } = useSupportStore()

  const filtered = useMemo(() => {
    if (!searchQuery) return pastTicketsMock
    const q = searchQuery.toLowerCase()
    return pastTicketsMock.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.reporter.toLowerCase().includes(q),
    )
  }, [searchQuery])

  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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
      { accessorKey: 'slaTimer', header: 'SLA Timer' },
      {
        id: 'actions',
        header: 'Actions',
        meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
        cell: ({ row }) => renderActions(row.original),
      },
    ],
    [renderActions],
  )

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
            <p className="text-body-md text-muted mt-1 leading-5">{userId ?? 'John Doe'}</p>
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
        data={paginated}
        getRowId={(row) => row.id}
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val)
          setCurrentPage(1)
        }}
        searchPlaceholder="Search by name, ID or profession"
        advancedFilterLabel="Advance Filters"
        onAdvancedFilter={() => toast.message('Advanced filters coming soon')}
        onExport={() => toast.message('Export coming soon')}
        pagination={{
          page: currentPage,
          pageSize,
          totalItems: filtered.length,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="tickets"
        emptyMessage="No past tickets found."
      />
    </div>
  )
}
