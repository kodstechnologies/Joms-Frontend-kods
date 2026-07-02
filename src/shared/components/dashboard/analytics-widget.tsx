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
            className="rounded-brand-md border border-white/10 bg-brand-surface-2 px-4 py-4 transition-colors hover:border-brand-accent-muted"
          >
            <p className="text-[11px] font-semibold tracking-wide text-brand-muted">{metric.label}</p>
            <p className="mt-1 text-sm font-semibold text-brand-text">{metric.value}</p>
          </div>
        ))}
      </ResponsiveGrid>
    </DashboardCard>
  )
}
