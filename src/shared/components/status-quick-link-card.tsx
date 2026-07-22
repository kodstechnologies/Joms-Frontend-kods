import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

export function StatusQuickLinkRow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('flex gap-3 overflow-x-auto pb-1', className)}>{children}</div>
}

export function StatusQuickLinkCard({
  title,
  value,
  icon: Icon,
  background,
  border,
  onClick,
  selected = false,
  selectedRingClassName = 'ring-2 ring-brand-accent/50',
}: {
  title: string
  value: string | number
  icon: LucideIcon
  background: string
  border: string
  onClick?: () => void
  selected?: boolean
  selectedRingClassName?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'radius-md inline-flex h-[42px] shrink-0 items-center gap-2.5 border px-4 transition-all hover:brightness-110',
        background,
        border,
        selected && selectedRingClassName,
      )}
    >
      <Icon className="icon-md text-brand-text shrink-0" strokeWidth={1.5} aria-hidden="true" />
      <span className="text-body-md-medium text-brand-text whitespace-nowrap">{title}</span>
      <span className="text-body-md-semibold text-brand-text tabular-nums">
        {String(value).padStart(2, '0')}
      </span>
    </button>
  )
}
