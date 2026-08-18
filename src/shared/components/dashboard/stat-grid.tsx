import type { StatCardProps } from '@/shared/components/dashboard/stat-card'
import { StatCard } from '@/shared/components/dashboard/stat-card'
import { ResponsiveGrid } from '@/shared/components/responsive/responsive-grid'

export function StatGrid({ stats }: { stats: Array<StatCardProps & { id?: string }> }) {
  return (
    <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={4} gap={4}>
      {stats.map((stat) => (
        <StatCard key={stat.id ?? stat.title} {...stat} />
      ))}
    </ResponsiveGrid>
  )
}
