import { useCallback, useState, type ReactNode } from 'react'
import { useNavigate, useParams, type NavigateFunction } from 'react-router-dom'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
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
import { formatListingExpertId } from './expert-list-format'
import { cn } from '@/shared/lib/cn'

type TabKey = 'overview' | 'service-listings' | 'availability' | 'analytics' | 'health'

type ListingSubTab = 'services' | 'consultations'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'service-listings', label: 'Service Listings' },
  { key: 'availability', label: 'Availability' },
  { key: 'analytics', label: 'Service Analytics' },
  { key: 'health', label: 'Profile Health' },
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

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
    return { label: 'KYC Verified', className: 'bg-brand-positive/15 text-brand-positive' }
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
    <div className="flex items-center justify-between border-b border-white/5 py-3 last:border-0">
      <span className="text-body-sm text-muted">{label}</span>
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
  const kycBadge = getKycBadge(profile.finalReview)

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-brand-bg rounded-xl border border-white/5 p-5">
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
          <a
            href="#"
            onClick={(event) => event.preventDefault()}
            className="text-brand-accent underline"
          >
            https://joms/expert_profile
          </a>
        </SidebarRow>
        <SidebarRow label="Ratings">
          <span className="inline-flex items-center gap-1">
            <Star className="fill-brand-accent text-brand-accent size-3.5" />
            4.8
            <span className="text-body-sm text-muted font-normal">(1.9K)</span>
          </span>
        </SidebarRow>
        <SidebarRow label="NPS">98</SidebarRow>
        <SidebarRow label="Experience">
          {formatExperience(basic?.experienceYears, basic?.experienceMonths)}
        </SidebarRow>
        <SidebarRow label="Total Earnings">500,000</SidebarRow>
        <SidebarRow label="Total Order Completed">50</SidebarRow>
        <SidebarRow label="Last Active">{formatLastActive(profile.updatedAt)}</SidebarRow>
        <SidebarRow label="KYC">
          <button
            type="button"
            onClick={() =>
              viewExpertKyc(partnerId, profile.servicetype || basic?.serviceType, navigate)
            }
            className="bg-brand-accent/15 text-brand-accent hover:bg-brand-accent/25 text-body-sm rounded-md px-3 py-1 font-bold transition-colors"
          >
            View
          </button>
        </SidebarRow>
        <SidebarRow label="Timelines">
          <button
            type="button"
            onClick={() => comingSoon('Timelines')}
            className="bg-brand-accent/15 text-brand-accent hover:bg-brand-accent/25 text-body-sm rounded-md px-3 py-1 font-bold transition-colors"
          >
            Check Timelines
          </button>
        </SidebarRow>
      </div>

      <div className="bg-brand-bg rounded-xl border border-white/5 p-5">
        <h3 className="mb-4 text-[13px] font-semibold text-white">Support &amp; Admin</h3>
        <div className="rounded-lg border border-white/5 bg-black p-3">
          <p className="text-muted text-[10px]">Active Tickets</p>
          <p className="text-body-sm mt-1 font-medium text-white">None</p>
        </div>
        <div className="mt-3 rounded-lg border border-white/5 bg-black p-3">
          <p className="text-muted text-[10px]">Admin notes</p>
          <p className="text-body-sm mt-1 font-medium text-white">
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
      <div className="bg-brand-bg rounded-xl border border-white/5 p-6">
        <h3 className="text-body-md mb-3 font-semibold text-white">About</h3>
        <p className="text-muted text-[13px] leading-relaxed">{basic?.bio || 'No bio provided.'}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {profile.phoneVerified && (
            <span className="bg-brand-positive/15 text-brand-positive rounded-md px-2.5 py-1 text-[10px] font-bold">
              Phone Verified
            </span>
          )}
          {profile.emailVerified && (
            <span className="bg-brand-positive/15 text-brand-positive rounded-md px-2.5 py-1 text-[10px] font-bold">
              Email Verified
            </span>
          )}
        </div>
      </div>

      {offerings.length > 0 && (
        <div className="bg-brand-bg rounded-xl border border-white/5 p-6">
          <h3 className="text-body-md mb-4 font-semibold text-white">Core Offerings</h3>
          <ul className="space-y-2.5">
            {offerings.map((item) => (
              <li key={item} className="text-muted flex items-center gap-2 text-[13px]">
                <Check className="text-brand-accent size-4 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {galleryImages.length > 0 && (
        <div className="bg-brand-bg rounded-xl border border-white/5 p-6">
          <h3 className="text-body-md mb-4 font-semibold text-white">Gallery</h3>
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
                    <div className="text-muted flex size-full items-center justify-center">
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
        <div className="bg-brand-bg rounded-xl border border-white/5 p-6">
          <h3 className="text-body-md mb-4 font-semibold text-white">Work Experience</h3>
          <div className="space-y-3">
            {workExperience.map((entry) => (
              <div
                key={entry._id || `${entry.jobTitle}-${entry.companyName}`}
                className="flex gap-3 rounded-lg border border-white/5 bg-black p-4"
              >
                <div className="bg-brand-surface flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <Briefcase className="text-brand-accent size-4" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">{entry.jobTitle || '—'}</p>
                  <p className="text-body-sm text-muted">
                    {entry.companyName || '—'} | {formatWorkPeriod(entry)}
                  </p>
                  {entry.description && (
                    <p className="text-body-sm text-muted mt-1">{entry.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-brand-bg rounded-xl border border-white/5 p-6">
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
                'text-body-sm rounded-full px-3 py-1.5 font-semibold transition-colors',
                reviewFilter === filter.key
                  ? 'bg-brand-accent/15 text-brand-accent'
                  : 'text-muted hover:text-brand-text bg-black',
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {MOCK_REVIEWS.map((review) => (
            <div key={review.name} className="rounded-lg border border-white/5 bg-black p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-surface flex size-9 items-center justify-center rounded-full">
                    <User className="text-muted size-4" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white">{review.name}</p>
                    <p className="text-body-sm text-muted">{review.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <Star key={index} className="fill-brand-accent text-brand-accent size-3" />
                    ))}
                  </div>
                  <p className="text-muted mt-1 text-[10px]">{review.date}</p>
                </div>
              </div>
              <p className="text-body-sm text-muted mt-2">Service Availed: {review.service}</p>
              <p className="text-body-sm text-muted mt-2">{review.body}</p>
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
    <div className="bg-brand-bg rounded-xl border border-white/5 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-body-lg font-bold text-white">
            {consultation.title || 'Untitled Consultation'}
          </h3>
          <p className="text-body-sm text-muted mt-1">Business</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(consultation.topics ?? []).map((topic) => (
              <span
                key={topic._id}
                className="text-body-sm text-muted rounded-full bg-black px-3 py-1"
              >
                {topic.name}
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => comingSoon('Consultation actions')}
          className="text-muted hover:text-brand-text"
        >
          <MoreVertical className="size-5" />
        </button>
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
          <div className="rounded-lg border border-white/5 bg-black p-3 text-center">
            <Phone className="text-brand-accent mx-auto size-4" />
            <p className="text-body-sm text-muted mt-2">Mode</p>
            <p className="text-body-sm font-semibold text-white capitalize">
              {consultation.mode || '—'}
            </p>
          </div>
          <div className="rounded-lg border border-white/5 bg-black p-3 text-center">
            <Languages className="text-brand-accent mx-auto size-4" />
            <p className="text-body-sm text-muted mt-2">Language</p>
            <p className="text-body-sm font-semibold text-white">
              {(consultation.languages ?? []).join(', ') || '—'}
            </p>
          </div>
          <div className="rounded-lg border border-white/5 bg-black p-3 text-center">
            <Clock className="text-brand-accent mx-auto size-4" />
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
                className="text-body-sm rounded-lg border border-white/5 bg-black px-3 py-2 font-semibold text-white"
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
        className="text-body-sm mt-5 flex w-full items-center justify-between rounded-lg border border-white/5 bg-black px-4 py-3 font-semibold text-white transition-colors hover:bg-white/5"
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
        <div className="bg-brand-bg flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-white/5 px-3 py-2">
          <Search className="text-muted size-4" />
          <input
            type="text"
            placeholder="Search by service title"
            className="text-body-sm placeholder:text-muted w-full bg-transparent text-white outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => comingSoon('Advance Filters')}
          className="ui-advance-filters ui-cta ui-cta-outline text-body-sm gap-1.5 px-3 font-semibold"
        >
          <SlidersHorizontal className="size-3.5" />
          Advance Filters
        </button>
      </div>

      {isLoading && (
        <div className="flex h-40 items-center justify-center">
          <div className="border-brand-accent size-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      )}
      {isError && (
        <div className="bg-brand-danger/10 rounded-lg border border-red-500/40 px-4 py-3 text-sm text-red-400">
          Service not found
        </div>
      )}
      {!isLoading && !isError && services.length === 0 && (
        <div className="bg-brand-bg text-muted rounded-xl border border-white/5 p-8 text-center text-[13px]">
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

function ServiceListCard({ service, expertId }: { service: ExpertService; expertId: string }) {
  const navigate = useNavigate()
  const status = (service.status || '').toLowerCase()
  const statusLabel =
    status === 'live' ? 'Live' : status ? status.charAt(0).toUpperCase() + status.slice(1) : null
  const statusClass =
    status === 'live'
      ? 'bg-brand-positive'
      : status === 'rejected'
        ? 'bg-brand-danger'
        : 'bg-amber-500'

  return (
    <button
      type="button"
      onClick={() => viewExpertService(service, expertId, navigate)}
      className="bg-brand-bg hover:bg-brand-surface flex w-full items-center gap-4 rounded-xl border border-white/5 p-4 text-left transition-colors"
    >
      <div className="bg-brand-surface relative size-16 shrink-0 overflow-hidden rounded-lg">
        {statusLabel && (
          <span
            className={cn(
              'absolute top-1 left-1 rounded px-1.5 py-0.5 text-[9px] font-bold text-white',
              statusClass,
            )}
          >
            {statusLabel}
          </span>
        )}
        <div className="text-muted flex size-full items-center justify-center">
          <Briefcase className="size-5" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-body-md font-bold text-white">{service.title || 'Untitled Service'}</p>
        <p className="text-body-sm text-muted">{service.category?.name || '—'}</p>
        <p className="text-body-sm text-muted">{formatPricingType(service.pricingType)}</p>
      </div>
      <div className="text-right">
        <p className="text-body-md font-bold text-white">
          {service.priceStarts != null ? `₹${service.priceStarts.toLocaleString('en-IN')}` : '—'}
        </p>
      </div>
      <ChevronRight className="text-muted size-4" />
    </button>
  )
}

function ConsultationsSubTab({ expertId }: { expertId: string }) {
  const { data, isLoading, isError } = useExpertConsultations(expertId, 1, 10, true)
  const consultations = data?.data ?? []

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
        <div className="bg-brand-bg text-muted rounded-xl border border-white/5 p-8 text-center text-[13px]">
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
                'text-body-sm rounded-lg px-4 py-2 font-semibold capitalize transition-colors',
                listingSubTab === tab
                  ? 'bg-brand-accent/15 text-brand-accent'
                  : 'bg-brand-bg text-muted hover:text-brand-text',
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
            className="bg-brand-bg text-body-sm rounded-lg border border-white/5 px-3 py-2 font-semibold text-white"
          >
            View Clientele
          </button>
          <button
            type="button"
            onClick={onCreateListing}
            className="bg-brand-accent/15 text-brand-accent text-body-sm flex items-center gap-1.5 rounded-lg px-3 py-2 font-semibold"
          >
            <Plus className="size-3.5" />
            Create Listings
          </button>
        </div>
      </div>

      {listingSubTab === 'services' && <ServicesSubTab expertId={expertId} />}

      {listingSubTab === 'consultations' && <ConsultationsSubTab expertId={expertId} />}
    </div>
  )
}

function AvailabilityTab() {
  return (
    <div className="bg-brand-bg rounded-xl border border-white/5 p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-body-md mb-4 font-semibold text-white">Availability</h3>
          <div className="overflow-hidden rounded-lg border border-white/5">
            <div className="text-body-sm text-muted grid grid-cols-3 bg-black px-4 py-2 font-semibold">
              <span>Days</span>
              <span>From</span>
              <span>To</span>
            </div>
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-body-sm grid grid-cols-3 items-center border-t border-white/5 px-4 py-3"
              >
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
          <div className="overflow-hidden rounded-lg border border-white/5">
            <div className="text-body-sm text-muted grid grid-cols-3 bg-black px-4 py-2 font-semibold">
              <span>Date</span>
              <span>From</span>
              <span>To</span>
            </div>
            <div className="text-body-sm grid grid-cols-3 items-center border-t border-white/5 px-4 py-3">
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
    <div className="bg-brand-bg rounded-xl border border-white/5 p-6">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => navigate('/experts/dashboard/metrics')}
          className="ui-manage-metrics bg-brand-accent/15 text-brand-accent text-body-sm flex items-center gap-1.5 rounded-lg px-3 py-2 font-semibold"
        >
          <Gauge className="size-3.5" />
          Manage Metrics
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-white/5 bg-black p-4">
            <div className="flex items-center justify-between">
              <p className="text-body-sm text-muted">{card.label}</p>
              <Briefcase className="text-brand-accent size-4" />
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
          className="text-body-sm flex items-center justify-center gap-1.5 rounded-lg border border-white/5 bg-black p-4 font-semibold text-white transition-colors hover:bg-white/5"
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
    <div className="bg-brand-bg rounded-xl border border-white/5 p-6">
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
                filter === chip.key
                  ? 'bg-brand-accent/15 text-brand-accent'
                  : 'text-muted hover:text-brand-text bg-black',
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
          <div key={incident.type} className="rounded-lg border border-white/5 bg-black p-4">
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
                className="bg-brand-accent/15 text-brand-accent text-body-sm flex items-center gap-1.5 rounded-lg px-3 py-2 font-semibold"
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
          className="group font-heading hover:text-brand-accent text-h3 flex w-fit items-center gap-2 font-bold text-white transition-colors"
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
            onClick={() => navigateBackOrFallback(navigate, '/experts/management')}
            className="group font-heading hover:text-brand-accent text-h3 flex w-fit items-center gap-2 font-bold tracking-tight text-white transition-colors"
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
              User management
            </button>
            <span className="text-muted">/</span>
            <span>Manage Users</span>
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
          menuClassName="py-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
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

      <div className="bg-brand-bg relative overflow-hidden rounded-xl border border-white/5">
        <div className="bg-brand-surface h-40 w-full">
          <SafeImage
            src={coverImage}
            alt={`${displayName} cover`}
            className="size-full object-cover"
            fallback={
              <div className="to-brand-surface flex size-full items-center justify-center bg-gradient-to-br from-[#2b3a8c] via-[#4b2f8c]" />
            }
          />
        </div>
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-3">
            <div className="border-brand-bg bg-brand-surface -mt-12 size-20 shrink-0 overflow-hidden rounded-full border-4">
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
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-white">{displayName}</h2>
                <span className="bg-brand-positive/15 text-brand-positive rounded-md px-2 py-0.5 text-[10px] font-bold">
                  # 1 Ranking
                </span>
              </div>
              <p className="text-body-sm text-muted">{subtitle || '—'}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {headerActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className="bg-brand-accent/15 text-brand-accent hover:bg-brand-accent/25 text-body-sm flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold transition-colors"
              >
                <action.icon className="size-3.5" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
        <ProfileSidebar profile={profile} partnerId={id} />

        <div className="flex flex-col gap-5">
          <div className="bg-brand-bg flex items-center gap-1 overflow-x-auto rounded-xl border border-white/5 p-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-1 rounded-lg px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap transition-colors',
                  activeTab === tab.key
                    ? 'bg-brand-accent/10 text-brand-accent'
                    : 'text-muted hover:text-brand-text',
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
          {activeTab === 'analytics' && <AnalyticsTab expertId={id} />}
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
