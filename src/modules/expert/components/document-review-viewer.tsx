import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Hourglass, MoreVertical, RefreshCw, Search, X, ZoomIn, ZoomOut } from 'lucide-react'
import { toast } from 'sonner'
import digilockerIcon from '@/assets/JOMS_ICONS-2/icons8-document_FAQ_digilocker.svg'

import {
  DecisionActionModal,
  type DecisionActionModalOption,
} from '@/shared/components/modal/decision-action-modal'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { fetchPartnerDocumentBlob } from '../api/expert-onboarding-api'
import type { DocumentStatusPayload } from '../type/expert-application-view'
import {
  resolveDocumentReviewStatus,
  type DocumentDecisionVariant,
  type DocumentReviewStatus,
} from '../utils/document-review'

export type { DocumentDecisionVariant, DocumentReviewStatus, DocumentStatusPayload }

type PartnerDocumentType = 'pan-card' | 'certificate' | 'gst-certificate'

type DocumentReviewViewerProps = {
  open: boolean
  url: string
  filename: string
  reviewStatus?: DocumentReviewStatus | null
  reasonOptions: DecisionActionModalOption[]
  requestChangesReasonOptions?: DecisionActionModalOption[]
  actionsDisabled?: boolean
  hideActions?: boolean
  isSubmitting?: boolean
  mimeType?: string
  /** When set, load via backend proxy (avoids Cloudinary browser CORS / attachment issues). */
  partnerId?: string
  documentType?: PartnerDocumentType
  onClose: () => void
  onSubmitDecision: (variant: DocumentDecisionVariant, payload: DocumentStatusPayload) => void
}

const isCloudinaryUrl = (url: string) => /res\.cloudinary\.com|api\.cloudinary\.com/i.test(url)

