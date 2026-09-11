import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import axios from 'axios'
import { ArrowLeft, Eye, History, Info, Languages, Loader2, Phone } from 'lucide-react'
import { toast } from 'sonner'

import { useAuthStore } from '@/modules/auth/store/auth-store'
import {
  useAdminEscalation,
  useEscalateConsultationApplication,
  useEscalationAssignees,
  useStartAdminEscalationReview,
} from '@/modules/my-tasks/hooks/use-admin-escalation'
import {
  DecisionControlButtons,
  DecisionControlsHeader,
} from '@/shared/components/decision-controls'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import { Button } from '@/shared/components/ui/button'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

import { useExpertProfile } from '../../hooks/use-expert-profile'
import { useConsultation, useUpdateConsultationStatus } from '../../hooks/use-services'
import type { ConsultationDetail, ConsultationPricingOption } from '../../type/service'
import { formatExpertDateTime, formatListingExpertId } from '../experts/expert-list-format'
import { MODERATION_CATEGORY_SLUGS } from '@/modules/settings/api/templates-api'
import {
  useModerationReasonOptions,
  useRecordModerationReasonUsage,
} from '@/modules/settings/hooks/use-templates'
import { apiErrorMessage as getApiErrorMessage } from '@/shared/lib/api-error'
import { isApprovedListingStatus } from '../../lib/service-navigation'

type ConsultationDecisionAction = 'approve' | 'reject' | 'requestChanges' | 'escalate'

type ConsultationViewDetail = ConsultationDetail & {
  expertName?: string
  adminNote?: string | null
  consultationCategory?: string
  whoIsItFor?: string
  modeOfConsultation?: string
}

const EMPTY_VALUE = 'Not provided'

const formatAppliedAgo = (value?: string | null) => {
  if (!value) return 'Applied recently'

  const createdAt = new Date(value)
  if (Number.isNaN(createdAt.getTime())) return 'Applied recently'

  const diffDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return 'Applied today'
  if (diffDays === 1) return 'Applied 1 day ago'
  return `Applied ${diffDays} days ago`
}

