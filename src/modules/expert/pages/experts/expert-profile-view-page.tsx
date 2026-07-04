import { useCallback, useState, type ReactNode } from 'react'
import { useNavigate, useParams, type NavigateFunction } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Ban,
  Briefcase,
  Check,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Gauge,
  GitMerge,
  ImageOff,
  KeyRound,
  Languages,
  LogOut,
  MoreVertical,
  Pencil,
  Phone,
  Plus,
  Search,
  Share2,
  SlidersHorizontal,
  Star,
  Tag,
  Trash2,
  Upload,
  User,
  Users,
} from 'lucide-react'

import { fetchConsultationById, fetchServiceById } from '../../api/service-api'
import { getServiceManagementViewPath } from '../../lib/service-navigation'
import { openExpertKycFromProfile } from '../../utils/expert-application-navigation'
import { ADMIN_DELETE_REASON_OPTIONS } from '../../constants/soft-delete'
import { useDeactivateExpert, useSuspendExpert } from '../../hooks/use-expert'
import {
  useExpertConsultations,
  useExpertProfile,
  useExpertServices,
} from '../../hooks/use-expert-profile'
import type {
  ExpertConsultation,
  ExpertProfileDetail,
  ExpertService,
  ExpertWorkExperience,
} from '../../type/expert-profile'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { formatListingExpertId } from './expert-list-shared'
import { cn } from '@/shared/lib/cn'

type TabKey =
  | 'overview'
  | 'service-listings'
  | 'availability'
  | 'analytics'
  | 'health'

type ListingSubTab = 'services' | 'consultations'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'service-listings', label: 'Service Listings' },
  { key: 'availability', label: 'Availability' },
  { key: 'analytics', label: 'Service Analytics' },
  { key: 'health', label: 'Profile Health' },
]

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const MOCK_REVIEWS = [
  {
    name: 'Sarah Chen',
    title: 'Product Head at TechFlow',
    rating: 5,
    date: '12 Feb, 2026',
    service: 'Strategy Session',
    body: 'Excellent consultation — clear, actionable advice on our legal roadmap.',
  },
  {
    name: 'James Miller',
    title: 'Founder at StartUp Co',
    rating: 5,
    date: '08 Feb, 2026',
    service: 'NDA Review',
    body: 'Very thorough review with quick turnaround. Highly recommend.',
  },
]

const getApiErrorMessage = (error: unknown) => {
  const err = error as { response?: { data?: { message?: string } } }
  return err?.response?.data?.message || 'Unable to load expert profile.'
}

const comingSoon = (label: string) => toast.message(`${label} is coming soon`)

const SUSPEND_REASON_OPTIONS: DecisionActionModalOption[] = [
  { label: 'Policy violation', value: 'policy_violation' },
  { label: 'Temporary operational issue', value: 'temporary_operational_issue' },
  { label: 'Quality concern', value: 'quality_concern' },
  { label: 'System verification in progress', value: 'system_verification_in_progress' },
  { label: 'Admin review required', value: 'admin_review_required' },
]

const toIso = (date: string) => new Date(date).toISOString()

