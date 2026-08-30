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
        'p-4 sm:p-5',
        'bg-[#141414]',
        'transition-all duration-200',
        className,
      )}
      {...props}
    >
      {title ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-body-md-semibold tracking-tight text-white">{title}</p>
          </div>
          {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}
