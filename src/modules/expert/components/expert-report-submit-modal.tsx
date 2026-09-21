import { useEffect, useRef, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
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
  const [issueMenuOpen, setIssueMenuOpen] = useState(false)
  const issueMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      setIssueMenuOpen(false)
      return
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!issueMenuRef.current?.contains(event.target as Node)) {
        setIssueMenuOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIssueMenuOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

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
          <div className="block space-y-1.5 text-sm text-white/80">
            <span id="report-issue-type-label">Issue Type</span>
            <div className="relative" ref={issueMenuRef}>
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={issueMenuOpen}
                aria-labelledby="report-issue-type-label"
                onClick={() => setIssueMenuOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-left text-sm text-white transition-colors outline-none hover:border-white/20 focus-visible:border-[#F6CB86]/60"
              >
                <span>{issueType}</span>
                <ChevronDown
                  className={cn(
                    'size-4 text-white/60 transition-transform',
                    issueMenuOpen && 'rotate-180',
                  )}
                  aria-hidden
                />
              </button>

              {issueMenuOpen ? (
                <ul
                  role="listbox"
                  aria-labelledby="report-issue-type-label"
                  className="absolute z-20 mt-1.5 max-h-56 w-full overflow-auto rounded-xl border border-white/10 bg-[#141414] py-1.5 shadow-[0_16px_40px_rgb(0_0_0_/45%)]"
                >
                  {ISSUE_TYPES.map((type) => {
                    const selected = type === issueType
                    return (
                      <li key={type} role="option" aria-selected={selected}>
                        <button
                          type="button"
                          onClick={() => {
                            setIssueType(type)
                            setIssueMenuOpen(false)
                          }}
                          className={cn(
                            'w-full px-3 py-2.5 text-left text-sm transition-colors',
                            selected
                              ? 'bg-[#F6CB86]/15 font-medium text-[#F6CB86]'
                              : 'text-white/85 hover:bg-white/8 hover:text-white',
                          )}
                        >
                          {type}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </div>
          </div>

          <label className="block space-y-1.5 text-sm text-white/80">
            Description
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={5}
              maxLength={1000}
              placeholder="Describe the issue in detail..."
              className="w-full resize-none rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus-visible:border-[#F6CB86]/60"
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
