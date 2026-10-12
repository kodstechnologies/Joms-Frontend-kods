import { useEffect, useRef, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { submitVenueReport } from '../api/venue-api'

const ISSUE_TYPES = [
  'Fraud',
  'Safety Concern',
  'Misleading Listing',
  'Spam',
  'Harassment',
  'Payment Issue',
  'Policy Violation',
  'Other',
] as const

type VenueReportSubmitModalProps = {
  open: boolean
  venueId: string
  partnerId: string
  venueName: string
  reporterId: string
  reporterName: string
  onClose: () => void
  onSubmitted?: () => void
}

export function VenueReportSubmitModal({
  open,
  venueId,
  partnerId,
  venueName,
  reporterId,
  reporterName,
  onClose,
  onSubmitted,
}: VenueReportSubmitModalProps) {
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
      await submitVenueReport({
        venueId,
        partnerId,
        issueType,
        reason: reason.trim(),
        reporterId,
        reporterName,
        reporterType: 'Admin',
      })
      toast.success(`Report submitted for ${venueName}`)
      setReason('')
      setIssueType(ISSUE_TYPES[0])
      onSubmitted?.()
      onClose()
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to submit venue report'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-brand-surface w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-white">Report Venue</h2>
            <p className="text-muted mt-0.5 text-sm">
              {venueName} ({venueId})
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

        <div className="flex flex-col gap-4 px-5 py-4">
          <div ref={issueMenuRef} className="relative">
            <label className="mb-1.5 block text-xs font-medium text-white/70">Issue Type</label>
            <button
              type="button"
              className="flex h-10 w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white"
              onClick={() => setIssueMenuOpen((openMenu) => !openMenu)}
            >
              <span>{issueType}</span>
              <ChevronDown
                className={cn('size-4 transition-transform', issueMenuOpen && 'rotate-180')}
              />
            </button>
            {issueMenuOpen ? (
              <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-white/10 bg-[#1a1a1a] py-1 shadow-xl">
                {ISSUE_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={cn(
                      'block w-full px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10',
                      type === issueType && 'bg-white/10 text-white',
                    )}
                    onClick={() => {
                      setIssueType(type)
                      setIssueMenuOpen(false)
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/70">
              Reason / Description
            </label>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              placeholder="Describe why this venue is being reported…"
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/10 px-5 py-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Submit Report'}
          </Button>
        </div>
      </div>
    </div>
  )
}
