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
  conversionFunnelMock,
  engagementMetricsMock,
  kpiStatsMock,
  membershipTrendsMock,
  revenueMemberGrowthMock,
  serviceDistributionMock,
} from '@/modules/dashboard/mock/executive-overview.mock'

export function ExecutiveOverviewPage() {
  const navigate = useNavigate()
  const isLoading = false
  const pieColors = ['#EF4444', '#F59E0B', '#60A5FA', '#34D399', '#A78BFA']
  const tooltipStyle = {
    background: 'rgba(2,6,23,0.92)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 14,
    padding: '10px 12px',
    color: 'rgba(226,232,240,0.95)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Executive Overview"
        subtitle="Key performance indicators across all platform operations"
        actions={[
          {
            label: 'Manage Metrics',
            onClick: () => navigate('/metrics/executive-overview'),
            variant: 'default',
          },
          {
            label: 'Export Data',
            onClick: () => toast.message('Export coming soon'),
            variant: 'secondary',
          },
        ]}
      />

      <StatGrid stats={kpiStatsMock} />

      <AnalyticsWidget title="Engagement Overview" metrics={engagementMetricsMock} />

      <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={2} gap={4}>
        <ChartCard
          title="Revenue & Member Growth"
          description="Monthly trendlines across revenue and new member acquisition"
          isLoading={isLoading}
          isEmpty={!revenueMemberGrowthMock.length}
        >
          <div className="h-[220px] min-h-[220px] w-full sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={220}>
              <LineChart
                data={revenueMemberGrowthMock}
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
                  labelStyle={{ color: 'rgba(226,232,240,0.95)', fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ color: 'rgba(148,163,184,0.85)' }} />
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
          isEmpty={!membershipTrendsMock.length}
        >
          <div className="h-[220px] min-h-[220px] w-full sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={220}>
              <BarChart
                data={membershipTrendsMock}
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
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: 'rgba(148,163,184,0.85)' }} />
                <Bar dataKey="active" fill="#60A5FA" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expired" fill="#F87171" radius={[6, 6, 0, 0]} />
                <Bar dataKey="new" fill="#34D399" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Conversion Funnel"
          description="User journey from visits to paid membership"
          isLoading={isLoading}
          isEmpty={!conversionFunnelMock.length}
        >
          <div className="h-[220px] min-h-[220px] w-full sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={220}>
              <BarChart
                data={conversionFunnelMock}
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
                <Bar dataKey="value" fill="#3B82F6" radius={[10, 10, 10, 10]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Service type distribution"
          description="Distribution by service type engagement"
          isLoading={isLoading}
          isEmpty={!serviceDistributionMock.length}
        >
          <div className="h-[220px] min-h-[220px] w-full sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={220}>
              <PieChart>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: 'rgba(148,163,184,0.85)' }} />
                <Pie
                  data={serviceDistributionMock}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  stroke="rgba(255,255,255,0.08)"
                >
                  {serviceDistributionMock.map((_, index) => (
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
