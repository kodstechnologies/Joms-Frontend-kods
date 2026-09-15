import { useEffect, useState } from 'react'
import { Pause, X } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { MODERATION_CATEGORY_SLUGS } from '@/modules/settings/api/templates-api'
import {
  useModerationReasonOptions,
  useRecordModerationReasonUsage,
} from '@/modules/settings/hooks/use-templates'

export type PauseCategoryModalPayload = {
  reasons: string[]
  adminNotes: string
}

type PauseCategoryModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: (payload: PauseCategoryModalPayload) => void
  isSubmitting?: boolean
  reasonCategorySlug?: string
  title?: string
  heading?: string
  description?: string
  submitLabel?: string
  notificationNote?: string
}

export function PauseCategoryModal({
  open,
  onClose,
  onConfirm,
  isSubmitting = false,
  reasonCategorySlug = MODERATION_CATEGORY_SLUGS.pauseCategory,
  title = 'Pause Service',
  heading,
  description = 'Pausing this service will temporarily stop all new requests.',
  submitLabel = 'Pause Service',
  notificationNote = 'This reason will be notified to the expert.',
}: PauseCategoryModalProps) {
  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open) return null

  return (
    <PauseCategoryModalDialog
      onClose={onClose}
      onConfirm={onConfirm}
      isSubmitting={isSubmitting}
      reasonCategorySlug={reasonCategorySlug}
      title={title}
      heading={heading}
      description={description}
      submitLabel={submitLabel}
      notificationNote={notificationNote}
    />
  )
}

function PauseCategoryModalDialog({
  onClose,
  onConfirm,
  isSubmitting = false,
  reasonCategorySlug = MODERATION_CATEGORY_SLUGS.pauseCategory,
  title = 'Pause Service',
  heading,
  description = 'Pausing this service will temporarily stop all new requests.',
  submitLabel = 'Pause Service',
  notificationNote: _notificationNote = 'This reason will be notified to the expert.',
}: Omit<PauseCategoryModalProps, 'open'>) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [confirmed, setConfirmed] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const { options: reasonOptions, isLoading: isReasonsLoading } =
    useModerationReasonOptions(reasonCategorySlug)
  const recordReasonUsage = useRecordModerationReasonUsage()

  const toggleReason = (value: string) => {
    setSelectedReasons((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
  }

  const canSubmit =
    confirmed &&
    adminNotes.trim().length > 0 &&
    (reasonOptions.length === 0 || selectedReasons.length > 0)

  const reasonManagerLabel =
    reasonCategorySlug === MODERATION_CATEGORY_SLUGS.pauseService
      ? 'Pause Service'
      : reasonCategorySlug === MODERATION_CATEGORY_SLUGS.pauseVenue
        ? 'Pause Venue'
        : 'Pause Category'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#050505]/80 px-4 py-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-category-modal-title"
        className="ui-modal-shell w-full max-w-[584px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal-header">
          <h2
            id="pause-category-modal-title"
            className="text-[24px] leading-8 font-semibold tracking-normal text-white"
          >
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="text-brand-muted grid size-6 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="ui-modal-body space-y-5">
          {description ? (
            <p className="text-[14px] leading-5 font-normal tracking-normal text-[#FFFFFF80]">
              {description}
            </p>
          ) : null}

          {heading ? <p className="text-body-md text-brand-text">{heading}</p> : null}

          <div>
            <span className="mb-[10px] block text-[14px] leading-5 font-normal tracking-normal text-[#FFFFFF80]">
              Reasons
            </span>
            <div className="flex flex-wrap gap-[10px]">
              {isReasonsLoading ? (
                <p className="text-body-sm text-muted">Loading reasons…</p>
              ) : reasonOptions.length === 0 ? (
                <p className="text-body-sm text-muted">
                  No reasons yet. Add them under {reasonManagerLabel} in Moderation Reason Manager.
                </p>
              ) : (
                reasonOptions.map((option) => {
                  const isSelected = selectedReasons.includes(option.value)
                  const labelClean = option.label.replace(/^\[|\]$/g, '')

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleReason(option.value)}
                      className={cn(
                        'ui-modal-reason-chip rounded-xl',
                        isSelected ? 'ui-modal-reason-chip-selected' : 'ui-modal-reason-chip-idle',
                      )}
                    >
                      {labelClean}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="ui-table-checkbox"
            />
            <span className="text-[12px] leading-5 font-normal tracking-normal text-white">
              I confirm the documents are not approved due to above reasons.
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-[14px] leading-6 font-semibold tracking-normal text-white">
              Admin notes <span className="text-[#D3191C]">*</span>
            </span>
            <textarea
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              className="ui-textarea min-h-[119px] rounded-[10px] bg-[#050505]"
            />
          </label>
        </div>

        <div className="ui-modal-footer px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="ui-modal-btn ui-modal-btn-cancel h-10 max-w-[239px] flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit || isSubmitting}
            onClick={() => {
              if (selectedReasons.length > 0) {
                recordReasonUsage.mutate(selectedReasons)
              }
              onConfirm({
                reasons: selectedReasons,
                adminNotes: adminNotes.trim(),
              })
            }}
            className="ui-modal-btn ui-modal-btn-negative h-10 max-w-[238px] flex-1 overflow-visible"
          >
            <span className="truncate">{submitLabel}</span>
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white">
              <Pause
                className="size-3 text-[#D3191C]"
                strokeWidth={2.5}
                fill="currentColor"
                aria-hidden="true"
              />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
