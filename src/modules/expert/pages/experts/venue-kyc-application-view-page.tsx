import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
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
  useUpdateVenueBankingStatus,
  useUpdateVenueKycStatus,
} from '../../hooks/use-venue-kyc'
import {
  useEscalateExpertApplication,
  useEscalationAssignees,
  useStartEscalationReviewOnView,
} from '../../hooks/use-expert-application-view'
import { useAdminEscalation } from '@/modules/my-tasks/hooks/use-admin-escalation'
import type { VenueKycStatus } from '../../type/venue-kyc'
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
import { formatApplicationExpertId } from './expert-list-format'

type TabKey = 'overview' | 'kyc' | 'banking'
type DecisionVariant = 'approve' | 'reject' | 'requestChanges' | 'escalate'
type DecisionTarget = 'kyc' | 'banking'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'kyc', label: 'KYC Details' },
  { key: 'banking', label: 'Banking Details' },
]

const KYC_REJECT_REASONS: DecisionActionModalOption[] = [
  { label: 'Unclear Image', value: 'Unclear Image' },
  { label: 'Content Issue', value: 'Content Issue' },
  { label: 'Invalid documents', value: 'Invalid documents' },
  { label: 'Invalid PAN', value: 'Invalid PAN' },
  { label: 'Invalid GST', value: 'Invalid GST' },
]

const BANKING_REJECT_REASONS: DecisionActionModalOption[] = [
  { label: 'Unclear Image', value: 'Unclear Image' },
  { label: 'Content Issue', value: 'Content Issue' },
  { label: 'Invalid documents', value: 'Invalid documents' },
  { label: 'Invalid PAN', value: 'Invalid PAN' },
  { label: 'Invalid GST', value: 'Invalid GST' },
]

const getApiErrorMessage = (error: unknown) => {
  const err = error as {
    response?: { status?: number; data?: { message?: string } }
  }
  return err?.response?.data?.message || 'Something went wrong. Please try again.'
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
    hour12: false,
  })
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
      ? 'bg-[#1B4332] text-[#74C69D]'
      : status === 'REJECTED'
        ? 'bg-[#4A1515] text-[#F87171]'
        : status === 'DRAFT'
          ? 'bg-white/10 text-[#AAAAAA]'
          : 'bg-[#4A2C17] text-[#E8A86B]'

  const displayLabel = label || (status === 'DRAFT' ? 'Not Submitted' : status) || 'PENDING'

  return (
    <span className={cn('rounded-md px-3 py-1.5 text-[11px] font-semibold', className)}>
      {displayValue(displayLabel)}
    </span>
  )
}

function YesNoBadge({ value }: { value?: boolean | null }) {
  if (value === null || value === undefined) {
    return (
      <span className="inline-flex rounded-md bg-white/5 px-2.5 py-1 text-[11px] font-bold text-[#888]">
        N/A
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex rounded-md px-2.5 py-1 text-[11px] font-bold',
        value ? 'bg-[#1B4332] text-[#74C69D]' : 'bg-[#4A1515] text-[#F87171]',
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
    <div className={cn('rounded-xl border border-white/5 bg-[#111111] p-5', className)}>
      <div className="mb-5 flex items-center gap-2 text-[14px] font-semibold text-white">
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
      <p className="text-[11px] font-medium text-[#777777]">{label}</p>
      <div className="mt-1.5 text-[13px] font-semibold text-white">
        {children ?? displayValue(value)}
      </div>
    </div>
  )
}

function DocumentCard({ label, url }: { label: string; url?: string | null }) {
  return (
    <div className="rounded-xl border border-white/5 bg-black p-4">
      <div className="flex items-start gap-2.5">
        <CheckCircle2
          className={cn('mt-0.5 size-4 shrink-0', url ? 'text-[#00B761]' : 'text-[#555]')}
        />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-white">{label}</p>
          <p className="mt-0.5 text-[10px] text-[#777]">{getDocumentMeta(url)}</p>
        </div>
      </div>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md bg-[#1f1f1f] py-2.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#2a2a2a]"
        >
          <FileText className="size-3.5" />
          View Document
        </a>
      ) : (
        <div className="mt-4 flex w-full items-center justify-center rounded-md bg-[#1a1a1a] py-2.5 text-[11px] font-medium text-[#666]">
          Not uploaded
        </div>
      )}
    </div>
  )
}

