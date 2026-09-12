import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { PageBreadcrumb } from '@/shared/components/navigation/page-breadcrumb'
import axios from 'axios'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  History,
  Image as ImageIcon,
  Info,
  Languages,
  Loader2,
  Phone,
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
import { formatExpertDateTime, formatListingExpertId } from '../experts/expert-list-format'
import { Button } from '@/shared/components/ui/button'
import {
  DecisionControlButtons,
  DecisionControlsHeader,
} from '@/shared/components/decision-controls'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import { cn } from '@/shared/lib/cn'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import {
  useAdminEscalation,
  useEscalateConsultationApplication,
  useEscalateServiceApplication,
  useEscalationAssignees,
  useStartAdminEscalationReview,
} from '@/modules/my-tasks/hooks/use-admin-escalation'
import type {
  ConsultationDetail,
  ConsultationPricingOption,
  CustomPricing,
  ServiceDetail,
} from '../../type/service'
import { MODERATION_CATEGORY_SLUGS } from '@/modules/settings/api/templates-api'
import { apiErrorMessage as getApiErrorMessage } from '@/shared/lib/api-error'
import { isApprovedListingStatus } from '../../lib/service-navigation'
import {
  useModerationReasonOptions,
  useRecordModerationReasonUsage,
} from '@/modules/settings/hooks/use-templates'

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
  const [summary, ...features] = description
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean)

  return { summary, features }
}

const formatCustomTimeline = (custom?: CustomPricing) => {
  if (!custom) return EMPTY_VALUE

  const durationLabel = custom.durationType === 'long_term' ? 'Long term' : 'Short term'
  return `${durationLabel} (${custom.timelineFrom}-${custom.timelineTo} ${custom.timelineUnit})`
}

type ServiceDecisionAction = 'approve' | 'reject' | 'requestChanges' | 'suspend' | 'escalate'

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
    return { label: 'Review Pending', className: 'bg-brand-accent/15 text-brand-accent' }
  }

  if (normalized === 'live') {
    return { label: 'Live', className: 'bg-brand-positive/15 text-brand-positive' }
  }

  if (normalized === 'rejected') {
    return { label: 'Rejected', className: 'bg-brand-danger/15 text-red-400' }
  }

  if (normalized === 'suspended') {
    return { label: 'Suspended', className: 'bg-brand-danger/15 text-red-300' }
  }

  return { label: status || 'Draft', className: 'bg-white/10 text-muted' }
}

