import { BadgeCheck, CircleArrowOutUpRight, Gavel, RotateCcw, XCircle } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

const buttonBaseClass =
  'inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-[11px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50'

export type DecisionControlButtonsProps = {
  onApprove: () => void
  onRequestChanges: () => void
  onEscalate?: () => void
  onReject: () => void
  showEscalate?: boolean
  approveDisabled?: boolean
  requestChangesDisabled?: boolean
  escalateDisabled?: boolean
  rejectDisabled?: boolean
  className?: string
}

export function DecisionControlButtons({
  onApprove,
  onRequestChanges,
  onEscalate,
  onReject,
  showEscalate = true,
  approveDisabled = false,
  requestChangesDisabled = false,
  escalateDisabled = false,
  rejectDisabled = false,
  className,
}: DecisionControlButtonsProps) {
  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      <button
        type="button"
        onClick={onApprove}
        disabled={approveDisabled}
        className={cn(buttonBaseClass, 'bg-brand-success text-white hover:bg-[#08a85d]')}
      >
        Approve
        <BadgeCheck className="size-3.5 shrink-0" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={onRequestChanges}
        disabled={requestChangesDisabled}
        className={cn(
          buttonBaseClass,
          'bg-brand-accent text-brand-text-dark hover:bg-brand-gold-from',
        )}
      >
        Ask for Re-Submit
        <RotateCcw className="size-3.5 shrink-0" aria-hidden="true" />
      </button>

      {showEscalate ? (
        <button
          type="button"
          onClick={onEscalate}
          disabled={escalateDisabled || !onEscalate}
          className={cn(buttonBaseClass, 'bg-brand-action text-white hover:bg-[#1e40af]')}
        >
          Escalate
          <CircleArrowOutUpRight className="size-3.5 shrink-0" aria-hidden="true" />
        </button>
      ) : null}

      <button
        type="button"
        onClick={onReject}
        disabled={rejectDisabled}
        className={cn(buttonBaseClass, 'bg-brand-danger text-white hover:opacity-90')}
      >
        Reject Application
        <XCircle className="size-3.5 shrink-0" aria-hidden="true" />
      </button>
    </div>
  )
}

export function DecisionControlsHeader({
  className,
  title = 'Decision Controls',
}: {
  className?: string
  title?: string
}) {
  return (
    <div className={cn('flex items-center gap-2 text-[14px] font-semibold text-white', className)}>
      <Gavel className="text-brand-accent size-4" aria-hidden="true" />
      <h3>{title}</h3>
    </div>
  )
}
