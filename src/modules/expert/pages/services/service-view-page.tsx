import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Gavel,
  History,
  Image as ImageIcon,
  Languages,
  Loader2,
  Phone,
  RotateCcw,
  X,
  Info,
} from 'lucide-react'

import {
  useConsultation,
  useService,
  useUpdateConsultationStatus,
  useUpdateServiceStatus,
} from '../../hooks/use-services'
import { Button } from '@/shared/components/ui/button'
import {
  DecisionActionModal,
  type DecisionActionModalVariant,
} from '@/shared/components/modal/decision-action-modal'
import { cn } from '@/shared/lib/cn'
import type {
  ConsultationDetail,
  ConsultationPricingOption,
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
  benefits?: string
  whoIsItFor?: string
  modeOfConsultation?: string
  language?: string
  followUpWindow?: string
  postSessionRequirement?: string
  preSessionRequirement?: string
  durations?: { label: string; price?: number | string }[]
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

const formatStatus = (status?: string) => {
  if (!status) return EMPTY_VALUE
  if (status === 'in_review') return 'Review Pending'
  return status.replaceAll('_', ' ')
}

const formatDate = (isoString?: string) => {
  if (!isoString) return EMPTY_VALUE

  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE

  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  return `${formattedDate} ${formattedTime}`
}

const getRelativeTime = (isoString?: string) => {
  if (!isoString) return ''

  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ''

  const diffDays = Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)))

  if (diffDays === 0) return 'Applied today'
  if (diffDays === 1) return 'Applied 1 day ago'
  return `Applied ${diffDays} days ago`
}

const parseDescription = (description = '') => {
  const [summary, ...features] = description.split('+').map((part) => part.trim()).filter(Boolean)

  return {
    summary,
    features,
  }
}

const decisionReasonOptions = [
  { label: 'Unclear Image', value: 'unclear-image' },
  { label: 'Content Issue', value: 'content-issue' },
  { label: 'Invalid documents', value: 'invalid-documents' },
  { label: 'Invalid PAN', value: 'invalid-pan' },
  { label: 'Invalid GST', value: 'invalid-gst' },
]

const escalationOptions = [
  { label: '[Super Admin]', value: 'super-admin' },
  { label: '[Moderator 1]', value: 'moderator-1' },
]

type ServiceDecisionAction = DecisionActionModalVariant

