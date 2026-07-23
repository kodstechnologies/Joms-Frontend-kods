import type { PropsWithChildren } from 'react'

import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/button'

type SectionHeaderProps = PropsWithChildren<{
  title: string
  subtitle?: string
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'default' | 'secondary' | 'ghost'
  }>
  className?: string
}>

export function SectionHeader({
  title,
  subtitle,
  actions,
  className,
  children,
}: SectionHeaderProps) {
  return (
    <div
      className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}
    >
      <div className="space-y-1">
        <h1 className="text-h1 text-brand-text">{title}</h1>
        {subtitle ? <p className="text-body-md text-muted">{subtitle}</p> : null}
        {children}
      </div>

      {actions?.length ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {actions.map((action) => {
            const isExportData = action.label === 'Export Data'
            const isManageMetrics = action.label === 'Manage Metrics'

            return (
              <Button
                key={action.label}
                variant={isExportData ? 'primary' : (action.variant ?? 'secondary')}
                onClick={action.onClick}
                className={
                  isManageMetrics
                    ? 'ui-manage-metrics'
                    : isExportData
                      ? 'ui-export-data'
                      : undefined
                }
              >
                {action.label}
              </Button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
