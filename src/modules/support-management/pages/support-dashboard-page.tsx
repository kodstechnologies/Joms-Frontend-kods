import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Download, SlidersHorizontal } from 'lucide-react'

import { SupportDashboardCharts } from '../components/support-dashboard-charts'
import { supportDashboardStats } from '../mock/support.mock'
import { StatCard } from '@/shared/components/dashboard/stat-card'

export function SupportDashboardPage() {
  const navigate = useNavigate()
  const stats = supportDashboardStats.map((s) => ({
    title: s.title,
    value: s.value,
    trend: { direction: 'up' as const, percentage: 6.7, label: 'vs last month' },
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-h2 text-brand-text tracking-tight">Support Management</h1>
          <p className="text-body-md text-muted mt-1 leading-[20px]">
            Decision-centric workspace for high-impact tickets requiring approval, enforcement, or
            oversight
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => toast.message('Export coming soon')}
            className="ui-cta ui-cta-ghost"
          >
            <Download className="icon-sm shrink-0" />
            Export Data
          </button>
          <button
            type="button"
            onClick={() => navigate('/metrics/support-dashboard')}
            className="ui-manage-metrics ui-cta ui-cta-primary"
          >
            <SlidersHorizontal className="icon-sm shrink-0" />
            Manage Metrics
          </button>
        </div>
      </div>

      {/* Stats — 2 rows of 4 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} className="h-[130px]" />
        ))}
      </div>

      <SupportDashboardCharts />
    </div>
  )
}
