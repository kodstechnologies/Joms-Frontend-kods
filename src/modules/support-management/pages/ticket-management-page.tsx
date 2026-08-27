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
import { EscalationStatusBadge } from '../components/escalation-status-badge'
import { TicketPriorityBadge } from '../components/ticket-priority-badge'
import { TicketStatusBadge } from '../components/ticket-status-badge'
import { SlaTimerCell } from '../components/sla-timer-cell'
import {
  DEFAULT_TICKET_MANAGEMENT_METRIC_IDS,
  TICKET_MANAGEMENT_LEGACY_METRIC_ID_MAP,
  TICKET_MANAGEMENT_METRIC_IDS,
  TICKET_MANAGEMENT_METRIC_ID_SET,
  TICKET_MANAGEMENT_MODULE_KEY,
} from '../config/ticket-management-metrics.config'
import {
  ALL_TAB_COLUMN_ID_SET,
  DEFAULT_TICKET_MANAGEMENT_VISIBLE_COLUMN_IDS,
  ESCALATED_TAB_COLUMN_ID_SET,
  MY_TAB_COLUMN_ID_SET,
  TICKET_MANAGEMENT_LEGACY_COLUMN_ID_MAP,
  TICKET_MANAGEMENT_TABLE_COLUMNS_CATALOG,
} from '../config/ticket-management-table-columns.config'
import {
  useDeleteSupportTicket,
  useEscalateSupportTicket,
  useLiveSupportUpdates,
  useSupportAgents,
  useSupportTickets,
  useUpdateSupportTicket,
} from '../hooks/use-support'
import { useSupportStore } from '../store/support-store'
import type { SupportTicket, TicketTab } from '../types/support'
import {
  getApiErrorMessage,
  getEscalationStatusLabel,
  getPriorityLabel,
  getStatusLabel,
  nextPriority,
  nextStatus,
  formatTicketDateTime,
  formatTicketDurationHms,
  dashIfEmpty,
} from '../utils/support-format'
import { buildTicketManagementMetricCards } from '../utils/ticket-management-metrics'
import {
  orderByActiveMetricIds,
  useActiveMetricIds,
} from '@/modules/expert/hooks/use-active-metric-ids'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import type { FilterValues } from '@/shared/types/data-filter'
import { exportDataToFile, exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildSupportTicketsListQueryParams,
  createSupportTicketsFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import { fetchSupportTickets } from '../api/support-api'

const TABS: { key: TicketTab; label: string }[] = [
  { key: 'my_tickets', label: 'My Tickets' },
  { key: 'escalated', label: 'Escalated Tickets' },
  { key: 'all', label: 'All Tickets' },
]

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
  reporter: { header: 'Reporter', accessor: (ticket) => exportDisplayValue(ticket.reporter) },
  'sla-timer': {
    header: 'SLA Timer',
    accessor: (ticket) => exportDisplayValue(ticket.slaTimer),
  },
  'first-response-due': {
    header: 'First Response Due',
    accessor: (ticket) => exportDisplayValue(formatTicketDateTime(ticket.firstResponseDueAt)),
  },
  'resolution-due': {
    header: 'Resolution Due',
    accessor: (ticket) =>
      exportDisplayValue(formatTicketDateTime(ticket.resolutionDueAt || ticket.slaDueAt)),
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
  'escalated-at': {
    header: 'Escalated At',
    accessor: (ticket) => exportDisplayValue(formatTicketDateTime(ticket.escalatedAt)),
  },
  'escalated-for': {
    header: 'Escalated For',
    accessor: (ticket) => exportDisplayValue(dashIfEmpty(ticket.escalatedFor)),
  },
  'escalated-to': {
    header: 'Escalated To',
    accessor: (ticket) => exportDisplayValue(dashIfEmpty(ticket.escalatedTo)),
  },
  'escalated-by': {
    header: 'Escalated By',
    accessor: (ticket) => exportDisplayValue(dashIfEmpty(ticket.escalatedBy)),
  },
  'escalation-status': {
    header: 'Escalation Status',
    accessor: (ticket) =>
      exportDisplayValue(dashIfEmpty(getEscalationStatusLabel(ticket.escalationStatus))),
  },
}

const ALL_TICKETS_EXPORT_KEYS = [
  'ticket-id',
  'subject',
  'status',
  'priority',
  'category',
  'reporter',
  'sla-timer',
  'first-response-due',
  'resolution-due',
  'assigned-on',
  'assigned-by',
  'assigned-to',
  'resolved-at',
  'resolved-by',
  'resolution-time',
  'last-updated-at',
] as const

const MY_TICKETS_EXPORT_KEYS = [
  'ticket-id',
  'subject',
  'status',
  'priority',
  'category',
  'reporter',
  'sla-timer',
  'assigned-on',
  'assigned-by',
  'escalated-at',
  'escalated-for',
  'escalated-to',
  'resolution-time',
  'last-updated-at',
] as const

const ESCALATED_TICKETS_EXPORT_KEYS = [
  'ticket-id',
  'subject',
  'status',
  'priority',
  'category',
  'reporter',
  'sla-timer',
  'assigned-on',
  'assigned-by',
  'assigned-to',
  'escalated-by',
  'escalated-to',
  'escalated-at',
  'escalation-status',
  'escalated-for',
  'last-updated-at',
] as const

function exportKeysForTab(tab: TicketTab) {
  if (tab === 'my_tickets') return MY_TICKETS_EXPORT_KEYS
  if (tab === 'escalated') return ESCALATED_TICKETS_EXPORT_KEYS
  return ALL_TICKETS_EXPORT_KEYS
}

function pickExportColumns(keys: readonly string[]) {
  return Object.fromEntries(
    keys.filter((key) => EXPORT_COLUMN_MAP[key]).map((key) => [key, EXPORT_COLUMN_MAP[key]]),
  )
}

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
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [isExportingMetrics, setIsExportingMetrics] = useState(false)

  const listQueryParams = useMemo(
    () =>
      buildSupportTicketsListQueryParams(appliedFilters, {
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        tab: activeTab,
        includeClosed: true,
      }),
    [activeTab, appliedFilters, currentPage, searchQuery],
  )

  const { data, isLoading } = useSupportTickets(listQueryParams)
  const updateMutation = useUpdateSupportTicket()
  const escalateMutation = useEscalateSupportTicket()
  const deleteMutation = useDeleteSupportTicket()
  const agentsQuery = useSupportAgents()
  useLiveSupportUpdates()
  const tableColumnPreferencesQuery = useTableColumnPreferences(TICKET_MANAGEMENT_MODULE_KEY)
  const activeMetricIds = useActiveMetricIds(TICKET_MANAGEMENT_MODULE_KEY, [
    ...DEFAULT_TICKET_MANAGEMENT_METRIC_IDS,
  ])

  const filteredActiveMetricIds = useMemo(
    () =>
      sortIdsByCatalogOrder(
        [
          ...new Set(activeMetricIds.map((id) => TICKET_MANAGEMENT_LEGACY_METRIC_ID_MAP[id] ?? id)),
        ].filter((id) => TICKET_MANAGEMENT_METRIC_ID_SET.has(id)),
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

  const handleApplyFilters = useCallback(
    (values: FilterValues) => {
      toast.success('Filters applied')
      setAppliedFilters(values)
      setCurrentPage(1)
    },
    [setCurrentPage],
  )

  const handleExportTickets = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      const result = await fetchSupportTickets({
        ...params,
        tab: activeTab,
        includeClosed: true,
      })
      return {
        data: result.data?.tickets ?? [],
        meta: result.data?.meta,
        pagination: result.data?.pagination,
      }
    }
    return createSupportTicketsFilteredExportHandler(
      fetchForExport,
      pickExportColumns(exportKeysForTab(activeTab)),
      'support_tickets_export',
      { search: searchQuery || undefined, tab: activeTab, includeClosed: true },
    )
  }, [activeTab, searchQuery])

  const {
    onAdvancedFilter,
    onExport,
    isExporting,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'support-tickets',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportTickets,
  })

  const handleExportMetrics = useCallback(async () => {
    if (isExportingMetrics) return
    setIsExportingMetrics(true)
    try {
      if (!stats.length) {
        toast.error('No metrics found to export')
        return
      }

      const headers = ['Metric', 'Value', 'Change vs Last Month']
      const rows = stats.map((stat) => [
        stat.title,
        stat.value,
        `${stat.direction === 'up' ? '+' : ''}${stat.percentage}%`,
      ])
      const date = new Date().toISOString().slice(0, 10)
      await exportDataToFile(headers, rows, 'excel', `ticket_management_metrics_${date}`)
      toast.success('Ticket metrics exported to Excel')
    } catch {
      toast.error('Failed to export ticket metrics')
    } finally {
      setIsExportingMetrics(false)
    }
  }, [isExportingMetrics, stats])

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
    }

    const dataColumnsById: Record<string, ColumnDef<SupportTicket>> = {
      'ticket-id': {
        id: 'ticket-id',
        accessorKey: 'id',
        header: 'Ticket ID',
        cell: ({ row }) => <span className="ui-table-id text-brand-text">#{row.original.id}</span>,
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
      reporter: {
        id: 'reporter',
        accessorKey: 'reporter',
        header: 'Reporter',
        cell: ({ row }) => dashIfEmpty(row.original.reporter),
      },
      'sla-timer': {
        id: 'sla-timer',
        accessorKey: 'slaTimer',
        header: 'SLA Timer',
        cell: ({ row }) => (
          <SlaTimerCell
            slaTimer={row.original.slaTimer}
            slaDueAt={row.original.slaDueAt || row.original.resolutionDueAt}
            status={row.original.status}
          />
        ),
        meta: nowrap,
      },
      'first-response-due': {
        id: 'first-response-due',
        accessorKey: 'firstResponseDueAt',
        header: 'First Response Due',
        cell: ({ row }) => dateCell(row.original.firstResponseDueAt),
        meta: nowrap,
      },
      'resolution-due': {
        id: 'resolution-due',
        accessorKey: 'resolutionDueAt',
        header: 'Resolution Due',
        cell: ({ row }) => dateCell(row.original.resolutionDueAt || row.original.slaDueAt),
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
      'escalated-by': {
        id: 'escalated-by',
        accessorKey: 'escalatedBy',
        header: 'Escalated By',
        cell: ({ row }) => dashIfEmpty(row.original.escalatedBy),
      },
      'escalated-to': {
        id: 'escalated-to',
        accessorKey: 'escalatedTo',
        header: 'Escalated To',
        cell: ({ row }) => dashIfEmpty(row.original.escalatedTo),
      },
      'escalated-at': {
        id: 'escalated-at',
        accessorKey: 'escalatedAt',
        header: 'Escalated At',
        cell: ({ row }) => dateCell(row.original.escalatedAt),
        meta: nowrap,
      },
      'escalation-status': {
        id: 'escalation-status',
        accessorKey: 'escalationStatus',
        header: 'Escalation Status',
        cell: ({ row }) => <EscalationStatusBadge status={row.original.escalationStatus} />,
      },
      'escalated-for': {
        id: 'escalated-for',
        accessorKey: 'escalatedFor',
        header: 'Escalated For',
        cell: ({ row }) => dashIfEmpty(row.original.escalatedFor),
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

    const tabAllowedIds =
      activeTab === 'my_tickets'
        ? MY_TAB_COLUMN_ID_SET
        : activeTab === 'escalated'
          ? ESCALATED_TAB_COLUMN_ID_SET
          : ALL_TAB_COLUMN_ID_SET

    const catalogIds = TICKET_MANAGEMENT_TABLE_COLUMNS_CATALOG.map((column) => column.id)
    const rawVisibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_TICKET_MANAGEMENT_VISIBLE_COLUMN_IDS

    const preferenceIds = sortIdsByCatalogOrder(
      [
        ...new Set(rawVisibleIds.map((id) => TICKET_MANAGEMENT_LEGACY_COLUMN_ID_MAP[id] ?? id)),
      ].filter((id) => catalogIds.includes(id) && tabAllowedIds.has(id)),
      catalogIds,
    )
    const fallbackIds = sortIdsByCatalogOrder(
      DEFAULT_TICKET_MANAGEMENT_VISIBLE_COLUMN_IDS.filter((id) => tabAllowedIds.has(id)),
      catalogIds,
    )
    const preferenceColumns = (preferenceIds.length > 0 ? preferenceIds : fallbackIds)
      .map((id) => dataColumnsById[id])
      .filter(Boolean)

    const actionsColumn: ColumnDef<SupportTicket> = {
      id: 'actions',
      header: 'Actions',
      meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
      cell: ({ row }) => renderActions(row.original),
    }

    return [selectColumn, ...preferenceColumns, actionsColumn]
  }, [
    activeTab,
    renderActions,
    selectedIds,
    tableColumnPreferencesQuery.data,
    tickets.length,
    toggleSelect,
    toggleSelectAll,
  ])

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
            onClick={() => void handleExportMetrics()}
            disabled={isExportingMetrics}
            className="ui-export-data ui-cta ui-cta-primary"
          >
            <Upload className="icon-sm shrink-0" aria-hidden="true" />
            {isExportingMetrics ? 'Exporting...' : 'Export Data'}
          </Button>
          <button
            type="button"
            onClick={() => navigate('/metrics/ticket-management?section=table')}
            className="ui-manage-metrics ui-cta ui-cta-primary"
          >
            <SlidersHorizontal className="icon-sm shrink-0" aria-hidden="true" />
            Manage Metrics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <TicketMetricCard
            key={stat.id}
            {...stat}
            value={isLoading ? '—' : stat.value}
            percentage={isLoading ? 0 : stat.percentage}
          />
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
        onAdvancedFilter={onAdvancedFilter}
        advancedFilterVariant="primary"
        onExport={onExport}
        isExporting={isExporting}
        isLoading={isLoading}
        pagination={{
          page: currentPage,
          pageSize,
          totalItems,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="tickets"
        emptyMessage={
          activeTab === 'my_tickets'
            ? 'No tickets assigned to you. Open the All Tickets tab to see the full queue.'
            : activeTab === 'escalated'
              ? 'No escalated tickets.'
              : 'No tickets found.'
        }
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
      {exportFilterModals}
    </div>
  )
}
