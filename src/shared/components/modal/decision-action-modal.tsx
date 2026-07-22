import { Check, MoveDiagonal, Trash2, X } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

export type DecisionActionModalVariant =
  | 'approve'
  | 'reject'
  | 'requestChanges'
  | 'escalate'
  | 'suspend'
  | 'delete'

export type DecisionActionModalOption = {
  label: string
  value: string
}

type DecisionActionModalProps = {
  open: boolean
  variant: DecisionActionModalVariant
  title: string
  description: string
  submitLabel: string
  adminNotes: string
  onAdminNotesChange: (value: string) => void
  onClose: () => void
  onSubmit: () => void
  cancelLabel?: string
  warning?: string
  reason?: string
  onReasonChange?: (value: string) => void
  reasonLabel?: string
  reasonOptions?: DecisionActionModalOption[]
  selectedReasons?: string[]
  onReasonToggle?: (value: string) => void
  confirmationLabel?: string
  confirmationChecked?: boolean
  onConfirmationChange?: (checked: boolean) => void
  escalationOptions?: DecisionActionModalOption[]
  selectedEscalationOption?: string
  onEscalationOptionChange?: (value: string) => void
  isSubmitting?: boolean
  showTimeline?: boolean
  startDate?: string
  onStartDateChange?: (value: string) => void
  endDate?: string
  onEndDateChange?: (value: string) => void
  indefinite?: boolean
  onIndefiniteChange?: (value: boolean) => void
  indefiniteLabel?: string
  submitIcon?: 'check' | 'x' | 'none'
}

const variantStyles: Record<
  DecisionActionModalVariant,
  {
    submit: string
    submitIcon?: 'check' | 'x'
    checkIconColor?: string
  }
> = {
  approve: {
    submit: 'ui-modal-btn-positive',
    submitIcon: 'check',
    checkIconColor: 'text-brand-positive',
  },
  reject: {
    submit: 'ui-modal-btn-negative',
    submitIcon: 'x',
  },
  requestChanges: {
    submit: 'ui-modal-btn-gold',
    submitIcon: 'check',
    checkIconColor: 'text-[#B8843F]',
  },
  escalate: {
    submit: 'ui-modal-btn-gold',
  },
  suspend: {
    submit: 'ui-modal-btn-negative',
    submitIcon: 'x',
  },
  delete: {
    submit: 'ui-modal-btn-negative',
    submitIcon: 'x',
  },
}

function splitDescription(description: string): { primary: string; secondary?: string } {
  const match = description.match(/^(.+\?)\s*(.+)$/)
  if (match?.[1] && match[2]) {
    return { primary: match[1], secondary: match[2] }
  }
  return { primary: description }
}

function formatEscalationLabel(label: string) {
  const trimmed = label.trim()
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return trimmed
  return `[${trimmed}]`
}

