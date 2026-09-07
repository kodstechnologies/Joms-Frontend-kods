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
import { ChartSkeleton } from '@/shared/components/ui/skeleton'

const CHART_BG = '#141414'
const BRAND_GREEN = '#22C55E'
const BRAND_BLUE = '#3B82F6'
const BRAND_ORANGE = '#FBC078'
const BRAND_MUTED = 'rgba(255,255,255,0.45)'

const USER_TYPE_COLOR_BY_KEY: Record<string, string> = {
  venue_partner: BRAND_ORANGE,
  service_partner: BRAND_BLUE,
  expert: BRAND_BLUE,
  event_host: BRAND_GREEN,
  user: '#E5E7EB',
}

const MODULE_COLOR_BY_KEY: Record<string, string> = {
  networking: '#5B4A24',
  events: BRAND_BLUE,
  services: BRAND_ORANGE,
  venues: BRAND_GREEN,
}

const TEAM_COLOR_BY_KEY: Record<string, string> = {
  team_a: BRAND_GREEN,
  team_b: BRAND_ORANGE,
  team_c: BRAND_BLUE,
}

const SERIES_PALETTE = [BRAND_ORANGE, BRAND_BLUE, BRAND_GREEN, '#E5E7EB', '#A855F7', '#94A3B8']

const tooltipStyle: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: '10px',
  padding: '10px 12px',
  color: '#111112',
  boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
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
  return (
    <div style={tooltipStyle}>
      <p className="text-body-sm mb-1.5 font-semibold text-[#111112]">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <p key={String(entry.dataKey)} className="text-body-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold text-[#111112]">{entry.value ?? 0}</span>
          </p>
        ))}
      </div>
    </div>
  )
}

function ChartCard({
  title,
  children,
  className,
  titleClassName,
}: PropsWithChildren<{
  title: string
  className?: string
  titleClassName?: string
}>) {
  return (
    <div className={cn('rounded-xl bg-[#141414] p-4 sm:p-5', className)}>
      <div className="mb-4">
        <h2 className={cn('text-brand-text text-[16px] leading-6 font-semibold', titleClassName)}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}

const DEFAULT_USER_TYPES = [
  { key: 'venue_partner', name: 'Venue Partners', value: 0, percent: 0 },
  { key: 'expert', name: 'Service Partners', value: 0, percent: 0 },
  { key: 'event_host', name: 'Event Hosts', value: 0, percent: 0 },
  { key: 'user', name: 'Users', value: 0, percent: 0 },
]

const DEFAULT_MODULE_SERIES = [
  { key: 'events', name: 'Events' },
  { key: 'networking', name: 'Networking' },
  { key: 'services', name: 'Services' },
  { key: 'venues', name: 'Venues' },
]

const DEFAULT_TEAM_SERIES = [
  { key: 'team_a', name: 'Team A' },
  { key: 'team_b', name: 'Team B' },
  { key: 'team_c', name: 'Team C' },
]

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function lastNDayLabels(count = 7) {
  const now = new Date()
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now)
    date.setDate(now.getDate() - (count - 1 - index))
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  })
}

function lastNMonthLabels(count = 6) {
  const now = new Date()
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(now.getFullYear(), now.getMonth() - (count - 1 - index), 1))
    return date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
  })
}

function buildTrendDomain(values: number[]) {
  const max = Math.max(0, ...values)
  if (max <= 0) return [0, 4] as const
  const step = max <= 10 ? 2 : max <= 50 ? 10 : max <= 200 ? 50 : 100
  const top = Math.ceil(max / step) * step
  return [0, top] as const
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
      <p className="text-body-sm mb-2 font-semibold text-[#111112]">{label}</p>
      <p className="text-body-sm" style={{ color: BRAND_BLUE }}>
        Total Tickets: <span className="font-semibold text-[#111112]">{total ?? 0}</span>
      </p>
      <p className="text-body-sm" style={{ color: BRAND_GREEN }}>
        Resolved: <span className="font-semibold text-[#111112]">{resolved ?? 0}</span>
      </p>
    </div>
  )
}

