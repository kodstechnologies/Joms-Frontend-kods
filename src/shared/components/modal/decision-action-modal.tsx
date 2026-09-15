import { useRef } from 'react'
import {
  AlertTriangle,
  Check,
  CircleArrowOutUpRight,
  Pause,
  Trash2,
  UserMinus,
  X,
} from 'lucide-react'
import calendarIcon from '@/assets/JOMS_ICONS-2/icons8-calendar.svg'
import { cn } from '@/shared/lib/cn'
import { useDialogFocusTrap } from '@/shared/hooks/use-dialog-focus-trap'

export type DecisionActionModalVariant =
  'approve' | 'reject' | 'requestChanges' | 'escalate' | 'suspend' | 'delete' | 'pause' | 'warn'

export type DecisionActionModalOption = {
  label: string
  value: string
}

export type DecisionActionSubmitIcon =
  'check' | 'x' | 'trash' | 'userMinus' | 'pause' | 'circleArrowOutUpRight' | 'none'

type DecisionActionModalProps = {
  open: boolean
  variant: DecisionActionModalVariant
  title: string
  description?: string
  submitLabel: string
  adminNotes?: string
  onAdminNotesChange?: (value: string) => void
  showAdminNotes?: boolean
  onClose: () => void
  onSubmit: () => void
  cancelLabel?: string
  headerDescription?: string
  warning?: string
  reason?: string
  onReasonChange?: (value: string) => void
  reasonLabel?: string
  reasonRequired?: boolean
  reasonFieldType?: 'textarea' | 'input'
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
  submitDisabled?: boolean
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
  heroLayout?: 'stack' | 'inline'
  checkIconColor?: string
}

const variantStyles: Record<
  DecisionActionModalVariant,
  {
    submit: string
    submitIcon?: DecisionActionSubmitIcon
    checkIconColor?: string
    showHero?: boolean
    showReasonsLabel?: boolean
    heroShape?: 'circle' | 'square'
    adminNotesMinHeight?: string
    reasonMinHeight?: string
    descriptionMaxWidth?: string
    descriptionCentered?: boolean
    shellClass?: string
    fieldLabelClass?: string
    titleClass?: string
    confirmationClass?: string
    descriptionClass?: string
    heroLayout?: 'stack' | 'inline'
    reasonsLabelClass?: string
  }
