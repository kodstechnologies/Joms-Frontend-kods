import { TrendingUp } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

export type MetricTrend = {
  percent: number
  vsLastMonth?: string
}

export function AnalyticsCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-lg border border-white/5 bg-[#111111] p-5', className)}>
      {children}
    </section>
  )
}

export function TrendBadge({ percent }: { percent: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
      <TrendingUp className="size-2.5" />
      {percent}%
    </span>
  )
}

export function MetricCard({
  label,
  value,
  trend,
  className,
}: {
  label: string
  value: string
  trend?: MetricTrend
  className?: string
}) {
  return (
    <AnalyticsCard className={cn('flex flex-col justify-between', className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] text-[#999]">{label}</p>
        {trend ? <TrendBadge percent={trend.percent} /> : null}
      </div>
      <p className="mt-3 text-xl font-bold text-white">{value}</p>
      {trend?.vsLastMonth ? (
        <p className="mt-2 text-right text-[10px] text-emerald-400">{trend.vsLastMonth}</p>
      ) : null}
    </AnalyticsCard>
  )
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-[13px] font-bold text-white">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-[11px] text-[#777]">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function PeriodSelect({
  value,
  options = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days'],
  onChange,
}: {
  value: string
  options?: string[]
  onChange?: (value: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="select-on-accent bg-brand-accent text-brand-text-dark h-8 rounded-lg border border-white/10 px-3 pr-8 text-[11px] font-semibold outline-none"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )
}

export function SubTabPills({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: string; label: string }[]
  active: string
  onChange: (key: string) => void
}) {
  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            'rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors',
            active === tab.key
              ? 'bg-brand-accent text-brand-text-dark'
              : 'border border-white/10 text-white hover:bg-white/5',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: 'bg-emerald-500/15 text-emerald-400',
    Inactive: 'bg-white/5 text-[#999]',
    confirmed: 'bg-blue-500/15 text-blue-400',
    completed: 'bg-emerald-500/15 text-emerald-400',
    ongoing: 'bg-orange-500/15 text-orange-400',
    cancelled: 'bg-red-500/15 text-red-400',
  }

  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize',
        styles[status] ?? 'bg-white/5 text-[#999]',
      )}
    >
      {status}
    </span>
  )
}
