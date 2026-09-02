import { Filter, RotateCw, Search } from 'lucide-react'

import type { QueueTicket } from '../types/support'
import {
  getReporterTypeLabel,
  getStatusLabel,
  isTerminalTicketStatus,
} from '../utils/support-format'
import { QueueCalendarIcon, QueueReporterIcon, QueueSubjectIcon } from './queue-card-icons'
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
  hasActiveFilters?: boolean
  isRefreshing?: boolean
  totalCount?: number
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
  hasActiveFilters = false,
  isRefreshing = false,
  totalCount,
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
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#111112]">
      <div className="flex h-12 items-center justify-between border-b border-white/[0.06] px-4">
        <div className="min-w-0">
          <span className="text-muted text-[14px] leading-[14px] font-semibold tracking-widest uppercase">
            Queue
          </span>
          {typeof totalCount === 'number' ? (
            <p className="text-muted mt-0.5 text-[10px]">
              Showing {tickets.length} of {totalCount}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleFilters}
            className={cn(
              'flex h-[35px] w-[43px] items-center justify-center rounded-lg transition-colors',
              showFilters || hasActiveFilters
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white',
            )}
            aria-label="Toggle filters"
          >
            <Filter className="size-4" />
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex h-[35px] w-[43px] items-center justify-center rounded-lg bg-white/[0.04] text-white/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Refresh queue"
          >
            <RotateCw className={cn('size-3.5', isRefreshing && 'animate-spin')} />
          </button>
        </div>
      </div>

      {showFilters ? filterPanel : null}

      <div className="border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-[37px] items-center gap-2 rounded-lg border border-white/[0.08] bg-[#18181A] px-3">
          <Search className="size-4 shrink-0 text-white/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Name, ID or profession"
            className="text-brand-text placeholder:text-muted h-full flex-1 bg-transparent text-[12px] leading-[18px] outline-none"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={`queue-skel-${idx}`}
              className="min-h-[138px] w-full animate-pulse space-y-2.5 rounded-xl border border-white/[0.05] bg-[#18181A] p-4"
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
          <p className="text-body-sm text-muted py-8 text-center">No tickets in queue</p>
        ) : (
          filtered.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              onClick={() => onSelect(ticket.id)}
              className={cn(
                'mx-auto min-h-[138px] w-full max-w-[310px] rounded-xl border p-4 text-left transition-colors',
                selectedId === ticket.id
                  ? 'border-brand-accent/40 ring-brand-accent/30 bg-[#18181A] ring-1'
                  : 'border-white/[0.05] bg-[#18181A] hover:border-white/[0.10]',
                isTerminalTicketStatus(ticket.status) && selectedId !== ticket.id && 'opacity-80',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-body-sm text-muted inline-flex h-5 items-center rounded bg-white/[0.08] px-1.5 font-semibold">
                  #{ticket.id}
                </span>
                <span className="text-body-xs text-muted flex items-center gap-1">
                  <QueueCalendarIcon />
                  {ticket.createdAt}
                </span>
              </div>
              <p className="text-body-sm text-brand-text mt-2 flex items-center gap-1.5 font-medium">
                <QueueSubjectIcon />
                <span className="min-w-0 truncate">{ticket.subject}</span>
              </p>
              <p className="text-body-xs text-muted mt-1 flex items-center gap-1.5">
                <QueueReporterIcon />
                <span className="min-w-0 truncate">
                  {ticket.reporter} • {getReporterTypeLabel(ticket.reporterType)}
                </span>
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  <TicketPriorityBadge priority={ticket.priority} />
                  {!isTerminalTicketStatus(ticket.status) ? (
                    <TicketStatusBadge status={ticket.status} variant="workspace" />
                  ) : null}
                </div>
                {isTerminalTicketStatus(ticket.status) ? (
                  <span className="text-body-xs text-muted shrink-0 font-medium">
                    Status:{' '}
                    <span className="text-brand-positive">{getStatusLabel(ticket.status)}</span>
                  </span>
                ) : null}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
