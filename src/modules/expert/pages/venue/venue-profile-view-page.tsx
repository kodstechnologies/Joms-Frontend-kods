import { useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Briefcase,
  Building2,
  ChevronRight,
  FileText,
  Gauge,
  ImageOff,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  Share2,
  SlidersHorizontal,
  Star,
  Tag,
  Upload,
  Users,
} from 'lucide-react'

import { useVenueFullView } from '../../hooks/use-venues'
import type { VenueFullView, VenueFullViewSpaceSummary } from '../../type/venue-full-view'
import { cn } from '@/shared/lib/cn'

type TabKey = 'overview' | 'spaces' | 'analytics' | 'health'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'spaces', label: 'Spaces Listing' },
  { key: 'analytics', label: 'Venue Analytics' },
  { key: 'health', label: 'Profile Health' },
]

const getApiErrorMessage = (error: unknown) => {
  const err = error as { response?: { data?: { message?: string } } }
  return err?.response?.data?.message || 'Unable to load venue profile.'
}

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return '—'
  return `₹${value.toLocaleString('en-IN')}`
}

const comingSoon = (label: string) => toast.message(`${label} is coming soon`)

function SafeImage({
  src,
  alt,
  className,
  fallback,
}: {
  src?: string | null
  alt: string
  className?: string
  fallback: ReactNode
}) {
  const [errored, setErrored] = useState(false)

  if (!src || errored) {
    return <>{fallback}</>
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  )
}

function SidebarRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-body-sm text-muted">{label}</span>
      <span className="text-body-sm font-semibold text-white">{children}</span>
    </div>
  )
}

const formatVenueKycStatusLabel = (status?: string | null) => {
  const normalized = (status || '').toLowerCase()
  if (!normalized) return 'KYC Pending'
  if (normalized === 'approved') return 'KYC Verified'
  if (normalized === 'live') return 'Live'
  if (normalized === 'in_review' || normalized === 'pending') return 'KYC Pending'
  if (normalized === 'rejected') return 'Rejected'
  if (normalized === 'suspended') return 'Suspended'
  if (normalized === 'draft') return 'Draft'
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).replace(/_/g, ' ')
}

const getVenueKycStatusTone = (status?: string | null) => {
  const normalized = (status || '').toLowerCase()
  if (normalized === 'approved' || normalized === 'live') {
    return 'bg-brand-positive/15 text-brand-positive'
  }
  if (normalized === 'rejected' || normalized === 'suspended') {
    return 'bg-brand-danger/15 text-red-400'
  }
  return 'bg-amber-500/15 text-amber-300'
}

