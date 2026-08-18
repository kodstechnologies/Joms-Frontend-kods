import type { TicketPriority, TicketStatus } from '../types/support'
import { cn } from '@/shared/lib/cn'

export const getStatusLabel = (status: TicketStatus) => {
  const map: Record<TicketStatus, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    on_hold: 'On Hold',
    resolved: 'Resolved',
    closed: 'Closed',
  }
  return map[status] ?? status
}

export const getPriorityLabel = (priority: TicketPriority) => {
  const map: Record<TicketPriority, string> = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  }
  return map[priority] ?? priority
}

export const getStatusClassName = (status: TicketStatus) =>
  cn(
    'text-body-sm-semibold inline-flex h-[25px] items-center rounded-full border px-2.5',
    status === 'open' && 'border-brand-positive/40 bg-brand-positive/10 text-brand-positive',
    status === 'in_progress' && 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent',
    status === 'on_hold' && 'border-brand-danger/40 bg-brand-danger/10 text-brand-danger',
    status === 'resolved' && 'border-brand-positive/40 bg-brand-positive/10 text-brand-positive',
    status === 'closed' && 'border-white/20 bg-white/5 text-muted',
  )

export const STATUS_CYCLE: TicketStatus[] = ['open', 'in_progress', 'on_hold', 'resolved', 'closed']

export const PRIORITY_CYCLE: TicketPriority[] = ['critical', 'high', 'medium', 'low']

export const SUPPORT_MODULE_OPTIONS = [
  'Service Marketplace',
  'Milestones',
  "FAQ's",
  'Events',
  'Services',
  'Venues',
  'Membership',
  'Experts',
  'User Accounts',
  'Others',
] as const

export const SUPPORT_ISSUE_TYPE_OPTIONS = [
  'Payment Failed',
  'Approval Pending',
  'Refund Issue',
  'Verification',
  'Authentication',
  'Account Access',
  'Booking Failed',
  'Service Dispute',
  'Membership Issue',
  'Other',
] as const

export const SUPPORT_ESCALATION_PATHWAY_OPTIONS = [
  'None',
  'Team Lead',
  'Super Admin',
  'Legal',
  'Finance',
  'Technical Support',
] as const

export type SelectOption = { value: string; label: string }

export function toSelectOptions(
  values: readonly string[],
  current?: string | null,
): SelectOption[] {
  const options = values.map((value) => ({ value, label: value }))
  const extra = String(current || '').trim()
  if (extra && extra !== '—' && !values.some((value) => value === extra)) {
    return [{ value: extra, label: extra }, ...options]
  }
  return options
}

export const PRIORITY_SELECT_OPTIONS: SelectOption[] = PRIORITY_CYCLE.map((value) => ({
  value,
  label: getPriorityLabel(value),
}))

export const nextStatus = (status: TicketStatus): TicketStatus => {
  const idx = STATUS_CYCLE.indexOf(status)
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
}

export const nextPriority = (priority: TicketPriority): TicketPriority => {
  const idx = PRIORITY_CYCLE.indexOf(priority)
  return PRIORITY_CYCLE[(idx + 1) % PRIORITY_CYCLE.length]
}

export function getApiErrorMessage(err: unknown, fallback: string) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback
  )
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export const getPriorityClassName = (priority: TicketPriority) =>
  cn(
    'text-body-sm-semibold inline-flex h-[25px] items-center rounded-full border px-2.5 capitalize',
    priority === 'critical' && 'border-brand-danger/40 bg-brand-danger/10 text-brand-danger',
    priority === 'high' && 'border-brand-orange/40 bg-brand-orange/10 text-brand-orange',
    priority === 'medium' && 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent',
    priority === 'low' && 'border-brand-positive/40 bg-brand-positive/10 text-brand-positive',
  )

export const isTerminalTicketStatus = (status?: TicketStatus | string | null) =>
  status === 'resolved' || status === 'closed'

export function formatSlaDuration(ms: number) {
  if (!Number.isFinite(ms) || ms < 0) return '—'

  const totalMinutes = Math.round(ms / 60000)
  if (totalMinutes < 1) return '<1m'

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours <= 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${String(minutes).padStart(2, '0')}m`
}

export function formatSlaCountdown(remainingMs: number) {
  if (!Number.isFinite(remainingMs)) return '—'
  if (remainingMs >= 0) return formatSlaDuration(remainingMs)
  return `Overdue ${formatSlaDuration(Math.abs(remainingMs))}`
}

export const getReporterTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    user: 'User',
    expert: 'Expert',
    event_host: 'Event Host',
    venue_partner: 'Venue Partner',
  }
  return map[type] ?? type
}
