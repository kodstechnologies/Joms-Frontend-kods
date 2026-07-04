import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import {
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  History,
  Image as ImageIcon,
  Info,
  Languages,
  Loader2,
  Phone,
  RotateCcw,
  ShieldCheck,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  useConsultation,
  useService,
  useSuspendService,
  useUpdateConsultationStatus,
  useUpdateServiceStatus,
} from '../../hooks/use-services'
import { useExpertProfile } from '../../hooks/use-expert-profile'
import {
  formatExpertDateTime,
  formatListingExpertId,
} from '../experts/expert-list-shared'
import { Button } from '@/shared/components/ui/button'
import {
  DecisionActionModal,
} from '@/shared/components/modal/decision-action-modal'
import { cn } from '@/shared/lib/cn'
import type {
  ConsultationDetail,
  ConsultationPricingOption,
  CustomPricing,
  ServiceDetail,
  ServiceRejectionReason,
} from '../../type/service'
import { SERVICE_REJECTION_REASON_BY_VALUE } from '../../type/service'

type ServiceViewDetail = Partial<ServiceDetail> &
  Partial<ConsultationDetail> & {
    _id: string
    partnerId: string
    title: string
    status: string
    createdAt: string
    updatedAt: string
    serviceType?: string
    pricing?: number
    consultationTitle?: string
    consultationCategory?: string
    sessionOutline?: string
    whoIsItFor?: string
    whoItsFor?: string
    mode?: string
    modeOfConsultation?: string
    languages?: string[]
    hasFollowUp?: boolean
    followUpDays?: number | null
    hasPreSessionRequirement?: boolean
    hasPostSessionMessage?: boolean
    postSessionMessage?: string | null
    pricingOptions?: ConsultationPricingOption[]
  }

const EMPTY_VALUE = 'Not provided'

const formatMoney = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) return EMPTY_VALUE

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const formatConsultationPrice = (option: ConsultationPricingOption) => {
  if (option.pricingType === 'free' || !option.price) return 'Free'
  return formatMoney(option.price)
}

const parseDescription = (description = '') => {
  const [summary, ...features] = description.split('+').map((part) => part.trim()).filter(Boolean)

  return { summary, features }
}

const formatCustomTimeline = (custom?: CustomPricing) => {
  if (!custom) return EMPTY_VALUE

  const durationLabel = custom.durationType === 'long_term' ? 'Long term' : 'Short term'
  return `${durationLabel} (${custom.timelineFrom}-${custom.timelineTo} ${custom.timelineUnit})`
}

const decisionReasonOptions = [
  { label: 'Unclear Image', value: 'unclear-image' },
  { label: 'Content Issue', value: 'content-issue' },
  { label: 'Invalid documents', value: 'invalid-documents' },
  { label: 'Invalid PAN', value: 'invalid-pan' },
  { label: 'Invalid GST', value: 'invalid-gst' },
]

const suspendReasonOptions = [
  { label: 'Policy Violation', value: 'policy-violation' },
  { label: 'Quality Issues', value: 'quality-issues' },
  { label: 'Customer Complaints', value: 'customer-complaints' },
  { label: 'Other', value: 'other' },
]

type ServiceDecisionAction = 'approve' | 'reject' | 'suspend'

const toIso = (date: string) => new Date(date).toISOString()

const formatAppliedAgo = (value?: string) => {
  if (!value) return 'Applied recently'

  const createdAt = new Date(value)
  if (Number.isNaN(createdAt.getTime())) return 'Applied recently'

  const diffDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return 'Applied today'
  if (diffDays === 1) return 'Applied 1 day ago'
  return `Applied ${diffDays} days ago`
}

const getReviewStatusBadge = (status?: string) => {
  const normalized = (status || '').toLowerCase()

  if (normalized === 'in_review' || normalized === 'pending' || normalized === 'submitted') {
    return { label: 'Review Pending', className: 'bg-[#FBC078]/15 text-[#FBC078]' }
  }

  if (normalized === 'live') {
    return { label: 'Live', className: 'bg-emerald-500/15 text-emerald-400' }
  }

  if (normalized === 'rejected') {
    return { label: 'Rejected', className: 'bg-red-500/15 text-red-400' }
  }

  if (normalized === 'suspended') {
    return { label: 'Suspended', className: 'bg-red-500/15 text-red-300' }
  }

  return { label: status || 'Draft', className: 'bg-white/10 text-[#bbb]' }
}

