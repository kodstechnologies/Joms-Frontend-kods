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
    <DashboardCard title={title} className="p-5 sm:p-6">
      <ResponsiveGrid mobileCols={2} tabletCols={3} desktopCols={6} gap={4}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={`engagement-skel-${index}`} className="flex flex-col gap-2">
                <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
                <div className="h-6 w-16 animate-pulse rounded bg-white/10" />
              </div>
            ))
          : metrics.map((metric) => (
              <div key={metric.label} className="flex flex-col">
                <p className="text-xs leading-4 font-normal text-white/50">{metric.label}</p>
                <p className="mt-1.5 text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {metric.value}
                </p>
              </div>
            ))}
      </ResponsiveGrid>
    </DashboardCard>
  )
}
