import type { ChangeEvent, ReactNode } from 'react'
import { useMemo, useRef, useState } from 'react'
import { AlertCircle, ArrowLeft, FileText, Flag, Lightbulb, Upload, User } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { AddFinanceNoteModal } from '@/modules/payments/components/add-finance-note-modal'
import {
  useAddFinanceNote,
  useFinanceEscrowDetail,
  useFinanceNotes,
  useFinancePayment,
  useFinanceRefund,
  useFinanceTaxDetail,
} from '@/modules/payments/hooks/use-finance'
import type { FinanceAdminNote } from '@/modules/payments/types/finance-api'
import { escalateKind } from '@/modules/payments/utils/finance-escalate'
import { formatDate, formatInr, titleCase } from '@/modules/payments/utils/finance-mappers'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

const cardClass = 'radius-lg border border-white/[0.06] bg-brand-surface p-4 sm:p-5'
const sectionTitleClass = 'text-body-md-semibold text-brand-text leading-[20px]'
const sectionSubtitleClass = 'text-body-sm text-muted mt-1'
const labelClass = 'text-body-sm text-muted'
const valueClass = 'text-body-sm text-brand-text'
const textPanelClass =
  'radius-lg border border-white/[0.06] bg-brand-bg p-4 text-body-sm text-brand-text/80'

type EvidenceFile = {
  id: string
  fileName: string
  fileSize: string
  date: string
}

function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn(cardClass, className)}>{children}</section>
}

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-[130px] shrink-0 space-y-1.5 sm:min-w-0 sm:shrink">
      <p className={labelClass}>{label}</p>
      <div className={valueClass}>{value}</div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-b-0">
      <span className={labelClass}>{label}</span>
      <span className={cn(valueClass, 'text-right')}>{value}</span>
    </div>
  )
}

function TextPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(textPanelClass, className)}>{children}</div>
}

function AssessmentBlock({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="text-muted">{icon}</span>
        <p className={sectionTitleClass}>{title}</p>
      </div>
      {children}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="text-body-sm-semibold border-brand-accent/40 bg-brand-accent/10 text-brand-accent inline-flex rounded-full border px-2.5 py-0.5">
      {status}
    </span>
  )
}

function snapshotFiles(snapshot: Record<string, unknown> | null | undefined): EvidenceFile[] {
  if (!snapshot) return []
  const buckets = [
    snapshot.documents,
    snapshot.files,
    snapshot.supportingDocuments,
    snapshot.evidence,
  ]
  const files: EvidenceFile[] = []

  buckets.forEach((bucket) => {
    if (!Array.isArray(bucket)) return
    bucket.forEach((item, index) => {
      if (typeof item === 'string') {
        files.push({
          id: `snap-${files.length}-${index}`,
          fileName: item.split('/').pop() || item,
          fileSize: '—',
          date: '—',
        })
        return
      }
      if (!item || typeof item !== 'object') return
      const record = item as Record<string, unknown>
      const name = String(
        record.label || record.fileName || record.name || record.url || `File ${index + 1}`,
      )
      files.push({
        id: `snap-${files.length}-${index}`,
        fileName: name.split('/').pop() || name,
        fileSize:
          typeof record.size === 'number'
            ? `${Math.max(1, Math.round(record.size / 1024))} KB`
            : '—',
        date: formatDate(typeof record.uploadedAt === 'string' ? record.uploadedAt : undefined),
      })
    })
  })

  return files
}

function evidenceFromNotes(notes: FinanceAdminNote[]): EvidenceFile[] {
  return notes
    .filter((note) => /^evidence uploaded:/i.test(note.adminNote || ''))
    .map((note, index) => ({
      id: note._id || `note-file-${index}`,
      fileName:
        note.adminNote.replace(/^evidence uploaded:\s*/i, '').trim() || `Document ${index + 1}`,
      fileSize: '—',
      date: formatDate(note.createdAt),
    }))
}

function listCrumb(from: string) {
  if (from.startsWith('/finance/services')) return { to: '/finance/services', label: 'Services' }
  if (from.startsWith('/finance/venues')) return { to: '/finance/venues', label: 'Venues' }
  if (from.startsWith('/finance/tax')) return { to: '/finance/tax', label: 'Tax & Compliance' }
  if (from.startsWith('/finance/escrow')) return { to: '/finance/escrow', label: 'Escrow' }
  if (from.startsWith('/finance/refunds'))
    return { to: '/finance/refunds', label: 'Refunds & Chargebacks' }
  return { to: '/finance/revenue', label: 'Revenue Overview' }
}

