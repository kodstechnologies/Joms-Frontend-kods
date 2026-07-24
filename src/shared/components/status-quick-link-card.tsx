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
  return <div className={cn('ui-status-card-row', className)}>{children}</div>
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
  size = 'default',
  className,
}: {
  title: string
  value: string | number
  icon: LucideIcon
  background: string
  border: string
  onClick?: () => void
  selected?: boolean
  selectedRingClassName?: string
  size?: 'default' | 'listing'
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'ui-status-card shrink-0',
        size === 'listing' && 'ui-status-card-listing',
        background,
        border,
        selected && selectedRingClassName,
        className,
      )}
    >
      <Icon className="icon-sm text-brand-text shrink-0" strokeWidth={1.5} aria-hidden="true" />
      <span className="ui-status-card-title">{title}</span>
      <span className="ui-status-card-value">{String(value).padStart(2, '0')}</span>
    </button>
  )
}
