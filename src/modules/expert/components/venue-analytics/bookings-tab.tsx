import { useState } from 'react'
import { ArrowUpDown } from 'lucide-react'

import {
  EVENT_BOOKINGS,
  EVENT_METRICS,
  MEETUP_METRICS,
} from '../../mock/venue-profile-analytics.mock'
import { AnalyticsCard, MetricCard, SectionTitle, StatusBadge, SubTabPills } from './analytics-ui'
import type { VenueProfileAnalyticsResponse } from '../../type/venue-analytics.types'

type BookingCategory = 'events' | 'meetup'

interface BookingsTabProps {
  data?: VenueProfileAnalyticsResponse['bookings']
  isLoading?: boolean
}

export function BookingsTab({ data, isLoading }: BookingsTabProps) {
  const [category, setCategory] = useState<BookingCategory>('events')

  const eventMetrics = data?.eventMetrics ?? EVENT_METRICS
  const meetupMetrics = data?.meetupMetrics ?? MEETUP_METRICS
  const eventBookings = data?.eventBookings ?? EVENT_BOOKINGS

  const metrics = category === 'events' ? eventMetrics : meetupMetrics
  const sectionTitle = category === 'events' ? 'Event Metrics' : 'Meetup Metrics'
  const sectionSubtitle =
    category === 'events'
      ? 'Learn more about Events performance'
      : 'Learn more about Meetups performance'

  return (
    <div className="flex flex-col gap-5">
      <SubTabPills
        tabs={[
          { key: 'events', label: 'Events' },
          { key: 'meetup', label: 'Meet Up' },
        ]}
        active={category}
        onChange={(key) => setCategory(key as BookingCategory)}
      />

      <div>
        <SectionTitle title={sectionTitle} subtitle={sectionSubtitle} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((item) => (
            <MetricCard
              key={item.label}
              label={item.label}
              value={isLoading ? '—' : item.value}
              trend={item.trend}
            />
          ))}
        </div>
      </div>

      <div>
        <SectionTitle title="Event Bookings" subtitle="All booking records" />
        <AnalyticsCard className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="border-b border-white/10 text-[11px] text-[#777]">
                  <th className="px-5 py-3 font-medium">Booking ID</th>
                  <th className="px-5 py-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      Space Name
                      <ArrowUpDown className="size-3" />
                    </span>
                  </th>
                  <th className="px-5 py-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      Host Name
                      <ArrowUpDown className="size-3" />
                    </span>
                  </th>
                  <th className="px-5 py-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      Date
                      <ArrowUpDown className="size-3" />
                    </span>
                  </th>
                  <th className="px-5 py-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      Revenue
                      <ArrowUpDown className="size-3" />
                    </span>
                  </th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {eventBookings.map((booking, index) => (
                  <tr
                    key={`${booking.id}-${index}`}
                    className="border-b border-white/5 text-[12px] text-white last:border-0"
                  >
                    <td className="px-5 py-3.5 text-[#999]">{booking.id}</td>
                    <td className="px-5 py-3.5 font-medium">{booking.space}</td>
                    <td className="px-5 py-3.5 text-[#999]">{booking.host}</td>
                    <td className="px-5 py-3.5 text-[#999]">{booking.date}</td>
                    <td className="px-5 py-3.5 text-[#999]">{booking.revenue}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnalyticsCard>
      </div>
    </div>
  )
}