function ProfileSidebar({ data }: { data: VenueFullView }) {
  const profile = data.profile ?? {
    venueType: null,
    clientSatisfaction: null,
    ratings: null,
    totalBookings: null,
    yearsInOperation: null,
    totalEarnings: null,
    primaryCity: null,
    kycId: null,
    kycStatus: null,
  }
  const overview = data.overview
  const venueStatus = overview?.venue?.status
  const kycStatusLabel = formatVenueKycStatusLabel(venueStatus)
  const kycStatusTone = getVenueKycStatusTone(venueStatus)

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-brand-bg rounded-xl p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-white">
            Organisation Profile &amp; Account
          </h3>
          <span className={cn('rounded-md px-2.5 py-1 text-[10px] font-bold', kycStatusTone)}>
            {kycStatusLabel}
          </span>
        </div>

        <SidebarRow label="Venue Type">{profile.venueType || '—'}</SidebarRow>
        <SidebarRow label="Client Satisfaction">
          {profile.clientSatisfaction !== null ? `${profile.clientSatisfaction}%` : '—'}
        </SidebarRow>
        <SidebarRow label="Ratings">
          <span className="inline-flex items-center gap-1">
            <Star className="fill-brand-accent text-brand-accent size-3.5" />
            {profile.ratings ?? '—'}
          </span>
        </SidebarRow>
        <SidebarRow label="Total Bookings">{profile.totalBookings ?? '—'}</SidebarRow>
        <SidebarRow label="Years in Operation">
          {profile.yearsInOperation ? `${profile.yearsInOperation.years} Years` : '—'}
        </SidebarRow>
        <SidebarRow label="Total Earnings">{formatCurrency(profile.totalEarnings)}</SidebarRow>
        <SidebarRow label="Primary City">{profile.primaryCity || '—'}</SidebarRow>
        <SidebarRow label="KYC">
          <button
            type="button"
            onClick={() => comingSoon('KYC Document')}
            className="bg-brand-accent text-brand-text-dark hover:bg-brand-gold-from text-body-sm rounded-md px-3 py-1 font-bold transition-colors"
          >
            View
          </button>
        </SidebarRow>
        <SidebarRow label="Timelines">
          <button
            type="button"
            onClick={() => comingSoon('Timelines')}
            className="bg-brand-accent text-brand-text-dark hover:bg-brand-gold-from text-body-sm rounded-md px-3 py-1 font-bold transition-colors"
          >
            Check Timelines
          </button>
        </SidebarRow>
      </div>

      <div className="bg-brand-bg rounded-xl p-5">
        <h3 className="mb-4 text-[13px] font-semibold text-white">Support &amp; Admin</h3>
        <div className="rounded-lg bg-black p-3">
          <p className="text-muted text-[10px]">Active Tickets</p>
          <p className="text-body-sm mt-1 font-medium text-white">None</p>
        </div>
        <div className="mt-3 rounded-lg bg-black p-3">
          <p className="text-muted text-[10px]">Admin notes</p>
          <p className="text-body-sm mt-1 font-medium text-white">
            {overview?.venue?.adminInternalNotes || 'None'}
          </p>
        </div>
      </div>
    </div>
  )
}

