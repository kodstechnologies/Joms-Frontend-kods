import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  ClipboardList,
  FileText,
  History,
  ShieldCheck,
  User,
} from 'lucide-react'

import {
  useExpertApplicationView,
  useUpdateExpertBankingStatus,
  useUpdateExpertKycStatus,
} from '../../hooks/use-expert-application-view'
import { formatApplicationExpertId } from './expert-list-shared'
import {
  getDisplayKycStatus,
  isAdminKycApproved,
  isKycSubmittedForApplication,
} from '../../utils/expert-application-helpers'
import type {
  ApplicationStatus,
  ConciergeRejectionReason,
} from '../../type/expert-application-view'
import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import { cn } from '@/shared/lib/cn'

type TabKey = 'overview' | 'kyc' | 'banking'
type DecisionVariant = 'approve' | 'reject' | 'requestChanges'
type DecisionTarget = 'kyc' | 'banking'

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
  { label: 'Cheque unreadable', value: 'Reason1' },
  { label: 'Name mismatch', value: 'Reason2' },
  { label: 'Account details invalid', value: 'Reason3' },
  { label: 'IFSC mismatch', value: 'Reason4' },
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
      <span className="rounded-md bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-[#888]">
        Not Submitted
      </span>
    )
  }

  const className =
    status === 'APPROVED'
      ? 'bg-emerald-500/15 text-emerald-400'
      : status === 'REJECTED'
        ? 'bg-red-500/15 text-red-400'
        : 'bg-amber-500/15 text-amber-300'
  return (
    <span className={cn('rounded-md px-3 py-1.5 text-[11px] font-semibold', className)}>
      {displayValue(status || 'PENDING')}
    </span>
  )
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#111111] p-5">
      <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-white">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  )
}

