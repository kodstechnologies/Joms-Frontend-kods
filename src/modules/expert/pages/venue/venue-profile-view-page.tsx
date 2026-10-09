import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { PageBreadcrumb } from '@/shared/components/navigation/page-breadcrumb'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import deleteIcon from '@/assets/JOMS_ICONS-2/icons8-delete.svg'
import editIcon from '@/assets/JOMS_ICONS-2/edit.svg'
import { toast } from 'sonner'
import {
  END_MUST_AFTER_START_MESSAGE,
  isEndOnOrBeforeStart,
  isStartBeforeToday,
  START_BEFORE_TODAY_MESSAGE,
} from '@/shared/utils/date-range'
import { useDefaultExportFormat } from '@/modules/settings/hooks/use-default-export-format'
import {
  AlertOctagon,
  ArrowLeft,
  Ban,
  Bell,
  Building2,
  CheckSquare,
  ChevronRight,
  CircleArrowOutUpRight,
  CircleMinus,
  Eye,
  EyeOff,
  FileText,
  Flag,
  ImageOff,
  Mail,
  MapPin,
  PauseCircle,
  Plus,
  Search,
  Star,
  Tag,
  Upload,
  User,
  Users,
} from 'lucide-react'
import {
  AdvanceFilterIcon,
  ExportDataIcon,
  ManageMetricsIcon,
} from '@/shared/components/icons/action-button-icons'

import { useVenueManagementControls } from '@/modules/settings/hooks/use-venue-public-settings'
import {
  useBulkUpdateSpaceVisibility,
  useSetVenueOwnerPassword,
  useUpdateVenueOwnerAdminNotes,
  useUpdateVenueOwnerAdminTags,
  useVenueFullView,
  useVenueInsights,
  useVenueReportsForVenue,
} from '../../hooks/use-venues'
import {
  useBlockExpert,
  useDeactivateExpert,
  useForceLogoutExpert,
  useSuspendExpert,
} from '../../hooks/use-expert'
import { useVenueProfileAnalytics } from '../../hooks/use-venue-analytics'
import {
  DEFAULT_VENUE_PROFILE_ANALYTICS_METRIC_IDS,
  VENUE_PROFILE_ANALYTICS_LEGACY_METRIC_ID_MAP,
  VENUE_PROFILE_ANALYTICS_METRIC_ID_SET,
  VENUE_PROFILE_ANALYTICS_METRIC_IDS,
  VENUE_PROFILE_ANALYTICS_MODULE_KEY,
} from '../../config/venue-profile-analytics-metrics.config'
import { orderByActiveMetricIds, useActiveMetricIds } from '../../hooks/use-active-metric-ids'
import { VenueAnalyticsMetricIcon } from '../../components/venue-analytics'
import { buildVenueProfileAnalyticsMetricCards } from '../../utils/venue-profile-analytics-metrics'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import type {
  VenueFullView,
  VenueFullViewAvailability,
  VenueFullViewSpaceSummary,
} from '../../type/venue-full-view'
import type { PartnerInsightReview } from '../../type/expert-profile'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import type {
  FilterValues,
  LocationFilterValue,
  RangeFilterValue,
} from '@/shared/types/data-filter'
import { AddTagModal } from '@/shared/components/modal/add-tag-modal'
import { AdminNotesModal } from '@/modules/settings/components/admin-notes-modal'
import { adminNoteTextsNewestFirst } from '@/modules/expert/utils/admin-notes-display'
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
import { useEntityTags } from '@/shared/hooks/use-entity-tags'
import { cn } from '@/shared/lib/cn'
import { getListingStatusDisplay } from '../../utils/management-status'
import { openExpertKycFromProfile } from '../../utils/expert-application-navigation'
import { isSubmittedKycStatus } from '../../utils/expert-application-helpers'
import { fetchVenueKycByPartnerId } from '../../api/venue-kyc-api'
import { useEscalationAssignees } from '@/modules/my-tasks/hooks/use-admin-escalation'
import { escalateVenueSpaceApplication } from '@/modules/my-tasks/api/escalation-api'
import { exportDataToFile } from '@/shared/utils/export-utils'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import type { UpdateVenueSpaceVisibilityPayload } from '../../api/venue-api'
import { fetchSupportTickets } from '@/modules/support-management/api/support-api'
import type { SupportTicket } from '@/modules/support-management/types/support'
import { SafeImage } from '@/shared/components/media/safe-image'
import { InPageMediaViewer } from '@/shared/components/media/in-page-media-viewer'
import {
  VenueReportDetailModal,
  type VenueReportItem,
} from '../../components/venue-report-detail-modal'
import { VenueReportSubmitModal } from '../../components/venue-report-submit-modal'

type TabKey = 'overview' | 'spaces' | 'analytics' | 'health'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'spaces', label: 'Spaces Listing' },
  { key: 'analytics', label: 'Venue Analytics' },
  { key: 'health', label: 'Profile Health' },
]

const PROFILE_VIEW_BTN =
  'inline-flex h-[25px] min-w-[48px] items-center justify-center rounded-[8px] bg-[#F6CB86] px-2.5 text-[12px] font-semibold leading-[14px] tracking-normal text-black transition-[filter] hover:brightness-95'

const PROFILE_CHECK_TIMELINES_BTN =
  'inline-flex h-[30px] min-w-[110px] items-center justify-center gap-2.5 rounded-[10px] bg-[linear-gradient(90deg,#F6CB86_0%,#E0A263_100%)] px-2.5 text-[12px] font-semibold leading-[14px] tracking-normal text-[#050505] transition-[filter] hover:brightness-95'

const PROFILE_HEADER_BTN =
  'inline-flex h-[25px] items-center justify-center gap-1.5 rounded-[12px] bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] px-3 text-[11px] leading-none font-semibold whitespace-nowrap text-[#050505] transition-[filter] hover:brightness-95'

const PROFILE_CARD = 'rounded-xl bg-[#141414]'

const PROFILE_ACTIVE_PILL = 'bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] text-[#050505]'

const PROFILE_IDLE_PILL = 'border border-[#FFFFFF33] bg-[#050505] text-white hover:bg-white/5'

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return '—'
  return `₹${Number(value).toLocaleString('en-IN')}`
}

const exportCell = (value: unknown) => {
  if (value == null) return ''
  if (typeof value === 'string' && value.trim() === '') return ''
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

const ACTIVE_TICKET_STATUSES = new Set(['open', 'in_progress', 'on_hold', 'waiting'])
const OPEN_REPORT_STATUSES = new Set([
  'new',
  'under review',
  'waiting for response',
  'escalated',
  'open',
])
const VIOLATION_ISSUE_TYPES = new Set([
  'fraud',
  'misleading facilities',
  'spam',
  'fake venue',
  'harassment',
  'safety hazard',
])

const unwrapVenueReportItems = (payload: unknown): VenueReportItem[] => {
  const root = payload as { data?: { items?: VenueReportItem[] }; items?: VenueReportItem[] }
  if (Array.isArray(root?.data?.items)) return root.data.items
  if (Array.isArray(root?.items)) return root.items
  return []
}

const formatSpaceAvailabilityChip = (availability?: VenueFullViewAvailability | null) => {
  const blocked = availability?.blockedDates ?? []
  const dated = blocked
    .map((item) => (item.date ? new Date(item.date) : null))
    .filter((date): date is Date => Boolean(date && !Number.isNaN(date.getTime())))
    .sort((a, b) => a.getTime() - b.getTime())
  if (dated.length === 1) return formatReviewDate(dated[0].toISOString())
  if (dated.length > 1) {
    return `${formatReviewDate(dated[0].toISOString())} - ${formatReviewDate(dated[dated.length - 1].toISOString())}`
  }
  const weekly = availability?.weeklyAvailability ?? []
  if (weekly.length > 0) {
    return `${weekly.length} day${weekly.length === 1 ? '' : 's'} / week`
  }
  return null
}

const buildVenueTimelineEvents = (
  data: VenueFullView,
  tickets: SupportTicket[],
  reports: VenueReportItem[],
) => {
  const events: Array<{ id: string; title: string; detail?: string; at?: string }> = []
  const venue = data.overview?.venue
  const createdAt = venue?.createdAt
  const createdMs = createdAt ? new Date(createdAt).getTime() : NaN

  const kycStatus = data.profile?.kycStatus
  const kycApproved = String(kycStatus || '').toUpperCase() === 'APPROVED'
  if (kycApproved) {
    events.push({
      id: 'kyc-verified',
      title: 'KYC verified',
      detail: formatVenueKycStatusLabel(kycStatus),
      at: venue?.updatedAt || createdAt,
    })
  }

  const lastActive = venue?.lastActiveAt
  const lastActiveMs = lastActive ? new Date(lastActive).getTime() : NaN
  if (lastActive && (!Number.isFinite(createdMs) || lastActiveMs !== createdMs)) {
    events.push({
      id: 'last-active',
      title: 'Last active',
      at: lastActive,
    })
  }

  tickets.forEach((ticket) => {
    const closed = ['resolved', 'closed'].includes(String(ticket.status).toLowerCase())
    events.push({
      id: `ticket-${ticket.id}`,
      title: closed ? 'Support ticket closed' : 'Support ticket opened',
      detail: `#${ticket.id} – ${ticket.subject}`,
      at: closed ? ticket.resolvedAt || ticket.createdAt : ticket.createdAt,
    })
  })

  reports.forEach((report) => {
    events.push({
      id: `report-${report.id || report.reportId}`,
      title: 'Venue report',
      detail: report.issueType || report.reason,
      at: report.submittedAt || report.createdAt,
    })
  })

  if (events.length === 0) return []

  if (createdAt) {
    events.push({
      id: 'account-created',
      title: 'Venue created',
      at: createdAt,
    })
  }

  return events.sort((a, b) => {
    const aTime = a.at ? new Date(a.at).getTime() : 0
    const bTime = b.at ? new Date(b.at).getTime() : 0
    return aTime - bTime
  })
}

const formatReviewDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const toInsightsSort = (filter: string): 'recent' | 'top' | 'all' => {
  if (filter === 'top') return 'top'
  if (filter === 'all') return 'all'
  return 'recent'
}

function SidebarRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-[16px] leading-[14px] font-normal tracking-normal text-[#FFFFFF80]">
        {label}
      </span>
      <span className="max-w-[58%] text-right text-[16px] leading-5 font-semibold tracking-normal text-white">
        {children}
      </span>
    </div>
  )
}

