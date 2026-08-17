import { useState } from 'react'
import { ArrowUpDown } from 'lucide-react'

import {
  AnalyticsCard,
  MetricCard,
  MetricCardSkeleton,
  SectionTitle,
  StatusBadge,
  SubTabPills,
} from './analytics-ui'
import type { VenueProfileAnalyticsResponse } from '../../type/venue-analytics.types'

type BookingCategory = 'events' | 'meetup'

interface BookingsTabProps {
  data?: VenueProfileAnalyticsResponse['bookings']
  isLoading?: boolean
}

export function BookingsTab({ data, isLoading }: BookingsTabProps) {
  const [category, setCategory] = useState<BookingCategory>('events')

  const eventMetrics = data?.eventMetrics ?? []
  const meetupMetrics = data?.meetupMetrics ?? []
  const eventBookings = data?.eventBookings ?? []

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
          {isLoading
            ? Array.from({ length: 7 }).map((_, index) => (
                <MetricCardSkeleton key={`booking-metric-skeleton-${index}`} />
              ))
            : metrics.map((item) => (
                <MetricCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  trend={item.trend}
                />
              ))}
        </div>
      </div>

      <div>
        <SectionTitle title="Event Bookings" subtitle="All booking records" />
        <AnalyticsCard className="overflow-hidden p-0">
          {isLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`booking-row-skeleton-${index}`}
                  className="h-10 animate-pulse rounded bg-white/5"
                />
              ))}
            </div>
          ) : eventBookings.length === 0 ? (
            <div className="text-muted p-6 text-center text-sm">
              No bookings found for this venue.
            </div>
          ) : (
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
          )}
        </AnalyticsCard>
      </div>
    </div>
  )
}
