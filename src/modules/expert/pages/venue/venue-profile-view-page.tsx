import { useCallback, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  AlertOctagon,
  ArrowLeft,
  Ban,
  Briefcase,
  Building2,
  ChevronRight,
  CircleMinus,
  Eye,
  FilePlus2,
  FileText,
  Gauge,
  ImageOff,
  MapPin,
  Pencil,
  Plus,
  Search,
  Share2,
  SlidersHorizontal,
  Star,
  Tag,
  Trash2,
  Upload,
  Users,
} from 'lucide-react'

import {
  useDeleteVenue,
  useSetVenueOwnerPassword,
  useSuspendVenue,
  useVenueFullView,
} from '../../hooks/use-venues'
import type { VenueFullView, VenueFullViewSpaceSummary } from '../../type/venue-full-view'
import { DecisionActionModal } from '@/shared/components/modal/decision-action-modal'
import { UpdatePasswordModal } from '@/modules/rbac/components/update-password-modal'
import { MODERATION_CATEGORY_SLUGS } from '@/modules/settings/api/templates-api'
import {
  useModerationReasonOptions,
  useRecordModerationReasonUsage,
} from '@/modules/settings/hooks/use-templates'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { cn } from '@/shared/lib/cn'

type TabKey = 'overview' | 'spaces' | 'analytics' | 'health'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'spaces', label: 'Spaces Listing' },
  { key: 'analytics', label: 'Venue Analytics' },
  { key: 'health', label: 'Profile Health' },
]

