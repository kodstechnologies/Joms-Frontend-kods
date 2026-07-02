import { useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Clock,
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
  TrendingUp,
  Users,
} from 'lucide-react'

import { useVenueFullView } from '../../hooks/use-venues'
import type {
  VenueFullView,
  VenueFullViewSpaceSummary,
} from '../../type/venue-full-view'
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

function SidebarRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-3 last:border-0">
      <span className="text-[12px] text-[#999]">{label}</span>
      <span className="text-[13px] font-semibold text-white">{children}</span>
    </div>
  )
}

function ProfileSidebar({
  data,
}: {
  data: VenueFullView
  venueId: string
}) {
  const navigate = useNavigate()
  const { profile, overview } = data
  const kycApproved = (profile.kycStatus || '').toUpperCase() === 'APPROVED'

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-white/5 bg-[#111111] p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-white">
            Organisation Profile &amp; Account
          </h3>
          <span
            className={cn(
              'rounded-md px-2.5 py-1 text-[10px] font-bold',
              kycApproved
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-amber-500/15 text-amber-300',
            )}
          >
            {kycApproved ? 'KYC Verified' : profile.kycStatus || 'KYC Pending'}
          </span>
        </div>

        <SidebarRow label="Venue Type">{profile.venueType || '—'}</SidebarRow>
        <SidebarRow label="Client Satisfaction">
          {profile.clientSatisfaction !== null
            ? `${profile.clientSatisfaction}%`
            : '—'}
        </SidebarRow>
        <SidebarRow label="Ratings">
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5 fill-[#FBC078] text-[#FBC078]" />
            {profile.ratings ?? '—'}
          </span>
        </SidebarRow>
        <SidebarRow label="Total Bookings">
          {profile.totalBookings ?? '—'}
        </SidebarRow>
        <SidebarRow label="Years in Operation">
          {profile.yearsInOperation
            ? `${profile.yearsInOperation.years} Years`
            : '—'}
        </SidebarRow>
        <SidebarRow label="Total Earnings">
          {formatCurrency(profile.totalEarnings)}
        </SidebarRow>
        <SidebarRow label="Primary City">
          {profile.primaryCity || '—'}
        </SidebarRow>
        <SidebarRow label="KYC">
          <button
            type="button"
            onClick={() => {
              if (!profile.kycId) {
                toast.error('No KYC record linked to this venue.')
                return
              }
              navigate(`/venues/management/application/${profile.kycId}`)
            }}
            className="rounded-md bg-[#FBC078]/15 px-3 py-1 text-[11px] font-bold text-[#FBC078] transition-colors hover:bg-[#FBC078]/25"
          >
            View
          </button>
        </SidebarRow>
        <SidebarRow label="Timelines">
          <button
            type="button"
            onClick={() => comingSoon('Timelines')}
            className="rounded-md bg-[#FBC078]/15 px-3 py-1 text-[11px] font-bold text-[#FBC078] transition-colors hover:bg-[#FBC078]/25"
          >
            Check Timelines
          </button>
        </SidebarRow>
      </div>

      <div className="rounded-xl border border-white/5 bg-[#111111] p-5">
        <h3 className="mb-4 text-[13px] font-semibold text-white">
          Support &amp; Admin
        </h3>
        <div className="rounded-lg border border-white/5 bg-black p-3">
          <p className="text-[10px] text-[#777]">Active Tickets</p>
          <p className="mt-1 text-[12px] font-medium text-white">None</p>
        </div>
        <div className="mt-3 rounded-lg border border-white/5 bg-black p-3">
          <p className="text-[10px] text-[#777]">Admin notes</p>
          <p className="mt-1 text-[12px] font-medium text-white">
            {overview.venue.adminInternalNotes || 'None'}
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

  const galleryImages =
    gallery?.galleryImages?.map((image) => image.url) ??
    venue.venueImages ??
    []

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
    <div className="space-y-6 rounded-xl border border-white/5 bg-[#111111] p-6">
      <div>
        <h3 className="text-[13px] font-semibold text-white">Address</h3>
        <p className="mt-2 text-[13px] font-medium text-white">{venue.name}</p>
        <p className="mt-1 text-[12px] text-[#999]">{addressLine || '—'}</p>
      </div>

      <div>
        <h3 className="text-[13px] font-semibold text-white">POC details</h3>
        <p className="mt-2 text-[13px] font-medium text-white">
          {poc?.name || venue.pocName || '—'}
        </p>
        <p className="mt-1 text-[12px] text-[#999]">
          {poc?.phone || venue.pocContactNumber || '—'}
        </p>
        {poc?.email && (
          <p className="mt-0.5 text-[12px] text-[#999]">{poc.email}</p>
        )}
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
                className="block aspect-[4/3] overflow-hidden rounded-lg border border-white/5"
              >
                <SafeImage
                  src={src}
                  alt={`Gallery ${index + 1}`}
                  className="size-full object-cover"
                  fallback={
                    <div className="flex size-full items-center justify-center bg-black text-[#555]">
                      <ImageOff className="size-5" />
                    </div>
                  }
                />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-[#777]">No gallery images uploaded.</p>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center gap-3">
          <h3 className="text-[13px] font-semibold text-white">
            Reviews &amp; Ratings
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {['All Reviews', 'Most Recent', 'Top Reviews'].map((chip, index) => (
            <span
              key={chip}
              className={cn(
                'rounded-md px-3 py-1.5 text-[11px] font-semibold',
                index === 0
                  ? 'bg-[#FBC078]/15 text-[#FBC078]'
                  : 'bg-black text-[#999]',
              )}
            >
              {chip}
            </span>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-white/5 bg-black p-4 text-[12px] text-[#777]">
          {venue.reviewsCount
            ? `${venue.reviewsCount} reviews recorded. Detailed reviews are coming soon.`
            : 'No reviews yet.'}
        </div>
      </div>
    </div>
  )
}

function SpacesTab({
  data,
  venueId,
}: {
  data: VenueFullView
  venueId: string
}) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const spaces = data.spaces.filter((space) =>
    space.spaceName.toLowerCase().includes(search.toLowerCase()),
  )

  const renderCapacity = (capacity: VenueFullViewSpaceSummary['capacity']) => {
    if (capacity === null || capacity === undefined) return '—'
    return typeof capacity === 'number' ? `${capacity}` : capacity
  }

  return (
    <div className="rounded-xl border border-white/5 bg-[#111111] p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#666]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by service title"
            className="h-10 w-full rounded-md border border-white/10 bg-black pl-9 pr-3 text-[13px] text-white outline-none placeholder:text-[#666] focus:border-[#FBC078]/50"
          />
        </div>
        <button
          type="button"
          onClick={() => comingSoon('Advance Filters')}
          className="flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-black px-4 text-[12px] font-semibold text-white transition-colors hover:bg-white/5"
        >
          <SlidersHorizontal className="size-4" />
          Advance Filters
        </button>
      </div>

      <label className="mt-4 flex w-fit items-center gap-2 text-[12px] text-[#999]">
        <input
          type="checkbox"
          onChange={() => comingSoon('Bulk selection')}
          className="rounded border-slate-700 bg-transparent"
        />
        Select All
      </label>

      <div className="mt-4 space-y-3">
        {spaces.length === 0 ? (
          <p className="rounded-lg border border-white/5 bg-black p-4 text-[12px] text-[#777]">
            No spaces found.
          </p>
        ) : (
          spaces.map((space) => (
            <button
              key={space.spaceId}
              type="button"
              onClick={() =>
                navigate(
                  `/venues/management/profile/${venueId}/space/${space.spaceId}`,
                )
              }
              className="flex w-full items-center gap-4 rounded-lg border border-white/5 bg-black p-3 text-left transition-colors hover:border-[#FBC078]/30"
            >
              <div className="size-16 shrink-0 overflow-hidden rounded-md bg-[#1a1a1a]">
                <SafeImage
                  src={space.coverImage}
                  alt={space.spaceName}
                  className="size-full object-cover"
                  fallback={
                    <div className="flex size-full items-center justify-center text-[#555]">
                      <MapPin className="size-5" />
                    </div>
                  }
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-white">
                  {space.spaceName}
                </p>
                <p className="mt-0.5 text-[11px] text-[#999]">
                  {[space.city, space.state].filter(Boolean).join(', ') || '—'}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-[#bbb]">
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3.5 text-[#777]" />
                    {renderCapacity(space.capacity)}
                  </span>
                  <span className="font-semibold text-white">
                    {formatCurrency(space.weekdayPrice)}
                  </span>
                </div>
              </div>
              <ChevronRight className="size-5 shrink-0 text-[#666]" />
            </button>
          ))
        )}
      </div>
    </div>
  )
}

function AnalyticsTab({ data }: { data: VenueFullView }) {
  const insights = data.overview.venue.insights ?? {}

  const cards: { label: string; value: string; icon: ReactNode }[] = [
    {
      label: 'Average Response Time',
      value: insights.responseTime || '—',
      icon: <Clock className="size-4 text-[#FBC078]" />,
    },
    {
      label: 'Delivery Speed',
      value: insights.speed || '—',
      icon: <Gauge className="size-4 text-[#FBC078]" />,
    },
    {
      label: 'NPS Score',
      value: insights.nps !== undefined ? `${insights.nps}` : '—',
      icon: <TrendingUp className="size-4 text-[#FBC078]" />,
    },
    {
      label: 'Listing Views',
      value:
        insights.listingViews !== undefined
          ? insights.listingViews.toLocaleString('en-IN')
          : '—',
      icon: <TrendingUp className="size-4 text-[#FBC078]" />,
    },
    {
      label: 'Enquiries',
      value:
        insights.enquiriesCount !== undefined
          ? insights.enquiriesCount.toLocaleString('en-IN')
          : '—',
      icon: <Users className="size-4 text-[#FBC078]" />,
    },
  ]

  return (
    <div className="rounded-xl border border-white/5 bg-[#111111] p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-white/5 bg-black p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-[#999]">{card.label}</p>
              {card.icon}
            </div>
            <p className="mt-3 text-xl font-bold text-white">{card.value}</p>
          </div>
        ))}
        <button
          type="button"
          onClick={() => comingSoon('Detailed analytics')}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-white/5 bg-black p-4 text-[12px] font-semibold text-white transition-colors hover:bg-white/5"
        >
          More
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

function HealthTab({ data }: { data: VenueFullView }) {
  const score = data.profile.clientSatisfaction

  return (
    <div className="rounded-xl border border-white/5 bg-[#111111] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {['All', 'Reported Against', 'Flagged by'].map((chip, index) => (
            <span
              key={chip}
              className={cn(
                'rounded-md px-3 py-1.5 text-[11px] font-semibold',
                index === 0
                  ? 'bg-[#FBC078]/15 text-[#FBC078]'
                  : 'bg-black text-[#999]',
              )}
            >
              {chip}
            </span>
          ))}
        </div>
        {score !== null && (
          <span className="rounded-md bg-emerald-500/15 px-3 py-1.5 text-[11px] font-bold text-emerald-400">
            Profile Health: {score}%
          </span>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-white/5 bg-black p-6 text-center text-[12px] text-[#777]">
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
        <div className="size-9 animate-spin rounded-full border-4 border-[#FBC078] border-t-transparent" />
      </div>
    )
  }

  if (isError || !fullView || !venueId) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/venues/management')}
          className="group flex w-fit items-center gap-2 text-[20px] font-bold text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5" />
          <span>Venue Profile View</span>
        </button>
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
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
    { label: 'Create Space', icon: Plus, onClick: () => navigate(`/venues/management/create?venueId=${venueId}`) },
    { label: 'Add Notes', icon: FileText, onClick: () => comingSoon('Add Notes') },
    { label: 'Add Tags', icon: Tag, onClick: () => comingSoon('Add Tags') },
    { label: 'Export Data', icon: FileText, onClick: () => comingSoon('Export Data') },
    { label: 'Share Profile', icon: Share2, onClick: () => comingSoon('Share Profile') },
  ]

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => navigate('/venues/management')}
            className="group flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>Venue Profile View</span>
          </button>
          <div className="flex items-center gap-1.5 pl-7 text-[12px] font-medium text-[#777777]">
            <button
              type="button"
              onClick={() => navigate('/venues/management')}
              className="transition-colors hover:text-white"
            >
              Event management
            </button>
            <span className="text-[#333333]">/</span>
            <span className="font-bold text-white">{venue.name}</span>
          </div>
        </div>
        <span className="p-1 text-[#777]">
          <MoreVertical className="size-5" />
        </span>
      </header>

      <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#111111]">
        <div className="h-40 w-full bg-[#1a1a1a]">
          <SafeImage
            src={coverImage}
            alt={`${venue.name} cover`}
            className="size-full object-cover"
            fallback={
              <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#111111] text-[#555]">
                <ImageOff className="size-6" />
              </div>
            }
          />
        </div>
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-3">
            <div className="-mt-12 size-20 shrink-0 overflow-hidden rounded-full border-4 border-[#111111] bg-[#1a1a1a]">
              <SafeImage
                src={avatarImage}
                alt={venue.name}
                className="size-full object-cover"
                fallback={
                  <div className="flex size-full items-center justify-center text-[#555]">
                    <Building2 className="size-7" />
                  </div>
                }
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{venue.name}</h2>
              <p className="text-[12px] text-[#999]">
                {[venue.location?.city, venue.location?.country]
                  .filter(Boolean)
                  .join(', ') || '—'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {headerActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className="flex items-center gap-1.5 rounded-full bg-[#FBC078]/15 px-3 py-1.5 text-[11px] font-semibold text-[#FBC078] transition-colors hover:bg-[#FBC078]/25"
              >
                <action.icon className="size-3.5" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
        <ProfileSidebar data={fullView} venueId={venueId} />

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-white/5 bg-[#111111] p-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-colors',
                  activeTab === tab.key
                    ? 'bg-[#FBC078]/10 text-[#FBC078]'
                    : 'text-[#888] hover:text-white',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && <OverviewTab data={fullView} />}
          {activeTab === 'spaces' && (
            <SpacesTab data={fullView} venueId={venueId} />
          )}
          {activeTab === 'analytics' && <AnalyticsTab data={fullView} />}
          {activeTab === 'health' && <HealthTab data={fullView} />}
        </div>
      </div>
    </div>
  )
}
