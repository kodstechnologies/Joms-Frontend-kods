import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'

import { DashboardCard } from '@/shared/components/dashboard/dashboard-card'
import { cn } from '@/shared/lib/cn'

type StatTrend = {
  direction: 'up' | 'down'
  percentage: number
  label: string
}

export type StatCardProps = {
  title: string
  value: string
  icon?: LucideIcon
  trend?: StatTrend
  hint?: string
  className?: string
}

export function StatCard({ title, value, icon: Icon, trend, hint, className }: StatCardProps) {
  const isUp = trend?.direction === 'up'

  return (
    <DashboardCard className={cn('p-5 sm:p-6', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-body-sm-semibold text-muted tracking-wide">{title}</p>
          <p className="text-h2 text-brand-text mt-1 tracking-tight">{value}</p>
        </div>
        {Icon ? (
          <div
            className="grid size-10 shrink-0 place-items-center border border-white/10 bg-black text-white/50"
            aria-hidden="true"
          >
            <Icon className="size-[18px]" strokeWidth={1.75} />
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex min-h-[28px] items-center">
        {trend ? (
          <span
            className={cn(
              'text-body-sm-semibold inline-flex items-center gap-1 rounded-md px-2 py-1',
              isUp
                ? 'bg-brand-positive/15 text-brand-positive'
                : 'bg-brand-danger/15 text-brand-danger',
            )}
          >
            {isUp ? (
              <TrendingUp className="size-3.5" strokeWidth={2} />
            ) : (
              <TrendingDown className="size-3.5" strokeWidth={2} />
            )}
            {isUp ? '+' : ''}
            {trend.percentage}% {trend.label}
          </span>
        ) : hint ? (
          <span className="text-body-sm text-muted">{hint}</span>
        ) : null}
      </div>
    </DashboardCard>
  )
}
