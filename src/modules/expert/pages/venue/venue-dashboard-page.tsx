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
import { BarChart3, ChevronDown, Download, RefreshCw, Star, TrendingDown, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

type Metric = {
  label: string
  value: string
  change?: string
  changeType?: 'up' | 'down'
  changeNote?: string
  note?: string
}

const METRICS: Metric[] = [
  { label: 'Total Venues', value: '45', change: '12%', changeType: 'up', changeNote: 'vs last quarter' },
  { label: 'Active Venues', value: '38', change: '8.4%', changeType: 'up', changeNote: 'vs last quarter' },
  { label: 'Avg Utilization Rate', value: '71.3%', change: '5.2%', changeType: 'up', changeNote: 'vs last month' },
  { label: 'Events Per Venue', value: '27.6', change: '18%', changeType: 'up', changeNote: 'vs last month' },
  { label: 'Revenue Contribution', value: '₹342,567', change: '9.8%', changeType: 'up', changeNote: 'vs last month' },
  { label: 'Venue Cancellation Rate', value: '5.4%', change: '2.1%', changeType: 'down', changeNote: 'vs last quarter' },
  { label: 'Avg Venue Rating', value: '4.4/5', change: '0.3', changeType: 'up', changeNote: 'vs last quarter' },
  { label: 'Venue Satisfaction Score', value: '88%', change: '4%', changeType: 'up', changeNote: 'vs last quarter' },
  { label: 'Peak Utilization Hours', value: '6-8 PM', note: '99% utilization' },
  { label: 'Avg Booking Lead Time', value: '12 days', note: 'fewer reservations' },
  { label: 'Venue Turnover Rate', value: '2.3 hrs', note: 'avg. setup + cleanup' },
  { label: 'Off-Peak Utilization', value: '34%', note: 'Unused capacity 9-5' },
  { label: 'Repeat Booking Rate', value: '67%', change: '5.1%', changeType: 'up', changeNote: 'vs last quarter' },
  { label: 'Avg Revenue Per Venue', value: '8.3%', change: '3.2%', changeType: 'up', changeNote: 'vs last month' },
]

type TrendPoint = {
  month: string
  revenue: number
  avgRevenue: number
  utilization: number
}

const TREND_DATA: TrendPoint[] = [
  { month: 'Jan', revenue: 28000, avgRevenue: 24000, utilization: 18000 },
  { month: 'Feb', revenue: 34000, avgRevenue: 30000, utilization: 22000 },
  { month: 'Mar', revenue: 41000, avgRevenue: 36000, utilization: 26000 },
  { month: 'Apr', revenue: 47000, avgRevenue: 42000, utilization: 30000 },
  { month: 'May', revenue: 52000, avgRevenue: 48000, utilization: 34000 },
]

type VenueRow = {
  name: string
  city: string
  totalVisits: number
  eventAttendance: number
  bookings: number
  repeatVisitors: number
  utilization: number
  revenue: string
  rating: number
  status: 'High Performing' | 'Stable' | 'Needs Attention'
}

const TOP_VENUES: VenueRow[] = [
  { name: 'Taj Hotel', city: 'Bangalore', totalVisits: 85, eventAttendance: 320, bookings: 35, repeatVisitors: 35, utilization: 88, revenue: '₹45,230', rating: 4.8, status: 'High Performing' },
  { name: 'Marlot Hotel', city: 'Kolkata', totalVisits: 100, eventAttendance: 100, bookings: 100, repeatVisitors: 100, utilization: 78, revenue: '₹38,180', rating: 4.9, status: 'High Performing' },
  { name: 'Oberoi Hotel', city: 'Haryana', totalVisits: 50, eventAttendance: 50, bookings: 50, repeatVisitors: 50, utilization: 78, revenue: '₹36,065', rating: 4.2, status: 'Stable' },
  { name: 'Atithia Bettapur Hotel', city: 'Mumbai', totalVisits: 30, eventAttendance: 30, bookings: 30, repeatVisitors: 50, utilization: 64, revenue: '₹32,140', rating: 4.6, status: 'Stable' },
  { name: 'Sheraton Grand Hotel', city: 'Delhi', totalVisits: 20, eventAttendance: 20, bookings: 20, repeatVisitors: 40, utilization: 53, revenue: '₹28,450', rating: 4.6, status: 'Needs Attention' },
]

const STATUS_STYLES: Record<VenueRow['status'], string> = {
  'High Performing': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Stable: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'Needs Attention': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

const tooltipStyle = {
  background: 'rgba(2,6,23,0.92)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 12,
  padding: '10px 12px',
  color: 'rgba(226,232,240,0.95)',
  boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
}

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#121212] p-4 transition-colors hover:border-white/10">
      <p className="text-[11px] font-medium text-[#888888]">{metric.label}</p>
      <p className="mt-2 text-[20px] font-bold tracking-tight text-white">{metric.value}</p>
      <div className="mt-2 flex items-center gap-2">
        {metric.change ? (
          <>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                metric.changeType === 'down'
                  ? 'bg-rose-500/10 text-rose-400'
                  : 'bg-emerald-500/10 text-emerald-400',
              )}
            >
              {metric.changeType === 'down' ? (
                <TrendingDown className="size-3" />
              ) : (
                <TrendingUp className="size-3" />
              )}
              {metric.change}
            </span>
            {metric.changeNote && (
              <span className="text-[10px] text-[#666666]">{metric.changeNote}</span>
            )}
          </>
        ) : (
          metric.note && <span className="text-[10px] text-[#666666]">{metric.note}</span>
        )}
      </div>
    </div>
  )
}

