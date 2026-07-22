import { Save, X } from 'lucide-react'
import { useState } from 'react'

import type { UpdateRecipientPayload } from '../types/referral'

type EditRecipientModalProps = {
  open: boolean
  onClose: () => void
  initialValues?: {
    name: string
    email?: string | null
    phone?: string | null
    message?: string
  }
  onSubmit: (payload: UpdateRecipientPayload) => void
  isSubmitting?: boolean
}

export function EditRecipientModal({
  open,
  onClose,
  initialValues,
  onSubmit,
  isSubmitting = false,
}: EditRecipientModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open && initialValues) {
      setName(initialValues.name)
      setEmail(initialValues.email ?? '')
      setPhone(initialValues.phone ?? '')
      setMessage(initialValues.message ?? '')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="ui-modal-shell max-w-xl">
        <div className="ui-modal-header">
          <h2 className="text-h4 text-brand-text">Edit Expert Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-brand-text rounded-brand-md p-1.5 hover:bg-white/5"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="ui-modal-body space-y-5">
          <Field label="Enter Name*">
            <input value={name} onChange={(e) => setName(e.target.value)} className="ui-input" />
          </Field>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Email ID">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ui-input"
              />
            </Field>
            <Field label="Phone number">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="ui-input"
              />
            </Field>
          </div>
          <Field label="Write a message*">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter here"
              className="ui-textarea h-28 min-h-28"
            />
          </Field>
        </div>

        <div className="ui-modal-footer justify-end">
          <button type="button" className="ui-cta ui-cta-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-cta ui-cta-primary"
            onClick={() => onSubmit({ name, email, phone, message })}
            disabled={isSubmitting}
          >
            <Save className="size-4" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2.5">
      <span className="text-brand-text text-body-md font-medium">{label}</span>
      {children}
    </label>
  )
}
