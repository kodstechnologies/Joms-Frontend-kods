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
  const hasFooter = Boolean(trend || hint)

  return (
    <DashboardCard
      className={cn(
        'flex h-full min-h-[130px] flex-col justify-between gap-3 overflow-hidden p-5',
        className,
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-normal tracking-wide text-white/60">{title}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-white">{value}</p>
        </div>
        {Icon ? (
          <div
            className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/5 text-white/50"
            aria-hidden="true"
          >
            <Icon className="size-[18px]" strokeWidth={1.75} />
          </div>
        ) : null}
      </div>

      {hasFooter ? (
        <div className="flex min-w-0 flex-col gap-1.5">
          {trend ? (
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold',
                  isUp
                    ? 'bg-brand-positive/15 text-brand-positive'
                    : 'bg-brand-danger/15 text-brand-danger',
                )}
              >
                {isUp ? (
                  <TrendingUp className="size-3 shrink-0" strokeWidth={2.5} />
                ) : (
                  <TrendingDown className="size-3 shrink-0" strokeWidth={2.5} />
                )}
                {isUp ? '+' : ''}
                {trend.percentage}%
              </span>
              <span className="min-w-0 truncate text-[11px] text-white/50">{trend.label}</span>
            </div>
          ) : null}
          {hint ? (
            <span className="truncate text-[11px] leading-4 text-white/50">{hint}</span>
          ) : null}
        </div>
      ) : (
        <div className="h-4" aria-hidden="true" />
      )}
    </DashboardCard>
  )
}
