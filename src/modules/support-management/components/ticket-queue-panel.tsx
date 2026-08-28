import { Filter, RefreshCw, Search } from 'lucide-react'
import calendarIcon from '@/assets/JOMS_ICONS-2/icons8-calendar.svg'

import type { QueueTicket } from '../types/support'
import { getReporterTypeLabel } from '../utils/support-format'
import { TicketPriorityBadge } from './ticket-priority-badge'
import { TicketStatusBadge } from './ticket-status-badge'
import { cn } from '@/shared/lib/cn'

type TicketQueuePanelProps = {
  tickets: QueueTicket[]
  selectedId: string
  searchQuery: string
  onSearchChange: (q: string) => void
  onSelect: (id: string) => void
  onToggleFilters: () => void
  onRefresh?: () => void
  disableClientFilter?: boolean
  showFilters: boolean
  filterPanel?: React.ReactNode
  isLoading?: boolean
}

export function TicketQueuePanel({
  tickets,
  selectedId,
  searchQuery,
  onSearchChange,
  onSelect,
  onToggleFilters,
  onRefresh,
  disableClientFilter = false,
  showFilters,
  filterPanel,
  isLoading = false,
}: TicketQueuePanelProps) {
  const filtered = disableClientFilter
    ? tickets
    : tickets.filter(
        (t) =>
          !searchQuery ||
          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.reporter.toLowerCase().includes(searchQuery.toLowerCase()),
      )

  return (
    <div className="radius-lg bg-brand-surface flex h-full min-h-0 flex-col overflow-hidden border border-white/10">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <span className="text-body-sm-semibold text-muted tracking-widest">QUEUE</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleFilters}
            className={cn(
              'rounded-lg p-1.5 transition-colors',
              showFilters ? 'text-brand-accent bg-white/10' : 'text-muted hover:text-brand-text',
            )}
          >
            <Filter className="size-4" />
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="text-muted hover:text-brand-text rounded-lg p-1.5"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      {showFilters ? filterPanel : null}

      <div className="border-b border-white/5 px-4 py-3">
        <div className="radius-md bg-brand-bg flex h-10 items-center gap-2 border border-white/10 px-3">
          <Search className="text-muted size-4 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, ID or profession"
            className="text-brand-text placeholder:text-muted h-full flex-1 bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={`queue-skel-${idx}`}
              className="bg-brand-bg w-full animate-pulse space-y-2.5 rounded-xl border border-white/5 p-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-16 rounded bg-white/10" />
                <div className="h-3 w-20 rounded bg-white/10" />
              </div>
              <div className="h-4 w-3/4 rounded bg-white/10" />
              <div className="h-3 w-1/2 rounded bg-white/5" />
              <div className="flex gap-2 pt-1">
                <div className="h-4 w-12 rounded-full bg-white/10" />
                <div className="h-4 w-14 rounded-full bg-white/10" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <p className="text-muted text-body-sm py-8 text-center">No tickets in queue</p>
        ) : (
          filtered.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              onClick={() => onSelect(ticket.id)}
              className={cn(
                'w-full rounded-xl border p-3 text-left transition-colors',
                selectedId === ticket.id
                  ? 'border-l-brand-accent bg-brand-surface border-l-4 border-white/10'
                  : 'bg-brand-bg border-white/5 hover:border-white/10',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-body-sm-semibold text-brand-accent">#{ticket.id}</span>
                <span className="text-body-sm text-muted flex items-center gap-1">
                  <img src={calendarIcon} alt="calendar" className="size-3" />
                  {ticket.createdAt}
                </span>
              </div>
              <p className="text-body-md-medium text-brand-text mt-2">{ticket.subject}</p>
              <p className="text-body-sm text-muted mt-1">
                {ticket.reporter} • {getReporterTypeLabel(ticket.reporterType)}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <TicketPriorityBadge priority={ticket.priority} />
                <TicketStatusBadge status={ticket.status} />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
