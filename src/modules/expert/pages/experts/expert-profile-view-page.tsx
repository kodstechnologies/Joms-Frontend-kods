import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useParams, type NavigateFunction } from 'react-router-dom'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { PageBreadcrumb } from '@/shared/components/navigation/page-breadcrumb'
import { useQueryClient } from '@tanstack/react-query'
import deleteIcon from '@/assets/JOMS_ICONS-2/icons8-delete.svg'
import editIcon from '@/assets/JOMS_ICONS-2/edit-text.svg'
import notepadIcon from '@/assets/JOMS_ICONS-2/icons8-notepad-24.svg'
import bagSolidIcon from '@/assets/JOMS_ICONS-2/basil-bag-solid.svg'
import { toast } from 'sonner'
import { useDefaultExportFormat } from '@/modules/settings/hooks/use-default-export-format'
import {
  AlertOctagon,
  ArrowLeft,
  Ban,
  Bell,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  CircleArrowOutUpRight,
  CircleMinus,
  Clock,
  Eye,
  EyeOff,
  FileText,
  ImageOff,
  Languages,
  Mail,
  PauseCircle,
  Pencil,
  Phone,
  Plus,
  RotateCw,
  Search,
  Share2,
  Star,
  Tag,
  Trash2,
  Upload,
  User,
  Users,
  X,
} from 'lucide-react'
import {
  AdvanceFilterIcon,
  ExportDataIcon,
  ManageMetricsIcon,
} from '@/shared/components/icons/action-button-icons'

import { fetchConsultationById, fetchServiceById } from '../../api/service-api'
import {
  consultationPerformancePath,
  getExpertServiceDrilldownPath,
  getServiceManagementViewPath,
  isPendingListingReview,
} from '../../lib/service-navigation'
import { openExpertKycFromProfile } from '../../utils/expert-application-navigation'
import { LOOKS_LIKE_CATEGORY_ID } from '../../utils/expert-application-helpers'
import {
  useDeactivateExpert,
  useSetExpertPassword,
  useSuspendExpert,
  useBlockExpert,
  useForceLogoutExpert,
} from '../../hooks/use-expert'
import {
  useDeleteService,
  useUpdateConsultationStatus,
  useBulkDeleteServices,
  useBulkPauseServices,
  useBulkHideServices,
  useBulkDisableServices,
} from '../../hooks/use-services'
import { usePauseConsultationListing } from '../../hooks/use-consultation-drilldown'
import { useEscalationAssignees } from '@/modules/my-tasks/hooks/use-admin-escalation'
import { escalateServiceApplication } from '@/modules/my-tasks/api/escalation-api'
import { exportDataToFile } from '@/shared/utils/export-utils'
import { buildExpertProfileServicesQueryParams } from '@/shared/utils/export-filter-utils'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { useServiceListingControls } from '@/modules/settings/hooks/use-service-public-settings'
import { RESTRICTION_MESSAGES } from '@/modules/settings/hooks/use-app-restrictions'
import {
  useExpertAnalytics,
  useExpertAvailability,
  useExpertConsultations,
  useExpertCustomLink,
  useExpertProfile,
  useExpertReportsForPartner,
  useExpertServices,
  usePartnerInsights,
  useUpdateExpertAdminNotes,
  useUpdateExpertAdminTags,
  useUpdateExpertCustomLinkVisibility,
} from '../../hooks/use-expert-profile'
import { useExpertLeaderboardProfile } from '../../hooks/use-leaderboard'
import {
  DEFAULT_EXPERT_PROFILE_ANALYTICS_METRIC_IDS,
  EXPERT_PROFILE_ANALYTICS_LEGACY_METRIC_ID_MAP,
  EXPERT_PROFILE_ANALYTICS_METRIC_ID_SET,
  EXPERT_PROFILE_ANALYTICS_METRIC_IDS,
  EXPERT_PROFILE_ANALYTICS_MODULE_KEY,
} from '../../config/expert-profile-analytics-metrics.config'
import { orderByActiveMetricIds, useActiveMetricIds } from '../../hooks/use-active-metric-ids'
import { VenueAnalyticsMetricIcon } from '../../components/venue-analytics'
import { buildExpertProfileAnalyticsMetricCards } from '../../utils/expert-profile-analytics-metrics'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import type {
  ExpertAnalyticsData,
  ExpertConsultation,
  ExpertProfileDetail,
  ExpertService,
  ExpertWorkExperience,
  PartnerInsightReview,
} from '../../type/expert-profile'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import { PauseCategoryModal } from '../../components/category/pause-category-modal'
import { AddTagModal } from '@/shared/components/modal/add-tag-modal'
import { ShareProfileModal } from '@/shared/components/modal/share-profile-modal'
import { CustomUrlModal } from '../../components/custom-url-modal'
import { AdminNotesModal } from '@/modules/settings/components/admin-notes-modal'
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
import { formatListingExpertId } from './expert-list-format'
import { useEntityTags } from '@/shared/hooks/use-entity-tags'
import { cn } from '@/shared/lib/cn'
import {
  getListingStatusDisplay,
  getProfileServiceListingStatusDisplay,
} from '../../utils/management-status'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import type { FilterValues } from '@/shared/types/data-filter'
import { fetchSupportTickets } from '@/modules/support-management/api/support-api'
import type { SupportTicket } from '@/modules/support-management/types/support'
import {
  ExpertReportDetailModal,
  type ExpertReportItem,
} from '../../components/expert-report-detail-modal'
import type { PartnerAvailability } from '../../api/expert-api'
import { useQuery } from '@tanstack/react-query'
import { SafeImage } from '@/shared/components/media/safe-image'

type TabKey = 'overview' | 'service-listings' | 'availability' | 'analytics' | 'health'

type ListingSubTab = 'services' | 'consultations'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'service-listings', label: 'Service Listings' },
  { key: 'availability', label: 'Availability' },
  { key: 'analytics', label: 'Service Analytics' },
  { key: 'health', label: 'Profile Health' },
]

