import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeftRight,
  Eye,
  MessageSquarePlus,
  Pencil,
  SlidersHorizontal,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'

import { AddTagModal } from '@/shared/components/modal/add-tag-modal'
import { EscalateTicketModal } from '../components/reassign-ticket-modal'
import { TicketPriorityBadge } from '../components/ticket-priority-badge'
import { TicketStatusBadge } from '../components/ticket-status-badge'
import {
  DEFAULT_TICKET_MANAGEMENT_METRIC_IDS,
  TICKET_MANAGEMENT_METRIC_IDS,
  TICKET_MANAGEMENT_METRIC_ID_SET,
  TICKET_MANAGEMENT_MODULE_KEY,
} from '../config/ticket-management-metrics.config'
import {
  useDeleteSupportTicket,
  useEscalateSupportTicket,
  useExportSupportTickets,
  useLiveSupportUpdates,
  useSupportAgents,
  useSupportTickets,
  useUpdateSupportTicket,
} from '../hooks/use-support'
import { useSupportStore } from '../store/support-store'
import type { SupportTicket, TicketTab } from '../types/support'
import {
  downloadBlob,
  getApiErrorMessage,
  getPriorityLabel,
  getStatusLabel,
  nextPriority,
  nextStatus,
} from '../utils/support-format'
import { buildTicketManagementMetricCards } from '../utils/ticket-management-metrics'
import {
  orderByActiveMetricIds,
  useActiveMetricIds,
} from '@/modules/expert/hooks/use-active-metric-ids'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

const TABS: { key: TicketTab; label: string }[] = [
  { key: 'my_tickets', label: 'My Tickets' },
  { key: 'escalated', label: 'Escalated Tickets' },
  { key: 'all', label: 'All Tickets' },
]

function TicketMetricCard({
  title,
  value,
  percentage,
  direction,
}: {
  title: string
  value: string
  percentage: number
  direction: 'up' | 'down'
}) {
  const isUp = direction === 'up'

  return (
    <div className="radius-lg bg-brand-surface flex h-[130px] flex-col justify-center border border-white/[0.06] p-5">
      <p className="text-body-sm-medium text-muted">{title}</p>
      <p className="text-h2 text-brand-text mt-2 tracking-tight">{value}</p>
      <div className="mt-3">
        <span
          className={cn(
            'text-body-sm-semibold inline-flex items-center gap-1 rounded-md px-2 py-0.5',
            isUp
              ? 'bg-brand-positive/15 text-brand-positive'
              : 'bg-brand-danger/15 text-brand-danger',
          )}
        >
          {isUp ? (
            <TrendingUp className="size-3" strokeWidth={2} />
          ) : (
            <TrendingDown className="size-3" strokeWidth={2} />
          )}
          {isUp ? '+' : ''}
          {percentage}% vs last month
        </span>
      </div>
    </div>
  )
}

