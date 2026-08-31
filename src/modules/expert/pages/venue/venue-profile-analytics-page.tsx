import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { ArrowLeft, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'

import { useVenueFullView } from '../../hooks/use-venues'
import { useVenueProfileAnalytics } from '../../hooks/use-venue-analytics'
import {
  DEFAULT_VENUE_PROFILE_ANALYTICS_METRIC_IDS,
  VENUE_PROFILE_ANALYTICS_LEGACY_METRIC_ID_MAP,
  VENUE_PROFILE_ANALYTICS_METRIC_ID_SET,
  VENUE_PROFILE_ANALYTICS_METRIC_IDS,
  VENUE_PROFILE_ANALYTICS_MODULE_KEY,
} from '../../config/venue-profile-analytics-metrics.config'
import { orderByActiveMetricIds, useActiveMetricIds } from '../../hooks/use-active-metric-ids'
import { buildVenueProfileAnalyticsMetricCards } from '../../utils/venue-profile-analytics-metrics'
import { exportVenueProfileAnalyticsToExcel } from '../../utils/export-venue-profile-analytics'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import {
  BookingsTab,
  MetricCard,
  OverviewTab,
  RevenueTab,
  SectionTitle,
  SpacesTab,
  VenueAnalyticsMetricIcon,
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

  // Fetch real-time venue profile analytics from venue-service (port 8005)
  const analyticsQuery = useVenueProfileAnalytics(venueId)
  const analyticsData = analyticsQuery.data
  const activeMetricIds = useActiveMetricIds(VENUE_PROFILE_ANALYTICS_MODULE_KEY, [
    ...DEFAULT_VENUE_PROFILE_ANALYTICS_METRIC_IDS,
  ])

  const filteredActiveMetricIds = useMemo(
    () =>
      sortIdsByCatalogOrder(
        [
          ...new Set(
            activeMetricIds
              .map((metricId) => VENUE_PROFILE_ANALYTICS_LEGACY_METRIC_ID_MAP[metricId] ?? metricId)
              .filter((metricId) => VENUE_PROFILE_ANALYTICS_METRIC_ID_SET.has(metricId)),
          ),
        ],
        VENUE_PROFILE_ANALYTICS_METRIC_IDS,
      ),
    [activeMetricIds],
  )

  const venueAnalyticsCards = useMemo(() => {
    const venueAnalytics = data?.data?.profile as
      ({ analytics?: Record<string, unknown> } & Record<string, unknown>) | undefined
    const allCards = buildVenueProfileAnalyticsMetricCards(
      analyticsData,
      venueAnalytics?.analytics ?? null,
    )
    return orderByActiveMetricIds(allCards, filteredActiveMetricIds)
  }, [analyticsData, data, filteredActiveMetricIds])

  const manageMetricsPath = venueId
    ? `/metrics/venue-profile-analytics?returnTo=${encodeURIComponent(`/venues/management/profile/${venueId}/analytics`)}`
    : '/metrics/venue-profile-analytics'

  const venueName = data?.data?.overview.venue.name ?? 'Venue'

  const handleExportData = useCallback(async () => {
    if (analyticsQuery.isLoading) {
      toast.message('Please wait for analytics to load')
      return
    }

    try {
      await exportVenueProfileAnalyticsToExcel({
        venueName,
        venueId,
        metricCards: venueAnalyticsCards,
        analytics: analyticsData,
      })
      toast.success('Export downloaded')
    } catch (error) {
      if (error instanceof Error && error.message === 'NO_RECORDS') {
        toast.error('No analytics data available to export')
        return
      }
      toast.error('Failed to export analytics data')
    }
  }, [analyticsData, analyticsQuery.isLoading, venueAnalyticsCards, venueId, venueName])

  return (
    <div className="mx-auto flex max-w-[1120px] flex-col gap-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() =>
              navigateBackOrFallback(navigate, `/venues/management/profile/${venueId}`)
            }
            className="group font-heading hover:text-brand-accent flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>Profile Analytics</span>
          </button>
          <div className="text-body-sm-medium text-muted mt-2 flex items-center gap-1.5 pl-7">
            <span>{venueName}</span>
            <span className="text-[#333333]">/</span>
            <span className="font-bold text-white">Profile Analytics</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            className="ui-manage-metrics ui-cta ui-cta-primary h-9"
            onClick={() => navigate(manageMetricsPath)}
          >
            <ManageMetricsIcon className="size-4 shrink-0" />
            Manage Metrics
          </Button>
          <Button className="ui-export-data h-9" onClick={handleExportData}>
            <Upload className="size-4" />
            Export Data
          </Button>
        </div>
      </header>

      <div>
        <SectionTitle title="Venue Analytics" subtitle="Event and engagement metrics" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {analyticsQuery.isLoading
            ? Array.from({ length: filteredActiveMetricIds.length || 8 }).map((_, index) => (
                <div
                  key={`venue-analytics-skeleton-${index}`}
                  className="rounded-lg bg-[#111111] p-4"
                >
                  <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
                  <div className="mt-3 h-7 w-16 animate-pulse rounded bg-white/10" />
                </div>
              ))
            : venueAnalyticsCards.map((item) => (
                <MetricCard
                  key={item.id}
                  label={item.label}
                  value={item.value}
                  icon={<VenueAnalyticsMetricIcon />}
                />
              ))}
        </div>
      </div>

      <nav className="flex w-full gap-1 rounded-lg border border-white/5 bg-[#111111] p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 rounded-lg px-4 py-2 text-[12px] font-semibold whitespace-nowrap transition-colors',
              activeTab === tab.key ? 'bg-black text-white' : 'text-[#777] hover:text-white',
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'overview' && (
        <OverviewTab data={analyticsData?.overview} isLoading={analyticsQuery.isLoading} />
      )}
      {activeTab === 'spaces' && (
        <SpacesTab data={analyticsData?.spaces} isLoading={analyticsQuery.isLoading} />
      )}
      {activeTab === 'bookings' && (
        <BookingsTab data={analyticsData?.bookings} isLoading={analyticsQuery.isLoading} />
      )}
      {activeTab === 'revenue' && (
        <RevenueTab data={analyticsData?.revenue} isLoading={analyticsQuery.isLoading} />
      )}
      {activeTab === 'visual' && (
        <VisualAnalyticsTab
          data={analyticsData?.visual}
          revenueTrend={analyticsData?.revenue?.revenueTrend}
          isLoading={analyticsQuery.isLoading}
          onRefresh={() => {
            analyticsQuery.refetch()
            toast.message('Refreshing analytics trends...')
          }}
        />
      )}
    </div>
  )
}
