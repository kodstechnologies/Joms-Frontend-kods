import { X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import { cn } from '@/shared/lib/cn'

export type RequestMoreInformationModalData = {
  denyAmount: string
  denyFromName: string
  userName: string
  reason: string
  evidenceCount: number
}

type RequestMoreInformationModalProps = {
  open: boolean
  data: RequestMoreInformationModalData
  onClose: () => void
  onSubmit?: (payload: { requestInformation: string; adminNotes: string }) => void
}

const inputClass =
  'h-[38px] w-full rounded-[10px] border-0 bg-[#141414] px-4 font-figtree text-[14px] font-normal leading-[20px] tracking-normal text-white placeholder:text-[#666666] focus:outline-none focus:ring-1 focus:ring-white/20'

const textareaClass =
  'min-h-[88px] w-full resize-none rounded-[10px] border-0 bg-[#141414] px-4 py-3 font-figtree text-[14px] font-normal leading-[20px] tracking-normal text-white placeholder:text-[#666666] focus:outline-none focus:ring-1 focus:ring-white/20'

const outlineButtonClass =
  'inline-flex h-10 w-full items-center justify-center rounded-[10px] border border-white/20 bg-transparent px-[10px] font-figtree text-[12px] font-semibold leading-[20px] tracking-normal text-white transition-colors hover:bg-white/5'

const detailLabelClass =
  'font-figtree text-[14px] font-normal leading-[20px] tracking-normal text-[#888888]'

const detailValueClass =
  'block shrink-0 text-right font-figtree text-[14px] font-normal leading-[20px] tracking-normal text-white'

export function RequestMoreInformationModal({
  open,
  data,
  onClose,
  onSubmit,
}: RequestMoreInformationModalProps) {
  const [requestInformation, setRequestInformation] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  const handleClose = useCallback(() => {
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

  useEffect(() => {
    if (open) {
      setRequestInformation('')
      setAdminNotes('')
    }
  }, [open])

  const handleSubmit = () => {
    if (!requestInformation.trim()) {
      toast.error('Request information is required')
      return
    }

    onSubmit?.({ requestInformation, adminNotes })
    toast.success('Information request submitted')
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
          'flex w-full max-w-xl flex-col rounded-2xl border border-white/[0.08] bg-[#1A1A1A] shadow-2xl',
          'max-h-[92dvh] sm:max-h-[min(92dvh,860px)]',
        )}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-more-info-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-4 sm:px-6 sm:py-5">
          <h2
            id="request-more-info-title"
            className="font-figtree text-[24px] font-semibold leading-7 tracking-normal text-white"
          >
            Request More Information
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close request more information modal"
            className="grid size-9 place-items-center rounded-lg text-[#888888] transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
          <div className="space-y-5">
            <p className="font-figtree text-[14px] font-normal leading-6 tracking-normal text-white">
              You are about to deny the refund request of{' '}
              <span className="font-semibold">{data.denyAmount}</span> from{' '}
              <span className="font-semibold">{data.denyFromName}</span>
            </p>

            <div className="space-y-3 rounded-xl border border-white/[0.06] bg-[#121212] p-4">
              <DetailRow label="User" value={data.userName} />
              <DetailRow label="Reason" value={data.reason} />
              <DetailRow
                label="Current Evidence"
                value={`${data.evidenceCount} item(s) submitted`}
              />
            </div>

            <div className="rounded-[10px] border border-[#FFC849]/20 bg-[#3D3520] p-4">
              <p className="font-figtree text-[14px] font-normal leading-[20px] tracking-normal text-[#FFC849]">
                What happens next:
              </p>
              <p className="mt-2 max-w-[475px] font-figtree text-[14px] font-normal leading-[20px] tracking-normal text-white">
                The dispute status will change to &quot;Pending User Response&quot; and the user
                will be notified to provide the requested information. The SLA timer will be
                paused until they respond.
              </p>
            </div>

            <label className="block space-y-2.5">
              <span className="font-figtree text-[14px] font-semibold leading-[20px] text-white">
                Request Information <span className="text-[#D3191C]">*</span>
              </span>
              <input
                type="text"
                value={requestInformation}
                onChange={(event) => setRequestInformation(event.target.value)}
                placeholder="Enter Text Here"
                className={inputClass}
              />
            </label>

            <label className="block space-y-2.5">
              <span className="font-figtree text-[14px] font-semibold leading-[20px] text-white">
                Admin Notes
              </span>
              <textarea
                value={adminNotes}
                onChange={(event) => setAdminNotes(event.target.value)}
                placeholder="Enter Text Here"
                rows={3}
                className={textareaClass}
              />
            </label>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-1 gap-3 border-t border-white/[0.06] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:grid-cols-2 sm:px-6 sm:py-5">
          <button type="button" onClick={handleClose} className={outlineButtonClass}>
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className={outlineButtonClass}>
            Submit
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-2.5 last:border-b-0">
      <span className={detailLabelClass}>{label}</span>
      <span className={detailValueClass}>{value}</span>
    </div>
  )
}
