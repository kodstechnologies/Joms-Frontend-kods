import type { PropsWithChildren, ReactNode } from 'react'
import { BarChart3, Upload } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/button'

type SectionHeaderProps = PropsWithChildren<{
  title: string
  subtitle?: string
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'default' | 'secondary' | 'ghost'
    icon?: ReactNode
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
            const isExportData = action.label.toLowerCase().includes('export')
            const isManageMetrics = action.label.toLowerCase().includes('manage metrics')

            return (
              <Button
                key={action.label}
                variant={isExportData ? 'primary' : (action.variant ?? 'secondary')}
                onClick={action.onClick}
                className={cn(
                  'inline-flex items-center gap-2',
                  isManageMetrics
                    ? 'ui-manage-metrics'
                    : isExportData
                      ? 'ui-export-data'
                      : undefined,
                )}
              >
                {action.icon ? (
                  action.icon
                ) : isManageMetrics ? (
                  <BarChart3 className="size-4 shrink-0" />
                ) : isExportData ? (
                  <Upload className="size-4 shrink-0" />
                ) : null}
                {action.label}
              </Button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
