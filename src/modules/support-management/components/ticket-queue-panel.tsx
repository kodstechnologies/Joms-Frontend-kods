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
  showFilters: boolean
  filterPanel?: React.ReactNode
}

export function TicketQueuePanel({
  tickets,
  selectedId,
  searchQuery,
  onSearchChange,
  onSelect,
  onToggleFilters,
  showFilters,
  filterPanel,
}: TicketQueuePanelProps) {
  const filtered = tickets.filter(
    (t) =>
      !searchQuery ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.reporter.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="radius-lg bg-brand-surface flex h-full flex-col border border-white/10">
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
          <button type="button" className="text-muted hover:text-brand-text rounded-lg p-1.5">
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

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {filtered.map((ticket) => (
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
        ))}
      </div>
    </div>
  )
}
