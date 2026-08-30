import { CheckCircle2, CloudUpload, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import type { BulkExpertInvitePayload, ExpertInvitePayload } from '../types/referral'
import { requiredLabel } from '@/shared/components/form/required-label'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

type InviteExpertReferralModalProps = {
  open: boolean
  onClose: () => void
  onSubmitManual: (payload: ExpertInvitePayload) => void | Promise<void>
  onSubmitBulk: (payload: BulkExpertInvitePayload) => void | Promise<void>
  isSubmitting?: boolean
}

type BulkRecipient = { name: string; email?: string; phone?: string }

const parseCsvLine = (line: string, delimiter: string): string[] => {
  const cols: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (ch === delimiter && !inQuotes) {
      cols.push(current.trim())
      current = ''
      continue
    }
    current += ch
  }
  cols.push(current.trim())
  return cols
}

const detectDelimiter = (headerLine: string): string => {
  const counts: Record<string, number> = { ',': 0, ';': 0, '\t': 0 }
  let inQuotes = false
  for (const ch of headerLine) {
    if (ch === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (!inQuotes && ch in counts) counts[ch] += 1
  }
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return ranked[0][1] > 0 ? ranked[0][0] : ','
}

const findHeaderIndex = (headers: string[], exact: string, aliases: string[]) => {
  const exactIdx = headers.findIndex((h) => h === exact)
  if (exactIdx >= 0) return exactIdx
  return headers.findIndex((h) => aliases.some((alias) => h.includes(alias)))
}

const parseCsvRecipients = (text: string): BulkRecipient[] => {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r\n|\n|\r/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length < 2) return []

  const delimiter = detectDelimiter(lines[0])
  const headers = parseCsvLine(lines[0], delimiter).map((h) =>
    h
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim(),
  )

  const nameIdx = findHeaderIndex(headers, 'name', ['full name', 'fullname', 'name'])
  const emailIdx = findHeaderIndex(headers, 'email', ['email', 'mail'])
  const phoneIdx = findHeaderIndex(headers, 'phone', ['phone', 'mobile', 'contact'])

  if (nameIdx < 0) return []

  const seen = new Set<string>()

  return lines
    .slice(1)
    .map((line) => {
      const cols = parseCsvLine(line, delimiter)
      const name = (cols[nameIdx] ?? '').trim()
      const email = emailIdx >= 0 ? (cols[emailIdx] ?? '').trim().toLowerCase() : ''
      const phone = phoneIdx >= 0 ? (cols[phoneIdx] ?? '').trim() : ''
      return {
        name,
        email: email || undefined,
        phone: phone || undefined,
      }
    })
    .filter((item) => item.name && (item.email || item.phone))
    .filter((item) => {
      const key = `${item.email || ''}|${item.phone || ''}|${item.name.toLowerCase()}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
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

    const lower = file.name.toLowerCase()
    if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
      setFileName(null)
      setRecipients([])
      setParseError(
        'Please upload a CSV file (name, email, phone). Excel .xlsx is not supported yet.',
      )
      toast.error('Please upload a CSV file')
      return
    }

    const text = await file.text()
    const parsed = parseCsvRecipients(text)
    if (!parsed.length) {
      setFileName(null)
      setRecipients([])
      setParseError(
        'No valid rows found. CSV needs a header row and columns: name, email, phone. Each row needs a name plus email or phone.',
      )
      toast.error('No valid recipients found in CSV')
      return
    }

    setParseError(null)
    setRecipients(parsed)
    setFileName(file.name)
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
      if (!email.trim() && !phone.trim()) {
        toast.error('Email or phone number is required')
        return
      }
      await onSubmitManual({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        message: message.trim(),
        referrerName: 'Admin',
      })
      return
    }

    if (!recipients.length) {
      toast.error('Upload a CSV with at least one valid recipient')
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
            <Field label="Upload CSV*">
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  className="text-brand-accent text-xs underline"
                  onClick={downloadTemplate}
                >
                  Download CSV template
                </button>
              </div>
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
                          setParseError(null)
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
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => void handleFileChange(e.target.files?.[0])}
                />
              </label>
              {parseError ? <p className="mt-2 text-xs text-rose-300">{parseError}</p> : null}
            </Field>
          )}

          <Field label="Write a message*">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your invitation message"
              className="ui-textarea h-32"
            />
          </Field>

          <p className="invite-modal-note leading-relaxed">
            Note: Partners receive the invite message and link by email (and SMS when phone is
            provided).
          </p>
        </div>

        <div className="ui-modal-footer justify-end gap-3">
          <button type="button" className="ui-cta ui-cta-outline" onClick={handleClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-cta ui-cta-primary min-w-[140px]"
            onClick={() => void handleSubmit()}
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