function VenueImage({ src, alt }: { src: string; alt: string }) {
  const [errored, setErrored] = useState(false)

  if (errored) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl border border-white/5 bg-black text-[#666]">
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
  const [rejectConfirmed, setRejectConfirmed] = useState(false)

  const { data, isLoading, isError, error } = useApplicationDetails(id)
  const { data: assigneesData } = useEscalationAssignees()
  const application = data?.data
  const partnerId = application?.header?.partnerId ?? undefined

  const updateKyc = useUpdateVenueKycStatus(id)
  const updateBanking = useUpdateVenueBankingStatus(id)
  const escalateApplication = useEscalateExpertApplication(partnerId)
  const startEscalationReview = useStartEscalationReviewOnView(partnerId)
  const { mutate: startEscalationReviewMutate } = startEscalationReview
  const { data: escalationData } = useAdminEscalation('partner', partnerId)

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
    setRejectConfirmed(false)
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
      if (modalVariant === 'reject' && !rejectConfirmed) {
        toast.error('Please confirm the documents are not approved.')
        return
      }
      if (modalVariant === 'requestChanges' && !rejectionReason.trim()) {
        toast.error('Please provide a request changes reason.')
        return
      }
    }

    if (!adminNotes.trim()) {
      toast.error('Admin notes are required.')
      return
    }

    const resolvedRejectionReason =
      modalVariant === 'reject'
        ? (modalTarget === 'banking' ? BANKING_REJECT_REASONS : KYC_REJECT_REASONS)
            .filter((option) => selectedReasons.includes(option.value))
            .map((option) => option.label)
            .join(', ') || selectedReasons.join(', ')
        : rejectionReason.trim()

    if (modalTarget === 'banking') {
      const payload =
        modalVariant === 'approve'
          ? { status: 'APPROVED' as const, adminNote: adminNotes.trim() }
          : {
              status: 'REJECTED' as const,
              reasonFor: selectedReasons,
              rejectionReason: resolvedRejectionReason,
              adminNote: adminNotes.trim(),
            }

      updateBanking.mutate(payload, {
        onSuccess: () => {
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
        reasonFor: selectedReasons,
        rejectionReason: resolvedRejectionReason,
        adminNote: adminNotes.trim(),
      },
      {
        onSuccess: () => {
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

  const isBankingSubmitted = ['PENDING', 'APPROVED', 'REJECTED'].includes(
    application?.bankingDetails?.status || application?.header?.bankingStatus || '',
  )

  const decisionDisabled =
    (decisionTargetForTab === 'banking' && !isBankingSubmitted) ||
    activeDecisionStatus !== 'PENDING' ||
    activeMutationPending

  const escalateDisabled = activeDecisionStatus === 'APPROVED' || escalateApplication.isPending

  const modalTitle = useMemo(() => {
    if (modalVariant === 'approve') return 'Confirm Application'
    if (modalVariant === 'requestChanges') return 'Request Changes'
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

  if (isLoading) {
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
          className="group font-heading hover:text-brand-accent flex w-fit items-center gap-2 text-[20px] font-bold text-white transition-colors"
        >
          <ArrowLeft className="size-5" />
          <span>Venue Application View</span>
        </button>
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
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

  const uploadedDocuments = [
    { label: 'PAN Card', url: documents?.panCard },
    { label: 'GST Certificate', url: documents?.gstCertificate },
    {
      label: 'Certificate / License',
      url: otherCertificates[0] || null,
    },
  ]

  const otherDocuments = [
    { label: 'Trade License', url: documents?.tradeLicense },
    { label: 'FSSAI License', url: documents?.fssaiLicense },
  ]

  return (
    <div className="relative flex w-full flex-col gap-5 pb-8 text-white">
      <header className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/experts/management')}
          className="group font-heading hover:text-brand-accent flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Venue Application View</span>
        </button>
        <div className="flex items-center gap-1.5 pl-7 text-[12px] font-medium text-[#777777]">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/experts/management')}
            className="transition-colors hover:text-white"
          >
            Expert management
          </button>
          <span className="text-[#333333]">/</span>
          <span>Manage Expert</span>
          <span className="text-[#333333]">/</span>
          <span className="font-bold text-white">{applicantName}</span>
        </div>
      </header>

      <h2 className="text-[16px] font-semibold text-white">Application Details</h2>

      <div className="rounded-xl border border-white/5 bg-[#111111] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-white">{applicantName}</h3>
              {header.partnerId && (
                <button
                  type="button"
                  onClick={() => navigate(`/experts/management/profile/${header.partnerId}`)}
                  className="hover:text-brand-accent rounded-md p-1 text-[#888] transition-colors hover:bg-white/5"
                  aria-label="Open expert profile"
                >
                  <ExternalLink className="size-4" />
                </button>
              )}
            </div>
            {appliedLabel && <p className="mt-1 text-[12px] text-[#777]">{appliedLabel}</p>}
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
            <p className="text-[11px] text-[#777]">Expert ID</p>
            <p className="mt-1 font-mono text-[13px] font-semibold text-white">
              {formatApplicationExpertId(header.partnerId || header.applicationId)}
            </p>
          </div>
          <div className="rounded-lg border border-white/5 bg-black p-4">
            <p className="text-[11px] text-[#777]">Submitted</p>
            <p className="mt-1 text-[13px] font-semibold text-white">
              {formatDateTime(header.submittedAt)}
            </p>
          </div>
          <div className="rounded-lg border border-white/5 bg-black p-4">
            <p className="text-[11px] text-[#777]">Last Updated</p>
            <p className="mt-1 text-[13px] font-semibold text-white">
              {formatDateTime(header.lastUpdatedAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center rounded-xl bg-[#1A1A1A]">
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
              <p className="text-[12px] text-[#777]">No venue images uploaded.</p>
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
                  <span className="text-[12px] font-medium text-[#bbb]">
                    Filed last 2 years IT Returns
                  </span>
                  <YesNoBadge value={compliance?.itReturnsFiledLast2Years} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-medium text-[#bbb]">Undertaking Signed</span>
                  <YesNoBadge value={compliance?.undertakingSigned} />
                </div>
                {compliance?.gstUndertakingDocument && (
                  <div className="rounded-lg border border-white/10 bg-white px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 shrink-0 text-[#E11D48]" />
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-semibold text-black">
                          Undertaking Document
                        </p>
                        <p className="text-[10px] text-[#666]">
                          {getDocumentMeta(compliance.gstUndertakingDocument)}
                        </p>
                      </div>
                      <a
                        href={compliance.gstUndertakingDocument}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-auto text-[11px] font-semibold text-[#1D4ED8] hover:underline"
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
                <DocumentCard key={document.label} label={document.label} url={document.url} />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Other Document"
            icon={<FileText className="text-brand-accent size-4" />}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherDocuments.map((document) => (
                <DocumentCard key={document.label} label={document.label} url={document.url} />
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
              <DocumentCard
                label="Cancelled Cheque"
                url={isBankingSubmitted ? bankingDetails.cancelledCheque : null}
              />
            </div>
          </SectionCard>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-white/5 bg-[#111111] p-5">
          <div className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-white">
            <History className="text-brand-accent size-4" aria-hidden="true" />
            <h3>Application Notes</h3>
          </div>
          <div className="min-h-[120px] rounded-lg border border-white/5 bg-black p-4 text-[12px] leading-relaxed whitespace-pre-wrap text-[#777]">
            {notesContent}
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#111111] p-5">
          <DecisionControlsHeader className="mb-4" />

          {decisionTargetForTab === 'banking' && !isBankingSubmitted && (
            <p className="mb-4 rounded-md border border-white/5 bg-black px-3 py-2 text-[11px] font-medium text-[#999]">
              Banking has not been submitted yet. Approve and reject are available only after the
              partner submits banking details.
            </p>
          )}

          {activeDecisionStatus !== 'PENDING' &&
            !(decisionTargetForTab === 'banking' && !isBankingSubmitted) && (
              <p className="mb-4 rounded-md border border-white/5 bg-black px-3 py-2 text-[11px] font-medium text-[#999]">
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
              ? 'Are you sure you want to approve this application? The applicant will be notified via email.'
              : modalVariant === 'requestChanges'
                ? 'Are you sure you want to Request Changes to this application? The applicant will be notified via email.'
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
            ? modalTarget === 'banking'
              ? BANKING_REJECT_REASONS
              : KYC_REJECT_REASONS
            : []
        }
        selectedReasons={selectedReasons}
        onReasonToggle={toggleReason}
        reason={modalVariant === 'requestChanges' ? rejectionReason : ''}
        onReasonChange={modalVariant === 'requestChanges' ? setRejectionReason : undefined}
        reasonLabel="Request Changes"
        confirmationLabel={
          modalVariant === 'reject'
            ? 'I confirm the documents are not approved due to above reasons.'
            : undefined
        }
        confirmationChecked={rejectConfirmed}
        onConfirmationChange={modalVariant === 'reject' ? setRejectConfirmed : undefined}
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
    </div>
  )
}
