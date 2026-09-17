import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ExportDataIcon, ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'

import { SupportDashboardCharts } from '../components/support-dashboard-charts'
import { SupportStatCard } from '../components/support-stat-card'
import { StatCardSkeleton } from '@/shared/components/ui/skeleton'
import {
  DEFAULT_SUPPORT_DASHBOARD_METRIC_IDS,
  SUPPORT_DASHBOARD_LEGACY_METRIC_ID_MAP,
  SUPPORT_DASHBOARD_METRIC_IDS,
  SUPPORT_DASHBOARD_METRIC_ID_SET,
  SUPPORT_DASHBOARD_MODULE_KEY,
} from '../config/support-dashboard-metrics.config'
import { useLiveSupportUpdates, useSupportStats } from '../hooks/use-support'
import { buildSupportDashboardMetricCards } from '../utils/support-dashboard-metrics'
import { exportSupportDashboard } from '../utils/export-support-dashboard'
import { getApiErrorMessage } from '../utils/support-format'
import {
  orderByActiveMetricIds,
  useActiveMetricIds,
} from '@/modules/expert/hooks/use-active-metric-ids'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { useDefaultExportFormat } from '@/modules/settings/hooks/use-default-export-format'

export function SupportDashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useSupportStats()
  const { fileFormat, label: exportFormatLabel } = useDefaultExportFormat()
  const [isExporting, setIsExporting] = useState(false)
  const activeMetricIds = useActiveMetricIds(SUPPORT_DASHBOARD_MODULE_KEY, [
    ...DEFAULT_SUPPORT_DASHBOARD_METRIC_IDS,
  ])
  useLiveSupportUpdates()

  const filteredActiveMetricIds = useMemo(
    () =>
      sortIdsByCatalogOrder(
        [
          ...new Set(activeMetricIds.map((id) => SUPPORT_DASHBOARD_LEGACY_METRIC_ID_MAP[id] ?? id)),
        ].filter((id) => SUPPORT_DASHBOARD_METRIC_ID_SET.has(id)),
        SUPPORT_DASHBOARD_METRIC_IDS,
      ),
    [activeMetricIds],
  )

  const stats = useMemo(() => {
    const allCards = buildSupportDashboardMetricCards(data?.data?.cards)
    return orderByActiveMetricIds(allCards, filteredActiveMetricIds)
  }, [data?.data?.cards, filteredActiveMetricIds])

  const handleExport = async () => {
    if (stats.length === 0) {
      toast.error('No records found to export')
      return
    }
    setIsExporting(true)
    try {
      await exportSupportDashboard(stats, fileFormat)
      toast.success(`Exported Support Dashboard as ${exportFormatLabel}`)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to export dashboard'))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-h2 text-brand-text font-semibold tracking-tight">
            Support Dashboard
          </h1>
          <p className="ui-page-subtitle mt-1 text-[16px] leading-5 font-medium tracking-normal text-[#FFFFFF80]">
            Real-time view of ticket volume, SLA health, agent workload, and resolution quality
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="ui-export-data ui-cta ui-cta-primary"
          >
            <ExportDataIcon />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/metrics/support-dashboard')}
            className="ui-manage-metrics ui-cta ui-cta-primary"
          >
            <ManageMetricsIcon />
            Manage Metrics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? filteredActiveMetricIds.map((id) => <StatCardSkeleton key={id} />)
          : stats.map((stat) => (
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