export function FinanceEscalationDetailPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const resourceType = searchParams.get('resourceType') || 'Payment'
  const kind = escalateKind(searchParams.get('kind'), resourceType)
  const from = searchParams.get('from') || searchParams.get('returnTo') || ''
  const assigneeFromQuery = searchParams.get('assignee') || ''
  const crumb = listCrumb(from)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const paymentQuery = useFinancePayment(
    kind === 'resource' && resourceType !== 'TaxRecord' && resourceType !== 'EscrowHold' ? id : '',
  )
  const taxQuery = useFinanceTaxDetail(
    kind === 'resource' && resourceType === 'TaxRecord' ? id : '',
  )
  const escrowQuery = useFinanceEscrowDetail(
    kind === 'resource' && resourceType === 'EscrowHold' ? id : '',
  )
  const refundQuery = useFinanceRefund(kind === 'refund' ? id : '')
  const notesQuery = useFinanceNotes(id)
  const addNote = useAddFinanceNote()

  const [selectedEvidenceId, setSelectedEvidenceId] = useState('')
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [localFiles, setLocalFiles] = useState<EvidenceFile[]>([])

  const payment = paymentQuery.data?.data
  const tax = taxQuery.data?.data
  const escrow = escrowQuery.data?.data
  const refund = refundQuery.data?.data
  const notes = notesQuery.data?.data ?? []
  const escalateNotes = notes.filter((note) => note.action === 'escalate')
  const latestEscalate = escalateNotes[0]

  const isLoading =
    (kind === 'refund' && refundQuery.isLoading) ||
    (kind === 'resource' && resourceType === 'TaxRecord' && taxQuery.isLoading) ||
    (kind === 'resource' && resourceType === 'EscrowHold' && escrowQuery.isLoading) ||
    (kind === 'resource' &&
      resourceType !== 'TaxRecord' &&
      resourceType !== 'EscrowHold' &&
      paymentQuery.isLoading)

  const isError =
    (kind === 'refund' && (refundQuery.isError || !refund)) ||
    (kind === 'resource' && resourceType === 'TaxRecord' && (taxQuery.isError || !tax)) ||
    (kind === 'resource' && resourceType === 'EscrowHold' && (escrowQuery.isError || !escrow)) ||
    (kind === 'resource' &&
      resourceType !== 'TaxRecord' &&
      resourceType !== 'EscrowHold' &&
      (paymentQuery.isError || !payment))

  const snapshot = (payment?.moduleSnapshot || null) as Record<string, unknown> | null
  const evidenceFiles = useMemo(() => {
    const fromSnapshot = snapshotFiles(snapshot)
    const fromNotes = evidenceFromNotes(notes)
    const merged = [...localFiles, ...fromNotes, ...fromSnapshot]
    const seen = new Set<string>()
    return merged.filter((file) => {
      const key = file.fileName.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [localFiles, notes, snapshot])

  if (isLoading) {
    return <p className="text-body-sm text-muted">Loading escalation details...</p>
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <p className="text-body-sm text-brand-danger">Escalated record not found.</p>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, crumb.to)}
          className="ui-cta ui-cta-secondary"
        >
          Back
        </button>
      </div>
    )
  }

  const recordId =
    refund?.refundId || tax?.taxRecordId || escrow?.escrowId || payment?.orderId || id
  const amount = refund
    ? formatInr(refund.amount)
    : tax
      ? formatInr(tax.taxAmount)
      : escrow
        ? formatInr(escrow.amountHeld)
        : payment
          ? formatInr(payment.amount)
          : '—'
  const status = titleCase(
    refund?.status || tax?.filingStatus || escrow?.status || payment?.status || 'Escalated',
  )
  const moduleType = titleCase(
    refund?.module || tax?.module || escrow?.module || payment?.module || resourceType,
  )
  const userId = refund?.beneficiary || escrow?.userId || payment?.userId || '—'
  const userName =
    titleCase(refund?.beneficiary) ||
    escrow?.userName ||
    (typeof snapshot?.userName === 'string' ? snapshot.userName : '') ||
    (typeof snapshot?.customerName === 'string' ? snapshot.customerName : '') ||
    userId
  const userEmail =
    (typeof snapshot?.email === 'string' ? snapshot.email : '') ||
    (typeof snapshot?.userEmail === 'string' ? snapshot.userEmail : '') ||
    '—'
  const assignedTo = assigneeFromQuery || latestEscalate?.escalateToAdminId || 'Assigned admin'
  const escalationNote = latestEscalate?.adminNote || '—'
  const priority = titleCase(latestEscalate?.priority || 'normal')
  const openedDate = formatDate(
    latestEscalate?.createdAt ||
      refund?.createdAt ||
      tax?.createdAt ||
      escrow?.createdAt ||
      payment?.createdAt,
  )
  const paymentMode = refund?.refundMode || payment?.paymentMethod || '—'
  const activeEvidenceId = selectedEvidenceId || evidenceFiles[0]?.id || ''

  const timeline = [
    {
      step: '01',
      title: 'Record created',
      actor: titleCase(payment?.userType) || 'System',
      timestamp: formatDate(
        refund?.createdAt || payment?.createdAt || tax?.createdAt || escrow?.createdAt,
      ),
      description: payment?.description || refund?.reason || 'Finance record created',
    },
    ...escalateNotes
      .slice()
      .reverse()
      .map((note, index) => ({
        step: String(index + 2).padStart(2, '0'),
        title: 'Escalated to Admin',
        actor: assignedTo || 'Admin',
        timestamp: formatDate(note.createdAt),
        description: note.adminNote || 'Escalated for senior review',
      })),
  ]

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return

    files.forEach((file) => {
      addNote.mutate(
        {
          id,
          resourceType: kind === 'refund' ? 'Refund' : resourceType || 'Payment',
          adminNote: `Evidence uploaded: ${file.name}`,
        },
        {
          onSuccess: () => {
            setLocalFiles((current) => [
              {
                id: `${file.name}-${file.lastModified}`,
                fileName: file.name,
                fileSize: `${Math.max(1, Math.round(file.size / 1024))} KB`,
                date: formatDate(new Date().toISOString()),
              },
              ...current,
            ])
            toast.success(`${file.name} added to escalation evidence`)
          },
          onError: () => toast.error(`Failed to attach ${file.name}`),
        },
      )
    })
  }

  return (
    <div className="bg-brand-bg flex flex-col gap-5 pb-6">
      <header>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, crumb.to)}
          className="group text-h3 hover:text-brand-accent text-brand-text flex w-fit items-center gap-2 tracking-tight transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Payment Detail View</span>
        </button>
        <p className="text-body-sm text-muted mt-2 pl-7">
          <Link to={crumb.to} className="transition-colors hover:text-white">
            {crumb.label}
          </Link>
          <span> / </span>
          <span>Payment View Details</span>
          <span> / </span>
          <span className="font-semibold text-white">Escalation</span>
        </p>
      </header>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className={sectionTitleClass}>Escalation Details</h1>
            <p className={sectionSubtitleClass}>
              Complete information related to this escalated finance record.
            </p>
          </div>
          <span className="text-body-sm-medium bg-brand-bg text-brand-text inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-3 py-1.5">
            <Flag className="size-3.5" aria-hidden="true" />
            Escalated to Admin
          </span>
        </div>

        <div className="my-5 border-b border-white/[0.06]" />

        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <div className="flex min-w-max gap-6 sm:grid sm:min-w-0 sm:grid-cols-3 lg:grid-cols-6">
            <InfoItem label="Record ID" value={recordId} />
            <InfoItem label="Transaction ID" value={payment?._id || escrow?.paymentId || id} />
            <InfoItem label="Opened Date" value={openedDate} />
            <InfoItem label="Status" value={<StatusBadge status={status} />} />
            <InfoItem label="Module type" value={moduleType} />
            <InfoItem label="Payment mode" value={paymentMode} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <Card>
            <div className="mb-5">
              <h2 className={sectionTitleClass}>Support Team Assessment</h2>
              <p className={sectionSubtitleClass}>
                Escalated{assignedTo ? ` to ${assignedTo}` : ''} on {openedDate}
              </p>
            </div>

            <div className="space-y-5">
              <AssessmentBlock
                icon={<FileText className="size-4" />}
                title="Support Review Summary"
              >
                <TextPanel>{escalationNote}</TextPanel>
              </AssessmentBlock>
              <AssessmentBlock icon={<AlertCircle className="size-4" />} title="Escalation Reason">
                <TextPanel>{priority} priority</TextPanel>
              </AssessmentBlock>
              <AssessmentBlock
                icon={<Lightbulb className="size-4" />}
                title="Support's Recommendation"
              >
                <TextPanel>
                  <span className="text-body-sm-semibold text-brand-positive">
                    Pending admin decision
                  </span>
                </TextPanel>
              </AssessmentBlock>
              <AssessmentBlock
                icon={<FileText className="size-4" />}
                title="Detailed Notes from Support"
              >
                <TextPanel>{escalationNote}</TextPanel>
              </AssessmentBlock>
            </div>
          </Card>

          <Card>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className={sectionTitleClass}>Client Evidence</h2>
                <p className={sectionSubtitleClass}>
                  Uploaded screenshots and supporting documents
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="ui-cta ui-cta-secondary w-fit"
              >
                <Upload className="size-4" />
                Upload documents
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleUpload}
              />
            </div>

            {evidenceFiles.length === 0 ? (
              <p className="text-body-sm text-muted">No documents uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {evidenceFiles.map((file) => {
                  const selected = activeEvidenceId === file.id
                  return (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => setSelectedEvidenceId(file.id)}
                      className={cn(
                        'radius-lg bg-brand-bg border p-4 text-left transition-colors',
                        selected ? 'border-white' : 'border-white/[0.06] hover:border-white/20',
                      )}
                    >
                      <FileText className="text-muted mb-3 size-8" aria-hidden="true" />
                      <p className="text-body-sm-medium text-brand-text truncate">
                        {file.fileName}
                      </p>
                      <p className="text-body-sm text-muted mt-2">
                        {file.fileSize} · {file.date}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <h2 className={cn(sectionTitleClass, 'mb-4')}>User Information</h2>
            <DetailRow label="User ID" value={userId} />
            <DetailRow label="Name" value={userName} />
            <DetailRow label="Email" value={userEmail} />
          </Card>

          <Card>
            <h2 className={cn(sectionTitleClass, 'mb-4')}>Escalation Summary</h2>
            <DetailRow label="Related Entity ID" value={payment?.referenceId || tax?._id || id} />
            <DetailRow label="Assigned To" value={assignedTo} />
            <DetailRow label="Amount" value={amount} />
            <div className="mt-4 space-y-2">
              <p className={labelClass}>Escalation notes</p>
              <TextPanel>{escalationNote}</TextPanel>
            </div>
          </Card>

          <Card>
            <h2 className={cn(sectionTitleClass, 'mb-5')}>Activity Timeline</h2>
            <div className="space-y-0">
              {timeline.map((item, index) => (
                <div key={`${item.step}-${item.title}`} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="text-body-sm-semibold bg-brand-surface text-brand-text grid size-8 shrink-0 place-items-center rounded-full border border-white/15">
                      {item.step}
                    </div>
                    {index < timeline.length - 1 ? (
                      <div className="my-1 w-px flex-1 bg-white/10" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 pb-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-body-md-semibold text-brand-text">{item.title}</p>
                      <span className="text-body-sm text-muted inline-flex items-center gap-1">
                        <User className="size-3" aria-hidden="true" />
                        {item.actor}
                      </span>
                    </div>
                    <p className="text-body-sm text-muted mt-1">{item.timestamp}</p>
                    <TextPanel className="mt-3">{item.description}</TextPanel>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, crumb.to)}
          className="ui-cta ui-cta-secondary"
        >
          Close
        </button>
        <button
          type="button"
          onClick={() => setIsNoteModalOpen(true)}
          className="ui-cta ui-cta-secondary"
        >
          Add Notes
        </button>
      </div>

      <AddFinanceNoteModal
        open={isNoteModalOpen}
        isSubmitting={addNote.isPending}
        onClose={() => setIsNoteModalOpen(false)}
        onSubmit={(adminNote) => {
          addNote.mutate(
            {
              id,
              resourceType: kind === 'refund' ? 'Refund' : resourceType || 'Payment',
              adminNote,
            },
            {
              onSuccess: () => {
                toast.success('Note saved')
                setIsNoteModalOpen(false)
              },
              onError: () => toast.error('Failed to save note'),
            },
          )
        }}
      />
    </div>
  )
}
