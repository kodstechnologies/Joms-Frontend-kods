import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { PageBreadcrumb } from '@/shared/components/navigation/page-breadcrumb'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Banknote,
  CircleUserRound,
  FileText,
  History,
  ShieldCheck,
  User,
} from 'lucide-react'
import digilockerVerifiedIcon from '@/assets/digilocker-verified.png'

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
  isKycSubmittedForApplication,
  isSubmittedKycStatus,
  resolveExpertServiceCategoryDisplay,
} from '../../utils/expert-application-helpers'
import type { ApplicationStatus, DocumentStatusPayload } from '../../type/expert-application-view'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import { MODERATION_CATEGORY_SLUGS } from '@/modules/settings/api/templates-api'
import {
  useModerationReasonOptions,
  useRecordModerationReasonUsage,
} from '@/modules/settings/hooks/use-templates'
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
import { areUploadedDocumentsApproved } from '../../utils/document-review'
import { cn } from '@/shared/lib/cn'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { apiErrorMessage as getApiErrorMessage } from '@/shared/lib/api-error'
import { formatDateTimeEnUsApplication as formatDateTime } from '@/shared/lib/format-datetime'

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

const getApiErrorStatus = (error: unknown) => {
  const err = error as { response?: { status?: number } }
  return err?.response?.status
}

const displayValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'string' && !value.trim()) return 'N/A'
  return String(value)
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
    <div className="bg-brand-surface rounded-xl border border-white/5 p-5">
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
  const [searchParams] = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const isSuperAdmin = Boolean(user?.isSuperAdmin)

  const tabFromQuery = searchParams.get('tab')
  const initialTab: TabKey =
    tabFromQuery === 'banking' || tabFromQuery === 'kyc' || tabFromQuery === 'overview'
      ? tabFromQuery
      : 'overview'

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab)
  const [syncedQueryTab, setSyncedQueryTab] = useState(`${id}:${tabFromQuery}`)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalVariant, setModalVariant] = useState<DecisionVariant>('approve')
  const [modalTarget, setModalTarget] = useState<DecisionTarget>('kyc')
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [rejectionReason, setRejectionReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [selectedEscalationOption, setSelectedEscalationOption] = useState('')
  const [confirmationChecked, setConfirmationChecked] = useState(false)
  const [viewerDocument, setViewerDocument] = useState<ViewerDocument | null>(null)

  const queryTabKey = `${id}:${tabFromQuery}`
  if (queryTabKey !== syncedQueryTab) {
    setSyncedQueryTab(queryTabKey)
    if (tabFromQuery === 'banking' || tabFromQuery === 'kyc' || tabFromQuery === 'overview') {
      setActiveTab(tabFromQuery)
    }
  }

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
  const recordReasonUsage = useRecordModerationReasonUsage()
  const { options: rejectReasonOptions, buildPayload: buildRejectReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.rejectExpert)
  const { options: requestChangesReasonOptions, buildPayload: buildRequestChangesReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.requestChangesExpert)

  useEffect(() => {
    if (!id || isSuperAdmin) return
    startEscalationReviewMutate()
  }, [id, isSuperAdmin, startEscalationReviewMutate])

  const decisionTargetForTab: DecisionTarget = activeTab === 'banking' ? 'banking' : 'kyc'

  const isKycSubmitted = isKycSubmittedForApplication(application?.expert, application?.kyc)
  const isBankingSubmitted = isSubmittedKycStatus(application?.banking?.status)
  const displayKycStatus = getDisplayKycStatus(application?.expert, application?.kyc)
  const showKycDetails = isKycSubmitted

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
          applicationUrl: `/experts/management/application/${id}`,
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

    const reasonPayload =
      modalVariant === 'requestChanges'
        ? buildRequestChangesReasonPayload(selectedReasons)
        : buildRejectReasonPayload(selectedReasons)

    if (isRejectFlow && reasonPayload.selectedReasons.length === 0) {
      return toast.error('Selected reasons are no longer available. Please refresh and try again.')
    }

    const payload =
      modalVariant === 'approve'
        ? { status: 'APPROVED' as const, adminNote: adminNotes.trim() }
        : {
            status: 'REJECTED' as const,
            reasonFor: reasonPayload.selectedReasons,
            rejectionReason: rejectionReason.trim() || reasonPayload.reasonDetails,
            adminNote: adminNotes.trim() || undefined,
          }

    mutation.mutate(payload, {
      onSuccess: () => {
        if (isRejectFlow && reasonPayload.reasonIds.length > 0) {
          recordReasonUsage.mutate(reasonPayload.reasonIds)
        }
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
    if (viewerDocument.key === 'digilockerDocumentUrl') return

    const mutationFn =
      viewerDocument.target === 'banking' ? updateBankingDocument : updateKycDocument

    const isRejectFlow = variant === 'reject' || variant === 'requestChanges'

    if (payload.status === 'APPROVED') {
      mutationFn.mutate(
        { documentKey: viewerDocument.key, payload },
        {
          onSuccess: () => {
            toast.success('Document approved')
            setViewerDocument(null)
          },
          onError: (err) => toast.error(getApiErrorMessage(err)),
        },
      )
      return
    }

    const reasonPayload =
      variant === 'requestChanges'
        ? buildRequestChangesReasonPayload(payload.reasonFor)
        : buildRejectReasonPayload(payload.reasonFor)

    if (isRejectFlow && reasonPayload.selectedReasons.length === 0) {
      toast.error('Selected reasons are no longer available. Please refresh and try again.')
      return
    }

    const resolvedPayload: DocumentStatusPayload = {
      status: 'REJECTED',
      reasonFor: reasonPayload.selectedReasons,
      rejectionReason:
        payload.rejectionReason.trim() ||
        reasonPayload.reasonDetails ||
        reasonPayload.selectedReasons.join(', '),
      adminNote: payload.adminNote,
    }

    mutationFn.mutate(
      { documentKey: viewerDocument.key, payload: resolvedPayload },
      {
        onSuccess: () => {
          if (reasonPayload.reasonIds.length > 0) {
            recordReasonUsage.mutate(reasonPayload.reasonIds)
          }
          toast.success(
            variant === 'requestChanges' ? 'Document changes requested' : 'Document rejected',
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
    if (modalVariant === 'approve') return 'Confirm Expert KYC'
    if (modalVariant === 'requestChanges') return 'Request Changes – Expert KYC'
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
  const identity = application.expert?.identityVerification as
    | {
        panCardFile?: string
        gstCertificateFile?: string
        certificateFile?: string
        panNumber?: string
        gstAvailable?: boolean
        gstNumber?: string
        digilockerDocument?: string
        digilockerDocumentUrl?: string
        digilockerFile?: string
        digilockerUrl?: string
        aadhaarFile?: string
      }
    | undefined
  const kyc = application.kyc
  const banking = application.banking
  const digilocker = application.digilocker

  const kycPanUrl = kyc?.documents?.panCardUrl || identity?.panCardFile
  const kycGstUrl = kyc?.documents?.gstCertificateUrl || identity?.gstCertificateFile
  const kycCertificateUrl = kyc?.documents?.licenceOrCertificateUrl || identity?.certificateFile
  const kycSampleWorkUrl =
    kyc?.documents?.sampleWorkFileUrl ||
    profile?.sampleWorkFile ||
    kyc?.sampleWorkLink ||
    profile?.sampleWorkLink
  const cancelledChequeUrl = banking?.documents?.cancelledChequeUrl

  const resolveDigilockerPicture = () => {
    const raw =
      digilocker?.picture ||
      digilocker?.providerResponse?.user?.picture ||
      digilocker?.providerResponse?.picture
    if (!raw || typeof raw !== 'string') return undefined
    const trimmed = raw.trim()
    if (!trimmed) return undefined
    if (trimmed.startsWith('data:') || trimmed.startsWith('http')) return trimmed
    return `data:image/jpeg;base64,${trimmed}`
  }

  const digilockerPicture = resolveDigilockerPicture()

  const digilockerDocUrl =
    kyc?.documents?.digilockerDocumentUrl ||
    digilocker?.documentUrl ||
    digilocker?.fileUrl ||
    digilockerPicture ||
    (typeof digilocker?.eaadhaar === 'string' && digilocker.eaadhaar.startsWith('http')
      ? digilocker.eaadhaar
      : undefined) ||
    identity?.digilockerDocument ||
    identity?.digilockerDocumentUrl ||
    identity?.digilockerFile ||
    identity?.digilockerUrl ||
    identity?.aadhaarFile

  const digilockerVerifiedAt =
    digilocker?.verifiedAt ||
    digilocker?.updatedAt ||
    kyc?.updatedAt ||
    application.expert?.updatedAt

  const formatDocumentDate = (value?: string | null) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const getDocumentSizeLabel = (url?: string) => {
    if (!url) return null
    if (url.startsWith('data:')) {
      const base64Str = url.split(',')[1] || ''
      const bytes = Math.round((base64Str.length * 3) / 4)
      if (!bytes || bytes <= 0) return null
      if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`
      }
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }
    return null
  }

  const digilockerDate = formatDocumentDate(digilockerVerifiedAt)
  const isPdf = digilockerDocUrl?.toLowerCase().includes('.pdf')
  const docType = isPdf ? 'PDF' : 'JPG'
  const dynamicSize = getDocumentSizeLabel(digilockerDocUrl)
  const digilockerMeta = [docType, dynamicSize, digilockerDate].filter(Boolean).join(' • ')

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

  const kycDocsApproved = areUploadedDocumentsApproved([
    { uploaded: kycPanUrl, status: getKycReviewStatus('panCardUrl') },
    { uploaded: kycGstUrl, status: getKycReviewStatus('gstCertificateUrl') },
    { uploaded: kycCertificateUrl, status: getKycReviewStatus('licenceOrCertificateUrl') },
    {
      uploaded: kyc?.documents?.sampleWorkFileUrl,
      status: getKycReviewStatus('sampleWorkFileUrl'),
    },
  ])

  const bankingDocsApproved = areUploadedDocumentsApproved([
    { uploaded: cancelledChequeUrl, status: getBankingReviewStatus('cancelledChequeUrl') },
  ])

  const sectionDocsApproved =
    decisionTargetForTab === 'banking' ? bankingDocsApproved : kycDocsApproved

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
        <div className="pl-7">
          <PageBreadcrumb
            items={[
              { label: 'Expert Management', to: '/experts/management' },
              { label: 'Manage Experts', to: '/experts/management' },
              { label: displayValue(application.expert?.fullname), isActive: true },
            ]}
          />
        </div>
      </header>

      <div className="bg-brand-surface rounded-xl border border-white/5 p-6">
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
          {((kyc as { isExempt?: boolean })?.isExempt ||
            (kyc as { kycMandatory?: boolean })?.kycMandatory === false) && (
            <div className="border-brand-positive/30 bg-brand-positive/10 text-brand-positive flex items-center gap-2 rounded-xl border px-4 py-3 text-[13px]">
              <ShieldCheck className="size-4 shrink-0" />
              <span>KYC verification is exempted / not mandatory per platform settings.</span>
            </div>
          )}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SectionCard
              title="KYC Details"
              icon={<CircleUserRound className="size-4 text-white" />}
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
                <div>
                  <p className="text-muted text-[11px] font-medium tracking-wider uppercase">
                    GST Information
                  </p>
                  <div className="mt-1">
                    {(kyc?.hasGST ?? identity?.gstAvailable) ? (
                      <span className="bg-brand-positive/15 text-brand-positive inline-flex rounded-md px-2.5 py-0.5 text-xs font-semibold">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex rounded-md border border-red-900/40 bg-red-950/50 px-2.5 py-0.5 text-xs font-semibold text-red-400">
                        No
                      </span>
                    )}
                  </div>
                </div>
                <InfoField label="GST Number" value={kyc?.gstNumber || identity?.gstNumber} />
              </div>
            </SectionCard>
            <div className="flex flex-col gap-5">
              <SectionCard
                title="Digilocker Verified Document"
                icon={<CircleUserRound className="size-4 text-white" />}
              >
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-black/60 p-3.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={digilockerVerifiedIcon}
                      alt="DigiLocker"
                      className="size-7 shrink-0 object-contain"
                    />
                    <div>
                      <p className="text-[13px] font-semibold text-white">Document</p>
                      <p className="text-[11px] text-white/45">{digilockerMeta}</p>
                    </div>
                  </div>
                  {digilockerDocUrl ? (
                    <button
                      type="button"
                      onClick={() =>
                        openDocumentViewer({
                          key: 'digilockerDocumentUrl',
                          label: 'Digilocker Verified Document',
                          url: digilockerDocUrl,
                          target: 'kyc',
                          reviewStatus: null,
                        })
                      }
                      className="text-body-sm cursor-pointer font-medium text-white/80 transition-colors hover:text-white"
                    >
                      View
                    </button>
                  ) : (
                    <span className="text-body-sm text-white/45">Not uploaded</span>
                  )}
                </div>
              </SectionCard>
              <SectionCard
                title="Compliance & Declaration"
                icon={<CircleUserRound className="size-4 text-white" />}
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
                          : 'border border-red-900/40 bg-red-950/50 text-red-400',
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

      {activeTab === 'banking' && !isBankingSubmitted && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-200">
          Banking is not submitted by partner
        </div>
      )}

      {activeTab === 'banking' && isBankingSubmitted && (
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
          {activeSectionSubmitted && activeDecisionStatus === 'PENDING' && !sectionDocsApproved && (
            <p className="text-body-sm mb-4 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 font-medium text-amber-200">
              Approve each uploaded document before approving this section.
            </p>
          )}
          <DecisionControlButtons
            onApprove={() => openDecisionModal(decisionTargetForTab, 'approve')}
            onRequestChanges={() => openDecisionModal(decisionTargetForTab, 'requestChanges')}
            onEscalate={() => openDecisionModal(decisionTargetForTab, 'escalate')}
            onReject={() => openDecisionModal(decisionTargetForTab, 'reject')}
            showEscalate
            approveDisabled={decisionDisabled || !sectionDocsApproved}
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
              ? 'Are you sure you want to approve this expert KYC? The applicant will be notified via email.'
              : modalVariant === 'requestChanges'
                ? 'Are you sure you want to Request Changes to this expert KYC? The applicant will be notified via email.'
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
            ? modalVariant === 'requestChanges'
              ? requestChangesReasonOptions
              : rejectReasonOptions
            : []
        }
        selectedReasons={selectedReasons}
        onReasonToggle={toggleReason}
        reason={isRejectFlow ? rejectionReason : ''}
        onReasonChange={isRejectFlow ? setRejectionReason : undefined}
        reasonLabel={modalVariant === 'requestChanges' ? 'Request Changes' : 'Reason'}
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
        reasonOptions={rejectReasonOptions}
        requestChangesReasonOptions={requestChangesReasonOptions}
        actionsDisabled={
          !viewerDocument ||
          viewerDocument.key === 'digilockerDocumentUrl' ||
          (viewerDocument.target === 'banking'
            ? !isBankingSubmitted || application?.banking?.status !== 'PENDING'
            : !isKycSubmitted || displayKycStatus !== 'PENDING')
        }
        hideActions={viewerDocument?.key === 'digilockerDocumentUrl'}
        isSubmitting={updateKycDocument.isPending || updateBankingDocument.isPending}
        onClose={() => setViewerDocument(null)}
        onSubmitDecision={handleDocumentDecision}
      />
    </div>
  )
}
