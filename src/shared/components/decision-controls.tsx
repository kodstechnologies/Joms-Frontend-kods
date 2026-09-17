import { BadgeCheck, CircleArrowOutUpRight, RotateCcw, XCircle } from 'lucide-react'

import decisionControlIcon from '@/assets/JOMS_ICONS-2/decision-control.svg'
import { cn } from '@/shared/lib/cn'

const decisionBtnClass =
  'inline-flex h-10 shrink-0 items-center justify-center gap-2.5 rounded-[10px] px-2.5 text-[12px] leading-5 font-semibold tracking-normal disabled:cursor-not-allowed disabled:opacity-60'

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
    <div className={cn('flex flex-nowrap items-center gap-2.5 overflow-x-auto', className)}>
      <button
        type="button"
        onClick={onApprove}
        disabled={approveDisabled}
        className={cn(decisionBtnClass, 'w-[97px] bg-[#00A63E] text-white hover:bg-[#009437]')}
      >
        Approve
        <BadgeCheck className="size-4 shrink-0" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={onRequestChanges}
        disabled={requestChangesDisabled}
        className={cn(decisionBtnClass, 'bg-[#F6CB86] text-[#050505] hover:brightness-95')}
      >
        Ask for Re-Submit
        <RotateCcw className="size-4 shrink-0" aria-hidden="true" />
      </button>

      {showEscalate ? (
        <button
          type="button"
          onClick={onEscalate}
          disabled={escalateDisabled || !onEscalate}
          className={cn(decisionBtnClass, 'bg-[#155DFC] text-white hover:bg-[#1248d4]')}
        >
          Escalate
          <CircleArrowOutUpRight className="size-4 shrink-0" aria-hidden="true" />
        </button>
      ) : null}

      <button
        type="button"
        onClick={onReject}
        disabled={rejectDisabled}
        className={cn(decisionBtnClass, 'bg-[#D3191C] text-white hover:bg-[#b81417]')}
      >
        Reject Application
        <XCircle className="size-4 shrink-0" aria-hidden="true" />
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
    <div className={cn('flex h-6 items-center gap-2', className)}>
      <img
        src={decisionControlIcon}
        alt=""
        className="size-5 shrink-0 brightness-0 invert"
        aria-hidden="true"
      />
      <h3 className="text-[20px] leading-6 font-semibold tracking-normal text-white">{title}</h3>
    </div>
  )
}
