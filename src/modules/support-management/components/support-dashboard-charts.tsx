import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  escalationsMock,
  ticketsByModuleMock,
  ticketsByReasonMock,
  ticketsByUserTypeMock,
  ticketTrendsMock,
} from '../mock/support.mock'
import { ChartCard } from '@/shared/components/dashboard/chart-card'
import { ResponsiveGrid } from '@/shared/components/responsive/responsive-grid'

const tooltipStyle = {
  background: 'rgba(2,6,23,0.92)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 14,
  padding: '10px 12px',
  color: 'rgba(226,232,240,0.95)',
  boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
}

const pieColors = ['#F59E0B', '#60A5FA', '#34D399', '#E2E8F0']
const moduleColors = {
  networking: '#92400E',
  events: '#3B82F6',
  services: '#1E40AF',
  venues: '#10B981',
}

export function SupportDashboardCharts() {
  const totalReasonTickets = ticketsByReasonMock.reduce((sum, r) => sum + r.count, 0)

  return (
    <>
      <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={2} gap={4}>
        <ChartCard title="Ticket Trends" description="Total vs resolved tickets over time">
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ticketTrendsMock} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="day"
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
                <Area
                  type="monotone"
                  dataKey="total"
                  stackId="1"
                  stroke="#60A5FA"
                  fill="#60A5FA"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stackId="1"
                  stroke="#34D399"
                  fill="#34D399"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Tickets by User Type"
          description="Distribution across platform user segments"
        >
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ticketsByUserTypeMock}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {ticketsByUserTypeMock.map((_, index) => (
                    <Cell key={index} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: 'rgba(148,163,184,0.85)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </ResponsiveGrid>

      <ChartCard title="Tickets by Module" description="Monthly ticket volume by platform module">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ticketsByModuleMock} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
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
              <Bar dataKey="networking" fill={moduleColors.networking} radius={[4, 4, 0, 0]} />
              <Bar dataKey="events" fill={moduleColors.events} radius={[4, 4, 0, 0]} />
              <Bar dataKey="services" fill={moduleColors.services} radius={[4, 4, 0, 0]} />
              <Bar dataKey="venues" fill={moduleColors.venues} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ResponsiveGrid mobileCols={1} tabletCols={2} desktopCols={2} gap={4}>
        <ChartCard title="Tickets by Reason" description="Top issue categories">
          <div className="space-y-4 py-2">
            {ticketsByReasonMock.map((reason) => (
              <div key={reason.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-slate-300">{reason.label}</span>
                  <span className="font-semibold text-white">{reason.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(reason.count / totalReasonTickets) * 100}%`,
                      backgroundColor: reason.color,
                    }}
                  />
                </div>
              </div>
            ))}
            <p className="pt-2 text-xs text-slate-500">Total Tickets: {totalReasonTickets}</p>
          </div>
        </ChartCard>

        <ChartCard title="Escalations to Other Teams" description="Weekly escalation volume">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={escalationsMock} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="day"
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
                <Bar dataKey="teamA" fill="#34D399" radius={[4, 4, 0, 0]} />
                <Bar dataKey="teamB" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="teamC" fill="#60A5FA" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </ResponsiveGrid>
    </>
  )
}
