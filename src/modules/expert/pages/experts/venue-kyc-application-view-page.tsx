import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Banknote,
  ClipboardList,
  ExternalLink,
  FileText,
  History,
  ImageOff,
  ShieldCheck,
  User,
} from 'lucide-react'

import {
  useApplicationDetails,
  useUpdateVenueBankingDocumentStatus,
  useUpdateVenueBankingStatus,
  useUpdateVenueKycDocumentStatus,
  useUpdateVenueKycStatus,
} from '../../hooks/use-venue-kyc'
import {
  useEscalateExpertApplication,
  useEscalationAssignees,
  useStartEscalationReviewOnView,
} from '../../hooks/use-expert-application-view'
import { useAdminEscalation } from '@/modules/my-tasks/hooks/use-admin-escalation'
import type {
  ApplicationKycDocuments,
  VenueKycStatus,
  VenueKycStatusPayload,
} from '../../type/venue-kyc'
import {
  DecisionControlButtons,
  DecisionControlsHeader,
} from '@/shared/components/decision-controls'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import {
  DocumentReviewViewer,
  ReviewableDocumentCard,
  type DocumentDecisionVariant,
  type DocumentReviewStatus,
} from '../../components/document-review-viewer'
import { areUploadedDocumentsApproved } from '../../utils/document-review'
import { cn } from '@/shared/lib/cn'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { formatApplicationExpertId } from './expert-list-format'
import { fetchVenueKycByPartnerId } from '../../api/venue-kyc-api'
import { getVenueKycApplicationPath } from '../../utils/expert-application-navigation'
import { MODERATION_CATEGORY_SLUGS } from '@/modules/settings/api/templates-api'
import {
  useModerationReasonOptions,
  useRecordModerationReasonUsage,
} from '@/modules/settings/hooks/use-templates'
import { apiErrorMessage as getApiErrorMessage } from '@/shared/lib/api-error'
import { formatDateTimeEnUsApplication24h as formatDateTime } from '@/shared/lib/format-datetime'

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

const displayValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'string' && !value.trim()) return 'N/A'
  return String(value)
}

const formatRelativeApplied = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'Applied today'
  if (days === 1) return 'Applied 1 day ago'
  return `Applied ${days} days ago`
}

const getDocumentMeta = (url?: string | null) => {
  if (!url) return 'Not uploaded'
  const extension = url.split('?')[0]?.split('.').pop()?.toUpperCase()
  const type = extension && extension.length <= 5 ? extension : 'PDF'
  return `${type} Document`
}

function StatusPill({ status, label }: { status?: VenueKycStatus | null; label?: string | null }) {
  const className =
    status === 'APPROVED'
      ? 'bg-brand-positive/20 text-brand-positive'
      : status === 'REJECTED'
        ? 'bg-brand-danger/20 text-brand-danger'
        : status === 'DRAFT'
          ? 'bg-white/10 text-muted'
          : 'bg-brand-accent/15 text-brand-accent'

  const displayLabel = label || (status === 'DRAFT' ? 'Not Submitted' : status) || 'PENDING'

  return (
    <span className={cn('text-body-sm rounded-md px-3 py-1.5 font-semibold', className)}>
      {displayValue(displayLabel)}
    </span>
  )
}

function YesNoBadge({ value }: { value?: boolean | null }) {
  if (value === null || value === undefined) {
    return (
      <span className="text-body-sm text-muted inline-flex rounded-md bg-white/5 px-2.5 py-1 font-bold">
        N/A
      </span>
    )
  }

  return (
    <span
      className={cn(
        'text-body-sm inline-flex rounded-md px-2.5 py-1 font-bold',
        value ? 'bg-brand-positive/20 text-brand-positive' : 'bg-brand-danger/20 text-brand-danger',
      )}
    >
      {value ? 'Yes' : 'No'}
    </span>
  )
}

function SectionCard({
  title,
  icon,
  children,
  className,
}: {
  title: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('bg-brand-bg rounded-xl border border-white/5 p-5', className)}>
      <div className="text-body-md mb-5 flex items-center gap-2 font-semibold text-white">
        {icon}
        <h3>{title}</h3>
      </div>
      {children}
    </div>
  )
}

