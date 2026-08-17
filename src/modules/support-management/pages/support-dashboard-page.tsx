import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Download, SlidersHorizontal } from 'lucide-react'

import { SupportDashboardCharts } from '../components/support-dashboard-charts'
import { SupportStatCard } from '../components/support-stat-card'
import {
  useExportSupportTickets,
  useLiveSupportUpdates,
  useSupportStats,
} from '../hooks/use-support'
import { downloadBlob, getApiErrorMessage } from '../utils/support-format'
import {
  orderByActiveMetricIds,
  useActiveMetricIds,
} from '@/modules/expert/hooks/use-active-metric-ids'

const SUPPORT_DASHBOARD_MODULE_KEY = 'support-dashboard'

const DEFAULT_METRIC_IDS = [
  'total-tickets',
  'open-tickets',
  'in-progress',
  'assigned-to-me',
  'escalated-by-me',
  'avg-first-response',
  'avg-resolution',
  'resolved-today',
]

export function SupportDashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useSupportStats()
  const exportMutation = useExportSupportTickets()
  const activeMetricIds = useActiveMetricIds(SUPPORT_DASHBOARD_MODULE_KEY, DEFAULT_METRIC_IDS)
  useLiveSupportUpdates()

  const stats = useMemo(() => {
    const cards = (data?.data?.cards ?? []).map((s) => ({
      id: s.key,
      title: s.title,
      value: String(s.value),
      trend: {
        direction: (s.changeDirection ?? 'up') as 'up' | 'down',
        percentage: s.changePercent ?? 0,
        label: 'vs last month',
      },
    }))
    return orderByActiveMetricIds(cards, activeMetricIds)
  }, [activeMetricIds, data?.data?.cards])

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync({})
      downloadBlob(blob, 'support-tickets.csv')
      toast.success('Export downloaded')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to export tickets'))
    }
  }

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
            onClick={handleExport}
            disabled={exportMutation.isPending}
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
        {(isLoading && stats.length === 0
          ? Array.from({ length: activeMetricIds.length || 8 }, (_, i) => ({
              id: `loading-${i}`,
              title: `Loading ${i}`,
              value: '—',
              trend: { direction: 'up' as const, percentage: 0, label: 'vs last month' },
            }))
          : stats
        ).map((stat) => (
          <SupportStatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            percentage={stat.trend.percentage}
            direction={stat.trend.direction}
            label={stat.trend.label}
          />
        ))}
      </div>

      <SupportDashboardCharts />
    </div>
  )
}
