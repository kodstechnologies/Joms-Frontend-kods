import { CheckCircle2, CloudUpload, Trash2, X } from 'lucide-react'
import { useState } from 'react'

import type { BulkExpertInvitePayload, ExpertInvitePayload } from '../types/referral'
import { requiredLabel } from '@/shared/components/form/required-label'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

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

const fieldInputClass = 'ui-input h-11'

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
      <div className="ui-modal-shell relative max-w-xl">
        <div className="ui-modal-header">
          <div className="min-w-0 pr-2">
            <h2 className="invite-modal-title">Refer New User</h2>
            <p className="invite-modal-subtitle mt-1">Platform-referred users</p>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={handleClose}
            className="text-brand-muted rounded-full p-1.5 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="icon-lg" aria-hidden="true" />
          </button>
        </div>

        <div className="ui-modal-body space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <TabButton active={mode === 'manual'} onClick={() => setMode('manual')}>
              Manual Referral
            </TabButton>
            <TabButton active={mode === 'bulk'} onClick={() => setMode('bulk')}>
              Bulk referral
            </TabButton>
          </div>

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
                    <CheckCircle2 className="text-brand-positive mb-2 size-8" />
                    <p className="text-brand-positive text-body-md font-medium">Sheet Uploaded</p>
                    <div className="text-muted text-body-sm mt-2 flex items-center gap-2">
                      <span>{fileName}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setFileName(null)
                          setRecipients([])
                        }}
                        className="text-brand-danger"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <p className="text-muted text-body-sm mt-1">
                      {recipients.length} partners parsed
                    </p>
                  </>
                ) : (
                  <>
                    <CloudUpload className="text-muted mb-2 size-8" />
                    <p className="text-muted text-body-md">
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
              className="ui-textarea h-32"
            />
          </Field>

          <p className="invite-modal-note leading-relaxed">
            Note: The partners will get referral code to their email ID & notified through
            SMS/WhatsApp.
          </p>
        </div>

        <div className="ui-modal-footer justify-end gap-3">
          <button type="button" className="ui-cta ui-cta-outline" onClick={handleClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-cta ui-cta-primary min-w-[140px]"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Invite'}
          </button>
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
        'invite-modal-tab',
        active ? 'invite-modal-tab-active' : 'invite-modal-tab-inactive',
      )}
    >
      {children}
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2.5">
      <span className="invite-modal-field-label">{requiredLabel(label)}</span>
      {children}
    </label>
  )
}
