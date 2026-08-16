import { ArrowUpDown, Star } from 'lucide-react'

import {
  AnalyticsCard,
  MetricCard,
  MetricCardSkeleton,
  SectionTitle,
  StatusBadge,
} from './analytics-ui'
import type { VenueProfileAnalyticsResponse } from '../../type/venue-analytics.types'

interface SpacesTabProps {
  data?: VenueProfileAnalyticsResponse['spaces']
  isLoading?: boolean
}

export function SpacesTab({ data, isLoading }: SpacesTabProps) {
  const spaceAnalysis = data?.spaceAnalysis ?? []
  const allSpaces = data?.allSpaces ?? []

  return (
    <div className="flex flex-col gap-5">
      <div>
        <SectionTitle title="Space Analysis" subtitle="Learn more about Space's performance" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 7 }).map((_, index) => (
                <MetricCardSkeleton key={`space-analysis-skeleton-${index}`} />
              ))
            : spaceAnalysis.map((item) => (
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
        <SectionTitle title="All Spaces" subtitle="Sortable view of all venue spaces" />
        <AnalyticsCard className="overflow-hidden p-0">
          {isLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`space-row-skeleton-${index}`}
                  className="h-10 animate-pulse rounded bg-white/5"
                />
              ))}
            </div>
          ) : allSpaces.length === 0 ? (
            <div className="text-muted p-6 text-center text-sm">
              No spaces listed for this venue.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] text-[#777]">
                    <th className="px-5 py-3 font-medium">Space Name</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">
                      <span className="inline-flex items-center gap-1">
                        Total Bookings
                        <ArrowUpDown className="size-3" />
                      </span>
                    </th>
                    <th className="px-5 py-3 font-medium">Ratings</th>
                    <th className="px-5 py-3 font-medium">
                      <span className="inline-flex items-center gap-1">
                        Utilization %
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
                  {allSpaces.map((space) => (
                    <tr
                      key={space.name}
                      className="border-b border-white/5 text-[12px] text-white last:border-0"
                    >
                      <td className="px-5 py-3.5 font-medium">{space.name}</td>
                      <td className="px-5 py-3.5 text-[#999]">{space.category}</td>
                      <td className="px-5 py-3.5 text-[#999]">{space.bookings}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1">
                          <Star className="fill-brand-accent text-brand-accent size-3" />
                          {space.rating}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-black">
                            <div
                              className="bg-brand-accent h-full rounded-full"
                              style={{ width: `${space.utilization}%` }}
                            />
                          </div>
                          <span className="text-[#999]">{space.utilization}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#999]">{space.revenue}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={space.status} />
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
