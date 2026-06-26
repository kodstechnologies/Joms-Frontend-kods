import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Banknote,
  Building2,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileText,
  History,
  ScrollText,
  ShieldCheck,
  User,
} from 'lucide-react'

import {
  useApplicationDetails,
  useUpdateVenueBankingStatus,
  useUpdateVenueKycStatus,
} from '../../hooks/use-venue-kyc'
import type {
  ApplicationDetails,
  VenueKycStatus,
} from '../../type/venue-kyc'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import { cn } from '@/shared/lib/cn'

type TabKey = 'overview' | 'kyc' | 'banking'

type DecisionVariant = 'approve' | 'reject'

type DecisionTarget = 'kyc' | 'banking'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'kyc', label: 'KYC Details' },
  { key: 'banking', label: 'Banking Details' },
]

const KYC_REJECT_REASONS: DecisionActionModalOption[] = [
  { label: 'Incomplete documents', value: 'incomplete_documents' },
  { label: 'Invalid PAN / GST', value: 'invalid_pan_gst' },
  { label: 'Document mismatch', value: 'document_mismatch' },
  { label: 'Poor document quality', value: 'poor_quality' },
  { label: 'Compliance not met', value: 'compliance_not_met' },
]

const BANKING_REJECT_REASONS: DecisionActionModalOption[] = [
  { label: 'Name mismatch', value: 'name_mismatch' },
  { label: 'Invalid account details', value: 'invalid_account_details' },
  { label: 'Unreadable cancelled cheque', value: 'unreadable_cheque' },
  { label: 'Bank not supported', value: 'bank_not_supported' },
]

const getApiErrorMessage = (error: unknown) => {
  const err = error as { response?: { data?: { message?: string } } }
  return err?.response?.data?.message || 'Something went wrong. Please try again.'
}

const formatDateTime = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatRelativeTime = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const diffMs = Date.now() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours <= 0) return 'Applied just now'
    return `Applied ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  }
  return `Applied ${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

function StatusPill({
  status,
  label,
}: {
  status: VenueKycStatus
  label: string
}) {
  const className =
    status === 'APPROVED'
      ? 'bg-emerald-500/15 text-emerald-400'
      : status === 'REJECTED'
        ? 'bg-red-500/15 text-red-400'
        : 'bg-amber-500/15 text-amber-300'

  return (
    <span
      className={cn(
        'rounded-md px-3 py-1.5 text-[11px] font-semibold',
        className,
      )}
    >
      {label}
    </span>
  )
}

function SectionCard({
  title,
  icon,
  children,
  className,
}: {
  title?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/5 bg-[#111111] p-5',
        className,
      )}
    >
      {title && (
        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-white">
          {icon}
          <span>{title}</span>
        </div>
      )}
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
  value?: ReactNode
  children?: ReactNode
}) {
  return (
    <div>
      <p className="text-[11px] font-medium text-[#777777]">{label}</p>
      <div className="mt-1 text-[13px] font-semibold text-white">
        {children ?? (value || '—')}
      </div>
    </div>
  )
}

function YesNoBadge({ value }: { value: boolean | null | undefined }) {
  if (value === null || value === undefined) {
    return <span className="text-[13px] font-semibold text-[#777]">—</span>
  }
  return (
    <span
      className={cn(
        'inline-flex rounded-md px-2.5 py-1 text-[11px] font-bold',
        value
          ? 'bg-emerald-500/15 text-emerald-400'
          : 'bg-red-500/15 text-red-400',
      )}
    >
      {value ? 'Yes' : 'No'}
    </span>
  )
}

function DocumentCard({ label, url }: { label: string; url?: string | null }) {
  return (
    <div className="rounded-lg border border-white/5 bg-black p-4">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
        <div className="min-w-0">
          <p className="truncate text-[12px] font-semibold text-white">{label}</p>
          <p className="text-[10px] text-[#777]">Document</p>
        </div>
      </div>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-[#1f1f1f] py-2 text-[11px] font-semibold text-white transition-colors hover:bg-[#2a2a2a]"
        >
          <FileText className="size-3.5" />
          View Document
        </a>
      ) : (
        <div className="mt-3 flex w-full items-center justify-center rounded-md bg-[#1a1a1a] py-2 text-[11px] font-medium text-[#666]">
          Not uploaded
        </div>
      )}
    </div>
  )
}

