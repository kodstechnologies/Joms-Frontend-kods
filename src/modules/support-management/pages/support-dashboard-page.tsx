import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { SupportDashboardCharts } from '../components/support-dashboard-charts'
import { supportDashboardStats } from '../mock/support.mock'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
import { StatCard } from '@/shared/components/dashboard/stat-card'
import { ResponsiveGrid } from '@/shared/components/responsive/responsive-grid'

export function SupportDashboardPage() {
  const navigate = useNavigate()
  const stats = supportDashboardStats.map((s) => ({
    title: s.title,
    value: s.value,
    trend: { direction: 'up' as const, percentage: 6.7, label: 'vs last month' },
  }))

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Support Management"
        subtitle="Decision-centric workspace for high-impact tickets requiring approval, enforcement, or oversight."
        actions={[
          {
            label: 'Export Data',
            onClick: () => toast.message('Export coming soon'),
            variant: 'secondary',
          },
          {
            label: 'Manage Metrics',
            onClick: () => navigate('/metrics/support-dashboard'),
          },
        ]}
      />

      <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={4} gap={4}>
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </ResponsiveGrid>

      <SupportDashboardCharts />
    </div>
  )
}
