import { Check, MoveDiagonal, X } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

export type DecisionActionModalVariant =
  | 'approve'
  | 'reject'
  | 'requestChanges'
  | 'escalate'
  | 'suspend'

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
    selectedChip: string
    submitIcon?: 'check' | 'x'
    checkIconColor?: string
  }
> = {
  approve: {
    submit: 'bg-[#16A34A] text-white hover:bg-[#15803D]',
    selectedChip: 'bg-[#E8B884] text-black',
    submitIcon: 'check',
    checkIconColor: 'text-[#16A34A]',
  },
  reject: {
    submit: 'bg-[#E11D2E] text-white hover:bg-[#C41424]',
    selectedChip: 'bg-[#E8B884] text-black',
    submitIcon: 'x',
  },
  requestChanges: {
    submit: 'bg-[#FF842B] text-white hover:bg-[#F07520]',
    selectedChip: 'bg-[#E8B884] text-black',
    submitIcon: 'check',
    checkIconColor: 'text-[#FF842B]',
  },
  escalate: {
    submit: 'bg-[#E5B678] text-black hover:bg-[#D9A866]',
    selectedChip: 'bg-[#E8B884] text-black',
  },
  suspend: {
    submit: 'bg-[#E11D2E] text-white hover:bg-[#C41424]',
    selectedChip: 'bg-[#E8B884] text-black',
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
  const showHeroIcon = variant === 'approve' || variant === 'escalate'
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
        className="flex max-h-[90vh] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1A1A1A] text-white shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <h2
            id="decision-action-modal-title"
            className="text-[18px] font-semibold tracking-tight text-white"
          >
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          {warning ? <p className="text-[13px] leading-relaxed text-[#9A9A9A]">{warning}</p> : null}

          {showHeroIcon ? (
            <div className="flex justify-center">
              {variant === 'approve' ? (
                <span className="flex size-[72px] items-center justify-center rounded-full bg-[#1F9D55]">
                  <Check className="size-9 text-white" strokeWidth={3} aria-hidden="true" />
                </span>
              ) : (
                <span className="flex size-[72px] items-center justify-center rounded-full bg-[#E8B884]">
                  <MoveDiagonal
                    className="size-8 text-[#3D2A16]"
                    strokeWidth={2.25}
                    aria-hidden="true"
                  />
                </span>
              )}
            </div>
          ) : null}

          <div
            className={cn(
              'space-y-1',
              isDocumentRejectLayout ? 'text-left' : 'mx-auto max-w-[380px] text-center',
            )}
          >
            <p
              className={cn(
                'leading-snug text-white',
                showHeroIcon
                  ? 'text-[15px] font-semibold'
                  : isDocumentRejectLayout
                    ? 'text-[14px] font-normal'
                    : 'text-[14px] font-medium',
              )}
            >
              {primary}
            </p>
            {secondary ? (
              <p className="text-[14px] leading-relaxed text-white/85">{secondary}</p>
            ) : null}
          </div>

          {showReasons ? (
            <div>
              <span className="mb-2.5 block text-[13px] font-medium text-[#9A9A9A]">Reasons</span>
              <div className="flex flex-wrap gap-2.5">
                {reasonOptions.map((option) => {
                  const isSelected = selectedReasons.includes(option.value)

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onReasonToggle?.(option.value)}
                      className={cn(
                        'rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors',
                        isSelected
                          ? styles.selectedChip
                          : 'border border-white/15 bg-[#0D0D0D] text-white hover:border-white/30',
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
            <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-snug text-white">
              <input
                type="checkbox"
                checked={confirmationChecked}
                onChange={(event) => onConfirmationChange?.(event.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-[#E5B678]"
              />
              <span>{confirmationLabel}</span>
            </label>
          ) : null}

          {showTimeline ? (
            <div>
              <span className="mb-2.5 block text-[13px] font-medium text-[#9A9A9A]">
                Suspension Timeline
              </span>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={startDate}
                  disabled={indefinite}
                  onChange={(event) => onStartDateChange?.(event.target.value)}
                  className="h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm text-white [color-scheme:dark] outline-none focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <input
                  type="date"
                  value={endDate}
                  disabled={indefinite}
                  onChange={(event) => onEndDateChange?.(event.target.value)}
                  className="h-11 w-full rounded-lg border border-white/10 bg-black px-3 text-sm text-white [color-scheme:dark] outline-none focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-white">
                <input
                  type="checkbox"
                  checked={indefinite}
                  onChange={(event) => onIndefiniteChange?.(event.target.checked)}
                  className="size-4 accent-[#E5B678]"
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
                    className="flex cursor-pointer items-center gap-3 text-[15px] text-white"
                  >
                    <span
                      className={cn(
                        'grid size-5 place-items-center rounded-full border-2',
                        isSelected ? 'border-[#E5B678]' : 'border-white/70',
                      )}
                    >
                      {isSelected ? <span className="size-2.5 rounded-full bg-[#E5B678]" /> : null}
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
              <span className="mb-2 block text-[13px] font-medium text-white">
                {reasonLabel} <span className="text-[#E11D2E]">*</span>
              </span>
              <textarea
                value={reason}
                onChange={(event) => onReasonChange?.(event.target.value)}
                className="min-h-[72px] w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/25"
              />
            </label>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-white">
              Admin notes <span className="text-[#E11D2E]">*</span>
            </span>
            <textarea
              value={adminNotes}
              onChange={(event) => onAdminNotesChange(event.target.value)}
              className="min-h-[110px] w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/25"
            />
          </label>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-3 px-6 pt-1 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-xl border border-white bg-transparent text-[15px] font-semibold text-white transition-colors hover:bg-white/5"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className={cn(
              'flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
              styles.submit,
            )}
          >
            {submitLabel}
            {resolvedSubmitIcon === 'check' ? (
              <span className="flex size-5 items-center justify-center rounded-full bg-white">
                <Check
                  className={cn('size-3', styles.checkIconColor ?? 'text-[#E11D2E]')}
                  strokeWidth={3}
                  aria-hidden="true"
                />
              </span>
            ) : null}
            {resolvedSubmitIcon === 'x' ? (
              <span className="flex size-5 items-center justify-center rounded-full bg-white">
                <X className="size-3 text-[#E11D2E]" strokeWidth={3} aria-hidden="true" />
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </div>
  )
}