export function SupportDashboardCharts() {
  const { data, isLoading } = useSupportStats()
  const charts = data?.data?.charts

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,652fr)_minmax(0,584fr)]">
          <ChartSkeleton title="Ticket Trends" height="310px" className="h-[382px]" />
          <ChartSkeleton title="Tickets by User Type" height="310px" className="h-[382px]" />
        </div>
        <ChartSkeleton title="Tickets by Module" height="280px" className="h-[360px]" />
      </div>
    )
  }

  const ticketTrends = charts?.ticketTrends?.length
    ? charts.ticketTrends
    : lastNDayLabels().map((day) => ({ day, total: 0, resolved: 0 }))
  const ticketsByUserType = charts?.ticketsByUserType?.length
    ? charts.ticketsByUserType.filter((entry) => entry.value > 0)
    : DEFAULT_USER_TYPES.filter((entry) => entry.value > 0)
  const ticketsByModule = charts?.ticketsByModule?.series?.length
    ? charts.ticketsByModule
    : {
        series: DEFAULT_MODULE_SERIES,
        data: lastNMonthLabels().map((month) => {
          const point: Record<string, string | number> = { month }
          for (const series of DEFAULT_MODULE_SERIES) point[series.key] = 0
          return point
        }),
      }
  const ticketsByReason = charts?.ticketsByReason ?? []
  const escalations = charts?.escalations?.series?.length
    ? charts.escalations
    : {
        series: DEFAULT_TEAM_SERIES,
        data: WEEKDAY_LABELS.map((day) => {
          const point: Record<string, string | number> = { day }
          for (const series of DEFAULT_TEAM_SERIES) point[series.key] = 0
          return point
        }),
      }
  const totalReasonTickets = ticketsByReason.reduce((sum, reason) => sum + reason.count, 0)

  const userTypeTotal = ticketsByUserType.reduce((sum, entry) => sum + entry.value, 0)
  const pieData =
    userTypeTotal > 0 ? ticketsByUserType : [{ key: 'empty', name: 'None', value: 1, percent: 0 }]

  const trendValues = ticketTrends.flatMap((point) => [point.total, point.resolved])
  const [trendMin, trendMax] = buildTrendDomain(trendValues)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,652fr)_minmax(0,584fr)]">
        <ChartCard title="Ticket Trends" className="flex h-[382px] flex-col">
          <div className="h-[310px] min-h-0 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={ticketTrends} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND_BLUE} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={BRAND_BLUE} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND_GREEN} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={BRAND_GREEN} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={axisTickStyle} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={axisTickStyle}
                  allowDecimals={false}
                  domain={[trendMin, trendMax]}
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
          </div>
        </ChartCard>

        <ChartCard title="Tickets by User Type" className="flex h-[382px] flex-col">
          <div className="flex min-h-0 flex-1 items-center gap-5">
            <div className="relative mx-auto size-[208px] shrink-0 overflow-visible sm:mx-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={userTypeTotal > 0 ? 4 : 0}
                    stroke={CHART_BG}
                    strokeWidth={userTypeTotal > 0 ? 4 : 0}
                    isAnimationActive={false}
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={
                          userTypeTotal > 0
                            ? colorForKey(entry.key, 0, USER_TYPE_COLOR_BY_KEY)
                            : 'rgba(255,255,255,0.08)'
                        }
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {userTypeTotal === 0 ? (
                <span className="text-h2 text-brand-text pointer-events-none absolute inset-0 flex items-center justify-center">
                  0
                </span>
              ) : null}
            </div>

            <div className="flex h-[208px] w-full min-w-0 flex-1 flex-col justify-between">
              {(userTypeTotal > 0 ? ticketsByUserType : DEFAULT_USER_TYPES).map((entry) => {
                const color = colorForKey(entry.key, 0, USER_TYPE_COLOR_BY_KEY)
                return (
                  <div key={entry.key} className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <span
                        className="mt-1 inline-block size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[14px] leading-5 font-medium text-white">
                          {entry.name}
                        </p>
                        <p className="text-[12px] leading-4 text-white/70">{entry.value}</p>
                      </div>
                    </div>
                    <span className="w-11 shrink-0 text-right text-[14px] leading-5 font-semibold text-white">
                      {String(entry.percent).padStart(2, '0')}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Tickets by Module" className="flex h-[360px] w-full flex-col">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="min-h-0 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ticketsByModule.data}
                margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                barGap={6}
                barCategoryGap="18%"
              >
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisTickStyle} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={axisTickStyle}
                  allowDecimals={false}
                  domain={[0, (dataMax: number) => Math.max(4, Number(dataMax) || 0)]}
                />
                <Tooltip content={<CompactSeriesTooltip />} cursor={{ fill: 'transparent' }} />
                {ticketsByModule.series.map((series, index) => (
                  <Bar
                    key={series.key}
                    dataKey={series.key}
                    name={series.name}
                    fill={colorForKey(series.key, index, MODULE_COLOR_BY_KEY)}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ChartLegend series={ticketsByModule.series} colorMap={MODULE_COLOR_BY_KEY} />
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,652fr)_minmax(0,584fr)]">
        <ChartCard title="Tickets by Reason" className="flex h-[360px] flex-col">
          <div className="flex min-h-0 flex-1 flex-col justify-between space-y-5 py-1">
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
              <span className="text-body-sm text-brand-text font-semibold">
                {totalReasonTickets}
              </span>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Escalations to Other Teams" className="flex h-[360px] flex-col">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="min-h-0 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={escalations.data}
                  margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                  barGap={4}
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={axisTickStyle} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={axisTickStyle}
                    allowDecimals={false}
                    domain={[0, (dataMax: number) => Math.max(4, Number(dataMax) || 0)]}
                  />
                  <Tooltip content={<CompactSeriesTooltip />} cursor={{ fill: 'transparent' }} />
                  {escalations.series.map((series, index) => (
                    <Bar
                      key={series.key}
                      dataKey={series.key}
                      name={series.name}
                      fill={colorForKey(series.key, index, TEAM_COLOR_BY_KEY)}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={50}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ChartLegend series={escalations.series} colorMap={TEAM_COLOR_BY_KEY} />
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