> = {
  approve: {
    submit: 'ui-modal-btn-positive',
    submitIcon: 'check',
    checkIconColor: 'text-[#00A63E]',
    showHero: true,
    heroShape: 'circle',
    adminNotesMinHeight: 'min-h-[119px]',
  },
  reject: {
    submit: 'ui-modal-btn-negative',
    submitIcon: 'x',
    showHero: false,
    showReasonsLabel: true,
    adminNotesMinHeight: 'min-h-[137px]',
    reasonMinHeight: 'min-h-[65px]',
    descriptionMaxWidth: 'max-w-none',
  },
  requestChanges: {
    submit: 'ui-modal-btn-request-changes',
    submitIcon: 'check',
    checkIconColor: 'text-[#B7540F]',
    showHero: false,
    showReasonsLabel: true,
    adminNotesMinHeight: '!h-[117px] !min-h-[117px] !max-h-[117px] rounded-[10px]',
    reasonMinHeight: '!h-[65px] !min-h-[65px] !max-h-[65px] rounded-[10px]',
    descriptionMaxWidth: 'max-w-[333px]',
    descriptionCentered: true,
    descriptionClass:
      'mx-auto w-[333px] max-w-full text-center text-[14px] font-semibold leading-6 tracking-normal text-white',
    shellClass: '!h-[724px] !max-h-[724px]',
    fieldLabelClass: 'mb-2 block text-[14px] font-semibold leading-6 tracking-normal text-white',
  },
  escalate: {
    submit: 'ui-modal-btn-gold',
    submitIcon: 'circleArrowOutUpRight',
    showHero: true,
    heroShape: 'circle',
    adminNotesMinHeight: 'min-h-[100px]',
  },
  suspend: {
    submit: 'ui-modal-btn-negative',
    submitIcon: 'x',
    showHero: true,
    heroShape: 'circle',
    showReasonsLabel: false,
    adminNotesMinHeight: 'min-h-[113px]',
    descriptionMaxWidth: 'max-w-[302px]',
  },
  delete: {
    submit: 'ui-modal-btn-negative',
    submitIcon: 'x',
    showHero: true,
    heroShape: 'circle',
    heroLayout: 'inline',
    showReasonsLabel: true,
    adminNotesMinHeight: '!h-[117px] !min-h-[117px] !max-h-[117px] rounded-[10px]',
    descriptionMaxWidth: 'w-[268px]',
    descriptionCentered: true,
    descriptionClass:
      'mx-auto flex h-12 w-[268px] max-w-full flex-col justify-center text-center text-[14px] font-semibold leading-6 tracking-normal text-white',
    fieldLabelClass: 'mb-2 block text-[14px] font-semibold leading-6 tracking-normal text-white',
    shellClass: '!h-[636px] !max-h-[636px]',
    titleClass: 'text-[24px] font-semibold leading-6 tracking-normal text-white',
    confirmationClass: 'max-w-[405px] text-[14px] font-normal leading-5 tracking-normal text-white',
    reasonsLabelClass:
      'mb-[10px] block text-[14px] font-normal leading-5 tracking-normal text-[#FFFFFF80]',
  },
  pause: {
    submit: 'ui-modal-btn-negative',
    submitIcon: 'pause',
    showHero: false,
    showReasonsLabel: true,
    descriptionClass: 'text-[14px] font-normal leading-5 tracking-normal text-[#FFFFFF80]',
    titleClass: 'text-[24px] leading-8 font-semibold tracking-normal text-white',
    fieldLabelClass: 'mb-2 block text-[14px] font-semibold leading-6 tracking-normal text-white',
    reasonsLabelClass:
      'mb-[10px] block text-[14px] font-normal leading-5 tracking-normal text-[#FFFFFF80]',
    confirmationClass: 'text-[12px] font-normal leading-5 tracking-normal text-white',
    adminNotesMinHeight: 'min-h-[119px] rounded-[10px] bg-[#050505]',
    shellClass: 'max-w-[584px]',
  },
  warn: {
    submit: 'ui-modal-btn-gold',
    submitIcon: 'none',
    showHero: true,
    heroShape: 'circle',
    showReasonsLabel: false,
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
  description = '',
  submitLabel,
  adminNotes = '',
  onAdminNotesChange,
  showAdminNotes = true,
  onClose,
  onSubmit,
  cancelLabel = 'Cancel',
  headerDescription,
  warning,
  reason = '',
  onReasonChange,
  reasonLabel = 'Reason',
  reasonRequired = false,
  reasonFieldType = 'textarea',
  reasonOptions = [],
  selectedReasons = [],
  onReasonToggle,
  showReasonsLabel,
  confirmationLabel,
  confirmationChecked = false,
  onConfirmationChange,
  escalationOptions = [],
  selectedEscalationOption = '',
  onEscalationOptionChange,
  isSubmitting = false,
  submitDisabled = false,
  showTimeline = false,
  startDate = '',
  onStartDateChange,
  endDate = '',
  onEndDateChange,
  indefinite = false,
  onIndefiniteChange,
  indefiniteLabel = 'Set Indefinitely',
  submitIcon,
  showHeroIcon,
  heroLayout,
  checkIconColor,
}: DecisionActionModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null)

  useDialogFocusTrap(open, onClose, dialogRef)

  if (!open) {
    return null
  }

  const styles = variantStyles[variant]
  const resolvedShowHero = showHeroIcon ?? styles.showHero ?? false
  const resolvedShowReasonsLabel = showReasonsLabel ?? styles.showReasonsLabel ?? true
  const showReasons =
    Boolean(onReasonToggle) &&
    (variant === 'reject' ||
      variant === 'requestChanges' ||
      variant === 'pause' ||
      variant === 'delete' ||
      variant === 'suspend' ||
      reasonOptions.length > 0)
  const showReasonInput = Boolean(onReasonChange)
  const showConfirmation = Boolean(onConfirmationChange)
  const showEscalationOptions = escalationOptions.length > 0 && Boolean(onEscalationOptionChange)
  const resolvedConfirmationLabel =
    confirmationLabel ??
    (variant === 'delete'
      ? 'I confirm that I want to delete this item'
      : 'I confirm that I want to suspend this item')
  const resolvedSubmitIcon = submitIcon ?? styles.submitIcon
  const resolvedCheckIconColor =
    checkIconColor ??
    styles.checkIconColor ??
    (styles.submit === 'ui-modal-btn-negative' ? 'text-[#D3191C]' : 'text-[#00A63E]')
  const isInlineHero = (heroLayout ?? styles.heroLayout ?? 'stack') === 'inline' && resolvedShowHero
  const hasBodyDescription = Boolean(description.trim())
  const isLeftAlignedCopy =
    !styles.descriptionCentered &&
    (Boolean(warning) ||
      isInlineHero ||
      (Boolean(headerDescription) && !resolvedShowHero) ||
      !resolvedShowHero)
  const { primary, secondary } = splitDescription(description)

  const deleteHeroIcon = (
    <span className="flex size-[50px] shrink-0 items-center justify-center rounded-full bg-[#D3191C33]">
      <Trash2 className="size-5 text-[#D3191C]" strokeWidth={1.75} aria-hidden="true" />
    </span>
  )

  const descriptionBlock = hasBodyDescription ? (
    variant === 'delete' ? (
      <div
        className={cn(
          styles.descriptionClass ??
            'mx-auto flex h-12 w-[268px] max-w-full flex-col justify-center text-center text-[14px] leading-6 font-semibold tracking-normal text-white',
          isInlineHero && 'mx-0 text-left',
        )}
      >
        <span>{primary}</span>
        {secondary ? <span>{secondary}</span> : null}
      </div>
    ) : styles.descriptionClass ? (
      <p className={styles.descriptionClass}>{description}</p>
    ) : (
      <div
        className={cn(
          'space-y-1',
          isLeftAlignedCopy
            ? 'max-w-none text-left'
            : cn('mx-auto text-center', styles.descriptionMaxWidth ?? 'max-w-[333px]'),
        )}
      >
        <p className="text-body-sm text-muted">{primary}</p>
        {secondary ? <p className="text-body-sm text-muted">{secondary}</p> : null}
      </div>
    )
  ) : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/80 px-4 py-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="decision-action-modal-title"
        className={cn('ui-modal-shell w-full max-w-[551px]', styles.shellClass)}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal-header !items-start !gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <h2
              id="decision-action-modal-title"
              className={styles.titleClass ?? 'text-h2 text-brand-text'}
            >
              {title}
            </h2>
            {headerDescription ? (
              <p className="text-body-sm text-muted">{headerDescription}</p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="text-brand-muted grid size-6 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="ui-modal-body space-y-4">
          {warning ? <p className="text-body-sm text-muted">{warning}</p> : null}

          {isInlineHero && variant === 'delete' ? (
            <div className="flex items-center gap-[14px]">
              {deleteHeroIcon}
              {descriptionBlock}
            </div>
          ) : (
            <>
              {resolvedShowHero ? (
                <div className="flex justify-center">
                  {variant === 'approve' ? (
                    <span className="flex size-[70px] items-center justify-center rounded-full bg-[rgb(0_166_62_/_30%)]">
                      <Check className="size-7 text-[#00A63E]" strokeWidth={3} aria-hidden="true" />
                    </span>
                  ) : variant === 'suspend' ? (
                    <span className="flex size-[70px] items-center justify-center rounded-full bg-[rgb(211_25_28_/_20%)]">
                      <X className="size-7 text-[#D3191C]" strokeWidth={3} aria-hidden="true" />
                    </span>
                  ) : variant === 'delete' ? (
                    deleteHeroIcon
                  ) : variant === 'warn' ? (
                    <span className="flex size-[70px] items-center justify-center rounded-full bg-[rgb(224_162_99_/_20%)]">
                      <AlertTriangle
                        className="size-7 text-[#E0A263]"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
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
              {descriptionBlock}
            </>
          )}

          {showReasons ? (
            <div>
              {resolvedShowReasonsLabel ? (
                <span
                  className={
                    styles.reasonsLabelClass ?? 'text-body-sm-medium text-muted mb-[10px] block'
                  }
                >
                  Reasons
                </span>
              ) : null}
              <div className="flex flex-wrap gap-[10px]">
                {reasonOptions.length > 0 ? (
                  reasonOptions.map((option) => {
                    const isSelected = selectedReasons.includes(option.value)

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onReasonToggle?.(option.value)}
                        className={cn(
                          'ui-modal-reason-chip rounded-xl',
                          isSelected
                            ? 'ui-modal-reason-chip-selected'
                            : 'ui-modal-reason-chip-idle',
                        )}
                      >
                        {option.label.replace(/^\[|\]$/g, '')}
                      </button>
                    )
                  })
                ) : (
                  <p className="text-body-sm text-muted">
                    No reasons added yet. Add them in Settings → Templates.
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {showConfirmation ? (
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={confirmationChecked}
                onChange={(event) => onConfirmationChange?.(event.target.checked)}
                className="ui-table-checkbox"
              />
              <span className={styles.confirmationClass}>{resolvedConfirmationLabel}</span>
            </label>
          ) : null}

          {showTimeline ? (
            <div>
              <span className="text-body-sm-medium text-muted mb-[10px] block">
                Suspension Timeline
              </span>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={cn(
                    'relative block',
                    indefinite && 'pointer-events-none cursor-not-allowed opacity-50',
                  )}
                >
                  <input
                    type="date"
                    value={startDate}
                    disabled={indefinite}
                    onChange={(event) => onStartDateChange?.(event.target.value)}
                    className="ui-input h-10 w-full pr-10 [color-scheme:dark] disabled:cursor-not-allowed [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                  />
                  <img
                    src={calendarIcon}
                    alt="calendar"
                    className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
                    style={{ filter: 'brightness(0) invert(1)' }}
                    aria-hidden="true"
                  />
                </label>
                <label
                  className={cn(
                    'relative block',
                    indefinite && 'pointer-events-none cursor-not-allowed opacity-50',
                  )}
                >
                  <input
                    type="date"
                    value={endDate}
                    disabled={indefinite}
                    onChange={(event) => onEndDateChange?.(event.target.value)}
                    className="ui-input h-10 w-full pr-10 [color-scheme:dark] disabled:cursor-not-allowed [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                  />
                  <img
                    src={calendarIcon}
                    alt="calendar"
                    className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
                    style={{ filter: 'brightness(0) invert(1)' }}
                    aria-hidden="true"
                  />
                </label>
              </div>
              <label className="text-body-md text-brand-text mt-3 flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={indefinite}
                  onChange={(event) => onIndefiniteChange?.(event.target.checked)}
                  className="size-4 accent-white"
                />
                <span>{indefiniteLabel}</span>
              </label>
            </div>
          ) : null}

          {showEscalationOptions ? (
            <div className="max-h-[240px] space-y-3.5 overflow-y-auto pr-1">
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
                        isSelected ? 'border-white' : 'border-white/70',
                      )}
                    >
                      {isSelected ? <span className="size-2.5 rounded-full bg-white" /> : null}
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
            <label className="block w-full max-w-[502px]">
              <span
                className={styles.fieldLabelClass ?? 'text-body-sm-medium text-muted mb-2 block'}
              >
                {reasonLabel}
                {reasonRequired || variant === 'requestChanges' ? (
                  <span className="text-[#D3191C]"> *</span>
                ) : null}
              </span>
              {reasonFieldType === 'input' ? (
                <input
                  type="text"
                  value={reason}
                  onChange={(event) => onReasonChange?.(event.target.value)}
                  className="ui-input h-10 w-full"
                />
              ) : (
                <textarea
                  value={reason}
                  onChange={(event) => onReasonChange?.(event.target.value)}
                  className={cn('ui-textarea w-full', styles.reasonMinHeight ?? 'min-h-[72px]')}
                />
              )}
            </label>
          ) : null}

          {showAdminNotes ? (
            <label className="block w-full max-w-[502px]">
              <span
                className={
                  styles.fieldLabelClass ?? 'text-body-sm-medium text-brand-text mb-2 block'
                }
              >
                Admin notes <span className="text-[#D3191C]">*</span>
              </span>
              <textarea
                value={adminNotes}
                onChange={(event) => onAdminNotesChange?.(event.target.value)}
                className={cn('ui-textarea w-full', styles.adminNotesMinHeight ?? 'min-h-[119px]')}
              />
            </label>
          ) : null}
        </div>

        <div className="ui-modal-footer px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="ui-modal-btn ui-modal-btn-cancel h-10 max-w-[239px] flex-1"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || submitDisabled}
            className={cn('ui-modal-btn h-10 max-w-[238px] flex-1 overflow-visible', styles.submit)}
          >
            <span className="truncate">{submitLabel}</span>
            {resolvedSubmitIcon === 'check' ? (
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white">
                <Check
                  className={cn('size-3', resolvedCheckIconColor)}
                  strokeWidth={3}
                  aria-hidden="true"
                />
              </span>
            ) : null}
            {resolvedSubmitIcon === 'x' ? (
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white">
                <X className="size-3 text-[#D3191C]" strokeWidth={3} aria-hidden="true" />
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
                  className="size-3 text-[#D3191C]"
                  strokeWidth={2.5}
                  fill="currentColor"
                  aria-hidden="true"
                />
              </span>
            ) : null}
            {resolvedSubmitIcon === 'circleArrowOutUpRight' ? (
              <CircleArrowOutUpRight
                className="size-4 shrink-0 text-black"
                strokeWidth={2.2}
                aria-hidden="true"
              />
            ) : null}
          </button>
        </div>
      </div>
    </div>
  )
}
