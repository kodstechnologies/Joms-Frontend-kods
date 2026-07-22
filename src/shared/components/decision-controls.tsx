import { BadgeCheck, CircleArrowOutUpRight, Gavel, RotateCcw, XCircle } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

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
        className="ui-cta ui-cta-positive"
      >
        Approve
        <BadgeCheck className="icon-sm shrink-0" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={onRequestChanges}
        disabled={requestChangesDisabled}
        className="ui-cta ui-cta-primary"
      >
        Ask for Re-Submit
        <RotateCcw className="icon-sm shrink-0" aria-hidden="true" />
      </button>

      {showEscalate ? (
        <button
          type="button"
          onClick={onEscalate}
          disabled={escalateDisabled || !onEscalate}
          className="ui-cta bg-brand-action text-white hover:bg-[color-mix(in_srgb,var(--brand-action)_85%,black)]"
        >
          Escalate
          <CircleArrowOutUpRight className="icon-sm shrink-0" aria-hidden="true" />
        </button>
      ) : null}

      <button
        type="button"
        onClick={onReject}
        disabled={rejectDisabled}
        className="ui-cta ui-cta-negative"
      >
        Reject Application
        <XCircle className="icon-sm shrink-0" aria-hidden="true" />
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
    <div className={cn('text-body-md-semibold text-brand-text flex items-center gap-2', className)}>
      <Gavel className="icon-md text-brand-accent" aria-hidden="true" />
      <h3>{title}</h3>
    </div>
  )
}
