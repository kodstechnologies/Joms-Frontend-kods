import { DashboardCard } from '@/shared/components/dashboard/dashboard-card'
import { ResponsiveGrid } from '@/shared/components/responsive/responsive-grid'

export type AnalyticsMetric = {
  label: string
  value: string
}

export function AnalyticsWidget({ title, metrics }: { title: string; metrics: AnalyticsMetric[] }) {
  return (
    <DashboardCard title={title}>
      <ResponsiveGrid mobileCols={2} tabletCols={3} desktopCols={6} gap={3}>
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 transition-colors hover:border-white/15"
          >
            <p className="text-[11px] font-semibold tracking-wide text-slate-400">{metric.label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-100">{metric.value}</p>
          </div>
        ))}
      </ResponsiveGrid>
    </DashboardCard>
  )
}
