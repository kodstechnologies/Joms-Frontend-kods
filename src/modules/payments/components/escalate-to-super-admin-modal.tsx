import { Shield, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/shared/lib/cn'

export type EscalationPriority = 'urgent' | 'high' | 'normal'

type EscalateToSuperAdminModalProps = {
  open: boolean
  refundId: string
  requestedBy: string
  amount: string
  assigneeName?: string
  recordIdLabel?: string
  requestedByLabel?: string
  isSubmitting?: boolean
  onClose: () => void
  onSubmit?: (payload: { priority: EscalationPriority; adminNotes: string }) => void | Promise<void>
}

const priorityOptions: Array<{
  id: EscalationPriority
  label: string
  description: string
}> = [
  { id: 'urgent', label: 'Urgent', description: 'Immediate attention required' },
  { id: 'high', label: 'High', description: 'Review within 24 hours' },
  { id: 'normal', label: 'Normal', description: 'Review within 2-3 business days' },
]

const infoCardClass = 'radius-lg border border-white/[0.06] bg-brand-bg p-4 sm:p-5'

export function EscalateToSuperAdminModal({
  open,
  refundId,
  requestedBy,
  amount,
  recordIdLabel = 'Refund ID',
  requestedByLabel = 'Requested By',
  isSubmitting = false,
  onClose,
  onSubmit,
}: EscalateToSuperAdminModalProps) {
  const [priority, setPriority] = useState<EscalationPriority>('normal')
  const [adminNotes, setAdminNotes] = useState('')

  const handleClose = useCallback(() => {
    if (isSubmitting) return
    setPriority('normal')
    setAdminNotes('')
    onClose()
  }, [isSubmitting, onClose])

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
    if (isSubmitting) return
    const notes = adminNotes.trim()
    if (!notes) return
    try {
      await onSubmit?.({ priority, adminNotes: notes })
      handleClose()
    } catch {
      // submit error surfaced by parent
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
        className="ui-modal-shell max-h-[92dvh] max-w-lg sm:max-h-[min(90dvh,720px)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="escalate-super-admin-title"
      >
        <div className="ui-modal-header">
          <h2 id="escalate-super-admin-title" className="text-h4 text-brand-text pr-2">
            Escalate to Super Admin
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close escalation modal"
            className="text-muted hover:text-brand-text grid size-9 shrink-0 place-items-center rounded-lg transition-colors hover:bg-white/5"
          >
            <X className="icon-md" />
          </button>
        </div>

        <div className="ui-modal-body space-y-4 sm:space-y-5">
          <div className="space-y-4">
            <div className={infoCardClass}>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-brand-bg text-muted grid size-10 shrink-0 place-items-center rounded-full border border-white/10 sm:size-11">
                  <Shield className="icon-sm" />
                </div>
                <div className="min-w-0">
                  <p className="text-body-sm text-muted">Escalate to Super Admin</p>
                  <p className="text-body-md-semibold text-brand-text mt-0.5">
                    This case requires Super Admin review and decision
                  </p>
                </div>
              </div>
            </div>

            <div className={cn(infoCardClass, 'space-y-3')}>
              <InfoRow label={recordIdLabel} value={refundId} />
              <InfoRow label={requestedByLabel} value={requestedBy} />
              <InfoRow label="Amount" value={amount} />
            </div>
          </div>

          <div>
            <p className="text-body-md-medium text-brand-text mb-3">Priority Level</p>
            <div className="space-y-2.5">
              {priorityOptions.map((option) => {
                const selected = priority === option.id

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPriority(option.id)}
                    className={cn(
                      'radius-lg flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors',
                      selected
                        ? 'bg-brand-accent text-brand-text-dark'
                        : 'bg-brand-bg text-brand-text border border-white/[0.06] hover:border-white/15',
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="text-body-md-semibold block">{option.label}</span>
                      <span
                        className={cn(
                          'text-body-sm mt-0.5 block',
                          selected ? 'text-brand-text-dark/70' : 'text-muted',
                        )}
                      >
                        {option.description}
                      </span>
                    </span>
                    <span
                      className={cn(
                        'grid size-4 shrink-0 place-items-center rounded-full border-2',
                        selected
                          ? 'border-brand-text-dark bg-transparent'
                          : 'border-brand-muted bg-transparent',
                      )}
                    >
                      {selected ? (
                        <span className="bg-brand-text-dark size-1.5 rounded-full" />
                      ) : null}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <label className="block space-y-2 sm:space-y-2.5">
            <span className="text-body-md-medium text-brand-text">Admin Notes</span>
            <textarea
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              placeholder="Enter Text Here"
              rows={4}
              className="ui-textarea min-h-28"
            />
          </label>
        </div>

        <div className="ui-modal-footer flex-col-reverse sm:flex-row">
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
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !adminNotes.trim()}
            className="ui-modal-btn ui-modal-btn-cancel"
          >
            {isSubmitting ? 'Escalating...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-body-sm text-muted">{label}</span>
      <span className="text-body-sm-medium text-brand-text text-right">{value}</span>
    </div>
  )
}
