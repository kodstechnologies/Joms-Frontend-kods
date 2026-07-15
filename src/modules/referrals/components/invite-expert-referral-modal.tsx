import { CheckCircle2, CloudUpload, Trash2, X } from 'lucide-react'
import { useState } from 'react'

import type { BulkExpertInvitePayload, ExpertInvitePayload } from '../types/referral'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

type InviteExpertReferralModalProps = {
  open: boolean
  onClose: () => void
  onSubmitManual: (payload: ExpertInvitePayload) => void
  onSubmitBulk: (payload: BulkExpertInvitePayload) => void
  isSubmitting?: boolean
}

type BulkRecipient = { name: string; email?: string; phone?: string }

const parseCsvRecipients = (text: string): BulkRecipient[] => {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const nameIdx = headers.findIndex((h) => h.includes('name'))
  const emailIdx = headers.findIndex((h) => h.includes('email'))
  const phoneIdx = headers.findIndex((h) => h.includes('phone'))

  return lines
    .slice(1)
    .map((line) => {
      const cols = line.split(',').map((c) => c.trim())
      return {
        name: cols[nameIdx >= 0 ? nameIdx : 0] ?? '',
        email: emailIdx >= 0 ? cols[emailIdx] : undefined,
        phone: phoneIdx >= 0 ? cols[phoneIdx] : undefined,
      }
    })
    .filter((item) => item.name)
}

const fieldInputClass =
  'h-11 border-white/10 bg-brand-bg px-4 text-sm text-brand-text placeholder:text-brand-muted focus-visible:ring-brand-accent/40'

export function InviteExpertReferralModal({
  open,
  onClose,
  onSubmitManual,
  onSubmitBulk,
  isSubmitting = false,
}: InviteExpertReferralModalProps) {
  const [mode, setMode] = useState<'manual' | 'bulk'>('manual')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [recipients, setRecipients] = useState<BulkRecipient[]>([])

  if (!open) return null

  const reset = () => {
    setMode('manual')
    setName('')
    setEmail('')
    setPhone('')
    setMessage('')
    setFileName(null)
    setRecipients([])
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleFileChange = async (file?: File | null) => {
    if (!file) return
    const text = await file.text()
    const parsed = parseCsvRecipients(text)
    setRecipients(parsed)
    setFileName(file.name)
  }

  const handleSubmit = () => {
    if (mode === 'manual') {
      onSubmitManual({ name, email, phone, message, invitedBy: 'Admin' })
    } else {
      onSubmitBulk({ message, recipients, invitedBy: 'Admin' })
    }
    reset()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div
        className={cn(
          'bg-brand-surface relative w-full max-w-xl border border-white/10 shadow-2xl',
          uiTokens.radiusCard,
        )}
      >
        <button
          type="button"
          onClick={handleClose}
          className="rounded-brand-md text-brand-muted hover:text-brand-text absolute top-4 right-4 z-10 p-1.5 hover:bg-white/5"
        >
          <X className="size-4" />
        </button>

        <div className="border-b border-white/10 p-4 pt-5">
          <div className="rounded-brand-md bg-brand-bg grid grid-cols-2 gap-1 p-1">
            <TabButton active={mode === 'manual'} onClick={() => setMode('manual')}>
              Manual Referral
            </TabButton>
            <TabButton active={mode === 'bulk'} onClick={() => setMode('bulk')}>
              Bulk Referral
            </TabButton>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          {mode === 'manual' ? (
            <>
              <Field label="Enter Name*">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Full Name"
                  className={fieldInputClass}
                />
              </Field>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Email ID">
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email ID"
                    className={fieldInputClass}
                  />
                </Field>
                <Field label="Phone number">
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter Phone Number"
                    className={fieldInputClass}
                  />
                </Field>
              </div>
            </>
          ) : (
            <Field label="Upload Excel*">
              <label className="rounded-brand-md bg-brand-bg flex min-h-36 cursor-pointer flex-col items-center justify-center border border-dashed border-white/10 p-6 text-center">
                {fileName ? (
                  <>
                    <CheckCircle2 className="mb-2 size-8 text-emerald-400" />
                    <p className="text-sm font-medium text-emerald-300">Sheet Uploaded</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                      <span>{fileName}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setFileName(null)
                          setRecipients([])
                        }}
                        className="text-rose-300"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {recipients.length} experts parsed
                    </p>
                  </>
                ) : (
                  <>
                    <CloudUpload className="mb-2 size-8 text-slate-500" />
                    <p className="text-sm text-slate-400">
                      Upload CSV with name, email, phone columns
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                />
              </label>
            </Field>
          )}

          <Field label="Write a message*">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter here"
              className="rounded-brand-md bg-brand-bg text-brand-text placeholder:text-brand-muted focus:ring-brand-accent/40 h-32 w-full resize-none border border-white/10 px-4 py-3 text-sm focus:ring-2 focus:outline-none"
            />
          </Field>

          <p className="text-brand-muted text-xs leading-relaxed">
            Note: Experts will receive the referral invite on their email and through SMS/WhatsApp.
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-5">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? 'Sending...' : 'Send Invite'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-brand-md py-2.5 text-center text-sm font-semibold transition-colors',
        active ? 'bg-brand-surface-2 text-brand-text' : 'text-brand-muted hover:text-brand-text',
      )}
    >
      {children}
    </button>
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
