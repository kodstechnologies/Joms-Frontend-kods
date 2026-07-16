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
  selectedRingClassName = 'ring-2 ring-amber-400/50',
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
        'inline-flex h-11 shrink-0 items-center gap-2.5 rounded-lg border px-4 transition-all hover:brightness-110',
        background,
        border,
        selected && selectedRingClassName,
      )}
    >
      <Icon className="size-4 shrink-0 text-white" strokeWidth={1.75} aria-hidden="true" />
      <span className="text-sm font-medium whitespace-nowrap text-white">{title}</span>
      <span className="text-base font-bold text-white tabular-nums">
        {String(value).padStart(2, '0')}
      </span>
    </button>
  )
}
