import { CheckCircle2, CloudUpload, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import type { BulkExpertInvitePayload, ExpertInvitePayload } from '../types/referral'
import {
  parseBulkInviteFile,
  type BulkInviteRecipient,
} from '../utils/parse-bulk-invite-recipients'
import { requiredLabel } from '@/shared/components/form/required-label'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'
import { sanitizeMobileNumber, validateMobileNumber } from '@/shared/lib/phone'

type InviteExpertReferralModalProps = {
  open: boolean
  onClose: () => void
  onSubmitManual: (payload: ExpertInvitePayload) => void | Promise<void>
  onSubmitBulk: (payload: BulkExpertInvitePayload) => void | Promise<void>
  isSubmitting?: boolean
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validateEmailValue = (value: string): string | null => {
  const email = value.trim()
  if (!email) return 'Email ID is required'
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email ID'
  return null
}

const fieldInputClass = 'invite-modal-input'

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
  const [recipients, setRecipients] = useState<BulkInviteRecipient[]>([])
  const [parseError, setParseError] = useState<string | null>(null)

  if (!open) return null

  const reset = () => {
    setMode('manual')
    setName('')
    setEmail('')
    setPhone('')
    setMessage('')
    setFileName(null)
    setRecipients([])
    setParseError(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleFileChange = async (file?: File | null) => {
    if (!file) return

    try {
      const parsed = await parseBulkInviteFile(file)
      if (!parsed.length) {
        setFileName(null)
        setRecipients([])
        setParseError(
          'No valid rows found. File needs name, email, and a 10-digit phone on each expert row.',
        )
        toast.error('No valid recipients found in the file')
        return
      }

      setParseError(null)
      setRecipients(parsed)
      setFileName(file.name)
    } catch {
      setFileName(null)
      setRecipients([])
      setParseError(
        'Could not read that file. Upload a CSV or Excel sheet with name, email, and phone.',
      )
      toast.error('Could not read the upload file')
    }
  }

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error('Message is required')
      return
    }

    if (mode === 'manual') {
      if (!name.trim()) {
        toast.error('Name is required')
        return
      }
      const emailError = validateEmailValue(email)
      if (emailError) {
        toast.error(emailError)
        return
      }

      const phoneError = validateMobileNumber(phone)
      if (phoneError) {
        toast.error(phoneError)
        return
      }

      await onSubmitManual({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: sanitizeMobileNumber(phone),
        message: message.trim(),
        referrerName: 'Admin',
      })
      return
    }

    if (!recipients.length) {
      toast.error('Upload a CSV or Excel file with at least one valid recipient')
      return
    }

    await onSubmitBulk({
      message: message.trim(),
      recipients,
      fileName: fileName || undefined,
      referrerName: 'Admin',
    })
  }

  const downloadTemplate = () => {
    const csv =
      'name,email,phone\nJane Doe,jane@example.com,9876543210\nJohn Smith,john@example.com,9876543211\n'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'bulk-referral-template.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div
        className="invite-modal-shell relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-modal-title"
      >
        <div className="invite-modal-header">
          <div className="min-w-0 pr-2">
            <h2 id="invite-modal-title" className="invite-modal-title">
              Refer New User
            </h2>
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

        <div className="invite-modal-body">
          <div className="invite-modal-tabs">
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

              <div className="invite-modal-contact-row">
                <Field label="Email ID">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email ID"
                    className={fieldInputClass}
                  />
                </Field>
                <Field label="Phone number">
                  <Input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(sanitizeMobileNumber(e.target.value))}
                    placeholder="Enter Phone Number"
                    className={fieldInputClass}
                  />
                </Field>
              </div>
            </>
          ) : (
            <Field label="Upload CSV or Excel*">
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  className="text-brand-accent text-xs underline"
                  onClick={downloadTemplate}
                >
                  Download CSV template
                </button>
              </div>
              <label className="invite-modal-upload">
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
                          setParseError(null)
                        }}
                        className="text-brand-danger"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <p className="text-muted text-body-sm mt-1">
                      {recipients.length} expert{recipients.length === 1 ? '' : 's'} parsed
                    </p>
                    <ul className="text-muted mt-2 max-h-24 w-full space-y-0.5 overflow-y-auto text-left text-xs">
                      {recipients.map((recipient) => (
                        <li key={`${recipient.email}|${recipient.phone}`}>
                          {recipient.name}
                          {recipient.email ? ` · ${recipient.email}` : ''}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <>
                    <CloudUpload className="text-muted mb-2 size-8" />
                    <p className="text-muted text-body-md">
                      Upload CSV or Excel with name, email, and 10-digit phone
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept=".csv,text/csv,.xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={(e) => {
                    const selected = e.target.files?.[0]
                    e.target.value = ''
                    void handleFileChange(selected)
                  }}
                />
              </label>
              {parseError ? <p className="mt-2 text-xs text-rose-300">{parseError}</p> : null}
            </Field>
          )}

          <Field label="Write a message*">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter here"
              className="ui-textarea invite-modal-textarea"
            />
          </Field>

          <div className="invite-modal-actions-block">
            <p className="invite-modal-note">
              Note: The users will get referral code to their email ID &amp; notified through
              SMS/WhatsApp.
            </p>
            <hr className="invite-modal-body-divider" />
            <div className="invite-modal-footer-actions">
              <button type="button" className="invite-modal-btn-cancel" onClick={handleClose}>
                Cancel
              </button>
              <button
                type="button"
                className="invite-modal-btn-submit"
                onClick={() => void handleSubmit()}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </div>
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
    <label className="invite-modal-field">
      <span className="invite-modal-field-label">{requiredLabel(label)}</span>
      {children}
    </label>
  )
}