const viewExpertKyc = (
  partnerId: string,
  serviceType: string | null | undefined,
  navigate: NavigateFunction,
) => openExpertKycFromProfile(partnerId, serviceType, navigate)

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
      getServiceManagementViewPath({
        _id: service._id,
        serviceType: 'Service',
        partnerId: expertId,
      }),
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
    navigate(
      getServiceManagementViewPath({
        _id: consultation._id,
        serviceType: 'Consultation',
        partnerId: expertId,
      }),
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

const formatWorkPeriod = (entry: ExpertWorkExperience) => {
  const start = formatWorkDate(entry.startDate)
  const end = entry.currentlyWorking
    ? 'Present'
    : formatWorkDate(entry.endDate) || '—'
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

const getKycBadge = (isVerified?: boolean) => {
  if (isVerified) {
    return { label: 'KYC Verified', className: 'bg-emerald-500/15 text-emerald-400' }
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

const formatPricing = (option: {
  durationMinutes: number
  pricingType: string
  price: number
}) => {
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
      <span className="max-w-[58%] text-right text-[13px] font-semibold text-white">
        {children}
      </span>
    </div>
  )
}

function ProfileSidebar({
  profile,
  partnerId,
}: {
  profile: ExpertProfileDetail
  partnerId: string
}) {
  const navigate = useNavigate()
  const basic = profile.basicProfile
  const kycBadge = getKycBadge(profile.finalReview?.isVerified)

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-white/5 bg-[#111111] p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-white">
            Profile &amp; Account
          </h3>
          <span
            className={cn(
              'rounded-md px-2.5 py-1 text-[10px] font-bold',
              kycBadge.className,
            )}
          >
            {kycBadge.label}
          </span>
        </div>

        <SidebarRow label="Expert ID">{formatExpertId(partnerId)}</SidebarRow>
        <SidebarRow label="Expert Type">
          {formatServiceType(profile.servicetype || basic?.serviceType)}
        </SidebarRow>
        <SidebarRow label="Expert Custom URL">
          <a
            href="#"
            onClick={(event) => event.preventDefault()}
            className="text-[#FBC078] underline"
          >
            https://joms/expert_profile
          </a>
        </SidebarRow>
        <SidebarRow label="Ratings">
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5 fill-[#FBC078] text-[#FBC078]" />
            4.8
            <span className="text-[11px] font-normal text-[#777]">(1.9K)</span>
          </span>
        </SidebarRow>
        <SidebarRow label="NPS">98</SidebarRow>
        <SidebarRow label="Experience">
          {formatExperience(basic?.experienceYears, basic?.experienceMonths)}
        </SidebarRow>
        <SidebarRow label="Total Earnings">500,000</SidebarRow>
        <SidebarRow label="Total Order Completed">50</SidebarRow>
        <SidebarRow label="Last Active">
          {formatLastActive(profile.updatedAt)}
        </SidebarRow>
        <SidebarRow label="KYC">
          <button
            type="button"
            onClick={() =>
              viewExpertKyc(
                partnerId,
                profile.servicetype || basic?.serviceType,
                navigate,
              )
            }
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
            {profile.finalReview?.internalNotes || 'None'}
          </p>
        </div>
      </div>
    </div>
  )
}

function OverviewTab({ profile }: { profile: ExpertProfileDetail }) {
  const basic = profile.basicProfile
  const offerings = basic?.offerings ?? []
  const galleryImages = profile.gallery?.images ?? []
  const workExperience = profile.workExperience ?? []
  const [reviewFilter, setReviewFilter] = useState('all')

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-white/5 bg-[#111111] p-6">
        <h3 className="mb-3 text-[14px] font-semibold text-white">About</h3>
        <p className="text-[13px] leading-relaxed text-[#bbb]">
          {basic?.bio || 'No bio provided.'}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {profile.phoneVerified && (
            <span className="rounded-md bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
              Phone Verified
            </span>
          )}
          {profile.emailVerified && (
            <span className="rounded-md bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
              Email Verified
            </span>
          )}
        </div>
      </div>

      {offerings.length > 0 && (
        <div className="rounded-xl border border-white/5 bg-[#111111] p-6">
          <h3 className="mb-4 text-[14px] font-semibold text-white">
            Core Offerings
          </h3>
          <ul className="space-y-2.5">
            {offerings.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-[13px] text-[#ddd]"
              >
                <Check className="size-4 shrink-0 text-[#FBC078]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {galleryImages.length > 0 && (
        <div className="rounded-xl border border-white/5 bg-[#111111] p-6">
          <h3 className="mb-4 text-[14px] font-semibold text-white">Gallery</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {galleryImages.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="aspect-square overflow-hidden rounded-lg bg-black"
              >
                <SafeImage
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="size-full object-cover"
                  fallback={
                    <div className="flex size-full items-center justify-center text-[#555]">
                      <ImageOff className="size-5" />
                    </div>
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {workExperience.length > 0 && (
        <div className="rounded-xl border border-white/5 bg-[#111111] p-6">
          <h3 className="mb-4 text-[14px] font-semibold text-white">
            Work Experience
          </h3>
          <div className="space-y-3">
            {workExperience.map((entry) => (
              <div
                key={entry._id || `${entry.jobTitle}-${entry.companyName}`}
                className="flex gap-3 rounded-lg border border-white/5 bg-black p-4"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#1a1a1a]">
                  <Briefcase className="size-4 text-[#FBC078]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">
                    {entry.jobTitle || '—'}
                  </p>
                  <p className="text-[12px] text-[#999]">
                    {entry.companyName || '—'} | {formatWorkPeriod(entry)}
                  </p>
                  {entry.description && (
                    <p className="mt-1 text-[12px] text-[#777]">
                      {entry.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/5 bg-[#111111] p-6">
        <h3 className="mb-4 text-[14px] font-semibold text-white">
          Reviews &amp; Ratings
        </h3>
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
                'rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors',
                reviewFilter === filter.key
                  ? 'bg-[#FBC078]/15 text-[#FBC078]'
                  : 'bg-black text-[#888] hover:text-white',
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {MOCK_REVIEWS.map((review) => (
            <div
              key={review.name}
              className="rounded-lg border border-white/5 bg-black p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-[#1a1a1a]">
                    <User className="size-4 text-[#888]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white">
                      {review.name}
                    </p>
                    <p className="text-[11px] text-[#777]">{review.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <Star
                        key={index}
                        className="size-3 fill-[#FBC078] text-[#FBC078]"
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-[10px] text-[#666]">{review.date}</p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-[#777]">
                Service Availed: {review.service}
              </p>
              <p className="mt-2 text-[12px] text-[#bbb]">{review.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ConsultationDetailCard({
  consultation,
  expertId,
}: {
  consultation: ExpertConsultation
  expertId: string
}) {
  const navigate = useNavigate()
  const outlineItems = (consultation.sessionOutline || '')
    .split(/[.\n]/)
    .map((item) => item.trim())
    .filter(Boolean)

  return (
    <div className="rounded-xl border border-white/5 bg-[#111111] p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-bold text-white">
            {consultation.title || 'Untitled Consultation'}
          </h3>
          <p className="mt-1 text-[12px] text-[#888]">Business</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(consultation.topics ?? []).map((topic) => (
              <span
                key={topic._id}
                className="rounded-full bg-black px-3 py-1 text-[11px] text-[#ccc]"
              >
                {topic.name}
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => comingSoon('Consultation actions')}
          className="text-[#777] hover:text-white"
        >
          <MoreVertical className="size-5" />
        </button>
      </div>

      {outlineItems.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-[12px] font-semibold text-white">
            Session outline
          </p>
          <ul className="list-disc space-y-1 pl-5 text-[12px] text-[#bbb]">
            {outlineItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {consultation.whoItsFor && (
        <div className="mt-5">
          <p className="mb-2 text-[12px] font-semibold text-white">
            Who is it for?
          </p>
          <p className="text-[12px] text-[#bbb]">{consultation.whoItsFor}</p>
        </div>
      )}

      <div className="mt-5">
        <p className="mb-3 text-[12px] font-semibold text-white">
          Additional Information
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/5 bg-black p-3 text-center">
            <Phone className="mx-auto size-4 text-[#FBC078]" />
            <p className="mt-2 text-[11px] text-[#999]">Mode</p>
            <p className="text-[12px] font-semibold capitalize text-white">
              {consultation.mode || '—'}
            </p>
          </div>
          <div className="rounded-lg border border-white/5 bg-black p-3 text-center">
            <Languages className="mx-auto size-4 text-[#FBC078]" />
            <p className="mt-2 text-[11px] text-[#999]">Language</p>
            <p className="text-[12px] font-semibold text-white">
              {(consultation.languages ?? []).join(', ') || '—'}
            </p>
          </div>
          <div className="rounded-lg border border-white/5 bg-black p-3 text-center">
            <Clock className="mx-auto size-4 text-[#FBC078]" />
            <p className="mt-2 text-[11px] text-[#999]">FollowUps</p>
            <p className="text-[12px] font-semibold text-white">
              {consultation.hasFollowUp && consultation.followUpDays
                ? `${consultation.followUpDays} Days`
                : '—'}
            </p>
          </div>
        </div>
      </div>

      {(consultation.pricingOptions ?? []).length > 0 && (
        <div className="mt-5">
          <p className="mb-3 text-[12px] font-semibold text-white">
            Duration &amp; Pricing
          </p>
          <div className="flex flex-wrap gap-2">
            {(consultation.pricingOptions ?? []).map((option) => (
              <span
                key={`${option.durationMinutes}-${option.price}`}
                className="rounded-lg border border-white/5 bg-black px-3 py-2 text-[11px] font-semibold text-white"
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
        className="mt-5 flex w-full items-center justify-between rounded-lg border border-white/5 bg-black px-4 py-3 text-[12px] font-semibold text-white transition-colors hover:bg-white/5"
      >
        Consultation Performance
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}

function ServicesSubTab({ expertId }: { expertId: string }) {
  const { data, isLoading, isError } = useExpertServices(expertId, 1, 10, true)
  const services = data?.data ?? []

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-white/5 bg-[#111111] px-3 py-2">
          <Search className="size-4 text-[#666]" />
          <input
            type="text"
            placeholder="Search by service title"
            className="w-full bg-transparent text-[12px] text-white outline-none placeholder:text-[#666]"
          />
        </div>
        <button
          type="button"
          onClick={() => comingSoon('Advance Filters')}
          className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-[#111111] px-3 py-2 text-[11px] font-semibold text-white"
        >
          <SlidersHorizontal className="size-3.5" />
          Advance Filters
        </button>
      </div>

      {isLoading && (
        <div className="flex h-40 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-[#FBC078] border-t-transparent" />
        </div>
      )}
      {isError && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Service not found
        </div>
      )}
      {!isLoading && !isError && services.length === 0 && (
        <div className="rounded-xl border border-white/5 bg-[#111111] p-8 text-center text-[13px] text-[#777]">
          Service not found
        </div>
      )}
      {!isLoading && !isError && services.length > 0 && (
        <div className="space-y-3">
          {services.map((service) => (
            <ServiceListCard key={service._id} service={service} expertId={expertId} />
          ))}
        </div>
      )}
    </>
  )
}

function ServiceListCard({
  service,
  expertId,
}: {
  service: ExpertService
  expertId: string
}) {
  const navigate = useNavigate()
  const status = (service.status || '').toLowerCase()
  const statusLabel =
    status === 'live'
      ? 'Live'
      : status
        ? status.charAt(0).toUpperCase() + status.slice(1)
        : null
  const statusClass =
    status === 'live'
      ? 'bg-emerald-500'
      : status === 'rejected'
        ? 'bg-red-500'
        : 'bg-amber-500'

  return (
    <button
      type="button"
      onClick={() => viewExpertService(service, expertId, navigate)}
      className="flex w-full items-center gap-4 rounded-xl border border-white/5 bg-[#111111] p-4 text-left transition-colors hover:bg-[#161616]"
    >
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-[#1a1a1a]">
        {statusLabel && (
          <span
            className={cn(
              'absolute left-1 top-1 rounded px-1.5 py-0.5 text-[9px] font-bold text-white',
              statusClass,
            )}
          >
            {statusLabel}
          </span>
        )}
        <div className="flex size-full items-center justify-center text-[#555]">
          <Briefcase className="size-5" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-bold text-white">
          {service.title || 'Untitled Service'}
        </p>
        <p className="text-[12px] text-[#888]">
          {service.category?.name || '—'}
        </p>
        <p className="text-[11px] text-[#666]">
          {formatPricingType(service.pricingType)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-[14px] font-bold text-white">
          {service.priceStarts != null
            ? `₹${service.priceStarts.toLocaleString('en-IN')}`
            : '—'}
        </p>
      </div>
      <ChevronRight className="size-4 text-[#666]" />
    </button>
  )
}

function ConsultationsSubTab({ expertId }: { expertId: string }) {
  const { data, isLoading, isError } = useExpertConsultations(
    expertId,
    1,
    10,
    true,
  )
  const consultations = data?.data ?? []

  return (
    <>
      {isLoading && (
        <div className="flex h-40 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-[#FBC078] border-t-transparent" />
        </div>
      )}
      {isError && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Consultation not found
        </div>
      )}
      {!isLoading && !isError && consultations.length === 0 && (
        <div className="rounded-xl border border-white/5 bg-[#111111] p-8 text-center text-[13px] text-[#777]">
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
          />
        ))}
    </>
  )
}

function ServiceListingsTab({
  expertId,
  listingSubTab,
  onSubTabChange,
  onCreateListing,
}: {
  expertId: string
  listingSubTab: ListingSubTab
  onSubTabChange: (tab: ListingSubTab) => void
  onCreateListing: () => void
}) {
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
                'rounded-lg px-4 py-2 text-[12px] font-semibold capitalize transition-colors',
                listingSubTab === tab
                  ? 'bg-[#FBC078]/15 text-[#FBC078]'
                  : 'bg-[#111111] text-[#888] hover:text-white',
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => comingSoon('View Clientele')}
            className="rounded-lg border border-white/5 bg-[#111111] px-3 py-2 text-[11px] font-semibold text-white"
          >
            View Clientele
          </button>
          <button
            type="button"
            onClick={onCreateListing}
            className="flex items-center gap-1.5 rounded-lg bg-[#FBC078]/15 px-3 py-2 text-[11px] font-semibold text-[#FBC078]"
          >
            <Plus className="size-3.5" />
            Create Listings
          </button>
        </div>
      </div>

      {listingSubTab === 'services' && <ServicesSubTab expertId={expertId} />}

      {listingSubTab === 'consultations' && (
        <ConsultationsSubTab expertId={expertId} />
      )}
    </div>
  )
}

function AvailabilityTab() {
  return (
    <div className="rounded-xl border border-white/5 bg-[#111111] p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 text-[14px] font-semibold text-white">
            Availability
          </h3>
          <div className="overflow-hidden rounded-lg border border-white/5">
            <div className="grid grid-cols-3 bg-black px-4 py-2 text-[11px] font-semibold text-[#888]">
              <span>Days</span>
              <span>From</span>
              <span>To</span>
            </div>
            {DAYS.map((day) => (
              <div
                key={day}
                className="grid grid-cols-3 items-center border-t border-white/5 px-4 py-3 text-[12px]"
              >
                <span className="text-white">{day}</span>
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-black px-3 py-1 text-[#ccc]">
                  <Clock className="size-3" />
                  10:00 AM
                </span>
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-black px-3 py-1 text-[#ccc]">
                  <Clock className="size-3" />
                  6:00 PM
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-[14px] font-semibold text-white">
            Unavailability
          </h3>
          <div className="overflow-hidden rounded-lg border border-white/5">
            <div className="grid grid-cols-3 bg-black px-4 py-2 text-[11px] font-semibold text-[#888]">
              <span>Date</span>
              <span>From</span>
              <span>To</span>
            </div>
            <div className="grid grid-cols-3 items-center border-t border-white/5 px-4 py-3 text-[12px]">
              <span className="text-white">01/01/2025</span>
              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-black px-3 py-1 text-[#ccc]">
                <Clock className="size-3" />
                10:00 AM
              </span>
              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-black px-3 py-1 text-[#ccc]">
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

function AnalyticsTab() {
  const navigate = useNavigate()
  const cards = [
    { label: 'Events Hosted', value: '24' },
    { label: 'Total Attendees', value: '1,840+' },
    { label: 'Repeat Attendees', value: '30' },
    { label: 'Upcoming Events', value: '3' },
    { label: 'Event Completion Rate', value: '100%' },
    { label: 'Avg. Response Time', value: '2 Hrs' },
    { label: 'No. Of Events Rejected', value: '3' },
    { label: 'No. of event Suspended', value: '100%' },
  ]

  return (
    <div className="rounded-xl border border-white/5 bg-[#111111] p-6">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => navigate('/experts/dashboard/metrics')}
          className="flex items-center gap-1.5 rounded-lg bg-[#FBC078]/15 px-3 py-2 text-[11px] font-semibold text-[#FBC078]"
        >
          <Gauge className="size-3.5" />
          Manage Metrics
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-white/5 bg-black p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-[#999]">{card.label}</p>
              <Briefcase className="size-4 text-[#FBC078]" />
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

function HealthTab() {
  const [filter, setFilter] = useState('all')

  const incidents = [
    {
      type: 'Violation',
      typeClass: 'bg-red-500/15 text-red-400',
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
      statusClass: 'border-emerald-500/40 text-emerald-400',
      action: 'View Ticket',
      icon: FileText,
    },
  ]

  return (
    <div className="rounded-xl border border-white/5 bg-[#111111] p-6">
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
                'rounded-md px-3 py-1.5 text-[11px] font-semibold transition-colors',
                filter === chip.key
                  ? 'bg-[#FBC078]/15 text-[#FBC078]'
                  : 'bg-black text-[#999] hover:text-white',
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <span className="text-[12px] font-bold text-red-400">
          Profile Health: At Risk
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {incidents.map((incident) => (
          <div
            key={incident.type}
            className="rounded-lg border border-white/5 bg-black p-4"
          >
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
                <p className="mt-2 text-[13px] font-semibold text-white">
                  Spam Content Detected
                </p>
                <p className="mt-1 text-[12px] text-[#777]">
                  Multiple identical messages sent to different users within
                  short timeframe
                </p>
                <p className="mt-2 text-[10px] text-[#666]">
                  Raised On: 2024-02-10 14:32 · Last Updated: 2 hours ago
                </p>
              </div>
              <button
                type="button"
                onClick={() => comingSoon(incident.action)}
                className="flex items-center gap-1.5 rounded-lg bg-[#FBC078]/15 px-3 py-2 text-[11px] font-semibold text-[#FBC078]"
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
  const [suspendModalOpen, setSuspendModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [suspendReasons, setSuspendReasons] = useState<string[]>([])
  const [suspendStartDate, setSuspendStartDate] = useState('')
  const [suspendEndDate, setSuspendEndDate] = useState('')
  const [suspendIndefinitely, setSuspendIndefinitely] = useState(false)
  const [suspendReasonDetails, setSuspendReasonDetails] = useState('')
  const [suspendAdminNotes, setSuspendAdminNotes] = useState('')
  const [deleteReasons, setDeleteReasons] = useState<string[]>([])
  const [deleteReason, setDeleteReason] = useState('')
  const [deleteAdminNotes, setDeleteAdminNotes] = useState('')

  const suspendExpertMutation = useSuspendExpert()
  const deactivateExpertMutation = useDeactivateExpert()

  const {
    data: profileResponse,
    isLoading: profileLoading,
    isError: profileError,
    error: profileErrorDetail,
  } = useExpertProfile(id)

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
    setSuspendReasonDetails('')
    setSuspendAdminNotes('')
  }, [])

  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false)
    setDeleteReasons([])
    setDeleteReason('')
    setDeleteAdminNotes('')
  }, [])

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

    suspendExpertMutation.mutate(
      {
        id,
        payload: {
          selectedReasons: suspendReasons,
          suspendIndefinitely,
          startDate: suspendIndefinitely ? undefined : toIso(suspendStartDate),
          endDate: suspendIndefinitely ? undefined : toIso(suspendEndDate),
          reasonDetails: suspendReasonDetails.trim(),
          adminNotes: suspendAdminNotes.trim(),
        },
      },
      {
        onSuccess: () => {
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
    closeSuspendModal,
    id,
    queryClient,
    suspendAdminNotes,
    suspendEndDate,
    suspendIndefinitely,
    suspendExpertMutation,
    suspendReasonDetails,
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

    deactivateExpertMutation.mutate(
      {
        id,
        payload: {
          selectedReasons: deleteReasons,
          reasonDetails: deleteReason.trim(),
          adminNotes: deleteAdminNotes.trim(),
        },
      },
      {
        onSuccess: () => {
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
    closeDeleteModal,
    deactivateExpertMutation,
    deleteAdminNotes,
    deleteReason,
    deleteReasons,
    id,
    navigate,
    queryClient,
  ])

  if (profileLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="size-9 animate-spin rounded-full border-4 border-[#FBC078] border-t-transparent" />
      </div>
    )
  }

  if (profileError || !profile || !id) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/experts/management')}
          className="group flex w-fit items-center gap-2 font-heading text-[20px] font-bold text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5" />
          <span>Expert Profile View</span>
        </button>
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
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
    { label: 'Add Tags', icon: Tag, onClick: () => comingSoon('Add Tags') },
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
            onClick={() => navigate('/experts/management')}
            className="group flex w-fit items-center gap-2 font-heading text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>Expert Profile View</span>
          </button>
          <div className="flex items-center gap-1.5 pl-7 text-[12px] font-medium text-[#777777]">
            <button
              type="button"
              onClick={() => navigate('/experts/management')}
              className="transition-colors hover:text-white"
            >
              User management
            </button>
            <span className="text-[#333333]">/</span>
            <span>Manage Users</span>
            <span className="text-[#333333]">/</span>
            <span className="font-bold text-white">{displayName}</span>
          </div>
        </div>
        <TableActionsDropdown
          label="Open expert profile actions"
          isOpen={profileMenuOpen}
          onOpenChange={setProfileMenuOpen}
          menuWidth={220}
          tone="light"
          menuClassName="rounded-lg py-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          <TableActionsItem
            tone="light"
            icon={<Pencil className="size-3.5" />}
            onClick={() => {
              setProfileMenuOpen(false)
              comingSoon('Edit Profile')
            }}
          >
            Edit Profile
          </TableActionsItem>
          <TableActionsItem
            tone="light"
            icon={<Users className="size-3.5" />}
            onClick={() => {
              setProfileMenuOpen(false)
              comingSoon('View Clientele')
            }}
          >
            View Clientele
          </TableActionsItem>
          <TableActionsItem
            tone="light"
            icon={<GitMerge className="size-3.5" />}
            onClick={() => {
              setProfileMenuOpen(false)
              comingSoon('Merge Records')
            }}
          >
            Merge Records
          </TableActionsItem>
          <TableActionsItem
            tone="light"
            icon={<KeyRound className="size-3.5" />}
            onClick={() => {
              setProfileMenuOpen(false)
              comingSoon('Reset Password')
            }}
          >
            Reset Password
          </TableActionsItem>
          <TableActionsItem
            tone="light"
            icon={<LogOut className="size-3.5" />}
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
            icon={<Ban className="size-3.5" />}
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

      <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#111111]">
        <div className="h-40 w-full bg-[#1a1a1a]">
          <SafeImage
            src={coverImage}
            alt={`${displayName} cover`}
            className="size-full object-cover"
            fallback={
              <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#2b3a8c] via-[#4b2f8c] to-[#1a1a1a]" />
            }
          />
        </div>
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-3">
            <div className="-mt-12 size-20 shrink-0 overflow-hidden rounded-full border-4 border-[#111111] bg-[#1a1a1a]">
              <SafeImage
                src={avatarImage}
                alt={displayName}
                className="size-full object-cover"
                fallback={
                  <div className="flex size-full items-center justify-center text-[#555]">
                    <User className="size-7" />
                  </div>
                }
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-white">{displayName}</h2>
                <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  # 1 Ranking
                </span>
              </div>
              <p className="text-[12px] text-[#999]">{subtitle || '—'}</p>
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
        <ProfileSidebar
          profile={profile}
          partnerId={id}
        />

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

          {activeTab === 'overview' && <OverviewTab profile={profile} />}
          {activeTab === 'service-listings' && (
            <ServiceListingsTab
              expertId={id}
              listingSubTab={listingSubTab}
              onSubTabChange={setListingSubTab}
              onCreateListing={navigateToCreateListing}
            />
          )}
          {activeTab === 'availability' && <AvailabilityTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'health' && <HealthTab />}
        </div>
      </div>

      <DecisionActionModal
        open={suspendModalOpen}
        variant="suspend"
        title="Suspend User"
        description="Are you sure you want to suspend this expert? This action will restrict their account access and hide their services."
        submitLabel="Suspend"
        reasonOptions={SUSPEND_REASON_OPTIONS}
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
        adminNotes={suspendAdminNotes}
        onAdminNotesChange={setSuspendAdminNotes}
        onClose={closeSuspendModal}
        onSubmit={handleSuspendSubmit}
        isSubmitting={suspendExpertMutation.isPending}
      />

      <DecisionActionModal
        open={deleteModalOpen}
        variant="reject"
        title="Delete User"
        description="Are you sure you want to delete this expert? The account will be soft-deleted for 21 days before permanent removal."
        submitLabel="Delete User"
        reasonOptions={ADMIN_DELETE_REASON_OPTIONS}
        selectedReasons={deleteReasons}
        onReasonToggle={toggleDeleteReason}
        reason={deleteReason}
        onReasonChange={setDeleteReason}
        adminNotes={deleteAdminNotes}
        onAdminNotesChange={setDeleteAdminNotes}
        onClose={closeDeleteModal}
        onSubmit={handleDeleteSubmit}
        isSubmitting={deactivateExpertMutation.isPending}
      />
    </div>
  )
}
