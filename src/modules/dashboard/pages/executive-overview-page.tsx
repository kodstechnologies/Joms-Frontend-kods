import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { AnalyticsWidget } from '@/shared/components/dashboard/analytics-widget'
import { ChartCard } from '@/shared/components/dashboard/chart-card'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
import { StatGrid } from '@/shared/components/dashboard/stat-grid'
import { ResponsiveGrid } from '@/shared/components/responsive/responsive-grid'
import {
  orderByActiveMetricIds,
  useActiveMetricIds,
} from '@/modules/expert/hooks/use-active-metric-ids'
import {
  DEFAULT_EXECUTIVE_METRIC_IDS,
  EXECUTIVE_OVERVIEW_METRIC_IDS,
  EXECUTIVE_OVERVIEW_METRIC_ID_SET,
  EXECUTIVE_OVERVIEW_MODULE_KEY,
} from '@/modules/dashboard/config/executive-overview-metrics.config'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { useExecutiveOverview } from '@/modules/dashboard/hooks/use-executive-overview'
import { logExecutiveOverviewExport } from '@/modules/dashboard/api/executive-overview-api'
import { buildExecutiveKpiStats } from '@/modules/dashboard/utils/executive-overview-metrics'
import {
  buildExecutiveOverviewCsv,
  downloadCsv,
} from '@/modules/dashboard/utils/executive-overview-export'

export function ExecutiveOverviewPage() {
  const navigate = useNavigate()
  const overviewQuery = useExecutiveOverview()
  const isLoading = overviewQuery.isLoading
  const payload = overviewQuery.data
  const activeMetricIds = useActiveMetricIds(EXECUTIVE_OVERVIEW_MODULE_KEY, [
    ...DEFAULT_EXECUTIVE_METRIC_IDS,
  ])
  const filteredActiveMetricIds = useMemo(
    () =>
      sortIdsByCatalogOrder(
        activeMetricIds.filter((id) => EXECUTIVE_OVERVIEW_METRIC_ID_SET.has(id)),
        EXECUTIVE_OVERVIEW_METRIC_IDS,
      ),
    [activeMetricIds],
  )
  const kpiStats = useMemo(() => buildExecutiveKpiStats(payload?.metrics), [payload?.metrics])
  const visibleKpiStats = useMemo(
    () => orderByActiveMetricIds(kpiStats, filteredActiveMetricIds),
    [filteredActiveMetricIds, kpiStats],
  )
  const engagementMetrics = useMemo(
    () =>
      (payload?.engagement || []).map((item) => ({
        label: item.label,
        value: item.formatted || '—',
      })),
    [payload?.engagement],
  )
  const revenueMemberGrowth = payload?.charts?.revenueMemberGrowth || []
  const membershipTrends = payload?.charts?.membershipTrends || []
  const conversionFunnel = payload?.charts?.conversionFunnel || []
  const serviceDistribution = payload?.charts?.serviceTypeDistribution || []
  const pieColors = ['#EF4444', '#F59E0B', '#60A5FA', '#34D399', '#A78BFA']
  const tooltipStyle = {
    background: 'rgba(255,255,255,0.95)',
    border: '1px solid rgba(0,0,0,0.10)',
    borderRadius: 14,
    padding: '10px 12px',
    color: 'rgba(0,0,0,0.85)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
  }

  const handleRefresh = async () => {
    try {
      await overviewQuery.refetch()
      toast.success('Executive overview refreshed')
    } catch {
      toast.error('Failed to refresh overview')
    }
  }

  const handleExport = async () => {
    if (!payload) {
      toast.error('Overview data is not ready to export')
      return
    }
    try {
      downloadCsv(
        `executive-overview-${new Date().toISOString().slice(0, 10)}.csv`,
        buildExecutiveOverviewCsv(payload),
      )
      await logExecutiveOverviewExport()
      toast.success('Export downloaded')
    } catch {
      toast.error('Failed to export overview data')
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Executive Overview"
        subtitle="Key performance indicators across all platform operations"
        actions={[
          {
            label: 'Manage Metrics',
            onClick: () => navigate('/metrics/executive-overview?section=dashboard'),
            variant: 'default',
          },
          {
            label: 'Export Data',
            onClick: handleExport,
            variant: 'secondary',
          },
        ]}
      />

      <StatGrid
        stats={visibleKpiStats}
        isLoading={isLoading}
        skeletonCount={filteredActiveMetricIds.length || DEFAULT_EXECUTIVE_METRIC_IDS.length}
      />

      <AnalyticsWidget
        title="Engagement Overview"
        metrics={engagementMetrics}
        isLoading={isLoading}
      />

      <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={2} gap={4}>
        <ChartCard
          title="Revenue & Member Growth"
          description="Monthly trendlines across revenue and new member acquisition"
          isLoading={isLoading}
          refreshing={overviewQuery.isFetching}
          onRefresh={handleRefresh}
          isEmpty={!revenueMemberGrowth.length}
        >
          <div className="h-[220px] min-h-[220px] w-full sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={220}>
              <LineChart
                data={revenueMemberGrowth}
                margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
              >
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: 'rgba(0,0,0,0.85)', fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ color: '#ffffff' }} iconType="diamond" iconSize={10} />
                <Line
                  type="monotone"
                  dataKey="newMembers"
                  stroke="#60A5FA"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#FBBF24"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Membership Trends"
          description="Active, expired, and new membership movement"
          isLoading={isLoading}
          refreshing={overviewQuery.isFetching}
          onRefresh={handleRefresh}
          isEmpty={!membershipTrends.length}
        >
          <div className="h-[220px] min-h-[220px] w-full sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={220}>
              <BarChart data={membershipTrends} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  wrapperStyle={{ color: 'rgba(148,163,184,0.85)' }}
                  iconType="diamond"
                  iconSize={10}
                />
                <Bar dataKey="active" fill="#155DFC" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expired" fill="#D3191C" radius={[6, 6, 0, 0]} />
                <Bar dataKey="new" fill="#00A63E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Conversion Funnel"
          description="User journey from sign up to paid membership"
          isLoading={isLoading}
          refreshing={overviewQuery.isFetching}
          onRefresh={handleRefresh}
          isEmpty={!conversionFunnel.length}
        >
          <div className="h-[220px] min-h-[220px] w-full sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={220}>
              <BarChart
                data={conversionFunnel}
                layout="vertical"
                margin={{ left: 12, right: 12, top: 8, bottom: 8 }}
              >
                <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="stage"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#155DFC" radius={[10, 10, 10, 10]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Service Type Distribution"
          description="Distribution by service type engagement"
          isLoading={isLoading}
          refreshing={overviewQuery.isFetching}
          onRefresh={handleRefresh}
          isEmpty={!serviceDistribution.length}
        >
          <div className="h-[220px] min-h-[220px] w-full sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={220}>
              <PieChart>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: 'rgba(148,163,184,0.85)' }} iconType="diamond" />
                <Pie
                  data={serviceDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  stroke="rgba(255,255,255,0.08)"
                >
                  {serviceDistribution.map((_, index) => (
                    <Cell key={index} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </ResponsiveGrid>
    </div>
  )
}
