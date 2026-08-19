import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams, type NavigateFunction } from 'react-router-dom'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { useQueryClient } from '@tanstack/react-query'
import deleteIcon from '@/assets/JOMS_ICONS-2/icons8-delete.svg'
import editIcon from '@/assets/JOMS_ICONS-2/edit.svg'
import { toast } from 'sonner'
import {
  AlertOctagon,
  ArrowLeft,
  Ban,
  Bell,
  Briefcase,
  Check,
  CheckSquare,
  ChevronRight,
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
  RefreshCw,
  Search,
  Share2,
  SlidersHorizontal,
  Star,
  Tag,
  Trash2,
  Upload,
  User,
  Users,
  Filter,
} from 'lucide-react'

import { fetchConsultationById, fetchServiceById } from '../../api/service-api'
import {
  consultationPerformancePath,
  getExpertServiceDrilldownPath,
  getServiceManagementViewPath,
} from '../../lib/service-navigation'
import { openExpertKycFromProfile } from '../../utils/expert-application-navigation'
import {
  useDeactivateExpert,
  useSetExpertPassword,
  useSuspendExpert,
  useBlockExpert,
  useForceLogoutExpert,
} from '../../hooks/use-expert'
import {
  useDeleteService,
  useSuspendService,
  useUpdateConsultationStatus,
  useBulkDeleteServices,
  useBulkPauseServices,
  useBulkHideServices,
  useBulkDisableServices,
} from '../../hooks/use-services'
import { useEscalationAssignees } from '@/modules/my-tasks/hooks/use-admin-escalation'
import { escalateServiceApplication } from '@/modules/my-tasks/api/escalation-api'
import { exportDataToFile } from '@/shared/utils/export-utils'
import {
  useExpertAnalytics,
  useExpertConsultations,
  useExpertProfile,
  useExpertServices,
  usePartnerInsights,
} from '../../hooks/use-expert-profile'
import {
  DEFAULT_EXPERT_PROFILE_ANALYTICS_METRIC_IDS,
  EXPERT_PROFILE_ANALYTICS_METRIC_ID_SET,
  EXPERT_PROFILE_ANALYTICS_METRIC_IDS,
  EXPERT_PROFILE_ANALYTICS_MODULE_KEY,
} from '../../config/expert-profile-analytics-metrics.config'
import { orderByActiveMetricIds, useActiveMetricIds } from '../../hooks/use-active-metric-ids'
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
import { AddTagModal } from '@/shared/components/modal/add-tag-modal'
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
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import type { FilterValues } from '@/shared/types/data-filter'
import { buildExpertProfileServicesQueryParams } from '@/shared/utils/export-filter-utils'

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

const PROFILE_HEADER_BTN =
  'inline-flex h-[25px] items-center justify-center gap-1.5 rounded-[12px] bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] px-3 text-[11px] leading-none font-semibold whitespace-nowrap text-[#050505] transition-[filter] hover:brightness-95'

const PROFILE_CARD = 'rounded-xl bg-[#141414]'

const PROFILE_ACTIVE_PILL = 'bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] text-[#050505]'

const PROFILE_IDLE_PILL = 'border border-[#FFFFFF33] bg-[#050505] text-white hover:bg-white/5'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const getApiErrorMessage = (error: unknown) => {
  const err = error as { response?: { data?: { message?: string } } }
  return err?.response?.data?.message || 'Unable to load expert profile.'
}

const comingSoon = (label: string) => toast.message(`${label} is coming soon`)

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
    navigate(
      getExpertServiceDrilldownPath(
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
  return `${start} - ${end}`
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
      className: 'bg-[rgb(0_166_62_/_30%)] text-[#00A63E]',
    }
  }
  return { label: 'Review Pending', className: 'bg-amber-500/15 text-amber-300' }
}

const formatServiceType = (value?: string) => {
  if (!value) return '—'
  return value.charAt(0).toUpperCase() + value.slice(1)
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
    <div className="flex items-center justify-between gap-2 py-3">
      <span className="text-body-sm text-muted shrink-0">{label}</span>
      <span className="max-w-[65%] min-w-0 truncate text-right text-[13px] font-semibold text-white">
        {children}
      </span>
    </div>
  )
}