const formatConsultationPrice = (option: ConsultationPricingOption) => {
  if (option.pricingType === 'free' || !option.price) return 'Free'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(option.price)
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

const isPendingReview = (status?: string) => (status || '').toLowerCase() === 'submitted'

export const ConsultationViewPage = () => {
  const { id, expertId, serviceId } = useParams<{
    id?: string
    expertId?: string
    serviceId?: string
  }>()
  const resolvedConsultationId = serviceId || id || ''
  const fromExpert = Boolean(expertId)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const partnerIdParam = searchParams.get('partnerId') || ''

  const {
    data: consultationResponse,
    isLoading,
    error,
  } = useConsultation(resolvedConsultationId, Boolean(resolvedConsultationId))
  const { mutateAsync: updateConsultationStatus, isPending: isUpdatingStatus } =
    useUpdateConsultationStatus()
  const recordReasonUsage = useRecordModerationReasonUsage()
  const { options: rejectReasonOptions, buildPayload: buildRejectReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.rejectService)
  const { options: requestChangesReasonOptions, buildPayload: buildRequestChangesReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.requestChangesService)

  const [activeDecisionAction, setActiveDecisionAction] =
    useState<ConsultationDecisionAction | null>(null)
  const [decisionAdminNotes, setDecisionAdminNotes] = useState('')
  const [decisionReason, setDecisionReason] = useState('')
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [selectedEscalationOption, setSelectedEscalationOption] = useState('')

  const user = useAuthStore((state) => state.user)
  const isSuperAdmin = Boolean(user?.isSuperAdmin)
  const { data: assigneesData } = useEscalationAssignees('services.*')
  const { data: escalationData } = useAdminEscalation('consultation', resolvedConsultationId)
  const escalateConsultation = useEscalateConsultationApplication(resolvedConsultationId)
  const startEscalationReview = useStartAdminEscalationReview(
    'consultation',
    resolvedConsultationId,
  )
  const { mutate: startEscalationReviewMutate } = startEscalationReview

  useEffect(() => {
    if (!resolvedConsultationId || isSuperAdmin) return
    startEscalationReviewMutate()
  }, [resolvedConsultationId, isSuperAdmin, startEscalationReviewMutate])

  const consultation = consultationResponse?.data as ConsultationViewDetail | undefined
  const resolvedPartnerId = expertId || partnerIdParam || consultation?.partnerId || ''
  const { data: expertProfileResponse } = useExpertProfile(resolvedPartnerId || undefined)
  const expertProfile = expertProfileResponse?.data
  const expertName =
    consultation?.expertName ||
    consultation?.partnerName ||
    expertProfile?.basicProfile?.fullname ||
    expertProfile?.fullname ||
    'Expert'
  const expertIdLabel = consultation?.expertid || formatListingExpertId(resolvedPartnerId)

  const openDecisionModal = (action: ConsultationDecisionAction) => {
    setActiveDecisionAction(action)
    setDecisionAdminNotes('')
    setDecisionReason('')
    setSelectedReasons(action === 'approve' ? [] : ['unclear-image', 'content-issue'])
    setSelectedEscalationOption('')
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
    if (!activeDecisionAction || !resolvedConsultationId) return

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

      try {
        await escalateConsultation.mutateAsync({
          assigneeSubAdminId: selectedEscalationOption,
          assigneeName: selectedAssignee?.fullname || '',
          adminNote: decisionAdminNotes.trim(),
          entityTitle: consultation?.title || '',
          applicationUrl: `/services/management/view/${resolvedConsultationId}?type=Consultation`,
        })
        toast.success('Application assigned successfully')
        closeDecisionModal()
      } catch (err) {
        toast.error(getApiErrorMessage(err))
      }
      return
    }

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
      if (activeDecisionAction === 'approve') {
        await updateConsultationStatus({
          id: resolvedConsultationId,
          payload: { status: 'live', adminNote: decisionAdminNotes.trim() },
        })
        toast.success('Consultation approved successfully')
      } else {
        await updateConsultationStatus({
          id: resolvedConsultationId,
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
      closeDecisionModal()
    } catch (err) {
      toast.error(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Failed to update consultation status.'
          : 'Failed to update consultation status.',
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4">
        <Loader2 className="text-brand-accent size-10 animate-spin" />
        <p className="text-muted text-sm font-medium">Fetching consultation information...</p>
      </div>
    )
  }

  if (error || !consultation) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="bg-brand-danger/10 rounded-full p-3 text-red-500">
          <Info className="size-10" />
        </div>
        <h3 className="text-lg font-semibold text-white">Consultation Not Found</h3>
        <p className="text-muted max-w-md text-sm">
          {consultationResponse?.message ||
            'The consultation details could not be loaded. Please ensure the consultation ID is correct.'}
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

  const topics = consultation.topics || []
  const categoryName =
    topics
      .map((topic) => topic.name)
      .filter(Boolean)
      .join(', ') ||
    consultation.consultationCategory ||
    ''
  const sessionContent = splitSessionContent(consultation.sessionOutline)
  const outlineItems = parseOutlineItems(sessionContent.outline)
  const benefitItems = parseOutlineItems(sessionContent.benefits)
  const languagesLabel =
    consultation.languages && consultation.languages.length > 0
      ? consultation.languages.join(', ')
      : EMPTY_VALUE
  const followUpLabel =
    consultation.hasFollowUp && consultation.followUpDays
      ? `${consultation.followUpDays} Days`
      : EMPTY_VALUE
  const pricingOptions = consultation.pricingOptions || []
  const durations = pricingOptions.map((option) => ({
    key: `${option.durationMinutes}-${option.price ?? 'free'}`,
    label: `${option.durationMinutes}mins (${formatConsultationPrice(option)})`,
  }))
  const submittedAt = consultation.submittedAt || consultation.createdAt
  const showApprovalControls = isPendingReview(consultation.status)
  const escalateDisabled =
    isApprovedListingStatus(consultation.status) || escalateConsultation.isPending
  const escalation = escalationData?.data
  const escalationOptions: DecisionActionModalOption[] =
    assigneesData?.data.map((assignee) => ({
      label: assignee.fullname,
      value: assignee.id,
    })) || []
  const isEscalateFlow = activeDecisionAction === 'escalate'

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
          title: 'Reject Consultation',
          description:
            'Are you sure you want to Reject Approval to this application? The applicant will be notified via email.',
          submitLabel: 'Reject Consultation',
          variant: 'reject' as const,
          reasonOptions: rejectReasonOptions,
        },
        requestChanges: {
          title: 'Request Changes',
          description:
            'Are you sure you want to Request Changes to this application? The applicant will be notified via email.',
          submitLabel: 'Request Changes',
          variant: 'requestChanges' as const,
          reasonOptions: requestChangesReasonOptions,
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

  return (
    <div className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-5 pb-8 text-white">
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
          onClose={closeDecisionModal}
          onSubmit={submitDecisionAction}
          escalationOptions={isEscalateFlow ? escalationOptions : []}
          selectedEscalationOption={selectedEscalationOption}
          onEscalationOptionChange={setSelectedEscalationOption}
          isSubmitting={isEscalateFlow ? escalateConsultation.isPending : isUpdatingStatus}
        />
      )}

      <header className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="group font-heading hover:text-brand-accent text-h3 flex w-fit items-center gap-2 font-bold tracking-tight text-white transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Consultation View</span>
        </button>

        <div className="text-body-sm text-muted flex items-center gap-1.5 pl-7 font-medium">
          {fromExpert ? (
            <>
              <button
                type="button"
                onClick={() => navigateBackOrFallback(navigate, '/experts/management')}
                className="hover:text-brand-text transition-colors"
              >
                All Experts
              </button>
              <span className="text-muted">/</span>
              <button
                type="button"
                onClick={() => expertId && navigate(`/experts/management/profile/${expertId}`)}
                className="hover:text-brand-text transition-colors"
              >
                {expertName}
              </button>
              <span className="text-muted">/</span>
              <span className="font-bold text-white">Consultation View</span>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigateBackOrFallback(navigate, '/services/management')}
                className="hover:text-brand-text transition-colors"
              >
                Service management
              </button>
              <span className="text-muted">/</span>
              <span>Service View</span>
              <span className="text-muted">/</span>
              <span className="font-bold text-white">{expertName}</span>
            </>
          )}
        </div>
      </header>

      <h2 className="text-body-md font-semibold text-white">Consultation Details</h2>

      <div className="rounded-xl bg-[#141414] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-[22px] font-bold text-white">{expertName}</h2>
            <p className="text-body-sm text-muted mt-1">{formatAppliedAgo(submittedAt)}</p>
          </div>
          {resolvedPartnerId && (
            <button
              type="button"
              onClick={() => navigate(`/experts/management/profile/${resolvedPartnerId}`)}
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
            <p className="mt-1 font-mono text-[13px] font-semibold text-white">
              {expertIdLabel.startsWith('#') ? expertIdLabel : `#${expertIdLabel}`}
            </p>
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
              {formatExpertDateTime(consultation.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1102px] py-2">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          <div className="space-y-6">
            <div className="flex items-stretch gap-3">
              <span className="bg-brand-accent w-[3px] shrink-0 rounded-full" aria-hidden="true" />
              <div className="min-w-0">
                <h1 className="text-h2 leading-tight font-bold text-white">
                  {consultation.title || 'Untitled Consultation'}
                </h1>
                {categoryName ? (
                  <p className="text-muted mt-1 text-[13px]">{categoryName}</p>
                ) : null}
              </div>
            </div>

            {topics.length > 0 && (
              <div className="flex flex-wrap gap-2.5">
                {topics.map((topic) => (
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

            {(consultation.whoItsFor || consultation.whoIsItFor) && (
              <div>
                <h3 className="text-body-sm font-semibold text-white">Who is it for?</h3>
                <p className="text-body-sm text-muted mt-2 leading-relaxed">
                  {consultation.whoItsFor || consultation.whoIsItFor}
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
                  <span className="text-muted text-[10px]">{languagesLabel}</span>
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
                  {consultation.hasPostSessionMessage && consultation.postSessionMessage?.trim()
                    ? consultation.postSessionMessage
                    : 'Keep your requirements and questions ready.'}
                </p>
              </div>
              <div>
                <p className="text-body-sm font-semibold text-white">Pre-session requirement</p>
                <p className="text-body-sm text-muted mt-1 leading-relaxed">
                  {consultation.hasPreSessionRequirement &&
                  consultation.preSessionRequirement?.trim()
                    ? consultation.preSessionRequirement
                    : 'Keep your requirements and questions ready.'}
                </p>
              </div>
            </div>

            {durations.length > 0 && (
              <div className="border-t border-white/5 pt-4">
                <h3 className="text-body-sm mb-3 font-semibold text-white">
                  Duration &amp; Pricing
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {durations.map((duration) => (
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl bg-[#141414] p-5">
          <div className="text-body-md mb-4 flex items-center gap-2 font-semibold text-white">
            <History className="text-brand-accent size-4" aria-hidden="true" />
            <h3>Internal Notes</h3>
          </div>
          <div className="text-body-sm text-muted min-h-[120px] rounded-lg bg-[#050505] p-4">
            {consultation.adminNote?.trim() || 'No notes yet.'}
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
              <span className="font-bold text-white">{consultation.status || '—'}</span>. Approve
              and reject are available only while review is pending.
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
