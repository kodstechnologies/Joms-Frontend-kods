import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { submitExpertReport } from '../api/expert-api'

const ISSUE_TYPES = [
  'Fraud',
  'Misconduct',
  'Spam',
  'Fake Profile',
  'Poor Quality',
  'Harassment',
  'Payment Issue',
  'Other',
] as const

type ExpertReportSubmitModalProps = {
  open: boolean
  expertId: string
  partnerId: string
  expertName: string
  reporterId: string
  reporterName: string
  onClose: () => void
  onSubmitted?: () => void
}

export function ExpertReportSubmitModal({
  open,
  expertId,
  partnerId,
  expertName,
  reporterId,
  reporterName,
  onClose,
  onSubmitted,
}: ExpertReportSubmitModalProps) {
  const [issueType, setIssueType] = useState<string>(ISSUE_TYPES[0])
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!open) return null

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Please describe the issue before submitting.')
      return
    }

    setIsSubmitting(true)
    try {
      await submitExpertReport({
        partnerId,
        issueType,
        reason: reason.trim(),
        reporterId,
        reporterName,
        reporterType: 'Admin',
      })
      toast.success(`Report submitted for ${expertName}`)
      setReason('')
      setIssueType(ISSUE_TYPES[0])
      onSubmitted?.()
      onClose()
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to submit expert report'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-brand-surface w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-white">Report Expert</h2>
            <p className="text-muted mt-0.5 text-sm">
              {expertName} ({expertId})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <label className="block space-y-1.5 text-sm text-white/80">
            Issue Type
            <select
              value={issueType}
              onChange={(event) => setIssueType(event.target.value)}
              className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
            >
              {ISSUE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5 text-sm text-white/80">
            Description
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={5}
              maxLength={1000}
              placeholder="Describe the issue in detail..."
              className="w-full resize-none rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/10 px-5 py-4">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button className="ui-cta ui-cta-primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </div>
    </div>
  )
}
