import { Check, CircleArrowOutUpRight, Pause, Trash2, UserMinus, X } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

export type DecisionActionModalVariant =
  'approve' | 'reject' | 'requestChanges' | 'escalate' | 'suspend' | 'delete' | 'pause'

export type DecisionActionModalOption = {
  label: string
  value: string
}

export type DecisionActionSubmitIcon = 'check' | 'x' | 'trash' | 'userMinus' | 'pause' | 'none'

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
  showReasonsLabel?: boolean
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
  submitIcon?: DecisionActionSubmitIcon
  showHeroIcon?: boolean
}

const variantStyles: Record<
  DecisionActionModalVariant,
  {
    submit: string
    submitIcon?: DecisionActionSubmitIcon
    checkIconColor?: string
    showHero?: boolean
    showReasonsLabel?: boolean
  }
> = {
  approve: {
    submit: 'ui-modal-btn-positive',
    submitIcon: 'check',
    checkIconColor: 'text-brand-positive',
    showHero: true,
  },
  reject: {
    submit: 'ui-modal-btn-negative',
    submitIcon: 'x',
    showHero: true,
    showReasonsLabel: true,
  },
  requestChanges: {
    submit: 'ui-modal-btn-request-changes',
    submitIcon: 'check',
    checkIconColor: 'text-[#F97316]',
    showHero: false,
    showReasonsLabel: true,
  },
  escalate: {
    submit: 'ui-modal-btn-gold',
    showHero: true,
  },
  suspend: {
    submit: 'ui-modal-btn-negative',
    submitIcon: 'userMinus',
    showHero: true,
    showReasonsLabel: false,
  },
  delete: {
    submit: 'ui-modal-btn-negative',
    submitIcon: 'trash',
    showHero: true,
    showReasonsLabel: false,
  },
  pause: {
    submit: 'ui-modal-btn-negative',
    submitIcon: 'pause',
    showHero: false,
    showReasonsLabel: true,
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
  showReasonsLabel,
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
  indefiniteLabel = 'Suspend indefinitely (Until manually Reactivated)',
  submitIcon,
  showHeroIcon,
}: DecisionActionModalProps) {
  if (!open) return null

  const styles = variantStyles[variant]
  const showReasons = reasonOptions.length > 0
  const showReasonInput = Boolean(onReasonChange)
  const showEscalationOptions = escalationOptions.length > 0
  const showConfirmation = Boolean(confirmationLabel && onConfirmationChange)
  const resolvedShowHero = showHeroIcon ?? styles.showHero ?? false
  const resolvedShowReasonsLabel = showReasonsLabel ?? styles.showReasonsLabel ?? false
  const resolvedSubmitIcon = submitIcon ?? styles.submitIcon ?? 'none'
  const isLeftAlignedCopy = Boolean(warning)
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

          {resolvedShowHero ? (
            <div className="flex justify-center">
              {variant === 'approve' ? (
                <span className="flex size-[70px] items-center justify-center rounded-full bg-[rgb(0_166_62_/_30%)]">
                  <Check className="size-7 text-[#00A63E]" strokeWidth={3} aria-hidden="true" />
                </span>
              ) : variant === 'reject' || variant === 'suspend' ? (
                <span className="flex size-[70px] items-center justify-center rounded-full bg-[rgb(211_25_28_/_20%)]">
                  <X className="size-7 text-[#D3191C]" strokeWidth={3} aria-hidden="true" />
                </span>
              ) : variant === 'delete' ? (
                <span className="flex size-[70px] items-center justify-center rounded-full bg-[rgb(211_25_28_/_20%)]">
                  <Trash2 className="size-7 text-[#D3191C]" strokeWidth={1.75} aria-hidden="true" />
                </span>
              ) : (
                <span className="flex size-[70px] items-center justify-center rounded-full bg-[rgb(246_203_134_/_20%)]">
                  <CircleArrowOutUpRight
                    className="size-7 text-[#F6CB86]"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </span>
              )}
            </div>
          ) : null}

          <div
            className={cn(
              'space-y-1',
              isLeftAlignedCopy ? 'text-left' : 'mx-auto max-w-[333px] text-center',
            )}
          >
            <p className="text-body-md-semibold text-brand-text">{primary}</p>
            {secondary ? <p className="text-body-md text-brand-text">{secondary}</p> : null}
          </div>

          {showReasons ? (
            <div>
              {resolvedShowReasonsLabel ? (
                <span className="text-body-sm-medium text-muted mb-[10px] block">Reasons</span>
              ) : null}
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
              <span className="text-body-sm-medium text-brand-text mb-[10px] block">
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
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white">
                <Check
                  className={cn('size-3', styles.checkIconColor ?? 'text-brand-positive')}
                  strokeWidth={3}
                  aria-hidden="true"
                />
              </span>
            ) : null}
            {resolvedSubmitIcon === 'x' ? (
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white">
                <X className="text-brand-danger size-3" strokeWidth={3} aria-hidden="true" />
              </span>
            ) : null}
            {resolvedSubmitIcon === 'trash' ? (
              <Trash2
                className="size-4 shrink-0 text-white"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            ) : null}
            {resolvedSubmitIcon === 'userMinus' ? (
              <UserMinus
                className="size-4 shrink-0 text-white"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            ) : null}
            {resolvedSubmitIcon === 'pause' ? (
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white">
                <Pause
                  className="text-brand-danger size-3"
                  strokeWidth={2.5}
                  fill="currentColor"
                  aria-hidden="true"
                />
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </div>
  )
}
