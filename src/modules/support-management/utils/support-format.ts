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
    'text-body-sm-semibold inline-flex h-5 items-center rounded px-2',
    status === 'open' && 'bg-brand-positive/15 text-brand-positive',
    status === 'in_progress' && 'bg-brand-blue/15 text-brand-blue',
    status === 'on_hold' && 'bg-brand-danger/15 text-brand-danger',
    status === 'closed' && 'bg-white/10 text-muted',
  )

export const getPriorityClassName = (priority: TicketPriority) =>
  cn(
    'text-body-sm-semibold inline-flex h-5 items-center rounded px-2 capitalize',
    priority === 'critical' && 'bg-brand-danger/15 text-brand-danger',
    priority === 'high' && 'bg-brand-orange/15 text-brand-orange',
    priority === 'medium' && 'bg-brand-accent/15 text-brand-accent',
    priority === 'low' && 'bg-brand-positive/15 text-brand-positive',
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