function ApplicationNotes({ notes }: { notes: string | null }) {
  return (
    <SectionCard title="Application Notes" icon={<History className="size-4 text-[#FBC078]" />}>
      <div className="rounded-lg border border-white/5 bg-black p-4 text-[12px] text-[#777]">
        {notes?.trim() ? (
          <span className="text-white">{notes}</span>
        ) : (
          'No notes yet.'
        )}
      </div>
    </SectionCard>
  )
}

function DecisionControls({
  status,
  onApprove,
  onReject,
  onResubmit,
  onEscalate,
  disabled,
}: {
  status: VenueKycStatus
  onApprove: () => void
  onReject: () => void
  onResubmit: () => void
  onEscalate: () => void
  disabled: boolean
}) {
  return (
    <SectionCard
      title="Decision Controls"
      icon={<ShieldCheck className="size-4 text-[#FBC078]" />}
    >
      {status !== 'PENDING' && (
        <p className="mb-4 rounded-md border border-white/5 bg-black px-3 py-2 text-[11px] font-medium text-[#999]">
          This section is already{' '}
          <span
            className={cn(
              'font-bold',
              status === 'APPROVED' ? 'text-emerald-400' : 'text-red-400',
            )}
          >
            {status === 'APPROVED' ? 'approved' : 'rejected'}
          </span>
          . Decision actions are only available while the application is pending
          review.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onApprove}
          disabled={disabled}
          className="flex items-center gap-1.5 rounded-md bg-[#00B761] px-4 py-2.5 text-[11px] font-bold text-white transition-colors hover:bg-[#08a85d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Approve
          <CheckCircle2 className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onResubmit}
          className="flex items-center gap-1.5 rounded-md bg-[#1f1f1f] px-4 py-2.5 text-[11px] font-bold text-white transition-colors hover:bg-[#2a2a2a]"
        >
          Ask for Re-Submit
        </button>
        <button
          type="button"
          onClick={onEscalate}
          className="flex items-center gap-1.5 rounded-md bg-[#1D4ED8] px-4 py-2.5 text-[11px] font-bold text-white transition-colors hover:bg-[#1e40af]"
        >
          Escalate
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={disabled}
          className="flex items-center gap-1.5 rounded-md bg-[#F02D2D] px-4 py-2.5 text-[11px] font-bold text-white transition-colors hover:bg-[#d92727] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reject Application
        </button>
      </div>
    </SectionCard>
  )
}

