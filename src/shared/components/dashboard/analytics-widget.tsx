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
            className="radius-md bg-brand-surface-2 hover:border-brand-accent-muted border border-white/10 px-4 py-4 transition-colors"
          >
            <p className="text-body-sm-semibold text-muted tracking-wide">{metric.label}</p>
            <p className="text-body-md-semibold text-brand-text mt-1">{metric.value}</p>
          </div>
        ))}
      </ResponsiveGrid>
    </DashboardCard>
  )
}
