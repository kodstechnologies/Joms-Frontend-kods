import { ArrowUpDown, Star } from 'lucide-react'

import { ALL_SPACES, SPACE_ANALYSIS } from '../../mock/venue-profile-analytics.mock'
import { AnalyticsCard, MetricCard, SectionTitle, StatusBadge } from './analytics-ui'

export function SpacesTab() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <SectionTitle title="Space Analysis" subtitle="Learn more about Space's performance" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SPACE_ANALYSIS.map((item) => (
            <MetricCard key={item.label} label={item.label} value={item.value} trend={item.trend} />
          ))}
        </div>
      </div>

      <div>
        <SectionTitle title="All Spaces" subtitle="Sortable view of all venue spaces" />
        <AnalyticsCard className="overflow-hidden p-0">
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
                {ALL_SPACES.map((space) => (
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
        </AnalyticsCard>
      </div>
    </div>
  )
}
