import { useMemo } from 'react'
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/api-error'

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
import { exportExecutiveOverviewToExcel } from '@/modules/dashboard/utils/export-executive-overview'
import { useDefaultExportFormat } from '@/modules/settings/hooks/use-default-export-format'

const PIE_COLORS = ['#EF4444', '#F97316', '#FFC849', '#10B981', '#06B6D4', '#8B5CF6']

export function ExecutiveOverviewPage() {
  const navigate = useNavigate()
  const { fileFormat, option: exportFormat } = useDefaultExportFormat()
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
  const serviceDistribution = useMemo(
    () => payload?.charts?.serviceTypeDistribution || [],
    [payload?.charts?.serviceTypeDistribution],
  )

  const totalDistributionValue = useMemo(
    () => serviceDistribution.reduce((acc, item) => acc + (Number(item.value) || 0), 0),
    [serviceDistribution],
  )

  const distributionWithPercentage = useMemo(() => {
    return serviceDistribution.map((item) => {
      const pct = totalDistributionValue > 0 ? (item.value / totalDistributionValue) * 100 : 0
      return {
        ...item,
        percentage: Math.round(pct * 10) / 10,
      }
    })
  }, [serviceDistribution, totalDistributionValue])

  const handleRefresh = async () => {
    try {
      await overviewQuery.refresh()
      toast.success('Executive overview refreshed')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to refresh overview'))
    }
  }

  const handleExport = async () => {
    if (!payload) {
      toast.error('Overview data is not ready to export')
      return
    }
    try {
      await exportExecutiveOverviewToExcel(
        {
          kpis: visibleKpiStats,
          engagement: engagementMetrics,
          revenueMemberGrowth,
          membershipTrends,
          conversionFunnel,
          serviceDistribution,
        },
        fileFormat,
      )
      await logExecutiveOverviewExport()
      toast.success(`Exported as ${exportFormat}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to export overview data'))
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
          className="min-h-[380px]"
          isLoading={isLoading}
          refreshing={overviewQuery.isFetching}
          onRefresh={handleRefresh}
          isEmpty={!revenueMemberGrowth.length}
        >
          <div className="w-full">
            <div className="h-[270px] min-h-[270px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={revenueMemberGrowth}
                  margin={{ left: 0, right: 0, top: 12, bottom: 4 }}
                >
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFC849" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#FFC849" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="membersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2B426B" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#000000" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="rgba(255,255,255,0.08)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="left"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                    tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : String(v))}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                    tickFormatter={(v) => String(v)}
                  />
                  <Tooltip
                    cursor={{ stroke: 'rgba(96,165,250,0.5)', strokeWidth: 1.5 }}
                    content={({ active, payload: tPayload, label }) => {
                      if (active && tPayload && tPayload.length) {
                        return (
                          <div className="min-w-[130px] rounded-lg border border-black/5 bg-white px-3 py-2 shadow-2xl">
                            <p className="mb-1 text-xs font-bold text-gray-900">{label}</p>
                            {tPayload.map((item, i) => {
                              const isRevenue = item.dataKey === 'revenue'
                              return (
                                <p
                                  key={i}
                                  className="text-xs font-semibold"
                                  style={{ color: isRevenue ? '#FFC849' : '#2B426B' }}
                                >
                                  {isRevenue ? 'Revenue(₹)' : 'New Members'}:{' '}
                                  {typeof item.value === 'number'
                                    ? item.value.toLocaleString('en-IN')
                                    : item.value}
                                </p>
                              )
                            })}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="newMembers"
                    name="New Members"
                    stroke="#2B426B"
                    strokeWidth={2}
                    fill="url(#membersGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#2B426B', stroke: '#ffffff', strokeWidth: 1.5 }}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#FFC849"
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#FFC849', stroke: '#ffffff', strokeWidth: 1.5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <span className="text-sm font-bold text-[#2B426B]">✦</span>
                <span>New Members</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <span className="text-sm font-bold text-[#FFC849]">✦</span>
                <span>Revenue</span>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Membership Trends"
          className="min-h-[380px]"
          isLoading={isLoading}
          refreshing={overviewQuery.isFetching}
          onRefresh={handleRefresh}
          isEmpty={!membershipTrends.length}
        >
          <div className="w-full">
            <div className="h-[270px] min-h-[270px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={membershipTrends}
                  margin={{ left: 0, right: 0, top: 12, bottom: 4 }}
                  barGap={4}
                >
                  <CartesianGrid
                    stroke="rgba(255,255,255,0.08)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                    tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : String(v))}
                  />
                  <Tooltip
                    content={({ active, payload: tPayload, label }) => {
                      if (active && tPayload && tPayload.length) {
                        return (
                          <div className="min-w-[130px] rounded-lg border border-black/5 bg-white px-3 py-2 shadow-2xl">
                            <p className="mb-1 text-xs font-bold text-gray-900">{label}</p>
                            {tPayload.map((item, i) => (
                              <p
                                key={i}
                                className="text-xs font-semibold"
                                style={{
                                  color: (item.color as string) || (item.fill as string) || '#111',
                                }}
                              >
                                {item.name}:{' '}
                                {typeof item.value === 'number'
                                  ? item.value.toLocaleString('en-IN')
                                  : item.value}
                              </p>
                            ))}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar
                    dataKey="active"
                    name="Active membership"
                    fill="#155DFC"
                    radius={[2, 2, 0, 0]}
                    maxBarSize={18}
                  />
                  <Bar
                    dataKey="new"
                    name="New Members"
                    fill="#00A63E"
                    radius={[2, 2, 0, 0]}
                    maxBarSize={18}
                  />
                  <Bar
                    dataKey="expired"
                    name="Expired"
                    fill="#D3191C"
                    radius={[2, 2, 0, 0]}
                    maxBarSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <span className="text-sm font-bold text-[#155DFC]">✦</span>
                <span>Active membership</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <span className="text-sm font-bold text-[#D3191C]">✦</span>
                <span>Expired</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <span className="text-sm font-bold text-[#00A63E]">✦</span>
                <span>New Members</span>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Conversion Funnel"
          isLoading={isLoading}
          refreshing={overviewQuery.isFetching}
          onRefresh={handleRefresh}
          isEmpty={!conversionFunnel.length}
        >
          <div className="h-[280px] min-h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={conversionFunnel}
                layout="vertical"
                margin={{ left: 16, right: 24, top: 8, bottom: 8 }}
              >
                <CartesianGrid
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="3 3"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : String(v))}
                />
                <YAxis
                  type="category"
                  dataKey="stage"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                  width={105}
                />
                <Tooltip
                  content={({ active, payload: tPayload }) => {
                    if (active && tPayload && tPayload.length) {
                      const item = tPayload[0]
                      return (
                        <div className="rounded-lg border border-black/5 bg-white px-3 py-2 shadow-xl">
                          <p className="text-xs font-bold text-gray-900">{item.payload?.stage}</p>
                          <p className="text-xs font-semibold text-[#155DFC]">
                            Count:{' '}
                            {typeof item.value === 'number'
                              ? item.value.toLocaleString('en-IN')
                              : item.value}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="value" fill="#155DFC" radius={[6, 6, 6, 6]} barSize={20}>
                  <LabelList
                    dataKey="value"
                    position="insideRight"
                    formatter={(v: unknown) =>
                      typeof v === 'number'
                        ? v >= 1000
                          ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}K`
                          : String(v)
                        : String(v ?? '')
                    }
                    fill="#ffffff"
                    style={{ fontSize: 11, fontWeight: 700, fill: '#ffffff' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Service type distribution"
          isLoading={isLoading}
          refreshing={overviewQuery.isFetching}
          onRefresh={handleRefresh}
          isEmpty={!serviceDistribution.length}
        >
          <div className="flex h-[280px] flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="h-[240px] w-full sm:w-[50%]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload: tPayload }) => {
                      if (active && tPayload && tPayload.length) {
                        const item = tPayload[0]
                        return (
                          <div className="rounded-lg border border-black/5 bg-white px-3 py-2 shadow-xl">
                            <p className="text-xs font-bold text-gray-900">{item.name}</p>
                            <p
                              className="text-xs font-semibold"
                              style={{ color: (item.payload?.fill as string) || '#111' }}
                            >
                              {item.value} (
                              {totalDistributionValue > 0
                                ? ((Number(item.value) / totalDistributionValue) * 100).toFixed(1)
                                : 0}
                              %)
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Pie
                    data={distributionWithPercentage}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={95}
                    stroke="#141414"
                    strokeWidth={2}
                  >
                    {distributionWithPercentage.map((_, index) => (
                      <Cell
                        key={`pie-cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex w-full flex-col justify-center gap-2.5 pl-0 sm:w-[50%] sm:pl-2">
              {distributionWithPercentage.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2.5 text-xs text-white/80">
                  <span
                    className="size-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  <span className="truncate">
                    {item.name}: {item.value} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </ResponsiveGrid>
    </div>
  )
}