const PROFILE_BTN_PRIMARY =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] px-3 py-1.5 text-[12px] font-semibold text-[#050505] transition-[filter] hover:brightness-95'

/** Figma Profile & Account — View (48×25 · radius 8 · solid #F6CB86) */
const PROFILE_BTN_VIEW =
  'inline-flex h-[25px] min-w-[48px] items-center justify-center rounded-[8px] bg-[#F6CB86] px-2.5 text-[12px] font-semibold leading-[14px] tracking-normal text-black transition-[filter] hover:brightness-95'

/** Figma Profile & Account — Check Timelines (110×30 · radius 10 · gold gradient) */
const PROFILE_BTN_CHECK_TIMELINES =
  'inline-flex h-[30px] min-w-[110px] items-center justify-center gap-2.5 rounded-[10px] bg-[linear-gradient(90deg,#F6CB86_0%,#E0A263_100%)] px-2.5 text-[12px] font-semibold leading-[14px] tracking-normal text-[#050505] transition-[filter] hover:brightness-95'

const PROFILE_HEADER_BTN =
  'inline-flex h-[25px] items-center justify-center gap-1.5 rounded-[12px] bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] px-3 text-[11px] leading-none font-semibold whitespace-nowrap text-[#050505] transition-[filter] hover:brightness-95'

const PROFILE_CARD = 'rounded-[10px] bg-[#141414]'

const PROFILE_ACTIVE_PILL = 'bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] text-[#050505]'

const PROFILE_IDLE_PILL = 'border border-[#FFFFFF33] bg-[#050505] text-white hover:bg-white/5'

/** Figma Profile Health — type/status chips (height 25 · radius 10 · padding 10) */
const PROFILE_HEALTH_CHIP =
  'inline-flex h-[25px] items-center justify-center rounded-[10px] px-[10px] text-[12px] leading-[12px] font-semibold tracking-normal whitespace-nowrap text-white'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
const ACTIVE_TICKET_STATUSES = new Set(['open', 'in_progress', 'on_hold', 'waiting'])
const OPEN_REPORT_STATUSES = new Set([
  'new',
  'under review',
  'waiting for response',
  'escalated',
  'open',
])
const VIOLATION_ISSUE_TYPES = new Set(['fraud', 'misconduct', 'spam', 'fake profile', 'harassment'])

const resolveCustomUrl = (profile: ExpertProfileDetail, analytics?: ExpertAnalyticsData) =>
  profile.customUrl ||
  profile.customLink ||
  profile.profileUrl ||
  profile.shareUrl ||
  analytics?.profileSummary?.customUrl ||
  (analytics as unknown as { profileHeader?: { customUrl?: string } })?.profileHeader?.customUrl ||
  null

const unwrapReportItems = (payload: unknown): ExpertReportItem[] => {
  const root = payload as { data?: { items?: ExpertReportItem[] }; items?: ExpertReportItem[] }
  if (Array.isArray(root?.data?.items)) return root.data.items
  if (Array.isArray(root?.items)) return root.items
  return []
}

const formatClock = (value?: string | null) => {
  if (!value) return '—'
  const raw = String(value).trim()
  if (/[ap]m/i.test(raw)) return raw
  const [hours, minutes] = raw.split(':').map(Number)
  if (Number.isNaN(hours)) return raw
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${String(minutes || 0).padStart(2, '0')} ${suffix}`
}

const exportCell = (value: unknown) => {
  if (value == null) return ''
  if (typeof value === 'string' && value.trim() === '') return ''
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

const buildExpertTimelineEvents = (
  profile: ExpertProfileDetail,
  tickets: SupportTicket[],
  reports: ExpertReportItem[],
) => {
  const events: Array<{ id: string; title: string; detail?: string; at?: string }> = []
  const createdAt = profile.createdAt
  const createdMs = createdAt ? new Date(createdAt).getTime() : NaN

  const kycApproved =
    profile.finalReview?.approvalStatus === 'approved' ||
    profile.finalReview?.isVerified === true ||
    String(profile.kycStatus || '').toLowerCase() === 'verified'
  if (kycApproved) {
    events.push({
      id: 'kyc-verified',
      title: 'KYC verified',
      detail: profile.finalReview?.approvalStatus || profile.kycStatus || 'Approved',
      at: profile.updatedAt || createdAt,
    })
  }

  const lastActive = profile.lastActiveAt
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
      title: 'Expert report',
      detail: report.issueType || report.reason,
      at: report.submittedAt || report.latestActionTimestamp,
    })
  })

  if (events.length === 0) return []

  if (createdAt) {
    events.push({
      id: 'account-created',
      title: 'Account created',
      at: createdAt,
    })
  }

  return events.sort((a, b) => {
    const aTime = a.at ? new Date(a.at).getTime() : 0
    const bTime = b.at ? new Date(b.at).getTime() : 0
    return aTime - bTime
  })
}

const toIso = (date: string) => new Date(date).toISOString()

const viewExpertService = async (
  service: ExpertService,
  expertId: string,
  navigate: NavigateFunction,
) => {
  if (!service._id) {
    toast.error('Service not found')
    return
  }

  try {
    await fetchServiceById(service._id)
    const isPending = isPendingListingReview(service.status)
    navigate(
      isPending
        ? getServiceManagementViewPath({
            _id: service._id,
            serviceType: 'Service',
            partnerId: expertId,
          })
        : getExpertServiceDrilldownPath(
            {
              _id: service._id,
              serviceType: 'Service',
              partnerId: expertId,
            },
            expertId,
          ),
    )
  } catch {
    toast.error('Service not found')
  }
}

const viewExpertConsultation = async (
  consultation: ExpertConsultation,
  expertId: string,
  navigate: NavigateFunction,
) => {
  if (!consultation._id) {
    toast.error('Consultation not found')
    return
  }

  try {
    await fetchConsultationById(consultation._id)
    const isPendingReview = (consultation.status || '').toLowerCase() === 'submitted'
    navigate(
      isPendingReview
        ? getServiceManagementViewPath({
            _id: consultation._id,
            serviceType: 'Consultation',
            partnerId: expertId,
          })
        : consultationPerformancePath(expertId, consultation._id),
    )
  } catch {
    toast.error('Consultation not found')
  }
}

const formatExpertId = formatListingExpertId

const formatExperience = (years?: number, months?: number) => {
  if (!years && !months) return '—'
  const parts: string[] = []
  if (years) parts.push(`${years} Year${years === 1 ? '' : 's'}`)
  if (months) parts.push(`${months} Month${months === 1 ? '' : 's'}`)
  return parts.join(' ')
}

const formatWorkDate = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
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

const formatWorkPeriod = (entry: ExpertWorkExperience) => {
  const start = formatWorkDate(entry.startDate)
  const end = entry.currentlyWorking ? 'Present' : formatWorkDate(entry.endDate) || '—'
  if (!start) return '—'
  return `${start}- ${end}`
}

const formatLastActive = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getKycBadge = (finalReview?: { isVerified?: boolean; approvalStatus?: string }) => {
  if (finalReview?.approvalStatus === 'approved') {
    return {
      label: 'KYC Verified',
      className:
        'inline-flex h-[25px] items-center justify-center rounded-[10px] bg-[#00A63E4D] px-2.5 text-[12px] font-semibold leading-[14px] tracking-normal text-white',
    }
  }
  return {
    label: 'Review Pending',
    className:
      'inline-flex h-[25px] items-center justify-center rounded-[10px] border border-amber-500/30 bg-amber-500/15 px-2.5 text-[12px] font-semibold leading-[14px] tracking-normal text-amber-300',
  }
}

const formatServiceType = (value?: string) => {
  if (!value) return '—'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const formatExpertCategory = (basic?: ExpertProfileDetail['basicProfile']) => {
  const displayed = Array.isArray(basic?.serviceCategoryDisplay) ? basic.serviceCategoryDisplay : []
  const stored = Array.isArray(basic?.serviceCategory) ? basic.serviceCategory : []
  const names = [...displayed, ...stored]
    .map((item) => {
      if (typeof item === 'string') return item.trim()
      if (item && typeof item === 'object' && 'name' in item) {
        return String((item as { name?: string }).name || '').trim()
      }
      return String(item || '').trim()
    })
    .filter((name) => name && !LOOKS_LIKE_CATEGORY_ID.test(name))
  const unique = [...new Set(names)]
  return unique.length > 0 ? unique.join(', ') : '—'
}

const formatPricingType = (value?: string) => {
  if (!value) return '—'
  return value
    .split(/[_\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

const formatPricing = (option: { durationMinutes: number; pricingType: string; price: number }) => {
  const mins = `${option.durationMinutes}mins`
  if (option.pricingType === 'free' || option.price === 0) {
    return `${mins} (Free)`
  }
  return `${mins} (₹${option.price.toLocaleString('en-IN')})`
}

function SidebarRow({
  label,
  children,
  emphasizeLabel = false,
}: {
  label: string
  children: ReactNode
  emphasizeLabel?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-2 py-3 sm:items-center">
      <span
        className={cn(
          'max-w-[45%] shrink-0 text-[14px] leading-[14px] tracking-normal sm:text-[16px]',
          emphasizeLabel ? 'font-semibold text-white' : 'font-normal text-white/50',
        )}
      >
        {label}
      </span>
      <span className="max-w-[55%] min-w-0 truncate text-right text-[14px] leading-5 font-semibold tracking-normal text-white sm:max-w-[65%] sm:text-[16px]">
        {children}
      </span>
    </div>
  )
}

function ProfileSidebar({
  profile,
  partnerId,
  analytics,
  tickets = [],
  ticketsLoading = false,
  onCheckTimelines,
  onOpenCustomUrl,
}: {
  profile: ExpertProfileDetail
  partnerId: string
  analytics?: ExpertAnalyticsData
  tickets?: SupportTicket[]
  ticketsLoading?: boolean
  onCheckTimelines?: () => void
  onOpenCustomUrl?: () => void
}) {
  const navigate = useNavigate()
  const basic = profile.basicProfile
  const kycBadge = getKycBadge(profile.finalReview)

  const customUrl = resolveCustomUrl(profile, analytics)
  const customLinkVisible = profile.customLinkVisible !== false

  const deepLink =
    ((profile as unknown as Record<string, unknown>).deepLink as string | undefined) ||
    (customUrl && profile.customUsername ? `jomspartner://profile/${profile.customUsername}` : null)

  const ratingAverage =
    analytics?.ratingsSummary?.average ??
    profile.ratings ??
    profile.rating ??
    profile.analytics?.rating

  const ratingCount =
    analytics?.ratingsSummary?.count ??
    profile.reviewCount ??
    profile.totalReviews ??
    profile.analytics?.totalReviews

  const ratingsAvailable =
    analytics?.ratingsSummary?.available === true ||
    (typeof ratingCount === 'number' && ratingCount > 0 && ratingAverage != null)

  const npsScore =
    analytics?.nps?.available === false
      ? null
      : (analytics?.nps?.score ?? profile.nps ?? profile.analytics?.nps)

  const experienceYears = basic?.experienceYears
  const experienceMonths = basic?.experienceMonths
  const formattedExperience =
    formatExperience(experienceYears, experienceMonths) ||
    (profile.experience ? `${profile.experience} Years` : null)

  const rawEarnings =
    analytics?.listingOverview?.totalEarnings ??
    profile.totalEarnings ??
    profile.analytics?.totalEarnings

  const rawOrdersCompleted =
    analytics?.listingOverview?.ordersCompleted ??
    profile.totalOrdersCompleted ??
    profile.completedOrders ??
    profile.analytics?.completedOrders

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          PROFILE_CARD,
          'box-border flex min-h-[596px] w-full min-w-0 flex-col overflow-x-hidden p-4 sm:p-5',
        )}
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[16px] leading-5 font-semibold tracking-normal text-white">
            Profile &amp; Account
          </h3>
          <span className={kycBadge.className}>{kycBadge.label}</span>
        </div>

        <SidebarRow label="Expert ID">{formatExpertId(partnerId)}</SidebarRow>
        <SidebarRow label="Expert Type">
          {formatServiceType(profile.servicetype || basic?.serviceType)}
        </SidebarRow>
        <SidebarRow label="Expert Category">{formatExpertCategory(basic)}</SidebarRow>
        <SidebarRow label="Expert Custom URL">
          {customUrl ? (
            customLinkVisible ? (
              <button
                type="button"
                title={deepLink ? `Custom URL: ${customUrl}\nDeep Link: ${deepLink}` : customUrl}
                onClick={() => onOpenCustomUrl?.()}
                className="block max-w-full truncate text-right text-[16px] leading-5 font-semibold tracking-normal text-white underline decoration-solid underline-offset-auto transition-colors hover:text-[#E0A263]"
              >
                {customUrl}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenCustomUrl?.()}
                className="text-right text-[16px] leading-5 font-semibold tracking-normal text-white/50 underline decoration-solid transition-colors hover:text-[#E0A263]"
              >
                Hidden
              </button>
            )
          ) : (
            '—'
          )}
        </SidebarRow>
        <SidebarRow label="Ratings">
          <span className="inline-flex items-center justify-end gap-1 text-[16px] leading-5 font-semibold tracking-normal text-white">
            <Star className="size-3.5 shrink-0 fill-[#E0A263] text-[#E0A263]" />
            {ratingsAvailable && ratingAverage !== undefined && ratingAverage !== null
              ? Number(ratingAverage).toFixed(1)
              : '—'}
            <span className="font-semibold text-white">
              ({ratingsAvailable && ratingCount != null ? ratingCount : 0})
            </span>
          </span>
        </SidebarRow>
        <SidebarRow label="NPS">
          {npsScore !== undefined && npsScore !== null ? npsScore : '—'}
        </SidebarRow>
        <SidebarRow label="Experience">{formattedExperience || '—'}</SidebarRow>
        <SidebarRow label="Total Earnings">
          {rawEarnings !== undefined && rawEarnings !== null
            ? `₹${Number(rawEarnings).toLocaleString('en-IN')}`
            : '₹0'}
        </SidebarRow>
        <SidebarRow label="Total Order Completed">
          {rawOrdersCompleted !== undefined && rawOrdersCompleted !== null ? rawOrdersCompleted : 0}
        </SidebarRow>
        <SidebarRow label="Last Active">
          {formatLastActive(profile.lastActiveAt || profile.updatedAt)}
        </SidebarRow>
        <SidebarRow label="KYC" emphasizeLabel>
          <button
            type="button"
            onClick={() =>
              openExpertKycFromProfile(
                partnerId,
                profile.servicetype || basic?.serviceType,
                navigate,
              )
            }
            className={PROFILE_BTN_VIEW}
          >
            View
          </button>
        </SidebarRow>
        <SidebarRow label="Timelines" emphasizeLabel>
          <button type="button" onClick={onCheckTimelines} className={PROFILE_BTN_CHECK_TIMELINES}>
            Check Timelines
          </button>
        </SidebarRow>
      </div>

      <div className={cn(PROFILE_CARD, 'p-5')}>
        <h3 className="mb-4 text-[13px] font-semibold text-white">Support &amp; Admin</h3>
        <div className="rounded-lg bg-[#050505] p-3">
          <p className="text-muted text-[10px]">Active Tickets</p>
          {ticketsLoading ? (
            <p className="text-body-sm text-muted mt-1 font-medium">Loading...</p>
          ) : tickets.length === 0 ? (
            <p className="text-body-sm mt-1 font-medium text-white">None</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {tickets.slice(0, 3).map((ticket) => (
                <li key={ticket.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/support/tickets/${ticket.id}`)}
                    className="text-body-sm w-full truncate text-left font-medium text-white underline-offset-2 hover:underline"
                  >
                    # {ticket.id} – {ticket.subject}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-3 rounded-lg bg-[#050505] p-3">
          <p className="text-muted text-[10px]">Admin notes</p>
          <p className="text-body-sm mt-1 font-medium text-white">
            {profile.finalReview?.internalNotes || 'None'}
          </p>
        </div>
      </div>
    </div>
  )
}

function ProfileGallery({ images }: { images: string[] }) {
  const visibleCount = 5
  const maxOffset = Math.max(0, images.length - visibleCount)
  const [offset, setOffset] = useState(0)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const clampedOffset = Math.min(offset, maxOffset)
  const visibleImages = images.slice(clampedOffset, clampedOffset + visibleCount)
  const canGoPrevious = clampedOffset > 0
  const canGoNext = clampedOffset < maxOffset

  const shiftPrevious = useCallback(() => {
    setOffset((current) => Math.max(0, current - 1))
  }, [])
  const shiftNext = useCallback(() => {
    setOffset((current) => Math.min(maxOffset, current + 1))
  }, [maxOffset])

  const closeViewer = useCallback(() => setActiveIndex(null), [])
  const showPrevious = useCallback(() => {
    setActiveIndex((current) =>
      current == null ? current : (current - 1 + images.length) % images.length,
    )
  }, [images.length])
  const showNext = useCallback(() => {
    setActiveIndex((current) => (current == null ? current : (current + 1) % images.length))
  }, [images.length])

  useEffect(() => {
    if (activeIndex == null) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeViewer()
      if (event.key === 'ArrowLeft') showPrevious()
      if (event.key === 'ArrowRight') showNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeIndex, closeViewer, showNext, showPrevious])

  return (
    <>
      <div className="relative mt-4">
        {images.length > visibleCount ? (
          <button
            type="button"
            aria-label="Previous gallery images"
            disabled={!canGoPrevious}
            onClick={shiftPrevious}
            className={cn(
              'absolute top-1/2 left-0 z-10 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#1C1C1C] text-white shadow-lg',
              canGoPrevious ? 'hover:bg-[#2A2A2A]' : 'cursor-not-allowed opacity-40',
            )}
          >
            <ChevronLeft className="size-4" />
          </button>
        ) : null}

        <div className="flex flex-wrap gap-[23px]">
          {visibleImages.map((image, index) => {
            const actualIndex = clampedOffset + index
            return (
              <button
                key={`${image}-${actualIndex}`}
                type="button"
                onClick={() => setActiveIndex(actualIndex)}
                className="size-[100px] shrink-0 overflow-hidden rounded-[10px] bg-[#050505]"
              >
                <SafeImage
                  src={image}
                  alt={`Gallery ${actualIndex + 1}`}
                  className="size-full object-cover"
                  fallback={
                    <div className="text-muted flex size-full items-center justify-center">
                      <ImageOff className="size-5" />
                    </div>
                  }
                />
              </button>
            )
          })}
        </div>

        {images.length > visibleCount ? (
          <button
            type="button"
            aria-label="Next gallery images"
            disabled={!canGoNext}
            onClick={shiftNext}
            className={cn(
              'absolute top-1/2 right-0 z-10 flex size-8 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#1C1C1C] text-white shadow-lg',
              canGoNext ? 'hover:bg-[#2A2A2A]' : 'cursor-not-allowed opacity-40',
            )}
          >
            <ChevronRight className="size-4" />
          </button>
        ) : null}
      </div>

      {activeIndex != null && images[activeIndex] ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={closeViewer}
        >
          <button
            type="button"
            aria-label="Close gallery"
            onClick={closeViewer}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="size-5" />
          </button>
          {images.length > 1 ? (
            <button
              type="button"
              aria-label="Previous image"
              onClick={(event) => {
                event.stopPropagation()
                showPrevious()
              }}
              className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <ChevronLeft className="size-6" />
            </button>
          ) : null}
          <div
            className="flex max-h-[85vh] max-w-[min(900px,90vw)] flex-col items-center"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={images[activeIndex]}
              alt={`Gallery ${activeIndex + 1}`}
              className="max-h-[80vh] max-w-full rounded-lg object-contain"
            />
            <p className="mt-3 text-[13px] text-white/70">
              {activeIndex + 1} / {images.length}
            </p>
          </div>
          {images.length > 1 ? (
            <button
              type="button"
              aria-label="Next image"
              onClick={(event) => {
                event.stopPropagation()
                showNext()
              }}
              className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <ChevronRight className="size-6" />
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  )
}

function OverviewTab({
  profile,
  partnerId,
  tags = [],
  timelineEvents = [],
}: {
  profile: ExpertProfileDetail
  partnerId: string
  tags?: string[]
  timelineEvents?: Array<{ id: string; title: string; detail?: string; at?: string }>
}) {
  const basic = profile.basicProfile
  const offerings = basic?.offerings ?? []
  const galleryImages = profile.gallery?.images ?? []
  const workExperience = profile.workExperience ?? []
  const [reviewFilter, setReviewFilter] = useState('all')
  const insightsSort = toInsightsSort(reviewFilter)
  const { data: insightsRes, isLoading: reviewsLoading } = usePartnerInsights(
    partnerId,
    insightsSort,
  )
  const reviews: PartnerInsightReview[] = insightsRes?.data?.reviews ?? []

  return (
    <div className={cn(PROFILE_CARD, 'min-w-0 overflow-x-hidden p-4 sm:p-6')}>
      <section className="min-w-0">
        <h3 className="text-[14px] leading-5 font-semibold tracking-normal text-white">About</h3>
        <p className="mt-3 text-[16px] leading-7 font-normal tracking-normal break-words text-white/50">
          {profile.bio || basic?.bio || 'No bio provided.'}
        </p>
        {tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
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
      </section>

      <section className="mt-6 border-t border-white/5 pt-6">
        <h3 className="text-[14px] leading-5 font-semibold tracking-normal text-white">
          Core Offerings
        </h3>
        {offerings.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {offerings.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2.5 text-[16px] leading-[14px] font-normal tracking-normal text-white/50"
              >
                <Check className="size-4 shrink-0 text-white" strokeWidth={2.5} />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[16px] leading-[14px] font-normal text-white/40">
            No core offerings added yet.
          </p>
        )}
      </section>

      <section className="mt-6 border-t border-white/5 pt-6">
        <h3 className="text-[14px] leading-5 font-semibold tracking-normal text-white">Gallery</h3>
        {galleryImages.length > 0 ? (
          <ProfileGallery images={galleryImages} />
        ) : (
          <p className="mt-3 text-[16px] leading-[14px] font-normal text-white/40">
            No gallery images yet.
          </p>
        )}
      </section>

      <section className="mt-6 border-t border-white/5 pt-6">
        <h3 className="text-[14px] leading-5 font-semibold tracking-normal text-white">
          Work Experience
        </h3>
        {workExperience.length > 0 ? (
          <div className="mt-4 space-y-4">
            {workExperience.map((entry) => (
              <div
                key={entry._id || `${entry.jobTitle}-${entry.companyName}`}
                className="flex items-center gap-4"
              >
                <div className="flex h-[55px] w-[65px] shrink-0 items-center justify-center rounded-[10px] bg-black">
                  <img src={bagSolidIcon} alt="" className="size-6 brightness-0 invert" />
                </div>
                <div className="min-w-0">
                  <p className="text-[16px] leading-none font-semibold tracking-[-0.01em] text-white">
                    {entry.jobTitle || '—'}
                  </p>
                  <p className="mt-2 text-[14px] leading-none font-normal tracking-[-0.01em] text-white/50">
                    {entry.companyName || 'Company name'} | {formatWorkPeriod(entry)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-[16px] leading-[14px] font-normal text-white/40">
            No work experience added yet.
          </p>
        )}
      </section>

      <section className="mt-6 border-t border-white/5 pt-6">
        <h3 className="text-[14px] leading-5 font-semibold tracking-normal text-white">
          Reviews &amp; Ratings
        </h3>
        <div className="mt-4 mb-4 flex flex-wrap gap-2">
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
                'rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors',
                reviewFilter === filter.key ? PROFILE_ACTIVE_PILL : PROFILE_IDLE_PILL,
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {reviewsLoading ? (
            <p className="text-[13px] text-white/50">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-[13px] text-white/40">No reviews yet for this expert.</p>
          ) : (
            reviews.map((review) => {
              const rating = Math.max(0, Math.min(5, Number(review.rating) || 0))
              const role = review.userRole?.trim()
              return (
                <div key={review.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#050505]">
                        {review.userAvatarUrl ? (
                          <img
                            src={review.userAvatarUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <User className="text-muted size-4" />
                        )}
                      </div>
                      <p className="truncate text-[13px] font-semibold text-white">
                        {review.userName || 'User'}
                        {role ? <span className="font-normal text-white/45"> • {role}</span> : null}
                      </p>
                    </div>
                    {review.title ? (
                      <p className="mt-2 pl-12 text-[12px] text-white/45">
                        Service Availed: {review.title}
                      </p>
                    ) : null}
                    {review.text ? (
                      <p className="mt-1 pl-12 text-[13px] leading-relaxed text-white/70">
                        {review.text}
                      </p>
                    ) : null}
                  </div>
                  <div className="shrink-0 pt-1 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={cn(
                            'size-3',
                            index < rating
                              ? 'fill-[#E0A263] text-[#E0A263]'
                              : 'fill-transparent text-white/20',
                          )}
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-[11px] text-white/45">
                      {formatReviewDate(review.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>

      <section id="expert-timeline" className="mt-6 scroll-mt-6 border-t border-white/5 pt-6">
        <h3 className="text-[15px] font-semibold text-white">Timeline</h3>
        {timelineEvents.length === 0 ? (
          <p className="mt-3 text-[13px] text-white/40">No timeline events yet.</p>
        ) : (
          <ol className="mt-4 space-y-3">
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

function ConsultationDetailCard({
  consultation,
  expertId,
  menuOpen,
  onMenuOpenChange,
  onRequestChanges,
  onPause,
  onDelete,
  onEdit,
}: {
  consultation: ExpertConsultation
  expertId: string
  menuOpen: boolean
  onMenuOpenChange: (open: boolean) => void
  onRequestChanges: () => void
  onPause: () => void
  onDelete: () => void
  onEdit: () => void
}) {
  const navigate = useNavigate()
  const outlineItems = (consultation.sessionOutline || '')
    .split(/[.\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
  const isSuspended = Boolean(consultation.isSuspend)
  const isPaused = Boolean(consultation.isPaused)
  const listingStatus = getListingStatusDisplay(consultation.status, {
    isSuspend: isSuspended,
    isDeleted: Boolean(consultation.isDeleted),
  })
  const statusLabel = isPaused && !isSuspended ? 'Paused' : listingStatus.label

  return (
    <div className="min-w-0 overflow-x-hidden rounded-xl bg-[#141414] p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-stretch gap-3">
            <span className="bg-brand-accent w-[3px] shrink-0 rounded-full" aria-hidden="true" />
            <div className="min-w-0">
              <h3 className="text-[18px] leading-tight font-bold break-words text-white">
                <button
                  type="button"
                  className="text-left hover:underline"
                  onClick={() => viewExpertConsultation(consultation, expertId, navigate)}
                >
                  {consultation.title || 'Untitled Consultation'}
                </button>
              </h3>
              {statusLabel ? (
                <span
                  className={cn(
                    'mt-1 inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase',
                    isPaused && !isSuspended
                      ? 'bg-white/15 text-white/80'
                      : listingStatus.className,
                  )}
                >
                  {statusLabel}
                </span>
              ) : null}
              <p className="text-muted mt-1 text-[13px]">Business</p>
            </div>
          </div>
          {(consultation.topics ?? []).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2.5">
              {(consultation.topics ?? []).map((topic) => (
                <span
                  key={topic._id}
                  className="inline-flex items-center justify-center rounded-[6px] border border-[#FFFFFF1A] bg-[#FFFFFF80] p-[10px] text-[12px] leading-none font-semibold tracking-normal text-[#050505]"
                >
                  {topic.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <TableActionsDropdown
          label={`Open actions for ${consultation.title || 'consultation'}`}
          isOpen={menuOpen}
          onOpenChange={onMenuOpenChange}
          menuWidth={200}
          tone="light"
        >
          <TableActionsItem
            tone="light"
            icon={<RotateCw className="size-3.5" />}
            onClick={() => {
              onMenuOpenChange(false)
              onRequestChanges()
            }}
          >
            Request Changes
          </TableActionsItem>
          <TableActionsItem
            tone="light"
            icon={<PauseCircle className="size-3.5" />}
            onClick={() => {
              onMenuOpenChange(false)
              onPause()
            }}
          >
            Pause Consultation
          </TableActionsItem>
          <TableActionsItem
            tone="light"
            icon={<Trash2 className="size-3.5" />}
            onClick={() => {
              onMenuOpenChange(false)
              onDelete()
            }}
          >
            Delete Consultation
          </TableActionsItem>
          <TableActionsItem
            tone="light"
            icon={<Pencil className="size-3.5" />}
            onClick={() => {
              onMenuOpenChange(false)
              onEdit()
            }}
          >
            Edit Consultation
          </TableActionsItem>
        </TableActionsDropdown>
      </div>

      {outlineItems.length > 0 && (
        <div className="mt-5">
          <p className="text-body-sm mb-2 font-semibold text-white">Session outline</p>
          <ul className="text-body-sm text-muted list-disc space-y-1 pl-5">
            {outlineItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-5">
          {consultation.whoItsFor && (
            <div className="min-w-0">
              <p className="text-body-sm mb-1.5 font-semibold text-white">Who is it for?</p>
              <p className="text-body-sm break-words text-white/50">{consultation.whoItsFor}</p>
            </div>
          )}

          <div className="min-w-0">
            <p className="text-body-sm mb-3 font-semibold text-white">Additional Information</p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex size-12 items-center justify-center rounded-xl border border-white/5 bg-[#1C1C1C]">
                  <Phone className="size-5 text-white" />
                </div>
                <span className="text-[11px] font-medium text-white/60 capitalize">
                  {consultation.mode || 'Mode'}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex size-12 items-center justify-center rounded-xl border border-white/5 bg-[#1C1C1C]">
                  <Languages className="size-5 text-white" />
                </div>
                <span className="max-w-[100px] truncate text-[11px] font-medium text-white/60">
                  {(consultation.languages ?? [])[0] || 'English'}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex size-12 items-center justify-center rounded-xl border border-white/5 bg-[#1C1C1C]">
                  <span className="text-xs font-bold text-white">
                    {consultation.hasFollowUp && consultation.followUpDays
                      ? `${consultation.followUpDays} Days`
                      : '5 Days'}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-white/60">FollowUps</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="min-w-0">
            <p className="text-body-sm mb-1 font-semibold text-white">Pre-session requirement</p>
            <p className="text-body-sm break-words text-white/50">
              {consultation.preSessionRequirement || 'Keep your requirements and questions ready.'}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-body-sm mb-1 font-semibold text-white">Post Session Requirement</p>
            <p className="text-body-sm break-words text-white/50">
              {consultation.postSessionMessage || 'Keep your requirements and questions ready.'}
            </p>
          </div>

          {(consultation.pricingOptions ?? []).length > 0 && (
            <div>
              <p className="text-body-sm mb-2 font-semibold text-white">Duration &amp; Pricing</p>
              <div className="flex flex-wrap gap-2">
                {(consultation.pricingOptions ?? []).map((option) => (
                  <span
                    key={`${option.durationMinutes}-${option.price}`}
                    className="rounded-xl border border-white/10 bg-[#1C1C1C] px-3.5 py-2 text-xs font-semibold text-white"
                  >
                    {formatPricing(option)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => viewExpertConsultation(consultation, expertId, navigate)}
        className="mt-6 flex w-full items-center justify-between rounded-xl border border-[#E0A263] bg-transparent px-5 py-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/5"
      >
        <span>Consultation Performance</span>
        <ChevronRight className="size-4 text-[#E0A263]" />
      </button>
    </div>
  )
}

const unwrapExpertList = <T,>(payload: unknown): T[] => {
  if (!payload) return []
  if (Array.isArray(payload)) return payload as T[]
  if (typeof payload === 'object') {
    const value = payload as { data?: unknown }
    if (Array.isArray(value.data)) return value.data as T[]
    if (
      value.data &&
      typeof value.data === 'object' &&
      Array.isArray((value.data as { data?: unknown }).data)
    ) {
      return (value.data as { data: T[] }).data
    }
  }
  return []
}

function ServicesSubTab({
  expertId,
  fallbackServices = [],
}: {
  expertId: string
  fallbackServices?: ExpertService[]
}) {
  const navigate = useNavigate()
  const { fileFormat } = useDefaultExportFormat()
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const serviceQueryParams = useMemo(
    () =>
      buildExpertProfileServicesQueryParams(appliedFilters, {
        page: 1,
        limit: 100,
        search: searchQuery,
      }),
    [appliedFilters, searchQuery],
  )

  const { data, isLoading, isError } = useExpertServices(expertId, serviceQueryParams, true)
  const hasSearchOrFilters = Boolean(searchQuery.trim()) || Object.keys(appliedFilters).length > 0
  const services = useMemo(() => {
    const fetched = unwrapExpertList<ExpertService>(data)
    if (fetched.length > 0) return fetched
    if (!hasSearchOrFilters) return fallbackServices
    return []
  }, [data, fallbackServices, hasSearchOrFilters])

  const handleApplyFilters = useCallback((values: FilterValues) => {
    toast.success('Filters applied')
    setAppliedFilters(values)
  }, [])

  const { onAdvancedFilter, modals: exportFilterModals } = useModuleExportFilters({
    moduleKey: 'expert-profile-services',
    onApplyFilters: handleApplyFilters,
  })

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])

  const visibleServiceIds = useMemo(() => services.map((s) => s._id), [services])
  const allVisibleSelected =
    visibleServiceIds.length > 0 && visibleServiceIds.every((id) => selectedServiceIds.includes(id))

  const selectedServices = useMemo(
    () => services.filter((service) => selectedServiceIds.includes(service._id)),
    [services, selectedServiceIds],
  )

  const toggleSelectAll = useCallback(() => {
    if (allVisibleSelected) {
      setSelectedServiceIds([])
    } else {
      setSelectedServiceIds(visibleServiceIds)
    }
  }, [allVisibleSelected, visibleServiceIds])

  const toggleServiceSelection = useCallback((id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }, [])

  const bulkDeleteMutation = useBulkDeleteServices()
  const bulkPauseMutation = useBulkPauseServices()
  const bulkHideMutation = useBulkHideServices()
  const bulkDisableMutation = useBulkDisableServices()

  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [bulkDeleteReasons, setBulkDeleteReasons] = useState<string[]>([])
  const [bulkDeleteAdminNotes, setBulkDeleteAdminNotes] = useState('')
  const [bulkDeleteConfirmed, setBulkDeleteConfirmed] = useState(false)

  const [isBulkPauseModalOpen, setIsBulkPauseModalOpen] = useState(false)

  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false)
  const [escalateAdminNotes, setEscalateAdminNotes] = useState('')
  const [selectedEscalationOption, setSelectedEscalationOption] = useState('')
  const [isEscalating, setIsEscalating] = useState(false)

  const { data: assigneesData } = useEscalationAssignees('services.*')
  const escalationOptions: DecisionActionModalOption[] = useMemo(
    () =>
      (assigneesData?.data ?? []).map((assignee) => ({
        label: assignee.fullname,
        value: assignee.id,
      })),
    [assigneesData?.data],
  )

  const { options: deleteReasonOptions } = useModerationReasonOptions(
    MODERATION_CATEGORY_SLUGS.deleteService,
  )
  const { options: pauseReasonOptions } = useModerationReasonOptions(
    MODERATION_CATEGORY_SLUGS.pauseService,
  )

  const closeEscalateModal = useCallback(() => {
    setIsEscalateModalOpen(false)
    setEscalateAdminNotes('')
    setSelectedEscalationOption('')
  }, [])

  const handleBulkDelete = useCallback(() => {
    if (selectedServiceIds.length === 0) return
    setIsBulkDeleteModalOpen(true)
  }, [selectedServiceIds])

  const confirmBulkDelete = useCallback(() => {
    if (selectedServiceIds.length === 0) return
    if (deleteReasonOptions.length > 0 && bulkDeleteReasons.length === 0) {
      toast.error('Please select at least one reason for deletion.')
      return
    }
    if (!bulkDeleteConfirmed) {
      toast.error('Please confirm the delete reasons before continuing.')
      return
    }
    if (!bulkDeleteAdminNotes.trim()) {
      toast.error('Admin notes are required for deletion.')
      return
    }

    bulkDeleteMutation.mutate(
      {
        serviceIds: selectedServiceIds,
        selectedReasons: bulkDeleteReasons,
        adminNotes: bulkDeleteAdminNotes.trim(),
      },
      {
        onSuccess: () => {
          toast.success(`Deleted ${selectedServiceIds.length} selected service(s)`)
          setSelectedServiceIds([])
          setIsBulkDeleteModalOpen(false)
          setBulkDeleteReasons([])
          setBulkDeleteAdminNotes('')
          setBulkDeleteConfirmed(false)
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } }
          toast.error(getApiErrorMessage(error, 'Failed to delete services'))
        },
      },
    )
  }, [
    selectedServiceIds,
    bulkDeleteReasons,
    bulkDeleteConfirmed,
    bulkDeleteAdminNotes,
    deleteReasonOptions.length,
    bulkDeleteMutation,
  ])

  const handleBulkPause = useCallback(() => {
    if (selectedServiceIds.length === 0) return
    setIsBulkPauseModalOpen(true)
  }, [selectedServiceIds])

  const confirmBulkPause = useCallback(
    (payload: { reasons: string[]; adminNotes: string }) => {
      if (selectedServiceIds.length === 0) return
      if (pauseReasonOptions.length > 0 && payload.reasons.length === 0) {
        toast.error('Please select at least one reason for pausing.')
        return
      }
      if (!payload.adminNotes.trim()) {
        toast.error('Admin notes are required for pausing.')
        return
      }

      bulkPauseMutation.mutate(
        {
          serviceIds: selectedServiceIds,
          selectedReasons: payload.reasons,
          adminNotes: payload.adminNotes.trim(),
          indefinite: true,
        },
        {
          onSuccess: () => {
            toast.success(`Paused ${selectedServiceIds.length} selected service(s)`)
            setSelectedServiceIds([])
            setIsBulkPauseModalOpen(false)
          },
          onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } } }
            toast.error(getApiErrorMessage(error, 'Failed to pause services'))
          },
        },
      )
    },
    [selectedServiceIds, pauseReasonOptions.length, bulkPauseMutation],
  )

  const handleBulkHide = useCallback(() => {
    if (selectedServiceIds.length === 0) return
    bulkHideMutation.mutate(selectedServiceIds, {
      onSuccess: () => {
        toast.success(`Hidden / Unpublished ${selectedServiceIds.length} selected service(s)`)
        setSelectedServiceIds([])
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } }
        toast.error(getApiErrorMessage(error, 'Failed to hide services'))
      },
    })
  }, [selectedServiceIds, bulkHideMutation])

  const handleBulkDisable = useCallback(() => {
    if (selectedServiceIds.length === 0) return
    bulkDisableMutation.mutate(selectedServiceIds, {
      onSuccess: () => {
        toast.success(`Disabled ${selectedServiceIds.length} selected service(s)`)
        setSelectedServiceIds([])
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } }
        toast.error(getApiErrorMessage(error, 'Failed to disable services'))
      },
    })
  }, [selectedServiceIds, bulkDisableMutation])

  const handleBulkExport = useCallback(() => {
    if (selectedServices.length === 0) {
      toast.error('Please select at least one service to export.')
      return
    }

    try {
      const headers = [
        'Service ID',
        'Title',
        'Partner ID',
        'Category',
        'Status',
        'Pricing',
        'Submitted At',
      ]
      const rows = selectedServices.map((service) => [
        service._id,
        service.title || 'N/A',
        expertId,
        service.category?.name || 'N/A',
        service.status || 'N/A',
        String(service.priceStarts ?? 'N/A'),
        service.submittedAt ? new Date(service.submittedAt).toLocaleDateString() : 'N/A',
      ])
      exportDataToFile(headers, rows, fileFormat, 'expert_selected_services_export')
      toast.success(`Exported ${selectedServices.length} selected service(s)`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to export selected services.'))
    }
  }, [expertId, fileFormat, selectedServices])

  const handleBulkNotify = useCallback(() => {
    if (!expertId) {
      toast.error('Expert partner ID is missing.')
      return
    }
    const params = new URLSearchParams({
      channel: 'push',
      audience: 'experts',
      partnerIds: expertId,
    })
    navigate(`/communication/create?${params.toString()}`)
  }, [expertId, navigate])

  const handleBulkMessage = useCallback(() => {
    if (!expertId) {
      toast.error('Expert partner ID is missing.')
      return
    }
    const params = new URLSearchParams({
      channel: 'email',
      audience: 'experts',
      partnerIds: expertId,
    })
    navigate(`/communication/create?${params.toString()}`)
  }, [expertId, navigate])

  const handleEscalateSubmit = useCallback(async () => {
    if (selectedServices.length === 0) {
      toast.error('Please select at least one service.')
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
        selectedServices.map((service) =>
          escalateServiceApplication(service._id, {
            assigneeSubAdminId: selectedEscalationOption,
            assigneeName: selectedAssignee?.fullname || '',
            adminNote: note,
            entityTitle: service.title,
            applicationUrl: getServiceManagementViewPath({
              _id: service._id,
              partnerId: expertId,
            }),
          }),
        ),
      )

      const successCount = results.filter((result) => result.status === 'fulfilled').length
      const failedCount = results.length - successCount

      if (successCount === 0) {
        const firstError = results.find((result) => result.status === 'rejected') as
          PromiseRejectedResult | undefined
        toast.error(getApiErrorMessage(firstError?.reason, 'Failed to escalate services.'))
        return
      }

      toast.success(
        failedCount > 0
          ? `Escalated ${successCount} service(s); ${failedCount} failed.`
          : `Successfully escalated ${successCount} service(s)`,
      )
      setSelectedServiceIds([])
      closeEscalateModal()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to escalate services.'))
    } finally {
      setIsEscalating(false)
    }
  }, [
    assigneesData?.data,
    closeEscalateModal,
    escalateAdminNotes,
    expertId,
    selectedEscalationOption,
    selectedServices,
  ])

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-[50px] w-full min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#FFFFFF33] bg-[#141414] px-3 sm:min-w-[220px]">
          <Search className="text-muted size-4 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by service title"
            className="text-body-sm placeholder:text-muted w-full min-w-0 bg-transparent text-white outline-none"
          />
        </div>

        <button
          type="button"
          onClick={onAdvancedFilter}
          className="table-advance-filter-btn inline-flex shrink-0 items-center gap-2"
        >
          <AdvanceFilterIcon className="size-4 shrink-0" aria-hidden="true" />
          Advance Filters
        </button>
      </div>

      <label className="text-body-sm text-muted mt-1 flex w-fit cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={allVisibleSelected}
          onChange={toggleSelectAll}
          className="ui-table-checkbox"
        />
        Select All
      </label>

      {selectedServiceIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-blue-500 bg-blue-950/80 px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <CheckSquare className="size-3.5" aria-hidden="true" />
            <span>
              {selectedServiceIds.length} {selectedServiceIds.length === 1 ? 'Service' : 'Services'}{' '}
              Selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleBulkDelete}
              title="Delete selected services"
              className="flex size-8 items-center justify-center rounded-md bg-black text-white transition-colors hover:bg-white/10"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleBulkPause}
              title="Pause selected services"
              className="flex size-8 items-center justify-center rounded-md bg-black text-white transition-colors hover:bg-white/10"
            >
              <PauseCircle className="size-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleBulkHide}
              title="Hide / Unpublish selected services"
              className="flex size-8 items-center justify-center rounded-md bg-black text-white transition-colors hover:bg-white/10"
            >
              <EyeOff className="size-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleBulkDisable}
              title="Disable selected services"
              className="flex size-8 items-center justify-center rounded-md bg-black text-white transition-colors hover:bg-white/10"
            >
              <CircleMinus className="size-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleBulkExport}
              title="Export selected services"
              className="flex size-8 items-center justify-center rounded-md bg-black text-white transition-colors hover:bg-white/10"
            >
              <ExportDataIcon className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={handleBulkNotify}
              title="Notify expert"
              className="flex size-8 items-center justify-center rounded-md bg-black text-white transition-colors hover:bg-white/10"
            >
              <Bell className="size-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleBulkMessage}
              title="Message expert"
              className="flex size-8 items-center justify-center rounded-md bg-black text-white transition-colors hover:bg-white/10"
            >
              <Mail className="size-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setIsEscalateModalOpen(true)}
              title="Escalate selected services"
              className="flex size-8 items-center justify-center rounded-md bg-black text-white transition-colors hover:bg-white/10"
            >
              <CircleArrowOutUpRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex h-40 items-center justify-center">
          <div className="border-brand-accent size-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      )}
      {!isLoading && services.length === 0 && (
        <div className={cn(PROFILE_CARD, 'p-8 text-center text-[13px] text-white/50')}>
          {isError
            ? 'Unable to load services for this expert.'
            : hasSearchOrFilters
              ? 'No matching services found.'
              : 'No services found for this expert.'}
        </div>
      )}
      {!isLoading && services.length > 0 && (
        <div className="space-y-3">
          {services.map((service) => (
            <ServiceListCard
              key={service._id}
              service={service}
              expertId={expertId}
              selected={selectedServiceIds.includes(service._id)}
              onToggleSelect={() => toggleServiceSelection(service._id)}
            />
          ))}
        </div>
      )}

      {exportFilterModals}

      <DecisionActionModal
        open={isBulkDeleteModalOpen}
        variant="delete"
        title={
          selectedServiceIds.length > 1
            ? `Delete ${selectedServiceIds.length} Services`
            : 'Delete Service'
        }
        description={
          selectedServiceIds.length > 1
            ? `Are you sure you want to delete ${selectedServiceIds.length} selected service(s)? This action cannot be undone.`
            : 'Are you sure you want to delete this service? This action cannot be undone.'
        }
        submitLabel={
          selectedServiceIds.length > 1
            ? `Delete ${selectedServiceIds.length} Services`
            : 'Delete Service'
        }
        heroLayout="inline"
        reasonOptions={deleteReasonOptions}
        selectedReasons={bulkDeleteReasons}
        onReasonToggle={(value) =>
          setBulkDeleteReasons((current) =>
            current.includes(value)
              ? current.filter((item) => item !== value)
              : [...current, value],
          )
        }
        showReasonsLabel
        confirmationLabel="I confirm the documents are not approved due to above reasons."
        confirmationChecked={bulkDeleteConfirmed}
        onConfirmationChange={setBulkDeleteConfirmed}
        adminNotes={bulkDeleteAdminNotes}
        onAdminNotesChange={setBulkDeleteAdminNotes}
        onClose={() => {
          setIsBulkDeleteModalOpen(false)
          setBulkDeleteConfirmed(false)
        }}
        onSubmit={confirmBulkDelete}
        isSubmitting={bulkDeleteMutation.isPending}
      />

      <PauseCategoryModal
        open={isBulkPauseModalOpen}
        title={
          selectedServiceIds.length > 1
            ? `Pause ${selectedServiceIds.length} Services`
            : 'Pause Service'
        }
        heading={
          selectedServiceIds.length > 1
            ? `Are you sure you want  Pause these ${selectedServiceIds.length} Services.`
            : undefined
        }
        description="Pausing this service will temporarily stop all new requests."
        submitLabel="Pause Service"
        reasonCategorySlug={MODERATION_CATEGORY_SLUGS.pauseService}
        onClose={() => setIsBulkPauseModalOpen(false)}
        onConfirm={confirmBulkPause}
        isSubmitting={bulkPauseMutation.isPending}
      />

      <DecisionActionModal
        open={isEscalateModalOpen}
        variant="escalate"
        title={
          selectedServiceIds.length > 1
            ? `Escalate ${selectedServiceIds.length} Services`
            : 'Escalate Application'
        }
        description={
          selectedServiceIds.length > 1
            ? `Are you sure you want to escalate ${selectedServiceIds.length} selected services? These will be reviewed by the selected sub-admin.`
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
    </>
  )
}

function ServiceListCard({
  service,
  expertId,
  selected = false,
  onToggleSelect,
}: {
  service: ExpertService
  expertId: string
  selected?: boolean
  onToggleSelect?: () => void
}) {
  const navigate = useNavigate()
  const status = (service.status || '').toLowerCase()
  const isDeleted = Boolean(service.isDeleted) || status === 'deleted' || status === 'deactivated'
  const isSuspended = Boolean(service.isSuspend) || status === 'suspended'
  const coverImage = service.images?.find(Boolean)
  const listingStatus = getProfileServiceListingStatusDisplay(service.status, {
    isSuspend: isSuspended,
    isDeleted,
  })
  const statusLabel = listingStatus.label
  const statusClass = listingStatus.className

  return (
    <div
      onClick={() => viewExpertService(service, expertId, navigate)}
      className={cn(
        'flex h-auto min-h-[110px] w-full min-w-0 cursor-pointer items-center justify-between gap-3 overflow-hidden rounded-[10px] bg-black px-3 py-3 text-left transition-colors hover:bg-[#111] sm:h-[110px] sm:px-4 sm:py-0',
        selected && 'border border-blue-500 bg-blue-950/20',
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <input
          type="checkbox"
          checked={selected}
          onClick={(event) => event.stopPropagation()}
          onChange={onToggleSelect}
          className="ui-table-checkbox"
        />

        <div className="relative ml-0 h-[72px] w-[96px] shrink-0 overflow-hidden rounded-[10px] bg-[#D9D9D9] sm:ml-1 sm:h-[93px] sm:w-[125px]">
          <SafeImage
            src={coverImage}
            alt={service.title || 'Service'}
            className="size-full object-cover"
            fallback={
              <div className="text-muted flex size-full items-center justify-center">
                <ImageOff className="size-5" />
              </div>
            }
          />
          {statusLabel && (
            <span className={cn('absolute top-2 left-2 leading-none shadow-xs', statusClass)}>
              {statusLabel}
            </span>
          )}
        </div>

        <div className="ml-0 min-w-0 flex-1 sm:ml-1">
          <p className="truncate text-[16px] leading-5 font-semibold tracking-normal text-white">
            {service.title || 'Untitled Service'}
          </p>
          <p className="text-body-sm text-muted mt-0.5 truncate">{service.category?.name || '—'}</p>
          <p className="text-body-sm text-muted mt-0.5 truncate">
            {formatPricingType(service.pricingType)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {service.priceStarts != null && service.priceStarts > 0 && (
          <div className="text-right">
            <p className="text-[13px] font-bold text-white">
              ₹{Number(service.priceStarts).toLocaleString('en-IN')}
            </p>
          </div>
        )}
        <ChevronRight className="size-4 text-white/50" />
      </div>
    </div>
  )
}

function ConsultationsSubTab({
  expertId,
  fallbackConsultations = [],
}: {
  expertId: string
  fallbackConsultations?: ExpertConsultation[]
}) {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useExpertConsultations(expertId, 1, 100, true)
  const consultations = unwrapExpertList<ExpertConsultation>(data)
  const visibleConsultations = consultations.length > 0 ? consultations : fallbackConsultations

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [requestChangesTarget, setRequestChangesTarget] = useState<ExpertConsultation | null>(null)
  const [pauseTarget, setPauseTarget] = useState<ExpertConsultation | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ExpertConsultation | null>(null)

  const [requestReasons, setRequestReasons] = useState<string[]>([])
  const [requestReasonText, setRequestReasonText] = useState('')
  const [requestAdminNotes, setRequestAdminNotes] = useState('')

  const [pauseReasons, setPauseReasons] = useState<string[]>([])
  const [pauseAdminNotes, setPauseAdminNotes] = useState('')
  const [pauseConfirmed, setPauseConfirmed] = useState(false)

  const [deleteReasons, setDeleteReasons] = useState<string[]>([])
  const [deleteAdminNotes, setDeleteAdminNotes] = useState('')
  const [deleteConfirmed, setDeleteConfirmed] = useState(false)

  const updateConsultationStatus = useUpdateConsultationStatus()
  const pauseConsultationMutation = usePauseConsultationListing()
  const deleteServiceMutation = useDeleteService()
  const recordReasonUsage = useRecordModerationReasonUsage()

  const { options: requestChangesReasonOptions, buildPayload: buildRequestChangesReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.requestChangesService)
  const { options: pauseReasonOptions, buildPayload: buildPauseReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.suspendService)
  const { options: deleteReasonOptions, buildPayload: buildDeleteReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.deleteService)

  const closeRequestChangesModal = useCallback(() => {
    setRequestChangesTarget(null)
    setRequestReasons([])
    setRequestReasonText('')
    setRequestAdminNotes('')
  }, [])

  const closePauseModal = useCallback(() => {
    setPauseTarget(null)
    setPauseReasons([])
    setPauseAdminNotes('')
    setPauseConfirmed(false)
  }, [])

  const closeDeleteModal = useCallback(() => {
    setDeleteTarget(null)
    setDeleteReasons([])
    setDeleteAdminNotes('')
    setDeleteConfirmed(false)
  }, [])

  const handleRequestChangesSubmit = useCallback(async () => {
    if (!requestChangesTarget) return
    if (!requestAdminNotes.trim()) {
      toast.error('Admin notes are required.')
      return
    }
    if (!requestReasonText.trim()) {
      toast.error('Rejection reason is required.')
      return
    }
    if (requestReasons.length === 0) {
      toast.error('Please select at least one reason.')
      return
    }

    const reasonPayload = buildRequestChangesReasonPayload(requestReasons)
    if (!reasonPayload || reasonPayload.selectedReasons.length === 0) {
      toast.error('Selected reasons are no longer available. Please refresh and try again.')
      return
    }

    try {
      await updateConsultationStatus.mutateAsync({
        id: requestChangesTarget._id,
        payload: {
          status: 'rejected',
          reasonFor: reasonPayload.selectedReasons,
          rejectionReason: requestReasonText.trim() || reasonPayload.reasonDetails,
          adminNote: requestAdminNotes.trim(),
        },
      })
      if (reasonPayload.reasonIds.length > 0) {
        recordReasonUsage.mutate(reasonPayload.reasonIds)
      }
      toast.success('Resubmission requested successfully')
      closeRequestChangesModal()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(getApiErrorMessage(err, 'Failed to request changes.'))
    }
  }, [
    buildRequestChangesReasonPayload,
    closeRequestChangesModal,
    recordReasonUsage,
    requestAdminNotes,
    requestChangesTarget,
    requestReasonText,
    requestReasons,
    updateConsultationStatus,
  ])

  const handlePauseSubmit = useCallback(async () => {
    if (!pauseTarget) return
    if (pauseReasons.length === 0) {
      toast.error('Please select at least one reason.')
      return
    }
    if (!pauseConfirmed) {
      toast.error('Please confirm the pause reasons before continuing.')
      return
    }
    if (!pauseAdminNotes.trim()) {
      toast.error('Admin notes are required.')
      return
    }

    const reasonPayload = buildPauseReasonPayload(pauseReasons)
    if (!reasonPayload || reasonPayload.selectedReasons.length === 0) {
      toast.error('Selected reasons are no longer available. Please refresh and try again.')
      return
    }

    try {
      await pauseConsultationMutation.mutateAsync({
        consultationId: pauseTarget._id,
        payload: {
          selectedReasons: reasonPayload.selectedReasons,
          reasonDetails: reasonPayload.reasonDetails,
          adminNotes: pauseAdminNotes.trim(),
        },
      })
      if (reasonPayload.reasonIds.length > 0) {
        recordReasonUsage.mutate(reasonPayload.reasonIds)
      }
      toast.success('Consultation paused successfully')
      closePauseModal()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(getApiErrorMessage(err, 'Failed to pause consultation.'))
    }
  }, [
    buildPauseReasonPayload,
    closePauseModal,
    pauseAdminNotes,
    pauseConfirmed,
    pauseReasons,
    pauseTarget,
    recordReasonUsage,
    pauseConsultationMutation,
  ])

  const handleDeleteSubmit = useCallback(async () => {
    if (!deleteTarget) return
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
    if (!reasonPayload || reasonPayload.selectedReasons.length === 0) {
      toast.error('Selected reasons are no longer available. Please refresh and try again.')
      return
    }

    try {
      await deleteServiceMutation.mutateAsync({
        id: deleteTarget._id,
        payload: {
          selectedReasons: reasonPayload.selectedReasons,
          reasonDetails: reasonPayload.reasonDetails,
          adminNotes: deleteAdminNotes.trim(),
        },
      })
      if (reasonPayload.reasonIds.length > 0) {
        recordReasonUsage.mutate(reasonPayload.reasonIds)
      }
      toast.success('Consultation deleted successfully')
      closeDeleteModal()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(getApiErrorMessage(err, 'Failed to delete consultation.'))
    }
  }, [
    buildDeleteReasonPayload,
    closeDeleteModal,
    deleteAdminNotes,
    deleteConfirmed,
    deleteReasons,
    deleteServiceMutation,
    deleteTarget,
    recordReasonUsage,
  ])

  return (
    <>
      {isLoading && (
        <div className="flex h-40 items-center justify-center">
          <div className="border-brand-accent size-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      )}
      {isError && visibleConsultations.length === 0 && (
        <div className="bg-brand-danger/10 rounded-lg border border-red-500/40 px-4 py-3 text-sm text-red-400">
          Consultation not found
        </div>
      )}
      {!isLoading && visibleConsultations.length === 0 && !isError && (
        <div className="rounded-xl bg-[#141414] p-8 text-center text-[13px] text-white/50">
          Consultation not found
        </div>
      )}
      {!isLoading &&
        visibleConsultations.map((consultation) => (
          <ConsultationDetailCard
            key={consultation._id}
            consultation={consultation}
            expertId={expertId}
            menuOpen={activeMenuId === consultation._id}
            onMenuOpenChange={(open) => setActiveMenuId(open ? consultation._id : null)}
            onRequestChanges={() => setRequestChangesTarget(consultation)}
            onPause={() => setPauseTarget(consultation)}
            onDelete={() => setDeleteTarget(consultation)}
            onEdit={() =>
              navigate(
                `/services/management/create?partnerId=${encodeURIComponent(expertId)}&consultationId=${encodeURIComponent(consultation._id)}&mode=edit`,
              )
            }
          />
        ))}

      <DecisionActionModal
        open={Boolean(requestChangesTarget)}
        variant="requestChanges"
        title="Request Changes – Consultation Approval"
        description="Are you sure you want to Request Changes to this application? The applicant will be notified via email."
        submitLabel="Request Changes"
        reasonOptions={requestChangesReasonOptions}
        selectedReasons={requestReasons}
        onReasonToggle={(value) =>
          setRequestReasons((current) =>
            current.includes(value)
              ? current.filter((item) => item !== value)
              : [...current, value],
          )
        }
        reason={requestReasonText}
        onReasonChange={setRequestReasonText}
        reasonLabel="Request Change"
        adminNotes={requestAdminNotes}
        onAdminNotesChange={setRequestAdminNotes}
        onClose={closeRequestChangesModal}
        onSubmit={handleRequestChangesSubmit}
        isSubmitting={updateConsultationStatus.isPending}
      />

      <DecisionActionModal
        open={Boolean(pauseTarget)}
        variant="pause"
        title="Pause Consultation"
        description="Pausing this consultation will temporarily stop all new requests."
        submitLabel="Pause Consultation"
        reasonOptions={pauseReasonOptions}
        selectedReasons={pauseReasons}
        onReasonToggle={(value) =>
          setPauseReasons((current) =>
            current.includes(value)
              ? current.filter((item) => item !== value)
              : [...current, value],
          )
        }
        showReasonsLabel
        confirmationChecked={pauseConfirmed}
        onConfirmationChange={setPauseConfirmed}
        confirmationLabel="I confirm the documents are not approved due to above reasons."
        adminNotes={pauseAdminNotes}
        onAdminNotesChange={setPauseAdminNotes}
        onClose={closePauseModal}
        onSubmit={handlePauseSubmit}
        isSubmitting={pauseConsultationMutation.isPending}
      />

      <DecisionActionModal
        open={Boolean(deleteTarget)}
        variant="delete"
        title="Delete Consultation"
        description="Are you sure you want to delete this user? This will result in removal of the account."
        submitLabel="Delete Consultation"
        reasonOptions={deleteReasonOptions}
        selectedReasons={deleteReasons}
        onReasonToggle={(value) =>
          setDeleteReasons((current) =>
            current.includes(value)
              ? current.filter((item) => item !== value)
              : [...current, value],
          )
        }
        showReasonsLabel
        confirmationChecked={deleteConfirmed}
        onConfirmationChange={setDeleteConfirmed}
        confirmationLabel="I confirm the Consultation is not approved due to above reasons."
        adminNotes={deleteAdminNotes}
        onAdminNotesChange={setDeleteAdminNotes}
        onClose={closeDeleteModal}
        onSubmit={handleDeleteSubmit}
        isSubmitting={deleteServiceMutation.isPending}
      />
    </>
  )
}

function ServiceListingsTab({
  expertId,
  listingSubTab,
  onSubTabChange,
  fallbackServices = [],
  fallbackConsultations = [],
}: {
  expertId: string
  listingSubTab: ListingSubTab
  onSubTabChange: (tab: ListingSubTab) => void
  fallbackServices?: ExpertService[]
  fallbackConsultations?: ExpertConsultation[]
}) {
  const navigate = useNavigate()
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap gap-2">
          {(['services', 'consultations'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onSubTabChange(tab)}
              className={cn(
                'text-body-sm rounded-lg px-4 py-2 font-semibold capitalize transition-colors',
                listingSubTab === tab ? PROFILE_ACTIVE_PILL : PROFILE_IDLE_PILL,
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => navigate(`/experts/management/profile/${expertId}/clientele`)}
          className={cn(PROFILE_BTN_PRIMARY, 'shrink-0')}
        >
          <Users className="size-3.5" />
          View Clientele
        </button>
      </div>

      {listingSubTab === 'services' && (
        <ServicesSubTab expertId={expertId} fallbackServices={fallbackServices} />
      )}

      {listingSubTab === 'consultations' && (
        <ConsultationsSubTab expertId={expertId} fallbackConsultations={fallbackConsultations} />
      )}
    </div>
  )
}

function AvailabilityTab({
  availability,
  isLoading,
}: {
  availability?: PartnerAvailability | null
  isLoading?: boolean
}) {
  const weekly = availability?.weeklyAvailability ?? []
  const unavailable = availability?.unavailableDates ?? []
  const weeklyByDay = new Map(
    weekly.map((item) => [
      String(item.day || '')
        .toLowerCase()
        .slice(0, 3),
      item,
    ]),
  )

  return (
    <div className="rounded-xl bg-[#141414] p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-body-md mb-4 font-semibold text-white">Availability</h3>
          {isLoading ? (
            <p className="text-muted text-sm">Loading availability...</p>
          ) : weekly.length === 0 ? (
            <p className="text-muted text-sm">No weekly availability set.</p>
          ) : (
            <div className="overflow-hidden rounded-lg">
              <div className="text-body-sm text-muted grid grid-cols-3 bg-black px-4 py-2 font-semibold">
                <span>Days</span>
                <span>From</span>
                <span>To</span>
              </div>
              {DAYS.map((day, index) => {
                const window = weeklyByDay.get(DAY_KEYS[index])
                return (
                  <div key={day} className="text-body-sm grid grid-cols-3 items-center px-4 py-3">
                    <span className="text-white">{day}</span>
                    <span className="text-muted inline-flex w-fit items-center gap-1 rounded-full bg-black px-3 py-1">
                      <Clock className="size-3" />
                      {window?.from ? formatClock(window.from) : '—'}
                    </span>
                    <span className="text-muted inline-flex w-fit items-center gap-1 rounded-full bg-black px-3 py-1">
                      <Clock className="size-3" />
                      {window?.to ? formatClock(window.to) : '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-body-md mb-4 font-semibold text-white">Unavailability</h3>
          {isLoading ? (
            <p className="text-muted text-sm">Loading unavailability...</p>
          ) : unavailable.length === 0 ? (
            <p className="text-muted text-sm">No blocked dates recorded.</p>
          ) : (
            <div className="overflow-hidden rounded-lg">
              <div className="text-body-sm text-muted grid grid-cols-3 bg-black px-4 py-2 font-semibold">
                <span>Date</span>
                <span>From</span>
                <span>To</span>
              </div>
              {unavailable.map((item, index) => (
                <div
                  key={`${item.date}-${index}`}
                  className="text-body-sm grid grid-cols-3 items-center px-4 py-3"
                >
                  <span className="text-white">{item.date || '—'}</span>
                  <span className="text-muted inline-flex w-fit items-center gap-1 rounded-full bg-black px-3 py-1">
                    <Clock className="size-3" />
                    {formatClock(item.from)}
                  </span>
                  <span className="text-muted inline-flex w-fit items-center gap-1 rounded-full bg-black px-3 py-1">
                    <Clock className="size-3" />
                    {formatClock(item.to)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AnalyticsTab({ expertId }: { expertId?: string }) {
  const navigate = useNavigate()
  const { data: analyticsRes } = useExpertAnalytics(expertId)
  const analytics = analyticsRes?.data
  const activeMetricIds = useActiveMetricIds(EXPERT_PROFILE_ANALYTICS_MODULE_KEY, [
    ...DEFAULT_EXPERT_PROFILE_ANALYTICS_METRIC_IDS,
  ])

  const filteredActiveMetricIds = useMemo(
    () =>
      sortIdsByCatalogOrder(
        [
          ...new Set(
            activeMetricIds
              .map((id) => EXPERT_PROFILE_ANALYTICS_LEGACY_METRIC_ID_MAP[id] ?? id)
              .filter((id) => EXPERT_PROFILE_ANALYTICS_METRIC_ID_SET.has(id)),
          ),
        ],
        EXPERT_PROFILE_ANALYTICS_METRIC_IDS,
      ),
    [activeMetricIds],
  )

  const cards = useMemo(() => {
    const allCards = buildExpertProfileAnalyticsMetricCards(analytics)
    return orderByActiveMetricIds(allCards, filteredActiveMetricIds)
  }, [analytics, filteredActiveMetricIds])

  const manageMetricsPath = expertId
    ? `/metrics/expert-profile-analytics?returnTo=${encodeURIComponent(`/experts/management/profile/${expertId}`)}`
    : '/metrics/expert-profile-analytics'

  return (
    <div className="rounded-xl bg-[#141414] p-6">
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
        {cards.map((card) => (
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
            if (!expertId) return
            navigate(`/experts/management/profile/${expertId}/analytics`)
          }}
          className="text-body-sm flex items-center justify-center gap-1.5 rounded-lg bg-[#050505] p-4 font-semibold text-white transition-colors hover:bg-white/5"
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
  reports: ExpertReportItem[]
  tickets: SupportTicket[]
  onOpenReport: (report: ExpertReportItem) => void
}) {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')

  const incidents = useMemo(() => {
    const reportRows = reports.map((report) => {
      const issue = String(report.issueType || '').toLowerCase()
      const statusRaw = String(report.investigationStatus || '').toLowerCase()
      const isViolation = VIOLATION_ISSUE_TYPES.has(issue) || OPEN_REPORT_STATUSES.has(statusRaw)
      const isOpen =
        OPEN_REPORT_STATUSES.has(statusRaw) || statusRaw === 'open' || statusRaw === 'new'
      const isUnderReview =
        statusRaw === 'under review' || statusRaw === 'in review' || statusRaw === 'waiting'

      const typeClass = isViolation ? 'bg-[#3D1414]' : 'bg-[#3D2814]'

      const statusClass = isUnderReview
        ? 'bg-[#3D2814]'
        : isOpen
          ? 'bg-[#A619004D]'
          : 'bg-[#143D2B] text-[#00E065]'

      return {
        id: report.id || report.reportId,
        kind: isViolation ? 'violation' : 'reported-against',
        type: isViolation ? 'Violation' : 'Report Against',
        typeClass,
        status: report.investigationStatus || 'Open',
        statusClass,
        title: report.issueType || 'Spam Content Detected',
        detail:
          report.reason ||
          'Multiple identical messages sent to different users within short timeframe',
        raisedOn: report.submittedAt,
        updatedOn: report.latestActionTimestamp || report.submittedAt,
        action: 'View Details',
        icon: Eye,
        onAction: () => onOpenReport(report),
      }
    })

    const ticketRows = tickets.map((ticket) => {
      const statusRaw = String(ticket.status || '').toLowerCase()
      const isActive =
        ACTIVE_TICKET_STATUSES.has(statusRaw) || statusRaw === 'open' || statusRaw === 'in_progress'
      const isResolved = statusRaw === 'resolved' || statusRaw === 'closed'

      const isOpenStatus = statusRaw === 'open'
      const statusClass = isResolved
        ? 'bg-[#143D2B] text-[#00E065]'
        : isOpenStatus
          ? 'bg-[#A619004D]'
          : isActive
            ? 'bg-[#3D2814]'
            : 'bg-[#3D1414]'

      return {
        id: ticket.id,
        kind: 'reported-by',
        type: 'Reported By',
        typeClass: 'bg-[#1447E64D]',
        status: ticket.status || 'Resolved',
        statusClass,
        title: ticket.subject || 'Spam Content Detected',
        detail:
          ticket.issueType ||
          ticket.category ||
          'Multiple identical messages sent to different users within short timeframe',
        raisedOn: ticket.createdAt,
        updatedOn: ticket.resolvedAt || ticket.createdAt,
        action: 'View Ticket',
        icon: Eye,
        onAction: () => navigate(`/support/tickets/${ticket.id}`),
      }
    })

    return [...reportRows, ...ticketRows]
  }, [navigate, onOpenReport, reports, tickets])

  const visible = incidents.filter((item) => filter === 'all' || item.kind === filter)
  const atRisk =
    reports.some((report) =>
      OPEN_REPORT_STATUSES.has(String(report.investigationStatus || '').toLowerCase()),
    ) || tickets.some((ticket) => ACTIVE_TICKET_STATUSES.has(String(ticket.status).toLowerCase()))

  return (
    <div className="rounded-xl bg-[#141414] p-6">
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
            'inline-flex h-[33px] items-center justify-center rounded-[10px] px-1.5 text-[14px] leading-[17px] font-medium tracking-normal whitespace-nowrap text-white',
            atRisk ? 'bg-[#D3191C33]' : 'bg-[#143D2B]',
          )}
        >
          Profile Health: {atRisk ? 'At Risk' : 'Healthy'}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {visible.length === 0 ? (
          <p className="text-muted py-8 text-center text-sm">No reported issues for this expert.</p>
        ) : (
          visible.map((incident) => (
            <div key={`${incident.kind}-${incident.id}`} className="rounded-xl bg-[#050505] p-5">
              <div className="flex items-center justify-between">
                <span className={cn(PROFILE_HEALTH_CHIP, incident.typeClass)}>{incident.type}</span>
                <span className={cn(PROFILE_HEALTH_CHIP, incident.statusClass)}>
                  {incident.status}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-white">{incident.title}</p>
                  <p className="text-body-sm mt-1 text-white/50">{incident.detail}</p>
                  <div className="mt-3 space-y-0.5 text-xs text-white/40">
                    <p>Raised On: {incident.raisedOn || '—'}</p>
                    {incident.updatedOn ? <p>Last Updated: {incident.updatedOn}</p> : null}
                  </div>
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

export function ExpertProfileViewPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { fileFormat, option: exportFormat } = useDefaultExportFormat()
  const { id } = useParams<{ id: string }>()
  const { allowNewServiceListings, allowNewConsultationListings } = useServiceListingControls()
  const canCreateListings = allowNewServiceListings || allowNewConsultationListings
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [listingSubTab, setListingSubTab] = useState<ListingSubTab>('services')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [suspendModalOpen, setSuspendModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [suspendReasons, setSuspendReasons] = useState<string[]>([])
  const [suspendStartDate, setSuspendStartDate] = useState('')
  const [suspendEndDate, setSuspendEndDate] = useState('')
  const [suspendIndefinitely, setSuspendIndefinitely] = useState(false)
  const [suspendAdminNotes, setSuspendAdminNotes] = useState('')
  const [deleteReasons, setDeleteReasons] = useState<string[]>([])
  const [deleteAdminNotes, setDeleteAdminNotes] = useState('')
  const [notesModalOpen, setNotesModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [customUrlModalOpen, setCustomUrlModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<ExpertReportItem | null>(null)
  const scrollToTimelineRef = useRef(false)
  const { tagModalOpen, openTagModal, closeTagModal } = useEntityTags()

  const suspendExpertMutation = useSuspendExpert()
  const blockExpertMutation = useBlockExpert()
  const forceLogoutExpertMutation = useForceLogoutExpert()
  const deactivateExpertMutation = useDeactivateExpert()
  const setExpertPasswordMutation = useSetExpertPassword()
  const recordReasonUsage = useRecordModerationReasonUsage()
  const { options: suspendReasonOptions, buildPayload: buildSuspendReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.suspendExpert)
  const { options: deleteReasonOptions, buildPayload: buildDeleteReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.deleteExpert)

  const {
    data: profileResponse,
    isLoading: profileLoading,
    isError: profileError,
    error: profileErrorDetail,
  } = useExpertProfile(id)

  const { data: leaderboardProfileRes } = useExpertLeaderboardProfile(id ?? null, {})
  const { data: analyticsRes } = useExpertAnalytics(id)
  const updateNotesMutation = useUpdateExpertAdminNotes(id)
  const updateTagsMutation = useUpdateExpertAdminTags(id)
  const customLinkQuery = useExpertCustomLink(id, customUrlModalOpen)
  const updateCustomLinkVisibilityMutation = useUpdateExpertCustomLinkVisibility(id)
  const { data: availabilityRes, isLoading: availabilityLoading } = useExpertAvailability(
    id,
    activeTab === 'availability',
  )
  const { data: reportsRes, refetch: refetchReports } = useExpertReportsForPartner(id)
  const { data: ticketsRes, isLoading: ticketsLoading } = useQuery({
    queryKey: ['expert-support-tickets', id],
    queryFn: () =>
      fetchSupportTickets({
        reporterId: id,
        includeClosed: true,
        limit: 50,
      }),
    enabled: Boolean(id),
  })

  const profile = profileResponse?.data
  const reports = useMemo(() => unwrapReportItems(reportsRes), [reportsRes])
  const allTickets = useMemo(() => ticketsRes?.data?.tickets ?? [], [ticketsRes])
  const activeTickets = useMemo(
    () =>
      allTickets.filter((ticket) =>
        ACTIVE_TICKET_STATUSES.has(String(ticket.status).toLowerCase()),
      ),
    [allTickets],
  )
  const timelineEvents = useMemo(
    () => (profile ? buildExpertTimelineEvents(profile, allTickets, reports) : []),
    [allTickets, profile, reports],
  )

  useEffect(() => {
    if (!scrollToTimelineRef.current || activeTab !== 'overview') return
    document
      .getElementById('expert-timeline')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    scrollToTimelineRef.current = false
  }, [activeTab])

  const navigateToCreateListing = useCallback(() => {
    if (!id) return
    if (!canCreateListings) {
      toast.error(RESTRICTION_MESSAGES.listingsCreate)
      return
    }
    navigate(`/services/management/create?partnerId=${encodeURIComponent(id)}`)
  }, [canCreateListings, id, navigate])

  const closeSuspendModal = useCallback(() => {
    setSuspendModalOpen(false)
    setSuspendReasons([])
    setSuspendStartDate('')
    setSuspendEndDate('')
    setSuspendIndefinitely(false)
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
        .getElementById('expert-timeline')
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
      updateNotesMutation.mutate(notes, {
        onSuccess: () => {
          toast.success('Admin notes saved')
          setNotesModalOpen(false)
        },
        onError: (error: unknown) => {
          toast.error(getApiErrorMessage(error, 'Failed to save admin notes'))
        },
      })
    },
    [updateNotesMutation],
  )

  const handleSaveTags = useCallback(
    async (tags: string[]) => {
      await updateTagsMutation.mutateAsync(tags)
      toast.success('Tags updated')
    },
    [updateTagsMutation],
  )

  const handleShareProfile = useCallback(() => {
    if (!profile) return
    const url = resolveCustomUrl(profile, analyticsRes?.data)
    if (!url) {
      toast.error('No custom URL is set for this expert.')
      return
    }
    setShareModalOpen(true)
  }, [analyticsRes?.data, profile])

  const handleExportProfile = useCallback(() => {
    if (!profile || !id) return
    const basic = profile.basicProfile
    const analytics = analyticsRes?.data
    const customUrl = resolveCustomUrl(profile, analytics)
    const expertCode = formatExpertId(id)
    const ratings =
      analytics?.ratingsSummary?.average ??
      profile.ratings ??
      profile.rating ??
      profile.analytics?.rating
    const nps =
      analytics?.nps?.available === false
        ? ''
        : (analytics?.nps?.score ?? profile.nps ?? profile.analytics?.nps)
    const experience =
      formatExperience(basic?.experienceYears, basic?.experienceMonths) ||
      (profile.experience ? `${profile.experience} Years` : '')
    const earnings =
      analytics?.listingOverview?.totalEarnings ??
      profile.totalEarnings ??
      profile.analytics?.totalEarnings
    const orders =
      analytics?.listingOverview?.ordersCompleted ??
      profile.totalOrdersCompleted ??
      profile.completedOrders ??
      profile.analytics?.completedOrders
    const kycLabel = getKycBadge(profile.finalReview).label

    try {
      exportDataToFile(
        [
          'Name',
          'Expert ID',
          'Type',
          'Custom URL',
          'Ratings',
          'NPS',
          'Experience',
          'Earnings',
          'Orders',
          'KYC',
          'Last Active',
          'Notes',
          'Tags',
        ],
        [
          [
            exportCell(basic?.fullname || profile.fullname),
            exportCell(expertCode),
            exportCell(profile.servicetype || basic?.serviceType),
            exportCell(customUrl),
            exportCell(ratings),
            exportCell(nps),
            exportCell(experience === '—' ? '' : experience),
            exportCell(earnings),
            exportCell(orders),
            exportCell(kycLabel),
            exportCell(profile.lastActiveAt || profile.updatedAt),
            exportCell(profile.finalReview?.internalNotes),
            exportCell((profile.adminTags || []).join(', ')),
          ],
        ],
        fileFormat,
        `expert_${expertCode}_profile`,
      )
      toast.success(`Profile exported as ${exportFormat}`)
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message === 'NO_RECORDS'
          ? 'Nothing to export'
          : 'Failed to export profile'
      toast.error(message)
    }
  }, [analyticsRes?.data, exportFormat, fileFormat, id, profile])

  const handlePasswordSubmit = useCallback(
    async (payload: { oldPassword: string; newPassword: string; confirmNewPassword: string }) => {
      if (!id) return

      if (payload.newPassword.length < 6) {
        toast.error('Password must be at least 6 characters')
        return
      }

      if (payload.newPassword !== payload.confirmNewPassword) {
        toast.error('New password and confirmation do not match')
        return
      }

      try {
        const response = await setExpertPasswordMutation.mutateAsync({
          id,
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
    [id, setExpertPasswordMutation],
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
    if (!id) return

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

    const reasonPayload = buildSuspendReasonPayload(suspendReasons)
    if (reasonPayload.selectedReasons.length === 0) {
      toast.error('Selected reasons are no longer available. Please refresh and try again.')
      return
    }

    suspendExpertMutation.mutate(
      {
        id,
        payload: {
          selectedReasons: reasonPayload.selectedReasons,
          suspendIndefinitely,
          startDate: suspendIndefinitely ? undefined : toIso(suspendStartDate),
          endDate: suspendIndefinitely ? undefined : toIso(suspendEndDate),
          reasonDetails: reasonPayload.reasonDetails,
          adminNotes: suspendAdminNotes.trim(),
        },
      },
      {
        onSuccess: () => {
          if (reasonPayload.reasonIds.length > 0) {
            recordReasonUsage.mutate(reasonPayload.reasonIds)
          }
          toast.success('Expert suspended successfully')
          closeSuspendModal()
          setProfileMenuOpen(false)
          queryClient.invalidateQueries({ queryKey: ['expert-profile', id] })
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } }
          toast.error(getApiErrorMessage(err, 'Failed to suspend expert. Please try again.'))
        },
      },
    )
  }, [
    buildSuspendReasonPayload,
    closeSuspendModal,
    id,
    queryClient,
    recordReasonUsage,
    suspendAdminNotes,
    suspendEndDate,
    suspendIndefinitely,
    suspendExpertMutation,
    suspendReasons,
    suspendStartDate,
  ])

  const handleDeleteSubmit = useCallback(() => {
    if (!id) return

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
        id,
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
          toast.success('Expert deleted successfully')
          closeDeleteModal()
          setProfileMenuOpen(false)
          queryClient.invalidateQueries({ queryKey: ['expert-profile', id] })
          navigate('/experts/management')
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } }
          toast.error(getApiErrorMessage(err, 'Failed to delete expert. Please try again.'))
        },
      },
    )
  }, [
    buildDeleteReasonPayload,
    closeDeleteModal,
    deactivateExpertMutation,
    deleteAdminNotes,
    deleteReasons,
    id,
    navigate,
    queryClient,
    recordReasonUsage,
  ])

  if (profileLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="border-brand-accent size-9 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    )
  }

  if (profileError || !profile || !id) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/experts/management')}
          className="group font-heading text-h3 flex w-fit items-center gap-2 font-bold text-white transition-colors hover:text-[#E0A263]"
        >
          <ArrowLeft className="size-5" />
          <span>Expert Profile View</span>
        </button>
        <div className="bg-brand-danger/10 rounded-lg border border-red-500/40 px-4 py-3 text-sm text-red-400">
          {getApiErrorMessage(profileErrorDetail, 'Unable to load expert profile.')}
        </div>
      </div>
    )
  }

  const basic = profile.basicProfile
  const displayName = basic?.fullname || profile.fullname || 'Expert'
  const coverImage = basic?.coverImage
  const avatarImage = basic?.profileImage
  const subtitle = [basic?.industry, basic?.location].filter(Boolean).join(' • ')
  const leaderboardRank = leaderboardProfileRes?.data?.rank
  const expertRank =
    leaderboardRank ??
    (profile as unknown as { rank?: number; leaderboardRank?: number })?.rank ??
    (profile as unknown as { leaderboardRank?: number })?.leaderboardRank
  const rankingBadgeText =
    expertRank != null && Number(expertRank) > 0 ? `# ${expertRank} Ranking` : 'Unranked'

  const headerActions = [
    ...(canCreateListings
      ? [
          {
            label: 'Create Listings',
            icon: Plus,
            onClick: navigateToCreateListing,
          },
        ]
      : []),
    {
      label: 'Add Notes',
      icon: FileText,
      onClick: () => setNotesModalOpen(true),
    },
    { label: 'Add Tags', icon: Tag, onClick: () => openTagModal(id || displayName) },
    {
      label: 'Export Data',
      icon: Upload,
      onClick: handleExportProfile,
    },
    {
      label: 'Share Profile',
      icon: Share2,
      onClick: handleShareProfile,
    },
  ]

  return (
    <div className="flex w-full max-w-full min-w-0 flex-col gap-5 overflow-x-hidden">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/experts/management')}
            className="group font-heading text-h3 flex w-fit max-w-full items-center gap-2 font-bold tracking-tight text-white transition-colors hover:text-[#E0A263]"
          >
            <ArrowLeft className="size-5 shrink-0 transition-transform group-hover:-translate-x-1" />
            <span className="truncate">Expert Profile View</span>
          </button>
          <div className="pl-7">
            <PageBreadcrumb
              items={[
                { label: 'Expert Management', to: '/experts/management' },
                { label: 'Manage Expert', to: '/experts/management' },
                { label: displayName, isActive: true },
              ]}
            />
          </div>
        </div>
        <div className="shrink-0">
          <TableActionsDropdown
            label="Open expert profile actions"
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
                navigate(`/experts/management/create?expertId=${id}&mode=edit`)
              }}
            >
              Edit Profile
            </TableActionsItem>
            <TableActionsItem
              tone="light"
              icon={<Users className="size-3.5" />}
              onClick={() => {
                setProfileMenuOpen(false)
                navigate(`/experts/management/profile/${id}/clientele`)
              }}
            >
              View Clientele
            </TableActionsItem>
            <TableActionsItem
              tone="light"
              icon={<Eye className="size-3.5" />}
              onClick={() => {
                setProfileMenuOpen(false)
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
                if (!id) return
                forceLogoutExpertMutation.mutate(id, {
                  onSuccess: (res) => {
                    toast.success(
                      res?.message ||
                        'Expert sessions revoked. They will be logged out on the next app request.',
                    )
                  },
                  onError: (err: unknown) => {
                    toast.error(getApiErrorMessage(err, 'Failed to logout expert'))
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
                if (!id) return
                blockExpertMutation.mutate(id, {
                  onSuccess: (res) => {
                    toast.success(res?.message || 'Expert blocked successfully')
                  },
                  onError: (err: unknown) => {
                    toast.error(getApiErrorMessage(err, 'Failed to block expert'))
                  },
                })
              }}
            >
              Block User
            </TableActionsItem>
            <TableActionsItem
              tone="light"
              icon={<img src={deleteIcon} alt="delete" className="size-3.5" />}
              className="text-red-500 hover:bg-red-50 hover:text-red-600 [&_svg]:text-red-500"
              onClick={() => {
                setProfileMenuOpen(false)
                setDeleteModalOpen(true)
              }}
            >
              Delete User
            </TableActionsItem>
          </TableActionsDropdown>
        </div>
      </header>

      <div className="relative min-w-0 overflow-hidden rounded-xl bg-[#141414]">
        <div className="h-40 w-full bg-[#050505]">
          <SafeImage
            src={coverImage}
            alt={`${displayName} cover`}
            className="size-full object-cover"
            fallback={
              <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#2b3a8c] via-[#4b2f8c] to-[#141414]" />
            }
          />
        </div>
        <div className="flex min-w-0 flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="-mt-12 size-20 shrink-0 self-end overflow-hidden rounded-full border-2 border-[#E0A263] bg-[#141414]">
              <SafeImage
                src={avatarImage}
                alt={displayName}
                className="size-full object-cover"
                fallback={
                  <div className="text-muted flex size-full items-center justify-center">
                    <User className="size-7" />
                  </div>
                }
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-bold text-white">{displayName}</h2>
                <span className="inline-flex h-[25px] items-center justify-center rounded-[10px] border border-[#1E563D]/50 bg-[#143D2B] px-2.5 text-[12px] leading-[14px] font-semibold tracking-normal text-white">
                  {rankingBadgeText}
                </span>
              </div>
              <p className="text-body-sm text-white/50">{subtitle || '—'}</p>
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
                ) : action.label.toLowerCase().includes('notes') ? (
                  <img src={notepadIcon} alt="" className="size-3 shrink-0" aria-hidden="true" />
                ) : (
                  <action.icon className="size-3 shrink-0" strokeWidth={2.25} />
                )}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid w-full min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,438px)_minmax(0,1fr)]">
        <div className="min-w-0">
          <ProfileSidebar
            profile={profile}
            partnerId={id}
            analytics={analyticsRes?.data}
            tickets={activeTickets}
            ticketsLoading={ticketsLoading}
            onCheckTimelines={handleCheckTimelines}
            onOpenCustomUrl={() => setCustomUrlModalOpen(true)}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex h-[50px] min-w-0 items-stretch gap-1 overflow-x-auto rounded-xl bg-[#141414] px-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'relative shrink-0 px-3 text-[13px] font-semibold whitespace-nowrap transition-colors sm:flex-1 sm:px-4',
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
              profile={profile}
              partnerId={id}
              tags={profile.adminTags ?? []}
              timelineEvents={timelineEvents}
            />
          )}
          {activeTab === 'service-listings' && (
            <ServiceListingsTab
              expertId={id}
              listingSubTab={listingSubTab}
              onSubTabChange={setListingSubTab}
              fallbackServices={profile.listedServices ?? []}
              fallbackConsultations={profile.listedConsultations ?? []}
            />
          )}
          {activeTab === 'availability' && (
            <AvailabilityTab availability={availabilityRes?.data} isLoading={availabilityLoading} />
          )}
          {activeTab === 'analytics' && <AnalyticsTab expertId={id} />}
          {activeTab === 'health' && (
            <HealthTab reports={reports} tickets={allTickets} onOpenReport={setSelectedReport} />
          )}
        </div>
      </div>

      <UpdatePasswordModal
        open={passwordModalOpen}
        userName={displayName}
        requireOldPassword={false}
        mode={profile.hasPassword ? 'reset' : 'set'}
        isSubmitting={setExpertPasswordMutation.isPending}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handlePasswordSubmit}
      />

      <DecisionActionModal
        open={suspendModalOpen}
        variant="suspend"
        title="Suspend Expert"
        description="Are you sure you want to suspend this Expert? This will result in removal of the account."
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
        adminNotes={suspendAdminNotes}
        onAdminNotesChange={setSuspendAdminNotes}
        onClose={closeSuspendModal}
        onSubmit={handleSuspendSubmit}
        isSubmitting={suspendExpertMutation.isPending}
      />

      <DecisionActionModal
        open={deleteModalOpen}
        variant="delete"
        title="Delete Expert"
        description="Are you sure you want to delete this user? This will result in removal of the account."
        submitLabel="Delete Expert"
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
        initialTags={profile.adminTags ?? []}
        onSubmit={handleSaveTags}
      />

      <AdminNotesModal
        open={notesModalOpen}
        initialNotes={profile.finalReview?.internalNotes || ''}
        onClose={() => setNotesModalOpen(false)}
        onSubmit={handleSaveNotes}
      />

      <ShareProfileModal
        open={shareModalOpen}
        url={resolveCustomUrl(profile, analyticsRes?.data) || ''}
        title={`Check out ${displayName}'s expert profile`}
        onClose={() => setShareModalOpen(false)}
      />

      <CustomUrlModal
        open={customUrlModalOpen}
        expertName={displayName}
        details={customLinkQuery.data ?? null}
        isLoading={customLinkQuery.isLoading}
        isSaving={updateCustomLinkVisibilityMutation.isPending}
        onClose={() => setCustomUrlModalOpen(false)}
        onToggleVisible={(visible) => {
          updateCustomLinkVisibilityMutation.mutate(visible, {
            onSuccess: () => {
              toast.success(
                visible
                  ? 'Custom URL is now visible on the profile'
                  : 'Custom URL is now hidden from the profile',
              )
            },
            onError: (error) => {
              toast.error(getApiErrorMessage(error))
            },
          })
        }}
      />

      <ExpertReportDetailModal
        report={selectedReport}
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        onUpdated={() => {
          void refetchReports()
        }}
      />
    </div>
  )
}
