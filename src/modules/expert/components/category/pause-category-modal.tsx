import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

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
}

export function PauseCategoryModal({
  open,
  onClose,
  onConfirm,
  isSubmitting = false,
  reasonCategorySlug = MODERATION_CATEGORY_SLUGS.pauseCategory,
  title = 'Pause Category',
  heading = 'Are you sure you want  Pause this Category.',
  description = 'This will result in hiding this category from users.',
  submitLabel = 'Pause Category',
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
    />
  )
}

function PauseCategoryModalDialog({
  onClose,
  onConfirm,
  isSubmitting = false,
  reasonCategorySlug = MODERATION_CATEGORY_SLUGS.pauseCategory,
  title,
  heading,
  description,
  submitLabel,
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
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/70 px-4 py-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-category-modal-title"
        className="ui-modal-shell"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal-header">
          <h2 id="pause-category-modal-title" className="text-h2 text-brand-text">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="text-brand-muted rounded-full p-1.5 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="icon-lg" aria-hidden="true" />
          </button>
        </div>

        <div className="ui-modal-body space-y-4">
          <div className="flex flex-col items-center text-center">
            <span className="bg-brand-accent/20 mb-3 flex size-12 items-center justify-center rounded-full">
              <AlertTriangle className="icon-md text-brand-accent" aria-hidden="true" />
            </span>

            <p className="text-body-md-semibold text-brand-text">{heading}</p>
            <p className="text-body-sm text-muted mt-1.5">{description}</p>
          </div>

          <div>
            <span className="text-body-sm-medium text-muted mb-[10px] block">Reasons</span>
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

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleReason(option.value)}
                      className={cn(
                        'ui-modal-reason-chip',
                        isSelected ? 'ui-modal-reason-chip-selected' : 'ui-modal-reason-chip-idle',
                      )}
                    >
                      {/^\s*\[.*\]\s*$/.test(option.label) ? option.label : `[${option.label}]`}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          <label className="text-body-md text-brand-text flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-0.5 size-[15px] shrink-0 accent-white"
            />
            <span>I confirm the documents are not approved due to above reasons.</span>
          </label>

          <label className="block">
            <span className="text-body-sm-medium text-brand-text mb-2 block">
              Admin notes <span className="text-brand-danger">*</span>
            </span>
            <textarea
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              className="ui-textarea min-h-[72px]"
            />
          </label>
        </div>

        <div className="ui-modal-footer">
          <button type="button" onClick={onClose} className="ui-modal-btn ui-modal-btn-cancel">
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
            className="ui-modal-btn ui-modal-btn-gold"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
