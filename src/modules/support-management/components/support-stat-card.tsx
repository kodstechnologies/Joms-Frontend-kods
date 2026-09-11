import { cn } from '@/shared/lib/cn'
import { formatTrendPercent, TrendBadge } from '@/shared/components/dashboard/trend-badge'

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
      <div className="flex min-h-[118px] animate-pulse flex-col justify-center rounded-xl border border-white/[0.08] bg-[#111112] p-4">
        <div className="h-3.5 w-28 rounded bg-white/10" />
        <div className="mt-3 h-8 w-24 rounded bg-white/10" />
        <div className="mt-3 flex items-center gap-2">
          <div className="h-[33px] w-[69px] rounded-[10px] bg-white/10" />
          <div className="h-3 w-16 rounded bg-white/5" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[118px] flex-col justify-center rounded-xl border border-white/[0.08] bg-[#111112] p-4">
      <p className="text-body-xs text-muted">{title}</p>
      <p className="text-brand-text mt-2 text-[28px] leading-[34px] font-semibold tracking-tight">
        {value}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <TrendBadge direction={direction}>{formatTrendPercent(percentage, direction)}</TrendBadge>
        <span className={cn('text-muted text-[10px]')}>{label}</span>
      </div>
    </div>
  )
}
