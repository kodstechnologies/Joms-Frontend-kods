import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

import { DASH, titleCase } from './drilldown-format'

export function SectionCard({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={cn('bg-brand-bg rounded-xl border border-white/5 p-5', className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {typeof title === 'string' ? (
            <h3 className="text-body-md font-semibold text-white">{title}</h3>
          ) : (
            title
          )}
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}

export function FieldTile({
  label,
  value,
  hint,
  className,
}: {
  label: string
  value: ReactNode
  hint?: string
  className?: string
}) {
  return (
    <div className={cn('rounded-lg border border-white/5 bg-black p-4', className)}>
      <p className="text-body-sm text-muted">{label}</p>
      <p className="mt-1 text-[13px] font-semibold text-white">{value}</p>
      {hint ? <p className="text-muted mt-1 text-[10px]">{hint}</p> : null}
    </div>
  )
}

export function DetailChip({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="flex min-w-[120px] flex-col items-center gap-2">
      <div className="text-body-sm w-full rounded-lg border border-white px-5 py-3 text-center font-semibold whitespace-nowrap text-white">
        {value}
      </div>
      <span className="text-muted text-[11px]">{label}</span>
    </div>
  )
}

const STATUS_TONES: Record<string, string> = {
  live: 'bg-brand-positive/15 text-brand-positive',
  active: 'bg-brand-positive/15 text-brand-positive',
  approved: 'bg-brand-positive/15 text-brand-positive',
  completed: 'bg-brand-positive/15 text-brand-positive',
  paid: 'bg-brand-positive/15 text-brand-positive',
  in_review: 'bg-brand-accent/15 text-brand-accent',
  pending: 'bg-brand-accent/15 text-brand-accent',
  ongoing: 'bg-brand-accent/15 text-brand-accent',
  in_progress: 'bg-[#F97316]/15 text-[#F97316]',
  'in-progress': 'bg-[#F97316]/15 text-[#F97316]',
  changes_requested: 'bg-[#F97316]/15 text-[#F97316]',
  paused: 'bg-[#F97316]/15 text-[#F97316]',
  preview: 'bg-white/10 text-muted',
  draft: 'bg-white/10 text-muted',
  rejected: 'bg-brand-danger/15 text-red-400',
  suspended: 'bg-brand-danger/15 text-red-300',
  terminated: 'bg-brand-danger/15 text-red-300',
  disputed: 'bg-brand-danger/15 text-red-300',
  deleted: 'bg-brand-danger/15 text-red-300',
  closed: 'bg-white/10 text-muted',
}

export function StatusPill({ status, label }: { status?: string | null; label?: string }) {
  const normalized = String(status || '').toLowerCase()
  return (
    <span
      className={cn(
        'rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase',
        STATUS_TONES[normalized] || 'text-muted bg-white/10',
      )}
    >
      {label || titleCase(status) || DASH}
    </span>
  )
}

/** Status chip sized like the shared management tables (ui-data-table cells). */
export function TableStatusPill({ status, label }: { status?: string | null; label?: string }) {
  const normalized = String(status || '').toLowerCase()
  if (!normalized && !label) return <>{DASH}</>
  return (
    <span
      className={cn(
        'inline-flex h-5 min-w-[50px] items-center justify-center rounded-[10px] px-2.5 text-center text-[10px] leading-[14px] font-semibold tracking-normal whitespace-nowrap',
        STATUS_TONES[normalized] || 'text-muted bg-white/10',
      )}
    >
      {label || titleCase(status) || DASH}
    </span>
  )
}

export function ShimmerBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded bg-white/10', className)} />
}

export function EmptyState({ message, icon }: { message: string; icon?: ReactNode }) {
  return (
    <div className="text-muted flex flex-col items-center justify-center gap-2 py-10 text-center">
      {icon}
      <p className="text-body-sm">{message}</p>
    </div>
  )
}