function OverviewTab({ data }: { data: ApplicationDetails }) {
  const { applicant, venue, venueImages } = data.overview

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard
          title="Applicant Information"
          icon={<User className="size-4 text-[#FBC078]" />}
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <InfoField label="Full Name/Organization" value={applicant.fullName} />
            <InfoField label="Phone number" value={applicant.phone} />
            <InfoField label="Work Email" value={applicant.email} />
            <InfoField label="Service Type" value={applicant.serviceType} />
            <InfoField label="Current role" value={applicant.currentRole} />
            <InfoField label="Service Category" value={applicant.serviceCategory} />
          </div>
        </SectionCard>

        <SectionCard
          title="Venue Information"
          icon={<Building2 className="size-4 text-[#FBC078]" />}
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <InfoField label="Venue Name" value={venue.venueName} />
            <InfoField label="Venue Type" value={venue.venueType} />
            <InfoField label="Address" value={venue.address} />
            <InfoField label="City" value={venue.city} />
            <InfoField label="Pincode" value={venue.pincode} />
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Venue Images" icon={<Building2 className="size-4 text-[#FBC078]" />}>
        {venueImages.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {venueImages.map((src, index) => (
              <a
                key={`${src}-${index}`}
                href={src}
                target="_blank"
                rel="noreferrer"
                className="block size-24 overflow-hidden rounded-lg border border-white/5"
              >
                <img
                  src={src}
                  alt={`Venue ${index + 1}`}
                  className="size-full object-cover"
                />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-[#777]">No images uploaded.</p>
        )}
      </SectionCard>
    </div>
  )
}

function KycTab({ data }: { data: ApplicationDetails }) {
  const kyc = data.kycDetails

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard
          title="KYC Details"
          icon={<ClipboardList className="size-4 text-[#FBC078]" />}
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <InfoField
              label="Individual Name / Organisation Name"
              value={kyc.individualOrOrgName}
            />
            <InfoField label="State" value={kyc.state} />
            <InfoField label="Address" value={kyc.address} />
            <InfoField label="PAN Number" value={kyc.panNumber} />
            <InfoField label="Venue Type" value={kyc.venueType} />
            <InfoField label="GST Information">
              <YesNoBadge value={kyc.hasGST} />
            </InfoField>
            <InfoField label="GST Number" value={kyc.gstNumber} />
          </div>
        </SectionCard>

        <SectionCard
          title="Compliance & Declaration"
          icon={<ScrollText className="size-4 text-[#FBC078]" />}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#bbb]">
                Filed last 2 years IT Returns
              </span>
              <YesNoBadge value={kyc.compliance.itReturnsFiledLast2Years} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#bbb]">
                Undertaking Signed
              </span>
              <YesNoBadge value={kyc.compliance.undertakingSigned} />
            </div>
            {kyc.compliance.gstUndertakingDocument && (
              <a
                href={kyc.compliance.gstUndertakingDocument}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-md border border-white/5 bg-black px-3 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#1a1a1a]"
              >
                <FileText className="size-4 text-red-400" />
                GST Undertaking Document
              </a>
            )}
            {kyc.compliance.gstUndertakingEmail && (
              <InfoField
                label="GST Undertaking Email"
                value={kyc.compliance.gstUndertakingEmail}
              />
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Uploaded Documents"
        icon={<FileText className="size-4 text-[#FBC078]" />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <DocumentCard label="PAN Card" url={kyc.documents.panCard} />
          <DocumentCard label="GST Certificate" url={kyc.documents.gstCertificate} />
          <DocumentCard label="Certificate / License" url={kyc.documents.tradeLicense} />
        </div>

        <p className="mb-3 mt-6 text-[13px] font-semibold text-white">
          Other Documents
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <DocumentCard label="FSSAI License" url={kyc.documents.fssaiLicense} />
          {kyc.documents.otherCertificates.map((url, index) => (
            <DocumentCard
              key={`${url}-${index}`}
              label={`Other Certificate ${index + 1}`}
              url={url}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function BankingTab({ data }: { data: ApplicationDetails }) {
  const { account, cancelledCheque } = data.bankingDetails

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <SectionCard
        title="Account Information"
        icon={<Banknote className="size-4 text-[#FBC078]" />}
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <InfoField label="Beneficiary Name" value={account.beneficiaryName} />
          <InfoField label="Account Type" value={account.accountType} />
          {(account.nameMatchScore ?? null) !== null && (
            <InfoField
              label="Name Match Score"
              value={
                typeof account.nameMatchScore === 'number'
                  ? `${account.nameMatchScore}%`
                  : account.nameMatchScore
              }
            />
          )}
          <InfoField label="Bank Name" value={account.bankName} />
          <InfoField label="IFSC Code" value={account.ifscCode} />
          <InfoField label="Account Number" value={account.accountNumber} />
          {account.providedName && (
            <InfoField label="Provided Name" value={account.providedName} />
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Bank Verification Document"
        icon={<FileText className="size-4 text-[#FBC078]" />}
      >
        <DocumentCard label="Cancelled Cheque" url={cancelledCheque} />
      </SectionCard>
    </div>
  )
}

export function ApplicationDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalVariant, setModalVariant] = useState<DecisionVariant>('approve')
  const [modalTarget, setModalTarget] = useState<DecisionTarget>('kyc')
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [rejectionReason, setRejectionReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  const { data, isLoading, isError, error } = useApplicationDetails(id)
  const application = data?.data

  const updateKyc = useUpdateVenueKycStatus(id)
  const updateBanking = useUpdateVenueBankingStatus(id)

  const resetModal = () => {
    setSelectedReasons([])
    setRejectionReason('')
    setAdminNotes('')
  }

  const openDecisionModal = (
    target: DecisionTarget,
    variant: DecisionVariant,
  ) => {
    resetModal()
    setModalTarget(target)
    setModalVariant(variant)
    setModalOpen(true)
  }

  const closeModal = () => setModalOpen(false)

  const toggleReason = (value: string) => {
    setSelectedReasons((current) =>
      current.includes(value)
        ? current.filter((reason) => reason !== value)
        : [...current, value],
    )
  }

  const isBanking = modalTarget === 'banking'
  const mutation = isBanking ? updateBanking : updateKyc

  const handleSubmit = () => {
    if (!adminNotes.trim()) {
      toast.error('Admin notes are required.')
      return
    }

    if (modalVariant === 'reject') {
      if (selectedReasons.length === 0) {
        toast.error('Please select at least one reason.')
        return
      }
      if (!rejectionReason.trim()) {
        toast.error('Please provide a rejection reason.')
        return
      }
    }

    const payload =
      modalVariant === 'approve'
        ? { status: 'APPROVED' as const, adminNote: adminNotes.trim() }
        : {
            status: 'REJECTED' as const,
            reasonFor: selectedReasons,
            rejectionReason: rejectionReason.trim(),
            adminNote: adminNotes.trim(),
          }

    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(
          modalVariant === 'approve'
            ? `${isBanking ? 'Bank details' : 'Application'} approved successfully`
            : `${isBanking ? 'Bank details' : 'Application'} rejected successfully`,
        )
        closeModal()
      },
      onError: (err) => toast.error(getApiErrorMessage(err)),
    })
  }

  const reasonOptions = isBanking ? BANKING_REJECT_REASONS : KYC_REJECT_REASONS

  const modalTitle = useMemo(() => {
    const subject = isBanking ? 'Bank Details' : 'Application'
    return modalVariant === 'approve'
      ? `Approve ${subject}`
      : `Reject ${subject}`
  }, [isBanking, modalVariant])

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="size-9 animate-spin rounded-full border-4 border-[#FBC078] border-t-transparent" />
      </div>
    )
  }

  if (isError || !application) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/venues/management')}
          className="group flex w-fit items-center gap-2 text-[20px] font-bold text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5" />
          <span>Application Details</span>
        </button>
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {getApiErrorMessage(error) || 'Unable to load application details.'}
        </div>
      </div>
    )
  }

  const { header } = application
  const relativeApplied = formatRelativeTime(header.appliedAt)

  const sectionStatus =
    activeTab === 'banking' ? header.bankingStatus : header.kycStatus
  const decisionDisabled = sectionStatus !== 'PENDING' || mutation.isPending

  const handleComingSoon = (label: string) =>
    toast.message(`${label} is coming soon`)

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigate('/venues/management')}
          className="group flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Application Details</span>
        </button>
        <div className="flex items-center gap-1.5 pl-7 text-[12px] font-medium text-[#777777]">
          <button
            type="button"
            onClick={() => navigate('/venues/management')}
            className="transition-colors hover:text-white"
          >
            Venue Management
          </button>
          <span className="text-[#333333]">/</span>
          <span className="font-bold text-white">Application Details</span>
        </div>
      </header>

      <div className="rounded-xl border border-white/5 bg-[#111111] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white">
                {header.applicantName || 'Unknown Applicant'}
              </h2>
              <ExternalLink className="size-4 text-[#777]" />
            </div>
            {relativeApplied && (
              <p className="mt-1 text-[12px] text-[#777]">{relativeApplied}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={header.kycStatus} label={header.kycStatusLabel} />
            <StatusPill
              status={header.bankingStatus}
              label={header.bankingStatusLabel}
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-white/5 bg-black p-4">
            <p className="text-[11px] text-[#777]">Expert ID</p>
            <p className="mt-1 text-[13px] font-semibold text-white">
              {header.partnerId || header.applicationId}
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

      <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-[#111111] p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-colors',
              activeTab === tab.key
                ? 'bg-[#FBC078]/10 text-[#FBC078]'
                : 'text-[#888] hover:text-white',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab data={application} />}
      {activeTab === 'kyc' && <KycTab data={application} />}
      {activeTab === 'banking' && <BankingTab data={application} />}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ApplicationNotes notes={application.overview.applicationNotes} />
        <DecisionControls
          status={sectionStatus}
          disabled={decisionDisabled}
          onApprove={() =>
            openDecisionModal(
              activeTab === 'banking' ? 'banking' : 'kyc',
              'approve',
            )
          }
          onReject={() =>
            openDecisionModal(
              activeTab === 'banking' ? 'banking' : 'kyc',
              'reject',
            )
          }
          onResubmit={() => handleComingSoon('Ask for Re-Submit')}
          onEscalate={() => handleComingSoon('Escalate')}
        />
      </div>

      <DecisionActionModal
        open={modalOpen}
        variant={modalVariant}
        title={modalTitle}
        description={
          modalVariant === 'approve'
            ? `Are you sure you want to approve this ${
                isBanking ? 'bank details' : 'application'
              }? This action cannot be undone.`
            : `Are you sure you want to reject this ${
                isBanking ? 'bank details' : 'application'
              }? Please provide the reasons below.`
        }
        submitLabel={modalVariant === 'approve' ? 'Approve' : 'Reject'}
        reasonOptions={modalVariant === 'reject' ? reasonOptions : []}
        selectedReasons={selectedReasons}
        onReasonToggle={toggleReason}
        reason={modalVariant === 'reject' ? rejectionReason : undefined}
        onReasonChange={
          modalVariant === 'reject' ? setRejectionReason : undefined
        }
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isSubmitting={mutation.isPending}
      />
    </div>
  )
}
