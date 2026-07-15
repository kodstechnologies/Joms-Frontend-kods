import { Shield, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import { cn } from '@/shared/lib/cn'

export type EscalationPriority = 'urgent' | 'high' | 'normal'

type EscalateToSuperAdminModalProps = {
  open: boolean
  refundId: string
  requestedBy: string
  amount: string
  onClose: () => void
  onSubmit?: (payload: { priority: EscalationPriority; adminNotes: string }) => void
}

const priorityOptions: Array<{
  id: EscalationPriority
  label: string
  description: string
}> = [
  { id: 'urgent', label: 'Urgent', description: 'Immediate attention required' },
  { id: 'high', label: 'High', description: 'Review within 24 hours' },
  { id: 'normal', label: 'Normal', description: 'Review within 2-3 business days' },
]

const footerButtonClass =
  'inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20'

export function EscalateToSuperAdminModal({
  open,
  refundId,
  requestedBy,
  amount,
  onClose,
  onSubmit,
}: EscalateToSuperAdminModalProps) {
  const [priority, setPriority] = useState<EscalationPriority>('normal')
  const [adminNotes, setAdminNotes] = useState('')

  const handleClose = useCallback(() => {
    setPriority('normal')
    setAdminNotes('')
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, handleClose])

  const handleSubmit = () => {
    onSubmit?.({ priority, adminNotes })
    toast.success('Escalated to Super Admin')
    handleClose()
  }

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 sm:p-4"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className={cn(
          'flex w-full max-w-lg flex-col rounded-2xl border border-white/[0.08] bg-[#1A1A1A] shadow-2xl',
          'max-h-[92dvh] sm:max-h-[min(90dvh,720px)]',
        )}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="escalate-super-admin-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-4 sm:px-6 sm:py-5">
          <h2
            id="escalate-super-admin-title"
            className="text-[15px] font-bold text-white sm:text-[16px]"
          >
            Escalate to Super Admin
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close escalation modal"
            className="grid size-9 place-items-center rounded-lg text-[#888888] transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
          <div className="space-y-5">
            <div className="rounded-xl border border-white/[0.06] bg-[#121212] p-4">
              <div className="mb-4 flex items-start gap-3 border-b border-white/[0.06] pb-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-full border border-white/10 bg-[#0F0F0F] text-[#888888]">
                  <Shield className="size-4" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">Escalate to Super Admin</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#888888]">
                    This case requires Super Admin review and decision
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <InfoRow label="Refund ID" value={refundId} />
                <InfoRow label="Requested By" value={requestedBy} />
                <InfoRow label="Amount" value={amount} />
              </div>
            </div>

            <div>
              <p className="mb-3 text-[12px] text-[#888888]">Priority Level</p>
              <div className="space-y-2.5">
                {priorityOptions.map((option) => {
                  const selected = priority === option.id

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPriority(option.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors',
                        selected
                          ? 'border-[#F0C27B]/50 bg-[#F0C27B] text-black'
                          : 'border-white/[0.06] bg-[#121212] text-white hover:border-white/15',
                      )}
                    >
                      <span
                        className={cn(
                          'grid size-4 shrink-0 place-items-center rounded-full border-2',
                          selected ? 'border-black bg-black' : 'border-[#666666] bg-transparent',
                        )}
                      >
                        {selected ? <span className="size-1.5 rounded-full bg-white" /> : null}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-semibold">{option.label}</span>
                        <span
                          className={cn(
                            'mt-0.5 block text-[11px]',
                            selected ? 'text-black/70' : 'text-[#888888]',
                          )}
                        >
                          {option.description}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <label className="block space-y-2.5">
              <span className="text-[12px] text-[#888888]">Admin Notes</span>
              <textarea
                value={adminNotes}
                onChange={(event) => setAdminNotes(event.target.value)}
                placeholder="Enter Text Here"
                rows={4}
                className="min-h-28 w-full resize-none rounded-lg border border-white/[0.06] bg-[#0F0F0F] px-4 py-3 text-sm text-white placeholder:text-[#666666] focus:ring-1 focus:ring-white/20 focus:outline-none"
              />
            </label>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-white/[0.06] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-5">
          <button type="button" onClick={handleClose} className={footerButtonClass}>
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className={footerButtonClass}>
            Submit
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[12px] text-[#888888]">{label}</span>
      <span className="text-right text-[12px] font-medium text-white">{value}</span>
    </div>
  )
}