function InfoField({
  label,
  value,
  children,
}: {
  label: string
  value?: string | number | null
  children?: ReactNode
}) {
  return (
    <div className="min-w-0">
      <p className="text-body-sm text-muted font-medium">{label}</p>
      <div className="mt-1.5 text-[13px] font-semibold text-white">
        {children ?? displayValue(value)}
      </div>
    </div>
  )
}

function VenueImage({ src, alt }: { src: string; alt: string }) {
  const [errored, setErrored] = useState(false)

  if (errored) {
    return (
      <div className="text-muted flex aspect-square items-center justify-center rounded-xl border border-white/5 bg-black">
        <ImageOff className="size-5" />
      </div>
    )
  }

  return (
    <a
      href={src}
      target="_blank"
      rel="noreferrer"
      className="block aspect-square overflow-hidden rounded-xl border border-white/5 bg-black"
    >
      <img
        src={src}
        alt={alt}
        className="size-full object-cover"
        loading="lazy"
        onError={() => setErrored(true)}
      />
    </a>
  )
}

export function VenueKycApplicationViewPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const isSuperAdmin = Boolean(user?.isSuperAdmin)
  const [isResolvingPartnerKyc, setIsResolvingPartnerKyc] = useState(false)

  const tabFromQuery = searchParams.get('tab')
  const initialTab: TabKey =
    tabFromQuery === 'banking' || tabFromQuery === 'kyc' || tabFromQuery === 'overview'
      ? tabFromQuery
      : 'overview'

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalVariant, setModalVariant] = useState<DecisionVariant>('approve')
  const [modalTarget, setModalTarget] = useState<DecisionTarget>('kyc')
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [rejectionReason, setRejectionReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [selectedEscalationOption, setSelectedEscalationOption] = useState('')
  const [confirmationChecked, setConfirmationChecked] = useState(false)
  const [viewerDocument, setViewerDocument] = useState<ViewerDocument | null>(null)

  useEffect(() => {
    if (tabFromQuery === 'banking' || tabFromQuery === 'kyc' || tabFromQuery === 'overview') {
      setActiveTab(tabFromQuery)
    }
  }, [tabFromQuery, id])

  const { data, isLoading, isError, error } = useApplicationDetails(id)
  const { data: assigneesData } = useEscalationAssignees()
  const application = data?.data
  const partnerId = application?.header?.partnerId ?? undefined

  useEffect(() => {
    if (!id || !isError) return
    const status = (error as { response?: { status?: number } })?.response?.status
    if (status !== 404) return

    let cancelled = false
    setIsResolvingPartnerKyc(true)

    fetchVenueKycByPartnerId(id)
      .then((response) => {
        const kycId = String(response?.data?._id || '').trim()
        if (cancelled) return
        if (kycId && kycId !== id) {
          navigate(getVenueKycApplicationPath(kycId), { replace: true })
          return
        }
        setIsResolvingPartnerKyc(false)
      })
      .catch(() => {
        if (!cancelled) setIsResolvingPartnerKyc(false)
      })

    return () => {
      cancelled = true
    }
  }, [error, id, isError, navigate])

  const updateKyc = useUpdateVenueKycStatus(id)
  const updateBanking = useUpdateVenueBankingStatus(id)
  const updateKycDocument = useUpdateVenueKycDocumentStatus(id)
  const updateBankingDocument = useUpdateVenueBankingDocumentStatus(id)
  const escalateApplication = useEscalateExpertApplication(partnerId)
  const startEscalationReview = useStartEscalationReviewOnView(partnerId)
  const { mutate: startEscalationReviewMutate } = startEscalationReview
  const { data: escalationData } = useAdminEscalation('partner', partnerId)
  const recordReasonUsage = useRecordModerationReasonUsage()
  const { options: rejectReasonOptions, buildPayload: buildRejectReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.rejectVenue)
  const { options: requestChangesReasonOptions, buildPayload: buildRequestChangesReasonPayload } =
    useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.requestChangesVenue)

  useEffect(() => {
    if (!partnerId || isSuperAdmin) return
    startEscalationReviewMutate()
  }, [partnerId, isSuperAdmin, startEscalationReviewMutate])

  const decisionTargetForTab: DecisionTarget = activeTab === 'banking' ? 'banking' : 'kyc'

  const activeDecisionStatus =
    decisionTargetForTab === 'banking'
      ? application?.bankingDetails.status
      : application?.kycDetails.status

  const activeMutationPending =
    decisionTargetForTab === 'banking' ? updateBanking.isPending : updateKyc.isPending

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

  const isRejectFlow = modalVariant === 'reject' || modalVariant === 'requestChanges'

  const handleSubmitDecision = () => {
    if (!application) return

    if (modalVariant === 'escalate') {
      if (!selectedEscalationOption) {
        toast.error('Please select a sub-admin to assign.')
        return
      }
      if (!adminNotes.trim()) {
        toast.error('Admin notes are required.')
        return
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
          applicationUrl: `/experts/management/application/${id}?source=venue_kyc`,
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

    if (isRejectFlow) {
      if (selectedReasons.length === 0) {
        toast.error('Please select at least one reason.')
        return
      }
      if (modalVariant === 'reject' && !confirmationChecked) {
        toast.error('Please confirm the documents are not approved.')
        return
      }
      if (modalVariant === 'requestChanges' && !rejectionReason.trim()) {
        toast.error('Please provide a request changes reason.')
        return
      }
    }

    if (modalVariant === 'approve' && !confirmationChecked) {
      toast.error('Please confirm that all details have been reviewed.')
      return
    }

    if (!adminNotes.trim()) {
      toast.error('Admin notes are required.')
      return
    }

    const reasonPayload =
      modalVariant === 'requestChanges'
        ? buildRequestChangesReasonPayload(selectedReasons)
        : buildRejectReasonPayload(selectedReasons)

    if (isRejectFlow && reasonPayload.selectedReasons.length === 0) {
      toast.error('Selected reasons are no longer available. Please refresh and try again.')
      return
    }

    const resolvedRejectionReason =
      modalVariant === 'requestChanges'
        ? rejectionReason.trim() || reasonPayload.reasonDetails
        : reasonPayload.selectedReasons.join(', ')

    if (modalTarget === 'banking') {
      const payload =
        modalVariant === 'approve'
          ? { status: 'APPROVED' as const, adminNote: adminNotes.trim() }
          : {
              status: 'REJECTED' as const,
              reasonFor: reasonPayload.selectedReasons,
              rejectionReason: resolvedRejectionReason,
              adminNote: adminNotes.trim(),
            }

      updateBanking.mutate(payload, {
        onSuccess: () => {
          if (isRejectFlow && reasonPayload.reasonIds.length > 0) {
            recordReasonUsage.mutate(reasonPayload.reasonIds)
          }
          toast.success(
            modalVariant === 'approve'
              ? 'Banking details approved successfully'
              : modalVariant === 'requestChanges'
                ? 'Resubmission requested for banking details'
                : 'Banking details rejected successfully',
          )
          setModalOpen(false)
        },
        onError: (err) => toast.error(getApiErrorMessage(err)),
      })
      return
    }

    if (modalVariant === 'approve') {
      updateKyc.mutate(
        { status: 'APPROVED', adminNote: adminNotes.trim() },
        {
          onSuccess: () => {
            toast.success('Venue KYC approved successfully')
            setModalOpen(false)
          },
          onError: (err) => toast.error(getApiErrorMessage(err)),
        },
      )
      return
    }

    updateKyc.mutate(
      {
        status: 'REJECTED',
        reasonFor: reasonPayload.selectedReasons,
        rejectionReason: resolvedRejectionReason,
        adminNote: adminNotes.trim(),
      },
      {
        onSuccess: () => {
          if (isRejectFlow && reasonPayload.reasonIds.length > 0) {
            recordReasonUsage.mutate(reasonPayload.reasonIds)
          }
          toast.success(
            modalVariant === 'requestChanges'
              ? 'Resubmission requested successfully'
              : 'Venue KYC rejected successfully',
          )
          setModalOpen(false)
        },
        onError: (err) => toast.error(getApiErrorMessage(err)),
      },
    )
  }

  const handleDocumentDecision = (
    variant: DocumentDecisionVariant,
    payload: VenueKycStatusPayload,
  ) => {
    if (!viewerDocument) return

    const mutationFn =
      viewerDocument.target === 'banking' ? updateBankingDocument : updateKycDocument

    const isRejectFlow = variant === 'reject' || variant === 'requestChanges'
    const reasonPayload = isRejectFlow
      ? variant === 'requestChanges'
        ? buildRequestChangesReasonPayload(payload.reasonFor || [])
        : buildRejectReasonPayload(payload.reasonFor || [])
      : null

    if (isRejectFlow && (!reasonPayload || reasonPayload.selectedReasons.length === 0)) {
      toast.error('Selected reasons are no longer available. Please refresh and try again.')
      return
    }

    const resolvedPayload: VenueKycStatusPayload =
      payload.status === 'APPROVED'
        ? payload
        : {
            ...payload,
            reasonFor: reasonPayload!.selectedReasons,
            rejectionReason:
              payload.rejectionReason?.trim() ||
              reasonPayload!.reasonDetails ||
              reasonPayload!.selectedReasons.join(', '),
          }

    mutationFn.mutate(
      { documentKey: viewerDocument.key, payload: resolvedPayload },
      {
        onSuccess: () => {
          if (reasonPayload && reasonPayload.reasonIds.length > 0) {
            recordReasonUsage.mutate(reasonPayload.reasonIds)
          }
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

  const isBankingSubmitted = ['PENDING', 'APPROVED', 'REJECTED'].includes(
    application?.bankingDetails?.status || application?.header?.bankingStatus || '',
  )

  const decisionDisabled =
    (decisionTargetForTab === 'banking' && !isBankingSubmitted) ||
    activeDecisionStatus !== 'PENDING' ||
    activeMutationPending

  const escalateDisabled = activeDecisionStatus === 'APPROVED' || escalateApplication.isPending

  const modalTitle = useMemo(() => {
    if (modalVariant === 'approve') return 'Confirm Venue KYC'
    if (modalVariant === 'requestChanges') return 'Request Changes – Venue KYC'
    if (modalVariant === 'escalate') return 'Escalate Application'
    return 'Reject Application'
  }, [modalVariant])

  const notesContent = useMemo(() => {
    const escalation = escalationData?.data
    const lines = [
      application?.overview?.applicationNotes?.trim() || null,
      escalation?.escalatedByName
        ? `Escalated by ${escalation.escalatedByName}${escalation.escalatedToName ? ` to ${escalation.escalatedToName}` : ''}.`
        : null,
      escalation?.escalationNote ? `Note: ${escalation.escalationNote}` : null,
    ].filter(Boolean)

    return lines.length ? lines.join('\n') : 'No notes yet.'
  }, [application?.overview?.applicationNotes, escalationData?.data])

  const isSubmitting =
    modalVariant === 'escalate'
      ? escalateApplication.isPending
      : modalTarget === 'banking'
        ? updateBanking.isPending
        : updateKyc.isPending
  const isEscalateFlow = modalVariant === 'escalate'
  const escalationOptions: DecisionActionModalOption[] =
    assigneesData?.data.map((item) => ({
      label: `[${item.fullname}]`,
      value: item.id,
    })) ?? []

  if (isLoading || isResolvingPartnerKyc) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="border-brand-accent size-9 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    )
  }

  if (isError || !application) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/experts/management')}
          className="group font-heading hover:text-brand-accent text-h3 flex w-fit items-center gap-2 font-bold text-white transition-colors"
        >
          <ArrowLeft className="size-5" />
          <span>Venue Application View</span>
        </button>
        <div className="bg-brand-danger/10 rounded-lg border border-red-500/40 px-4 py-3 text-sm text-red-400">
          {getApiErrorMessage(error)}
        </div>
      </div>
    )
  }

  const { header, overview, kycDetails, bankingDetails } = application
  const applicant = overview.applicant
  const venue = overview.venue
  const documents = kycDetails.documents
  const compliance = kycDetails.compliance
  const account = bankingDetails.account
  const otherCertificates = documents?.otherCertificates || []
  const venueImages = overview.venueImages || []

  const applicantName = header.applicantName || applicant?.fullName || 'Venue Partner'
  const appliedLabel = formatRelativeApplied(header.appliedAt)

  const primaryDocDefs = [
    { label: 'PAN Card', key: 'panCard' },
    { label: 'GST Certificate', key: 'gstCertificate' },
    { label: 'Business Registration Certificate', key: 'businessRegistration' },
  ]

  const uploadedDocuments = primaryDocDefs
    .map((def) => {
      const docKey = def.key as keyof ApplicationKycDocuments
      const url = documents?.[docKey] as string | undefined
      return {
        label: def.label,
        key: def.key,
        url: url || null,
        reviewStatus: (kycDetails.documentReviews?.[def.key]?.status ||
          null) as DocumentReviewStatus | null,
      }
    })
    .filter((doc) => doc.url)

  if (uploadedDocuments.length === 0) {
    uploadedDocuments.push(
      {
        label: 'PAN Card',
        key: 'panCard',
        url: documents?.panCard || null,
        reviewStatus: (kycDetails.documentReviews?.panCard?.status ||
          null) as DocumentReviewStatus | null,
      },
      {
        label: 'GST Certificate',
        key: 'gstCertificate',
        url: documents?.gstCertificate || null,
        reviewStatus: (kycDetails.documentReviews?.gstCertificate?.status ||
          null) as DocumentReviewStatus | null,
      },
    )
  }

  const categoryDocDefs = [
    { label: 'Building Occupancy Certificate', key: 'occupancyCertificate' },
    { label: 'Fire Safety NOC', key: 'fireNoc' },
    { label: 'Data Security / Wi-Fi Compliance', key: 'wifiCompliance' },
    { label: 'Structural Stability Certificate', key: 'structuralStabilityCert' },
    { label: 'Cultural / Event Permission', key: 'culturalPermission' },
    { label: 'Public Assembly License', key: 'publicAssemblyLicense' },
    { label: 'Seating Capacity Certificate', key: 'seatingCapacityCert' },
    { label: 'Sports Facility Safety Certificate', key: 'sportsSafetyCert' },
    { label: 'Public Liability Insurance', key: 'publicLiabilityInsurance' },
    { label: 'Trade License', key: 'tradeLicense' },
    { label: 'FSSAI License', key: 'fssaiLicense' },
    { label: 'Property Lease Agreement', key: 'propertyLeaseAgreement' },
    { label: 'Authorized Signatory ID', key: 'authorizedSignatoryId' },
    { label: 'GST Undertaking', key: 'gstUndertakingDocument' },
  ]

  const otherDocuments: Array<{
    label: string
    key: string
    url?: string | null
    reviewStatus?: DocumentReviewStatus | null
  }> = []

  categoryDocDefs.forEach((def) => {
    const docKey = def.key as keyof ApplicationKycDocuments
    const url = documents?.[docKey] as string | undefined
    if (url) {
      otherDocuments.push({
        label: def.label,
        key: def.key,
        url,
        reviewStatus: (kycDetails.documentReviews?.[def.key]?.status ||
          null) as DocumentReviewStatus | null,
      })
    }
  })

  otherCertificates.forEach((certUrl, index) => {
    otherDocuments.push({
      label: `Other Certificate ${index + 1}`,
      key: 'otherCertificates',
      url: certUrl,
      reviewStatus: (kycDetails.documentReviews?.otherCertificates?.status ||
        null) as DocumentReviewStatus | null,
    })
  })

  const kycDocsApproved = areUploadedDocumentsApproved(
    [...uploadedDocuments, ...otherDocuments].map((doc) => ({
      uploaded: doc.url,
      status: doc.reviewStatus,
    })),
  )

  const bankingDocsApproved = areUploadedDocumentsApproved([
    {
      uploaded: isBankingSubmitted ? bankingDetails.cancelledCheque : null,
      status: bankingDetails.documentReviews?.cancelledCheque?.status || null,
    },
  ])

  const sectionDocsApproved =
    decisionTargetForTab === 'banking' ? bankingDocsApproved : kycDocsApproved

  const openDocumentViewer = (document: {
    key: string
    label: string
    url?: string | null
    reviewStatus?: DocumentReviewStatus | null
    target?: DecisionTarget
  }) => {
    if (!document.url) return
    setViewerDocument({
      key: document.key,
      label: document.label,
      url: document.url,
      target: document.target || 'kyc',
      reviewStatus: document.reviewStatus,
    })
  }

  return (
    <div className="relative flex w-full flex-col gap-5 pb-8 text-white">
      <header className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/experts/management')}
          className="group font-heading hover:text-brand-accent text-h3 flex w-fit items-center gap-2 font-bold tracking-tight text-white transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Venue Application View</span>
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
          <span>Manage Expert</span>
          <span className="text-muted">/</span>
          <span className="font-bold text-white">{applicantName}</span>
        </div>
      </header>

      <h2 className="text-body-lg font-semibold text-white">Application Details</h2>

      <div className="bg-brand-bg rounded-xl border border-white/5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-white">{applicantName}</h3>
              {header.partnerId && (
                <button
                  type="button"
                  onClick={() => navigate(`/experts/management/profile/${header.partnerId}`)}
                  className="hover:text-brand-accent text-muted rounded-md p-1 transition-colors hover:bg-white/5"
                  aria-label="Open expert profile"
                >
                  <ExternalLink className="size-4" />
                </button>
              )}
            </div>
            {appliedLabel && <p className="text-body-sm text-muted mt-1">{appliedLabel}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={header.kycStatus} label={header.kycStatusLabel} />
            <StatusPill
              status={header.bankingStatus}
              label={isBankingSubmitted ? header.bankingStatusLabel : 'Not Submitted'}
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-white/5 bg-black p-4">
            <p className="text-body-sm text-muted">Expert ID</p>
            <p className="mt-1 font-mono text-[13px] font-semibold text-white">
              {formatApplicationExpertId(header.partnerId || header.applicationId)}
            </p>
          </div>
          <div className="rounded-lg border border-white/5 bg-black p-4">
            <p className="text-body-sm text-muted">Submitted</p>
            <p className="mt-1 text-[13px] font-semibold text-white">
              {formatDateTime(header.submittedAt)}
            </p>
          </div>
          <div className="rounded-lg border border-white/5 bg-black p-4">
            <p className="text-body-sm text-muted">Last Updated</p>
            <p className="mt-1 text-[13px] font-semibold text-white">
              {formatDateTime(header.lastUpdatedAt)}
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
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SectionCard
              title="Applicant Information"
              icon={<User className="text-brand-accent size-4" />}
            >
              <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                <InfoField label="Full Name/Organization" value={applicant?.fullName} />
                <InfoField label="Phone number" value={applicant?.phone} />
                <InfoField label="Work Email" value={applicant?.email} />
                <InfoField label="Service Type" value={applicant?.serviceType || 'Venue'} />
                <InfoField label="Current role" value={applicant?.currentRole} />
                <InfoField label="Service Category" value={applicant?.serviceCategory || 'Venue'} />
              </div>
            </SectionCard>

            <SectionCard
              title="Venue Information"
              icon={<ClipboardList className="text-brand-accent size-4" />}
            >
              <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                <InfoField label="Venue Name" value={venue?.venueName} />
                <InfoField label="Venue Type" value={venue?.venueType} />
                <InfoField label="Address" value={venue?.address} />
                <InfoField label="City" value={venue?.city} />
                <InfoField label="Pincode" value={venue?.pincode} />
              </div>
            </SectionCard>
          </div>

          <SectionCard
            title="Venue Images"
            icon={<FileText className="text-brand-accent size-4" />}
          >
            {venueImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:max-w-[520px]">
                {venueImages.slice(0, 6).map((image, index) => (
                  <VenueImage key={`${image}-${index}`} src={image} alt={`Venue ${index + 1}`} />
                ))}
              </div>
            ) : (
              <p className="text-body-sm text-muted">No venue images uploaded.</p>
            )}
          </SectionCard>
        </div>
      )}

      {activeTab === 'kyc' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SectionCard
              title="KYC Details"
              icon={<ClipboardList className="text-brand-accent size-4" />}
            >
              <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                <InfoField
                  label="Individual Name / Organization Name"
                  value={kycDetails.individualOrOrgName}
                />
                <InfoField label="State" value={kycDetails.state} />
                <InfoField label="PAN Number" value={kycDetails.panNumber} />
                <InfoField label="Venue Type" value={kycDetails.venueType} />
                <InfoField label="GST Information">
                  <YesNoBadge value={kycDetails.hasGST} />
                </InfoField>
                <InfoField label="GST Number" value={kycDetails.gstNumber} />
                {kycDetails.address && <InfoField label="Address" value={kycDetails.address} />}
              </div>
            </SectionCard>

            <SectionCard
              title="Compliance & Declaration"
              icon={<ShieldCheck className="text-brand-accent size-4" />}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-body-sm text-muted font-medium">
                    Filed last 2 years IT Returns
                  </span>
                  <YesNoBadge value={compliance?.itReturnsFiledLast2Years} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-body-sm text-muted font-medium">Undertaking Signed</span>
                  <YesNoBadge value={compliance?.undertakingSigned} />
                </div>
                {compliance?.gstUndertakingDocument && (
                  <div className="rounded-lg border border-white/10 bg-white px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <FileText className="text-brand-danger size-4 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-body-sm truncate font-semibold text-black">
                          Undertaking Document
                        </p>
                        <p className="text-muted text-[10px]">
                          {getDocumentMeta(compliance.gstUndertakingDocument)}
                        </p>
                      </div>
                      <a
                        href={compliance.gstUndertakingDocument}
                        target="_blank"
                        rel="noreferrer"
                        className="text-body-sm text-brand-action ml-auto font-semibold hover:underline"
                      >
                        View
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>

          <SectionCard
            title="Uploaded Documents"
            icon={<FileText className="text-brand-accent size-4" />}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {uploadedDocuments.map((document) => (
                <ReviewableDocumentCard
                  key={document.label}
                  label={document.label}
                  url={document.url}
                  reviewStatus={document.reviewStatus}
                  uploadedAt={header.submittedAt || header.appliedAt}
                  onView={() => openDocumentViewer(document)}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Other Document"
            icon={<FileText className="text-brand-accent size-4" />}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherDocuments.map((document) => (
                <ReviewableDocumentCard
                  key={document.label}
                  label={document.label}
                  url={document.url}
                  reviewStatus={document.reviewStatus}
                  uploadedAt={header.submittedAt || header.appliedAt}
                  onView={() => openDocumentViewer(document)}
                />
              ))}
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
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <InfoField label="Beneficiary Name" value={account?.beneficiaryName} />
              <InfoField label="Account Type" value={account?.accountType} />
              <InfoField label="Bank Name" value={account?.bankName} />
              <InfoField label="Account Number" value={account?.accountNumber} />
              <InfoField label="IFSC Code" value={account?.ifscCode} />
              {isBankingSubmitted &&
                account?.providedName != null &&
                account.providedName !== '' && (
                  <InfoField label="Provided Name" value={account.providedName} />
                )}
              {isBankingSubmitted &&
                account?.nameMatchScore != null &&
                account.nameMatchScore !== '' && (
                  <InfoField label="Name Match Score" value={account.nameMatchScore} />
                )}
            </div>
          </SectionCard>

          <SectionCard
            title="Bank Verification Document"
            icon={<FileText className="text-brand-accent size-4" />}
          >
            <div className="max-w-sm">
              <ReviewableDocumentCard
                label="Cancelled Cheque"
                url={isBankingSubmitted ? bankingDetails.cancelledCheque : null}
                reviewStatus={
                  (bankingDetails.documentReviews?.cancelledCheque?.status ||
                    null) as DocumentReviewStatus | null
                }
                uploadedAt={header.submittedAt || header.appliedAt}
                onView={() =>
                  openDocumentViewer({
                    key: 'cancelledCheque',
                    label: 'Cancelled Cheque',
                    url: bankingDetails.cancelledCheque,
                    reviewStatus: (bankingDetails.documentReviews?.cancelledCheque?.status ||
                      null) as DocumentReviewStatus | null,
                    target: 'banking',
                  })
                }
              />
            </div>
          </SectionCard>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-brand-bg rounded-xl border border-white/5 p-5">
          <div className="text-body-md mb-4 flex items-center gap-2 font-semibold text-white">
            <History className="text-brand-accent size-4" aria-hidden="true" />
            <h3>Application Notes</h3>
          </div>
          <div className="text-body-sm text-muted min-h-[120px] rounded-lg border border-white/5 bg-black p-4 leading-relaxed whitespace-pre-wrap">
            {notesContent}
          </div>
        </div>

        <div className="bg-brand-bg rounded-xl border border-white/5 p-5">
          <DecisionControlsHeader className="mb-4" />

          {decisionTargetForTab === 'banking' && !isBankingSubmitted && (
            <p className="text-body-sm text-muted mb-4 rounded-md border border-white/5 bg-black px-3 py-2 font-medium">
              Banking has not been submitted yet. Approve and reject are available only after the
              partner submits banking details.
            </p>
          )}

          {activeDecisionStatus !== 'PENDING' &&
            !(decisionTargetForTab === 'banking' && !isBankingSubmitted) && (
              <p className="text-body-sm text-muted mb-4 rounded-md border border-white/5 bg-black px-3 py-2 font-medium">
                {decisionTargetForTab === 'banking' ? 'Banking' : 'KYC'} is already{' '}
                {String(activeDecisionStatus).toLowerCase()}.
              </p>
            )}

          {activeDecisionStatus === 'PENDING' &&
            !(decisionTargetForTab === 'banking' && !isBankingSubmitted) &&
            !sectionDocsApproved && (
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
        </div>
      </div>

      <DecisionActionModal
        open={modalOpen}
        variant={modalVariant}
        title={modalTitle}
        warning={
          modalVariant === 'reject'
            ? 'This action cannot be reversed. And it will impact the user'
            : undefined
        }
        description={
          modalVariant === 'escalate'
            ? 'Are you sure you want to escalate this Application? This Post will be reviewed by the selected parties.'
            : modalVariant === 'approve'
              ? 'Are you sure you want to approve this venue KYC? The applicant will be notified via email.'
              : modalVariant === 'requestChanges'
                ? 'Are you sure you want to Request Changes to this venue KYC? The applicant will be notified via email.'
                : 'Please select the reason to ask the user to re-submit the documents and go through verification again'
        }
        submitLabel={
          modalVariant === 'escalate'
            ? 'Escalate'
            : modalVariant === 'approve'
              ? 'Confirm Approval'
              : modalVariant === 'requestChanges'
                ? 'Request Changes'
                : 'Reject Approval'
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
        reason={modalVariant === 'requestChanges' ? rejectionReason : ''}
        onReasonChange={modalVariant === 'requestChanges' ? setRejectionReason : undefined}
        reasonLabel="Request Changes"
        confirmationLabel={
          modalVariant === 'approve'
            ? 'By approving this application, you confirm that all details have been reviewed.'
            : modalVariant === 'reject'
              ? 'I confirm the documents are not approved due to above reasons.'
              : undefined
        }
        confirmationChecked={confirmationChecked}
        onConfirmationChange={
          modalVariant === 'approve' || modalVariant === 'reject'
            ? setConfirmationChecked
            : undefined
        }
        escalationOptions={isEscalateFlow ? escalationOptions : []}
        selectedEscalationOption={isEscalateFlow ? selectedEscalationOption : undefined}
        onEscalationOptionChange={isEscalateFlow ? setSelectedEscalationOption : undefined}
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitDecision}
        isSubmitting={isSubmitting}
        submitIcon={modalVariant === 'reject' ? 'check' : undefined}
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
          (viewerDocument.target === 'banking'
            ? !isBankingSubmitted ||
              (application?.bankingDetails?.status || application?.header?.bankingStatus) !==
                'PENDING'
            : (application?.kycDetails?.status || application?.header?.kycStatus) !== 'PENDING')
        }
        isSubmitting={updateKycDocument.isPending || updateBankingDocument.isPending}
        onClose={() => setViewerDocument(null)}
        onSubmitDecision={handleDocumentDecision}
      />
    </div>
  )
}
