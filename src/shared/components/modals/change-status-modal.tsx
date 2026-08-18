import { ArrowLeftRight, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import { cn } from '@/shared/lib/cn'

export type StatusOption = {
  value: string
  label: string
  description?: string
}

type ChangeStatusModalProps = {
  open: boolean
  title?: string
  recordLabel?: string
  currentStatus?: string
  options: StatusOption[]
  onClose: () => void
  onSubmit?: (payload: { status: string; adminNotes: string }) => void | Promise<void>
}

export function ChangeStatusModal(props: ChangeStatusModalProps) {
  if (!props.open) return null
  return <ChangeStatusModalInner {...props} />
}

function ChangeStatusModalInner({
  title = 'Change Status',
  recordLabel,
  currentStatus,
  options,
  onClose,
  onSubmit,
}: ChangeStatusModalProps) {
  const [status, setStatus] = useState(() => {
    const match = options.find(
      (option) => option.value === currentStatus || option.label === currentStatus,
    )
    return match?.value || options[0]?.value || ''
  })
  const [adminNotes, setAdminNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

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
    if (!status) {
      toast.error('Select a status')
      return
    }
    if (!adminNotes.trim()) {
      toast.error('Admin notes are required')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit?.({ status, adminNotes: adminNotes.trim() })
      if (!onSubmit) toast.success('Status updated')
      handleClose()
    } catch {
      // Parent surfaces API errors
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 sm:p-4"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="ui-modal-shell max-h-[92dvh] max-w-lg"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-status-title"
      >
        <div className="ui-modal-header">
          <h2 id="change-status-title" className="text-h2 text-brand-text">
            {title}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close change status modal"
            className="text-muted hover:text-brand-text grid size-9 place-items-center rounded-lg transition-colors hover:bg-white/5"
          >
            <X className="icon-md" />
          </button>
        </div>

        <div className="ui-modal-body space-y-5">
          <div className="radius-lg bg-brand-bg flex items-start gap-3 border border-white/10 p-4">
            <div className="bg-brand-bg text-muted grid size-10 shrink-0 place-items-center rounded-full border border-white/10">
              <ArrowLeftRight className="icon-sm" />
            </div>
            <div className="min-w-0">
              <p className="text-body-md-semibold text-brand-text">Update lifecycle status</p>
              <p className="text-body-sm text-muted mt-1">
                {recordLabel ? `${recordLabel} · ` : ''}
                Current: {currentStatus || '—'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-body-sm-medium text-brand-text mb-3">Select status</p>
            <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
              {options.map((option) => {
                const selected = status === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatus(option.value)}
                    className={cn(
                      'radius-lg flex w-full items-start gap-3 border px-4 py-3 text-left transition-colors',
                      selected
                        ? 'border-brand-accent/50 bg-brand-accent/15 text-brand-text'
                        : 'bg-brand-bg text-brand-text border-white/10 hover:border-white/20',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border-2',
                        selected
                          ? 'border-brand-accent bg-brand-accent'
                          : 'border-brand-muted bg-transparent',
                      )}
                    >
                      {selected ? <span className="bg-brand-bg size-1.5 rounded-full" /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="text-body-md-semibold block">{option.label}</span>
                      {option.description ? (
                        <span className="text-body-sm text-muted mt-0.5 block">
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <label className="block space-y-2">
            <span className="text-body-sm-medium text-brand-text">
              Admin notes <span className="text-brand-danger">*</span>
            </span>
            <textarea
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              placeholder="Reason for status change (audit trail)"
              className="ui-textarea"
              rows={3}
            />
          </label>
        </div>

        <div className="ui-modal-footer">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="ui-modal-btn ui-modal-btn-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="ui-modal-btn ui-modal-btn-gold"
          >
            {submitting ? 'Saving…' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
