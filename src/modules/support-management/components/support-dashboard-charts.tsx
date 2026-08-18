import type { PropsWithChildren } from 'react'
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { RefreshCw } from 'lucide-react'

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
const legendStyle: React.CSSProperties = { color: BRAND_MUTED, fontSize: 12, paddingTop: 12 }

const colorForKey = (key: string, index: number, known?: Record<string, string>) =>
  known?.[key] || SERIES_PALETTE[index % SERIES_PALETTE.length]

function ChartCard({
  title,
  children,
  className,
  onRefresh,
  refreshing,
}: PropsWithChildren<{
  title: string
  className?: string
  onRefresh?: () => void
  refreshing?: boolean
}>) {
  return (
    <div className={cn('radius-lg bg-brand-surface border border-white/[0.06] p-5', className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-body-md-semibold text-brand-text">{title}</h2>
        <button
          type="button"
          aria-label="Refresh"
          onClick={onRefresh}
          className="text-muted hover:text-brand-text grid size-8 place-items-center rounded-lg border border-white/10 bg-black/40 transition-colors hover:bg-white/5"
        >
          <RefreshCw className={cn('size-3.5', refreshing && 'animate-spin')} />
        </button>
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

export function SupportDashboardCharts() {
  const { data, isFetching, isLoading, refetch } = useSupportStats()
  const charts = data?.data?.charts
  const emptyLabel = isLoading ? 'Loading…' : 'No tickets in this period'
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
    <>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[652fr_584fr]">
        <ChartCard
          title="Ticket Trends"
          className="h-[382px]"
          onRefresh={refetch}
          refreshing={isFetching}
        >
          <div className="h-[300px] w-full">
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

        <ChartCard
          title="Tickets by User Type"
          className="h-[382px]"
          onRefresh={refetch}
          refreshing={isFetching}
        >
          {hasUserTypeData ? (
            <div className="flex h-full items-center gap-8">
              <div className="h-[220px] w-[220px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ticketsByUserType}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={95}
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth={2}
                    >
                      {ticketsByUserType.map((entry, index) => (
                        <Cell key={entry.key} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-1 flex-col gap-5">
                {ticketsByUserType.map((entry, index) => (
                  <div key={entry.key} className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2">
                      <span
                        className="mt-[3px] inline-block size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      <div>
                        <p className="text-body-sm-medium text-brand-text">{entry.name}</p>
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

      <ChartCard title="Tickets by Module" onRefresh={refetch} refreshing={isFetching}>
        <div className="h-[300px] w-full">
          {hasModuleData && ticketsByModule ? (
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
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'transparent' }} />
                <Legend wrapperStyle={legendStyle} />
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
          ) : (
            <ChartEmpty label={emptyLabel} />
          )}
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Tickets by Reason" onRefresh={refetch} refreshing={isFetching}>
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

        <ChartCard title="Escalations to Other Teams" onRefresh={refetch} refreshing={isFetching}>
          <div className="h-[280px] w-full">
            {hasEscalationData && escalations ? (
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
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'transparent' }} />
                  <Legend wrapperStyle={legendStyle} />
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
            ) : (
              <ChartEmpty label={emptyLabel} />
            )}
          </div>
        </ChartCard>
      </div>
    </>
  )
}
