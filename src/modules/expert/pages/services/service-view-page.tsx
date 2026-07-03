import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import {
  ArrowLeft,
  Ban,
  Check,
  ChevronLeft,
  ChevronRight,
  History,
  Image as ImageIcon,
  Loader2,
  Info,
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
  const shouldFetchConsultation = serviceTypeParam.toLowerCase().includes('consultation')

  const { data: expertProfileResponse } = useExpertProfile(expertId)
  const expertProfile = expertProfileResponse?.data
  const expertName =
    expertProfile?.basicProfile?.fullname ||
    expertProfile?.fullname ||
    'Expert'

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
      if (shouldFetchConsultation) {
        if (activeDecisionAction === 'reject' && !decisionReason.trim()) {
          toast.error('Rejection reason is required.')
          return
        }

        try {
          if (activeDecisionAction === 'approve') {
            await updateConsultationStatus({ id: resolvedServiceId, payload: { status: 'live' } })
            toast.success('Consultation approved successfully')
          } else {
            await updateConsultationStatus({
              id: resolvedServiceId,
              payload: { status: 'rejected', reason: decisionReason.trim() },
            })
            toast.success('Consultation rejected')
          }
          closeDecisionModal()
        } catch (err) {
          const message = axios.isAxiosError(err)
            ? err.response?.data?.message || 'Failed to update consultation status.'
            : 'Failed to update consultation status.'
          toast.error(message)
        }
        return
      }

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

      try {
        if (activeDecisionAction === 'approve') {
          await updateServiceStatus({
            id: resolvedServiceId,
            payload: { status: 'live', adminNote: decisionAdminNotes.trim() },
          })
          toast.success('Service approved successfully')
        } else {
          const reasonFor = selectedReasons
            .map((reasonValue) => SERVICE_REJECTION_REASON_BY_VALUE[reasonValue])
            .filter((reason): reason is ServiceRejectionReason => Boolean(reason))

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
          ? err.response?.data?.message || 'Failed to update service status.'
          : 'Failed to update service status.'
        toast.error(message)
      }
    }
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
  const categoryName =
    service.category?.name || service.consultationCategory || service.topics?.[0]?.name || ''
  const showApprovalControls =
    !fromExpert && (service.status === 'in_review' || service.status === 'pending')

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

  const topActions = [
    { label: 'Version History', onClick: () => toast.message('Version history coming soon') },
    { label: 'Pause Service', onClick: () => toast.message('Pause service coming soon') },
    { label: 'Flag For Review', onClick: () => toast.message('Flag for review coming soon') },
    {
      label: 'View Support Ticket',
      onClick: () => toast.message('Support tickets coming soon'),
    },
    { label: 'Suspend Service', onClick: () => openDecisionModal('suspend') },
  ]

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
            'Are you sure you want to reject this application? The applicant will be notified via email.',
          submitLabel: 'Reject Service',
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

  const renderConsultationContent = () => {
    const consultationDurations =
      service.pricingOptions?.map((option) => ({
        label: `${option.durationMinutes}mins (${formatConsultationPrice(option)})`,
      })) || []

    return (
      <div className="space-y-5">
        {service.sessionOutline && (
          <div>
            <h3 className="text-[12px] font-semibold text-white">Session outline</h3>
            <p className="mt-2 whitespace-pre-line text-[11px] leading-relaxed text-[#999]">
              {service.sessionOutline}
            </p>
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

        {consultationDurations.length > 0 && (
          <div>
            <h3 className="mb-3 text-[12px] font-semibold text-white">Duration &amp; Pricing</h3>
            <div className="flex flex-wrap gap-3">
              {consultationDurations.map((duration) => (
                <span
                  key={duration.label}
                  className="rounded-md bg-[#151515] px-4 py-2.5 text-[10px] font-semibold text-white"
                >
                  {duration.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

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
          <span>{isConsultation ? 'Consultation Details' : 'Service Details'}</span>
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
              <span className="font-bold text-white">Service Details</span>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate('/services/management')}
                className="transition-colors hover:text-white"
              >
                Service Management
              </button>
              <span className="text-[#333333]">/</span>
              <span className="font-bold text-white">Service Details</span>
            </>
          )}
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {topActions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-transparent px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-white/5"
          >
            <Ban className="size-3.5 text-[#888]" aria-hidden="true" />
            {action.label}
          </button>
        ))}
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

          <div className="rounded-lg bg-[#151515] p-4">
            <h3 className="text-[14px] font-semibold text-white">Support &amp; Admin</h3>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-[11px] font-semibold text-white">Active Tickets</p>
                <p className="mt-1 text-[11px] text-[#777]">None</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-white">Admin notes</p>
                <p className="mt-1 text-[11px] text-[#777]">
                  {service.adminNote?.trim() || 'None'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="mb-1 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-semibold leading-tight text-white">
                {service.title}
              </h1>
              {categoryName && <p className="mt-1 text-[12px] text-[#777]">{categoryName}</p>}
            </div>
          </div>

          {!isConsultation && service.description && (
            <p className="mt-4 max-w-[640px] text-[12px] leading-relaxed text-white">
              {service.description}
            </p>
          )}

          {Boolean(service.subCategory?.length || service.topics?.length) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {(service.subCategory?.length ? service.subCategory : service.topics || []).map(
                (item) => (
                  <span
                    key={item._id}
                    className="rounded border border-white/30 px-2.5 py-1 text-[10px] font-medium text-white"
                  >
                    {item.name}
                  </span>
                ),
              )}
            </div>
          )}

          {isConsultation ? (
            renderConsultationContent()
          ) : (
            <>
              {service.pricingType === 'fixed' && renderFixedPricing()}
              {service.pricingType === 'custom' && renderCustomPricing()}
              {service.pricingType === 'tiered' && renderTieredPricing()}
            </>
          )}

          <button
            type="button"
            onClick={() => navigate('/services/dashboard/metrics')}
            className="mt-8 flex w-full items-center justify-between rounded-lg border border-[#6B4217] px-5 py-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#6B4217]/10"
          >
            {isConsultation ? 'Consultation Performance' : 'Service Performance'}
            <ChevronRight className="size-4 text-[#E7AE63]" />
          </button>
        </div>
      </div>

      {showApprovalControls && (
        <div className="rounded-lg bg-[#151515] p-5">
          <div className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-white">
            <History className="size-4" />
            <h3>Decision Controls</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => openDecisionModal('approve')}
              className="flex items-center gap-2 rounded-md bg-[#00B761] px-4 py-2 text-[11px] font-bold text-white"
            >
              Approve Application
              <span className="flex size-4 items-center justify-center rounded-full bg-white">
                <Check className="size-2.5 text-[#00B761]" />
              </span>
            </button>
            <button
              type="button"
              onClick={() => openDecisionModal('reject')}
              className="flex items-center gap-2 rounded-md bg-[#F02D2D] px-4 py-2 text-[11px] font-bold text-white"
            >
              Reject Application
              <span className="flex size-4 items-center justify-center rounded-full border border-white">
                <X className="size-2.5" />
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
