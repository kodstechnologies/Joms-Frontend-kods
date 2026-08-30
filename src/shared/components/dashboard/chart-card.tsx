import { RefreshCw } from 'lucide-react'
import type { PropsWithChildren } from 'react'

import { DashboardCard } from '@/shared/components/dashboard/dashboard-card'
import { cn } from '@/shared/lib/cn'

type ChartCardProps = PropsWithChildren<{
  title: string
  description?: string
  isLoading?: boolean
  refreshing?: boolean
  onRefresh?: () => void
  isEmpty?: boolean
  emptyLabel?: string
  className?: string
}>

export function ChartCard({
  title,
  description,
  isLoading,
  refreshing,
  onRefresh,
  isEmpty,
  emptyLabel = 'No data available',
  className,
  children,
}: ChartCardProps) {
  const isSpinning = Boolean(refreshing || isLoading)

  return (
    <DashboardCard
      className={cn('min-h-[280px] p-5 sm:min-h-[320px] sm:p-6', className)}
      title={title}
      rightSlot={
        <button
          type="button"
          aria-label={`Refresh ${title}`}
          onClick={onRefresh}
          disabled={isSpinning || !onRefresh}
          className={cn(
            'flex items-center justify-center p-1 text-white/50 transition-colors',
            onRefresh
              ? 'cursor-pointer hover:text-white active:scale-95'
              : 'cursor-default opacity-40',
            isSpinning && 'opacity-70',
          )}
        >
          <RefreshCw className={cn('size-4 transition-transform', isSpinning && 'animate-spin')} />
        </button>
      }
    >
      <div className="w-full">
        {description ? (
          <p className="text-body-sm mb-3 leading-relaxed text-white/50">{description}</p>
        ) : null}

        {isLoading ? (
          <div className="grid h-[240px] gap-3 rounded-md bg-white/5 p-4">
            <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />
            <div className="h-full animate-pulse rounded bg-white/10" />
          </div>
        ) : isEmpty ? (
          <div className="grid h-[240px] place-items-center rounded-md bg-white/5">
            <p className="text-body-sm text-white/50">{emptyLabel}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </DashboardCard>
  )
}
