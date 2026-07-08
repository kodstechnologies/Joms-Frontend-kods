import { toast } from 'sonner'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { healthMetricsMock } from '../mock/settings.defaults'
import { ChartCard } from '@/shared/components/dashboard/chart-card'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
import { StatCard } from '@/shared/components/dashboard/stat-card'
import { ResponsiveGrid } from '@/shared/components/responsive/responsive-grid'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

const tooltipStyle = {
  background: 'rgba(2,6,23,0.92)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 14,
  padding: '10px 12px',
  color: 'rgba(226,232,240,0.95)',
  boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
} as const

const healthTrendsMock = [
  { day: '5/1', supportCases: 1200, transactions: 99.7, uptime: 99.98 },
  { day: '5/8', supportCases: 1180, transactions: 99.6, uptime: 99.97 },
  { day: '5/15', supportCases: 1250, transactions: 99.65, uptime: 99.98 },
  { day: '5/22', supportCases: 1210, transactions: 99.75, uptime: 99.99 },
  { day: '5/29', supportCases: 1225, transactions: 99.7, uptime: 99.98 },
]

const performanceMock = [
  { time: '00:00', latency: 28, cpu: 40, requests: 1200 },
  { time: '04:00', latency: 22, cpu: 45, requests: 1350 },
  { time: '08:00', latency: 34, cpu: 52, requests: 1600 },
  { time: '12:00', latency: 58, cpu: 68, requests: 2400 },
  { time: '16:00', latency: 44, cpu: 61, requests: 2100 },
  { time: '20:00', latency: 33, cpu: 55, requests: 1750 },
  { time: '24:00', latency: 26, cpu: 48, requests: 1400 },
]

const complianceMock = [
  { month: 'Jan', flags: 2, approvals: 4, tickets: 1 },
  { month: 'Feb', flags: 3, approvals: 3, tickets: 0 },
  { month: 'Mar', flags: 1, approvals: 4, tickets: 1 },
  { month: 'Apr', flags: 2, approvals: 2, tickets: 0 },
  { month: 'May', flags: 4, approvals: 5, tickets: 1 },
  { month: 'Jun', flags: 3, approvals: 4, tickets: 0 },
]

const infraMock = [
  { label: 'Web Servers', subLabel: 'Starter Healthy', uptime: '99.98%', load: '68%', status: 'warning' as const },
  { label: 'Database Cluster', subLabel: 'Operational', uptime: '99.99%', load: '54%', status: 'ok' as const },
  { label: 'Cache Layer', subLabel: 'Healthy', uptime: '99.97%', load: '42%', status: 'ok' as const },
  { label: 'Message Queue', subLabel: 'Stable', uptime: '99.96%', load: '38%', status: 'warning' as const },
  { label: 'CDN', subLabel: 'Global Healthy', uptime: '100%', load: '61%', status: 'ok' as const },
]

const StatusDot = ({ tone }: { tone: 'ok' | 'warning' | 'danger' }) => (
  <span
    className={cn(
      'inline-block size-2 rounded-full',
      tone === 'ok' ? 'bg-brand-success' : tone === 'danger' ? 'bg-brand-danger' : 'bg-brand-gold-to',
    )}
  />
)

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

      <ChartCard
        title="Platform Health Trends"
        description="Support load, transaction reliability, and uptime signals"
        className="min-h-[340px]"
      >
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={healthTrendsMock} margin={{ left: 6, right: 6, top: 6, bottom: 6 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }} />
              <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[99.2, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: 'rgba(148,163,184,0.85)' }} />
              <Bar yAxisId="left" dataKey="supportCases" name="Support Cases" fill="#60A5FA" radius={[8, 8, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="transactions" name="Transactions (%)" stroke="#F59E0B" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="uptime" name="Uptime (%)" stroke="#34D399" strokeWidth={2} dot={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard
        title="System Performance (24h)"
        description="Latency, CPU usage, and request volume signals"
        className="min-h-[340px]"
      >
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceMock} margin={{ left: 6, right: 6, top: 6, bottom: 6 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }} />
              <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: 'rgba(148,163,184,0.85)' }} />
              <Area yAxisId="left" type="monotone" dataKey="cpu" name="CPU Usage" stroke="#60A5FA" fill="#60A5FA" fillOpacity={0.18} />
              <LineChart data={performanceMock}>
                <Line yAxisId="left" type="monotone" dataKey="latency" name="Latency (ms)" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="requests" name="Requests" stroke="#34D399" strokeWidth={2} dot={false} />
              </LineChart>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard
        title="Security & Compliance Tracking"
        description="Monthly compliance flags, approvals, and security tickets"
        className="min-h-[340px]"
      >
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={complianceMock} margin={{ left: 6, right: 6, top: 6, bottom: 6 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: 'rgba(148,163,184,0.85)' }} />
              <Bar dataKey="flags" name="Compliance Flags" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              <Bar dataKey="approvals" name="Too Many Approvals" fill="#34D399" radius={[8, 8, 0, 0]} />
              <Bar dataKey="tickets" name="Security Tickets" fill="#EF4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <section className={cn(uiTokens.radiusCard, uiTokens.borderSubtle, 'bg-brand-surface p-5 sm:p-6')}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-brand-text">Infrastructure Health</h2>
            <p className="mt-1 text-xs text-brand-muted">Core services snapshot (static preview)</p>
          </div>
          <button
            type="button"
            onClick={() => toast.message('Refresh coming soon')}
            className="text-xs font-semibold text-brand-muted hover:text-brand-text"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-3">
          {infraMock.map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-3 rounded-brand-md border border-white/10 bg-white/4 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <StatusDot tone={row.status === 'ok' ? 'ok' : 'warning'} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-text">{row.label}</p>
                  <p className="text-xs text-brand-muted">{row.subLabel}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-10">
                <div className="text-right sm:text-left">
                  <p className="text-[10px] uppercase tracking-wide text-brand-muted">Uptime</p>
                  <p className="text-sm font-semibold text-brand-text">{row.uptime}</p>
                </div>
                <div className="text-right sm:text-left">
                  <p className="text-[10px] uppercase tracking-wide text-brand-muted">Load</p>
                  <p className="text-sm font-semibold text-brand-text">{row.load}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
