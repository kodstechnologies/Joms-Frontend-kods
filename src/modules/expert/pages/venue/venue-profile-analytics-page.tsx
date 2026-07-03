import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, SlidersHorizontal, Upload } from 'lucide-react'

import { useVenueFullView } from '../../hooks/use-venues'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import {
  BookingsTab,
  OverviewTab,
  RevenueTab,
  SpacesTab,
  VisualAnalyticsTab,
} from '../../components/venue-analytics'

type AnalyticsTabKey = 'overview' | 'spaces' | 'bookings' | 'revenue' | 'visual'

const TABS: { key: AnalyticsTabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'spaces', label: 'Spaces' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'visual', label: 'Visual Analytics' },
]

export function VenueProfileAnalyticsPage() {
  const navigate = useNavigate()
  const { venueId } = useParams<{ venueId: string }>()
  const { data } = useVenueFullView(venueId ?? '')
  const [activeTab, setActiveTab] = useState<AnalyticsTabKey>('overview')

  const venueName = data?.data?.overview.venue.name ?? 'Venue'

  return (
    <div className="mx-auto flex max-w-[1120px] flex-col gap-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(`/venues/management/profile/${venueId}`)}
            className="group flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>Profile Analytics</span>
          </button>
          <div className="mt-2 flex items-center gap-1.5 pl-7 text-[12px] font-medium text-[#777777]">
            <span>{venueName}</span>
            <span className="text-[#333333]">/</span>
            <span className="font-bold text-white">Profile Analytics</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            className="h-9 bg-[#FBC078] text-black hover:bg-[#eeb46a]"
            onClick={() => navigate('/venues/dashboard/metrics')}
          >
            <SlidersHorizontal className="size-4" />
            Manage Metrics
          </Button>
          <Button className="h-9 bg-[#FBC078] text-black hover:bg-[#eeb46a]">
            <Upload className="size-4" />
            Export Data
          </Button>
        </div>
      </header>

      <nav className="flex flex-wrap gap-1 rounded-lg border border-white/5 bg-[#111111] p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'rounded-md px-4 py-2 text-[12px] font-semibold transition-colors',
              activeTab === tab.key
                ? 'bg-black text-white'
                : 'text-[#777] hover:text-white',
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'spaces' && <SpacesTab />}
      {activeTab === 'bookings' && <BookingsTab />}
      {activeTab === 'revenue' && <RevenueTab />}
      {activeTab === 'visual' && <VisualAnalyticsTab />}
    </div>
  )
}
