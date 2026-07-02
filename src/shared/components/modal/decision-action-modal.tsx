import { Check, KeyRound, X } from 'lucide-react'

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
  reason?: string
  onReasonChange?: (value: string) => void
  reasonOptions?: DecisionActionModalOption[]
  selectedReasons?: string[]
  onReasonToggle?: (value: string) => void
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
}

const variantStyles: Record<
  DecisionActionModalVariant,
  {
    submit: string
    selectedChip: string
    iconWrap?: string
    icon?: 'check' | 'key'
  }
> = {
  approve: {
    submit: 'bg-brand-success text-brand-text hover:bg-brand-progress',
    selectedChip: 'bg-brand-accent text-brand-text-dark',
    iconWrap: 'bg-brand-success/15 text-brand-success',
    icon: 'check',
  },
  reject: {
    submit: 'bg-brand-danger text-brand-text hover:bg-brand-danger/80',
    selectedChip: 'bg-brand-accent text-brand-text-dark',
  },
  requestChanges: {
    submit: 'bg-brand-accent text-brand-text-dark hover:bg-brand-gold-from',
    selectedChip: 'bg-brand-accent text-brand-text-dark',
  },
  escalate: {
    submit: 'bg-brand-accent text-brand-text-dark hover:bg-brand-gold-from',
    selectedChip: 'bg-brand-accent text-brand-text-dark',
    iconWrap: 'bg-brand-accent/15 text-brand-accent',
    icon: 'key',
  },
  suspend: {
    submit: 'bg-brand-danger text-brand-text hover:bg-brand-danger/80',
    selectedChip: 'bg-brand-accent text-brand-text-dark',
  },
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
  reason = '',
  onReasonChange,
  reasonOptions = [],
  selectedReasons = [],
  onReasonToggle,
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
}: DecisionActionModalProps) {
  if (!open) return null

  const styles = variantStyles[variant]
  const showReasons = reasonOptions.length > 0
  const showReasonInput = Boolean(onReasonChange)
  const showEscalationOptions = escalationOptions.length > 0
  const showCheckIcon = variant !== 'escalate' && variant !== 'suspend'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 text-brand-text"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="decision-action-modal-title"
        className="flex max-h-[90vh] w-full max-w-[470px] flex-col overflow-hidden rounded-brand-md border border-white/10 bg-brand-surface shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 id="decision-action-modal-title" className="text-[18px] font-semibold text-brand-text">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="rounded-full p-1 text-brand-text transition-colors hover:bg-white/10"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {styles.iconWrap && (
            <div className="mb-5 flex justify-center">
              <span className={cn('flex size-14 items-center justify-center rounded-full', styles.iconWrap)}>
                {styles.icon === 'check' ? (
                  <Check className="size-6" aria-hidden="true" />
                ) : (
                  <KeyRound className="size-6" aria-hidden="true" />
                )}
              </span>
            </div>
          )}

          <p className="mx-auto max-w-[330px] text-center text-[11px] font-semibold leading-relaxed text-brand-text">
            {description}
          </p>

          {showReasons && (
            <div className="mt-5">
              <span className="mb-2 block text-[10px] font-medium text-brand-muted">Reasons</span>
              <div className="flex flex-wrap gap-3">
                {reasonOptions.map((option) => {
                  const isSelected = selectedReasons.includes(option.value)

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onReasonToggle?.(option.value)}
                      className={cn(
                        'rounded-brand-md bg-brand-bg px-3 py-2 text-[10px] font-bold text-brand-text transition-colors',
                        isSelected && styles.selectedChip,
                      )}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {showTimeline && (
            <div className="mt-5">
              <span className="mb-2 block text-[10px] font-medium text-brand-muted">
                Suspension Timeline
              </span>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={startDate}
                  disabled={indefinite}
                  onChange={(event) => onStartDateChange?.(event.target.value)}
                  className="w-full rounded-brand-md border border-transparent bg-brand-bg px-3 py-2.5 text-[11px] text-brand-text outline-none [color-scheme:dark] focus:border-brand-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <input
                  type="date"
                  value={endDate}
                  disabled={indefinite}
                  onChange={(event) => onEndDateChange?.(event.target.value)}
                  className="w-full rounded-brand-md border border-transparent bg-brand-bg px-3 py-2.5 text-[11px] text-brand-text outline-none [color-scheme:dark] focus:border-brand-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <label className="mt-3 flex cursor-pointer items-center gap-2 text-[11px] text-brand-text">
                <input
                  type="checkbox"
                  checked={indefinite}
                  onChange={(event) => onIndefiniteChange?.(event.target.checked)}
                  className="size-3.5 accent-brand-accent"
                />
                <span>{indefiniteLabel}</span>
              </label>
            </div>
          )}

          {showEscalationOptions && (
            <div className="mt-5 space-y-3">
              {escalationOptions.map((option) => (
                <label key={option.value} className="flex cursor-pointer items-center gap-2 text-[11px] text-brand-text">
                  <input
                    type="radio"
                    name="decision-action-escalation"
                    value={option.value}
                    checked={selectedEscalationOption === option.value}
                    onChange={() => onEscalationOptionChange?.(option.value)}
                    className="size-3 accent-brand-accent"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          )}

          {showReasonInput && (
            <label className="mt-5 block">
              <span className="mb-2 block text-[10px] font-semibold text-brand-text">
                Reason <span className="text-brand-danger">*</span>
              </span>
              <textarea
                value={reason}
                onChange={(event) => onReasonChange?.(event.target.value)}
                className="h-[58px] w-full resize-none rounded-brand-md border border-transparent bg-brand-bg px-4 py-3 text-[11px] text-brand-text outline-none placeholder:text-brand-muted focus:border-brand-accent/50"
              />
            </label>
          )}

          <label className="mt-5 block">
            <span className="mb-2 block text-[10px] font-semibold text-brand-text">
              Admin notes <span className="text-brand-danger">*</span>
            </span>
            <textarea
              value={adminNotes}
              onChange={(event) => onAdminNotesChange(event.target.value)}
              className="h-[92px] w-full resize-none rounded-brand-md border border-transparent bg-brand-bg px-4 py-3 text-[11px] text-brand-text outline-none placeholder:text-brand-muted focus:border-brand-accent/50"
            />
          </label>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-brand-md border border-white px-4 py-3 text-[10px] font-semibold text-brand-text transition-colors hover:bg-white/10"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className={cn(
                'flex items-center justify-center gap-2 rounded-brand-md px-4 py-3 text-[10px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                styles.submit,
              )}
            >
              {submitLabel}
              {showCheckIcon && (
                <span className="flex size-4 items-center justify-center rounded-full bg-white">
                  <Check
                    className={cn(
                      'size-2.5',
                      variant === 'approve'
                        ? 'text-brand-success'
                        : variant === 'reject'
                          ? 'text-brand-danger'
                          : 'text-brand-accent',
                    )}
                    aria-hidden="true"
                  />
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