const formatVenueKycStatusLabel = (status?: string | null) => {
  const normalized = (status || '').toUpperCase().replace(/-/g, '_')
  if (
    normalized === 'APPROVED' ||
    normalized === 'LIVE' ||
    normalized === 'ACTIVE' ||
    normalized === 'VERIFIED'
  ) {
    return 'Verified'
  }
  if (normalized === 'REJECTED') return 'Rejected'
  return 'Review Pending'
}

const getVenueKycStatusTone = (status?: string | null) => {
  const normalized = (status || '').toUpperCase().replace(/-/g, '_')
  if (
    normalized === 'APPROVED' ||
    normalized === 'LIVE' ||
    normalized === 'ACTIVE' ||
    normalized === 'VERIFIED'
  ) {
    return 'inline-flex h-[25px] min-w-[91px] items-center justify-center rounded-[10px] bg-[#00A63E4D] px-2.5 text-[12px] leading-[14px] font-semibold tracking-normal text-white'
  }
  if (normalized === 'REJECTED' || normalized === 'SUSPENDED') {
    return 'inline-flex h-[25px] items-center justify-center rounded-[10px] bg-brand-danger/15 px-2.5 text-[12px] leading-[14px] font-semibold tracking-normal text-red-400'
  }
  return 'inline-flex h-[25px] items-center justify-center rounded-[10px] border border-amber-500/30 bg-amber-500/15 px-2.5 text-[12px] leading-[14px] font-semibold tracking-normal text-amber-300'
}

const SIDEBAR_CARDS_SCROLL =
  'max-h-[11.5rem] space-y-2 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin]'

const SIDEBAR_ITEM_CARD = 'rounded-lg bg-[#050505] p-3'

