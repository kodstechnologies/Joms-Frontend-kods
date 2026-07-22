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
    'text-body-sm-semibold rounded-full border px-2.5 py-0.5',
    status === 'open' && 'border-brand-positive/30 bg-brand-positive/10 text-brand-positive',
    status === 'in_progress' && 'border-brand-accent/30 bg-brand-accent/10 text-brand-accent',
    status === 'on_hold' && 'border-brand-danger/30 bg-brand-danger/10 text-brand-danger',
    status === 'closed' && 'border-brand-muted/30 bg-brand-muted/10 text-muted',
  )

export const getPriorityClassName = (priority: TicketPriority) =>
  cn(
    'text-body-sm-semibold rounded-full border px-2.5 py-0.5 capitalize',
    priority === 'critical' && 'border-brand-danger/30 bg-brand-danger/10 text-brand-danger',
    priority === 'high' && 'border-brand-accent/30 bg-brand-accent/10 text-brand-accent',
    priority === 'medium' && 'border-brand-accent/30 bg-brand-accent/10 text-brand-accent',
    priority === 'low' && 'border-brand-positive/30 bg-brand-positive/10 text-brand-positive',
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
