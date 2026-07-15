import { Save, X } from 'lucide-react'
import { useState } from 'react'

import type { UpdateRecipientPayload } from '../types/referral'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

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

const fieldInputClass =
  'h-11 border-white/10 bg-brand-bg px-4 text-sm text-brand-text placeholder:text-brand-muted focus-visible:ring-brand-accent/40'

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
      <div
        className={cn(
          'bg-brand-surface w-full max-w-xl border border-white/10 shadow-2xl',
          uiTokens.radiusCard,
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="text-brand-text text-lg font-semibold">Edit Expert Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-brand-md text-brand-muted hover:text-brand-text p-1.5 hover:bg-white/5"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <Field label="Enter Name*">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldInputClass}
            />
          </Field>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Email ID">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldInputClass}
              />
            </Field>
            <Field label="Phone number">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={fieldInputClass}
              />
            </Field>
          </div>
          <Field label="Write a message*">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter here"
              className="rounded-brand-md bg-brand-bg text-brand-text placeholder:text-brand-muted focus:ring-brand-accent/40 h-28 w-full resize-none border border-white/10 px-4 py-3 text-sm focus:ring-2 focus:outline-none"
            />
          </Field>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-5">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit({ name, email, phone, message })} disabled={isSubmitting}>
            <Save className="size-4" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2.5">
      <span className="text-brand-text text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}
