import { Bell, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import { defaultReminderLocalValue } from '../utils/invoice-reminders'

export type SetInvoiceReminderPayload = {
  remindAt: string
  message: string
}

type SetInvoiceReminderModalProps = {
  open: boolean
  invoiceNumber: string
  clientName: string
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (payload: SetInvoiceReminderPayload) => Promise<void> | void
}

export function SetInvoiceReminderModal(props: SetInvoiceReminderModalProps) {
  if (!props.open) return null
  return <SetInvoiceReminderModalInner {...props} />
}

function SetInvoiceReminderModalInner({
  invoiceNumber,
  clientName,
  isSubmitting = false,
  onClose,
  onSubmit,
}: SetInvoiceReminderModalProps) {
  const [remindAt, setRemindAt] = useState(defaultReminderLocalValue)
  const [message, setMessage] = useState('')

  const handleClose = useCallback(() => {
    if (isSubmitting) return
    onClose()
  }, [isSubmitting, onClose])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [handleClose])

  const handleSubmit = async () => {
    const when = remindAt.trim()
    if (!when) {
      toast.error('Reminder date and time is required')
      return
    }
    const parsed = new Date(when)
    if (Number.isNaN(parsed.getTime())) {
      toast.error('Enter a valid reminder date and time')
      return
    }
    if (parsed.getTime() <= Date.now()) {
      toast.error('Reminder must be in the future')
      return
    }

    await onSubmit({
      remindAt: parsed.toISOString(),
      message:
        message.trim() ||
        `Follow up on invoice ${invoiceNumber || '—'} for ${clientName || 'client'}`,
    })
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4"
      role="presentation"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="set-invoice-reminder-title"
        className="ui-modal-shell w-full max-w-[520px] p-0"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal-header">
          <div className="flex items-start gap-3">
            <div className="bg-brand-accent/15 text-brand-accent grid size-10 place-items-center rounded-full">
              <Bell className="size-4" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="set-invoice-reminder-title"
                className="text-h3 text-brand-text tracking-tight"
              >
                Set Reminder
              </h2>
              <p className="text-body-sm text-muted mt-1">
                Schedule a follow-up for invoice{' '}
                <span className="text-brand-text font-medium">{invoiceNumber || '—'}</span>
                {clientName ? (
                  <>
                    {' '}
                    · <span className="text-brand-text font-medium">{clientName}</span>
                  </>
                ) : null}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="text-muted hover:text-brand-text grid size-8 place-items-center rounded-lg transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="ui-modal-body space-y-4">
          <label className="block space-y-2.5">
            <span className="text-body-md-semibold text-brand-text">
              Reminder Date & Time <span className="text-brand-danger">*</span>
            </span>
            <input
              type="datetime-local"
              value={remindAt}
              onChange={(event) => setRemindAt(event.target.value)}
              className="ui-input"
              autoFocus
            />
          </label>
          <label className="block space-y-2.5">
            <span className="text-body-md-semibold text-brand-text">Message</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Optional note for this reminder"
              rows={4}
              className="ui-textarea min-h-[120px]"
            />
          </label>
        </div>

        <div className="ui-modal-footer flex-col sm:flex-row">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="ui-modal-btn ui-modal-btn-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              void handleSubmit()
            }}
            disabled={isSubmitting}
            className="ui-modal-btn ui-modal-btn-gold"
          >
            {isSubmitting ? 'Saving…' : 'Set Reminder'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
