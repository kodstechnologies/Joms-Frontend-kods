import type { PropsWithChildren } from 'react'
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useSupportStats } from '../hooks/use-support'
import { cn } from '@/shared/lib/cn'

const BRAND_GREEN = 'var(--brand-green)'
const BRAND_BLUE = 'var(--brand-blue)'
const BRAND_ORANGE = 'var(--brand-orange)'
const BRAND_MUTED = 'var(--brand-muted)'

const CHART_NETWORKING = '#5B4A24'
const PIE_COLORS = ['#FBC078', BRAND_BLUE, BRAND_GREEN, '#E5E7EB']
const SERIES_PALETTE = [
  CHART_NETWORKING,
  BRAND_BLUE,
  BRAND_ORANGE,
  BRAND_GREEN,
  '#FBC078',
  '#A855F7',
  '#94A3B8',
]

const MODULE_COLOR_BY_KEY: Record<string, string> = {
  networking: CHART_NETWORKING,
  events: BRAND_BLUE,
  services: BRAND_ORANGE,
  venues: BRAND_GREEN,
}

const TEAM_COLOR_BY_KEY: Record<string, string> = {
  team_a: BRAND_GREEN,
  team_b: BRAND_ORANGE,
  team_c: BRAND_BLUE,
}

const tooltipStyle: React.CSSProperties = {
  background: 'var(--brand-card)',
  border: 'none',
  borderRadius: 'var(--brand-radius-lg, 10px)',
  padding: '10px 12px',
  color: 'var(--brand-text-dark)',
  boxShadow: '0 16px 40px rgba(0,0,0,0.1)',
}

const axisTickStyle = { fill: BRAND_MUTED, fontSize: 11 }

const colorForKey = (key: string, index: number, known?: Record<string, string>) =>
  known?.[key] || SERIES_PALETTE[index % SERIES_PALETTE.length]

function ChartLegend({
  series,
  colorMap,
}: {
  series: Array<{ key: string; name: string }>
  colorMap?: Record<string, string>
}) {
  if (!series.length) return null
  return (
    <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
      {series.map((item, index) => (
        <li key={item.key} className="text-muted flex items-center gap-2 text-xs">
          <span
            className="size-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: colorForKey(item.key, index, colorMap) }}
          />
          <span className="leading-none">{item.name}</span>
        </li>
      ))}
    </ul>
  )
}

function CompactSeriesTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; color?: string; dataKey?: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  const items = payload.filter((entry) => Number(entry.value ?? 0) > 0)
  return (
    <div style={tooltipStyle}>
      <p className="text-body-sm-semibold text-brand-text-dark mb-1.5">{label}</p>
      {items.length ? (
        <div className="space-y-1">
          {items.map((entry) => (
            <p key={String(entry.dataKey)} className="text-body-sm" style={{ color: entry.color }}>
              {entry.name}:{' '}
              <span className="text-brand-text-dark font-semibold">{entry.value ?? 0}</span>
            </p>
          ))}
        </div>
      ) : (
        <p className="text-body-sm text-muted">No tickets</p>
      )}
    </div>
  )
}