export const ServiceViewPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const serviceTypeParam = searchParams.get('type') || ''
  const shouldFetchConsultation = serviceTypeParam.toLowerCase().includes('consultation')

  const {
    data: serviceResponse,
    isLoading: isServiceLoading,
    error: serviceError,
  } = useService(id || '', !shouldFetchConsultation)
  const {
    data: consultationResponse,
    isLoading: isConsultationLoading,
    error: consultationError,
  } = useConsultation(id || '', shouldFetchConsultation)
  const { mutateAsync: updateServiceStatus, isPending: isUpdatingServiceStatus } =
    useUpdateServiceStatus()
  const { mutateAsync: updateConsultationStatus, isPending: isUpdatingConsultationStatus } =
    useUpdateConsultationStatus()
  const isUpdatingStatus = isUpdatingServiceStatus || isUpdatingConsultationStatus
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [activeTierIndex, setActiveTierIndex] = useState(1)
  const [internalNotes, setInternalNotes] = useState('')
  const [activeDecisionAction, setActiveDecisionAction] = useState<ServiceDecisionAction | null>(null)
  const [decisionAdminNotes, setDecisionAdminNotes] = useState('')
  const [decisionReason, setDecisionReason] = useState('')
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [selectedEscalationOption, setSelectedEscalationOption] = useState(escalationOptions[0].value)
  const [actionToast, setActionToast] = useState<{
    message: string
    type: 'success' | 'info' | 'error' | null
  }>({ message: '', type: null })

  useEffect(() => {
    setActiveImageIndex(0)
  }, [id])

  const apiResponse = shouldFetchConsultation ? consultationResponse : serviceResponse
  const isLoading = shouldFetchConsultation ? isConsultationLoading : isServiceLoading
  const error = shouldFetchConsultation ? consultationError : serviceError
  const service = apiResponse?.data as ServiceViewDetail | undefined
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

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setActionToast({ message, type })
    setTimeout(() => {
      setActionToast({ message: '', type: null })
    }, 4000)
  }

  const openDecisionModal = (action: ServiceDecisionAction) => {
    setActiveDecisionAction(action)
    setDecisionAdminNotes('')
    setDecisionReason('')
    setSelectedReasons(action === 'approve' || action === 'escalate' ? [] : ['unclear-image', 'content-issue'])
    setSelectedEscalationOption(escalationOptions[0].value)
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

  const submitDecisionAction = async () => {
    if (!activeDecisionAction || !id) return

    if (activeDecisionAction === 'approve' || activeDecisionAction === 'reject') {
      if (shouldFetchConsultation) {
        if (activeDecisionAction === 'reject' && !decisionReason.trim()) {
          showToast('Rejection reason is required.', 'error')
          return
        }

        try {
          if (activeDecisionAction === 'approve') {
            await updateConsultationStatus({
              id,
              payload: { status: 'live' },
            })
            showToast('Consultation approved successfully!', 'success')
          } else {
            await updateConsultationStatus({
              id,
              payload: {
                status: 'rejected',
                reason: decisionReason.trim(),
              },
            })
            showToast('Consultation application rejected.', 'error')
          }

          closeDecisionModal()
        } catch (error) {
          const message = axios.isAxiosError(error)
            ? error.response?.data?.message || 'Failed to update consultation status.'
            : 'Failed to update consultation status.'
          showToast(message, 'error')
        }

        return
      }

      if (!decisionAdminNotes.trim()) {
        showToast('Admin notes are required.', 'error')
        return
      }

      if (activeDecisionAction === 'reject') {
        if (!decisionReason.trim()) {
          showToast('Rejection reason is required.', 'error')
          return
        }

        if (selectedReasons.length === 0) {
          showToast('Please select at least one reason.', 'error')
          return
        }
      }

      const adminNote = decisionAdminNotes.trim()

      try {
        if (activeDecisionAction === 'approve') {
          await updateServiceStatus({
            id,
            payload: {
              status: 'live',
              adminNote,
            },
          })
          showToast('Service listing approved successfully!', 'success')
        } else {
          const reasonFor = selectedReasons
            .map((reasonValue) => SERVICE_REJECTION_REASON_BY_VALUE[reasonValue])
            .filter((reason): reason is ServiceRejectionReason => Boolean(reason))

          await updateServiceStatus({
            id,
            payload: {
              status: 'rejected',
              reasonFor,
              rejectionReason: decisionReason.trim(),
              adminNote,
            },
          })
          showToast('Service application rejected.', 'error')
        }

        closeDecisionModal()
      } catch (error) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to update service status.'
          : 'Failed to update service status.'
        showToast(message, 'error')
      }

      return
    }

    const toastByAction: Record<ServiceDecisionAction, { message: string; type: 'success' | 'info' | 'error' }> = {
      approve: { message: 'Service listing approved successfully!', type: 'success' },
      reject: { message: 'Service application rejected.', type: 'error' },
      requestChanges: { message: 'Change request submitted.', type: 'info' },
      escalate: { message: 'Listing escalated for review.', type: 'info' },
    }

    showToast(toastByAction[activeDecisionAction].message, toastByAction[activeDecisionAction].type)
    closeDecisionModal()
  }

  if (isLoading) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-amber-400" />
        <p className="text-sm font-medium text-slate-400">Fetching service information...</p>
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
          onClick={() => navigate('/services/management')}
        >
          <ArrowLeft className="size-4" /> Back to management
        </Button>
      </div>
    )
  }

  const handlePrevImage = () => {
    const images = service.images || []

    if (images.length > 0) {
      setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }
  }

  const handleNextImage = () => {
    const images = service.images || []

    if (images.length > 0) {
      setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }
  }

  const isConsultation =
    shouldFetchConsultation || (service.serviceType || '').toLowerCase().includes('consultation')
  const images = service.images || []
  const imageCount = images.length
  const activeImage = imageCount > 0 ? images[Math.min(activeImageIndex, imageCount - 1)] : undefined

  const expertName = service.partnerName || service.expertName || EMPTY_VALUE
  const expertId = service.expertid || EMPTY_VALUE
  const categoryName = service.category?.name || service.consultationCategory || service.topics?.[0]?.name || ''
  const submittedAt = formatDate(service.submittedAt || service.createdAt)
  const updatedAt = formatDate(service.updatedAt)
  const statusLabel = formatStatus(service.status)

  const fixedStats = [
    {
      value: formatMoney(service.fixedPricing?.price || service.pricing),
      label: 'Pricing',
    },
    {
      value:
        service.fixedPricing?.discountPercent !== undefined
          ? `${service.fixedPricing.discountPercent}% Off`
          : EMPTY_VALUE,
      label: 'Discounts',
    },
    {
      value: service.fixedPricing
        ? `${service.fixedPricing.timelineValue} ${service.fixedPricing.timelineUnit}`
        : EMPTY_VALUE,
      label: 'Timelines',
    },
  ]

  const customStats = [
    {
      value: formatMoney(service.customPricing?.minPrice || service.pricing),
      label: 'Starting From',
    },
    {
      value: service.customPricing
        ? `${service.customPricing.timelineFrom}-${service.customPricing.timelineTo} ${service.customPricing.timelineUnit}`
        : EMPTY_VALUE,
      label: 'Timelines',
    },
  ]

  const consultationDurations =
    service.pricingOptions?.map((option) => ({
      label: `${option.durationMinutes}mins (${formatConsultationPrice(option)})`,
    })) ||
    service.durations ||
    []
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
          title: 'Reject Service',
          description:
            'Are you sure you want to Reject Approval to this application? The applicant will be notified via email.',
          submitLabel: 'Reject Service',
          variant: 'reject' as const,
          reasonOptions: decisionReasonOptions,
        },
        requestChanges: {
          title: 'Request Changes – Service Approval',
          description:
            'Are you sure you want to Request Changes to this application? The applicant will be notified via email.',
          submitLabel: 'Request Changes',
          variant: 'requestChanges' as const,
          reasonOptions: decisionReasonOptions,
        },
        escalate: {
          title: 'Escalate Application',
          description:
            'Are you sure you want to escalate this Application? This Post will be reviewed by the selected parties.',
          submitLabel: 'Escalate',
          variant: 'escalate' as const,
          escalationOptions,
        },
      }[activeDecisionAction]
    : null

  const DetailChip = ({ value, label }: { value: string; label: string }) => (
    <div className="flex flex-col items-center gap-1.5">
      <div className="rounded-md bg-[#151515] px-3.5 py-2 text-[10px] font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
        {value}
      </div>
      <span className="text-[9px] text-[#5C5C5C]">{label}</span>
    </div>
  )

  const ImagePreview = () => (
    <div className="relative h-[178px] w-full overflow-hidden rounded-md bg-[#101010] md:w-[300px]">
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
            className="absolute top-1/2 left-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white transition-colors hover:bg-black/90"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={handleNextImage}
            className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white transition-colors hover:bg-black/90"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </>
      )}

      <div
        className={cn(
          'absolute bottom-2 flex items-center gap-1 rounded bg-black/85 px-2 py-1 text-[10px] font-semibold text-white',
          imageCount > 1 ? 'left-1/2 -translate-x-1/2' : 'right-2',
        )}
      >
        <ImageIcon className="size-3" aria-hidden="true" />
        {imageCount > 0 ? `${activeImageIndex + 1}/${imageCount}` : '0/0'}
      </div>
    </div>
  )

  const ActionCards = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="rounded-md bg-[#151515] p-4">
        <div className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-white">
          <History className="size-4" aria-hidden="true" />
          <h3>Internal Notes</h3>
        </div>

        <textarea
          placeholder="No notes yet."
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          className="h-[60px] w-full resize-none rounded-md border border-transparent bg-black px-4 py-3 text-[11px] text-[#BDBDBD] outline-none placeholder:text-[#5C5C5C] focus:border-[#FBC078]/40"
        />
      </div>

      <div className="rounded-md bg-[#151515] p-4">
        <div className="mb-6 flex items-center gap-2 text-[14px] font-semibold text-white">
          <Gavel className="size-4" aria-hidden="true" />
          <h3>Decision Controls</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => openDecisionModal('approve')}
            className="flex items-center gap-2 rounded-md bg-[#00B761] px-3 py-2 text-[10px] font-bold text-white"
          >
            Approve Application
            <span className="flex size-4 items-center justify-center rounded-full bg-white">
              <Check className="size-2.5 text-[#00B761]" aria-hidden="true" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => openDecisionModal('requestChanges')}
            className="flex items-center gap-2 rounded-md bg-black px-3 py-2 text-[10px] font-bold text-white"
          >
            Request Changes
            <RotateCcw className="size-3" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => openDecisionModal('escalate')}
            className="flex items-center gap-2 rounded-md bg-[#1F6BFF] px-3 py-2 text-[10px] font-bold text-white"
          >
            Escalate
            <ArrowUpRight className="size-3" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => openDecisionModal('reject')}
            className="flex items-center gap-2 rounded-md bg-[#F02D2D] px-3 py-2 text-[10px] font-bold text-white"
          >
            Reject Application
            <span className="flex size-4 items-center justify-center rounded-full border border-white">
              <X className="size-2.5" aria-hidden="true" />
            </span>
          </button>
        </div>
      </div>
    </div>
  )

  const ExpertSummary = () => (
    <section className="rounded-md bg-[#151515] px-5 py-4">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold text-white underline decoration-white/70 underline-offset-2">
            {expertName}
          </h2>
          {getRelativeTime(service.createdAt) && (
            <p className="mt-1 text-[11px] text-[#777777]">{getRelativeTime(service.createdAt)}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => showToast('Navigating to expert profile details...', 'info')}
          className="mt-1 flex items-center gap-2 rounded-md bg-black px-3 py-2 text-[10px] font-semibold text-white"
        >
          <Eye className="size-3" aria-hidden="true" />
          View Profile
        </button>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          ['Expert ID', expertId],
          ['Submitted', submittedAt],
          ['Last Updated', updatedAt],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md bg-black px-4 py-3">
            <span className="block text-[10px] text-[#666666]">{label}</span>
            <span className="mt-2 block text-[11px] font-semibold text-white">{value}</span>
          </div>
        ))}
      </div>
    </section>
  )

  const ServiceContent = () => {
    const isTiered = service.pricingType === 'tiered' && tierDetails
    const stats = service.pricingType === 'fixed' ? fixedStats : customStats

    return (
      <section className={cn('relative', isTiered ? 'space-y-5' : 'flex flex-col gap-5 md:flex-row')}>
        <div className={cn(isTiered ? 'flex flex-col gap-5 md:flex-row' : 'contents')}>
          <ImagePreview />

          <div className="min-w-0 flex-1 pt-3">
            <div className="mb-8 flex items-start justify-between gap-6">
              <div>
                <h2 className="text-[20px] font-semibold leading-none text-white">{service.title}</h2>
                {categoryName && <p className="mt-2 text-[10px] text-[#777777]">{categoryName}</p>}
              </div>

              <span className="rounded-md bg-[#6B4217] px-3 py-1.5 text-[12px] font-semibold text-[#E7AE63]">
                {statusLabel}
              </span>
            </div>

            {service.description && (
              <p className="max-w-[560px] text-[12px] leading-relaxed text-white">
                {service.description}
              </p>
            )}

            {Boolean(service.subCategory?.length) && (
              <div className="mt-5 flex flex-wrap gap-2">
                {service.subCategory?.map((subCat) => (
                  <span
                    key={subCat._id}
                    className="rounded border border-white/40 px-2 py-1 text-[9px] font-medium text-white"
                  >
                    {subCat.name}
                  </span>
                ))}
              </div>
            )}

            {!isTiered && (
              <div className="mt-7 flex flex-wrap gap-8">
                {stats.map((stat) => (
                  <DetailChip key={stat.label} value={stat.value} label={stat.label} />
                ))}
              </div>
            )}
          </div>
        </div>

        {isTiered && (
          <div className="max-w-[315px]">
            <div className="mb-4 flex rounded-full bg-[#171717] p-0.5">
              {service.tieredPricing?.tiers.map((tier, index) => (
                <button
                  key={tier.name}
                  type="button"
                  onClick={() => setActiveTierIndex(index)}
                  className={cn(
                    'flex-1 rounded-full py-2 text-[9px] font-medium transition-colors',
                    activeTierIndex === index ? 'bg-white text-black' : 'text-white',
                  )}
                >
                  {tier.name}
                </button>
              ))}
            </div>

            {tierDetails.description && (
              <p className="text-[12px] leading-relaxed text-white">{tierDetails.description}</p>
            )}
            {Boolean(tierDetails.features.length) && (
              <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-white">
                {tierDetails.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            )}

            <div className="mt-4 flex gap-3">
              <DetailChip value={formatMoney(tierDetails.price)} label="Pricing" />
              <DetailChip
                value={`${String(tierDetails.timelineValue).padStart(2, '0')} ${tierDetails.timelineUnit}`}
                label="Timelines"
              />
            </div>
          </div>
        )}
      </section>
    )
  }

  const ConsultationContent = () => (
    <section className="mx-auto w-full max-w-[910px] rounded-md bg-black px-5 py-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_0.95fr]">
        <div className="border-l-4 border-[#FBC078] pl-4">
          <h2 className="text-[13px] font-semibold text-white">
            {service.consultationTitle || service.title}
          </h2>
          {(service.consultationCategory || categoryName) && (
            <p className="mt-1 text-[10px] text-[#777777]">
              {service.consultationCategory || categoryName}
            </p>
          )}

          {Boolean(service.topics?.length || service.subCategory?.length) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {(service.topics?.length ? service.topics : service.subCategory || []).map((subCat) => (
                <span
                  key={subCat._id}
                  className="rounded bg-[#A8ADB0] px-2.5 py-1 text-[9px] font-bold text-black"
                >
                  {subCat.name}
                </span>
              ))}
            </div>
          )}

          {[
            {
              title: 'Session outline',
              body: service.sessionOutline,
            },
            {
              title: 'Who is it for?',
              body: service.whoItsFor || service.whoIsItFor,
            },
          ].filter((section) => section.body).map((section) => (
            <div key={section.title} className="mt-5">
              <h3 className="text-[11px] font-semibold text-white">{section.title}</h3>
              <p className="mt-2 whitespace-pre-line text-[10px] leading-relaxed text-[#777777]">
                {section.body}
              </p>
            </div>
          ))}
        </div>

        <div className="border-l border-[#242424] pl-5">
          <h3 className="text-[11px] font-semibold text-white">Additional Information</h3>

          <div className="mt-5 flex flex-wrap gap-5">
            {[
              { icon: Phone, value: service.mode || service.modeOfConsultation, label: 'Mode' },
              {
                icon: Languages,
                value: service.languages?.join(', ') || service.language,
                label: 'Languages',
              },
              {
                value: service.hasFollowUp
                  ? `${service.followUpDays || 0} Days`
                  : service.followUpWindow,
                label: 'Follow Ups',
              },
            ].filter((item) => item.value).map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className="flex min-h-[54px] min-w-[54px] max-w-[140px] items-center justify-center rounded-md bg-[#151515] px-3 text-center text-[11px] font-semibold capitalize text-white">
                  {item.value}
                </div>
                <span className="text-[9px] text-[#777777]">{item.label}</span>
              </div>
            ))}
          </div>

          {[
            {
              title: 'Post-session requirement',
              body:
                service.hasPostSessionMessage === false
                  ? ''
                  : service.postSessionMessage || service.postSessionRequirement,
            },
            {
              title: 'Pre-session requirement',
              body:
                service.hasPreSessionRequirement === false
                  ? ''
                  : service.preSessionRequirement,
            },
            {
              title: 'Duration & Pricing',
              body: '',
            },
          ].filter((section) => section.title === 'Duration & Pricing' || section.body).map((section) => (
            <div key={section.title} className="border-t border-[#242424] py-4">
              <h3 className="text-[11px] font-semibold text-white">{section.title}</h3>
              {section.body && <p className="mt-2 text-[10px] text-[#777777]">{section.body}</p>}
              {section.title === 'Duration & Pricing' && (
                <div className="mt-4 flex flex-wrap gap-4">
                  {consultationDurations.length ? (
                    consultationDurations.map((duration) => (
                      <span
                        key={duration.label}
                        className="rounded-md bg-[#151515] px-4 py-2.5 text-[10px] font-semibold text-white"
                      >
                        {duration.label}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-[#777777]">{EMPTY_VALUE}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )

  return (
    <div className="relative flex min-h-screen w-full flex-col gap-5 p-0 pb-8 text-white">
      {actionToast.message && (
        <div
          className={cn(
            'animate-in fade-in slide-in-from-top-4 fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl border px-5 py-4 shadow-2xl transition-all duration-300',
            actionToast.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-950/95 text-emerald-400'
              : actionToast.type === 'error'
                ? 'border-red-500/30 bg-red-950/95 text-red-400'
                : 'border-slate-800 bg-slate-900/95 text-slate-300',
          )}
        >
          <div className="size-2 animate-pulse rounded-full bg-current" />
          <span className="text-sm font-semibold">{actionToast.message}</span>
          <button
            type="button"
            onClick={() => setActionToast({ message: '', type: null })}
            className="ml-2 hover:opacity-80"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

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
            activeDecisionAction === 'reject' || activeDecisionAction === 'requestChanges'
              ? setDecisionReason
              : undefined
          }
          reasonOptions={decisionModalConfig.reasonOptions}
          selectedReasons={selectedReasons}
          onReasonToggle={toggleDecisionReason}
          escalationOptions={decisionModalConfig.escalationOptions}
          selectedEscalationOption={selectedEscalationOption}
          onEscalationOptionChange={setSelectedEscalationOption}
          onClose={closeDecisionModal}
          onSubmit={submitDecisionAction}
          isSubmitting={isUpdatingStatus}
        />
      )}

      <header className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigate('/services/management')}
          className="group flex w-fit items-center gap-2 text-[18px] font-semibold text-white transition-colors hover:text-slate-200"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          <span>{isConsultation ? 'Consultation View' : 'Service View'}</span>
        </button>

        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#777777]">
          <span>Service management</span>
          <span>/</span>
          <span>Service View</span>
          <span>/</span>
          <span className="font-medium text-white">{expertName}</span>
        </div>
        <h1 className="mt-3 text-[15px] font-semibold text-white">
          {isConsultation ? 'Consultation Details' : 'Service Details'}
        </h1>
      </header>

      <ExpertSummary />

      {isConsultation ? <ConsultationContent /> : <ServiceContent />}

      <ActionCards />
    </div>
  )
}
