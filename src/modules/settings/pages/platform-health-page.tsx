import { useState, type ReactNode } from 'react'
import { Check, RefreshCw, Settings2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { healthMetricsMock, type HealthMetric } from '../mock/settings.defaults'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

const tooltipStyle = {
  background: '#ffffff',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 10,
  padding: '10px 12px',
  color: '#111111',
  boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
} as const

const healthTrendsMock = [
  { day: '5/1', transactions: 1320, supportTickets: 42, uptime: 99.97 },
  { day: '5/8', transactions: 1180, supportTickets: 38, uptime: 99.96 },
  { day: '5/15', transactions: 1450, supportTickets: 47, uptime: 99.98 },
  { day: '5/22', transactions: 1260, supportTickets: 40, uptime: 99.99 },
  { day: '5/29', transactions: 1380, supportTickets: 44, uptime: 99.98 },
]

const performanceMock = [
  { time: '00:00', memory: 52, cpu: 42, requests: 1200 },
  { time: '04:00', memory: 54, cpu: 48, requests: 900 },
  { time: '08:00', memory: 56, cpu: 55, requests: 1400 },
  { time: '12:00', memory: 58, cpu: 68, requests: 2400 },
  { time: '16:00', memory: 57, cpu: 61, requests: 2100 },
  { time: '20:00', memory: 55, cpu: 52, requests: 1750 },
  { time: '24:00', memory: 53, cpu: 45, requests: 1300 },
]

const complianceMock = [
  { month: 'Jan', flags: 3, resolved: 4, incidents: 1 },
  { month: 'Feb', flags: 4, resolved: 5, incidents: 0 },
  { month: 'Mar', flags: 2, resolved: 3, incidents: 1 },
  { month: 'Apr', flags: 3, resolved: 4, incidents: 0 },
  { month: 'May', flags: 4, resolved: 6, incidents: 0 },
  { month: 'Jun', flags: 3, resolved: 5, incidents: 0 },
]

const infraMock = [
  { label: 'Web Servers', uptime: '99.98%', load: 68 },
  { label: 'Database Cluster', uptime: '99.99%', load: 54 },
  { label: 'Cache Layer', uptime: '99.97%', load: 42 },
  { label: 'Message Queue', uptime: '99.96%', load: 38 },
  { label: 'CDN', uptime: '100%', load: 61 },
]

function HealthMetricCard({ metric }: { metric: HealthMetric }) {
  return (
    <div className={cn(uiTokens.radiusCard, 'bg-brand-surface border border-white/10 p-4 sm:p-5')}>
      <p className="text-body-sm text-muted">{metric.title}</p>
      <p className="text-h2 text-brand-text sm:text-h2 mt-2 font-semibold tracking-tight">
        {metric.value}
      </p>
      <div className="mt-3 min-h-[28px]">
        {metric.trend ? (
          <span
            className={cn(
              'text-body-sm-semibold inline-flex rounded-full px-2.5 py-1',
              metric.trend.tone === 'positive'
                ? 'bg-brand-positive/15 text-brand-positive'
                : 'bg-brand-danger/15 text-brand-danger',
            )}
          >
            {metric.trend.text}
          </span>
        ) : null}
        {metric.hint ? <p className="text-body-sm-semibold text-muted">{metric.hint}</p> : null}
        {metric.status ? (
          <p className="text-body-sm-semibold text-muted inline-flex items-center gap-1.5">
            <Check className="text-brand-text size-3.5" />
            {metric.status}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function ChartPanel({
  title,
  children,
  onRefresh,
}: {
  title: string
  children: ReactNode
  onRefresh?: () => void
}) {
  const [range, setRange] = useState('Last 3 Months')

  return (
    <section
      className={cn(uiTokens.radiusCard, 'bg-brand-surface border border-white/10 p-4 sm:p-5')}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-body-md-semibold text-brand-text">{title}</h2>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(event) => setRange(event.target.value)}
            className="radius-md bg-brand-bg text-body-sm text-brand-text/80 h-9 border border-white/10 px-3"
          >
            <option>Last 3 Months</option>
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
          </select>
          <button
            type="button"
            onClick={onRefresh}
            className="bg-brand-bg text-muted hover:text-brand-text grid size-9 place-items-center rounded-full border border-white/10"
            aria-label="Refresh chart"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>
      {children}
    </section>
  )
}

function LoadBar({ value }: { value: number }) {
  const tone = value >= 60 ? 'bg-brand-accent' : 'bg-brand-positive'
  return (
    <div className="h-2 w-full max-w-[180px] overflow-hidden rounded-full bg-white/10">
      <div className={cn('h-full rounded-full', tone)} style={{ width: `${value}%` }} />
    </div>
  )
}

export function PlatformHealthPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-h1 text-brand-text sm:text-h1 font-semibold tracking-tight">
            Platform Health & Operations
          </h1>
          <p className="text-body-md text-muted sm:text-body-lg mt-1">
            System performance, security metrics, and operational analytics
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => toast.message('Export coming soon')}
            className="ui-export-data ui-cta ui-cta-primary inline-flex items-center gap-2 px-4"
          >
            <Upload className="size-4" />
            Export Data
          </button>
          <button
            type="button"
            onClick={() => toast.message('Metrics configuration coming soon')}
            className="ui-manage-metrics ui-cta ui-cta-primary inline-flex items-center gap-2 px-4"
          >
            <Settings2 className="size-4" />
            Manage Metrics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {healthMetricsMock.map((metric) => (
          <HealthMetricCard key={metric.title} metric={metric} />
        ))}
      </div>

      <ChartPanel title="Platform Health Trends" onRefresh={() => toast.message('Refreshed')}>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={healthTrendsMock}
              margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                domain={[0, 1600]}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[99, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                wrapperStyle={{ color: 'rgba(148,163,184,0.9)', fontSize: 12, paddingTop: 12 }}
              />
              <Bar
                yAxisId="left"
                dataKey="transactions"
                name="Transactions (K)"
                fill="#155dfc"
                radius={[6, 6, 0, 0]}
                barSize={36}
              />
              <Bar
                yAxisId="left"
                dataKey="supportTickets"
                name="Support Tickets"
                fill="#f6cb86"
                radius={[6, 6, 0, 0]}
                barSize={18}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="uptime"
                name="Uptime %"
                stroke="#00a63e"
                strokeWidth={2}
                dot={{ r: 4, fill: '#00a63e', strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>

      <ChartPanel title="System Performance (24h)" onRefresh={() => toast.message('Refreshed')}>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={performanceMock} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 3200]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                wrapperStyle={{ color: 'rgba(148,163,184,0.9)', fontSize: 12, paddingTop: 12 }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="memory"
                name="Memory usage"
                stroke="#f6cb86"
                fill="#f6cb86"
                fillOpacity={0.22}
                strokeWidth={2}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="cpu"
                name="CPU Usage"
                stroke="#155dfc"
                fill="#155dfc"
                fillOpacity={0.22}
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="requests"
                name="Request/min"
                stroke="#00a63e"
                strokeWidth={2}
                dot={{ r: 4, fill: '#00a63e', strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>

      <ChartPanel
        title="Security & Compliance Tracking"
        onRefresh={() => toast.message('Refreshed')}
      >
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={complianceMock} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <YAxis
                domain={[0, 8]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                wrapperStyle={{ color: 'rgba(148,163,184,0.9)', fontSize: 12, paddingTop: 12 }}
              />
              <Bar
                dataKey="flags"
                name="Compliance Flags"
                fill="#f6cb86"
                radius={[6, 6, 0, 0]}
                barSize={18}
              />
              <Bar
                dataKey="resolved"
                name="Issues Resolved"
                fill="#00a63e"
                radius={[6, 6, 0, 0]}
                barSize={18}
              />
              <Bar
                dataKey="incidents"
                name="Security Incidents"
                fill="#d3191c"
                radius={[6, 6, 0, 0]}
                barSize={18}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ChartPanel>

      <section
        className={cn(uiTokens.radiusCard, 'bg-brand-surface border border-white/10 p-4 sm:p-5')}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-body-md-semibold text-brand-text">Infrastructure Health</h2>
          <button
            type="button"
            onClick={() => toast.message('Refresh coming soon')}
            className="bg-brand-bg text-muted hover:text-brand-text grid size-9 place-items-center rounded-full border border-white/10"
            aria-label="Refresh infrastructure"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>

        <div className="space-y-3">
          {infraMock.map((row) => (
            <div
              key={row.label}
              className="radius-lg bg-brand-bg grid gap-4 border border-white/10 px-4 py-4 lg:grid-cols-[minmax(0,1.4fr)_120px_120px_minmax(0,1fr)] lg:items-center"
            >
              <div className="flex items-start gap-3">
                <span className="bg-brand-positive mt-1.5 inline-block size-2 rounded-full" />
                <div>
                  <p className="text-body-md-semibold text-brand-text">{row.label}</p>
                  <p className="text-body-sm text-muted">Status: Healthy</p>
                </div>
              </div>
              <div>
                <p className="text-body-sm-semibold text-muted tracking-wide uppercase">Uptime</p>
                <p className="text-body-md-semibold text-brand-text mt-1">{row.uptime}</p>
              </div>
              <div>
                <p className="text-body-sm-semibold text-muted tracking-wide uppercase">Load</p>
                <p className="text-body-md-semibold text-brand-text mt-1">{row.load}%</p>
              </div>
              <LoadBar value={row.load} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
