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
import type {
  ConsultationDetail,
  ConsultationPricingOption,
  ServiceRejectionReason,
} from '../../type/service'
import { SERVICE_REJECTION_REASON_BY_VALUE } from '../../type/service'
import { formatExpertDateTime, formatListingExpertId } from '../experts/expert-list-format'

type ConsultationDecisionAction = 'approve' | 'reject' | 'requestChanges' | 'escalate'

type ConsultationViewDetail = ConsultationDetail & {
  expertName?: string
  adminNote?: string | null
  consultationCategory?: string
  whoIsItFor?: string
}

const EMPTY_VALUE = 'Not provided'

const decisionReasonOptions = [
  { label: 'Unclear Image', value: 'unclear-image' },
  { label: 'Content Issue', value: 'content-issue' },
  { label: 'Invalid documents', value: 'invalid-documents' },
  { label: 'Invalid PAN', value: 'invalid-pan' },
  { label: 'Invalid GST', value: 'invalid-gst' },
]

const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || 'Something went wrong. Please try again.'
  }
  return 'Something went wrong. Please try again.'
}

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

    const reasonFor = selectedReasons
      .map((reasonValue) => SERVICE_REJECTION_REASON_BY_VALUE[reasonValue])
      .filter((reason): reason is ServiceRejectionReason => Boolean(reason))

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
            rejectionReason: decisionReason.trim(),
            adminNote: decisionAdminNotes.trim(),
          },
        })
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
        <Loader2 className="size-10 animate-spin text-amber-400" />
        <p className="text-sm font-medium text-slate-400">Fetching consultation information...</p>
      </div>
    )
  }

  if (error || !consultation) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="rounded-full bg-red-500/10 p-3 text-red-500">
          <Info className="size-10" />
        </div>
        <h3 className="text-lg font-semibold text-white">Consultation Not Found</h3>
        <p className="max-w-md text-sm text-slate-400">
          {consultationResponse?.message ||
            'The consultation details could not be loaded. Please ensure the consultation ID is correct.'}
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
  const primaryLanguage = consultation.languages?.[0] || EMPTY_VALUE
  const followUpLabel =
    consultation.hasFollowUp && consultation.followUpDays
      ? `${consultation.followUpDays} Days`
      : EMPTY_VALUE
  const pricingOptions = consultation.pricingOptions || []
  const submittedAt = consultation.submittedAt || consultation.createdAt
  const showApprovalControls = isPendingReview(consultation.status)
  const escalateDisabled = !showApprovalControls || escalateConsultation.isPending
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
          reasonOptions: decisionReasonOptions,
        },
        requestChanges: {
          title: 'Request Changes – Consultation Approval',
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
          className="group font-heading hover:text-brand-accent flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Consultation View</span>
        </button>

        <div className="flex items-center gap-1.5 pl-7 text-[12px] font-medium text-[#777777]">
          {fromExpert ? (
            <>
              <button
                type="button"
                onClick={() => navigateBackOrFallback(navigate, '/experts/management')}
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
              <span className="font-bold text-white">Consultation View</span>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigateBackOrFallback(navigate, '/services/management')}
                className="transition-colors hover:text-white"
              >
                Service management
              </button>
              <span className="text-[#333333]">/</span>
              <span>Service View</span>
              <span className="text-[#333333]">/</span>
              <span className="font-bold text-white">{expertName}</span>
            </>
          )}
        </div>
      </header>

      <h2 className="text-[14px] font-semibold text-white">Consultation Details</h2>

      <div className="rounded-xl border border-white/5 bg-[#111111] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-[22px] font-bold text-white">{expertName}</h2>
            <p className="mt-1 text-[12px] text-[#777]">{formatAppliedAgo(submittedAt)}</p>
          </div>
          {resolvedPartnerId && (
            <button
              type="button"
              onClick={() => navigate(`/experts/management/profile/${resolvedPartnerId}`)}
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
            <p className="mt-1 font-mono text-[13px] font-semibold text-white">
              {expertIdLabel.startsWith('#') ? expertIdLabel : `#${expertIdLabel}`}
            </p>
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
              {formatExpertDateTime(consultation.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-[#111111] p-6 lg:p-7">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.78fr)] lg:gap-10">
          <div className="space-y-6">
            <div className="flex items-stretch gap-3">
              <span className="bg-brand-accent w-[3px] shrink-0 rounded-full" aria-hidden="true" />
              <div className="min-w-0">
                <h1 className="text-[24px] leading-tight font-bold text-white">
                  {consultation.title || 'Untitled Consultation'}
                </h1>
                {categoryName ? (
                  <p className="mt-1 text-[13px] text-[#8A8A8A]">{categoryName}</p>
                ) : null}
              </div>
            </div>

            {topics.length > 0 && (
              <div className="flex flex-wrap gap-2.5">
                {topics.map((topic) => (
                  <span
                    key={topic._id}
                    className="rounded-md bg-[#7A7A7A] px-3.5 py-1.5 text-[11px] font-medium text-black"
                  >
                    {topic.name}
                  </span>
                ))}
              </div>
            )}

            {outlineItems.length > 0 && (
              <div>
                <h3 className="text-[13px] font-semibold text-white">Session outline</h3>
                <ul className="mt-2.5 list-disc space-y-1.5 pl-4 text-[12px] leading-relaxed text-[#999]">
                  {outlineItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {benefitItems.length > 0 && (
              <div>
                <h3 className="text-[13px] font-semibold text-white">Benefits</h3>
                <ul className="mt-2.5 list-disc space-y-1.5 pl-4 text-[12px] leading-relaxed text-[#999]">
                  {benefitItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {(consultation.whoItsFor || consultation.whoIsItFor) && (
              <div>
                <h3 className="text-[13px] font-semibold text-white">Who is it for?</h3>
                <p className="mt-2.5 text-[12px] leading-relaxed text-[#999]">
                  {consultation.whoItsFor || consultation.whoIsItFor}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-5 border-t border-white/10 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <div className="flex flex-wrap gap-5">
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex h-10 min-w-12 items-center justify-center rounded-md bg-[#151515] px-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
                  <Phone className="size-4 text-white" aria-hidden="true" />
                </div>
                <span className="text-[10px] text-[#5C5C5C]">Mode</span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="flex h-10 min-w-12 items-center justify-center rounded-md bg-[#151515] px-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
                  <Languages className="size-4 text-white" aria-hidden="true" />
                </div>
                <span className="text-[10px] text-[#5C5C5C]">{primaryLanguage}</span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="flex h-10 min-w-12 items-center justify-center rounded-md bg-[#151515] px-4 text-[11px] font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
                  {followUpLabel}
                </div>
                <span className="text-[10px] text-[#5C5C5C]">FollowUps</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[12px] font-semibold text-white">Post-session requirement</p>
                <p className="mt-1 text-[12px] leading-relaxed text-[#999]">
                  {consultation.hasPostSessionMessage && consultation.postSessionMessage?.trim()
                    ? consultation.postSessionMessage
                    : 'Keep your requirements and questions ready.'}
                </p>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-white">Pre-session requirement</p>
                <p className="mt-1 text-[12px] leading-relaxed text-[#999]">
                  {consultation.hasPreSessionRequirement &&
                  consultation.preSessionRequirement?.trim()
                    ? consultation.preSessionRequirement
                    : 'Keep your requirements and questions ready.'}
                </p>
              </div>
            </div>

            {pricingOptions.length > 0 && (
              <div>
                <h3 className="mb-3 text-[12px] font-semibold text-white">
                  Duration &amp; Pricing
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {pricingOptions.map((option) => (
                    <span
                      key={`${option.durationMinutes}-${option.price ?? 'free'}`}
                      className="rounded-md border border-white/10 bg-[#151515] px-3.5 py-2 text-[11px] font-semibold text-white"
                    >
                      {option.durationMinutes}mins ({formatConsultationPrice(option)})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-xl border border-white/5 bg-[#111111] p-5">
          <div className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-white">
            <History className="text-brand-accent size-4" aria-hidden="true" />
            <h3>Internal Notes</h3>
          </div>
          <div className="min-h-[120px] rounded-lg border border-white/5 bg-black p-4 text-[12px] text-[#777]">
            {consultation.adminNote?.trim() || 'No notes yet.'}
            {escalation?.escalatedByName ? (
              <p className="mt-3 text-[11px] text-[#999]">
                Escalated by {escalation.escalatedByName}
                {escalation.escalatedToName ? ` to ${escalation.escalatedToName}` : ''}.
                {escalation.escalationNote ? ` Note: ${escalation.escalationNote}` : ''}
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#111111] p-5">
          <DecisionControlsHeader className="mb-4" />
          {showApprovalControls ? (
            <DecisionControlButtons
              onApprove={() => openDecisionModal('approve')}
              onRequestChanges={() => openDecisionModal('requestChanges')}
              onEscalate={() => openDecisionModal('escalate')}
              onReject={() => openDecisionModal('reject')}
              showEscalate={isSuperAdmin}
              escalateDisabled={escalateDisabled}
            />
          ) : (
            <p className="rounded-md border border-white/5 bg-black px-3 py-2 text-[11px] font-medium text-[#999]">
              This consultation is currently{' '}
              <span className="font-bold text-white">{consultation.status || '—'}</span>.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