function ProfileSidebar({
  data,
  tickets = [],
  ticketsLoading = false,
  onCheckTimelines,
}: {
  data: VenueFullView
  tickets?: SupportTicket[]
  ticketsLoading?: boolean
  onCheckTimelines?: () => void
}) {
  const navigate = useNavigate()
  const profile = data.profile ?? {
    venueType: null,
    clientSatisfaction: null,
    ratings: null,
    reviewsCount: null,
    totalBookings: null,
    yearsInOperation: null,
    totalEarnings: null,
    primaryCity: null,
    kycId: null,
    kycStatus: null,
  }
  const overview = data.overview
  const kycStatus = profile.kycStatus
  const kycStatusLabel = formatVenueKycStatusLabel(kycStatus)
  const kycStatusTone = getVenueKycStatusTone(kycStatus)
  const ratingValue = profile.ratings ?? overview?.venue?.ratings ?? null
  const reviewCount = profile.reviewsCount ?? overview?.venue?.reviewsCount ?? null
  const ratingsAvailable =
    ratingValue != null && typeof reviewCount === 'number'
      ? reviewCount > 0
      : ratingValue != null && Number(ratingValue) > 0
  const partnerId = overview?.venue?.ownerId
  const venueKycId = profile.kycId || overview?.venue?.kycId

  const adminNoteEntries = useMemo(
    () =>
      adminNoteTextsNewestFirst(
        overview?.venue?.adminNotesLog,
        overview?.venue?.adminInternalNotes,
      ),
    [overview?.venue?.adminInternalNotes, overview?.venue?.adminNotesLog],
  )

  const handleViewKyc = () => {
    if (!isSubmittedKycStatus(kycStatus)) {
      toast.error('KYC is not submitted by partner')
      return
    }
    if (venueKycId) {
      navigate(`/experts/management/application/${venueKycId}?source=venue_kyc`)
      return
    }
    if (!partnerId) {
      toast.error('No venue owner found for KYC.')
      return
    }
    void openExpertKycFromProfile(partnerId, 'venue', navigate)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={cn(PROFILE_CARD, 'p-5')}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-white">
            Organisation Profile &amp; Account
          </h3>
          <span className={kycStatusTone}>{kycStatusLabel}</span>
        </div>

        <SidebarRow label="Venue Type">{profile.venueType || '—'}</SidebarRow>
        <SidebarRow label="Client Satisfaction">
          {profile.clientSatisfaction !== null && profile.clientSatisfaction !== undefined
            ? `${profile.clientSatisfaction}%`
            : '—'}
        </SidebarRow>
        <SidebarRow label="Ratings">
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5 fill-[#E0A263] text-[#E0A263]" />
            {ratingsAvailable ? Number(ratingValue).toFixed(1) : '—'}
            <span className="text-[16px] leading-[14px] font-normal tracking-normal text-[#FFFFFF80]">
              ({ratingsAvailable && reviewCount != null ? reviewCount : 0})
            </span>
          </span>
        </SidebarRow>
        <SidebarRow label="Total Bookings">{profile.totalBookings ?? 0}</SidebarRow>
        <SidebarRow label="Years in Operation">
          {profile.yearsInOperation?.years != null
            ? `${profile.yearsInOperation.years} Years`
            : typeof profile.yearsInOperation === 'number'
              ? `${profile.yearsInOperation} Years`
              : '—'}
        </SidebarRow>
        <SidebarRow label="Total Earnings">{formatCurrency(profile.totalEarnings)}</SidebarRow>
        <SidebarRow label="Primary City">{profile.primaryCity || '—'}</SidebarRow>
        <SidebarRow label="KYC">
          <button type="button" onClick={handleViewKyc} className={PROFILE_VIEW_BTN}>
            View
          </button>
        </SidebarRow>
        <SidebarRow label="Timelines">
          <button type="button" onClick={onCheckTimelines} className={PROFILE_CHECK_TIMELINES_BTN}>
            Check Timelines
          </button>
        </SidebarRow>
      </div>

      <div className={cn(PROFILE_CARD, 'p-5')}>
        <h3 className="mb-4 text-[13px] font-semibold text-white">Support &amp; Admin</h3>

        <div className="space-y-2">
          <p className="text-muted text-[10px]">Active Tickets</p>
          {ticketsLoading ? (
            <div className={SIDEBAR_ITEM_CARD}>
              <p className="text-body-sm text-muted font-medium">Loading…</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className={SIDEBAR_ITEM_CARD}>
              <p className="text-body-sm font-medium text-white">None</p>
            </div>
          ) : (
            <div className={cn(tickets.length > 3 ? SIDEBAR_CARDS_SCROLL : 'space-y-2')}>
              {tickets.map((ticket) => (
                <div key={ticket.id} className={SIDEBAR_ITEM_CARD}>
                  <button
                    type="button"
                    onClick={() => navigate(`/support/tickets/${ticket.id}`)}
                    className="text-body-sm w-full truncate text-left font-medium text-white underline-offset-2 hover:underline"
                    title={`# ${ticket.id} – ${ticket.subject}`}
                  >
                    # {ticket.id} – {ticket.subject}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-muted text-[10px]">Admin notes</p>
          {adminNoteEntries.length === 0 ? (
            <div className={SIDEBAR_ITEM_CARD}>
              <p className="text-body-sm font-medium text-white">None</p>
            </div>
          ) : (
            <div className={cn(adminNoteEntries.length > 3 ? SIDEBAR_CARDS_SCROLL : 'space-y-2')}>
              {adminNoteEntries.map((note, index) => (
                <div key={`${index}-${note.slice(0, 32)}`} className={SIDEBAR_ITEM_CARD}>
                  <p className="text-body-sm font-medium whitespace-pre-wrap text-white">{note}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function OverviewTab({
  data,
  venueId,
  tags = [],
  timelineEvents = [],
}: {
  data: VenueFullView
  venueId: string
  tags?: string[]
  timelineEvents?: Array<{ id: string; title: string; detail?: string; at?: string }>
}) {
  const { venue, gallery } = data.overview
  const location = venue.location
  const poc = gallery?.contact?.contacts?.[0]
  const [reviewFilter, setReviewFilter] = useState('all')
  const [mediaIndex, setMediaIndex] = useState<number | null>(null)
  const insightsSort = toInsightsSort(reviewFilter)
  const { data: insightsRes, isLoading: reviewsLoading } = useVenueInsights(venueId, insightsSort)
  const reviews: PartnerInsightReview[] = insightsRes?.data?.reviews ?? []

  const galleryImages = gallery?.galleryImages?.map((image) => image.url) ?? venue.venueImages ?? []
  const mediaItems = galleryImages.map((url, index) => ({
    url,
    title: `Gallery ${index + 1}`,
  }))

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
        {tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-white/20 bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
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
              <button
                key={`${src}-${index}`}
                type="button"
                onClick={() => setMediaIndex(index)}
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
              </button>
            ))}
          </div>
        ) : (
          <p className="text-body-sm text-white/50">No gallery images uploaded.</p>
        )}
      </div>

      <InPageMediaViewer
        open={mediaIndex != null}
        items={mediaItems}
        index={mediaIndex ?? 0}
        onClose={() => setMediaIndex(null)}
        onIndexChange={setMediaIndex}
      />

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
        <div className="space-y-3">
          {reviewsLoading ? (
            <p className="text-body-sm rounded-lg bg-[#050505] p-4 text-white/50">
              Loading reviews…
            </p>
          ) : reviews.length === 0 ? (
            <p className="text-body-sm rounded-lg bg-[#050505] p-4 text-white/50">
              No reviews yet for this venue.
            </p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="rounded-lg bg-[#050505] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-[#141414]">
                      {review.userAvatarUrl ? (
                        <img src={review.userAvatarUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <User className="text-muted size-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-white">
                        {review.userName || 'User'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-0.5">
                      {Array.from({
                        length: Math.max(0, Math.min(5, review.rating || 0)),
                      }).map((_, index) => (
                        <Star key={index} className="size-3 fill-[#E0A263] text-[#E0A263]" />
                      ))}
                    </div>
                    <p className="mt-1 text-[10px] text-white/50">
                      {review.relativeLabel || formatReviewDate(review.createdAt)}
                    </p>
                  </div>
                </div>
                {review.title ? (
                  <p className="text-body-sm mt-2 text-white/50">Booking: {review.title}</p>
                ) : null}
                {review.text ? (
                  <p className="text-body-sm mt-2 text-white/70">{review.text}</p>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>

      <section id="venue-timeline" className="scroll-mt-6 border-t border-white/5 pt-6">
        <h3 className="text-body-md mb-3 font-semibold text-white">Timeline</h3>
        {timelineEvents.length === 0 ? (
          <p className="text-body-sm text-white/40">No timeline events yet.</p>
        ) : (
          <ol className="space-y-3">
            {timelineEvents.map((event) => (
              <li key={event.id} className="rounded-lg bg-[#050505] px-4 py-3">
                <p className="text-[13px] font-semibold text-white">{event.title}</p>
                {event.detail ? (
                  <p className="text-muted mt-1 text-[12px]">{event.detail}</p>
                ) : null}
                <p className="text-muted mt-1 text-[11px]">{formatReviewDate(event.at)}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}

function SpacesTab({ data, venueId }: { data: VenueFullView; venueId: string }) {
  const navigate = useNavigate()
  const { fileFormat } = useDefaultExportFormat()
  const [search, setSearch] = useState('')
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null)
  const [selectedSpaceIds, setSelectedSpaceIds] = useState<string[]>([])

  const [isBulkHideModalOpen, setIsBulkHideModalOpen] = useState(false)
  const [isBulkSuspendModalOpen, setIsBulkSuspendModalOpen] = useState(false)
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false)
  const [bulkReasons, setBulkReasons] = useState<string[]>([])
  const [bulkAdminNotes, setBulkAdminNotes] = useState('')
  const [bulkStartDate, setBulkStartDate] = useState('')
  const [bulkEndDate, setBulkEndDate] = useState('')
  const [bulkIndefinitely, setBulkIndefinitely] = useState(false)
  const [escalateAdminNotes, setEscalateAdminNotes] = useState('')
  const [selectedEscalationOption, setSelectedEscalationOption] = useState('')
  const [isEscalating, setIsEscalating] = useState(false)

  const partnerId = data.overview?.venue?.ownerId
  const { allowDisableVenues } = useVenueManagementControls()
  const bulkVisibilityMutation = useBulkUpdateSpaceVisibility(venueId)
  const recordReasonUsage = useRecordModerationReasonUsage()
  const { options: hideReasonOptions, buildPayload: buildHideReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.hideVenue)
  const { options: suspendReasonOptions, buildPayload: buildSuspendReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.suspendVenue)
  const { data: assigneesData } = useEscalationAssignees('venues.*')
  const escalationOptions: DecisionActionModalOption[] = useMemo(
    () =>
      (assigneesData?.data ?? []).map((assignee) => ({
        label: assignee.fullname,
        value: assignee.id,
      })),
    [assigneesData?.data],
  )

  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const handleApplyFilters = useCallback((values: FilterValues) => {
    toast.success('Filters applied')
    setAppliedFilters(values)
  }, [])

  const { onAdvancedFilter, modals: exportFilterModals } = useModuleExportFilters({
    moduleKey: 'venue-profile-spaces',
    onApplyFilters: handleApplyFilters,
  })

  const spaces = useMemo(() => {
    return data.spaces.filter((space) => {
      const listingStatus = (space.status || '').toLowerCase()
      if (listingStatus === 'draft' || listingStatus === 'preview') return false

      if (search.trim()) {
        const query = search.toLowerCase().trim()
        const matchName = space.spaceName?.toLowerCase().includes(query)
        const matchCity = space.city?.toLowerCase().includes(query)
        const matchState = space.state?.toLowerCase().includes(query)
        if (!matchName && !matchCity && !matchState) return false
      }

      const loc = appliedFilters.location as LocationFilterValue | undefined
      if (loc) {
        if (loc.state && !space.state?.toLowerCase().includes(loc.state.toLowerCase())) return false
        if (loc.city && !space.city?.toLowerCase().includes(loc.city.toLowerCase())) return false
      }

      const statusFilter = appliedFilters.status
      if (Array.isArray(statusFilter) && statusFilter.length > 0) {
        const spaceStatus = space.status || 'submitted'
        if (!statusFilter.includes(spaceStatus)) return false
      }

      const visibilityFilter = appliedFilters.visibility
      if (Array.isArray(visibilityFilter) && visibilityFilter.length > 0) {
        const isSuspended = Boolean(space.isSuspend)
        const isHidden = Boolean(space.isHidden)
        const isActive = !isSuspended && !isHidden

        const matches = visibilityFilter.some((val) => {
          if (val === 'active') return isActive
          if (val === 'hidden') return isHidden
          if (val === 'suspended') return isSuspended
          return false
        })
        if (!matches) return false
      }

      const capacityRange = appliedFilters.capacity as RangeFilterValue | undefined
      if (capacityRange) {
        const capNum = Number(space.capacity) || 0
        const from = capacityRange.from ? Number(capacityRange.from) : null
        const to = capacityRange.to ? Number(capacityRange.to) : null
        if (from !== null && !Number.isNaN(from) && capNum < from) return false
        if (to !== null && !Number.isNaN(to) && capNum > to) return false
      }

      const weekdayRange = appliedFilters.weekdayPrice as RangeFilterValue | undefined
      if (weekdayRange) {
        const price = space.weekdayPrice ?? 0
        const from = weekdayRange.from ? Number(weekdayRange.from) : null
        const to = weekdayRange.to ? Number(weekdayRange.to) : null
        if (from !== null && !Number.isNaN(from) && price < from) return false
        if (to !== null && !Number.isNaN(to) && price > to) return false
      }

      const weekendRange = appliedFilters.weekendPrice as RangeFilterValue | undefined
      if (weekendRange) {
        const price = space.weekendPrice ?? 0
        const from = weekendRange.from ? Number(weekendRange.from) : null
        const to = weekendRange.to ? Number(weekendRange.to) : null
        if (from !== null && !Number.isNaN(from) && price < from) return false
        if (to !== null && !Number.isNaN(to) && price > to) return false
      }

      return true
    })
  }, [data.spaces, search, appliedFilters])

  const visibleSpaceIds = useMemo(() => spaces.map((space) => space.spaceId), [spaces])
  const allVisibleSelected =
    visibleSpaceIds.length > 0 && visibleSpaceIds.every((id) => selectedSpaceIds.includes(id))
  const selectedSpaces = useMemo(
    () => data.spaces.filter((space) => selectedSpaceIds.includes(space.spaceId)),
    [data.spaces, selectedSpaceIds],
  )

  const toggleSelectAll = useCallback(() => {
    if (allVisibleSelected) {
      setSelectedSpaceIds([])
    } else {
      setSelectedSpaceIds(visibleSpaceIds)
    }
  }, [allVisibleSelected, visibleSpaceIds])

  const toggleSpaceSelection = useCallback((id: string) => {
    setSelectedSpaceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }, [])

  const resetBulkVisibilityModal = useCallback(() => {
    setBulkReasons([])
    setBulkAdminNotes('')
    setBulkStartDate('')
    setBulkEndDate('')
    setBulkIndefinitely(false)
  }, [])

  const closeBulkHideModal = useCallback(() => {
    setIsBulkHideModalOpen(false)
    resetBulkVisibilityModal()
  }, [resetBulkVisibilityModal])

  const closeBulkSuspendModal = useCallback(() => {
    setIsBulkSuspendModalOpen(false)
    resetBulkVisibilityModal()
  }, [resetBulkVisibilityModal])

  const closeEscalateModal = useCallback(() => {
    setIsEscalateModalOpen(false)
    setEscalateAdminNotes('')
    setSelectedEscalationOption('')
  }, [])

  const toIso = (value: string) =>
    value ? new Date(`${value}T00:00:00.000Z`).toISOString() : undefined

  const submitBulkVisibility = useCallback(
    (action: 'hide' | 'suspend') => {
      if (selectedSpaceIds.length === 0) return

      if (bulkReasons.length === 0) {
        toast.error('Please select at least one reason.')
        return
      }

      if (action === 'suspend' && !bulkIndefinitely && (!bulkStartDate || !bulkEndDate)) {
        toast.error('Please provide a suspension timeline or choose to suspend indefinitely.')
        return
      }

      if (action === 'suspend' && !bulkIndefinitely && isStartBeforeToday(bulkStartDate)) {
        toast.error(START_BEFORE_TODAY_MESSAGE)
        return
      }

      if (
        action === 'suspend' &&
        !bulkIndefinitely &&
        isEndOnOrBeforeStart(bulkStartDate, bulkEndDate)
      ) {
        toast.error(END_MUST_AFTER_START_MESSAGE)
        return
      }

      if (!bulkAdminNotes.trim()) {
        toast.error('Admin notes are required.')
        return
      }

      const reasonPayload =
        action === 'hide'
          ? buildHideReasonPayload(bulkReasons)
          : buildSuspendReasonPayload(bulkReasons)

      if (reasonPayload.selectedReasons.length === 0) {
        toast.error('Selected reasons are no longer available. Please refresh and try again.')
        return
      }

      const payload: UpdateVenueSpaceVisibilityPayload & { spaceIds: string[] } =
        action === 'hide'
          ? {
              spaceIds: selectedSpaceIds,
              action: 'hide',
              selectedReasons: reasonPayload.selectedReasons,
              reasonDetails: reasonPayload.reasonDetails,
              adminNotes: bulkAdminNotes.trim(),
            }
          : {
              spaceIds: selectedSpaceIds,
              action: 'suspend',
              selectedReasons: reasonPayload.selectedReasons,
              suspendIndefinitely: bulkIndefinitely,
              startDate: bulkIndefinitely ? undefined : toIso(bulkStartDate),
              endDate: bulkIndefinitely ? undefined : toIso(bulkEndDate),
              reasonDetails: reasonPayload.reasonDetails,
              adminNotes: bulkAdminNotes.trim(),
            }

      bulkVisibilityMutation.mutate(payload, {
        onSuccess: (response) => {
          if (reasonPayload.reasonIds.length > 0) {
            recordReasonUsage.mutate(reasonPayload.reasonIds)
          }
          const successCount =
            (response as { data?: { successCount?: number } })?.data?.successCount ??
            selectedSpaceIds.length
          toast.success(
            action === 'hide'
              ? `Hidden ${successCount} space(s) successfully`
              : `Suspended ${successCount} space(s) successfully`,
          )
          setSelectedSpaceIds([])
          if (action === 'hide') closeBulkHideModal()
          else closeBulkSuspendModal()
        },
        onError: (err) => toast.error(getApiErrorMessage(err)),
      })
    },
    [
      bulkAdminNotes,
      bulkEndDate,
      bulkIndefinitely,
      bulkReasons,
      bulkStartDate,
      bulkVisibilityMutation,
      buildHideReasonPayload,
      buildSuspendReasonPayload,
      closeBulkHideModal,
      closeBulkSuspendModal,
      recordReasonUsage,
      selectedSpaceIds,
    ],
  )

  const handleBulkExport = useCallback(() => {
    if (selectedSpaces.length === 0) {
      toast.error('Please select at least one space to export.')
      return
    }

    try {
      const headers = [
        'Space ID',
        'Space Name',
        'Venue ID',
        'Partner ID',
        'City',
        'State',
        'Capacity',
        'Weekday Price',
        'Weekend Price',
        'Status',
        'Hidden',
        'Suspended',
      ]
      const rows = selectedSpaces.map((space) => [
        space.spaceId,
        space.spaceName || 'N/A',
        venueId,
        partnerId || 'N/A',
        space.city || 'N/A',
        space.state || 'N/A',
        space.capacity == null ? 'N/A' : String(space.capacity),
        space.weekdayPrice == null ? 'N/A' : String(space.weekdayPrice),
        space.weekendPrice == null ? 'N/A' : String(space.weekendPrice),
        space.status || 'N/A',
        space.isHidden ? 'Yes' : 'No',
        space.isSuspend ? 'Yes' : 'No',
      ])
      exportDataToFile(headers, rows, fileFormat, 'venue_selected_spaces_export')
      toast.success(`Exported ${selectedSpaces.length} selected space(s)`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to export selected spaces.'))
    }
  }, [fileFormat, partnerId, selectedSpaces, venueId])

  const handleBulkNotify = useCallback(() => {
    if (!partnerId) {
      toast.error('Venue partner ID is missing.')
      return
    }
    const params = new URLSearchParams({
      channel: 'push',
      audience: 'venue-partners',
      partnerIds: partnerId,
    })
    navigate(`/communication/create?${params.toString()}`)
  }, [navigate, partnerId])

  const handleBulkMessage = useCallback(() => {
    if (!partnerId) {
      toast.error('Venue partner ID is missing.')
      return
    }
    const params = new URLSearchParams({
      channel: 'email',
      audience: 'venue-partners',
      partnerIds: partnerId,
    })
    navigate(`/communication/create?${params.toString()}`)
  }, [navigate, partnerId])

  const handleEscalateSubmit = useCallback(async () => {
    if (selectedSpaces.length === 0) {
      toast.error('Please select at least one space.')
      return
    }
    if (!selectedEscalationOption) {
      toast.error('Please select a sub-admin to assign.')
      return
    }
    if (!escalateAdminNotes.trim()) {
      toast.error('Admin notes are required.')
      return
    }

    const selectedAssignee = (assigneesData?.data ?? []).find(
      (item) => item.id === selectedEscalationOption,
    )
    const note = escalateAdminNotes.trim()
    setIsEscalating(true)

    try {
      const results = await Promise.allSettled(
        selectedSpaces.map((space) =>
          escalateVenueSpaceApplication(space.spaceId, {
            assigneeSubAdminId: selectedEscalationOption,
            assigneeName: selectedAssignee?.fullname || '',
            adminNote: note,
            entityTitle: space.spaceName,
            venueId,
            applicationUrl: `/venues/management/profile/${venueId}/space/${space.spaceId}`,
          }),
        ),
      )

      const successCount = results.filter((result) => result.status === 'fulfilled').length
      const failedCount = results.length - successCount

      if (successCount === 0) {
        const firstError = results.find((result) => result.status === 'rejected') as
          | PromiseRejectedResult
          | undefined
        toast.error(getApiErrorMessage(firstError?.reason, 'Failed to escalate spaces.'))
        return
      }

      toast.success(
        failedCount > 0
          ? `Escalated ${successCount} space(s); ${failedCount} failed.`
          : `Successfully escalated ${successCount} space(s)`,
      )
      setSelectedSpaceIds([])
      closeEscalateModal()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to escalate spaces.'))
    } finally {
      setIsEscalating(false)
    }
  }, [
    assigneesData?.data,
    closeEscalateModal,
    escalateAdminNotes,
    selectedEscalationOption,
    selectedSpaces,
    venueId,
  ])

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
            placeholder="Search by space name"
            className="placeholder:text-muted h-10 w-full rounded-md border border-white/10 bg-[#050505] pr-3 pl-11 text-[13px] text-white outline-none focus:border-[#E0A263]/50"
          />
        </div>
        <button
          type="button"
          onClick={onAdvancedFilter}
          className="ui-advance-filters ui-cta ui-cta-outline text-body-sm gap-2 px-4 font-semibold"
        >
          <AdvanceFilterIcon className="size-4 shrink-0" />
          Advance Filters
        </button>
      </div>

      <label className="text-body-sm text-muted mt-4 flex w-fit cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={allVisibleSelected}
          onChange={toggleSelectAll}
          className="ui-table-checkbox"
        />
        Select All
      </label>

      {selectedSpaceIds.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-blue-500 bg-blue-950/80 px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <CheckSquare className="size-3.5" aria-hidden="true" />
            <span>
              {selectedSpaceIds.length} {selectedSpaceIds.length === 1 ? 'Space' : 'Spaces'}{' '}
              Selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleBulkExport}
              title="Export selected spaces"
              className="flex size-8 items-center justify-center rounded-md bg-black text-white transition-colors hover:bg-white/10"
            >
              <ExportDataIcon className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                resetBulkVisibilityModal()
                setIsBulkHideModalOpen(true)
              }}
              title="Hide selected spaces"
              className="flex size-8 items-center justify-center rounded-md bg-black text-white transition-colors hover:bg-white/10"
            >
              <EyeOff className="size-3.5" aria-hidden="true" />
            </button>
            {allowDisableVenues ? (
              <button
                type="button"
                onClick={() => {
                  resetBulkVisibilityModal()
                  setIsBulkSuspendModalOpen(true)
                }}
                title="Suspend selected spaces"
                className="flex size-8 items-center justify-center rounded-md bg-black text-white transition-colors hover:bg-white/10"
              >
                <PauseCircle className="size-3.5" aria-hidden="true" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleBulkNotify}
              title="Notify venue partner"
              className="flex size-8 items-center justify-center rounded-md bg-black text-white transition-colors hover:bg-white/10"
            >
              <Bell className="size-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleBulkMessage}
              title="Message venue partner"
              className="flex size-8 items-center justify-center rounded-md bg-black text-white transition-colors hover:bg-white/10"
            >
              <Mail className="size-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setIsEscalateModalOpen(true)}
              title="Escalate selected spaces"
              className="flex size-8 items-center justify-center rounded-md bg-black text-white transition-colors hover:bg-white/10"
            >
              <CircleArrowOutUpRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {spaces.length === 0 ? (
          <p className="text-body-sm rounded-lg bg-[#050505] p-4 text-white/50">No spaces found.</p>
        ) : (
          spaces.map((space) => {
            const selected = selectedSpaceIds.includes(space.spaceId)
            const availabilityLabel = formatSpaceAvailabilityChip(space.availability)
            const listingStatus = getListingStatusDisplay(space.status, {
              isSuspend: space.isSuspend,
              isDeleted: space.isHidden,
            })
            return (
              <button
                key={space.spaceId}
                type="button"
                onClick={() => {
                  setSelectedSpaceId(space.spaceId)
                  navigate(`/venues/management/profile/${venueId}/space/${space.spaceId}`)
                }}
                className={cn(
                  'flex w-full items-center rounded-xl bg-[#050505] px-5 py-5 transition-colors hover:border hover:border-[#E0A263]/30',
                  selected && 'border border-blue-500 bg-blue-950/20',
                )}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => toggleSpaceSelection(space.spaceId)}
                  className="ui-table-checkbox"
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
                    <span className={cn('mt-1 inline-flex', listingStatus.className)}>
                      {space.isHidden ? 'Hidden' : listingStatus.label}
                    </span>

                    <p className="text-body-sm mt-1 text-white/50">
                      {[space.city, space.state].filter(Boolean).join(', ') || '—'}
                    </p>

                    <div className="text-body-sm mt-2 flex items-center gap-3 text-white/50">
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5" />
                        {renderCapacity(space.capacity)}
                      </span>

                      {availabilityLabel ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          {availabilityLabel}
                        </span>
                      ) : null}
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
            )
          })
        )}
      </div>

      <DecisionActionModal
        open={isBulkHideModalOpen}
        variant="suspend"
        title={
          selectedSpaceIds.length > 1 ? `Hide ${selectedSpaceIds.length} Spaces` : 'Hide Space'
        }
        headerDescription="Are you sure you want to hide the selected spaces? This will prevent them from appearing in partner-facing listings."
        description=""
        submitLabel={
          selectedSpaceIds.length > 1 ? `Hide ${selectedSpaceIds.length} Spaces` : 'Hide'
        }
        showHeroIcon={false}
        submitIcon="none"
        reasonOptions={hideReasonOptions}
        selectedReasons={bulkReasons}
        onReasonToggle={(value) =>
          setBulkReasons((current) =>
            current.includes(value)
              ? current.filter((item) => item !== value)
              : [...current, value],
          )
        }
        showReasonsLabel
        reasonLabel="Reasons"
        reasonRequired={false}
        adminNotes={bulkAdminNotes}
        onAdminNotesChange={setBulkAdminNotes}
        onClose={closeBulkHideModal}
        onSubmit={() => submitBulkVisibility('hide')}
        isSubmitting={bulkVisibilityMutation.isPending}
      />

      <DecisionActionModal
        open={isBulkSuspendModalOpen}
        variant="suspend"
        title={
          selectedSpaceIds.length > 1
            ? `Suspend ${selectedSpaceIds.length} Spaces`
            : 'Suspend Space'
        }
        headerDescription="Are you sure you want to suspend the selected spaces? This action will prevent new bookings and notify existing customers."
        description=""
        submitLabel={
          selectedSpaceIds.length > 1 ? `Suspend ${selectedSpaceIds.length} Spaces` : 'Suspend'
        }
        showHeroIcon={false}
        submitIcon="none"
        reasonOptions={suspendReasonOptions}
        selectedReasons={bulkReasons}
        onReasonToggle={(value) =>
          setBulkReasons((current) =>
            current.includes(value)
              ? current.filter((item) => item !== value)
              : [...current, value],
          )
        }
        showReasonsLabel
        reasonLabel="Reasons"
        reasonRequired={false}
        showTimeline
        startDate={bulkStartDate}
        onStartDateChange={setBulkStartDate}
        endDate={bulkEndDate}
        onEndDateChange={setBulkEndDate}
        indefinite={bulkIndefinitely}
        onIndefiniteChange={setBulkIndefinitely}
        adminNotes={bulkAdminNotes}
        onAdminNotesChange={setBulkAdminNotes}
        onClose={closeBulkSuspendModal}
        onSubmit={() => submitBulkVisibility('suspend')}
        isSubmitting={bulkVisibilityMutation.isPending}
      />

      <DecisionActionModal
        open={isEscalateModalOpen}
        variant="escalate"
        title={
          selectedSpaceIds.length > 1
            ? `Escalate ${selectedSpaceIds.length} Spaces`
            : 'Escalate Application'
        }
        description={
          selectedSpaceIds.length > 1
            ? `Are you sure you want to escalate ${selectedSpaceIds.length} selected spaces? These will be reviewed by the selected sub-admin.`
            : 'Are you sure you want to escalate this Application? This Post will be reviewed by the selected parties.'
        }
        submitLabel="Escalate"
        escalationOptions={escalationOptions}
        selectedEscalationOption={selectedEscalationOption}
        onEscalationOptionChange={setSelectedEscalationOption}
        adminNotes={escalateAdminNotes}
        onAdminNotesChange={setEscalateAdminNotes}
        onClose={closeEscalateModal}
        onSubmit={() => {
          void handleEscalateSubmit()
        }}
        isSubmitting={isEscalating}
      />

      {exportFilterModals}
    </div>
  )
}

function AnalyticsTab({ data, venueId }: { data: VenueFullView; venueId: string }) {
  const navigate = useNavigate()
  const { data: analyticsData, isLoading } = useVenueProfileAnalytics(venueId)
  const profileAnalytics = data?.profile as
    | (typeof data.profile & { analytics?: Record<string, unknown> })
    | undefined
  const venueAnalytics = profileAnalytics?.analytics
  const activeMetricIds = useActiveMetricIds(VENUE_PROFILE_ANALYTICS_MODULE_KEY, [
    ...DEFAULT_VENUE_PROFILE_ANALYTICS_METRIC_IDS,
  ])

  const filteredActiveMetricIds = useMemo(
    () =>
      sortIdsByCatalogOrder(
        [
          ...new Set(
            activeMetricIds
              .map((id) => VENUE_PROFILE_ANALYTICS_LEGACY_METRIC_ID_MAP[id] ?? id)
              .filter((id) => VENUE_PROFILE_ANALYTICS_METRIC_ID_SET.has(id)),
          ),
        ],
        VENUE_PROFILE_ANALYTICS_METRIC_IDS,
      ),
    [activeMetricIds],
  )

  const cards = useMemo(() => {
    const allCards = buildVenueProfileAnalyticsMetricCards(analyticsData, venueAnalytics)
    return orderByActiveMetricIds(allCards, filteredActiveMetricIds)
  }, [analyticsData, venueAnalytics, filteredActiveMetricIds])

  const manageMetricsPath = venueId
    ? `/metrics/venue-profile-analytics?returnTo=${encodeURIComponent(`/venues/management/profile/${venueId}`)}`
    : '/metrics/venue-profile-analytics'

  return (
    <div className={cn(PROFILE_CARD, 'p-6')}>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => navigate(manageMetricsPath)}
          className="ui-manage-metrics ui-cta ui-cta-primary"
        >
          <ManageMetricsIcon />
          Manage Metrics
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: filteredActiveMetricIds.length || 8 }).map((_, index) => (
              <div key={`analytics-card-skeleton-${index}`} className="rounded-lg bg-[#050505] p-4">
                <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
                <div className="mt-3 h-7 w-16 animate-pulse rounded bg-white/10" />
              </div>
            ))
          : cards.map((card) => (
              <div key={card.id} className="rounded-lg bg-[#050505] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-body-sm text-muted">{card.label}</p>
                  <VenueAnalyticsMetricIcon />
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

function HealthTab({
  reports,
  tickets,
  onOpenReport,
}: {
  reports: VenueReportItem[]
  tickets: SupportTicket[]
  onOpenReport: (report: VenueReportItem) => void
}) {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')

  const incidents = useMemo(() => {
    const reportRows = reports.map((report) => {
      const issue = String(report.issueType || '').toLowerCase()
      const status = String(report.investigationStatus || '').toLowerCase()
      const isViolation = VIOLATION_ISSUE_TYPES.has(issue) || OPEN_REPORT_STATUSES.has(status)
      return {
        id: report.id || report.reportId,
        kind: isViolation ? 'violation' : 'reported-against',
        type: isViolation ? 'Violation' : 'Reported Against',
        typeClass: isViolation
          ? 'bg-brand-danger/15 text-red-400'
          : 'bg-amber-500/15 text-amber-300',
        status: report.investigationStatus || 'New',
        statusClass: OPEN_REPORT_STATUSES.has(status)
          ? 'border-red-500/40 text-red-400'
          : 'border-emerald-500/40 text-brand-positive',
        title: report.issueType || 'Venue report',
        detail: report.reason || 'No reason provided.',
        raisedOn: report.submittedAt || report.createdAt,
        action: 'View Details',
        icon: Eye,
        onAction: () => onOpenReport(report),
      }
    })

    const ticketRows = tickets.map((ticket) => ({
      id: ticket.id,
      kind: 'reported-by',
      type: 'Report By',
      typeClass: 'bg-blue-500/15 text-blue-400',
      status: ticket.status,
      statusClass: ACTIVE_TICKET_STATUSES.has(String(ticket.status).toLowerCase())
        ? 'border-amber-500/40 text-amber-300'
        : 'border-emerald-500/40 text-brand-positive',
      title: ticket.subject,
      detail: ticket.issueType || ticket.category || 'Support ticket',
      raisedOn: ticket.createdAt,
      action: 'View Ticket',
      icon: FileText,
      onAction: () => navigate(`/support/tickets/${ticket.id}`),
    }))

    return [...reportRows, ...ticketRows]
  }, [navigate, onOpenReport, reports, tickets])

  const visible = incidents.filter((item) => filter === 'all' || item.kind === filter)
  const atRisk =
    reports.some((report) =>
      OPEN_REPORT_STATUSES.has(String(report.investigationStatus || '').toLowerCase()),
    ) || tickets.some((ticket) => ACTIVE_TICKET_STATUSES.has(String(ticket.status).toLowerCase()))

  return (
    <div className={cn(PROFILE_CARD, 'p-6')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'violation', label: 'Violation' },
            { key: 'reported-against', label: 'Reported Against' },
            { key: 'reported-by', label: 'Report By' },
          ].map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => setFilter(chip.key)}
              className={cn(
                'rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors',
                filter === chip.key ? PROFILE_ACTIVE_PILL : PROFILE_IDLE_PILL,
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <span
          className={cn(
            'rounded-full px-3.5 py-1 text-xs font-semibold text-white',
            atRisk
              ? 'border border-[#5C1D1D]/50 bg-[#3D1414]'
              : 'border border-[#1E563D]/50 bg-[#143D2B]',
          )}
        >
          Profile Health: {atRisk ? 'At Risk' : 'Healthy'}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {visible.length === 0 ? (
          <p className="text-body-sm rounded-lg bg-[#050505] p-6 text-center text-white/50">
            No reported issues for this venue.
          </p>
        ) : (
          visible.map((incident) => (
            <div key={`${incident.kind}-${incident.id}`} className="rounded-xl bg-[#050505] p-5">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'rounded-full px-3 py-0.5 text-[11px] font-semibold',
                    incident.typeClass,
                  )}
                >
                  {incident.type}
                </span>
                <span
                  className={cn(
                    'rounded-full px-3 py-0.5 text-[11px] font-semibold',
                    incident.statusClass,
                  )}
                >
                  {incident.status}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-white">{incident.title}</p>
                  <p className="text-body-sm mt-1 text-white/50">{incident.detail}</p>
                  <p className="mt-3 text-xs text-white/40">
                    Raised On: {incident.raisedOn || '—'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={incident.onAction}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] px-4 py-2 text-xs font-semibold text-[#050505] transition-[filter] hover:brightness-95"
                >
                  <incident.icon className="size-3.5" />
                  {incident.action}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function VenueProfileViewPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { fileFormat, option: exportFormat } = useDefaultExportFormat()
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
  const [notesModalOpen, setNotesModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<VenueReportItem | null>(null)
  const [reportVenueOpen, setReportVenueOpen] = useState(false)
  const scrollToTimelineRef = useRef(false)
  const { tagModalOpen, openTagModal, closeTagModal } = useEntityTags()
  const authUser = useAuthStore((state) => state.user)

  const suspendExpertMutation = useSuspendExpert()
  const deactivateExpertMutation = useDeactivateExpert()
  const setVenueOwnerPasswordMutation = useSetVenueOwnerPassword()
  const blockExpertMutation = useBlockExpert()
  const forceLogoutExpertMutation = useForceLogoutExpert()
  const recordReasonUsage = useRecordModerationReasonUsage()
  const { options: suspendReasonOptions, buildPayload: buildSuspendReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.suspendExpert)
  const { options: deleteReasonOptions, buildPayload: buildDeleteReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.deleteExpert)

  const { data, isLoading, isError, error } = useVenueFullView(venueId)
  const fullView = data?.data
  const resolvedVenueId = String(fullView?.overview?.venue?._id || venueId || '').trim()
  const kycFallbackQuery = useQuery({
    queryKey: ['venue-kyc-by-partner', venueId],
    queryFn: () => fetchVenueKycByPartnerId(venueId!),
    enabled: Boolean(isError && venueId),
    retry: false,
  })
  const fallbackKycId = String(kycFallbackQuery.data?.data?._id || '').trim()
  const kycLookupPending = Boolean(
    isError && venueId && (kycFallbackQuery.isPending || fallbackKycId),
  )

  useEffect(() => {
    if (!venueId || !resolvedVenueId || resolvedVenueId === venueId) return
    navigate(`/venues/management/profile/${resolvedVenueId}`, { replace: true })
  }, [navigate, resolvedVenueId, venueId])

  useEffect(() => {
    if (!fallbackKycId) return
    const fallbackStatus = String(kycFallbackQuery.data?.data?.status || '')
    if (!isSubmittedKycStatus(fallbackStatus)) return
    navigate(`/experts/management/application/${fallbackKycId}?source=venue_kyc`, { replace: true })
  }, [fallbackKycId, kycFallbackQuery.data?.data?.status, navigate])

  const ownerPartnerId = String(
    fullView?.overview?.venue?.ownerId || fullView?.overview?.venue?.partnerId || '',
  ).trim()
  const ownerPartnerExists =
    fullView?.ownerPartnerExists ??
    fullView?.overview?.venue?.ownerPartnerExists ??
    Boolean(ownerPartnerId)

  const updateNotesMutation = useUpdateVenueOwnerAdminNotes(ownerPartnerId)
  const updateTagsMutation = useUpdateVenueOwnerAdminTags(ownerPartnerId)
  const { data: reportsRes, refetch: refetchReports } = useVenueReportsForVenue(resolvedVenueId)
  const { data: ticketsRes, isLoading: ticketsLoading } = useQuery({
    queryKey: ['venue-support-tickets', ownerPartnerId],
    queryFn: () =>
      fetchSupportTickets({
        reporterId: ownerPartnerId,
        includeClosed: true,
        limit: 50,
      }),
    enabled: Boolean(ownerPartnerId),
  })

  const reports = useMemo(() => unwrapVenueReportItems(reportsRes), [reportsRes])
  const allTickets = useMemo(() => ticketsRes?.data?.tickets ?? [], [ticketsRes])
  const activeTickets = useMemo(
    () =>
      allTickets.filter((ticket) =>
        ACTIVE_TICKET_STATUSES.has(String(ticket.status).toLowerCase()),
      ),
    [allTickets],
  )
  const timelineEvents = useMemo(
    () => (fullView ? buildVenueTimelineEvents(fullView, allTickets, reports) : []),
    [allTickets, fullView, reports],
  )

  useEffect(() => {
    if (!scrollToTimelineRef.current || activeTab !== 'overview') return
    document
      .getElementById('venue-timeline')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    scrollToTimelineRef.current = false
  }, [activeTab])

  const ensureOwnerPartner = useCallback(() => {
    if (!ownerPartnerId) {
      toast.error('This venue has no linked owner account.')
      return null
    }
    if (!ownerPartnerExists) {
      toast.error(
        'Owner partner account was permanently deleted from auth. Suspend, block, logout, delete, and password reset are unavailable until the venue is re-linked to a partner.',
      )
      return null
    }
    return ownerPartnerId
  }, [ownerPartnerExists, ownerPartnerId])

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
  }, [])

  const handleCheckTimelines = useCallback(() => {
    const scrollToTimeline = () => {
      document
        .getElementById('venue-timeline')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    if (activeTab === 'overview') {
      scrollToTimeline()
      return
    }
    scrollToTimelineRef.current = true
    setActiveTab('overview')
  }, [activeTab])

  const handleSaveNotes = useCallback(
    (notes: string) => {
      if (!ownerPartnerId) {
        toast.error('This venue has no linked owner account.')
        return
      }
      updateNotesMutation.mutate(notes, {
        onSuccess: () => {
          toast.success('Admin notes saved')
          setNotesModalOpen(false)
        },
        onError: (err: unknown) => {
          toast.error(getApiErrorMessage(err, 'Failed to save admin notes'))
        },
      })
    },
    [ownerPartnerId, updateNotesMutation],
  )

  const handleSaveTags = useCallback(
    async (tags: string[]) => {
      if (!ownerPartnerId) {
        toast.error('This venue has no linked owner account.')
        return
      }
      await updateTagsMutation.mutateAsync(tags)
      toast.success('Tags updated')
    },
    [ownerPartnerId, updateTagsMutation],
  )

  const handleExportProfile = useCallback(() => {
    if (!fullView) return
    const venue = fullView.overview.venue
    const profile = fullView.profile
    const venueCode = `VEN-${String(resolvedVenueId).slice(-4).toUpperCase()}`
    const ratings = profile?.ratings ?? venue.ratings
    const satisfaction = profile?.clientSatisfaction
    const years =
      profile?.yearsInOperation?.years != null ? `${profile.yearsInOperation.years} Years` : ''
    const kycLabel = formatVenueKycStatusLabel(profile?.kycStatus)

    try {
      exportDataToFile(
        [
          'Name',
          'Venue ID',
          'Type',
          'City',
          'Ratings',
          'Client Satisfaction',
          'Years in Operation',
          'Earnings',
          'Bookings',
          'KYC',
          'Last Active',
          'Notes',
          'Tags',
        ],
        [
          [
            exportCell(venue.name),
            exportCell(venueCode),
            exportCell(profile?.venueType || venue.venueType),
            exportCell(profile?.primaryCity || venue.location?.city),
            exportCell(ratings),
            exportCell(satisfaction),
            exportCell(years),
            exportCell(profile?.totalEarnings),
            exportCell(profile?.totalBookings),
            exportCell(kycLabel),
            exportCell(venue.lastActiveAt || venue.updatedAt),
            exportCell(venue.adminInternalNotes),
            exportCell((venue.adminTags || []).join(', ')),
          ],
        ],
        fileFormat,
        `venue_${venueCode}_profile`,
      )
      toast.success(`Profile exported as ${exportFormat}`)
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'NO_RECORDS') {
        toast.error('Nothing to export')
        return
      }
      toast.error(getApiErrorMessage(err, 'Failed to export profile'))
    }
  }, [exportFormat, fileFormat, fullView, resolvedVenueId])

  const handlePasswordSubmit = useCallback(
    async (payload: { oldPassword: string; newPassword: string; confirmNewPassword: string }) => {
      const partnerId = ensureOwnerPartner()
      if (!partnerId) return

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
        toast.error(getApiErrorMessage(err, 'Failed to update password'))
      }
    },
    [ensureOwnerPartner, setVenueOwnerPasswordMutation],
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
    const ownerId = ensureOwnerPartner()
    if (!ownerId) return

    if (suspendReasons.length === 0) {
      toast.error('Please select at least one reason.')
      return
    }

    if (!suspendIndefinitely && (!suspendStartDate || !suspendEndDate)) {
      toast.error('Please provide a suspension timeline or choose to suspend indefinitely.')
      return
    }

    if (!suspendIndefinitely && isStartBeforeToday(suspendStartDate)) {
      toast.error(START_BEFORE_TODAY_MESSAGE)
      return
    }

    if (!suspendIndefinitely && isEndOnOrBeforeStart(suspendStartDate, suspendEndDate)) {
      toast.error(END_MUST_AFTER_START_MESSAGE)
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

    suspendExpertMutation.mutate(
      {
        id: ownerId,
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
          toast.success('Owner suspended successfully')
          closeSuspendModal()
          setProfileMenuOpen(false)
          queryClient.invalidateQueries({ queryKey: ['venue-full-view', resolvedVenueId] })
          queryClient.invalidateQueries({ queryKey: ['venues'] })
          queryClient.invalidateQueries({ queryKey: ['experts'] })
          queryClient.invalidateQueries({ queryKey: ['expert-profile', ownerId] })
        },
        onError: (err: unknown) => {
          const apiError = err as { response?: { data?: { message?: string } } }
          toast.error(getApiErrorMessage(apiError, 'Failed to suspend user. Please try again.'))
        },
      },
    )
  }, [
    buildSuspendReasonPayload,
    closeSuspendModal,
    ensureOwnerPartner,
    queryClient,
    recordReasonUsage,
    resolvedVenueId,
    suspendAdminNotes,
    suspendEndDate,
    suspendExpertMutation,
    suspendIndefinitely,
    suspendReasonDetails,
    suspendReasons,
    suspendStartDate,
  ])

  const handleDeleteSubmit = useCallback(() => {
    const ownerId = ensureOwnerPartner()
    if (!ownerId) return

    if (deleteReasons.length === 0) {
      toast.error('Please select at least one reason.')
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

    deactivateExpertMutation.mutate(
      {
        id: ownerId,
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
          toast.success('Owner deleted successfully')
          closeDeleteModal()
          setProfileMenuOpen(false)
          queryClient.invalidateQueries({ queryKey: ['venues'] })
          queryClient.invalidateQueries({ queryKey: ['experts'] })
          navigate('/venues/management')
        },
        onError: (err: unknown) => {
          const apiError = err as { response?: { data?: { message?: string } } }
          toast.error(getApiErrorMessage(apiError, 'Failed to delete user.'))
        },
      },
    )
  }, [
    buildDeleteReasonPayload,
    closeDeleteModal,
    deactivateExpertMutation,
    deleteAdminNotes,
    deleteReasons,
    ensureOwnerPartner,
    navigate,
    queryClient,
    recordReasonUsage,
  ])

  if (isLoading || kycLookupPending) {
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
          {getApiErrorMessage(error, 'Unable to load venue profile.')}
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
      onClick: () =>
        navigate(`/venues/management/create?venueId=${resolvedVenueId}&mode=add-space`),
    },
    { label: 'Add Notes', icon: FileText, onClick: () => setNotesModalOpen(true) },
    {
      label: 'Add Tags',
      icon: Tag,
      onClick: () => openTagModal(ownerPartnerId || resolvedVenueId || venue.name),
    },
    { label: 'Export Data', icon: Upload, onClick: handleExportProfile },
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
          <div className="pl-7">
            <PageBreadcrumb
              items={[
                { label: 'Venue Management', to: '/venues/management' },
                { label: 'Manage Venues', to: '/venues/management' },
                { label: venue.name, isActive: true },
              ]}
            />
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
            icon={<img src={editIcon} alt="edit" className="size-3.5" />}
            onClick={() => {
              setProfileMenuOpen(false)
              navigate(`/venues/management/create?venueId=${resolvedVenueId}&mode=edit`)
            }}
          >
            Edit Profile
          </TableActionsItem>
          <TableActionsItem
            tone="light"
            icon={<Eye className="size-3.5" />}
            onClick={() => {
              setProfileMenuOpen(false)
              if (!ensureOwnerPartner()) return
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
              const ownerId = ensureOwnerPartner()
              if (!ownerId) return
              forceLogoutExpertMutation.mutate(ownerId, {
                onSuccess: (res) => {
                  toast.success(
                    res?.message ||
                      'Owner sessions revoked. They will be logged out on the next app request.',
                  )
                },
                onError: (err: unknown) => {
                  toast.error(getApiErrorMessage(err, 'Failed to logout user'))
                },
              })
            }}
          >
            Logout User
          </TableActionsItem>
          <TableActionsItem
            tone="light"
            icon={<Ban className="size-3.5" />}
            onClick={() => {
              setProfileMenuOpen(false)
              if (!ensureOwnerPartner()) return
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
              const ownerId = ensureOwnerPartner()
              if (!ownerId) return
              blockExpertMutation.mutate(ownerId, {
                onSuccess: (res) => {
                  toast.success(res?.message || 'Owner blocked successfully')
                },
                onError: (err: unknown) => {
                  toast.error(getApiErrorMessage(err, 'Failed to block user'))
                },
              })
            }}
          >
            Block User
          </TableActionsItem>
          <TableActionsItem
            tone="light"
            icon={<Flag className="size-3.5" />}
            onClick={() => {
              setProfileMenuOpen(false)
              if (!resolvedVenueId) {
                toast.error('Venue ID is missing.')
                return
              }
              if (!ownerPartnerId) {
                toast.error('Venue partner ID is missing.')
                return
              }
              if (!authUser?.id) {
                toast.error('Admin session is required to report a venue.')
                return
              }
              setReportVenueOpen(true)
            }}
          >
            Report Venue
          </TableActionsItem>
          <TableActionsItem
            tone="light"
            icon={<img src={deleteIcon} alt="delete" className="size-3.5" />}
            className="text-red-500 hover:bg-red-50 hover:text-red-600 [&_svg]:text-red-500"
            onClick={() => {
              setProfileMenuOpen(false)
              if (!ensureOwnerPartner()) return
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
                {action.label.toLowerCase().includes('export') ? (
                  <ExportDataIcon className="size-3 shrink-0" />
                ) : (
                  <action.icon className="size-3 shrink-0" strokeWidth={2.25} />
                )}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 @min-[900px]/main:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <ProfileSidebar
          data={fullView}
          tickets={activeTickets}
          ticketsLoading={ticketsLoading}
          onCheckTimelines={handleCheckTimelines}
        />

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

          {activeTab === 'overview' && (
            <OverviewTab
              data={fullView}
              venueId={resolvedVenueId}
              tags={fullView.overview.venue.adminTags ?? []}
              timelineEvents={timelineEvents}
            />
          )}
          {activeTab === 'spaces' && <SpacesTab data={fullView} venueId={resolvedVenueId} />}
          {activeTab === 'analytics' && <AnalyticsTab data={fullView} venueId={resolvedVenueId} />}
          {activeTab === 'health' && (
            <HealthTab reports={reports} tickets={allTickets} onOpenReport={setSelectedReport} />
          )}
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
        title="Suspend User"
        description="Are you sure you want to suspend this user? This will restrict the owner partner account."
        submitLabel="Suspend User"
        reasonOptions={suspendReasonOptions}
        selectedReasons={suspendReasons}
        onReasonToggle={toggleSuspendReason}
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
        isSubmitting={suspendExpertMutation.isPending}
      />

      <DecisionActionModal
        open={deleteModalOpen}
        variant="delete"
        title="Delete User"
        description="Are you sure you want to delete this user? This will result in removal of the account."
        submitLabel="Delete User"
        submitIcon="x"
        heroLayout="stack"
        reasonOptions={deleteReasonOptions}
        selectedReasons={deleteReasons}
        onReasonToggle={toggleDeleteReason}
        showReasonsLabel={false}
        adminNotes={deleteAdminNotes}
        onAdminNotesChange={setDeleteAdminNotes}
        onClose={closeDeleteModal}
        onSubmit={handleDeleteSubmit}
        isSubmitting={deactivateExpertMutation.isPending}
      />

      <AddTagModal
        open={tagModalOpen}
        onClose={closeTagModal}
        initialTags={fullView.overview.venue.adminTags ?? []}
        onSubmit={handleSaveTags}
      />

      <AdminNotesModal
        open={notesModalOpen}
        initialNotes=""
        onClose={() => setNotesModalOpen(false)}
        onSubmit={handleSaveNotes}
      />

      <VenueReportDetailModal
        report={selectedReport}
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        onUpdated={() => {
          void refetchReports()
        }}
      />

      {reportVenueOpen && authUser && resolvedVenueId ? (
        <VenueReportSubmitModal
          open={reportVenueOpen}
          venueId={resolvedVenueId}
          partnerId={ownerPartnerId}
          venueName={venue.name}
          reporterId={authUser.id}
          reporterName={authUser.fullname || authUser.email || 'Admin'}
          onClose={() => setReportVenueOpen(false)}
          onSubmitted={() => {
            void refetchReports()
            navigate('/venues/management/reported')
          }}
        />
      ) : null}
    </div>
  )
}
