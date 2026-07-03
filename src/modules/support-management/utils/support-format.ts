import type { TicketPriority, TicketStatus } from '../types/support'
import { cn } from '@/shared/lib/cn'

export const getStatusLabel = (status: TicketStatus) => {
  const map: Record<TicketStatus, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    on_hold: 'On Hold',
    closed: 'Closed',
  }
  return map[status]
}

export const getStatusClassName = (status: TicketStatus) =>
  cn(
    'rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
    status === 'open' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    status === 'in_progress' && 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    status === 'on_hold' && 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    status === 'closed' && 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  )

export const getPriorityClassName = (priority: TicketPriority) =>
  cn(
    'rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize',
    priority === 'critical' && 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    priority === 'high' && 'border-orange-500/30 bg-orange-500/10 text-orange-300',
    priority === 'medium' && 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    priority === 'low' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  )

export const getReporterTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    user: 'User',
    expert: 'Expert',
    event_host: 'Event Host',
    venue_partner: 'Venue Partner',
  }
  return map[type] ?? type
}
