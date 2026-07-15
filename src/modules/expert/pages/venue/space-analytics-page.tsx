import { useNavigate, useParams } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowLeft, Download, RefreshCw, SlidersHorizontal, Star } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'

const OVERVIEW = [
  { label: 'Total Bookings', value: '387', note: '77.4% capacity' },
  { label: 'Time', value: '234', note: '60.5% of registrants' },
  { label: 'Avg Event Value', value: '82', note: 'Premium attendees' },
  { label: 'Utilization Rate', value: '₹487,650', note: 'vs last month' },
  { label: 'Avg Rating', value: '387', note: '77.4% capacity' },
  { label: 'Conversion Rate', value: '234', note: '60.5% of registrants' },
]

const CASH_FLOW = [
  { month: 'Jan', in: 125000, out: 95000, net: 60000 },
  { month: 'Feb', in: 145000, out: 76000, net: 65000 },
  { month: 'Mar', in: 135000, out: 110000, net: 62000 },
  { month: 'Apr', in: 155000, out: 132000, net: 70000 },
  { month: 'May', in: 168000, out: 138000, net: 72000 },
  { month: 'Jun', in: 182000, out: 140000, net: 84000 },
  { month: 'July', in: 196000, out: 158000, net: 76000 },
]

const TIME_SLOTS = [
  { slot: '10AM-2PM', bookings: 34, revenue: '₹480,000' },
  { slot: '2PM-6PM', bookings: 28, revenue: '₹480,000' },
  { slot: '6PM-10PM', bookings: 29, revenue: '₹480,000' },
]

const RATINGS = [
  { stars: 5, reviews: 72, percent: 49 },
  { stars: 4, reviews: 48, percent: 32 },
  { stars: 3, reviews: 18, percent: 12 },
  { stars: 2, reviews: 6, percent: 4 },
  { stars: 1, reviews: 4, percent: 6 },
]

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-white/5 bg-[#111111] p-5 ${className}`}>
      {children}
    </section>
  )
}

export function SpaceAnalyticsPage() {
  const navigate = useNavigate()
  const { venueId, spaceId } = useParams<{ venueId: string; spaceId: string }>()

  return (
    <div className="mx-auto flex max-w-[1120px] flex-col gap-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(`/venues/management/profile/${venueId}/space/${spaceId}`)}
            className="group font-heading hover:text-brand-accent flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>View Analytics</span>
          </button>
          <div className="mt-2 flex items-center gap-1.5 pl-7 text-[12px] font-medium text-[#777777]">
            <span>Venue Management</span>
            <span className="text-[#333333]">/</span>
            <span>Venue Details</span>
            <span className="text-[#333333]">/</span>
            <span className="font-bold text-white">View Analytics</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button className="h-9" onClick={() => navigate('/venues/dashboard/metrics')}>
            <SlidersHorizontal className="size-4" />
            Manage Metrics
          </Button>
          <Button className="h-9">
            <Download className="size-4" />
            Export Data
          </Button>
        </div>
      </header>

      <div>
        <h2 className="mb-3 text-[13px] font-bold text-white">Overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OVERVIEW.map((item) => (
            <Card key={item.label}>
              <p className="text-[11px] text-[#999]">{item.label}</p>
              <p className="mt-2 text-xl font-bold text-white">{item.value}</p>
              <p className="mt-3 text-[11px] text-[#777]">{item.note}</p>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[13px] font-bold text-white">Cash Flow Analysis</h2>
          <RefreshCw className="size-4 text-white" />
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CASH_FLOW} barGap={4}>
              <CartesianGrid stroke="#2a2a2a" strokeDasharray="4 4" vertical />
              <XAxis
                dataKey="month"
                tick={{ fill: '#999', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: '#999', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{ background: '#fff', border: 0, borderRadius: 6, color: '#111' }}
              />
              <Bar dataKey="in" fill="#00A84F" radius={[2, 2, 0, 0]} />
              <Bar dataKey="out" fill="#E31B23" radius={[2, 2, 0, 0]} />
              <Bar dataKey="net" fill="#0F6CFF" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-center gap-6 text-[11px]">
          <span className="text-emerald-400">+ Cash Inflow</span>
          <span className="text-red-400">+ Cash Outflow</span>
          <span className="text-blue-400">+ Net Cash flow</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-[13px] font-bold text-white">Time Slot Performance</h2>
          <div className="space-y-1">
            <div className="grid grid-cols-3 border-b border-white/10 pb-3 text-[11px] font-semibold text-white">
              <span>Time Slot</span>
              <span>Bookings</span>
              <span>Revenue</span>
            </div>
            {TIME_SLOTS.map((row) => (
              <div
                key={row.slot}
                className="grid grid-cols-3 border-b border-white/10 py-3 text-[12px] text-white last:border-0"
              >
                <span>{row.slot}</span>
                <span>{row.bookings}</span>
                <span>{row.revenue}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-md bg-black px-3 py-2 text-[11px] font-semibold text-white">
            6PM-10PM generates 38% of total revenue
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[13px] font-bold text-white">Rating Distribution</h2>
            <RefreshCw className="size-4 text-white" />
          </div>
          <div className="space-y-3">
            {RATINGS.map((rating) => (
              <div
                key={rating.stars}
                className="grid grid-cols-[32px_1fr_36px] items-center gap-3 text-[11px] text-white"
              >
                <span className="inline-flex items-center gap-1">
                  {rating.stars}
                  <Star className="fill-brand-accent text-brand-accent size-3" />
                </span>
                <div className="h-3 overflow-hidden rounded-full bg-black">
                  <div
                    className="bg-brand-accent h-full rounded-full"
                    style={{ width: `${rating.percent}%` }}
                  />
                </div>
                <span>{rating.percent}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="max-w-[520px]">
        <h2 className="mb-4 text-[13px] font-bold text-white">Cancellation Analytics</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-md bg-black px-3 py-3 text-[12px] text-[#999]">
            <span>Total Cancellations</span>
            <span className="font-bold text-white">30</span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-black px-3 py-3 text-[12px] text-[#999]">
            <span>Revenue Lost</span>
            <span className="font-bold text-white">₹2,10,000</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
