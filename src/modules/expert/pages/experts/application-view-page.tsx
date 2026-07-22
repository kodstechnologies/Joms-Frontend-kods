import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Banknote,
  ClipboardList,
  FileText,
  History,
  ShieldCheck,
  User,
} from 'lucide-react'

import {
  useEscalateExpertApplication,
  useEscalationAssignees,
  useExpertApplicationView,
  useStartEscalationReviewOnView,
  useUpdateExpertBankingDocumentStatus,
  useUpdateExpertBankingStatus,
  useUpdateExpertKycDocumentStatus,
  useUpdateExpertKycStatus,
} from '../../hooks/use-expert-application-view'
import { useServiceCategoriesByType } from '../../hooks/use-service-categories'
import { useAdminEscalation } from '@/modules/my-tasks/hooks/use-admin-escalation'
import { formatApplicationExpertId } from './expert-list-shared-utils'
import {
  formatServiceTypeDisplay,
  getDisplayKycStatus,
  getExpertCurrentRole,
  getExpertServiceType,
  isAdminKycApproved,
  isKycSubmittedForApplication,
  resolveExpertServiceCategoryDisplay,
} from '../../utils/expert-application-helpers'
import type {
  ApplicationStatus,
  ConciergeRejectionReason,
  DocumentStatusPayload,
} from '../../type/expert-application-view'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import {
  DecisionControlButtons,
  DecisionControlsHeader,
} from '@/shared/components/decision-controls'
import {
  DocumentReviewViewer,
  ReviewableDocumentCard,
  type DocumentDecisionVariant,
  type DocumentReviewStatus,
} from '../../components/document-review-viewer'
import { cn } from '@/shared/lib/cn'
import { useAuthStore } from '@/modules/auth/store/auth-store'

type TabKey = 'overview' | 'kyc' | 'banking'
type DecisionVariant = 'approve' | 'reject' | 'requestChanges' | 'escalate'
type DecisionTarget = 'kyc' | 'banking'

type ViewerDocument = {
  key: string
  label: string
  url: string
  target: DecisionTarget
  reviewStatus?: DocumentReviewStatus | null
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'kyc', label: 'KYC Details' },
  { key: 'banking', label: 'Banking Details' },
]

const KYC_REJECT_REASONS: DecisionActionModalOption[] = [
  { label: 'Unclear Image', value: 'Reason1' },
  { label: 'Content Issue', value: 'Reason2' },
  { label: 'Invalid documents', value: 'Reason3' },
  { label: 'Invalid PAN', value: 'Reason4' },
  { label: 'Invalid GST', value: 'Reason5' },
]

const BANKING_REJECT_REASONS: DecisionActionModalOption[] = [
  { label: 'Unclear Image', value: 'Reason1' },
  { label: 'Content Issue', value: 'Reason2' },
  { label: 'Invalid documents', value: 'Reason3' },
  { label: 'Invalid PAN', value: 'Reason4' },
  { label: 'Invalid GST', value: 'Reason5' },
]

const getApiErrorMessage = (error: unknown) => {
  const err = error as {
    response?: { status?: number; data?: { message?: string } }
  }
  return err?.response?.data?.message || 'Something went wrong. Please try again.'
}

const getApiErrorStatus = (error: unknown) => {
  const err = error as { response?: { status?: number } }
  return err?.response?.status
}

const displayValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'string' && !value.trim()) return 'N/A'
  return String(value)
}

const formatDateTime = (value?: string | null) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function StatusPill({
  status,
  notSubmitted,
}: {
  status?: ApplicationStatus
  notSubmitted?: boolean
}) {
  if (notSubmitted) {
    return (
      <span className="text-body-sm text-muted rounded-md bg-white/5 px-3 py-1.5 font-semibold">
        Not Submitted
      </span>
    )
  }

  const className =
    status === 'APPROVED'
      ? 'bg-brand-positive/15 text-brand-positive'
      : status === 'REJECTED'
        ? 'bg-brand-danger/15 text-red-400'
        : 'bg-amber-500/15 text-amber-300'
  return (
    <span className={cn('text-body-sm rounded-md px-3 py-1.5 font-semibold', className)}>
      {displayValue(status || 'PENDING')}
    </span>
  )
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title?: string
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="bg-brand-bg rounded-xl border border-white/5 p-5">
      {title ? (
        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-white">
          {icon}
          <span>{title}</span>
        </div>
      ) : null}
      {children}
    </div>
  )
}