const isPendingReview = (status: string | undefined, isConsultationListing: boolean) => {
  const normalized = (status || '').toLowerCase()

  if (isConsultationListing) {
    return normalized === 'submitted'
  }

  return normalized === 'in_review' || normalized === 'pending' || normalized === 'submitted'
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
    isFetched: isServiceFetched,
    error: serviceError,
  } = useService(resolvedServiceId, !shouldFetchConsultation)
  const serviceLookupFailed =
    !shouldFetchConsultation && isServiceFetched && Boolean(serviceError || !serviceResponse?.data)
  const {
    data: consultationResponse,
    isLoading: isConsultationLoading,
    error: consultationError,
  } = useConsultation(resolvedServiceId, shouldFetchConsultation || serviceLookupFailed)
  const { mutateAsync: updateServiceStatus, isPending: isUpdatingServiceStatus } =
    useUpdateServiceStatus()
  const { mutateAsync: updateConsultationStatus, isPending: isUpdatingConsultationStatus } =
    useUpdateConsultationStatus()
  const suspendServiceMutation = useSuspendService()
  const recordReasonUsage = useRecordModerationReasonUsage()
  const serviceRejectReasons = useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.rejectService)
  const consultationRejectReasons = useModerationReasonOptions(
    MODERATION_CATEGORY_SLUGS.rejectConsultation,
  )
  const { options: requestChangesReasonOptions, buildPayload: buildRequestChangesReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.requestChangesService)
  const { options: suspendReasonOptions, buildPayload: buildSuspendReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.suspendService)

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
  const [selectedEscalationOption, setSelectedEscalationOption] = useState('')

  const user = useAuthStore((state) => state.user)
  const isSuperAdmin = Boolean(user?.isSuperAdmin)
  const isConsultationListing =
    shouldFetchConsultation || (serviceLookupFailed && Boolean(consultationResponse?.data))
  const { options: rejectReasonOptions, buildPayload: buildRejectReasonPayload } =
    isConsultationListing ? consultationRejectReasons : serviceRejectReasons
  const escalationEntityType = isConsultationListing ? 'consultation' : 'service'
  const { data: assigneesData } = useEscalationAssignees('services.*')
  const { data: escalationData } = useAdminEscalation(escalationEntityType, resolvedServiceId)
  const escalateService = useEscalateServiceApplication(resolvedServiceId)
  const escalateConsultation = useEscalateConsultationApplication(resolvedServiceId)
  const startEscalationReview = useStartAdminEscalationReview(
    escalationEntityType,
    resolvedServiceId,
  )
  const { mutate: startEscalationReviewMutate } = startEscalationReview

  useEffect(() => {
    if (!resolvedServiceId || isSuperAdmin) return
    startEscalationReviewMutate()
  }, [resolvedServiceId, isSuperAdmin, startEscalationReviewMutate])

  const [imageCarouselServiceId, setImageCarouselServiceId] = useState(resolvedServiceId)
  if (resolvedServiceId !== imageCarouselServiceId) {
    setImageCarouselServiceId(resolvedServiceId)
    setActiveImageIndex(0)
  }

  const apiResponse = isConsultationListing ? consultationResponse : serviceResponse
  const isLoading =
    (shouldFetchConsultation && isConsultationLoading) ||
    (!shouldFetchConsultation && isServiceLoading) ||
    (serviceLookupFailed && isConsultationLoading)
  const error = isConsultationListing ? consultationError : serviceError
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

  const resolvedPricingType = useMemo(() => {
    if (!service) return null
    const raw = String(service.pricingType || '').toLowerCase()
    if (raw === 'tiered' || (service.tieredPricing?.tiers?.length ?? 0) > 0) return 'tiered'
    if (raw === 'custom' || service.customPricing) return 'custom'
    if (raw === 'fixed' || service.fixedPricing) return 'fixed'
    return raw || null
  }, [service])

  const tierDetails = useMemo(() => {
    if (resolvedPricingType !== 'tiered' || !service?.tieredPricing?.tiers?.length) return null

    const tiers = service.tieredPricing.tiers
    const safeIndex = Math.min(Math.max(activeTierIndex, 0), tiers.length - 1)
    const tier = tiers[safeIndex] || tiers[0]
    const parsedDescription = parseDescription(tier.description)

    return {
      ...tier,
      description: parsedDescription.summary,
      features: parsedDescription.features,
    }
  }, [activeTierIndex, resolvedPricingType, service])

  const openDecisionModal = (action: ServiceDecisionAction) => {
    setActiveDecisionAction(action)
    setDecisionAdminNotes('')
    setDecisionReason('')
    setSelectedReasons(
      action === 'suspend' ? [] : action === 'approve' ? [] : ['unclear-image', 'content-issue'],
    )
    setSelectedEscalationOption('')
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
      navigateBackOrFallback(navigate, `/experts/management/profile/${expertId}`)
      return
    }
    navigateBackOrFallback(navigate, '/services/management')
  }

  const submitDecisionAction = async () => {
    if (!activeDecisionAction || !resolvedServiceId) return

    if (activeDecisionAction === 'escalate') {
      if (!selectedEscalationOption) {
        toast.error('Please select a sub-admin to assign.')
        return
      }
      if (!decisionAdminNotes.trim()) {
        toast.error('Admin notes are required.')
        return
      }

      const selectedAssignee = assigneesData?.data.find(
        (item) => item.id === selectedEscalationOption,
      )
      const payload = {
        assigneeSubAdminId: selectedEscalationOption,
        assigneeName: selectedAssignee?.fullname || '',
        adminNote: decisionAdminNotes.trim(),
        entityTitle: service?.title || service?.consultationTitle || '',
        applicationUrl: isConsultationListing
          ? `/services/management/view/${resolvedServiceId}?type=consultation`
          : `/services/management/view/${resolvedServiceId}`,
      }
      const escalateMutation = isConsultationListing ? escalateConsultation : escalateService

      try {
        await escalateMutation.mutateAsync(payload)
        toast.success('Application assigned successfully')
        closeDecisionModal()
      } catch (err) {
        toast.error(getApiErrorMessage(err))
      }
      return
    }

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

      const toIso = (value: string) =>
        value ? new Date(`${value}T00:00:00.000Z`).toISOString() : undefined

      const reasonPayload = buildSuspendReasonPayload(selectedReasons)
      if (reasonPayload.selectedReasons.length === 0) {
        toast.error('Selected reasons are no longer available. Please refresh and try again.')
        return
      }

      const extraDetails = decisionReason.trim()
      const reasonDetails = [reasonPayload.reasonDetails, extraDetails].filter(Boolean).join('\n\n')

      try {
        await suspendServiceMutation.mutateAsync({
          id: resolvedServiceId,
          payload: {
            selectedReasons: reasonPayload.selectedReasons,
            suspendIndefinitely,
            startDate: suspendIndefinitely ? undefined : toIso(suspendStartDate),
            endDate: suspendIndefinitely ? undefined : toIso(suspendEndDate),
            reasonDetails,
            adminNotes: decisionAdminNotes.trim(),
          },
        })
        if (reasonPayload.reasonIds.length > 0) {
          recordReasonUsage.mutate(reasonPayload.reasonIds)
        }
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

    if (
      activeDecisionAction === 'approve' ||
      activeDecisionAction === 'reject' ||
      activeDecisionAction === 'requestChanges'
    ) {
      if (!decisionAdminNotes.trim()) {
        toast.error('Admin notes are required.')
        return
      }

      const isRejectFlow =
        activeDecisionAction === 'reject' || activeDecisionAction === 'requestChanges'

      if (isRejectFlow) {
        if (!decisionReason.trim()) {
          toast.error('Rejection reason is required.')
          return
        }
        if (selectedReasons.length === 0) {
          toast.error('Please select at least one reason.')
          return
        }
      }

      const reasonPayload = isRejectFlow
        ? activeDecisionAction === 'requestChanges'
          ? buildRequestChangesReasonPayload(selectedReasons)
          : buildRejectReasonPayload(selectedReasons)
        : null

      if (isRejectFlow && (!reasonPayload || reasonPayload.selectedReasons.length === 0)) {
        toast.error('Selected reasons are no longer available. Please refresh and try again.')
        return
      }

      const reasonFor = reasonPayload?.selectedReasons ?? []
      const rejectionReason =
        decisionReason.trim() || reasonPayload?.reasonDetails || reasonFor.join(', ')

      try {
        if (isConsultationListing) {
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
                rejectionReason,
                adminNote: decisionAdminNotes.trim(),
              },
            })
            if (reasonPayload && reasonPayload.reasonIds.length > 0) {
              recordReasonUsage.mutate(reasonPayload.reasonIds)
            }
            toast.success(
              activeDecisionAction === 'requestChanges'
                ? 'Resubmission requested successfully'
                : 'Consultation rejected',
            )
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
              rejectionReason,
              adminNote: decisionAdminNotes.trim(),
            },
          })
          if (reasonPayload && reasonPayload.reasonIds.length > 0) {
            recordReasonUsage.mutate(reasonPayload.reasonIds)
          }
          toast.success(
            activeDecisionAction === 'requestChanges'
              ? 'Resubmission requested successfully'
              : 'Service rejected',
          )
        }
        closeDecisionModal()
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message ||
            (isConsultationListing
              ? 'Failed to update consultation status.'
              : 'Failed to update service status.')
          : isConsultationListing
            ? 'Failed to update consultation status.'
            : 'Failed to update service status.'
        toast.error(message)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4">
        <Loader2 className="text-brand-accent size-10 animate-spin" />
        <p className="text-muted text-sm font-medium">
          {isConsultationListing || serviceLookupFailed
            ? 'Fetching consultation information...'
            : 'Fetching service information...'}
        </p>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="bg-brand-danger/10 rounded-full p-3 text-red-500">
          <Info className="size-10" />
        </div>
        <h3 className="text-lg font-semibold text-white">
          {isConsultationListing || shouldFetchConsultation
            ? 'Consultation Not Found'
            : 'Service Not Found'}
        </h3>
        <p className="text-muted max-w-md text-sm">
          {apiResponse?.message ||
            'The service details could not be loaded. Please ensure the service ID is correct.'}
        </p>
        <Button
          variant="ghost"
          className="text-brand-accent mt-4 gap-2 hover:bg-transparent hover:text-amber-300"
          onClick={handleBack}
        >
          <ArrowLeft className="size-4" /> Go back
        </Button>
      </div>
    )
  }

  const isConsultation =
    isConsultationListing || (service.serviceType || '').toLowerCase().includes('consultation')
  const images = service.images || []
  const imageCount = images.length
  const activeImage =
    imageCount > 0 ? images[Math.min(activeImageIndex, imageCount - 1)] : undefined
  const consultationTopics = service.topics || []
  const categoryName = isConsultation
    ? consultationTopics
        .map((topic) => topic.name)
        .filter(Boolean)
        .join(', ') ||
      service.consultationCategory ||
      ''
    : service.category?.name || service.consultationCategory || ''
  const showApprovalControls = isPendingReview(service.status, isConsultation)
  const escalateDisabled =
    isApprovedListingStatus(service.status) ||
    escalateService.isPending ||
    escalateConsultation.isPending
  const escalation = escalationData?.data
  const escalationOptions: DecisionActionModalOption[] =
    assigneesData?.data.map((assignee) => ({
      label: assignee.fullname,
      value: assignee.id,
    })) || []
  const isEscalateFlow = activeDecisionAction === 'escalate'
  const statusBadge = getReviewStatusBadge(service.status)
  const submittedAt = service.submittedAt || service.createdAt
  const profilePartnerId = resolvedPartnerId || service.partnerId
  const pageTitle = isConsultation ? 'Consultation View' : 'Service View'
  const detailsSectionTitle = isConsultation ? 'Consultation Details' : 'Service Details'
  const consultationTitle = service.title || service.consultationTitle || 'Untitled Consultation'
  const sessionContent = splitSessionContent(service.sessionOutline)
  const outlineItems = parseOutlineItems(sessionContent.outline)
  const benefitItems = parseOutlineItems(sessionContent.benefits)
  const consultationLanguages = service.languages?.length
    ? service.languages.join(', ')
    : EMPTY_VALUE
  const followUpLabel =
    service.hasFollowUp && service.followUpDays ? `${service.followUpDays} Days` : EMPTY_VALUE
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
            'Are you sure you want to Reject Approval to this application? The applicant will be notified via email.',
          submitLabel: isConsultation ? 'Reject Consultation' : 'Reject Service',
          variant: 'reject' as const,
          reasonOptions: rejectReasonOptions,
        },
        requestChanges: {
          title: isConsultation
            ? 'Request Changes – Consultation Approval'
            : 'Request Changes – Service Approval',
          description:
            'Are you sure you want to Request Changes to this application? The applicant will be notified via email.',
          submitLabel: 'Request Changes',
          variant: 'requestChanges' as const,
          reasonOptions: requestChangesReasonOptions,
        },
        suspend: {
          title: 'Suspend Service',
          description:
            'Are you sure you want to suspend this service? It will be hidden from users until reactivated.',
          submitLabel: 'Suspend Service',
          variant: 'suspend' as const,
          reasonOptions: suspendReasonOptions,
        },
        escalate: {
          title: 'Escalate Application',
          description:
            'Are you sure you want to escalate this Application? This Post will be reviewed by the selected parties.',
          submitLabel: 'Escalate',
          variant: 'escalate' as const,
        },
      }[activeDecisionAction]
    : null

  const DetailChip = ({ value, label }: { value: string; label: string }) => (
    <div className="flex flex-col items-center gap-1.5">
      <div className="text-body-sm rounded-md bg-[#050505] px-4 py-2.5 font-semibold text-white">
        {value}
      </div>
      <span className="text-muted text-[10px]">{label}</span>
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
      <DetailChip value={formatCustomTimeline(service.customPricing)} label="Timelines" />
    </div>
  )

  const renderTieredPricing = () => (
    <div className="space-y-4">
      <div className="flex w-full rounded-full bg-[#050505] p-1">
        {service.tieredPricing?.tiers.map((tier, index) => (
          <button
            key={tier.name}
            type="button"
            onClick={() => setActiveTierIndex(index)}
            className={cn(
              'flex-1 rounded-full py-1.5 text-center text-xs font-semibold capitalize transition-colors',
              activeTierIndex === index ? 'bg-white text-black' : 'text-white/70 hover:text-white',
            )}
          >
            {tier.name}
          </button>
        ))}
      </div>

      {tierDetails?.description && (
        <p className="text-body-sm leading-relaxed text-white">{tierDetails.description}</p>
      )}

      {Boolean(tierDetails?.features?.length) && (
        <ul className="text-body-sm list-disc space-y-1.5 pl-4 leading-relaxed text-white">
          {tierDetails?.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-6 pt-1">
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
    <div className="max-w-[1102px] py-2">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
        <div className="space-y-6">
          <div className="flex items-stretch gap-3">
            <span className="bg-brand-accent w-[3px] shrink-0 rounded-full" aria-hidden="true" />
            <div className="min-w-0">
              <h1 className="text-h2 leading-tight font-bold text-white">{consultationTitle}</h1>
              {categoryName && <p className="text-muted mt-1 text-[13px]">{categoryName}</p>}
            </div>
          </div>

          {consultationTopics.length > 0 && (
            <div className="flex flex-wrap gap-2.5">
              {consultationTopics.map((topic) => (
                <span
                  key={topic._id}
                  className="rounded-md border border-white/20 px-3 py-1 text-[11px] font-medium text-white"
                >
                  {topic.name}
                </span>
              ))}
            </div>
          )}

          {outlineItems.length > 0 && (
            <div>
              <h3 className="text-body-sm font-semibold text-white">Session outline</h3>
              <ul className="text-body-sm text-muted mt-2 list-disc space-y-1.5 pl-4 leading-relaxed">
                {outlineItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {benefitItems.length > 0 && (
            <div>
              <h3 className="text-body-sm font-semibold text-white">Benefits</h3>
              <ul className="text-body-sm text-muted mt-2 list-disc space-y-1.5 pl-4 leading-relaxed">
                {benefitItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {(service.whoItsFor || service.whoIsItFor) && (
            <div>
              <h3 className="text-body-sm font-semibold text-white">Who is it for?</h3>
              <p className="text-body-sm text-muted mt-2 leading-relaxed">
                {service.whoItsFor || service.whoIsItFor}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6 lg:border-l lg:border-white/5 lg:pl-8">
          <div>
            <h3 className="text-body-sm mb-4 font-semibold text-white">Additional Information</h3>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex size-12 items-center justify-center rounded-lg bg-[#050505]">
                  <Phone className="size-4 text-white" aria-hidden="true" />
                </div>
                <span className="text-muted text-[10px]">Mode</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex size-12 items-center justify-center rounded-lg bg-[#050505]">
                  <Languages className="size-4 text-white" aria-hidden="true" />
                </div>
                <span className="text-muted text-[10px]">{consultationLanguages}</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="text-body-sm flex h-12 min-w-14 items-center justify-center rounded-lg bg-[#050505] px-3 font-semibold text-white">
                  {followUpLabel}
                </div>
                <span className="text-muted text-[10px]">FollowUps</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-body-sm font-semibold text-white">Post-session requirement</p>
              <p className="text-body-sm text-muted mt-1 leading-relaxed">
                {service.hasPostSessionMessage && service.postSessionMessage?.trim()
                  ? service.postSessionMessage
                  : 'Keep your requirements and questions ready.'}
              </p>
            </div>
            <div>
              <p className="text-body-sm font-semibold text-white">Pre-session requirement</p>
              <p className="text-body-sm text-muted mt-1 leading-relaxed">
                {service.hasPreSessionRequirement && service.preSessionRequirement?.trim()
                  ? service.preSessionRequirement
                  : 'Keep your requirements and questions ready.'}
              </p>
            </div>
          </div>

          {consultationDurations.length > 0 && (
            <div className="border-t border-white/5 pt-4">
              <h3 className="text-body-sm mb-3 font-semibold text-white">Duration &amp; Pricing</h3>
              <div className="flex flex-wrap gap-2.5">
                {consultationDurations.map((duration) => (
                  <span
                    key={duration.key}
                    className="rounded-lg bg-[#050505] px-4 py-2.5 text-xs font-semibold text-white"
                  >
                    {duration.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderServiceDetails = () => (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] leading-tight font-semibold text-white">{service.title}</h1>
          {categoryName && <p className="text-body-sm text-muted mt-1">{categoryName}</p>}
        </div>

        <span
          className={cn(
            'rounded-md px-3.5 py-1.5 text-[11px] font-semibold tracking-wide',
            statusBadge.className,
          )}
        >
          {statusBadge.label}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="relative h-[230px] w-full overflow-hidden rounded-lg bg-[#050505]">
            {activeImage ? (
              <a
                href={activeImage}
                target="_blank"
                rel="noreferrer"
                className="block h-full w-full cursor-zoom-in"
              >
                <img src={activeImage} alt={service.title} className="h-full w-full object-cover" />
              </a>
            ) : (
              <div className="text-muted flex h-full flex-col items-center justify-center gap-2">
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
                  className="absolute top-1/2 left-2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={handleNextImage}
                  className="absolute top-1/2 right-2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white"
                >
                  <ChevronRight className="size-4" />
                </button>
              </>
            )}

            <div className="absolute right-2 bottom-2 z-10 flex items-center gap-1 rounded bg-black/85 px-2 py-1 text-[10px] font-semibold text-white">
              <ImageIcon className="size-3" />
              {imageCount > 0 ? `${activeImageIndex + 1}/${imageCount}` : '0/0'}
            </div>
          </div>

          {resolvedPricingType === 'tiered' && renderTieredPricing()}
        </div>

        <div className="flex min-w-0 flex-col space-y-4">
          {service.description && (
            <p className="text-body-sm leading-relaxed text-white">{service.description}</p>
          )}

          {Boolean(service.subCategory?.length) && (
            <div className="flex flex-wrap gap-2 pt-1">
              {service.subCategory?.map((item) => (
                <span
                  key={item._id}
                  className="rounded-md border border-white/20 px-3 py-1 text-[11px] font-medium text-white"
                >
                  {item.name}
                </span>
              ))}
            </div>
          )}

          {resolvedPricingType === 'fixed' && renderFixedPricing()}
          {resolvedPricingType === 'custom' && renderCustomPricing()}
        </div>
      </div>
    </div>
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
            activeDecisionAction === 'reject' || activeDecisionAction === 'requestChanges'
              ? setDecisionReason
              : undefined
          }
          reasonLabel={activeDecisionAction === 'requestChanges' ? 'Request Changes' : 'Reason'}
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
          escalationOptions={isEscalateFlow ? escalationOptions : []}
          selectedEscalationOption={selectedEscalationOption}
          onEscalationOptionChange={setSelectedEscalationOption}
          isSubmitting={
            isEscalateFlow
              ? escalateService.isPending || escalateConsultation.isPending
              : isUpdatingStatus || suspendServiceMutation.isPending
          }
        />
      )}

      <header className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="group font-heading hover:text-brand-accent text-h3 flex w-fit items-center gap-2 font-bold tracking-tight text-white transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>{pageTitle}</span>
        </button>

        <div className="pl-7">
          <PageBreadcrumb
            items={
              fromExpert
                ? [
                    { label: 'Expert Management', to: '/experts/management' },
                    {
                      label: expertName,
                      to: expertId ? `/experts/management/profile/${expertId}` : undefined,
                    },
                    { label: pageTitle, isActive: true },
                  ]
                : [
                    { label: 'Service Management', to: '/services/management' },
                    { label: 'Manage Services', to: '/services/management' },
                    { label: expertName, isActive: true },
                  ]
            }
          />
        </div>
      </header>

      <h2 className="text-body-md font-semibold text-white">{detailsSectionTitle}</h2>

      <div className="rounded-xl bg-[#141414] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{expertName}</h2>
            <p className="text-body-sm text-muted mt-1">{formatAppliedAgo(submittedAt)}</p>
          </div>
          {profilePartnerId && (
            <button
              type="button"
              onClick={() => navigate(`/experts/management/profile/${profilePartnerId}`)}
              className="text-body-sm inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 font-semibold text-white transition-colors hover:bg-white/5"
            >
              <Eye className="size-3.5" aria-hidden="true" />
              View Profile
            </button>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-[#050505] p-4">
            <p className="text-body-sm text-muted">Expert ID</p>
            <p className="mt-1 font-mono text-[13px] font-semibold text-white">#{expertIdLabel}</p>
          </div>
          <div className="rounded-lg bg-[#050505] p-4">
            <p className="text-body-sm text-muted">Submitted</p>
            <p className="mt-1 text-[13px] font-semibold text-white">
              {formatExpertDateTime(submittedAt)}
            </p>
          </div>
          <div className="rounded-lg bg-[#050505] p-4">
            <p className="text-body-sm text-muted">Last Updated</p>
            <p className="mt-1 text-[13px] font-semibold text-white">
              {formatExpertDateTime(service.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="py-2">
        {isConsultation ? renderConsultationDetails() : renderServiceDetails()}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl bg-[#141414] p-5">
          <div className="text-body-md mb-4 flex items-center gap-2 font-semibold text-white">
            <History className="text-brand-accent size-4" aria-hidden="true" />
            <h3>Internal Notes</h3>
          </div>
          <div className="text-body-sm text-muted min-h-[120px] rounded-lg bg-[#050505] p-4">
            {service.adminNote?.trim() || 'No notes yet.'}
            {escalation?.escalatedByName ? (
              <p className="text-body-sm text-muted mt-3">
                Escalated by {escalation.escalatedByName}
                {escalation.escalatedToName ? ` to ${escalation.escalatedToName}` : ''}.
                {escalation.escalationNote ? ` Note: ${escalation.escalationNote}` : ''}
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl bg-[#141414] p-5">
          <DecisionControlsHeader className="mb-4" />
          {!showApprovalControls ? (
            <p className="text-body-sm text-muted mb-4 rounded-md bg-black px-3 py-2 font-medium">
              This listing is currently{' '}
              <span className="font-bold text-white">{service.status || '—'}</span>. Approve and
              reject are available only while review is pending.
            </p>
          ) : null}
          <DecisionControlButtons
            onApprove={() => openDecisionModal('approve')}
            onRequestChanges={() => openDecisionModal('requestChanges')}
            onEscalate={() => openDecisionModal('escalate')}
            onReject={() => openDecisionModal('reject')}
            showEscalate
            approveDisabled={!showApprovalControls || isUpdatingStatus}
            requestChangesDisabled={!showApprovalControls || isUpdatingStatus}
            escalateDisabled={escalateDisabled}
            rejectDisabled={!showApprovalControls || isUpdatingStatus}
          />
        </div>
      </div>
    </div>
  )
}
