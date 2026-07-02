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
}

export function StatCard({ title, value, icon: Icon, trend, hint }: StatCardProps) {
  const isUp = trend?.direction === 'up'

  return (
    <DashboardCard className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wide text-brand-muted">{title}</p>
          <p className="text-2xl font-semibold tracking-tight text-brand-text">{value}</p>
        </div>
        {Icon ? (
          <div className="grid size-10 place-items-center rounded-brand-md bg-brand-accent/10 text-brand-accent">
            <Icon className="size-4" />
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        {trend ? (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                isUp
                  ? 'border-brand-success/25 bg-brand-success/10 text-brand-success'
                  : 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger',
              )}
            >
              {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {trend.percentage}%
            </span>
            <span className="text-[11px] text-brand-muted">{trend.label}</span>
          </div>
        ) : (
          <span />
        )}
        {hint ? <span className="text-[11px] text-brand-muted">{hint}</span> : null}
      </div>
    </DashboardCard>
  )
}