const isPdfFile = (url: string, filename: string, mimeType?: string) => {
  if (mimeType === 'application/pdf') return true
  const cleanUrl = url.split('?')[0]?.toLowerCase() || ''
  const cleanName = filename.toLowerCase()
  if (
    cleanUrl.endsWith('.pdf') ||
    cleanName.endsWith('.pdf') ||
    cleanUrl.includes('application/pdf')
  ) {
    return true
  }
  // Cloudinary raw/image PDF delivery paths often keep `.pdf` in public_id;
  // private download URLs use `format=pdf` instead.
  if (isCloudinaryUrl(url)) {
    const lower = url.toLowerCase()
    if (lower.includes('format=pdf') || lower.includes('/raw/upload/')) return true
    if (/\.pdf(?:$|[/?#])/i.test(cleanUrl)) return true
  }
  return false
}

const isImageFile = (url: string, filename: string, mimeType?: string) => {
  if (mimeType?.startsWith('image/')) return true
  const cleanUrl = url.split('?')[0]?.toLowerCase() || ''
  const cleanName = filename.toLowerCase()
  const pattern = /\.(png|jpe?g|gif|webp|bmp|svg|avif)$/
  return pattern.test(cleanUrl) || pattern.test(cleanName) || cleanUrl.includes('image/')
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
  return <DocumentReviewViewerContent key={url} open={open} url={url} {...props} />
}

type DocumentReviewViewerContentProps = DocumentReviewViewerProps

function DocumentReviewViewerContent({
  open,
  url,
  filename,
  reviewStatus,
  reasonOptions,
  requestChangesReasonOptions,
  actionsDisabled = false,
  hideActions = false,
  isSubmitting = false,
  mimeType,
  partnerId,
  documentType,
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
  const [loadError, setLoadError] = useState<string | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  const [blobData, setBlobData] = useState<{
    url: string | null
    type: string | null
    isLoading: boolean
  }>({
    url: null,
    type: null,
    isLoading: false,
  })

  useEffect(() => {
    if (!open || (!url && !(partnerId && documentType))) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBlobData({ url: null, type: null, isLoading: false })
      setLoadError(null)
      return
    }

    if (url.startsWith('blob:') || url.startsWith('data:')) {
      setBlobData({ url, type: mimeType || null, isLoading: false })
      setLoadError(null)
      return
    }

    let isMounted = true
    setBlobData((prev) => ({ ...prev, isLoading: true }))
    setLoadError(null)

    const revokePrevious = () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
    }

    const applyBlob = (blob: Blob) => {
      if (!isMounted) return
      revokePrevious()
      let actualBlob = blob
      if (
        blob.type === 'application/pdf' ||
        filename.toLowerCase().endsWith('.pdf') ||
        isPdfFile(url, filename, mimeType)
      ) {
        actualBlob = new Blob([blob], { type: 'application/pdf' })
      }
      const objectUrl = URL.createObjectURL(actualBlob)
      objectUrlRef.current = objectUrl
      setBlobData({
        url: objectUrl,
        type: actualBlob.type,
        isLoading: false,
      })
    }

    const load = async () => {
      try {
        // Same-origin proxy avoids Cloudinary CORS + Content-Disposition: attachment.
        if (partnerId && documentType) {
          const blob = await fetchPartnerDocumentBlob(partnerId, documentType)
          applyBlob(blob)
          return
        }

        // Browser fetch to Cloudinary usually fails CORS. Embed the delivery URL
        // directly for PDFs/images instead of converting to a blob.
        if (isCloudinaryUrl(url)) {
          if (isMounted) {
            setBlobData({
              url: null,
              type: isPdfFile(url, filename, mimeType) ? 'application/pdf' : mimeType || null,
              isLoading: false,
            })
          }
          return
        }

        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to fetch document')
        applyBlob(await res.blob())
      } catch (error) {
        if (!isMounted) return
        setLoadError(error instanceof Error ? error.message : 'Failed to load document')
        setBlobData({
          url: null,
          type: mimeType || (isPdfFile(url, filename, mimeType) ? 'application/pdf' : null),
          isLoading: false,
        })
      }
    }

    void load()

    return () => {
      isMounted = false
      revokePrevious()
    }
  }, [open, url, filename, mimeType, partnerId, documentType])

  const actualUrl = blobData.url || url
  const actualMimeType = blobData.type || mimeType

  const resolvedReviewStatus = hideActions ? null : resolveDocumentReviewStatus(url, reviewStatus)
  const decisionActionsDisabled =
    hideActions || actionsDisabled || resolvedReviewStatus === 'APPROVED' || isSubmitting

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

  const showPdf = useMemo(
    () => isPdfFile(actualUrl, filename, actualMimeType || ''),
    [actualUrl, filename, actualMimeType],
  )
  const showImage = useMemo(
    () => !showPdf && isImageFile(actualUrl, filename, actualMimeType || ''),
    [actualUrl, filename, actualMimeType, showPdf],
  )

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
            {hideActions ? null : resolvedReviewStatus === 'APPROVED' ? (
              <p className="text-body-sm text-brand-positive font-medium">Approved</p>
            ) : resolvedReviewStatus === 'REJECTED' && decisionActionsDisabled ? (
              <p className="text-body-sm text-brand-danger font-medium">Rejected</p>
            ) : decisionActionsDisabled ? (
              <p className="text-body-sm text-muted font-medium">
                Actions unavailable for this document
              </p>
            ) : null}
          </div>
        </div>

        {!hideActions ? (
          decisionActionsDisabled ? (
            <button
              type="button"
              aria-label="Document actions"
              disabled
              className="flex size-6 items-center justify-center rounded text-white/40"
            >
              <MoreVertical className="icon-sm" aria-hidden="true" />
            </button>
          ) : (
            <TableActionsDropdown
              label="Document actions"
              isOpen={menuOpen}
              onOpenChange={setMenuOpen}
              menuWidth={240}
              buttonClassName="text-white/80 hover:text-white hover:bg-white/10"
            >
              <TableActionsItem
                className="whitespace-nowrap"
                onClick={() => openDecisionModal('approve')}
                icon={
                  <span className="bg-brand-positive flex size-6 items-center justify-center rounded-full text-white">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                }
              >
                Approve Document
              </TableActionsItem>
              <TableActionsItem
                className="whitespace-nowrap"
                onClick={() => openDecisionModal('reject')}
                icon={
                  <span className="bg-brand-danger flex size-6 items-center justify-center rounded-full text-white">
                    <X className="size-3.5" strokeWidth={3} />
                  </span>
                }
              >
                Reject Document
              </TableActionsItem>
              <TableActionsItem
                className="whitespace-nowrap"
                onClick={() => openDecisionModal('requestChanges')}
                icon={
                  <span className="bg-brand-teal flex size-6 items-center justify-center rounded-full text-white">
                    <RefreshCw className="size-3.5" strokeWidth={2.5} />
                  </span>
                }
              >
                Request Changes
              </TableActionsItem>
            </TableActionsDropdown>
          )
        ) : null}
      </header>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto px-4 pt-2 pb-24">
        {blobData.isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="border-brand-accent size-10 animate-spin rounded-full border-4 border-t-transparent" />
            <p className="text-body-sm text-white/80">Loading document...</p>
          </div>
        ) : showPdf && actualUrl ? (
          <div className="flex h-full min-h-[70vh] w-full max-w-5xl flex-col gap-3">
            <iframe
              title={filename}
              src={`${actualUrl}#toolbar=1&navpanes=0`}
              className="h-full min-h-[70vh] w-full flex-1 rounded-md bg-white"
            />
            <a
              href={url || actualUrl}
              target="_blank"
              rel="noreferrer"
              className="text-brand-accent text-center text-sm font-semibold underline"
            >
              Open PDF in new tab
            </a>
          </div>
        ) : showImage && actualUrl ? (
          <img
            src={actualUrl}
            alt={filename}
            className="max-h-[78vh] max-w-full object-contain shadow-2xl transition-transform"
            style={{ transform: `scale(${zoom})` }}
          />
        ) : (
          <div className="rounded-lg border border-white/10 bg-white/5 px-6 py-8 text-center">
            <p className="text-sm text-white/80">
              {loadError || 'Preview unavailable for this file type.'}
            </p>
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-brand-accent mt-3 inline-flex text-sm font-semibold underline"
              >
                Open in new tab
              </a>
            ) : null}
          </div>
        )}
      </div>

      {showImage && !showPdf && (
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
      )}

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
          <img src={digilockerIcon} alt="" className="size-3.5 brightness-0 invert" />
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
