import { Calendar, Filter, RefreshCw, Search } from 'lucide-react'

import type { QueueTicket } from '../types/support'
import { getReporterTypeLabel } from '../utils/support-format'
import { TicketPriorityBadge } from './ticket-priority-badge'
import { TicketStatusBadge } from './ticket-status-badge'
import { Input } from '@/shared/components/ui/input'
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
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#111111]">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <span className="text-xs font-bold tracking-widest text-slate-400">QUEUE</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleFilters}
            className={cn(
              'rounded-lg p-1.5 transition-colors',
              showFilters ? 'bg-white/10 text-amber-400' : 'text-slate-500 hover:text-white',
            )}
          >
            <Filter className="size-4" />
          </button>
          <button type="button" className="rounded-lg p-1.5 text-slate-500 hover:text-white">
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      {showFilters ? filterPanel : null}

      <div className="border-b border-white/5 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, ID or profession"
            className="h-10 border-0 bg-[#1a1a1a] pl-10 text-sm text-white placeholder:text-slate-500"
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
                ? 'border-l-4 border-l-amber-400 border-white/10 bg-[#1a1a1a]'
                : 'border-white/5 bg-[#0d0d0d] hover:border-white/10',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-amber-400">#{ticket.id}</span>
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <Calendar className="size-3" />
                {ticket.createdAt}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-white">{ticket.subject}</p>
            <p className="mt-1 text-xs text-slate-400">
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