const isPendingReview = (status: string | undefined, isConsultationListing: boolean) => {
  const normalized = (status || '').toLowerCase()

  if (isConsultationListing) {
    return normalized === 'submitted'
  }

  return normalized === 'in_review' || normalized === 'pending'
}

const parseOutlineItems = (value?: string) =>
  (value || '')
    .split(/\n|(?<=[.!?])\s+/)
    .map((item) => item.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)

const splitSessionContent = (outline?: string) => {
  const parts = (outline || '')
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean)

  return {
    outline: parts[0] || outline || '',
    benefits: parts[1] || '',
  }
}

const formatConsultationMode = (mode?: string) => {
  if (!mode) return EMPTY_VALUE
  return mode.charAt(0).toUpperCase() + mode.slice(1)
}

export const ServiceViewPage = () => {
  const { id, expertId, serviceId } = useParams<{
    id?: string
    expertId?: string
    serviceId?: string
  }>()
  const resolvedServiceId = serviceId || id || ''
  const fromExpert = Boolean(expertId)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const serviceTypeParam = searchParams.get('type') || ''
  const partnerIdParam = searchParams.get('partnerId') || ''
  const shouldFetchConsultation = serviceTypeParam.toLowerCase().includes('consultation')

  const {
    data: serviceResponse,
    isLoading: isServiceLoading,
    error: serviceError,
  } = useService(resolvedServiceId, !shouldFetchConsultation)
  const {
    data: consultationResponse,
    isLoading: isConsultationLoading,
    error: consultationError,
  } = useConsultation(resolvedServiceId, shouldFetchConsultation)
  const { mutateAsync: updateServiceStatus, isPending: isUpdatingServiceStatus } =
    useUpdateServiceStatus()
  const { mutateAsync: updateConsultationStatus, isPending: isUpdatingConsultationStatus } =
    useUpdateConsultationStatus()
  const suspendServiceMutation = useSuspendService()

  const isUpdatingStatus = isUpdatingServiceStatus || isUpdatingConsultationStatus

  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [activeTierIndex, setActiveTierIndex] = useState(1)
  const [activeDecisionAction, setActiveDecisionAction] = useState<ServiceDecisionAction | null>(
    null,
  )
  const [decisionAdminNotes, setDecisionAdminNotes] = useState('')
  const [decisionReason, setDecisionReason] = useState('')
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [suspendIndefinitely, setSuspendIndefinitely] = useState(false)
  const [suspendStartDate, setSuspendStartDate] = useState('')
  const [suspendEndDate, setSuspendEndDate] = useState('')

  useEffect(() => {
    setActiveImageIndex(0)
  }, [resolvedServiceId])

  const apiResponse = shouldFetchConsultation ? consultationResponse : serviceResponse
  const isLoading = shouldFetchConsultation ? isConsultationLoading : isServiceLoading
  const error = shouldFetchConsultation ? consultationError : serviceError
  const service = apiResponse?.data as ServiceViewDetail | undefined

  const resolvedPartnerId = expertId || partnerIdParam || service?.partnerId || ''
  const { data: expertProfileResponse } = useExpertProfile(resolvedPartnerId || undefined)
  const expertProfile = expertProfileResponse?.data
  const expertName =
    service?.expertName ||
    expertProfile?.basicProfile?.fullname ||
    expertProfile?.fullname ||
    'Expert'
  const expertIdLabel = service?.expertid || formatListingExpertId(resolvedPartnerId)

  const tierDetails = useMemo(() => {
    if (service?.pricingType !== 'tiered' || !service.tieredPricing?.tiers?.length) return null

    const tier = service.tieredPricing.tiers[activeTierIndex] || service.tieredPricing.tiers[0]
    const parsedDescription = parseDescription(tier.description)

    return {
      ...tier,
      description: parsedDescription.summary,
      features: parsedDescription.features,
    }
  }, [activeTierIndex, service])

  const openDecisionModal = (action: ServiceDecisionAction) => {
    setActiveDecisionAction(action)
    setDecisionAdminNotes('')
    setDecisionReason('')
    setSelectedReasons(
      action === 'suspend' ? [] : action === 'approve' ? [] : ['unclear-image', 'content-issue'],
    )
    setSuspendIndefinitely(false)
    setSuspendStartDate('')
    setSuspendEndDate('')
  }

  const closeDecisionModal = () => {
    setActiveDecisionAction(null)
  }

  const toggleDecisionReason = (value: string) => {
    setSelectedReasons((currentReasons) =>
      currentReasons.includes(value)
        ? currentReasons.filter((reasonValue) => reasonValue !== value)
        : [...currentReasons, value],
    )
  }

  const handleBack = () => {
    if (fromExpert && expertId) {
      navigate(`/experts/management/profile/${expertId}`)
      return
    }
    navigate('/services/management')
  }

  const submitDecisionAction = async () => {
    if (!activeDecisionAction || !resolvedServiceId) return

    if (activeDecisionAction === 'suspend') {
      if (selectedReasons.length === 0) {
        toast.error('Please select at least one reason.')
        return
      }
      if (!suspendIndefinitely && (!suspendStartDate || !suspendEndDate)) {
        toast.error('Please provide a suspension timeline or choose to suspend indefinitely.')
        return
      }
      if (!decisionAdminNotes.trim()) {
        toast.error('Admin notes are required.')
        return
      }

      try {
        await suspendServiceMutation.mutateAsync({
          id: resolvedServiceId,
          payload: {
            selectedReasons,
            suspendIndefinitely,
            startDate: suspendIndefinitely ? undefined : toIso(suspendStartDate),
            endDate: suspendIndefinitely ? undefined : toIso(suspendEndDate),
            reasonDetails: decisionReason.trim(),
            adminNotes: decisionAdminNotes.trim(),
          },
        })
        toast.success('Service suspended successfully')
        closeDecisionModal()
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to suspend service.'
          : 'Failed to suspend service.'
        toast.error(message)
      }
      return
    }

    if (activeDecisionAction === 'approve' || activeDecisionAction === 'reject') {
      if (!decisionAdminNotes.trim()) {
        toast.error('Admin notes are required.')
        return
      }

      if (activeDecisionAction === 'reject') {
        if (!decisionReason.trim()) {
          toast.error('Rejection reason is required.')
          return
        }
        if (selectedReasons.length === 0) {
          toast.error('Please select at least one reason.')
          return
        }
      }

      const reasonFor = selectedReasons
        .map((reasonValue) => SERVICE_REJECTION_REASON_BY_VALUE[reasonValue])
        .filter((reason): reason is ServiceRejectionReason => Boolean(reason))

      try {
        if (shouldFetchConsultation) {
          if (activeDecisionAction === 'approve') {
            await updateConsultationStatus({
              id: resolvedServiceId,
              payload: { status: 'live', adminNote: decisionAdminNotes.trim() },
            })
            toast.success('Consultation approved successfully')
          } else {
            await updateConsultationStatus({
              id: resolvedServiceId,
              payload: {
                status: 'rejected',
                reasonFor,
                rejectionReason: decisionReason.trim(),
                adminNote: decisionAdminNotes.trim(),
              },
            })
            toast.success('Consultation rejected')
          }
        } else if (activeDecisionAction === 'approve') {
          await updateServiceStatus({
            id: resolvedServiceId,
            payload: { status: 'live', adminNote: decisionAdminNotes.trim() },
          })
          toast.success('Service approved successfully')
        } else {
          await updateServiceStatus({
            id: resolvedServiceId,
            payload: {
              status: 'rejected',
              reasonFor,
              rejectionReason: decisionReason.trim(),
              adminNote: decisionAdminNotes.trim(),
            },
          })
          toast.success('Service rejected')
        }
        closeDecisionModal()
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message ||
            (shouldFetchConsultation
              ? 'Failed to update consultation status.'
              : 'Failed to update service status.')
          : shouldFetchConsultation
            ? 'Failed to update consultation status.'
            : 'Failed to update service status.'
        toast.error(message)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-amber-400" />
        <p className="text-sm font-medium text-slate-400">
          {shouldFetchConsultation
            ? 'Fetching consultation information...'
            : 'Fetching service information...'}
        </p>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="rounded-full bg-red-500/10 p-3 text-red-500">
          <Info className="size-10" />
        </div>
        <h3 className="text-lg font-semibold text-white">
          {shouldFetchConsultation ? 'Consultation Not Found' : 'Service Not Found'}
        </h3>
        <p className="max-w-md text-sm text-slate-400">
          {apiResponse?.message ||
            'The service details could not be loaded. Please ensure the service ID is correct.'}
        </p>
        <Button
          variant="ghost"
          className="mt-4 gap-2 text-amber-400 hover:bg-transparent hover:text-amber-300"
          onClick={handleBack}
        >
          <ArrowLeft className="size-4" /> Go back
        </Button>
      </div>
    )
  }

  const isConsultation =
    shouldFetchConsultation || (service.serviceType || '').toLowerCase().includes('consultation')
  const images = service.images || []
  const imageCount = images.length
  const activeImage = imageCount > 0 ? images[Math.min(activeImageIndex, imageCount - 1)] : undefined
  const categoryName = isConsultation
    ? service.consultationCategory || ''
    : service.category?.name || service.consultationCategory || ''
  const showApprovalControls = isPendingReview(service.status, isConsultation)
  const statusBadge = getReviewStatusBadge(service.status)
  const submittedAt = service.submittedAt || service.createdAt
  const profilePartnerId = resolvedPartnerId || service.partnerId
  const pageTitle = isConsultation ? 'Consultation View' : 'Service View'
  const detailsSectionTitle = isConsultation ? 'Consultation Details' : 'Service Details'
  const consultationTitle = service.title || service.consultationTitle || 'Untitled Consultation'
  const consultationTopics = service.topics || []
  const sessionContent = splitSessionContent(service.sessionOutline)
  const outlineItems = parseOutlineItems(sessionContent.outline)
  const benefitItems = parseOutlineItems(sessionContent.benefits)
  const consultationLanguages = service.languages?.length
    ? service.languages.join(', ')
    : EMPTY_VALUE
  const followUpLabel =
    service.hasFollowUp && service.followUpDays
      ? `${service.followUpDays} Days`
      : EMPTY_VALUE
  const consultationDurations =
    service.pricingOptions?.map((option) => ({
      key: `${option.durationMinutes}-${option.price ?? 'free'}`,
      label: `${option.durationMinutes}mins (${formatConsultationPrice(option)})`,
    })) || []

  const handlePrevImage = () => {
    if (imageCount > 0) {
      setActiveImageIndex((prev) => (prev === 0 ? imageCount - 1 : prev - 1))
    }
  }

  const handleNextImage = () => {
    if (imageCount > 0) {
      setActiveImageIndex((prev) => (prev === imageCount - 1 ? 0 : prev + 1))
    }
  }

  const decisionModalConfig = activeDecisionAction
    ? {
        approve: {
          title: 'Confirm Application',
          description:
            'Are you sure you want to approve this application? The applicant will be notified via email.',
          submitLabel: 'Confirm Approval',
          variant: 'approve' as const,
        },
        reject: {
          title: isConsultation ? 'Reject Consultation' : 'Reject Service',
          description:
            'Are you sure you want to reject this application? The applicant will be notified via email.',
          submitLabel: isConsultation ? 'Reject Consultation' : 'Reject Service',
          variant: 'reject' as const,
          reasonOptions: decisionReasonOptions,
        },
        suspend: {
          title: 'Suspend Service',
          description:
            'Are you sure you want to suspend this service? This will restrict visibility and notify the partner.',
          submitLabel: 'Suspend Service',
          variant: 'suspend' as const,
          reasonOptions: suspendReasonOptions,
        },
      }[activeDecisionAction]
    : null

  const DetailChip = ({ value, label }: { value: string; label: string }) => (
    <div className="flex flex-col items-center gap-1.5">
      <div className="rounded-md bg-[#151515] px-4 py-2.5 text-[11px] font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
        {value}
      </div>
      <span className="text-[10px] text-[#5C5C5C]">{label}</span>
    </div>
  )

  const renderFixedPricing = () => (
    <div className="mt-6 flex flex-wrap gap-8">
      <DetailChip
        value={formatMoney(service.fixedPricing?.price || service.pricing)}
        label="Pricing"
      />
      <DetailChip
        value={
          service.fixedPricing?.discountPercent !== undefined
            ? `${service.fixedPricing.discountPercent}% Off`
            : EMPTY_VALUE
        }
        label="Discounts"
      />
      <DetailChip
        value={
          service.fixedPricing
            ? `${service.fixedPricing.timelineValue} ${service.fixedPricing.timelineUnit}`
            : EMPTY_VALUE
        }
        label="Timelines"
      />
    </div>
  )

  const renderCustomPricing = () => (
    <div className="mt-6 flex flex-wrap gap-8">
      <DetailChip
        value={formatMoney(service.customPricing?.minPrice || service.pricing)}
        label="Starting From"
      />
      <DetailChip
        value={formatCustomTimeline(service.customPricing)}
        label="Timelines"
      />
    </div>
  )

  const renderTieredPricing = () => (
    <div className="mt-6 space-y-4">
      <div className="flex w-full max-w-[360px] rounded-full bg-[#171717] p-0.5">
        {service.tieredPricing?.tiers.map((tier, index) => (
          <button
            key={tier.name}
            type="button"
            onClick={() => setActiveTierIndex(index)}
            className={cn(
              'flex-1 rounded-full py-2 text-[10px] font-medium transition-colors',
              activeTierIndex === index ? 'bg-white text-black' : 'text-white',
            )}
          >
            {tier.name}
          </button>
        ))}
      </div>

      {tierDetails?.description && (
        <p className="max-w-[560px] text-[12px] leading-relaxed text-white">
          {tierDetails.description}
        </p>
      )}

      {Boolean(tierDetails?.features.length) && (
        <ul className="list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-white">
          {tierDetails?.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-8">
        <DetailChip value={formatMoney(tierDetails?.price)} label="Pricing" />
        <DetailChip
          value={
            tierDetails
              ? `${String(tierDetails.timelineValue).padStart(2, '0')} ${tierDetails.timelineUnit}`
              : EMPTY_VALUE
          }
          label="Timelines"
        />
      </div>
    </div>
  )

  const renderConsultationDetails = () => (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="space-y-5">
        <div>
          <h1 className="text-[22px] font-semibold leading-tight text-white underline decoration-[#FBC078] decoration-2 underline-offset-4">
            {consultationTitle}
          </h1>
          {categoryName && <p className="mt-2 text-[12px] text-[#777]">{categoryName}</p>}
        </div>

        {consultationTopics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {consultationTopics.map((topic) => (
              <span
                key={topic._id}
                className="rounded-full border border-white/20 px-3 py-1 text-[10px] font-medium text-[#ccc]"
              >
                {topic.name}
              </span>
            ))}
          </div>
        )}

        {outlineItems.length > 0 && (
          <div>
            <h3 className="text-[12px] font-semibold text-white">Session outline</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 text-[11px] leading-relaxed text-[#999]">
              {outlineItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {benefitItems.length > 0 && (
          <div>
            <h3 className="text-[12px] font-semibold text-white">Benefits</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 text-[11px] leading-relaxed text-[#999]">
              {benefitItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {(service.whoItsFor || service.whoIsItFor) && (
          <div>
            <h3 className="text-[12px] font-semibold text-white">Who is it for?</h3>
            <p className="mt-2 text-[11px] leading-relaxed text-[#999]">
              {service.whoItsFor || service.whoIsItFor}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-2 rounded-lg border border-white/5 bg-black p-4 text-center">
            <Phone className="size-4 text-[#FBC078]" aria-hidden="true" />
            <span className="text-[10px] text-[#777]">Mode</span>
            <span className="text-[11px] font-semibold text-white">
              {formatConsultationMode(service.mode || service.modeOfConsultation)}
            </span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-lg border border-white/5 bg-black p-4 text-center">
            <Languages className="size-4 text-[#FBC078]" aria-hidden="true" />
            <span className="text-[10px] text-[#777]">Language</span>
            <span className="text-[11px] font-semibold text-white">{consultationLanguages}</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-lg border border-white/5 bg-black p-4 text-center">
            <Clock className="size-4 text-[#FBC078]" aria-hidden="true" />
            <span className="text-[10px] text-[#777]">FollowUps</span>
            <span className="text-[11px] font-semibold text-white">{followUpLabel}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold text-white">Post-session requirement</p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#999]">
              {service.hasPostSessionMessage && service.postSessionMessage?.trim()
                ? service.postSessionMessage
                : 'Keep your requirements and questions ready.'}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-white">Pre-session requirement</p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#999]">
              {service.hasPreSessionRequirement && service.preSessionRequirement?.trim()
                ? service.preSessionRequirement
                : 'Keep your requirements and questions ready.'}
            </p>
          </div>
        </div>

        {consultationDurations.length > 0 && (
          <div>
            <h3 className="mb-3 text-[12px] font-semibold text-white">Duration &amp; Pricing</h3>
            <div className="flex flex-wrap gap-3">
              {consultationDurations.map((duration) => (
                <span
                  key={duration.key}
                  className="rounded-md bg-[#151515] px-4 py-2.5 text-[10px] font-semibold text-white"
                >
                  {duration.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderServiceDetails = () => (
    <>
      <div className="mb-4 flex justify-end">
        <span
          className={cn(
            'rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide',
            statusBadge.className,
          )}
        >
          {statusBadge.label}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <div className="relative h-[220px] w-full overflow-hidden rounded-lg bg-[#101010]">
            {activeImage ? (
              <img src={activeImage} alt={service.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-[#5C5C5C]">
                <ImageIcon className="size-8" aria-hidden="true" />
                <span className="text-[10px]">No images uploaded</span>
              </div>
            )}

            {imageCount > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={handlePrevImage}
                  className="absolute top-1/2 left-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={handleNextImage}
                  className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white"
                >
                  <ChevronRight className="size-4" />
                </button>
              </>
            )}

            <div className="absolute right-2 bottom-2 flex items-center gap-1 rounded bg-black/85 px-2 py-1 text-[10px] font-semibold text-white">
              <ImageIcon className="size-3" />
              {imageCount > 0 ? `${activeImageIndex + 1}/${imageCount}` : '0/0'}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="mb-1 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-semibold leading-tight text-white">{service.title}</h1>
              {categoryName && <p className="mt-1 text-[12px] text-[#777]">{categoryName}</p>}
            </div>
          </div>

          {service.description && (
            <p className="mt-4 max-w-[640px] text-[12px] leading-relaxed text-white">
              {service.description}
            </p>
          )}

          {Boolean(service.subCategory?.length) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {service.subCategory?.map((item) => (
                <span
                  key={item._id}
                  className="rounded border border-white/30 px-2.5 py-1 text-[10px] font-medium text-white"
                >
                  {item.name}
                </span>
              ))}
            </div>
          )}

          {service.pricingType === 'fixed' && renderFixedPricing()}
          {service.pricingType === 'custom' && renderCustomPricing()}
          {service.pricingType === 'tiered' && renderTieredPricing()}
        </div>
      </div>
    </>
  )

  return (
    <div className="relative flex w-full flex-col gap-5 pb-8 text-white">
      {decisionModalConfig && (
        <DecisionActionModal
          open={Boolean(activeDecisionAction)}
          variant={decisionModalConfig.variant}
          title={decisionModalConfig.title}
          description={decisionModalConfig.description}
          submitLabel={decisionModalConfig.submitLabel}
          adminNotes={decisionAdminNotes}
          onAdminNotesChange={setDecisionAdminNotes}
          reason={decisionReason}
          onReasonChange={
            activeDecisionAction === 'reject' || activeDecisionAction === 'suspend'
              ? setDecisionReason
              : undefined
          }
          reasonOptions={decisionModalConfig.reasonOptions}
          selectedReasons={selectedReasons}
          onReasonToggle={toggleDecisionReason}
          showTimeline={activeDecisionAction === 'suspend'}
          startDate={suspendStartDate}
          onStartDateChange={setSuspendStartDate}
          endDate={suspendEndDate}
          onEndDateChange={setSuspendEndDate}
          indefinite={suspendIndefinitely}
          onIndefiniteChange={setSuspendIndefinitely}
          onClose={closeDecisionModal}
          onSubmit={submitDecisionAction}
          isSubmitting={isUpdatingStatus || suspendServiceMutation.isPending}
        />
      )}

      <header className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="group flex w-fit items-center gap-2 font-heading text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>{pageTitle}</span>
        </button>

        <div className="flex items-center gap-1.5 pl-7 text-[12px] font-medium text-[#777777]">
          {fromExpert ? (
            <>
              <button
                type="button"
                onClick={() => navigate('/experts/management')}
                className="transition-colors hover:text-white"
              >
                All Experts
              </button>
              <span className="text-[#333333]">/</span>
              <button
                type="button"
                onClick={() => expertId && navigate(`/experts/management/profile/${expertId}`)}
                className="transition-colors hover:text-white"
              >
                {expertName}
              </button>
              <span className="text-[#333333]">/</span>
              <span className="font-bold text-white">{pageTitle}</span>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate('/services/management')}
                className="transition-colors hover:text-white"
              >
                Service management
              </button>
              <span className="text-[#333333]">/</span>
              <span>{pageTitle}</span>
              <span className="text-[#333333]">/</span>
              <span className="font-bold text-white">{expertName}</span>
            </>
          )}
        </div>
      </header>

      <div className="rounded-xl border border-white/5 bg-[#111111] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{expertName}</h2>
            <p className="mt-1 text-[12px] text-[#777]">{formatAppliedAgo(submittedAt)}</p>
          </div>
          {profilePartnerId && (
            <button
              type="button"
              onClick={() => navigate(`/experts/management/profile/${profilePartnerId}`)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-white/5"
            >
              <Eye className="size-3.5" aria-hidden="true" />
              View Profile
            </button>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-white/5 bg-black p-4">
            <p className="text-[11px] text-[#777]">Expert ID</p>
            <p className="mt-1 font-mono text-[13px] font-semibold text-white">#{expertIdLabel}</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-black p-4">
            <p className="text-[11px] text-[#777]">Submitted</p>
            <p className="mt-1 text-[13px] font-semibold text-white">
              {formatExpertDateTime(submittedAt)}
            </p>
          </div>
          <div className="rounded-lg border border-white/5 bg-black p-4">
            <p className="text-[11px] text-[#777]">Last Updated</p>
            <p className="mt-1 text-[13px] font-semibold text-white">
              {formatExpertDateTime(service.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-[14px] font-semibold text-white">{detailsSectionTitle}</h2>

      <div className="rounded-xl border border-white/5 bg-[#111111] p-5">
        {isConsultation ? renderConsultationDetails() : renderServiceDetails()}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-white/5 bg-[#111111] p-5">
          <div className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-white">
            <History className="size-4 text-[#FBC078]" aria-hidden="true" />
            <h3>Internal Notes *</h3>
          </div>
          <div className="min-h-[120px] rounded-lg border border-white/5 bg-black p-4 text-[12px] text-[#777]">
            {service.adminNote?.trim() || 'No notes yet.'}
          </div>
        </div>

        {showApprovalControls && (
          <div className="rounded-xl border border-white/5 bg-[#111111] p-5">
            <div className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-white">
              <ShieldCheck className="size-4 text-[#FBC078]" aria-hidden="true" />
              <h3>Decision Controls</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => openDecisionModal('approve')}
                className="flex items-center gap-2 rounded-md bg-[#00B761] px-4 py-2.5 text-[11px] font-bold text-white"
              >
                Approve
                <Check className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => toast.message('Ask for Re-Submit is coming soon')}
                className="flex items-center gap-2 rounded-md bg-[#FBC078] px-4 py-2.5 text-[11px] font-bold text-black"
              >
                Ask for Re-Submit
                <RotateCcw className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => toast.message('Escalate is coming soon')}
                className="flex items-center gap-2 rounded-md bg-[#1D4ED8] px-4 py-2.5 text-[11px] font-bold text-white"
              >
                Escalate
                <ArrowUp className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => openDecisionModal('reject')}
                className="flex items-center gap-2 rounded-md bg-[#F02D2D] px-4 py-2.5 text-[11px] font-bold text-white"
              >
                Reject Application
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
