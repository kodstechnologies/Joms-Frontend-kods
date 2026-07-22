import { Shield, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import { cn } from '@/shared/lib/cn'

export type EscalationPriority = 'urgent' | 'high' | 'normal'

type EscalateToSuperAdminModalProps = {
  open: boolean
  refundId: string
  requestedBy: string
  amount: string
  onClose: () => void
  onSubmit?: (payload: { priority: EscalationPriority; adminNotes: string }) => void
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

export function EscalateToSuperAdminModal({
  open,
  refundId,
  requestedBy,
  amount,
  onClose,
  onSubmit,
}: EscalateToSuperAdminModalProps) {
  const [priority, setPriority] = useState<EscalationPriority>('normal')
  const [adminNotes, setAdminNotes] = useState('')

  const handleClose = useCallback(() => {
    setPriority('normal')
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

  const handleSubmit = () => {
    onSubmit?.({ priority, adminNotes })
    toast.success('Escalated to Super Admin')
    handleClose()
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
          <h2 id="escalate-super-admin-title" className="text-h4 text-brand-text">
            Escalate to Super Admin
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close escalation modal"
            className="text-muted hover:text-brand-text grid size-9 place-items-center rounded-lg transition-colors hover:bg-white/5"
          >
            <X className="icon-md" />
          </button>
        </div>

        <div className="ui-modal-body space-y-5">
          <div className="radius-lg bg-brand-bg border border-white/10 p-4">
            <div className="mb-4 flex items-start gap-3 border-b border-white/10 pb-4">
              <div className="bg-brand-bg text-muted grid size-10 shrink-0 place-items-center rounded-full border border-white/10">
                <Shield className="icon-sm" />
              </div>
              <div>
                <p className="text-body-md-semibold text-brand-text">Escalate to Super Admin</p>
                <p className="text-body-sm text-muted mt-1">
                  This case requires Super Admin review and decision
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <InfoRow label="Refund ID" value={refundId} />
              <InfoRow label="Requested By" value={requestedBy} />
              <InfoRow label="Amount" value={amount} />
            </div>
          </div>

          <div>
            <p className="text-body-sm text-muted mb-3">Priority Level</p>
            <div className="space-y-2.5">
              {priorityOptions.map((option) => {
                const selected = priority === option.id

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPriority(option.id)}
                    className={cn(
                      'radius-lg flex w-full items-center gap-3 border px-4 py-3.5 text-left transition-colors',
                      selected
                        ? 'border-brand-accent/50 bg-brand-accent text-brand-bg'
                        : 'bg-brand-bg text-brand-text border-white/10 hover:border-white/15',
                    )}
                  >
                    <span
                      className={cn(
                        'grid size-4 shrink-0 place-items-center rounded-full border-2',
                        selected
                          ? 'border-brand-bg bg-brand-bg'
                          : 'border-brand-muted bg-transparent',
                      )}
                    >
                      {selected ? <span className="bg-brand-text size-1.5 rounded-full" /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="text-body-md-semibold block">{option.label}</span>
                      <span
                        className={cn(
                          'text-body-sm mt-0.5 block',
                          selected ? 'text-brand-bg/70' : 'text-muted',
                        )}
                      >
                        {option.description}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <label className="block space-y-2.5">
            <span className="text-body-sm text-muted">Admin Notes</span>
            <textarea
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              placeholder="Enter Text Here"
              rows={4}
              className="ui-textarea"
            />
          </label>
        </div>

        <div className="ui-modal-footer">
          <button type="button" onClick={handleClose} className="ui-modal-btn ui-modal-btn-cancel">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="ui-modal-btn ui-modal-btn-cancel">
            Submit
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