function InfoField({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-[#777777]">{label}</p>
      <div className="mt-1 text-[13px] font-semibold text-white">{displayValue(value)}</div>
    </div>
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

export function ExpertApplicationViewPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalVariant, setModalVariant] = useState<DecisionVariant>('approve')
  const [modalTarget, setModalTarget] = useState<DecisionTarget>('kyc')
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [rejectionReason, setRejectionReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  const { data, isLoading, isError, error } = useExpertApplicationView(id)
  const application = data?.data

  const updateKyc = useUpdateExpertKycStatus(application?.kyc?._id)
  const updateBanking = useUpdateExpertBankingStatus(application?.banking?._id)

  const decisionTargetForTab: DecisionTarget =
    activeTab === 'banking' ? 'banking' : 'kyc'

  const isKycSubmitted = isKycSubmittedForApplication(application?.expert, application?.kyc)
  const isBankingSubmitted = Boolean(application?.banking?._id)
  const displayKycStatus = getDisplayKycStatus(application?.expert, application?.kyc)
  const showKycDetails = Boolean(application?.kyc) || isAdminKycApproved(application?.expert)

  const activeSectionSubmitted =
    decisionTargetForTab === 'banking' ? isBankingSubmitted : isKycSubmitted

  const activeDecisionStatus =
    decisionTargetForTab === 'banking'
      ? application?.banking?.status
      : displayKycStatus

  const activeMutation = decisionTargetForTab === 'banking' ? updateBanking : updateKyc

  const mutation = modalTarget === 'banking' ? updateBanking : updateKyc

  const openDecisionModal = (target: DecisionTarget, variant: DecisionVariant) => {
    setModalTarget(target)
    setModalVariant(variant)
    setSelectedReasons([])
    setRejectionReason('')
    setAdminNotes('')
    setModalOpen(true)
  }

  const toggleReason = (value: string) => {
    setSelectedReasons((current) =>
      current.includes(value) ? current.filter((reason) => reason !== value) : [...current, value],
    )
  }

  const handleSubmitDecision = () => {
    if (!application) return

    const isRejectFlow =
      modalVariant === 'reject' || modalVariant === 'requestChanges'

    if (isRejectFlow) {
      if (selectedReasons.length === 0) return toast.error('Please select at least one reason.')
      if (!rejectionReason.trim()) return toast.error('Please provide a rejection reason.')
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

  const decisionDisabled =
    !activeSectionSubmitted ||
    activeDecisionStatus !== 'PENDING' ||
    activeMutation.isPending

  const modalTitle = useMemo(() => {
    const target = modalTarget === 'banking' ? 'Banking' : 'KYC'
    if (modalVariant === 'approve') return `Approve ${target}`
    if (modalVariant === 'requestChanges') return 'Request Changes'
    return `Reject ${target}`
  }, [modalTarget, modalVariant])

  const isRejectFlow =
    modalVariant === 'reject' || modalVariant === 'requestChanges'

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="size-9 animate-spin rounded-full border-4 border-[#FBC078] border-t-transparent" />
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
          onClick={() => navigate('/experts/management')}
          className="group flex w-fit items-center gap-2 font-heading text-[20px] font-bold text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5" />
          <span>Application View</span>
        </button>
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {status ? `[${status}] ` : ''}
          {message || 'Unable to load application view.'}
        </div>
        {status === 404 && (
          <p className="text-[12px] text-[#888]">
            Partner ID used: <span className="font-mono text-[#ccc]">{id}</span>.
            The API returns 404 when the partner is not found, or when KYC or banking
            records are missing for this expert (partial data is not returned).
          </p>
        )}
      </div>
    )
  }

  const profile = application.expert?.basicProfile
  const identity = application.expert?.identityVerification
  const kyc = application.kyc
  const banking = application.banking

  const kycPanUrl =
    kyc?.documents?.panCardUrl || identity?.panCardFile
  const kycGstUrl =
    kyc?.documents?.gstCertificateUrl || identity?.gstCertificateFile
  const kycCertificateUrl =
    kyc?.documents?.licenceOrCertificateUrl || identity?.certificateFile
  const kycSampleWorkUrl =
    kyc?.documents?.sampleWorkFileUrl ||
    profile?.sampleWorkFile ||
    kyc?.sampleWorkLink ||
    profile?.sampleWorkLink
  const cancelledChequeUrl = banking?.documents?.cancelledChequeUrl

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigate('/experts/management')}
          className="group flex w-fit items-center gap-2 font-heading text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Application View</span>
        </button>
        <div className="flex items-center gap-1.5 pl-7 text-[12px] font-medium text-[#777777]">
          <button
            type="button"
            onClick={() => navigate('/experts/management')}
            className="transition-colors hover:text-white"
          >
            Expert management
          </button>
          <span className="text-[#333333]">/</span>
          <span className="font-bold text-white">{displayValue(application.expert?.fullname)}</span>
        </div>
      </header>

      <div className="rounded-xl border border-white/5 bg-[#111111] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{displayValue(application.expert?.fullname)}</h2>
            <p className="mt-1 text-[12px] text-[#777]">
              Created {formatDateTime(application.expert?.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium uppercase tracking-wide text-[#666]">KYC</span>
              <StatusPill status={displayKycStatus} notSubmitted={!isKycSubmitted} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium uppercase tracking-wide text-[#666]">Banking</span>
              <StatusPill status={banking?.status} notSubmitted={!isBankingSubmitted} />
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-white/5 bg-black p-4">
            <p className="text-[11px] text-[#777]">Expert ID</p>
            <p className="mt-1 font-mono text-[13px] font-semibold text-white">
              {formatApplicationExpertId(application.expert?._id || id)}
            </p>
          </div>
          <div className="rounded-lg border border-white/5 bg-black p-4">
            <p className="text-[11px] text-[#777]">Submitted</p>
            <p className="mt-1 text-[13px] font-semibold text-white">{formatDateTime(application.expert?.createdAt)}</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-black p-4">
            <p className="text-[11px] text-[#777]">Last Updated</p>
            <p className="mt-1 text-[13px] font-semibold text-white">{formatDateTime(application.expert?.updatedAt)}</p>
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
              activeTab === tab.key ? 'bg-[#FBC078]/10 text-[#FBC078]' : 'text-[#888] hover:text-white',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <SectionCard title="Applicant Information" icon={<User className="size-4 text-[#FBC078]" />}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <InfoField label="Full Name" value={application.expert?.fullname} />
              <InfoField label="Phone number" value={application.expert?.phone} />
              <InfoField label="Work Email" value={application.expert?.email} />
              <InfoField label="Service Type" value={profile?.serviceType} />
              <InfoField label="Current role" value={profile?.industry} />
              <InfoField label="Service Category" value={profile?.serviceCategory?.join(', ')} />
            </div>
          </SectionCard>
          <SectionCard title="Application Notes" icon={<History className="size-4 text-[#FBC078]" />}>
            <div className="rounded-lg border border-white/5 bg-black p-4 text-[12px] text-[#777]">No notes yet.</div>
          </SectionCard>
        </div>
      )}

      {activeTab === 'kyc' && !showKycDetails && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-200">
          KYC is not submitted by partner
        </div>
      )}

      {activeTab === 'kyc' && showKycDetails && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SectionCard title="KYC Details" icon={<ClipboardList className="size-4 text-[#FBC078]" />}>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <InfoField
                label="Individual Name / Organisation Name"
                value={kyc?.legalName || application.expert?.fullname}
              />
              <InfoField label="State" value={kyc?.state || profile?.location} />
              <InfoField
                label="PAN Number"
                value={kyc?.panNumber || identity?.panNumber}
              />
              <InfoField
                label="Sample Work Link"
                value={kyc?.sampleWorkLink || profile?.sampleWorkLink}
              />
              <InfoField
                label="GST Information"
                value={kyc?.hasGST ?? identity?.gstAvailable ? 'Yes' : 'No'}
              />
              <InfoField
                label="GST Number"
                value={kyc?.gstNumber || identity?.gstNumber}
              />
              </div>
            </SectionCard>
            <SectionCard title="Compliance & Declaration" icon={<ShieldCheck className="size-4 text-[#FBC078]" />}>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-[#bbb]">Filed last 2 years IT Returns</span>
                  <span
                    className={cn(
                      'inline-flex rounded-md px-2.5 py-1 text-[11px] font-bold',
                      kyc?.itReturnsFiled
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-amber-500/15 text-amber-300',
                    )}
                  >
                    {kyc?.itReturnsFiled ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-[#bbb]">Undertaking Signed</span>
                  <span className="inline-flex rounded-md bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-400">Yes</span>
                </div>
              </div>
            </SectionCard>
          </div>
          <SectionCard title="Uploaded Documents" icon={<FileText className="size-4 text-[#FBC078]" />}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <DocumentCard label="PAN Card" url={kycPanUrl} />
              <DocumentCard label="GST Certificate" url={kycGstUrl} />
              <DocumentCard label="Certificate / License" url={kycCertificateUrl} />
              <DocumentCard label="Sample Work" url={kycSampleWorkUrl} />
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === 'banking' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <SectionCard title="Account Information" icon={<Banknote className="size-4 text-[#FBC078]" />}>
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
          <SectionCard title="Bank Verification Document" icon={<FileText className="size-4 text-[#FBC078]" />}>
            <DocumentCard label="Cancelled Cheque" url={cancelledChequeUrl} />
          </SectionCard>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard title="Application Notes" icon={<History className="size-4 text-[#FBC078]" />}>
          <div className="rounded-lg border border-white/5 bg-black p-4 text-[12px] text-[#777]">No notes yet.</div>
        </SectionCard>

        <SectionCard title="Decision Controls" icon={<ShieldCheck className="size-4 text-[#FBC078]" />}>
          <p className="mb-3 text-[11px] font-medium text-[#888]">
            Reviewing:{' '}
            <span className="text-white">
              {decisionTargetForTab === 'banking' ? 'Banking Details' : 'KYC Details'}
            </span>
          </p>
          {!activeSectionSubmitted && (
            <p className="mb-4 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] font-medium text-amber-200">
              {decisionTargetForTab === 'banking' ? 'Banking' : 'KYC'} is not submitted by partner.
              Approve and reject actions are unavailable until submission.
            </p>
          )}
          {activeSectionSubmitted && activeDecisionStatus !== 'PENDING' && (
            <p className="mb-4 rounded-md border border-white/5 bg-black px-3 py-2 text-[11px] font-medium text-[#999]">
              {decisionTargetForTab === 'banking' ? 'Banking' : 'KYC'} is already{' '}
              {String(activeDecisionStatus).toLowerCase()}.
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={decisionDisabled}
              onClick={() => openDecisionModal(decisionTargetForTab, 'approve')}
              className="rounded-md bg-[#00B761] px-4 py-2.5 text-[11px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={decisionDisabled}
              onClick={() => openDecisionModal(decisionTargetForTab, 'requestChanges')}
              className="rounded-md bg-[#FBC078] px-4 py-2.5 text-[11px] font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ask for Re-Submit
            </button>
            <button
              type="button"
              onClick={() => toast.message('Escalate is coming soon')}
              className="rounded-md bg-[#1D4ED8] px-4 py-2.5 text-[11px] font-bold text-white"
            >
              Escalate
            </button>
            <button
              type="button"
              disabled={decisionDisabled}
              onClick={() => openDecisionModal(decisionTargetForTab, 'reject')}
              className="rounded-md bg-[#F02D2D] px-4 py-2.5 text-[11px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reject Application
            </button>
          </div>
        </SectionCard>
      </div>

      <DecisionActionModal
        open={modalOpen}
        variant={modalVariant}
        title={modalTitle}
        description={
          modalVariant === 'approve'
            ? `Are you sure you want to approve this ${modalTarget === 'banking' ? 'banking' : 'KYC'} section?`
            : modalVariant === 'requestChanges'
              ? 'Are you sure you want to Request Changes to this application? The applicant will be notified via email.'
              : `Are you sure you want to reject this ${modalTarget === 'banking' ? 'banking' : 'KYC'} section?`
        }
        submitLabel={
          modalVariant === 'approve'
            ? 'Approve'
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
        reason={isRejectFlow ? rejectionReason : undefined}
        onReasonChange={isRejectFlow ? setRejectionReason : undefined}
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitDecision}
        isSubmitting={mutation.isPending}
      />
    </div>
  )
}