export function DecisionActionModal({
  open,
  variant,
  title,
  description,
  submitLabel,
  adminNotes,
  onAdminNotesChange,
  onClose,
  onSubmit,
  cancelLabel = 'Cancel',
  warning,
  reason = '',
  onReasonChange,
  reasonLabel = 'Reason',
  reasonOptions = [],
  selectedReasons = [],
  onReasonToggle,
  confirmationLabel,
  confirmationChecked = false,
  onConfirmationChange,
  escalationOptions = [],
  selectedEscalationOption,
  onEscalationOptionChange,
  isSubmitting = false,
  showTimeline = false,
  startDate = '',
  onStartDateChange,
  endDate = '',
  onEndDateChange,
  indefinite = false,
  onIndefiniteChange,
  indefiniteLabel = 'Suspend indefinitely (until manually reactivated)',
  submitIcon,
}: DecisionActionModalProps) {
  if (!open) return null

  const styles = variantStyles[variant]
  const showReasons = reasonOptions.length > 0
  const showReasonInput = Boolean(onReasonChange)
  const showEscalationOptions = escalationOptions.length > 0
  const showConfirmation = Boolean(confirmationLabel && onConfirmationChange)
  const showHeroIcon = variant === 'approve' || variant === 'escalate' || variant === 'delete'
  const isDocumentRejectLayout = Boolean(warning) || showConfirmation
  const resolvedSubmitIcon = submitIcon ?? styles.submitIcon
  const { primary, secondary } = splitDescription(description)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="decision-action-modal-title"
        className="ui-modal-shell"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal-header">
          <h2 id="decision-action-modal-title" className="text-h2 text-brand-text">
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
          {warning ? <p className="text-body-sm text-muted">{warning}</p> : null}

          {showHeroIcon ? (
            <div className="flex justify-center">
              {variant === 'approve' ? (
                <span className="bg-brand-positive flex h-[70px] w-[70px] items-center justify-center rounded-full">
                  <Check className="size-9 text-white" strokeWidth={3} aria-hidden="true" />
                </span>
              ) : variant === 'delete' ? (
                <span className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[rgb(211_25_28_/_20%)]">
                  <Trash2 className="text-brand-danger size-7" strokeWidth={1.5} />
                </span>
              ) : (
                <span className="flex size-[72px] items-center justify-center rounded-full bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)]">
                  <MoveDiagonal
                    className="size-8 text-[#3D2A16]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </span>
              )}
            </div>
          ) : null}

          <div
            className={cn(
              'space-y-1',
              isDocumentRejectLayout ? 'text-left' : 'mx-auto max-w-[333px] text-center',
            )}
          >
            <p className="text-body-md-semibold text-brand-text">{primary}</p>
            {secondary ? <p className="text-body-md text-brand-text">{secondary}</p> : null}
          </div>

          {showReasons ? (
            <div>
              <span className="text-body-sm-medium text-muted mb-[10px] block">Reasons</span>
              <div className="flex flex-wrap gap-[10px]">
                {reasonOptions.map((option) => {
                  const isSelected = selectedReasons.includes(option.value)

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onReasonToggle?.(option.value)}
                      className={cn(
                        'ui-modal-reason-chip',
                        isSelected ? 'ui-modal-reason-chip-selected' : 'ui-modal-reason-chip-idle',
                      )}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}

          {showConfirmation ? (
            <label className="text-body-md text-brand-text flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={confirmationChecked}
                onChange={(event) => onConfirmationChange?.(event.target.checked)}
                className="accent-brand-accent mt-0.5 size-[15px] shrink-0"
              />
              <span>{confirmationLabel}</span>
            </label>
          ) : null}

          {showTimeline ? (
            <div>
              <span className="text-body-sm-medium text-muted mb-[10px] block">
                Suspension Timeline
              </span>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={startDate}
                  disabled={indefinite}
                  onChange={(event) => onStartDateChange?.(event.target.value)}
                  className="ui-input [color-scheme:dark] disabled:cursor-not-allowed disabled:opacity-50"
                />
                <input
                  type="date"
                  value={endDate}
                  disabled={indefinite}
                  onChange={(event) => onEndDateChange?.(event.target.value)}
                  className="ui-input [color-scheme:dark] disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <label className="text-body-md text-brand-text mt-3 flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={indefinite}
                  onChange={(event) => onIndefiniteChange?.(event.target.checked)}
                  className="accent-brand-accent size-4"
                />
                <span>{indefiniteLabel}</span>
              </label>
            </div>
          ) : null}

          {showEscalationOptions ? (
            <div className="space-y-3.5">
              {escalationOptions.map((option) => {
                const isSelected = selectedEscalationOption === option.value

                return (
                  <label
                    key={option.value}
                    className="text-body-md text-brand-text flex cursor-pointer items-center gap-3"
                  >
                    <span
                      className={cn(
                        'grid size-5 place-items-center rounded-full border-2',
                        isSelected ? 'border-brand-accent' : 'border-white/70',
                      )}
                    >
                      {isSelected ? (
                        <span className="bg-brand-accent size-2.5 rounded-full" />
                      ) : null}
                    </span>
                    <input
                      type="radio"
                      name="decision-action-escalation"
                      value={option.value}
                      checked={isSelected}
                      onChange={() => onEscalationOptionChange?.(option.value)}
                      className="sr-only"
                    />
                    <span>{formatEscalationLabel(option.label)}</span>
                  </label>
                )
              })}
            </div>
          ) : null}

          {showReasonInput ? (
            <label className="block">
              <span className="text-body-sm-medium text-brand-text mb-2 block">
                {reasonLabel} <span className="text-brand-danger">*</span>
              </span>
              <textarea
                value={reason}
                onChange={(event) => onReasonChange?.(event.target.value)}
                className="ui-textarea min-h-[72px]"
              />
            </label>
          ) : null}

          <label className="block">
            <span className="text-body-sm-medium text-brand-text mb-2 block">
              Admin notes <span className="text-brand-danger">*</span>
            </span>
            <textarea
              value={adminNotes}
              onChange={(event) => onAdminNotesChange(event.target.value)}
              className="ui-textarea"
            />
          </label>
        </div>

        <div className="ui-modal-footer">
          <button type="button" onClick={onClose} className="ui-modal-btn ui-modal-btn-cancel">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className={cn('ui-modal-btn', styles.submit)}
          >
            <span>{submitLabel}</span>
            {resolvedSubmitIcon === 'check' ? (
              <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-white">
                <Check
                  className={cn('size-2.5', styles.checkIconColor ?? 'text-brand-positive')}
                  strokeWidth={3}
                  aria-hidden="true"
                />
              </span>
            ) : null}
            {resolvedSubmitIcon === 'x' ? (
              <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-white">
                <X className="text-brand-danger size-2.5" strokeWidth={3} aria-hidden="true" />
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </div>
  )
}