export const VenueDashboardPage = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Venues</h1>
          <p className="mt-1 text-[13px] text-[#888888]">
            Venue performance, utilization analytics, and revenue metrics
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => navigate('/venues/dashboard/metrics')}>
            <BarChart3 className="size-4" />
            Manage Metrics
          </Button>
          <Button onClick={() => toast.message('Export coming soon')}>
            <Download className="size-4" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {METRICS.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#121212] p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[14px] font-bold text-white">Venue Utilization &amp; Revenue Trends</h2>
            <p className="mt-0.5 text-[11px] text-[#777777]">
              Monthly utilization and revenue performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                defaultValue="3"
                className="h-9 cursor-pointer appearance-none rounded-lg border border-white/10 bg-black px-3 pr-8 text-[11px] font-medium text-white outline-none focus:border-[#FBC078]/50"
              >
                <option value="3">Last 3 Months</option>
                <option value="6">Last 6 Months</option>
                <option value="12">Last 12 Months</option>
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-3 -translate-y-1/2 text-white" />
            </div>
            <button
              type="button"
              aria-label="Refresh"
              className="grid size-9 place-items-center rounded-lg border border-white/10 bg-black text-slate-300 transition-colors hover:bg-white/5"
            >
              <RefreshCw className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={TREND_DATA} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(148,163,184,0.85)', fontSize: 12 }}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend wrapperStyle={{ color: 'rgba(148,163,184,0.85)', fontSize: 12 }} />
              <Bar
                yAxisId="right"
                name="Utilization %"
                dataKey="utilization"
                fill="#22C55E"
                radius={[4, 4, 0, 0]}
                barSize={28}
              />
              <Area
                yAxisId="left"
                type="monotone"
                name="Revenue"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#revenueFill)"
              />
              <Line
                yAxisId="left"
                type="monotone"
                name="Avg Revenue/Venue"
                dataKey="avgRevenue"
                stroke="#FBC078"
                strokeWidth={2}
                dot={{ r: 3, fill: '#FBC078' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#121212] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-bold text-white">Top Performing Venues</h2>
            <p className="mt-0.5 text-[11px] text-[#777777]">
              Ranked by utilization and revenue contribution
            </p>
          </div>
          <button
            type="button"
            aria-label="Refresh"
            className="grid size-9 place-items-center rounded-lg border border-white/10 bg-black text-slate-300 transition-colors hover:bg-white/5"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-semibold tracking-wide text-[#777777] uppercase">
                <th className="px-3 py-3">Venue Name</th>
                <th className="px-3 py-3">City</th>
                <th className="px-3 py-3">Total Visits</th>
                <th className="px-3 py-3">Event Attendance</th>
                <th className="px-3 py-3">Bookings</th>
                <th className="px-3 py-3">Repeat Visitors %</th>
                <th className="px-3 py-3">Utilization %</th>
                <th className="px-3 py-3">Revenue</th>
                <th className="px-3 py-3">Rating</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {TOP_VENUES.map((venue) => (
                <tr
                  key={venue.name}
                  className="border-b border-white/5 text-[12px] text-slate-200 transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-3 py-3 font-semibold text-white">{venue.name}</td>
                  <td className="px-3 py-3 text-[#999999]">{venue.city}</td>
                  <td className="px-3 py-3">{venue.totalVisits}</td>
                  <td className="px-3 py-3">{venue.eventAttendance}</td>
                  <td className="px-3 py-3">{venue.bookings}</td>
                  <td className="px-3 py-3">{venue.repeatVisitors}%</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-[#FBC078]"
                          style={{ width: `${venue.utilization}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-[#999999]">{venue.utilization}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-semibold text-white">{venue.revenue}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-3.5 fill-[#FBC078] text-[#FBC078]" />
                      <span className="font-semibold text-white">{venue.rating}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-md border px-2 py-1 text-[10px] font-semibold',
                        STATUS_STYLES[venue.status],
                      )}
                    >
                      {venue.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
