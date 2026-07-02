import { Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { UpdateRecipientPayload } from '../types/referral'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

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
  'h-11 rounded-lg border-0 bg-[#1a1a1a] px-4 text-sm text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-white/20'

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

  useEffect(() => {
    if (open && initialValues) {
      setName(initialValues.name)
      setEmail(initialValues.email ?? '')
      setPhone(initialValues.phone ?? '')
      setMessage(initialValues.message ?? '')
    }
  }, [open, initialValues])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#111111] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="text-lg font-semibold text-white">Edit Recipient Details</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <Field label="Enter Name*">
            <Input value={name} onChange={(e) => setName(e.target.value)} className={fieldInputClass} />
          </Field>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Email ID">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} className={fieldInputClass} />
            </Field>
            <Field label="Phone number">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldInputClass} />
            </Field>
          </div>
          <Field label="Write a message*">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter here"
              className="h-28 w-full resize-none rounded-lg border-0 bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </Field>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 bg-transparent px-6 py-2.5 text-sm font-medium text-white hover:bg-white/5"
          >
            Cancel
          </button>
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
      <span className="text-sm font-medium text-white">{label}</span>
      {children}
    </label>
  )
}
