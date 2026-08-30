import { useState } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

export type ExtendSuspensionFormValues = {
  subscriptionId: string
  startDate: string
  endDate: string
  adminNotes: string
}

type ExtendSuspensionModalProps = {
  open: boolean
  onClose: () => void
  onSubmit: (values: ExtendSuspensionFormValues) => Promise<void>
  isSubmitting?: boolean
}

const defaultStart = () => {
  const date = new Date()
  date.setMinutes(0, 0, 0)
  return date.toISOString().slice(0, 16)
}

const defaultEnd = () => {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  date.setMinutes(0, 0, 0)
  return date.toISOString().slice(0, 16)
}

export function ExtendSuspensionModal({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
}: ExtendSuspensionModalProps) {
  const [subscriptionId, setSubscriptionId] = useState('')
  const [startDate, setStartDate] = useState(defaultStart)
  const [endDate, setEndDate] = useState(defaultEnd)
  const [adminNotes, setAdminNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setSubscriptionId('')
    setStartDate(defaultStart())
    setEndDate(defaultEnd())
    setAdminNotes('')
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async () => {
    setError(null)
    if (!subscriptionId.trim()) {
      setError('Subscription ID is required')
      return
    }
    if (!startDate || !endDate) {
      setError('Start and end dates are required')
      return
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be after start date')
      return
    }

    try {
      await onSubmit({
        subscriptionId: subscriptionId.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        adminNotes: adminNotes.trim(),
      })
      resetForm()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to extend suspension')
    }
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <div className="ui-modal-shell max-w-[720px]">
        <div className="ui-modal-header">
          <div>
            <h2 className="text-h2 text-brand-text">Extend Suspension</h2>
            <p className="text-body-sm text-muted mt-1">
              Extend a suspended membership by subscription record ID
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-brand-muted rounded-full p-1.5 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="icon-lg" aria-hidden="true" />
          </button>
        </div>

        <div className="ui-modal-body space-y-4">
          <label className="block space-y-2">
            <span className="text-body-md text-muted">Subscription ID</span>
            <input
              value={subscriptionId}
              onChange={(event) => setSubscriptionId(event.target.value)}
              className="ui-input"
              placeholder="Membership subscription record ID"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-body-md text-muted">Suspension start</span>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="ui-input"
              />
            </label>
            <label className="space-y-2">
              <span className="text-body-md text-muted">Suspension end</span>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="ui-input"
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-body-md text-muted">Admin notes (optional)</span>
            <textarea
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              className="ui-input min-h-24"
              placeholder="Reason for extending suspension"
            />
          </label>

          {error ? <p className="text-body-sm text-red-400">{error}</p> : null}
        </div>

        <div className="ui-modal-footer">
          <button
            type="button"
            onClick={resetForm}
            className="ui-modal-btn ui-modal-btn-cancel"
            disabled={isSubmitting}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            className="ui-modal-btn ui-modal-btn-gold"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
