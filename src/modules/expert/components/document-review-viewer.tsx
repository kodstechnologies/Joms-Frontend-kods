import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  FileText,
  Hourglass,
  MoreVertical,
  RefreshCw,
  Search,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import type { DocumentStatusPayload } from '../type/expert-application-view'
import {
  resolveDocumentReviewStatus,
  type DocumentDecisionVariant,
  type DocumentReviewStatus,
} from '../utils/document-review'

export type { DocumentDecisionVariant, DocumentReviewStatus, DocumentStatusPayload }

type DocumentReviewViewerProps = {
  open: boolean
  url: string
  filename: string
  reviewStatus?: DocumentReviewStatus | null
  reasonOptions: DecisionActionModalOption[]
  requestChangesReasonOptions?: DecisionActionModalOption[]
  actionsDisabled?: boolean
  isSubmitting?: boolean
  onClose: () => void
  onSubmitDecision: (variant: DocumentDecisionVariant, payload: DocumentStatusPayload) => void
}

const isPdfUrl = (url: string) => {
  const clean = url.split('?')[0]?.toLowerCase() || ''
  return clean.endsWith('.pdf')
}

const isImageUrl = (url: string) => {
  const clean = url.split('?')[0]?.toLowerCase() || ''
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(clean)
}

const getFileTypeLabel = (url?: string | null) => {
  if (!url) return 'FILE'
  const extension = url.split('?')[0]?.split('.').pop()?.toUpperCase()
  if (!extension || extension.length > 5) return 'FILE'
  return extension
}

const formatDocumentDate = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-GB')
}

export function DocumentReviewViewer({ open, url, ...props }: DocumentReviewViewerProps) {
  if (!open) return null
  return <DocumentReviewViewerContent key={url} url={url} {...props} />
}

type DocumentReviewViewerContentProps = Omit<DocumentReviewViewerProps, 'open'>

