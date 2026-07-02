import { RefreshCw } from 'lucide-react'
import type { PropsWithChildren } from 'react'

import { DashboardCard } from '@/shared/components/dashboard/dashboard-card'
import { cn } from '@/shared/lib/cn'

type ChartCardProps = PropsWithChildren<{
  title: string
  description?: string
  isLoading?: boolean
  isEmpty?: boolean
  emptyLabel?: string
  className?: string
}>

export function ChartCard({
  title,
  description,
  isLoading,
  isEmpty,
  emptyLabel = 'No data available',
  className,
  children,
}: ChartCardProps) {
  const containerBorder = 'border-white/10'

  return (
    <DashboardCard
      className={cn('min-h-[280px] p-0 sm:min-h-[320px]', className)}
      title={title}
      rightSlot={
        <div className="grid size-8 place-items-center rounded-full border border-white/10 bg-brand-surface-2">
          <RefreshCw className="size-4 text-brand-stroke" />
        </div>
      }
    >
      <div className="overflow-hidden px-4 pb-5 sm:px-5 sm:pb-6">
        {description ? <p className="mb-4 text-xs leading-relaxed text-brand-muted">{description}</p> : null}

        {isLoading ? (
          <div className={cn('grid h-[240px] place-items-center rounded-brand-md bg-white/5', containerBorder)}>
            <p className="text-xs text-brand-muted">Loading chart...</p>
          </div>
        ) : isEmpty ? (
          <div className={cn('grid h-[240px] place-items-center rounded-brand-md bg-white/5', containerBorder)}>
            <p className="text-xs text-brand-muted">{emptyLabel}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </DashboardCard>
  )
}