const PROFILE_BTN_PRIMARY =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] px-3 py-1.5 text-[12px] font-semibold text-[#050505] transition-[filter] hover:brightness-95'

const PROFILE_HEADER_BTN =
  'inline-flex h-[25px] items-center justify-center gap-1.5 rounded-[12px] bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] px-3 text-[11px] leading-none font-semibold whitespace-nowrap text-[#050505] transition-[filter] hover:brightness-95'

const PROFILE_CARD = 'rounded-xl bg-[#141414]'

const PROFILE_ACTIVE_PILL = 'bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] text-[#050505]'

const PROFILE_IDLE_PILL = 'border border-[#FFFFFF33] bg-[#050505] text-white hover:bg-white/5'

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
      <span className="max-w-[58%] text-right text-[13px] font-semibold text-white">
        {children}
      </span>
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
    return 'bg-[rgb(0_166_62_/_30%)] text-[#00A63E]'
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
      <div className={cn(PROFILE_CARD, 'p-5')}>
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
            <Star className="size-3.5 fill-[#E0A263] text-[#E0A263]" />
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
            className={PROFILE_BTN_PRIMARY}
          >
            View
          </button>
        </SidebarRow>
        <SidebarRow label="Timelines">
          <button
            type="button"
            onClick={() => comingSoon('Timelines')}
            className={PROFILE_BTN_PRIMARY}
          >
            Check Timelines
          </button>
        </SidebarRow>
      </div>

      <div className={cn(PROFILE_CARD, 'p-5')}>
        <h3 className="mb-4 text-[13px] font-semibold text-white">Support &amp; Admin</h3>
        <div className="rounded-lg bg-[#050505] p-3">
          <p className="text-muted text-[10px]">Active Tickets</p>
          <p className="text-body-sm mt-1 font-medium text-white">None</p>
        </div>
        <div className="mt-3 rounded-lg bg-[#050505] p-3">
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
  const [reviewFilter, setReviewFilter] = useState('all')

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
    <div className={cn(PROFILE_CARD, 'space-y-6 p-6')}>
      <div>
        <h3 className="text-body-md mb-3 font-semibold text-white">Address</h3>
        <p className="text-[13px] font-medium text-white">{venue.name}</p>
        <p className="text-body-sm mt-1 text-white/50">{addressLine || '—'}</p>
      </div>

      <div>
        <h3 className="text-body-md mb-3 font-semibold text-white">POC details</h3>
        <p className="text-[13px] font-medium text-white">{poc?.name || venue.pocName || '—'}</p>
        <p className="text-body-sm mt-1 text-white/50">
          {poc?.phone || venue.pocContactNumber || '—'}
        </p>
        {poc?.email && <p className="text-body-sm mt-0.5 text-white/50">{poc.email}</p>}
      </div>

      <div>
        <h3 className="text-body-md mb-4 font-semibold text-white">Gallery</h3>
        {galleryImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {galleryImages.slice(0, 8).map((src, index) => (
              <a
                key={`${src}-${index}`}
                href={src}
                target="_blank"
                rel="noreferrer"
                className="block aspect-[4/3] overflow-hidden rounded-lg bg-[#050505]"
              >
                <SafeImage
                  src={src}
                  alt={`Gallery ${index + 1}`}
                  className="size-full object-cover"
                  fallback={
                    <div className="text-muted flex size-full items-center justify-center">
                      <ImageOff className="size-5" />
                    </div>
                  }
                />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-body-sm text-white/50">No gallery images uploaded.</p>
        )}
      </div>

      <div>
        <h3 className="text-body-md mb-4 font-semibold text-white">Reviews &amp; Ratings</h3>
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Reviews' },
            { key: 'recent', label: 'Most Recent' },
            { key: 'top', label: 'Top Reviews' },
          ].map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setReviewFilter(filter.key)}
              className={cn(
                'text-body-sm rounded-lg px-3 py-1.5 font-semibold transition-colors',
                reviewFilter === filter.key ? PROFILE_ACTIVE_PILL : PROFILE_IDLE_PILL,
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="text-body-sm rounded-lg bg-[#050505] p-4 text-white/50">
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
    <div className={cn(PROFILE_CARD, 'p-6')}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by service title"
            className="placeholder:text-muted h-10 w-full rounded-md border border-white/10 bg-[#050505] pr-3 pl-11 text-[13px] text-white outline-none focus:border-[#E0A263]/50"
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
          <p className="text-body-sm rounded-lg bg-[#050505] p-4 text-white/50">No spaces found.</p>
        ) : (
          spaces.map((space) => (
            <button
              key={space.spaceId}
              type="button"
              onClick={() => {
                setSelectedSpaceId(space.spaceId)
                navigate(`/venues/management/profile/${venueId}/space/${space.spaceId}`)
              }}
              className="flex w-full items-center rounded-xl bg-[#050505] px-5 py-5 transition-colors hover:border hover:border-[#E0A263]/30"
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

                  <p className="text-body-sm mt-1 text-white/50">
                    {[space.city, space.state].filter(Boolean).join(', ') || '—'}
                  </p>

                  <div className="text-body-sm mt-2 flex items-center gap-3 text-white/50">
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
    <div className={cn(PROFILE_CARD, 'p-6')}>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => navigate('/venues/dashboard/metrics')}
          className="ui-manage-metrics text-body-sm flex items-center gap-1.5 rounded-lg bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] px-3 py-2 font-semibold text-[#050505]"
        >
          <Gauge className="size-3.5" />
          Manage Metrics
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg bg-[#050505] p-4">
            <div className="flex items-center justify-between">
              <p className="text-body-sm text-muted">{card.label}</p>
              <Briefcase className="size-4 text-[#E0A263]" />
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
          className="text-body-sm flex min-h-[96px] items-center justify-center gap-1.5 rounded-lg bg-[#050505] p-4 font-semibold text-white transition-colors hover:bg-white/5"
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
  const [filter, setFilter] = useState('all')

  return (
    <div className={cn(PROFILE_CARD, 'p-6')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'reported-against', label: 'Reported Against' },
            { key: 'flagged', label: 'Flagged by' },
          ].map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => setFilter(chip.key)}
              className={cn(
                'text-body-sm rounded-md px-3 py-1.5 font-semibold transition-colors',
                filter === chip.key ? PROFILE_ACTIVE_PILL : PROFILE_IDLE_PILL,
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
        {score !== null && score !== undefined && (
          <span className="bg-brand-positive/15 text-body-sm text-brand-positive rounded-md px-3 py-1.5 font-bold">
            Profile Health: {score}%
          </span>
        )}
      </div>

      <div className="text-body-sm mt-4 rounded-lg bg-[#050505] p-6 text-center text-white/50">
        No reported issues for this venue.
      </div>
    </div>
  )
}

export function VenueProfileViewPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { venueId } = useParams<{ venueId: string }>()
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [suspendModalOpen, setSuspendModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [suspendReasons, setSuspendReasons] = useState<string[]>([])
  const [suspendStartDate, setSuspendStartDate] = useState('')
  const [suspendEndDate, setSuspendEndDate] = useState('')
  const [suspendIndefinitely, setSuspendIndefinitely] = useState(false)
  const [suspendReasonDetails, setSuspendReasonDetails] = useState('')
  const [suspendAdminNotes, setSuspendAdminNotes] = useState('')
  const [deleteReasons, setDeleteReasons] = useState<string[]>([])
  const [deleteAdminNotes, setDeleteAdminNotes] = useState('')
  const [deleteConfirmed, setDeleteConfirmed] = useState(false)

  const suspendVenueMutation = useSuspendVenue()
  const deleteVenueMutation = useDeleteVenue()
  const setVenueOwnerPasswordMutation = useSetVenueOwnerPassword()
  const recordReasonUsage = useRecordModerationReasonUsage()
  const { options: suspendReasonOptions, buildPayload: buildSuspendReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.suspendVenue)
  const { options: deleteReasonOptions, buildPayload: buildDeleteReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.deleteVenue)

  const { data, isLoading, isError, error } = useVenueFullView(venueId)
  const fullView = data?.data

  const closeSuspendModal = useCallback(() => {
    setSuspendModalOpen(false)
    setSuspendReasons([])
    setSuspendStartDate('')
    setSuspendEndDate('')
    setSuspendIndefinitely(false)
    setSuspendReasonDetails('')
    setSuspendAdminNotes('')
  }, [])

  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false)
    setDeleteReasons([])
    setDeleteAdminNotes('')
    setDeleteConfirmed(false)
  }, [])

  const handlePasswordSubmit = useCallback(
    async (payload: { oldPassword: string; newPassword: string; confirmNewPassword: string }) => {
      const partnerId = fullView?.overview?.venue?.ownerId
      if (!partnerId) {
        toast.error('Venue owner account not found.')
        return
      }

      if (payload.newPassword.length < 6) {
        toast.error('Password must be at least 6 characters')
        return
      }

      if (payload.newPassword !== payload.confirmNewPassword) {
        toast.error('New password and confirmation do not match')
        return
      }

      try {
        const response = await setVenueOwnerPasswordMutation.mutateAsync({
          partnerId,
          payload: {
            newPassword: payload.newPassword,
            confirmNewPassword: payload.confirmNewPassword,
          },
        })
        toast.success(response?.message || 'Password updated successfully')
        setPasswordModalOpen(false)
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } }
        toast.error(err?.response?.data?.message || 'Failed to update password')
      }
    },
    [fullView?.overview?.venue?.ownerId, setVenueOwnerPasswordMutation],
  )

  const toggleSuspendReason = useCallback((value: string) => {
    setSuspendReasons((current) =>
      current.includes(value) ? current.filter((reason) => reason !== value) : [...current, value],
    )
  }, [])

  const toggleDeleteReason = useCallback((value: string) => {
    setDeleteReasons((current) =>
      current.includes(value) ? current.filter((reason) => reason !== value) : [...current, value],
    )
  }, [])

  const handleSuspendSubmit = useCallback(() => {
    if (!venueId) return

    if (suspendReasons.length === 0) {
      toast.error('Please select at least one reason.')
      return
    }

    if (!suspendIndefinitely && (!suspendStartDate || !suspendEndDate)) {
      toast.error('Please provide a suspension timeline or choose to suspend indefinitely.')
      return
    }

    if (!suspendAdminNotes.trim()) {
      toast.error('Admin notes are required.')
      return
    }

    const toDateIso = (value: string) =>
      value ? new Date(`${value}T00:00:00.000Z`).toISOString() : undefined

    const reasonPayload = buildSuspendReasonPayload(suspendReasons)
    if (reasonPayload.selectedReasons.length === 0) {
      toast.error('Selected reasons are no longer available. Please refresh and try again.')
      return
    }

    const templateDetails = reasonPayload.reasonDetails
    const extraDetails = suspendReasonDetails.trim()
    const reasonDetails = [templateDetails, extraDetails].filter(Boolean).join('\n\n')

    suspendVenueMutation.mutate(
      {
        venueId,
        payload: {
          selectedReasons: reasonPayload.selectedReasons,
          suspendIndefinitely,
          startDate: suspendIndefinitely ? undefined : toDateIso(suspendStartDate),
          endDate: suspendIndefinitely ? undefined : toDateIso(suspendEndDate),
          reasonDetails,
          adminNotes: suspendAdminNotes.trim(),
        },
      },
      {
        onSuccess: () => {
          if (reasonPayload.reasonIds.length > 0) {
            recordReasonUsage.mutate(reasonPayload.reasonIds)
          }
          toast.success('Venue suspended successfully')
          closeSuspendModal()
          setProfileMenuOpen(false)
          queryClient.invalidateQueries({ queryKey: ['venue-full-view', venueId] })
          queryClient.invalidateQueries({ queryKey: ['venues'] })
          navigate('/venues/management')
        },
        onError: (err: unknown) => {
          const apiError = err as { response?: { data?: { message?: string } } }
          toast.error(
            apiError?.response?.data?.message || 'Failed to suspend venue. Please try again.',
          )
        },
      },
    )
  }, [
    buildSuspendReasonPayload,
    closeSuspendModal,
    navigate,
    queryClient,
    recordReasonUsage,
    suspendAdminNotes,
    suspendEndDate,
    suspendIndefinitely,
    suspendReasonDetails,
    suspendReasons,
    suspendStartDate,
    suspendVenueMutation,
    venueId,
  ])

  const handleDeleteSubmit = useCallback(() => {
    if (!venueId) return

    if (deleteReasons.length === 0) {
      toast.error('Please select at least one reason.')
      return
    }

    if (!deleteConfirmed) {
      toast.error('Please confirm the delete reasons before continuing.')
      return
    }

    if (!deleteAdminNotes.trim()) {
      toast.error('Admin notes are required.')
      return
    }

    const reasonPayload = buildDeleteReasonPayload(deleteReasons)
    if (reasonPayload.selectedReasons.length === 0) {
      toast.error('Selected reasons are no longer available. Please refresh and try again.')
      return
    }

    deleteVenueMutation.mutate(
      {
        venueId,
        payload: {
          selectedReasons: reasonPayload.selectedReasons,
          reasonDetails: reasonPayload.reasonDetails,
          adminNotes: deleteAdminNotes.trim(),
        },
      },
      {
        onSuccess: () => {
          if (reasonPayload.reasonIds.length > 0) {
            recordReasonUsage.mutate(reasonPayload.reasonIds)
          }
          toast.success('Venue deleted successfully')
          closeDeleteModal()
          setProfileMenuOpen(false)
          queryClient.invalidateQueries({ queryKey: ['venues'] })
          navigate('/venues/management')
        },
        onError: (err: unknown) => {
          const apiError = err as { response?: { data?: { message?: string } } }
          toast.error(apiError?.response?.data?.message || 'Failed to delete venue.')
        },
      },
    )
  }, [
    buildDeleteReasonPayload,
    closeDeleteModal,
    deleteAdminNotes,
    deleteConfirmed,
    deleteReasons,
    deleteVenueMutation,
    navigate,
    queryClient,
    recordReasonUsage,
    venueId,
  ])

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
          className="group font-heading text-h3 flex w-fit items-center gap-2 font-bold text-white transition-colors hover:text-[#E0A263]"
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
            className="group font-heading text-h3 flex w-fit items-center gap-2 font-bold tracking-tight text-white transition-colors hover:text-[#E0A263]"
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
        <TableActionsDropdown
          label="Open venue profile actions"
          isOpen={profileMenuOpen}
          onOpenChange={setProfileMenuOpen}
          menuWidth={220}
          tone="light"
        >
          <TableActionsItem
            tone="light"
            icon={<Pencil className="size-3.5" />}
            onClick={() => {
              setProfileMenuOpen(false)
              navigate(`/venues/management/create?venueId=${venueId}&mode=edit`)
            }}
          >
            Edit Profile
          </TableActionsItem>
          <TableActionsItem
            tone="light"
            icon={<FilePlus2 className="size-3.5" />}
            onClick={() => {
              setProfileMenuOpen(false)
              comingSoon('Merge Records')
            }}
          >
            Merge Records
          </TableActionsItem>
          <TableActionsItem
            tone="light"
            icon={<Eye className="size-3.5" />}
            onClick={() => {
              setProfileMenuOpen(false)
              if (!fullView?.overview?.venue?.ownerId) {
                toast.error('Venue owner account not found.')
                return
              }
              setPasswordModalOpen(true)
            }}
          >
            Reset Password
          </TableActionsItem>
          <TableActionsItem
            tone="light"
            icon={<AlertOctagon className="size-3.5" />}
            onClick={() => {
              setProfileMenuOpen(false)
              comingSoon('Logout User')
            }}
          >
            Logout User
          </TableActionsItem>
          <TableActionsItem
            tone="light"
            icon={<Ban className="size-3.5" />}
            onClick={() => {
              setProfileMenuOpen(false)
              setSuspendModalOpen(true)
            }}
          >
            Suspend User
          </TableActionsItem>
          <TableActionsItem
            tone="light"
            icon={<CircleMinus className="size-3.5" />}
            onClick={() => {
              setProfileMenuOpen(false)
              comingSoon('Block User')
            }}
          >
            Block User
          </TableActionsItem>
          <TableActionsItem
            tone="light"
            icon={<Trash2 className="size-3.5" />}
            className="text-red-500 hover:bg-red-50 hover:text-red-600 [&_svg]:text-red-500"
            onClick={() => {
              setProfileMenuOpen(false)
              setDeleteModalOpen(true)
            }}
          >
            Delete User
          </TableActionsItem>
        </TableActionsDropdown>
      </header>

      <div className="relative overflow-hidden rounded-xl bg-[#141414]">
        <div className="h-40 w-full bg-[#050505]">
          <SafeImage
            src={coverImage}
            alt={`${venue.name} cover`}
            className="size-full object-cover"
            fallback={
              <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#2b3a8c] via-[#4b2f8c] to-[#141414]" />
            }
          />
        </div>
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="-mt-12 size-20 shrink-0 self-end overflow-hidden rounded-full border-2 border-[#E0A263] bg-[#141414]">
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
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white">{venue.name}</h2>
              <p className="text-body-sm text-white/50">
                {[venue.location?.city, venue.location?.country].filter(Boolean).join(', ') || '—'}
              </p>
            </div>
          </div>
          <div className="flex w-full max-w-[600px] flex-wrap items-center justify-end gap-2 sm:w-auto sm:shrink-0">
            {headerActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={PROFILE_HEADER_BTN}
              >
                <action.icon className="size-3 shrink-0" strokeWidth={2.25} />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
        <ProfileSidebar data={fullView} />

        <div className="flex flex-col gap-5">
          <div className="flex h-[50px] items-stretch gap-1 overflow-x-auto rounded-xl bg-[#141414] px-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'relative flex-1 px-4 text-[13px] font-semibold whitespace-nowrap transition-colors',
                  activeTab === tab.key
                    ? 'text-white after:absolute after:right-4 after:bottom-0 after:left-4 after:h-0.5 after:rounded-full after:bg-[#E0A263]'
                    : 'text-white/50 hover:text-white',
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

      <UpdatePasswordModal
        open={passwordModalOpen}
        userName={venue.name}
        requireOldPassword={false}
        mode="reset"
        isSubmitting={setVenueOwnerPasswordMutation.isPending}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handlePasswordSubmit}
      />

      <DecisionActionModal
        open={suspendModalOpen}
        variant="suspend"
        title="Suspend Venue"
        headerDescription="Are you sure you want to suspend this venue? This action will prevent new bookings and notify existing customers."
        description=""
        submitLabel="Suspend"
        showHeroIcon={false}
        submitIcon="none"
        reasonOptions={suspendReasonOptions}
        selectedReasons={suspendReasons}
        onReasonToggle={toggleSuspendReason}
        showReasonsLabel
        showTimeline
        startDate={suspendStartDate}
        onStartDateChange={setSuspendStartDate}
        endDate={suspendEndDate}
        onEndDateChange={setSuspendEndDate}
        indefinite={suspendIndefinitely}
        onIndefiniteChange={setSuspendIndefinitely}
        reason={suspendReasonDetails}
        onReasonChange={setSuspendReasonDetails}
        reasonLabel="Reasons"
        reasonRequired={false}
        reasonFieldType="input"
        adminNotes={suspendAdminNotes}
        onAdminNotesChange={setSuspendAdminNotes}
        onClose={closeSuspendModal}
        onSubmit={handleSuspendSubmit}
        isSubmitting={suspendVenueMutation.isPending}
      />

      <DecisionActionModal
        open={deleteModalOpen}
        variant="delete"
        title="Delete Venue"
        headerDescription="Are you sure you want to delete this venue? This action will prevent new bookings and notify existing customers."
        description="Are you sure you want to delete this user? This will result in removal of the account."
        submitLabel="Delete User"
        heroLayout="stack"
        reasonOptions={deleteReasonOptions}
        selectedReasons={deleteReasons}
        onReasonToggle={toggleDeleteReason}
        showReasonsLabel
        confirmationLabel="I confirm the documents are not approved due to above reasons."
        confirmationChecked={deleteConfirmed}
        onConfirmationChange={setDeleteConfirmed}
        adminNotes={deleteAdminNotes}
        onAdminNotesChange={setDeleteAdminNotes}
        onClose={closeDeleteModal}
        onSubmit={handleDeleteSubmit}
        isSubmitting={deleteVenueMutation.isPending}
      />
    </div>
  )
}
