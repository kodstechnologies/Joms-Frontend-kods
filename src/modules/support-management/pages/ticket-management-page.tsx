import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeftRight,
  Download,
  Eye,
  GitMerge,
  MessageSquarePlus,
  Pencil,
  SlidersHorizontal,
  Tag,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

import { AddTagModal } from '../components/add-tag-modal'
import { MergeTicketsModal } from '../components/merge-tickets-modal'
import { TicketPriorityBadge } from '../components/ticket-priority-badge'
import { TicketStatusBadge } from '../components/ticket-status-badge'
import { supportTicketsMock, ticketManagementStats } from '../mock/support.mock'
import { useSupportStore } from '../store/support-store'
import type { SupportTicket, TicketTab } from '../types/support'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { StatCard } from '@/shared/components/dashboard/stat-card'
import { cn } from '@/shared/lib/cn'

const TABS: { key: TicketTab; label: string }[] = [
  { key: 'my_tickets', label: 'My Tickets' },
  { key: 'escalated', label: 'Escalated Tickets' },
  { key: 'all', label: 'All Tickets' },
]

export function TicketManagementPage() {
  const navigate = useNavigate()
  const { searchQuery, setSearchQuery, currentPage, setCurrentPage, activeTab, setActiveTab } =
    useSupportStore()

  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [tagModalOpen, setTagModalOpen] = useState(false)
  const [mergeModalOpen, setMergeModalOpen] = useState(false)

  const stats = ticketManagementStats.map((s) => ({
    title: s.title,
    value: s.value,
    trend: { direction: 'up' as const, percentage: 6.7, label: 'vs last month' },
  }))

  const filtered = useMemo(() => {
    let data = supportTicketsMock
    if (activeTab === 'escalated') {
      data = data.filter((t) => t.priority === 'critical' || t.priority === 'high')
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      data = data.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.reporter.toLowerCase().includes(q),
      )
    }
    return data
  }, [activeTab, searchQuery])

  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const renderActions = useCallback(
    (record: SupportTicket) => {
      const id = record.id
      const isOpen = activeDropdownId === id

      return (
        <TableActionsDropdown
          label="Open ticket actions"
          isOpen={isOpen}
          onOpenChange={(open) => setActiveDropdownId(open ? id : null)}
          menuWidth={210}
        >
          <TableActionsItem
            icon={<Eye className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              navigate(`/support/tickets/${id}`)
            }}
          >
            View Details
          </TableActionsItem>
          <TableActionsItem
            icon={<Pencil className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => toast.message('Edit coming soon')}
          >
            Edit Ticket
          </TableActionsItem>
          <TableActionsItem
            icon={<ArrowLeftRight className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => toast.message('Status change coming soon')}
          >
            Change Status
          </TableActionsItem>
          <TableActionsItem
            icon={<SlidersHorizontal className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => toast.message('Priority change coming soon')}
          >
            Change Priority
          </TableActionsItem>
          <TableActionsItem
            icon={<MessageSquarePlus className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => toast.message('Note added (static)')}
          >
            Add internal note
          </TableActionsItem>
          <TableActionsItem
            icon={<Tag className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              setTagModalOpen(true)
            }}
          >
            Add Tags
          </TableActionsItem>
          <TableActionsItem
            icon={<AlertTriangle className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => toast.message('Escalation coming soon')}
          >
            Escalate
          </TableActionsItem>
          <TableActionsItem
            icon={<Trash2 className="text-brand-danger size-3.5" aria-hidden="true" />}
            className="text-brand-danger hover:bg-brand-danger/10 hover:text-brand-danger"
            onClick={() => toast.message('Delete coming soon')}
          >
            Delete
          </TableActionsItem>
          <TableActionsItem
            icon={<GitMerge className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              setMergeModalOpen(true)
            }}
          >
            Merge
          </TableActionsItem>
        </TableActionsDropdown>
      )
    },
    [activeDropdownId, navigate],
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
          <span className="text-body-sm-semibold text-brand-text font-mono">
            #{row.original.id}
          </span>
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
        <div>
          <h1 className="text-h2 text-brand-text tracking-tight">Ticket Management</h1>
          <p className="text-body-md text-muted mt-1 leading-[20px]">
            Decision-centric workspace for high-impact tickets requiring approval, enforcement, or
            oversight
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => toast.message('Export coming soon')}
            className="ui-cta ui-cta-ghost"
          >
            <Download className="icon-sm shrink-0" />
            Export Data
          </button>
          <button
            type="button"
            onClick={() => navigate('/metrics/ticket-management')}
            className="ui-manage-metrics ui-cta ui-cta-primary"
          >
            <SlidersHorizontal className="icon-sm shrink-0" />
            Manage Metrics
          </button>
        </div>
      </div>

      {/* Stat cards — 4 cols */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Tab switcher */}
      <div className="radius-lg bg-brand-surface flex gap-1 border border-white/10 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key)
              setCurrentPage(1)
            }}
            className={cn(
              'text-body-md-medium flex-1 rounded-lg px-4 py-2.5 transition-colors',
              activeTab === tab.key
                ? 'bg-brand-bg text-brand-text'
                : 'text-muted hover:text-brand-text',
            )}
          >
            {tab.label}
          </button>
        ))}
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
        emptyMessage="No tickets found."
      />

      <AddTagModal open={tagModalOpen} onClose={() => setTagModalOpen(false)} />
      <MergeTicketsModal open={mergeModalOpen} onClose={() => setMergeModalOpen(false)} />
    </div>
  )
}
