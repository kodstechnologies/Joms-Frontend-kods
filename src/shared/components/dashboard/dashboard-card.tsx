import type { HTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

type DashboardCardProps = HTMLAttributes<HTMLDivElement> & {
  title?: string
  rightSlot?: React.ReactNode
}

export function DashboardCard({
  className,
  title,
  rightSlot,
  children,
  ...props
}: DashboardCardProps) {
  return (
    <section
      className={cn(
        uiTokens.radiusCard,
        'p-4 backdrop-blur sm:p-5',
        'bg-brand-surface border border-white/10',
        'shadow-[0_10px_30px_rgba(0,0,0,0.35)]',
        'transition-[border-color,transform,background-color] duration-200',
        'hover:border-brand-accent-muted hover:bg-white/6',
        className,
      )}
      {...props}
    >
      {title ? (
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-brand-text text-sm font-semibold tracking-tight">{title}</p>
          </div>
          {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}
