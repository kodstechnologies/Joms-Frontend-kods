import type { PropsWithChildren } from 'react'

import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/button'

type SectionHeaderProps = PropsWithChildren<{
  title: string
  subtitle?: string
  actions?: Array<{ label: string; onClick: () => void; variant?: 'default' | 'secondary' | 'ghost' }>
  className?: string
}>

export function SectionHeader({ title, subtitle, actions, className, children }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">{title}</h1>
        {subtitle ? (
          <p className="text-sm leading-relaxed text-slate-300 sm:text-base">{subtitle}</p>
        ) : null}
        {children}
      </div>

      {actions?.length ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {actions.map((action) => (
            <Button key={action.label} variant={action.variant ?? 'secondary'} onClick={action.onClick}>
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
