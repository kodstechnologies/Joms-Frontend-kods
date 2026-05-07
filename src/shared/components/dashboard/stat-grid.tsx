import type { StatCardProps } from '@/shared/components/dashboard/stat-card'
import { StatCard } from '@/shared/components/dashboard/stat-card'
import { ResponsiveGrid } from '@/shared/components/responsive/responsive-grid'

export function StatGrid({ stats }: { stats: StatCardProps[] }) {
  return (
    <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={4} gap={4}>
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </ResponsiveGrid>
  )
}
