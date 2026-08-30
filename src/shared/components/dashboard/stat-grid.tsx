import type { StatCardProps } from '@/shared/components/dashboard/stat-card'
import { StatCard } from '@/shared/components/dashboard/stat-card'
import { ResponsiveGrid } from '@/shared/components/responsive/responsive-grid'

export function StatGrid({
  stats,
  isLoading = false,
  skeletonCount = 8,
}: {
  stats: Array<StatCardProps & { id?: string }>
  isLoading?: boolean
  skeletonCount?: number
}) {
  return (
    <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={4} gap={4}>
      {isLoading
        ? Array.from({ length: skeletonCount }).map((_, index) => (
            <div
              key={`stat-skel-${index}`}
              className="rounded-brand-lg min-h-[130px] bg-[#141414] p-5"
            >
              <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
              <div className="mt-3 h-8 w-20 animate-pulse rounded bg-white/10" />
              <div className="mt-4 h-5 w-24 animate-pulse rounded bg-white/5" />
            </div>
          ))
        : stats.map((stat) => <StatCard key={stat.id ?? stat.title} {...stat} />)}
    </ResponsiveGrid>
  )
}