function OverviewTab({ data }: { data: VenueFullView }) {
  const { venue, gallery } = data.overview
  const location = venue.location
  const poc = gallery?.contact?.contacts?.[0]

  const galleryImages = gallery?.galleryImages?.map((image) => image.url) ?? venue.venueImages ?? []

  const addressLine = [
    location?.address,
    location?.landmark,
    location?.city,
    location?.state,
    location?.pincode,
    location?.country,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="bg-brand-bg space-y-6 rounded-xl p-6">
      <div>
        <h3 className="text-[13px] font-semibold text-white">Address</h3>
        <p className="mt-2 text-[13px] font-medium text-white">{venue.name}</p>
        <p className="text-body-sm text-muted mt-1">{addressLine || '—'}</p>
      </div>

      <div>
        <h3 className="text-[13px] font-semibold text-white">POC details</h3>
        <p className="mt-2 text-[13px] font-medium text-white">
          {poc?.name || venue.pocName || '—'}
        </p>
        <p className="text-body-sm text-muted mt-1">
          {poc?.phone || venue.pocContactNumber || '—'}
        </p>
        {poc?.email && <p className="text-body-sm text-muted mt-0.5">{poc.email}</p>}
      </div>

      <div>
        <h3 className="mb-3 text-[13px] font-semibold text-white">Gallery</h3>
        {galleryImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {galleryImages.slice(0, 8).map((src, index) => (
              <a
                key={`${src}-${index}`}
                href={src}
                target="_blank"
                rel="noreferrer"
                className="block aspect-[4/3] overflow-hidden rounded-lg"
              >
                <SafeImage
                  src={src}
                  alt={`Gallery ${index + 1}`}
                  className="size-full object-cover"
                  fallback={
                    <div className="text-muted flex size-full items-center justify-center bg-black">
                      <ImageOff className="size-5" />
                    </div>
                  }
                />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-body-sm text-muted">No gallery images uploaded.</p>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center gap-3">
          <h3 className="text-[13px] font-semibold text-white">Reviews &amp; Ratings</h3>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-4">
          {['All Reviews', 'Most Recent', 'Top Reviews'].map((chip, index) => (
            <span
              key={chip}
              className={cn(
                'text-body-sm rounded-md px-3 py-1.5 font-semibold',
                index === 0 ? 'bg-brand-accent text-brand-text-dark' : 'text-muted bg-black',
              )}
            >
              {chip}
            </span>
          ))}
        </div>
        <div className="text-body-sm text-muted mt-4 rounded-lg bg-black p-4">
          {venue.reviewsCount
            ? `${venue.reviewsCount} reviews recorded. Detailed reviews are coming soon.`
            : 'No reviews yet.'}
        </div>
      </div>
    </div>
  )
}

function SpacesTab({ data, venueId }: { data: VenueFullView; venueId: string }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null)

  const spaces = data.spaces.filter((space) =>
    space.spaceName.toLowerCase().includes(search.toLowerCase()),
  )

  const renderCapacity = (capacity: VenueFullViewSpaceSummary['capacity']) => {
    if (capacity === null || capacity === undefined) return '—'
    return typeof capacity === 'number' ? `${capacity}` : capacity
  }

  return (
    <div className="bg-brand-bg rounded-xl p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by service title"
            className="focus:border-brand-accent/50 placeholder:text-muted h-10 w-full rounded-md border border-white/10 bg-black pr-3 pl-11 text-[13px] text-white outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => comingSoon('Advance Filters')}
          className="ui-advance-filters ui-cta ui-cta-outline text-body-sm gap-2 px-4 font-semibold"
        >
          <SlidersHorizontal className="size-4" />
          Advance Filters
        </button>
      </div>

      <label className="text-body-sm text-muted mt-4 flex w-fit items-center gap-2">
        <input
          type="checkbox"
          onChange={() => comingSoon('Bulk selection')}
          className="rounded border-slate-700 bg-transparent"
        />
        Select All
      </label>

      <div className="mt-4 space-y-3">
        {spaces.length === 0 ? (
          <p className="text-body-sm text-muted rounded-lg bg-black p-4">No spaces found.</p>
        ) : (
          spaces.map((space) => (
            <button
              key={space.spaceId}
              type="button"
              onClick={() => {
                setSelectedSpaceId(space.spaceId)
                navigate(`/venues/management/profile/${venueId}/space/${space.spaceId}`)
              }}
              className="hover:border-brand-accent/30 flex w-full items-center rounded-xl bg-black px-5 py-5 transition-colors hover:border"
            >
              <input
                type="checkbox"
                onClick={(e) => e.stopPropagation()}
                className="h-6 w-6 rounded border-white/30 accent-white"
              />

              <div className="ml-3 h-28 w-32 shrink-0 overflow-hidden rounded-xl">
                <SafeImage
                  src={space.coverImage}
                  alt={space.spaceName}
                  className="size-full object-cover"
                  fallback={
                    <div className="text-muted flex size-full items-center justify-center">
                      <MapPin className="size-5" />
                    </div>
                  }
                />
              </div>

              <div className="ml-4 flex flex-1 items-center justify-between">
                <div>
                  <p className="text-body-md font-semibold text-white">{space.spaceName}</p>

                  <p className="text-body-sm text-muted mt-1">
                    {[space.city, space.state].filter(Boolean).join(', ') || '—'}
                  </p>

                  <div className="text-body-sm text-muted mt-2 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <Users className="size-3.5" />
                      {renderCapacity(space.capacity)}
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      21 Sep - 30 Sep
                    </span>
                  </div>

                  <p className="mt-2 text-[15px] font-semibold text-white">
                    {formatCurrency(space.weekdayPrice)}
                  </p>
                </div>

                <ChevronRight
                  className={cn(
                    'ml-auto size-5 shrink-0 transition-colors duration-200',
                    selectedSpaceId === space.spaceId ? 'text-[#AEEBFF]' : 'text-white',
                  )}
                />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

function AnalyticsTab({ data, venueId }: { data: VenueFullView; venueId: string }) {
  const navigate = useNavigate()
  const insights = data?.overview?.venue?.insights ?? {}
  const profile = data?.profile

  const formatMetric = (value?: string | number | null, fallback = '—') => {
    if (value === null || value === undefined || value === '') return fallback
    if (typeof value === 'number') return value.toLocaleString('en-IN')
    return String(value)
  }

  const cards: { label: string; value: string }[] = [
    {
      label: 'Events Hosted',
      value: formatMetric(profile?.totalBookings, '24'),
    },
    {
      label: 'Total Attendees',
      value: formatMetric(insights.listingViews, '1,840+'),
    },
    {
      label: 'Repeat Attendees',
      value: formatMetric(insights.enquiriesCount, '30'),
    },
    {
      label: 'Upcoming Events',
      value: '3',
    },
    {
      label: 'Event Completion Rate',
      value: profile?.clientSatisfaction != null ? `${profile.clientSatisfaction}%` : '100%',
    },
    {
      label: 'Avg. Response Time',
      value: formatMetric(insights.responseTime, '2 Hrs'),
    },
    {
      label: 'No. Of Events Rejected',
      value: '3',
    },
    {
      label: 'No. of event Suspended',
      value: formatMetric(insights.nps, '100%'),
    },
  ]

  return (
    <div className="bg-brand-bg rounded-xl p-6">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => navigate('/venues/dashboard/metrics')}
          className="ui-manage-metrics bg-brand-accent/15 text-brand-accent text-body-sm flex items-center gap-1.5 rounded-lg px-3 py-2 font-semibold"
        >
          <Gauge className="size-3.5" />
          Manage Metrics
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg bg-black p-4">
            <div className="flex items-center justify-between">
              <p className="text-body-sm text-muted">{card.label}</p>
              <div className="bg-brand-surface flex h-8 w-8 items-center justify-center rounded-md">
                <Briefcase className="size-4 text-white" />
              </div>
            </div>
            <p className="mt-3 text-xl font-bold text-white">{card.value}</p>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            if (!venueId) {
              toast.error('Venue ID is missing.')
              return
            }
            navigate(`/venues/management/profile/${venueId}/analytics`)
          }}
          className="text-body-sm flex min-h-[96px] items-center justify-center gap-1.5 rounded-lg bg-black p-4 font-semibold text-white transition-colors hover:bg-white/5"
        >
          More
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

function HealthTab({ data }: { data: VenueFullView }) {
  const score = data.profile?.clientSatisfaction

  return (
    <div className="bg-brand-bg rounded-xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="ml-auto flex flex-wrap items-center gap-4">
          {['All', 'Reported Against', 'Flagged by'].map((chip, index) => (
            <span
              key={chip}
              className={cn(
                'text-body-sm rounded-md px-3 py-1.5 font-semibold',
                index === 0 ? 'bg-brand-accent/15 text-brand-accent' : 'text-muted bg-black',
              )}
            >
              {chip}
            </span>
          ))}
        </div>
        {score !== null && (
          <span className="bg-brand-positive/15 text-body-sm text-brand-positive rounded-md px-3 py-1.5 font-bold">
            Profile Health: {score}%
          </span>
        )}
      </div>

      <div className="text-body-sm text-muted mt-4 rounded-lg bg-black p-6 text-center">
        No reported issues for this venue.
      </div>
    </div>
  )
}

export function VenueProfileViewPage() {
  const navigate = useNavigate()
  const { venueId } = useParams<{ venueId: string }>()
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  const { data, isLoading, isError, error } = useVenueFullView(venueId)
  const fullView = data?.data

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="border-brand-accent size-9 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    )
  }

  if (isError || !fullView || !venueId) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/venues/management')}
          className="group font-heading hover:text-brand-accent text-h3 flex w-fit items-center gap-2 font-bold text-white transition-colors"
        >
          <ArrowLeft className="size-5" />
          <span>Venue Profile View</span>
        </button>
        <div className="bg-brand-danger/10 rounded-lg border border-red-500/40 px-4 py-3 text-sm text-red-400">
          {getApiErrorMessage(error)}
        </div>
      </div>
    )
  }

  const { venue, gallery } = fullView.overview

  const coverImage =
    gallery?.venueCoverImages?.[0]?.url ||
    venue.coverImageUrl ||
    gallery?.galleryImages?.[0]?.url ||
    null

  const avatarImage =
    venue.profileImageUrl ||
    gallery?.spaceCoverImages?.[0]?.url ||
    gallery?.venueCoverImages?.[0]?.url ||
    null

  const headerActions = [
    {
      label: 'Create Space',
      icon: Plus,
      onClick: () => navigate(`/venues/management/create?venueId=${venueId}`),
    },
    { label: 'Add Notes', icon: FileText, onClick: () => comingSoon('Add Notes') },
    { label: 'Add Tags', icon: Tag, onClick: () => comingSoon('Add Tags') },
    { label: 'Export Data', icon: Upload, onClick: () => comingSoon('Export Data') },
    { label: 'Share Profile', icon: Share2, onClick: () => comingSoon('Share Profile') },
  ]

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/venues/management')}
            className="group font-heading hover:text-brand-accent text-h3 flex w-fit items-center gap-2 font-bold tracking-tight text-white transition-colors"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>Venue Profile View</span>
          </button>
          <div className="text-body-sm text-muted flex items-center gap-1.5 pl-7 font-medium">
            <button
              type="button"
              onClick={() => navigateBackOrFallback(navigate, '/venues/management')}
              className="hover:text-brand-text transition-colors"
            >
              Event management
            </button>
            <span className="text-muted">/</span>
            <span className="font-bold text-white">{venue.name}</span>
          </div>
        </div>
        <span className="text-muted p-1">
          <MoreVertical className="size-5" />
        </span>
      </header>

      <div className="bg-brand-bg relative overflow-hidden rounded-xl">
        <div className="bg-brand-surface h-40 w-full">
          <SafeImage
            src={coverImage}
            alt={`${venue.name} cover`}
            className="size-full object-cover"
            fallback={
              <div className="from-brand-surface to-brand-bg text-muted flex size-full items-center justify-center bg-gradient-to-br">
                <ImageOff className="size-6" />
              </div>
            }
          />
        </div>
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-3">
            <div className="border-brand-bg bg-brand-surface -mt-12 size-20 shrink-0 overflow-hidden rounded-full border-4">
              <SafeImage
                src={avatarImage}
                alt={venue.name}
                className="size-full object-cover"
                fallback={
                  <div className="text-muted flex size-full items-center justify-center">
                    <Building2 className="size-7" />
                  </div>
                }
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{venue.name}</h2>
              <p className="text-body-sm text-muted">
                {[venue.location?.city, venue.location?.country].filter(Boolean).join(', ') || '—'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            {headerActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className="bg-brand-accent text-brand-text-dark hover:bg-brand-gold-from text-body-sm flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold transition-colors"
              >
                <action.icon className="size-3.5" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
        <ProfileSidebar data={fullView} />

        <div className="flex flex-col gap-5">
          <div className="bg-brand-bg flex items-center gap-1 overflow-x-auto rounded-xl px-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-1 border-b-2 px-4 py-3 text-[13px] font-semibold whitespace-nowrap transition-colors',
                  activeTab === tab.key
                    ? 'border-brand-accent text-white'
                    : 'text-muted hover:text-brand-text border-transparent',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && <OverviewTab data={fullView} />}
          {activeTab === 'spaces' && <SpacesTab data={fullView} venueId={venueId} />}
          {activeTab === 'analytics' && <AnalyticsTab data={fullView} venueId={venueId ?? ''} />}
          {activeTab === 'health' && <HealthTab data={fullView} />}
        </div>
      </div>
    </div>
  )
}