function ProfileSidebar({
  profile,
  partnerId,
  analytics,
}: {
  profile: ExpertProfileDetail
  partnerId: string
  analytics?: ExpertAnalyticsData
}) {
  const navigate = useNavigate()
  const basic = profile.basicProfile
  const kycBadge = getKycBadge(profile.finalReview)

  // Exact Custom Link from Profile API (profile.customUrl / profile.customLink / profile.shareUrl)
  const customUrl =
    profile.customUrl ||
    ((profile as unknown as Record<string, unknown>).customLink as string | undefined) ||
    profile.profileUrl ||
    ((profile as unknown as Record<string, unknown>).shareUrl as string | undefined) ||
    (analytics as unknown as { profileHeader?: { customUrl?: string } })?.profileHeader
      ?.customUrl ||
    null

  const deepLink =
    ((profile as unknown as Record<string, unknown>).deepLink as string | undefined) ||
    (customUrl && profile.customUsername ? `jomspartner://profile/${profile.customUsername}` : null)

  // Ratings data from Analytics or Profile API (No static fallbacks)
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

  // NPS score from Analytics or Profile API (No static fallbacks)
  const npsScore =
    analytics?.nps?.available === false
      ? null
      : (analytics?.nps?.score ?? profile.nps ?? profile.analytics?.nps)

  // Experience from basic profile or profile
  const experienceYears = basic?.experienceYears
  const experienceMonths = basic?.experienceMonths
  const formattedExperience =
    formatExperience(experienceYears, experienceMonths) ||
    (profile.experience ? `${profile.experience} Years` : null)

  // Total Earnings from Analytics listingOverview or Profile API
  const rawEarnings =
    analytics?.listingOverview?.totalEarnings ??
    profile.totalEarnings ??
    profile.analytics?.totalEarnings

  // Total Orders Completed from Analytics listingOverview or Profile API
  const rawOrdersCompleted =
    analytics?.listingOverview?.ordersCompleted ??
    profile.totalOrdersCompleted ??
    profile.completedOrders ??
    profile.analytics?.completedOrders

  return (
    <div className="flex flex-col gap-4">
      <div className={cn(PROFILE_CARD, 'p-5')}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-white">Profile &amp; Account</h3>
          <span className={cn('rounded-md px-2.5 py-1 text-[10px] font-bold', kycBadge.className)}>
            {kycBadge.label}
          </span>
        </div>

        <SidebarRow label="Expert ID">{formatExpertId(partnerId)}</SidebarRow>
        <SidebarRow label="Expert Type">
          {formatServiceType(profile.servicetype || basic?.serviceType)}
        </SidebarRow>
        <SidebarRow label="Expert Custom URL">
          {customUrl ? (
            <a
              href={customUrl}
              title={deepLink ? `Custom URL: ${customUrl}\nDeep Link: ${deepLink}` : customUrl}
              onClick={(event) => {
                event.preventDefault()
                if (deepLink) {
                  try {
                    window.location.href = deepLink
                  } catch {
                    // Ignore deep link errors
                  }
                }
                setTimeout(() => {
                  window.open(customUrl, '_blank')
                }, 300)
              }}
              className="block truncate font-medium text-white underline transition-colors hover:text-[#E0A263]"
            >
              {customUrl}
            </a>
          ) : (
            '—'
          )}
        </SidebarRow>
        <SidebarRow label="Ratings">
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5 fill-[#E0A263] text-[#E0A263]" />
            {ratingsAvailable && ratingAverage !== undefined && ratingAverage !== null
              ? Number(ratingAverage).toFixed(1)
              : '—'}
            <span className="text-body-sm text-muted font-normal">
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
        <SidebarRow label="Last Active">{formatLastActive(profile.updatedAt)}</SidebarRow>
        <SidebarRow label="KYC">
          <button
            type="button"
            onClick={() =>
              openExpertKycFromProfile(
                partnerId,
                profile.servicetype || basic?.serviceType,
                navigate,
              )
            }
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
            {profile.finalReview?.internalNotes || 'None'}
          </p>
        </div>
      </div>
    </div>
  )
}

function OverviewTab({ profile, partnerId }: { profile: ExpertProfileDetail; partnerId: string }) {
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
    <div className="flex flex-col gap-5">
      <div className={cn(PROFILE_CARD, 'p-6')}>
        <section>
          <h3 className="text-body-md mb-3 font-semibold text-white">About</h3>
          <p className="text-[13px] leading-relaxed text-white/70">
            {basic?.bio || 'No bio provided.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.phoneVerified && (
              <span className="rounded-md bg-[rgb(0_166_62_/_30%)] px-2.5 py-1 text-[10px] font-bold text-[#00A63E]">
                Phone Verified
              </span>
            )}
            {profile.emailVerified && (
              <span className="rounded-md bg-[rgb(0_166_62_/_30%)] px-2.5 py-1 text-[10px] font-bold text-[#00A63E]">
                Email Verified
              </span>
            )}
          </div>
        </section>

        {offerings.length > 0 ? (
          <section className="mt-5 pt-5">
            <h3 className="text-body-md mb-4 font-semibold text-white">Core Offerings</h3>
            <ul className="space-y-2.5">
              {offerings.map((item) => (
                <li key={item} className="flex items-center gap-2 text-[13px] text-white/70">
                  <Check className="size-4 shrink-0 text-white" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {galleryImages.length > 0 ? (
          <section className="mt-5 pt-5">
            <h3 className="text-body-md mb-4 font-semibold text-white">Gallery</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {galleryImages.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="aspect-square overflow-hidden rounded-lg bg-[#050505]"
                >
                  <SafeImage
                    src={image}
                    alt={`Gallery ${index + 1}`}
                    className="size-full object-cover"
                    fallback={
                      <div className="text-muted flex size-full items-center justify-center">
                        <ImageOff className="size-5" />
                      </div>
                    }
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {workExperience.length > 0 ? (
        <div className={cn(PROFILE_CARD, 'p-6')}>
          <h3 className="text-body-md mb-4 font-semibold text-white">Work Experience</h3>
          <div className="space-y-3">
            {workExperience.map((entry) => (
              <div
                key={entry._id || `${entry.jobTitle}-${entry.companyName}`}
                className="flex gap-3 rounded-lg bg-[#050505] p-4"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#141414]">
                  <Briefcase className="size-4 text-[#E0A263]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">{entry.jobTitle || '—'}</p>
                  <p className="text-body-sm text-white/50">
                    {entry.companyName || '—'} | {formatWorkPeriod(entry)}
                  </p>
                  {entry.description ? (
                    <p className="text-body-sm mt-1 text-white/70">{entry.description}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className={cn(PROFILE_CARD, 'p-6')}>
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
              No reviews yet for this expert.
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
                  <p className="text-body-sm mt-2 text-white/50">Service Availed: {review.title}</p>
                ) : null}
                {review.text ? (
                  <p className="text-body-sm mt-2 text-white/70">{review.text}</p>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
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

  return (
    <div className="rounded-xl bg-[#141414] p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-stretch gap-3">
            <span className="bg-brand-accent w-[3px] shrink-0 rounded-full" aria-hidden="true" />
            <div className="min-w-0">
              <h3 className="text-[18px] leading-tight font-bold text-white">
                <button
                  type="button"
                  className="text-left hover:underline"
                  onClick={() => viewExpertConsultation(consultation, expertId, navigate)}
                >
                  {consultation.title || 'Untitled Consultation'}
                </button>
              </h3>
              <p className="text-muted mt-1 text-[13px]">Business</p>
            </div>
          </div>
          {(consultation.topics ?? []).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2.5">
              {(consultation.topics ?? []).map((topic) => (
                <span
                  key={topic._id}
                  className="bg-brand-muted text-body-sm rounded-md px-3.5 py-1.5 font-medium text-black"
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
          menuWidth={220}
          tone="light"
        >
          <TableActionsItem
            tone="light"
            icon={<RefreshCw className="size-3.5" />}
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

      {consultation.whoItsFor && (
        <div className="mt-5">
          <p className="text-body-sm mb-2 font-semibold text-white">Who is it for?</p>
          <p className="text-body-sm text-muted">{consultation.whoItsFor}</p>
        </div>
      )}

      <div className="mt-5">
        <p className="text-body-sm mb-3 font-semibold text-white">Additional Information</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-[#050505] p-3 text-center">
            <Phone className="mx-auto size-4 text-[#E0A263]" />
            <p className="text-body-sm text-muted mt-2">Mode</p>
            <p className="text-body-sm font-semibold text-white capitalize">
              {consultation.mode || '—'}
            </p>
          </div>
          <div className="rounded-lg bg-[#050505] p-3 text-center">
            <Languages className="mx-auto size-4 text-[#E0A263]" />
            <p className="text-body-sm text-muted mt-2">Language</p>
            <p className="text-body-sm font-semibold text-white">
              {(consultation.languages ?? []).join(', ') || '—'}
            </p>
          </div>
          <div className="rounded-lg bg-[#050505] p-3 text-center">
            <Clock className="mx-auto size-4 text-[#E0A263]" />
            <p className="text-body-sm text-muted mt-2">FollowUps</p>
            <p className="text-body-sm font-semibold text-white">
              {consultation.hasFollowUp && consultation.followUpDays
                ? `${consultation.followUpDays} Days`
                : '—'}
            </p>
          </div>
        </div>
      </div>

      {(consultation.pricingOptions ?? []).length > 0 && (
        <div className="mt-5">
          <p className="text-body-sm mb-3 font-semibold text-white">Duration &amp; Pricing</p>
          <div className="flex flex-wrap gap-2">
            {(consultation.pricingOptions ?? []).map((option) => (
              <span
                key={`${option.durationMinutes}-${option.price}`}
                className="text-body-sm rounded-lg bg-[#050505] px-3 py-2 font-semibold text-white"
              >
                {formatPricing(option)}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => viewExpertConsultation(consultation, expertId, navigate)}
        className="text-body-sm mt-5 flex w-full items-center justify-between rounded-lg bg-[#050505] px-4 py-3 font-semibold text-white transition-colors hover:bg-white/5"
      >
        Consultation Performance
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}

function ServicesSubTab({ expertId }: { expertId: string }) {
  const navigate = useNavigate()
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
  const services = useMemo(() => {
    if (!data) return []
    if (Array.isArray(data.data)) return data.data
    if (Array.isArray((data as { data?: ExpertService[] }).data)) {
      return (data as { data: ExpertService[] }).data
    }
    if (Array.isArray(data)) return data as unknown as ExpertService[]
    return []
  }, [data])

  const hasSearchOrFilters = Boolean(searchQuery.trim()) || Object.keys(appliedFilters).length > 0

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

  const [isBulkPauseModalOpen, setIsBulkPauseModalOpen] = useState(false)
  const [bulkPauseReasons, setBulkPauseReasons] = useState<string[]>([])
  const [bulkPauseStartDate, setBulkPauseStartDate] = useState('')
  const [bulkPauseEndDate, setBulkPauseEndDate] = useState('')
  const [bulkPauseIndefinitely, setBulkPauseIndefinitely] = useState(false)
  const [bulkPauseAdminNotes, setBulkPauseAdminNotes] = useState('')

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
    MODERATION_CATEGORY_SLUGS.suspendService,
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
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } }
          toast.error(error?.response?.data?.message || 'Failed to delete services')
        },
      },
    )
  }, [
    selectedServiceIds,
    bulkDeleteReasons,
    bulkDeleteAdminNotes,
    deleteReasonOptions.length,
    bulkDeleteMutation,
  ])

  const handleBulkPause = useCallback(() => {
    if (selectedServiceIds.length === 0) return
    setIsBulkPauseModalOpen(true)
  }, [selectedServiceIds])

  const confirmBulkPause = useCallback(() => {
    if (selectedServiceIds.length === 0) return
    if (pauseReasonOptions.length > 0 && bulkPauseReasons.length === 0) {
      toast.error('Please select at least one reason for pausing.')
      return
    }
    if (!bulkPauseAdminNotes.trim()) {
      toast.error('Admin notes are required for pausing.')
      return
    }

    bulkPauseMutation.mutate(
      {
        serviceIds: selectedServiceIds,
        selectedReasons: bulkPauseReasons,
        adminNotes: bulkPauseAdminNotes.trim(),
        startDate: bulkPauseStartDate,
        endDate: bulkPauseEndDate,
        indefinite: bulkPauseIndefinitely,
      },
      {
        onSuccess: () => {
          toast.success(`Paused ${selectedServiceIds.length} selected service(s)`)
          setSelectedServiceIds([])
          setIsBulkPauseModalOpen(false)
          setBulkPauseReasons([])
          setBulkPauseAdminNotes('')
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } }
          toast.error(error?.response?.data?.message || 'Failed to pause services')
        },
      },
    )
  }, [
    selectedServiceIds,
    bulkPauseReasons,
    bulkPauseAdminNotes,
    pauseReasonOptions.length,
    bulkPauseStartDate,
    bulkPauseEndDate,
    bulkPauseIndefinitely,
    bulkPauseMutation,
  ])

  const handleBulkHide = useCallback(() => {
    if (selectedServiceIds.length === 0) return
    bulkHideMutation.mutate(selectedServiceIds, {
      onSuccess: () => {
        toast.success(`Hidden / Unpublished ${selectedServiceIds.length} selected service(s)`)
        setSelectedServiceIds([])
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } }
        toast.error(error?.response?.data?.message || 'Failed to hide services')
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
        toast.error(error?.response?.data?.message || 'Failed to disable services')
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
      exportDataToFile(headers, rows, 'excel', 'expert_selected_services_export')
      toast.success(`Exported ${selectedServices.length} selected service(s)`)
    } catch {
      toast.error('Failed to export selected services.')
    }
  }, [expertId, selectedServices])

  const handleBulkNotify = useCallback(() => {
    if (!expertId) {
      toast.error('Expert partner ID is missing.')
      return
    }
    const params = new URLSearchParams({
      channel: 'push',
      audience: 'service-management',
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
      audience: 'service-management',
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
          | PromiseRejectedResult
          | undefined
        toast.error(getApiErrorMessage(firstError?.reason) || 'Failed to escalate services.')
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
      toast.error(getApiErrorMessage(err) || 'Failed to escalate services.')
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
        <div className="flex h-[50px] min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-[#FFFFFF33] bg-[#141414] px-3">
          <Search className="text-muted size-4 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by service title"
            className="text-body-sm placeholder:text-muted w-full bg-transparent text-white outline-none"
          />
        </div>

        <button
          type="button"
          onClick={onAdvancedFilter}
          className="table-advance-filter-btn inline-flex shrink-0 items-center gap-2"
        >
          <Filter className="size-3.5" aria-hidden="true" />
          Advance Filters
        </button>
      </div>

      <label className="text-body-sm text-muted mt-1 flex w-fit cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={allVisibleSelected}
          onChange={toggleSelectAll}
          className="size-4 rounded border-white/30 bg-transparent"
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
              <Upload className="size-3.5" aria-hidden="true" />
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
              <FileText className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex h-40 items-center justify-center">
          <div className="border-brand-accent size-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      )}
      {(isError || (!isLoading && services.length === 0)) && (
        <div className={cn(PROFILE_CARD, 'p-8 text-center text-[13px] text-white/50')}>
          {hasSearchOrFilters
            ? 'No matching services found.'
            : 'No services found for this expert.'}
        </div>
      )}
      {!isLoading && !isError && services.length > 0 && (
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
        description={`Are you sure you want to delete ${selectedServiceIds.length} selected service(s)? This action cannot be undone.`}
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
        adminNotes={bulkDeleteAdminNotes}
        onAdminNotesChange={setBulkDeleteAdminNotes}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onSubmit={confirmBulkDelete}
        isSubmitting={bulkDeleteMutation.isPending}
      />

      <DecisionActionModal
        open={isBulkPauseModalOpen}
        variant="suspend"
        title={
          selectedServiceIds.length > 1
            ? `Pause ${selectedServiceIds.length} Services`
            : 'Pause Service'
        }
        description={`Are you sure you want to pause ${selectedServiceIds.length} selected service(s)? They will be hidden from clients until reactivated.`}
        submitLabel={
          selectedServiceIds.length > 1
            ? `Pause ${selectedServiceIds.length} Services`
            : 'Pause Service'
        }
        reasonOptions={pauseReasonOptions}
        selectedReasons={bulkPauseReasons}
        onReasonToggle={(value) =>
          setBulkPauseReasons((current) =>
            current.includes(value)
              ? current.filter((item) => item !== value)
              : [...current, value],
          )
        }
        showTimeline
        startDate={bulkPauseStartDate}
        onStartDateChange={setBulkPauseStartDate}
        endDate={bulkPauseEndDate}
        onEndDateChange={setBulkPauseEndDate}
        indefinite={bulkPauseIndefinitely}
        onIndefiniteChange={setBulkPauseIndefinitely}
        adminNotes={bulkPauseAdminNotes}
        onAdminNotesChange={setBulkPauseAdminNotes}
        onClose={() => setIsBulkPauseModalOpen(false)}
        onSubmit={confirmBulkPause}
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
  const statusLabel = (() => {
    if (isDeleted) return 'Deleted'
    if (isSuspended) return 'Suspended'
    if (!status) return null
    if (status === 'live') return 'Instant'
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
  })()
  const statusClass = isDeleted
    ? 'bg-brand-danger'
    : isSuspended
      ? 'bg-amber-500'
      : status === 'live'
        ? 'bg-[#22C55E]'
        : status === 'rejected'
          ? 'bg-brand-danger'
          : status === 'closed'
            ? 'bg-amber-500'
            : 'bg-[#22C55E]'

  return (
    <div
      onClick={() => viewExpertService(service, expertId, navigate)}
      className={cn(
        'flex w-full cursor-pointer items-center gap-3 rounded-xl bg-[#141414] px-4 py-4 text-left transition-colors hover:bg-[#1a1a1a]',
        selected && 'border border-blue-500 bg-blue-950/20',
      )}
    >
      <input
        type="checkbox"
        checked={selected}
        onClick={(event) => event.stopPropagation()}
        onChange={onToggleSelect}
        className="size-5 shrink-0 rounded border-white/30 bg-transparent"
      />

      <div className="relative ml-1 h-28 w-32 shrink-0 overflow-hidden rounded-xl bg-black">
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
          <span
            className={cn(
              'absolute top-2 left-2 rounded-md px-1.5 py-0.5 text-[10px] leading-none font-bold text-white',
              statusClass,
            )}
          >
            {statusLabel}
          </span>
        )}
      </div>

      <div className="ml-1 min-w-0 flex-1">
        <p className="text-body-md font-bold text-white">{service.title || 'Untitled Service'}</p>
        <p className="text-body-sm text-muted mt-0.5">{service.category?.name || '—'}</p>
        <p className="text-body-sm text-muted mt-0.5">{formatPricingType(service.pricingType)}</p>
      </div>
    </div>
  )
}

function ConsultationsSubTab({ expertId }: { expertId: string }) {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useExpertConsultations(expertId, 1, 10, true)
  const consultations = data?.data ?? []

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [requestChangesTarget, setRequestChangesTarget] = useState<ExpertConsultation | null>(null)
  const [pauseTarget, setPauseTarget] = useState<ExpertConsultation | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ExpertConsultation | null>(null)

  const [requestReasons, setRequestReasons] = useState<string[]>([])
  const [requestReasonText, setRequestReasonText] = useState('')
  const [requestAdminNotes, setRequestAdminNotes] = useState('')

  const [pauseReasons, setPauseReasons] = useState<string[]>([])
  const [pauseStartDate, setPauseStartDate] = useState('')
  const [pauseEndDate, setPauseEndDate] = useState('')
  const [pauseIndefinitely, setPauseIndefinitely] = useState(false)
  const [pauseAdminNotes, setPauseAdminNotes] = useState('')

  const [deleteReasons, setDeleteReasons] = useState<string[]>([])
  const [deleteAdminNotes, setDeleteAdminNotes] = useState('')
  const [deleteConfirmed, setDeleteConfirmed] = useState(false)

  const updateConsultationStatus = useUpdateConsultationStatus()
  const suspendServiceMutation = useSuspendService()
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
    setPauseStartDate('')
    setPauseEndDate('')
    setPauseIndefinitely(false)
    setPauseAdminNotes('')
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
      toast.error(err?.response?.data?.message || 'Failed to request changes.')
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
    if (!pauseIndefinitely && (!pauseStartDate || !pauseEndDate)) {
      toast.error('Please provide a suspension timeline or choose to suspend indefinitely.')
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

    const toIso = (value: string) => new Date(`${value}T00:00:00.000Z`).toISOString()

    try {
      await suspendServiceMutation.mutateAsync({
        id: pauseTarget._id,
        payload: {
          selectedReasons: reasonPayload.selectedReasons,
          suspendIndefinitely: pauseIndefinitely,
          startDate: pauseIndefinitely ? undefined : toIso(pauseStartDate),
          endDate: pauseIndefinitely ? undefined : toIso(pauseEndDate),
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
      toast.error(err?.response?.data?.message || 'Failed to pause consultation.')
    }
  }, [
    buildPauseReasonPayload,
    closePauseModal,
    pauseAdminNotes,
    pauseEndDate,
    pauseIndefinitely,
    pauseReasons,
    pauseStartDate,
    pauseTarget,
    recordReasonUsage,
    suspendServiceMutation,
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
      toast.error(err?.response?.data?.message || 'Failed to delete consultation.')
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
      {isError && (
        <div className="bg-brand-danger/10 rounded-lg border border-red-500/40 px-4 py-3 text-sm text-red-400">
          Consultation not found
        </div>
      )}
      {!isLoading && !isError && consultations.length === 0 && (
        <div className="rounded-xl bg-[#141414] p-8 text-center text-[13px] text-white/50">
          Consultation not found
        </div>
      )}
      {!isLoading &&
        !isError &&
        consultations.map((consultation) => (
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
        reasonLabel="Request Changes"
        adminNotes={requestAdminNotes}
        onAdminNotesChange={setRequestAdminNotes}
        onClose={closeRequestChangesModal}
        onSubmit={handleRequestChangesSubmit}
        isSubmitting={updateConsultationStatus.isPending}
      />

      <DecisionActionModal
        open={Boolean(pauseTarget)}
        variant="suspend"
        title="Pause Consultation"
        description="Are you sure you want to pause this consultation? It will be hidden from clients until reactivated."
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
        startDate={pauseStartDate}
        onStartDateChange={setPauseStartDate}
        endDate={pauseEndDate}
        onEndDateChange={setPauseEndDate}
        indefinite={pauseIndefinitely}
        onIndefiniteChange={setPauseIndefinitely}
        adminNotes={pauseAdminNotes}
        onAdminNotesChange={setPauseAdminNotes}
        onClose={closePauseModal}
        onSubmit={handlePauseSubmit}
        isSubmitting={suspendServiceMutation.isPending}
      />

      <DecisionActionModal
        open={Boolean(deleteTarget)}
        variant="delete"
        title="Delete Consultation"
        description="Are you sure you want to delete this consultation? This will result in removal of the listing."
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
        confirmationChecked={deleteConfirmed}
        onConfirmationChange={setDeleteConfirmed}
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
}: {
  expertId: string
  listingSubTab: ListingSubTab
  onSubTabChange: (tab: ListingSubTab) => void
}) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
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
          className={PROFILE_BTN_PRIMARY}
        >
          <Users className="size-3.5" />
          View Clientele
        </button>
      </div>

      {listingSubTab === 'services' && <ServicesSubTab expertId={expertId} />}

      {listingSubTab === 'consultations' && <ConsultationsSubTab expertId={expertId} />}
    </div>
  )
}

function AvailabilityTab() {
  return (
    <div className="rounded-xl bg-[#141414] p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-body-md mb-4 font-semibold text-white">Availability</h3>
          <div className="overflow-hidden rounded-lg">
            <div className="text-body-sm text-muted grid grid-cols-3 bg-black px-4 py-2 font-semibold">
              <span>Days</span>
              <span>From</span>
              <span>To</span>
            </div>
            {DAYS.map((day) => (
              <div key={day} className="text-body-sm grid grid-cols-3 items-center px-4 py-3">
                <span className="text-white">{day}</span>
                <span className="text-muted inline-flex w-fit items-center gap-1 rounded-full bg-black px-3 py-1">
                  <Clock className="size-3" />
                  10:00 AM
                </span>
                <span className="text-muted inline-flex w-fit items-center gap-1 rounded-full bg-black px-3 py-1">
                  <Clock className="size-3" />
                  6:00 PM
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-body-md mb-4 font-semibold text-white">Unavailability</h3>
          <div className="overflow-hidden rounded-lg">
            <div className="text-body-sm text-muted grid grid-cols-3 bg-black px-4 py-2 font-semibold">
              <span>Date</span>
              <span>From</span>
              <span>To</span>
            </div>
            <div className="text-body-sm grid grid-cols-3 items-center px-4 py-3">
              <span className="text-white">01/01/2025</span>
              <span className="text-muted inline-flex w-fit items-center gap-1 rounded-full bg-black px-3 py-1">
                <Clock className="size-3" />
                10:00 AM
              </span>
              <span className="text-muted inline-flex w-fit items-center gap-1 rounded-full bg-black px-3 py-1">
                <Clock className="size-3" />
                10:00 AM
              </span>
            </div>
          </div>
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
        activeMetricIds.filter((id) => EXPERT_PROFILE_ANALYTICS_METRIC_ID_SET.has(id)),
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
          className="ui-manage-metrics ui-cta ui-cta-primary text-body-sm flex items-center gap-1.5 rounded-lg px-3 py-2 font-semibold"
        >
          <SlidersHorizontal className="icon-sm shrink-0" />
          Manage Metrics
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.id} className="rounded-lg bg-[#050505] p-4">
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

function HealthTab() {
  const [filter, setFilter] = useState('all')

  const incidents = [
    {
      type: 'Violation',
      typeClass: 'bg-brand-danger/15 text-red-400',
      status: 'Open',
      statusClass: 'border-red-500/40 text-red-400',
      action: 'View Details',
      icon: Eye,
    },
    {
      type: 'Reported Against',
      typeClass: 'bg-amber-500/15 text-amber-300',
      status: 'under review',
      statusClass: 'border-amber-500/40 text-amber-300',
      action: 'View Ticket',
      icon: FileText,
    },
    {
      type: 'Reported By',
      typeClass: 'bg-blue-500/15 text-blue-400',
      status: 'Resolved',
      statusClass: 'border-emerald-500/40 text-brand-positive',
      action: 'View Ticket',
      icon: FileText,
    },
  ]

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
                'text-body-sm rounded-md px-3 py-1.5 font-semibold transition-colors',
                filter === chip.key ? PROFILE_ACTIVE_PILL : PROFILE_IDLE_PILL,
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <span className="text-body-sm font-bold text-red-400">Profile Health: At Risk</span>
      </div>

      <div className="mt-4 space-y-3">
        {incidents.map((incident) => (
          <div key={incident.type} className="rounded-lg bg-[#050505] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'rounded-md px-2 py-0.5 text-[10px] font-bold',
                      incident.typeClass,
                    )}
                  >
                    {incident.type}
                  </span>
                  <span
                    className={cn(
                      'rounded-md border px-2 py-0.5 text-[10px] font-bold capitalize',
                      incident.statusClass,
                    )}
                  >
                    {incident.status}
                  </span>
                </div>
                <p className="mt-2 text-[13px] font-semibold text-white">Spam Content Detected</p>
                <p className="text-body-sm text-muted mt-1">
                  Multiple identical messages sent to different users within short timeframe
                </p>
                <p className="text-muted mt-2 text-[10px]">
                  Raised On: 2024-02-10 14:32 · Last Updated: 2 hours ago
                </p>
              </div>
              <button
                type="button"
                onClick={() => comingSoon(incident.action)}
                className="text-body-sm flex items-center gap-1.5 rounded-lg bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] px-3 py-2 font-semibold text-[#050505]"
              >
                <incident.icon className="size-3.5" />
                {incident.action}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ExpertProfileViewPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
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
  const { tagModalOpen, openTagModal, closeTagModal, saveTags, initialTags } = useEntityTags()

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

  const { data: analyticsRes } = useExpertAnalytics(id)

  const profile = profileResponse?.data

  const navigateToCreateListing = useCallback(() => {
    if (!id) return
    navigate(`/services/management/create?partnerId=${encodeURIComponent(id)}`)
  }, [id, navigate])

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
        toast.error(err?.response?.data?.message || 'Failed to update password')
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
          toast.error(err?.response?.data?.message || 'Failed to suspend expert. Please try again.')
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
          toast.error(err?.response?.data?.message || 'Failed to delete expert. Please try again.')
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
          {getApiErrorMessage(profileErrorDetail)}
        </div>
      </div>
    )
  }

  const basic = profile.basicProfile
  const displayName = basic?.fullname || profile.fullname || 'Expert'
  const coverImage = basic?.coverImage
  const avatarImage = basic?.profileImage
  const subtitle = [basic?.industry, basic?.location].filter(Boolean).join(' • ')

  const headerActions = [
    {
      label: 'Create Listings',
      icon: Plus,
      onClick: navigateToCreateListing,
    },
    {
      label: 'Add Notes',
      icon: FileText,
      onClick: () => comingSoon('Add Notes'),
    },
    { label: 'Add Tags', icon: Tag, onClick: () => openTagModal(id || displayName) },
    {
      label: 'Export Data',
      icon: Upload,
      onClick: () => comingSoon('Export Data'),
    },
    {
      label: 'Share Profile',
      icon: Share2,
      onClick: () => comingSoon('Share Profile'),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/experts/management')}
            className="group font-heading text-h3 flex w-fit items-center gap-2 font-bold tracking-tight text-white transition-colors hover:text-[#E0A263]"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>Expert Profile View</span>
          </button>
          <div className="text-body-sm text-muted flex items-center gap-1.5 pl-7 font-medium">
            <button
              type="button"
              onClick={() => navigateBackOrFallback(navigate, '/experts/management')}
              className="hover:text-brand-text transition-colors"
            >
              Expert management
            </button>
            <span className="text-muted">/</span>
            <span>Manage Expert</span>
            <span className="text-muted">/</span>
            <span className="font-bold text-white">{displayName}</span>
          </div>
        </div>
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
                  toast.error(getApiErrorMessage(err) || 'Failed to logout expert')
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
                  toast.error(getApiErrorMessage(err) || 'Failed to block expert')
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
      </header>

      <div className="relative overflow-hidden rounded-xl bg-[#141414]">
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
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
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
                <h2 className="text-lg font-bold text-white">{displayName}</h2>
                <span className="rounded-full bg-[rgb(0_166_62_/_30%)] px-2.5 py-0.5 text-[10px] font-bold text-[#00A63E]">
                  # 1 Ranking
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
                <action.icon className="size-3 shrink-0" strokeWidth={2.25} />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
        <ProfileSidebar profile={profile} partnerId={id} analytics={analyticsRes?.data} />

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

          {activeTab === 'overview' && <OverviewTab profile={profile} partnerId={id} />}
          {activeTab === 'service-listings' && (
            <ServiceListingsTab
              expertId={id}
              listingSubTab={listingSubTab}
              onSubTabChange={setListingSubTab}
            />
          )}
          {activeTab === 'availability' && <AvailabilityTab />}
          {activeTab === 'analytics' && <AnalyticsTab expertId={id} />}
          {activeTab === 'health' && <HealthTab />}
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
        initialTags={initialTags}
        onSubmit={saveTags}
      />
    </div>
  )
}
