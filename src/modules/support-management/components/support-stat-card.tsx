import { TrendingDown, TrendingUp } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

type SupportStatCardProps = {
  title: string
  value: string
  percentage?: number
  direction?: 'up' | 'down'
  label?: string
  isLoading?: boolean
}

export function SupportStatCard({
  title,
  value,
  percentage = 0,
  direction = 'up',
  label = 'vs last month',
  isLoading = false,
}: SupportStatCardProps) {
  if (isLoading) {
    return (
      <div className="radius-lg bg-brand-surface flex min-h-[130px] animate-pulse flex-col justify-center border border-white/[0.06] p-5">
        <div className="h-3.5 w-28 rounded bg-white/10" />
        <div className="mt-3 h-8 w-24 rounded bg-white/10" />
        <div className="mt-3 flex items-center gap-2">
          <div className="h-4 w-12 rounded-md bg-white/10" />
          <div className="h-3 w-16 rounded bg-white/5" />
        </div>
      </div>
    )
  }

  const isUp = direction === 'up'

  return (
    <div className="radius-lg bg-brand-surface flex min-h-[130px] flex-col justify-center border border-white/[0.06] p-5">
      <p className="text-body-sm-medium text-muted">{title}</p>
      <p className="text-h2 text-brand-text mt-2 tracking-tight">{value}</p>
      <div className="mt-3 flex items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold',
            isUp
              ? 'bg-brand-positive/20 text-brand-positive'
              : 'bg-brand-danger/20 text-brand-danger',
          )}
        >
          {isUp ? (
            <TrendingUp className="size-3" strokeWidth={2.5} />
          ) : (
            <TrendingDown className="size-3" strokeWidth={2.5} />
          )}
          {percentage}%
        </span>
        <span className="text-muted text-[10px]">{label}</span>
      </div>
    </div>
  )
}