export function TicketManagementPage() {
  const navigate = useNavigate()
  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    activeTab,
    setActiveTab,
    setSelectedTicketId,
  } = useSupportStore()

  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [tagModalOpen, setTagModalOpen] = useState(false)
  const [escalateOpen, setEscalateOpen] = useState(false)
  const [escalateTicketId, setEscalateTicketId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null)

  const { data, isLoading } = useSupportTickets({
    page: currentPage,
    limit: 10,
    search: searchQuery || undefined,
    tab: activeTab,
    includeClosed: true,
  })
  const updateMutation = useUpdateSupportTicket()
  const escalateMutation = useEscalateSupportTicket()
  const deleteMutation = useDeleteSupportTicket()
  const exportMutation = useExportSupportTickets()
  const agentsQuery = useSupportAgents()
  useLiveSupportUpdates()
  const activeMetricIds = useActiveMetricIds(TICKET_MANAGEMENT_MODULE_KEY, [
    ...DEFAULT_TICKET_MANAGEMENT_METRIC_IDS,
  ])

  const filteredActiveMetricIds = useMemo(
    () =>
      sortIdsByCatalogOrder(
        activeMetricIds.filter((id) => TICKET_MANAGEMENT_METRIC_ID_SET.has(id)),
        TICKET_MANAGEMENT_METRIC_IDS,
      ),
    [activeMetricIds],
  )

  const tickets = useMemo(() => data?.data?.tickets ?? [], [data?.data?.tickets])
  const meta = data?.data?.meta
  const pageSize = meta?.limit ?? 10
  const totalPages = meta?.totalPages ?? 1
  const totalItems = meta?.total ?? 0

  const stats = useMemo(() => {
    const allCards = buildTicketManagementMetricCards(data?.data?.stats)
    return orderByActiveMetricIds(allCards, filteredActiveMetricIds)
  }, [data?.data?.stats, filteredActiveMetricIds])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.length === tickets.length ? [] : tickets.map((ticket) => ticket.id),
    )
  }, [tickets])

  const handleExport = useCallback(async () => {
    try {
      const blob = await exportMutation.mutateAsync({
        search: searchQuery || undefined,
        tab: activeTab,
      })
      downloadBlob(blob, 'support-tickets.csv')
      toast.success('Export downloaded')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to export tickets'))
    }
  }, [activeTab, exportMutation, searchQuery])

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
            onClick={() => {
              setActiveDropdownId(null)
              setSelectedTicketId(id)
              navigate(`/support/workspace`)
            }}
          >
            Edit Ticket
          </TableActionsItem>
          <TableActionsItem
            icon={<ArrowLeftRight className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={async () => {
              setActiveDropdownId(null)
              const status = nextStatus(record.status)
              try {
                await updateMutation.mutateAsync({ id, payload: { status } })
                toast.success(`Status updated to ${getStatusLabel(status)}`)
              } catch (err) {
                toast.error(getApiErrorMessage(err, 'Failed to update status'))
              }
            }}
          >
            Change Status
          </TableActionsItem>
          <TableActionsItem
            icon={<SlidersHorizontal className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={async () => {
              setActiveDropdownId(null)
              const priority = nextPriority(record.priority)
              try {
                await updateMutation.mutateAsync({ id, payload: { priority } })
                toast.success(`Priority updated to ${getPriorityLabel(priority)}`)
              } catch (err) {
                toast.error(getApiErrorMessage(err, 'Failed to update priority'))
              }
            }}
          >
            Change Priority
          </TableActionsItem>
          <TableActionsItem
            icon={<MessageSquarePlus className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              setSelectedTicketId(id)
              navigate(`/support/workspace`)
            }}
          >
            Add internal note
          </TableActionsItem>
          <TableActionsItem
            icon={<Tag className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              setActiveTicketId(id)
              setTagModalOpen(true)
            }}
          >
            Add Tags
          </TableActionsItem>
          <TableActionsItem
            icon={<AlertTriangle className="size-3.5 text-slate-700" aria-hidden="true" />}
            className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => {
              setActiveDropdownId(null)
              setEscalateTicketId(id)
              setEscalateOpen(true)
            }}
          >
            Escalate
          </TableActionsItem>
          <TableActionsItem
            icon={<Trash2 className="text-brand-danger size-3.5" aria-hidden="true" />}
            className="text-brand-danger hover:bg-brand-danger/10 hover:text-brand-danger"
            onClick={async () => {
              setActiveDropdownId(null)
              try {
                await deleteMutation.mutateAsync(id)
                toast.success('Ticket deleted')
              } catch (err) {
                toast.error(getApiErrorMessage(err, 'Failed to delete ticket'))
              }
            }}
          >
            Delete
          </TableActionsItem>
        </TableActionsDropdown>
      )
    },
    [activeDropdownId, deleteMutation, navigate, setSelectedTicketId, updateMutation],
  )

  const columns = useMemo<ColumnDef<SupportTicket>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            aria-label="Select all"
            className="rounded border-white/20"
            checked={tickets.length > 0 && selectedIds.length === tickets.length}
            onChange={toggleSelectAll}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Select ${row.original.id}`}
            className="rounded border-white/20"
            checked={selectedIds.includes(row.original.id)}
            onChange={() => toggleSelect(row.original.id)}
          />
        ),
        meta: { headerClassName: 'pl-5 w-10', cellClassName: 'pl-5 w-10' },
      },
      {
        accessorKey: 'id',
        header: 'Ticket ID',
        cell: ({ row }) => <span className="ui-table-id text-brand-text">#{row.original.id}</span>,
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
        id: 'actions',
        header: 'Actions',
        meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
        cell: ({ row }) => renderActions(row.original),
      },
    ],
    [renderActions, selectedIds, tickets.length, toggleSelect, toggleSelectAll],
  )

  const activeTicket = tickets.find((t) => t.id === activeTicketId)
  const escalateTicket = tickets.find((t) => t.id === escalateTicketId)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-h1 text-brand-text tracking-tight">Ticket Management</h1>
          <p className="text-body-md text-muted mt-1 leading-[20px]">
            Decision-centric workspace for high-impact tickets requiring approval, enforcement, or
            oversight
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="primary"
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="ui-export-data ui-cta ui-cta-primary"
          >
            <Upload className="icon-sm shrink-0" aria-hidden="true" />
            Export Data
          </Button>
          <button
            type="button"
            onClick={() => navigate('/metrics/ticket-management')}
            className="ui-manage-metrics ui-cta ui-cta-primary"
          >
            <SlidersHorizontal className="icon-sm shrink-0" aria-hidden="true" />
            Manage Metrics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(isLoading && stats.length === 0
          ? filteredActiveMetricIds.map((id) => ({
              id,
              title: 'Loading',
              value: '—',
              percentage: 0,
              direction: 'up' as const,
            }))
          : stats
        ).map((stat) => (
          <TicketMetricCard key={stat.id} {...stat} />
        ))}
      </div>

      <div className="bg-brand-surface flex h-[47px] w-full items-center rounded-[10px] border border-white/[0.06] p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key)
              setCurrentPage(1)
              setSelectedIds([])
            }}
            className={cn(
              'text-body-sm flex h-[37px] flex-1 items-center justify-center rounded-md px-4 leading-[20px] transition-colors',
              activeTab === tab.key
                ? 'bg-[#050505] font-medium text-white'
                : 'text-white/50 hover:text-white',
            )}
          >
            {tab.label}
          </button>
        ))}
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
        onAdvancedFilter={() => toast.message('Advanced filters coming soon')}
        onExport={handleExport}
        isExporting={exportMutation.isPending}
        isLoading={isLoading}
        pagination={{
          page: currentPage,
          pageSize,
          totalItems,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="tickets"
        emptyMessage="No tickets found."
      />

      <AddTagModal
        open={tagModalOpen}
        onClose={() => {
          setTagModalOpen(false)
          setActiveTicketId(null)
        }}
        initialTags={activeTicket?.tags}
        onSubmit={async (tags) => {
          if (!activeTicketId) return
          try {
            await updateMutation.mutateAsync({
              id: activeTicketId,
              payload: { tags },
            })
            toast.success('Tags updated')
          } catch (err) {
            toast.error(getApiErrorMessage(err, 'Failed to update tags'))
            throw err
          }
        }}
      />

      <EscalateTicketModal
        open={escalateOpen}
        agents={agentsQuery.data?.data?.agents ?? []}
        isLoading={agentsQuery.isFetching}
        currentAssigneeId={escalateTicket?.assignedToId}
        isSubmitting={escalateMutation.isPending}
        onClose={() => {
          setEscalateOpen(false)
          setEscalateTicketId(null)
        }}
        onSelect={async (agent) => {
          if (!escalateTicketId) return
          try {
            await escalateMutation.mutateAsync({
              id: escalateTicketId,
              payload: {
                assignedToId: agent.id,
                assignedToName: agent.name,
                assignedToAvatarUrl: agent.avatarUrl,
              },
            })
            setEscalateOpen(false)
            setEscalateTicketId(null)
            toast.success(`Ticket escalated to ${agent.name}`)
          } catch (err) {
            toast.error(getApiErrorMessage(err, 'Failed to escalate ticket'))
          }
        }}
      />
    </div>
  )
}