function InfoField({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-body-sm text-muted font-medium">{label}</p>
      <div className="mt-1 text-[13px] font-semibold text-white">{displayValue(value)}</div>
    </div>
  )
}

export function ExpertApplicationViewPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((state) => state.user)
  const isSuperAdmin = Boolean(user?.isSuperAdmin)

  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalVariant, setModalVariant] = useState<DecisionVariant>('approve')
  const [modalTarget, setModalTarget] = useState<DecisionTarget>('kyc')
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [rejectionReason, setRejectionReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [selectedEscalationOption, setSelectedEscalationOption] = useState('')
  const [confirmationChecked, setConfirmationChecked] = useState(false)
  const [viewerDocument, setViewerDocument] = useState<ViewerDocument | null>(null)

  const { data, isLoading, isError, error } = useExpertApplicationView(id)
  const { data: assigneesData } = useEscalationAssignees()
  const application = data?.data
  const expert = application?.expert
  const serviceType = getExpertServiceType(expert)
  const normalizedServiceType =
    serviceType.toLowerCase() === 'venue'
      ? 'venue'
      : serviceType.toLowerCase() === 'concierge'
        ? 'concierge'
        : ''
  const { data: categoriesResponse } = useServiceCategoriesByType(normalizedServiceType)

  const applicantServiceType = formatServiceTypeDisplay(serviceType)
  const applicantCurrentRole = getExpertCurrentRole(expert)
  const applicantServiceCategory = useMemo(
    () => resolveExpertServiceCategoryDisplay(expert, categoriesResponse?.data),
    [categoriesResponse?.data, expert],
  )

  const updateKyc = useUpdateExpertKycStatus(application?.kyc?._id, id)
  const updateBanking = useUpdateExpertBankingStatus(application?.banking?._id, id)
  const updateKycDocument = useUpdateExpertKycDocumentStatus(application?.kyc?._id, id)
  const updateBankingDocument = useUpdateExpertBankingDocumentStatus(application?.banking?._id, id)
  const escalateApplication = useEscalateExpertApplication(id)
  const startEscalationReview = useStartEscalationReviewOnView(id)
  const { mutate: startEscalationReviewMutate } = startEscalationReview
  const { data: escalationData } = useAdminEscalation('partner', id)

  useEffect(() => {
    if (!id || isSuperAdmin) return
    startEscalationReviewMutate()
  }, [id, isSuperAdmin, startEscalationReviewMutate])

  const decisionTargetForTab: DecisionTarget = activeTab === 'banking' ? 'banking' : 'kyc'

  const isKycSubmitted = isKycSubmittedForApplication(application?.expert, application?.kyc)
  const isBankingSubmitted = Boolean(application?.banking?._id)
  const displayKycStatus = getDisplayKycStatus(application?.expert, application?.kyc)
  const showKycDetails = Boolean(application?.kyc) || isAdminKycApproved(application?.expert)

  const activeSectionSubmitted =
    decisionTargetForTab === 'banking' ? isBankingSubmitted : isKycSubmitted

  const activeDecisionStatus =
    decisionTargetForTab === 'banking' ? application?.banking?.status : displayKycStatus

  const activeMutation = decisionTargetForTab === 'banking' ? updateBanking : updateKyc

  const mutation = modalTarget === 'banking' ? updateBanking : updateKyc

  const openDecisionModal = (target: DecisionTarget, variant: DecisionVariant) => {
    setModalTarget(target)
    setModalVariant(variant)
    setSelectedReasons([])
    setRejectionReason('')
    setAdminNotes('')
    setSelectedEscalationOption('')
    setConfirmationChecked(false)
    setModalOpen(true)
  }

  const toggleReason = (value: string) => {
    setSelectedReasons((current) =>
      current.includes(value) ? current.filter((reason) => reason !== value) : [...current, value],
    )
  }

  const handleSubmitDecision = () => {
    if (!application) return

    if (modalVariant === 'escalate') {
      if (!selectedEscalationOption) {
        return toast.error('Please select a sub-admin to assign.')
      }
      if (!adminNotes.trim()) {
        return toast.error('Admin notes are required.')
      }

      const selectedAssignee = assigneesData?.data.find(
        (item) => item.id === selectedEscalationOption,
      )
      escalateApplication.mutate(
        {
          assigneeSubAdminId: selectedEscalationOption,
          assigneeName: selectedAssignee?.fullname || '',
          adminNote: adminNotes.trim(),
          escalationTarget: modalTarget,
        },
        {
          onSuccess: () => {
            toast.success('Application assigned successfully')
            setModalOpen(false)
          },
          onError: (err) => toast.error(getApiErrorMessage(err)),
        },
      )
      return
    }

    const isRejectFlow = modalVariant === 'reject' || modalVariant === 'requestChanges'

    if (isRejectFlow) {
      if (selectedReasons.length === 0) return toast.error('Please select at least one reason.')
      if (!rejectionReason.trim()) return toast.error('Please provide a rejection reason.')
    }

    if (modalVariant === 'approve' && !confirmationChecked) {
      return toast.error('Please confirm that all details have been reviewed.')
    }

    if (!adminNotes.trim()) {
      return toast.error('Admin notes are required.')
    }

    const payload =
      modalVariant === 'approve'
        ? { status: 'APPROVED' as const, adminNote: adminNotes.trim() }
        : modalTarget === 'banking'
          ? {
              status: 'REJECTED' as const,
              reasonFor: selectedReasons as ConciergeRejectionReason[],
              rejectionReason: rejectionReason.trim(),
              adminNote: adminNotes.trim() || undefined,
            }
          : {
              status: 'REJECTED' as const,
              reasonFor: selectedReasons as ConciergeRejectionReason[],
              rejectionReason: rejectionReason.trim(),
              adminNote: adminNotes.trim(),
            }

    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(
          modalVariant === 'approve'
            ? 'Status updated to APPROVED'
            : modalVariant === 'requestChanges'
              ? 'Resubmission requested successfully'
              : 'Status updated to REJECTED',
        )
        setModalOpen(false)
      },
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  const handleDocumentDecision = (
    variant: DocumentDecisionVariant,
    payload: DocumentStatusPayload,
  ) => {
    if (!viewerDocument) return

    const mutationFn =
      viewerDocument.target === 'banking' ? updateBankingDocument : updateKycDocument

    mutationFn.mutate(
      { documentKey: viewerDocument.key, payload },
      {
        onSuccess: () => {
          toast.success(
            variant === 'approve'
              ? 'Document approved'
              : variant === 'requestChanges'
                ? 'Document changes requested'
                : 'Document rejected',
          )
          setViewerDocument(null)
        },
        onError: (err) => toast.error(getApiErrorMessage(err)),
      },
    )
  }

  const decisionDisabled =
    !activeSectionSubmitted || activeDecisionStatus !== 'PENDING' || activeMutation.isPending

  const escalateDisabled = activeDecisionStatus === 'APPROVED' || escalateApplication.isPending

  const modalTitle = useMemo(() => {
    if (modalVariant === 'approve') return 'Confirm Application'
    if (modalVariant === 'requestChanges') return 'Request Changes'
    if (modalVariant === 'escalate') return 'Escalate Application'
    return `Reject ${modalTarget === 'banking' ? 'Banking' : 'KYC'}`
  }, [modalTarget, modalVariant])

  const isRejectFlow = modalVariant === 'reject' || modalVariant === 'requestChanges'
  const isEscalateFlow = modalVariant === 'escalate'
  const escalationOptions: DecisionActionModalOption[] =
    assigneesData?.data.map((item) => ({
      label: `[${item.fullname}]`,
      value: item.id,
    })) ?? []

  const applicationNotes = useMemo(() => {
    const escalation = escalationData?.data
    const finalReview = application?.expert?.finalReview
    const source = escalation || finalReview

    if (!source?.escalationNote && !source?.escalatedToName) {
      return application?.expert?.finalReview?.internalNotes || 'No notes yet.'
    }

    const lines = [
      source.escalatedByName
        ? `Escalated by ${source.escalatedByName}${source.escalatedToName ? ` to ${source.escalatedToName}` : ''}.`
        : null,
      source.escalationNote ? `Note: ${source.escalationNote}` : null,
      finalReview?.internalNotes ? `Internal: ${finalReview.internalNotes}` : null,
    ].filter(Boolean)

    return lines.join('\n')
  }, [application?.expert?.finalReview, escalationData?.data])

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="border-brand-accent size-9 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    )
  }

  if (isError || !application) {
    const status = getApiErrorStatus(error)
    const message = getApiErrorMessage(error)

    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/experts/management')}
          className="group font-heading hover:text-brand-accent text-h3 flex w-fit items-center gap-2 font-bold text-white transition-colors"
        >
          <ArrowLeft className="size-5" />
          <span>Application View</span>
        </button>
        <div className="bg-brand-danger/10 rounded-lg border border-red-500/40 px-4 py-3 text-sm text-red-400">
          {status ? `[${status}] ` : ''}
          {message || 'Unable to load application view.'}
        </div>
        {status === 404 && (
          <p className="text-body-sm text-muted">
            Partner ID used: <span className="text-muted font-mono">{id}</span>. The API returns 404
            when the partner is not found, or when KYC or banking records are missing for this
            expert (partial data is not returned).
          </p>
        )}
      </div>
    )
  }

  const profile = application.expert?.basicProfile
  const identity = application.expert?.identityVerification
  const kyc = application.kyc
  const banking = application.banking

  const kycPanUrl = kyc?.documents?.panCardUrl || identity?.panCardFile
  const kycGstUrl = kyc?.documents?.gstCertificateUrl || identity?.gstCertificateFile
  const kycCertificateUrl = kyc?.documents?.licenceOrCertificateUrl || identity?.certificateFile
  const kycSampleWorkUrl =
    kyc?.documents?.sampleWorkFileUrl ||
    profile?.sampleWorkFile ||
    kyc?.sampleWorkLink ||
    profile?.sampleWorkLink
  const cancelledChequeUrl = banking?.documents?.cancelledChequeUrl

  const getKycReviewStatus = (key: string): DocumentReviewStatus | null => {
    const reviews = kyc?.documentReviews as
      | Record<string, { status?: DocumentReviewStatus }>
      | Map<string, { status?: DocumentReviewStatus }>
      | undefined
    if (!reviews) return null
    const entry =
      typeof (reviews as Map<string, unknown>).get === 'function'
        ? (reviews as Map<string, { status?: DocumentReviewStatus }>).get(key)
        : (reviews as Record<string, { status?: DocumentReviewStatus }>)[key]
    return entry?.status || null
  }

  const getBankingReviewStatus = (key: string): DocumentReviewStatus | null => {
    const reviews = banking?.documentReviews as
      | Record<string, { status?: DocumentReviewStatus }>
      | Map<string, { status?: DocumentReviewStatus }>
      | undefined
    if (!reviews) return null
    const entry =
      typeof (reviews as Map<string, unknown>).get === 'function'
        ? (reviews as Map<string, { status?: DocumentReviewStatus }>).get(key)
        : (reviews as Record<string, { status?: DocumentReviewStatus }>)[key]
    return entry?.status || null
  }

  const openDocumentViewer = (document: ViewerDocument) => {
    setViewerDocument(document)
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/experts/management')}
          className="group font-heading hover:text-brand-accent text-h3 flex w-fit items-center gap-2 font-bold tracking-tight text-white transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Application View</span>
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
          <span className="font-bold text-white">{displayValue(application.expert?.fullname)}</span>
        </div>
      </header>

      <div className="bg-brand-bg rounded-xl border border-white/5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {displayValue(application.expert?.fullname)}
            </h2>
            <p className="text-body-sm text-muted mt-1">
              Created {formatDateTime(application.expert?.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-muted text-[10px] font-medium tracking-wide uppercase">
                KYC
              </span>
              <StatusPill status={displayKycStatus} notSubmitted={!isKycSubmitted} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted text-[10px] font-medium tracking-wide uppercase">
                Banking
              </span>
              <StatusPill status={banking?.status} notSubmitted={!isBankingSubmitted} />
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-white/5 bg-black p-4">
            <p className="text-body-sm text-muted">Expert ID</p>
            <p className="mt-1 font-mono text-[13px] font-semibold text-white">
              {formatApplicationExpertId(application.expert?._id || id)}
            </p>
          </div>
          <div className="rounded-lg border border-white/5 bg-black p-4">
            <p className="text-body-sm text-muted">Submitted</p>
            <p className="mt-1 text-[13px] font-semibold text-white">
              {formatDateTime(application.expert?.createdAt)}
            </p>
          </div>
          <div className="rounded-lg border border-white/5 bg-black p-4">
            <p className="text-body-sm text-muted">Last Updated</p>
            <p className="mt-1 text-[13px] font-semibold text-white">
              {formatDateTime(application.expert?.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-brand-surface flex w-full items-center rounded-xl">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="hover:text-brand-accent relative flex-1 px-4 py-3.5 text-center text-[13px] font-semibold text-white transition-colors"
            >
              {tab.label}
              {isActive && (
                <span className="bg-brand-accent absolute bottom-2 left-1/2 h-[3px] w-10 -translate-x-1/2 rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {activeTab === 'overview' && (
        <SectionCard
          title="Applicant Information"
          icon={<User className="text-brand-accent size-4" />}
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <InfoField label="Full Name" value={application.expert?.fullname} />
            <InfoField label="Phone number" value={application.expert?.phone} />
            <InfoField label="Work Email" value={application.expert?.email} />
            <InfoField label="Service Type" value={applicantServiceType} />
            <InfoField label="Current role" value={applicantCurrentRole} />
            <InfoField label="Service Category" value={applicantServiceCategory} />
          </div>
        </SectionCard>
      )}

      {activeTab === 'kyc' && !showKycDetails && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-200">
          KYC is not submitted by partner
        </div>
      )}

      {activeTab === 'kyc' && showKycDetails && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SectionCard
              title="KYC Details"
              icon={<ClipboardList className="text-brand-accent size-4" />}
            >
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <InfoField
                  label="Individual Name / Organisation Name"
                  value={kyc?.legalName || application.expert?.fullname}
                />
                <InfoField label="State" value={kyc?.state || profile?.location} />
                <InfoField label="PAN Number" value={kyc?.panNumber || identity?.panNumber} />
                <InfoField
                  label="Sample Work Link"
                  value={kyc?.sampleWorkLink || profile?.sampleWorkLink}
                />
                <InfoField
                  label="GST Information"
                  value={(kyc?.hasGST ?? identity?.gstAvailable) ? 'Yes' : 'No'}
                />
                <InfoField label="GST Number" value={kyc?.gstNumber || identity?.gstNumber} />
              </div>
            </SectionCard>
            <SectionCard
              title="Compliance & Declaration"
              icon={<ShieldCheck className="text-brand-accent size-4" />}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-muted font-medium">
                    Filed last 2 years IT Returns
                  </span>
                  <span
                    className={cn(
                      'text-body-sm inline-flex rounded-md px-2.5 py-1 font-bold',
                      kyc?.itReturnsFiled
                        ? 'bg-brand-positive/15 text-brand-positive'
                        : 'bg-amber-500/15 text-amber-300',
                    )}
                  >
                    {kyc?.itReturnsFiled ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-muted font-medium">Undertaking Signed</span>
                  <span className="bg-brand-positive/15 text-body-sm text-brand-positive inline-flex rounded-md px-2.5 py-1 font-bold">
                    Yes
                  </span>
                </div>
              </div>
            </SectionCard>
          </div>
          <SectionCard
            title="Uploaded Documents"
            icon={<FileText className="text-brand-accent size-4" />}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <ReviewableDocumentCard
                label="PAN Card"
                url={kycPanUrl}
                reviewStatus={getKycReviewStatus('panCardUrl')}
                uploadedAt={kyc?.createdAt || kyc?.updatedAt}
                onView={() =>
                  kycPanUrl &&
                  openDocumentViewer({
                    key: 'panCardUrl',
                    label: 'PAN Card',
                    url: kycPanUrl,
                    target: 'kyc',
                    reviewStatus: getKycReviewStatus('panCardUrl'),
                  })
                }
              />
              <ReviewableDocumentCard
                label="GST Certificate"
                url={kycGstUrl}
                reviewStatus={getKycReviewStatus('gstCertificateUrl')}
                uploadedAt={kyc?.createdAt || kyc?.updatedAt}
                onView={() =>
                  kycGstUrl &&
                  openDocumentViewer({
                    key: 'gstCertificateUrl',
                    label: 'GST Certificate',
                    url: kycGstUrl,
                    target: 'kyc',
                    reviewStatus: getKycReviewStatus('gstCertificateUrl'),
                  })
                }
              />
              <ReviewableDocumentCard
                label="Certificate / License"
                url={kycCertificateUrl}
                reviewStatus={getKycReviewStatus('licenceOrCertificateUrl')}
                uploadedAt={kyc?.createdAt || kyc?.updatedAt}
                onView={() =>
                  kycCertificateUrl &&
                  openDocumentViewer({
                    key: 'licenceOrCertificateUrl',
                    label: 'Certificate / License',
                    url: kycCertificateUrl,
                    target: 'kyc',
                    reviewStatus: getKycReviewStatus('licenceOrCertificateUrl'),
                  })
                }
              />
              <ReviewableDocumentCard
                label="Sample Work"
                url={kycSampleWorkUrl}
                reviewStatus={getKycReviewStatus('sampleWorkFileUrl')}
                uploadedAt={kyc?.createdAt || kyc?.updatedAt}
                onView={() => {
                  const fileUrl = kyc?.documents?.sampleWorkFileUrl || profile?.sampleWorkFile
                  const previewUrl = fileUrl || kycSampleWorkUrl
                  if (!previewUrl) return
                  openDocumentViewer({
                    key: 'sampleWorkFileUrl',
                    label: 'Sample Work',
                    url: previewUrl,
                    target: 'kyc',
                    reviewStatus: getKycReviewStatus('sampleWorkFileUrl'),
                  })
                }}
              />
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === 'banking' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <SectionCard
            title="Account Information"
            icon={<Banknote className="text-brand-accent size-4" />}
          >
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <InfoField label="Beneficiary Name" value={banking?.beneficiaryName} />
              <InfoField label="Provided Name" value={banking?.providedName} />
              <InfoField label="Name Match Score" value={banking?.nameMatchScore} />
              <InfoField label="Account Type" value={banking?.accountType} />
              <InfoField label="Account Number" value={banking?.accountNumber} />
              <InfoField label="Bank Name" value={banking?.bankName} />
              <InfoField label="IFSC Code" value={banking?.ifscCode} />
            </div>
          </SectionCard>
          <SectionCard
            title="Bank Verification Document"
            icon={<FileText className="text-brand-accent size-4" />}
          >
            <ReviewableDocumentCard
              label="Cancelled Cheque"
              url={cancelledChequeUrl}
              reviewStatus={getBankingReviewStatus('cancelledChequeUrl')}
              uploadedAt={banking?.createdAt || banking?.updatedAt}
              onView={() =>
                cancelledChequeUrl &&
                openDocumentViewer({
                  key: 'cancelledChequeUrl',
                  label: 'Cancelled Cheque',
                  url: cancelledChequeUrl,
                  target: 'banking',
                  reviewStatus: getBankingReviewStatus('cancelledChequeUrl'),
                })
              }
            />
          </SectionCard>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard
          title="Application Notes"
          icon={<History className="text-brand-accent size-4" />}
        >
          <div className="text-body-sm text-muted rounded-lg border border-white/5 bg-black p-4 whitespace-pre-wrap">
            {applicationNotes}
          </div>
        </SectionCard>

        <SectionCard>
          <DecisionControlsHeader className="mb-4" />
          <p className="text-body-sm text-muted mb-3 font-medium">
            Reviewing:{' '}
            <span className="text-white">
              {decisionTargetForTab === 'banking' ? 'Banking Details' : 'KYC Details'}
            </span>
          </p>
          {!activeSectionSubmitted && (
            <p className="text-body-sm mb-4 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 font-medium text-amber-200">
              {decisionTargetForTab === 'banking' ? 'Banking' : 'KYC'} is not submitted by partner.
              Approve and reject actions are unavailable until submission.
            </p>
          )}
          {activeSectionSubmitted && activeDecisionStatus !== 'PENDING' && (
            <p className="text-body-sm text-muted mb-4 rounded-md border border-white/5 bg-black px-3 py-2 font-medium">
              {decisionTargetForTab === 'banking' ? 'Banking' : 'KYC'} is already{' '}
              {String(activeDecisionStatus).toLowerCase()}.
            </p>
          )}
          <DecisionControlButtons
            onApprove={() => openDecisionModal(decisionTargetForTab, 'approve')}
            onRequestChanges={() => openDecisionModal(decisionTargetForTab, 'requestChanges')}
            onEscalate={() => openDecisionModal(decisionTargetForTab, 'escalate')}
            onReject={() => openDecisionModal(decisionTargetForTab, 'reject')}
            showEscalate={isSuperAdmin}
            approveDisabled={decisionDisabled}
            requestChangesDisabled={decisionDisabled}
            escalateDisabled={escalateDisabled}
            rejectDisabled={decisionDisabled}
          />
        </SectionCard>
      </div>

      <DecisionActionModal
        open={modalOpen}
        variant={modalVariant}
        title={modalTitle}
        description={
          modalVariant === 'escalate'
            ? 'Are you sure you want to escalate this application? This post will be reviewed by the selected parties.'
            : modalVariant === 'approve'
              ? 'Are you sure you want to approve this application? The applicant will be notified via email.'
              : modalVariant === 'requestChanges'
                ? 'Are you sure you want to Request Changes to this application? The applicant will be notified via email.'
                : `Are you sure you want to reject this ${modalTarget === 'banking' ? 'banking' : 'KYC'} section?`
        }
        submitLabel={
          modalVariant === 'escalate'
            ? 'Escalate'
            : modalVariant === 'approve'
              ? 'Confirm Approval'
              : modalVariant === 'requestChanges'
                ? 'Request Changes'
                : 'Reject'
        }
        reasonOptions={
          isRejectFlow
            ? modalTarget === 'banking'
              ? BANKING_REJECT_REASONS
              : KYC_REJECT_REASONS
            : []
        }
        selectedReasons={selectedReasons}
        onReasonToggle={toggleReason}
        reason={isRejectFlow ? rejectionReason : ''}
        onReasonChange={isRejectFlow ? setRejectionReason : undefined}
        confirmationLabel={
          modalVariant === 'approve'
            ? 'By approving this application, you confirm that all details have been reviewed.'
            : undefined
        }
        confirmationChecked={confirmationChecked}
        onConfirmationChange={modalVariant === 'approve' ? setConfirmationChecked : undefined}
        escalationOptions={isEscalateFlow ? escalationOptions : []}
        selectedEscalationOption={isEscalateFlow ? selectedEscalationOption : undefined}
        onEscalationOptionChange={isEscalateFlow ? setSelectedEscalationOption : undefined}
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitDecision}
        isSubmitting={isEscalateFlow ? escalateApplication.isPending : mutation.isPending}
      />

      <DocumentReviewViewer
        open={Boolean(viewerDocument)}
        url={viewerDocument?.url || ''}
        filename={viewerDocument?.label || 'Document'}
        reviewStatus={viewerDocument?.reviewStatus}
        reasonOptions={
          viewerDocument?.target === 'banking' ? BANKING_REJECT_REASONS : KYC_REJECT_REASONS
        }
        isSubmitting={updateKycDocument.isPending || updateBankingDocument.isPending}
        onClose={() => setViewerDocument(null)}
        onSubmitDecision={handleDocumentDecision}
      />
    </div>
  )
}