function DocumentReviewViewerContent({
  url,
  filename,
  reviewStatus,
  reasonOptions,
  requestChangesReasonOptions,
  actionsDisabled = false,
  isSubmitting = false,
  onClose,
  onSubmitDecision,
}: DocumentReviewViewerContentProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalVariant, setModalVariant] = useState<DocumentDecisionVariant>('approve')
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [rejectionReason, setRejectionReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  const resolvedReviewStatus = resolveDocumentReviewStatus(url, reviewStatus)
  const decisionActionsDisabled =
    actionsDisabled ||
    resolvedReviewStatus === 'APPROVED' ||
    resolvedReviewStatus === 'REJECTED' ||
    isSubmitting

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [menuOpen])

  const openDecisionModal = (variant: DocumentDecisionVariant) => {
    if (decisionActionsDisabled) return
    setMenuOpen(false)
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

  const handleSubmit = () => {
    if (decisionActionsDisabled) return

    const isRejectFlow = modalVariant === 'reject' || modalVariant === 'requestChanges'
    if (isRejectFlow) {
      if (selectedReasons.length === 0) return toast.error('Please select at least one reason.')
      if (!rejectionReason.trim()) return toast.error('Please provide a rejection reason.')
    }
    if (!adminNotes.trim()) return toast.error('Admin notes are required.')

    const payload: DocumentStatusPayload =
      modalVariant === 'approve'
        ? { status: 'APPROVED', adminNote: adminNotes.trim() }
        : {
            status: 'REJECTED',
            reasonFor: selectedReasons,
            rejectionReason: rejectionReason.trim(),
            adminNote: adminNotes.trim(),
          }

    onSubmitDecision(modalVariant, payload)
  }

  const modalCopy = useMemo(() => {
    if (modalVariant === 'approve') {
      return {
        title: 'Approve Document',
        description:
          'Are you sure you want to approve this Document? The applicant will be notified via email.',
        submitLabel: 'Confirm Approval',
        reasonLabel: 'Reason',
      }
    }
    if (modalVariant === 'requestChanges') {
      return {
        title: 'Request Changes',
        description:
          'Are you sure you want to Request Changes to this application? The applicant will be notified via email.',
        submitLabel: 'Request Changes',
        reasonLabel: 'Request Change',
      }
    }
    return {
      title: 'Reject Document',
      description:
        'Are you sure you want to reject this Document? The applicant will be notified via email.',
      submitLabel: 'Confirm Rejection',
      reasonLabel: 'Reason',
    }
  }, [modalVariant])

  const showPdf = isPdfUrl(url)
  const showImage = !showPdf && (isImageUrl(url) || Boolean(url))

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/95 text-white">
      <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Close document viewer"
            onClick={onClose}
            className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" />
          </button>
          <div className="min-w-0">
            <p className="text-body-md-semibold truncate text-white">{filename}</p>
            {resolvedReviewStatus === 'APPROVED' ? (
              <p className="text-body-sm text-brand-positive font-medium">Approved</p>
            ) : resolvedReviewStatus === 'REJECTED' ? (
              <p className="text-body-sm text-brand-danger font-medium">Rejected</p>
            ) : decisionActionsDisabled ? (
              <p className="text-body-sm text-muted font-medium">
                Actions unavailable for this document
              </p>
            ) : null}
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Document actions"
            disabled={decisionActionsDisabled}
            onClick={() => {
              if (decisionActionsDisabled) return
              setMenuOpen((openMenu) => !openMenu)
            }}
            className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-white/80"
          >
            <MoreVertical className="size-5" />
          </button>

          {menuOpen && !decisionActionsDisabled ? (
            <div className="ui-table-actions-menu absolute top-full right-0 z-10 mt-2">
              <button
                type="button"
                onClick={() => openDecisionModal('approve')}
                className="ui-table-actions-item"
              >
                <span className="bg-brand-positive flex size-6 items-center justify-center rounded-full text-white">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                Approve Document
              </button>
              <button
                type="button"
                onClick={() => openDecisionModal('reject')}
                className="ui-table-actions-item"
              >
                <span className="bg-brand-danger flex size-6 items-center justify-center rounded-full text-white">
                  <X className="size-3.5" strokeWidth={3} />
                </span>
                Reject Document
              </button>
              <button
                type="button"
                onClick={() => openDecisionModal('requestChanges')}
                className="ui-table-actions-item"
              >
                <span className="bg-brand-teal flex size-6 items-center justify-center rounded-full text-white">
                  <RefreshCw className="size-3.5" strokeWidth={2.5} />
                </span>
                Request Changes
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto px-4 pt-2 pb-24">
        {showPdf ? (
          <iframe
            title={filename}
            src={url}
            className="h-full min-h-[70vh] w-full max-w-5xl rounded-md bg-white"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center top' }}
          />
        ) : showImage ? (
          <img
            src={url}
            alt={filename}
            className="max-h-[78vh] max-w-full object-contain shadow-2xl transition-transform"
            style={{ transform: `scale(${zoom})` }}
          />
        ) : (
          <div className="rounded-lg border border-white/10 bg-white/5 px-6 py-8 text-center">
            <p className="text-sm text-white/80">Preview unavailable for this file type.</p>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-brand-accent mt-3 inline-flex text-sm font-semibold underline"
            >
              Open in new tab
            </a>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
        <div className="bg-brand-surface/95 pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 px-2 py-1.5 shadow-lg backdrop-blur">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setZoom((value) => Math.max(0.5, Number((value - 0.1).toFixed(2))))}
            className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ZoomOut className="size-4" />
          </button>
          <span className="flex size-8 items-center justify-center text-white/70">
            <Search className="size-4" />
          </span>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setZoom((value) => Math.min(3, Number((value + 0.1).toFixed(2))))}
            className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ZoomIn className="size-4" />
          </button>
        </div>
      </div>

      <DecisionActionModal
        open={modalOpen}
        variant={modalVariant}
        title={modalCopy.title}
        description={modalCopy.description}
        submitLabel={modalCopy.submitLabel}
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        reason={rejectionReason}
        onReasonChange={
          modalVariant === 'reject' || modalVariant === 'requestChanges'
            ? setRejectionReason
            : undefined
        }
        reasonLabel={modalCopy.reasonLabel}
        reasonOptions={
          modalVariant === 'requestChanges'
            ? requestChangesReasonOptions || reasonOptions
            : modalVariant === 'reject'
              ? reasonOptions
              : []
        }
        selectedReasons={selectedReasons}
        onReasonToggle={toggleReason}
        isSubmitting={isSubmitting}
        submitIcon={modalVariant === 'reject' ? 'x' : 'check'}
      />
    </div>
  )
}

type DocumentCardProps = {
  label: string
  url?: string | null
  reviewStatus?: DocumentReviewStatus | null
  uploadedAt?: string | null
  onView?: () => void
}

export function ReviewableDocumentCard({
  label,
  url,
  reviewStatus,
  uploadedAt,
  onView,
}: DocumentCardProps) {
  const status = resolveDocumentReviewStatus(url, reviewStatus)
  const fileType = getFileTypeLabel(url)
  const dateLabel = formatDocumentDate(uploadedAt)
  const meta = !url
    ? 'Not uploaded'
    : [fileType, dateLabel].filter(Boolean).join(' • ') || `${fileType} Document`

  return (
    <div className="rounded-lg border border-white/5 bg-black p-4">
      <div className="flex items-start gap-2">
        {status === 'APPROVED' ? (
          <Check className="text-brand-positive mt-0.5 size-4 shrink-0" strokeWidth={3} />
        ) : status === 'REJECTED' ? (
          <X className="text-brand-danger mt-0.5 size-4 shrink-0" strokeWidth={3} />
        ) : status === 'PENDING' ? (
          <Hourglass className="text-brand-accent mt-0.5 size-4 shrink-0" />
        ) : (
          <span className="mt-0.5 size-4 shrink-0 rounded-full border border-white/10" />
        )}
        <div className="min-w-0">
          <p className="text-body-sm-semibold truncate text-white">{label}</p>
          <p className="text-muted text-[10px]">{meta}</p>
        </div>
      </div>
      {url ? (
        <button
          type="button"
          onClick={onView}
          className="text-body-sm bg-brand-surface mt-3 flex w-full items-center justify-center gap-1.5 rounded-md py-2 font-semibold text-white transition-colors hover:bg-white/7"
        >
          <FileText className="size-3.5" />
          View Document
        </button>
      ) : (
        <div className="text-body-sm bg-brand-surface text-muted mt-3 flex w-full items-center justify-center rounded-md py-2 font-medium">
          Not uploaded
        </div>
      )}
    </div>
  )
}
