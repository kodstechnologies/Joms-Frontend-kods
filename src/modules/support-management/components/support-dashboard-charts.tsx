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

import {
  escalationsMock,
  ticketsByModuleMock,
  ticketsByReasonMock,
  ticketsByUserTypeMock,
  ticketTrendsMock,
} from '../mock/support.mock'
import { cn } from '@/shared/lib/cn'

// ─── Design-system color vars (same as finance dashboard) ────────────────────
const BRAND_GREEN = 'var(--brand-green)' // #00A63E
const BRAND_BLUE = 'var(--brand-blue)' // #1447E6
const BRAND_ORANGE = 'var(--brand-orange)' // #F54900
const BRAND_MUTED = 'var(--brand-muted)' // #B3B3B3

// Chart series colors — Networking uses gold tint, same pattern as finance
const CHART_NETWORKING = '#5B4A24'
const CHART_EVENTS = BRAND_BLUE
const CHART_SERVICES = BRAND_ORANGE
const CHART_VENUES = BRAND_GREEN

// Pie colors — match finance "Revenue by category" pattern
const PIE_COLORS = ['#FBC078', BRAND_BLUE, BRAND_GREEN, '#E5E7EB']

// Tooltip — white card, same as finance dashboard
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

// ─── Shared ChartCard (same as finance dashboard) ────────────────────────────
function ChartCard({
  title,
  children,
  className,
}: PropsWithChildren<{ title: string; className?: string }>) {
  return (
    <div className={cn('radius-lg bg-brand-surface border border-white/[0.06] p-5', className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-body-md-semibold text-brand-text">{title}</h2>
        <button
          type="button"
          aria-label="Refresh"
          className="text-muted hover:text-brand-text grid size-8 place-items-center rounded-lg border border-white/10 bg-black/40 transition-colors hover:bg-white/5"
        >
          <RefreshCw className="size-3.5" />
        </button>
      </div>
      {children}
    </div>
  )
}

// ─── Custom tooltips ──────────────────────────────────────────────────────────
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
        Total Tickets: <span className="text-brand-text-dark font-semibold">{total}</span>
      </p>
      <p className="text-body-sm" style={{ color: BRAND_GREEN }}>
        Resolved: <span className="text-brand-text-dark font-semibold">{resolved}</span>
      </p>
    </div>
  )
}

export function SupportDashboardCharts() {
  const totalReasonTickets = ticketsByReasonMock.reduce((sum, r) => sum + r.count, 0)

  return (
    <>
      {/* Row 1: Ticket Trends + Tickets by User Type */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[652fr_584fr]">
        {/* Ticket Trends — 652×382 */}
        <ChartCard title="Ticket Trends" className="h-[382px]">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={ticketTrendsMock}
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
                <YAxis tickLine={false} axisLine={false} tick={axisTickStyle} />
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

        {/* Tickets by User Type — 584×382 */}
        <ChartCard title="Tickets by User Type" className="h-[382px]">
          <div className="flex h-full items-center gap-8">
            {/* Donut — 220×220 */}
            <div className="h-[220px] w-[220px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ticketsByUserTypeMock}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={95}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={2}
                  >
                    {ticketsByUserTypeMock.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend — name + count stacked, percent right */}
            <div className="flex flex-1 flex-col gap-5">
              {ticketsByUserTypeMock.map((entry, index) => (
                <div key={entry.name} className="flex items-start justify-between gap-4">
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
        </ChartCard>
      </div>

      {/* Row 2: Tickets by Module — bar chart, same pattern as "Monthly Comparison" */}
      <ChartCard title="Tickets by Module">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ticketsByModuleMock}
              margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
              barGap={4}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisTickStyle} />
              <YAxis tickLine={false} axisLine={false} tick={axisTickStyle} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'transparent' }} />
              <Legend wrapperStyle={legendStyle} />
              <Bar
                dataKey="networking"
                name="Networking"
                fill={CHART_NETWORKING}
                radius={[3, 3, 0, 0]}
                maxBarSize={20}
              />
              <Bar
                dataKey="events"
                name="Events"
                fill={CHART_EVENTS}
                radius={[3, 3, 0, 0]}
                maxBarSize={20}
              />
              <Bar
                dataKey="services"
                name="Services"
                fill={CHART_SERVICES}
                radius={[3, 3, 0, 0]}
                maxBarSize={20}
              />
              <Bar
                dataKey="venues"
                name="Venues"
                fill={CHART_VENUES}
                radius={[3, 3, 0, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Row 3: Tickets by Reason + Escalations to Other Teams */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Tickets by Reason — progress bars */}
        <ChartCard title="Tickets by Reason">
          <div className="space-y-5 py-1">
            {ticketsByReasonMock.map((reason) => (
              <div key={reason.label}>
                <div className="text-body-sm mb-1.5 flex items-center justify-between gap-3">
                  <span className="text-muted">{reason.label}</span>
                  <span className="text-brand-text font-semibold">{reason.count}</span>
                </div>
                <div className="h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
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
            <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
              <span className="text-body-sm text-muted">Total Tickets</span>
              <span className="text-body-sm-semibold text-brand-text">{totalReasonTickets}</span>
            </div>
          </div>
        </ChartCard>

        {/* Escalations to Other Teams — bar chart */}
        <ChartCard title="Escalations to Other Teams">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={escalationsMock}
                margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                barGap={4}
              >
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={axisTickStyle} />
                <YAxis tickLine={false} axisLine={false} tick={axisTickStyle} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'transparent' }} />
                <Legend wrapperStyle={legendStyle} />
                <Bar
                  dataKey="teamA"
                  name="Team A"
                  fill={BRAND_GREEN}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={24}
                />
                <Bar
                  dataKey="teamB"
                  name="Team B"
                  fill={BRAND_ORANGE}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={24}
                />
                <Bar
                  dataKey="teamC"
                  name="Team C"
                  fill={BRAND_BLUE}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </>
  )
}
