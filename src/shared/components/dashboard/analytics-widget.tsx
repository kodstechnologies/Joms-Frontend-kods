import { DashboardCard } from '@/shared/components/dashboard/dashboard-card'
import { ResponsiveGrid } from '@/shared/components/responsive/responsive-grid'

export type AnalyticsMetric = {
  label: string
  value: string
}

export function AnalyticsWidget({
  title,
  metrics,
  isLoading = false,
}: {
  title: string
  metrics: AnalyticsMetric[]
  isLoading?: boolean
}) {
  return (
    <DashboardCard title={title}>
      <ResponsiveGrid mobileCols={2} tabletCols={3} desktopCols={6} gap={3}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`engagement-skel-${index}`}
                className="radius-md border border-white/10 bg-white/5 px-4 py-4"
              >
                <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
                <div className="mt-2 h-5 w-16 animate-pulse rounded bg-white/10" />
              </div>
            ))
          : metrics.map((metric) => (
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