function ChartCard({
  title,
  children,
  className,
}: PropsWithChildren<{
  title: string
  className?: string
}>) {
  return (
    <div className={cn('radius-lg bg-brand-surface border border-white/[0.06] p-5', className)}>
      <div className="mb-4">
        <h2 className="text-body-md-semibold text-brand-text">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function ChartEmpty({ label = 'No tickets in this period' }: { label?: string }) {
  return (
    <div className="text-muted flex h-full min-h-[180px] items-center justify-center text-sm">
      {label}
    </div>
  )
}

function TicketTrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value?: number; dataKey?: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  const total = payload.find((p) => p.dataKey === 'total')?.value
  const resolved = payload.find((p) => p.dataKey === 'resolved')?.value
  return (
    <div style={tooltipStyle}>
      <p className="text-body-sm-semibold text-brand-text-dark mb-2">{label}</p>
      <p className="text-body-sm" style={{ color: BRAND_BLUE }}>
        Total Tickets: <span className="text-brand-text-dark font-semibold">{total ?? 0}</span>
      </p>
      <p className="text-body-sm" style={{ color: BRAND_GREEN }}>
        Resolved: <span className="text-brand-text-dark font-semibold">{resolved ?? 0}</span>
      </p>
    </div>
  )
}

import { ChartSkeleton } from '@/shared/components/ui/skeleton'

export function SupportDashboardCharts() {
  const { data, isLoading } = useSupportStats()
  const charts = data?.data?.charts

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ChartSkeleton title="Ticket Trends" height="280px" />
          <ChartSkeleton title="Tickets by User Type" height="280px" />
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <ChartSkeleton title="Tickets by Module" height="240px" />
          <ChartSkeleton title="Tickets by Reason" height="240px" />
          <ChartSkeleton title="Escalations to Other Teams" height="240px" />
        </div>
      </div>
    )
  }

  const emptyLabel = 'No tickets in this period'
  const ticketTrends = charts?.ticketTrends ?? []
  const ticketsByUserType = charts?.ticketsByUserType ?? []
  const ticketsByModule = charts?.ticketsByModule
  const ticketsByReason = charts?.ticketsByReason ?? []
  const escalations = charts?.escalations
  const totalReasonTickets = ticketsByReason.reduce((sum, reason) => sum + reason.count, 0)
  const hasTrendData = ticketTrends.some((point) => point.total > 0 || point.resolved > 0)
  const hasUserTypeData = ticketsByUserType.some((entry) => entry.value > 0)
  const hasModuleData = Boolean(
    ticketsByModule?.data.some((point) =>
      ticketsByModule.series.some((series) => Number(point[series.key] ?? 0) > 0),
    ),
  )
  const hasEscalationData = Boolean(
    escalations?.series.length &&
    escalations.data.some((point) =>
      escalations.series.some((series) => Number(point[series.key] ?? 0) > 0),
    ),
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Ticket Trends">
          <div className="h-[280px] w-full min-w-0">
            {hasTrendData ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={ticketTrends}
                  margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={BRAND_BLUE} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={BRAND_BLUE} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={BRAND_GREEN} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={BRAND_GREEN} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickStyle}
                    allowDecimals={false}
                  />
                  <Tooltip content={<TicketTrendTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Total Tickets"
                    stroke={BRAND_BLUE}
                    strokeWidth={2}
                    fill="url(#gradTotal)"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    name="Resolved"
                    stroke={BRAND_GREEN}
                    strokeWidth={2}
                    fill="url(#gradResolved)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmpty label={emptyLabel} />
            )}
          </div>
        </ChartCard>

        <ChartCard title="Tickets by User Type">
          {hasUserTypeData ? (
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              <div className="relative h-[200px] w-[200px] shrink-0 overflow-visible">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ticketsByUserType}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={88}
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth={2}
                      isAnimationActive={false}
                    >
                      {ticketsByUserType.map((entry, index) => (
                        <Cell key={entry.key} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex w-full flex-1 flex-col gap-4">
                {ticketsByUserType.map((entry, index) => (
                  <div key={entry.key} className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-2">
                      <span
                        className="mt-[3px] inline-block size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      <div className="min-w-0">
                        <p className="text-body-sm-medium text-brand-text truncate">{entry.name}</p>
                        <p className="text-body-sm text-muted">{entry.value}</p>
                      </div>
                    </div>
                    <span
                      className="text-body-sm-semibold shrink-0"
                      style={{ color: PIE_COLORS[index % PIE_COLORS.length] }}
                    >
                      {entry.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ChartEmpty label={emptyLabel} />
          )}
        </ChartCard>
      </div>

      <ChartCard title="Tickets by Module">
        {hasModuleData && ticketsByModule ? (
          <div className="min-w-0">
            <div className="h-[260px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ticketsByModule.data}
                  margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                  barGap={4}
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickStyle}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CompactSeriesTooltip />} cursor={{ fill: 'transparent' }} />
                  {ticketsByModule.series.map((series, index) => (
                    <Bar
                      key={series.key}
                      dataKey={series.key}
                      name={series.name}
                      fill={colorForKey(series.key, index, MODULE_COLOR_BY_KEY)}
                      radius={[3, 3, 0, 0]}
                      maxBarSize={20}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ChartLegend series={ticketsByModule.series} colorMap={MODULE_COLOR_BY_KEY} />
          </div>
        ) : (
          <ChartEmpty label={emptyLabel} />
        )}
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Tickets by Reason">
          {ticketsByReason.length ? (
            <div className="space-y-5 py-1">
              {ticketsByReason.map((reason, index) => (
                <div key={reason.label}>
                  <div className="text-body-sm mb-1.5 flex items-center justify-between gap-3">
                    <span className="text-muted">{reason.label}</span>
                    <span className="text-brand-text font-semibold">{reason.count}</span>
                  </div>
                  <div className="h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${totalReasonTickets ? (reason.count / totalReasonTickets) * 100 : 0}%`,
                        backgroundColor: SERIES_PALETTE[index % SERIES_PALETTE.length],
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                <span className="text-body-sm text-muted">Total Tickets</span>
                <span className="text-body-sm-semibold text-brand-text">{totalReasonTickets}</span>
              </div>
            </div>
          ) : (
            <ChartEmpty label={emptyLabel} />
          )}
        </ChartCard>

        <ChartCard title="Escalations to Other Teams">
          {hasEscalationData && escalations ? (
            <div className="min-w-0">
              <div className="h-[240px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={escalations.data}
                    margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                    barGap={4}
                  >
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={axisTickStyle} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={axisTickStyle}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CompactSeriesTooltip />} cursor={{ fill: 'transparent' }} />
                    {escalations.series.map((series, index) => (
                      <Bar
                        key={series.key}
                        dataKey={series.key}
                        name={series.name}
                        fill={colorForKey(series.key, index, TEAM_COLOR_BY_KEY)}
                        radius={[3, 3, 0, 0]}
                        maxBarSize={24}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <ChartLegend series={escalations.series} colorMap={TEAM_COLOR_BY_KEY} />
            </div>
          ) : (
            <ChartEmpty label={emptyLabel} />
          )}
        </ChartCard>
      </div>
    </div>
  )
}
