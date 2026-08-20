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
  return (
    <DashboardCard
      className={cn('min-h-[280px] p-0 sm:min-h-[320px]', className)}
      title={title}
      rightSlot={
        <div className="bg-brand-surface-2 grid size-8 place-items-center rounded-full border border-white/10">
          <RefreshCw className="icon-sm text-brand-stroke" />
        </div>
      }
    >
      <div className="overflow-hidden px-4 pb-5 sm:px-5 sm:pb-6">
        {description ? (
          <p className="text-body-sm text-muted mb-4 leading-relaxed">{description}</p>
        ) : null}

        {isLoading ? (
          <div className="grid h-[240px] gap-3 rounded-md border border-white/10 bg-white/5 p-4">
            <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />
            <div className="h-full animate-pulse rounded bg-white/10" />
          </div>
        ) : isEmpty ? (
          <div className="radius-md grid h-[240px] place-items-center border border-white/10 bg-white/5">
            <p className="text-body-sm text-muted">{emptyLabel}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </DashboardCard>
  )
}
