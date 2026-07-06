import { toast } from 'sonner'

import { healthMetricsMock } from '../mock/settings.defaults'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
import { StatCard } from '@/shared/components/dashboard/stat-card'
import { ResponsiveGrid } from '@/shared/components/responsive/responsive-grid'

export function PlatformHealthPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Platform Health & Operations"
        subtitle="System performance, security metrics, and operational analytics"
        actions={[
          {
            label: 'Export Data',
            onClick: () => toast.message('Export coming soon'),
            variant: 'secondary',
          },
          {
            label: 'Manage Metrics',
            onClick: () => toast.message('Metrics configuration coming soon'),
          },
        ]}
      />

      <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={4} gap={4}>
        {healthMetricsMock.map((metric) => (
          <StatCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            trend={{
              direction: metric.up ? 'up' : 'down',
              percentage: Number(metric.change.replace(/[+%-]/g, '')) || 0,
              label: 'vs last quarter',
            }}
          />
        ))}
      </ResponsiveGrid>

      <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 text-sm text-slate-400">
        Live infrastructure charts and compliance tracking will connect later. This dashboard is a
        static preview and does not affect platform operations.
      </div>
    </div>
  )
}
