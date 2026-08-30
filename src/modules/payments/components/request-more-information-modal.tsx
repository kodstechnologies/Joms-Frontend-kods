import { X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { FinanceDetailRow as BaseDetailRow } from '@/modules/payments/components/finance-detail-layout'

const DetailRow = (props: Parameters<typeof BaseDetailRow>[0]) => (
  <BaseDetailRow compact {...props} />
)

export type RequestMoreInformationModalData = {
  denyAmount: string
  denyFromName: string
  userName: string
  reason: string
  evidenceCount: number
}

type RequestMoreInformationModalProps = {
  open: boolean
  data: RequestMoreInformationModalData
  onClose: () => void
  onSubmit?: (payload: { requestInformation: string; adminNotes: string }) => void | Promise<void>
}

export function RequestMoreInformationModal({
  open,
  data,
  onClose,
  onSubmit,
}: RequestMoreInformationModalProps) {
  const [requestInformation, setRequestInformation] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  const handleClose = useCallback(() => {
    setRequestInformation('')
    setAdminNotes('')
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, handleClose])

  const handleSubmit = async () => {
    if (!requestInformation.trim()) {
      toast.error('Request information is required')
      return
    }

    try {
      await onSubmit?.({ requestInformation, adminNotes })
      handleClose()
    } catch {
      // Parent surfaces API errors via toast
    }
  }

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 sm:p-4"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="ui-modal-shell max-h-[92dvh] max-w-xl sm:max-h-[min(92dvh,860px)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-more-info-title"
      >
        <div className="ui-modal-header">
          <h2 id="request-more-info-title" className="text-h2 text-brand-text">
            Request More Information
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close request more information modal"
            className="text-muted hover:text-brand-text grid size-9 place-items-center rounded-lg transition-colors hover:bg-white/5"
          >
            <X className="icon-md" />
          </button>
        </div>

        <div className="ui-modal-body space-y-5">
          <p className="text-body-md text-brand-text">
            You are about to deny the refund request of{' '}
            <span className="font-semibold">{data.denyAmount}</span> from{' '}
            <span className="font-semibold">{data.denyFromName}</span>
          </p>

          <div className="radius-lg bg-brand-bg space-y-3 border border-white/10 p-4">
            <DetailRow label="User" value={data.userName} />
            <DetailRow label="Reason" value={data.reason} />
            <DetailRow label="Current Evidence" value={`${data.evidenceCount} item(s) submitted`} />
          </div>

          <div className="radius-md border-brand-accent/20 bg-brand-accent/10 border p-4">
            <p className="text-body-md text-brand-accent">What happens next:</p>
            <p className="text-body-md text-brand-text mt-2 max-w-[475px]">
              The dispute status will change to &quot;Pending User Response&quot; and the user will
              be notified to provide the requested information. The SLA timer will be paused until
              they respond.
            </p>
          </div>

          <label className="block space-y-2.5">
            <span className="text-body-md-semibold text-brand-text">
              Request Information <span className="text-brand-danger">*</span>
            </span>
            <input
              type="text"
              value={requestInformation}
              onChange={(event) => setRequestInformation(event.target.value)}
              placeholder="Enter Text Here"
              className="ui-input"
            />
          </label>

          <label className="block space-y-2.5">
            <span className="text-body-md-semibold text-brand-text">Admin Notes</span>
            <textarea
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              placeholder="Enter Text Here"
              rows={3}
              className="ui-textarea min-h-[88px]"
            />
          </label>
        </div>

        <div className="ui-modal-footer flex-col sm:flex-row">
          <button type="button" onClick={handleClose} className="ui-modal-btn ui-modal-btn-cancel">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="ui-modal-btn ui-modal-btn-gold">
            Submit
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
