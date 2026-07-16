import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { TicketPriorityBadge } from '../components/ticket-priority-badge'
import { TicketStatusBadge } from '../components/ticket-status-badge'
import { pastTicketsMock } from '../mock/support.mock'
import { useSupportStore } from '../store/support-store'
import type { SupportTicket } from '../types/support'
import { DataTable } from '@/shared/components/table/data-table'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
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

  const columns = useMemo<ColumnDef<SupportTicket>[]>(
    () => [
      {
        id: 'select',
        header: () => <input type="checkbox" className="rounded border-white/20" />,
        cell: () => <input type="checkbox" className="rounded border-white/20" />,
        meta: { headerClassName: 'w-10', cellClassName: 'w-10' },
      },
      {
        accessorKey: 'id',
        header: 'Ticket ID',
        cell: ({ row }) => (
          <Link
            to={`/support/tickets/${row.original.id}`}
            className="font-mono text-xs text-amber-400 hover:underline"
          >
            #{row.original.id}
          </Link>
        ),
      },
      { accessorKey: 'subject', header: 'Subject' },
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
        header: '',
        cell: () => (
          <button type="button" className="text-slate-500 hover:text-white">
            ⋮
          </button>
        ),
        meta: { headerClassName: 'w-12', cellClassName: 'w-12' },
      },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/support/workspace')}
          className="mt-1 rounded-lg border border-white/10 p-2 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </button>
        <SectionHeader
          title="Past Tickets"
          subtitle={userId ? `User ID: ${userId}` : 'John Doe'}
          actions={[
            {
              label: 'Manage Metrics',
              onClick: () => toast.message('Metrics configuration coming soon'),
            },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={paginated}
        getRowId={(row) => row.id}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, ID or profession"
        onAdvancedFilter={() => toast.message('Advanced filters coming soon')}
        onExport={() => toast.message('Export coming soon')}
        pagination={{
          page: currentPage,
          pageSize,
          totalItems: filtered.length,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="users"
      />
    </div>
  )
}
