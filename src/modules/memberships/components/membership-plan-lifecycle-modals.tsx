import { AlertTriangle, FileText, X } from 'lucide-react'
import type { ReactNode } from 'react'

import type { MembershipPlan } from '../types/membership'
import { DELETE_REASON_OPTIONS, PAUSE_REASON_OPTIONS } from '../mock/membership-metrics.mock'
import { formatCurrency } from '../utils/membership-format'
import { cn } from '@/shared/lib/cn'

const GOLD_FROM = '#f6cb86'
const GOLD_TO = '#e0a263'
const SEP = 'rgba(255, 255, 255, 0.1)'

type PlanLifecycleModalProps = {
  open: boolean
  plan: MembershipPlan | null
  adminNotes: string
  onAdminNotesChange: (value: string) => void
  selectedReasons: string[]
  onReasonToggle: (value: string) => void
  onClose: () => void
  onSubmit: () => void
  isSubmitting?: boolean
}

type PausePlanModalProps = PlanLifecycleModalProps & {
  startDate: string
  endDate: string
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
}

export function PausePlanModal({
  open,
  plan,
  adminNotes,
  onAdminNotesChange,
  selectedReasons,
  onReasonToggle,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClose,
  onSubmit,
  isSubmitting = false,
}: PausePlanModalProps) {
  if (!open || !plan) return null

  return (
    <PlanModalShell
      title="Pause Plan"
      description={`Are you sure you want to pause '${plan.planName}'?`}
      onClose={onClose}
    >
      <AlertBanner tone="danger">
        This will prevent new users from subscribing and will pause the plan automatically after all
        current user subscriptions expire.
      </AlertBanner>

      <PlanStatsBar plan={plan} />

      <div className="space-y-2">
        <span className="text-[14px] text-white">
          From <span className="text-[#d3191c]">*</span>
        </span>
        <div className="grid grid-cols-2 gap-3">
          <DateField value={startDate} onChange={onStartDateChange} />
          <DateField value={endDate} onChange={onEndDateChange} />
        </div>
      </div>

      <ReasonChips
        options={PAUSE_REASON_OPTIONS}
        selected={selectedReasons}
        onToggle={onReasonToggle}
      />

      <AdminNotesField value={adminNotes} onChange={onAdminNotesChange} />

      <ApprovalNote />

      <ModalActions
        onClose={onClose}
        onSubmit={onSubmit}
        submitLabel="Pause Plan"
        submitTone="gold"
        disabled={
          isSubmitting || !startDate || !endDate || !selectedReasons.length || !adminNotes.trim()
        }
      />
    </PlanModalShell>
  )
}

export function ResumePlanModal({
  open,
  plan,
  adminNotes,
  onAdminNotesChange,
  onClose,
  onSubmit,
  isSubmitting = false,
}: Omit<PlanLifecycleModalProps, 'selectedReasons' | 'onReasonToggle'>) {
  if (!open || !plan) return null

  const existingNote =
    plan.pauseInfo?.adminNotes?.trim() ||
    'Resuming this plan will restore access for all previously assigned users based on their original assignment dates.'

  return (
    <PlanModalShell
      title="Resume Plan"
      description={`Resume "${plan.planName}"?`}
      onClose={onClose}
    >
      <AlertBanner tone="success">
        Resuming this plan will restore access for all previously assigned users based on their
        original assignment dates.
      </AlertBanner>

      <PlanStatsBar plan={plan} />

      <div className="rounded-[10px] border border-white/15 bg-black p-4">
        <p className="mb-3 text-[14px] font-medium text-white">Admin note</p>
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 size-4 shrink-0 text-[#e0a263]" strokeWidth={1.75} />
          <p className="text-[14px] leading-[22px] text-white/80">{existingNote}</p>
        </div>
      </div>

      <AdminNotesField value={adminNotes} onChange={onAdminNotesChange} />

      <ApprovalNote />

      <ModalActions
        onClose={onClose}
        onSubmit={onSubmit}
        submitLabel="Resume Plan"
        submitTone="positive"
        disabled={isSubmitting || !adminNotes.trim()}
      />
    </PlanModalShell>
  )
}

export function DeletePlanModal({
  open,
  plan,
  adminNotes,
  onAdminNotesChange,
  selectedReasons,
  onReasonToggle,
  onClose,
  onSubmit,
  isSubmitting = false,
}: PlanLifecycleModalProps) {
  if (!open || !plan) return null

  return (
    <PlanModalShell
      title="Delete Plan"
      description={`Permanently delete '${plan.planName}'?`}
      onClose={onClose}
    >
      <AlertBanner tone="danger">
        This action cannot be undone. Deleting this plan will remove it permanently and revoke
        access for all assigned users. All assignment history will be archived but the plan card
        will be deleted.
      </AlertBanner>

      <PlanStatsBar plan={plan} cyclesLabel="Active Billing Cycles" />

      <ReasonChips
        options={DELETE_REASON_OPTIONS}
        selected={selectedReasons}
        onToggle={onReasonToggle}
      />

      <AdminNotesField value={adminNotes} onChange={onAdminNotesChange} />

      <ApprovalNote />

      <ModalActions
        onClose={onClose}
        onSubmit={onSubmit}
        submitLabel="Delete Plan"
        submitTone="danger"
        disabled={isSubmitting || !selectedReasons.length || !adminNotes.trim()}
      />
    </PlanModalShell>
  )
}

function PlanModalShell({
  title,
  description,
  onClose,
  children,
}: {
  title: string
  description: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div
        className="flex w-full max-w-[648px] flex-col overflow-hidden rounded-[16px] border border-white/10 bg-black text-white shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="flex items-start justify-between gap-3 px-6 py-5"
          style={{ borderBottom: `1px solid ${SEP}` }}
        >
          <div>
            <h3 className="text-[20px] leading-7 font-semibold text-white">{title}</h3>
            <p className="mt-1 text-[14px] leading-[22px] text-white/50">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[min(78vh,820px)] space-y-4 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}

function AlertBanner({ tone, children }: { tone: 'danger' | 'success'; children: ReactNode }) {
  const isDanger = tone === 'danger'
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-[10px] border px-4 py-3.5 text-[14px] leading-[22px]',
        isDanger
          ? 'border-[#d3191c]/35 bg-[#d3191c]/15 text-white'
          : 'border-[#00a63e]/35 bg-[#00a63e]/15 text-white',
      )}
    >
      <AlertTriangle
        className={cn('mt-0.5 size-5 shrink-0', isDanger ? 'text-[#ff5a5d]' : 'text-[#00d062]')}
        strokeWidth={1.75}
      />
      <p>{children}</p>
    </div>
  )
}

function PlanStatsBar({
  plan,
  cyclesLabel = 'cycles',
}: {
  plan: MembershipPlan
  cyclesLabel?: string
}) {
  const totalUsers = plan.subscriptionStats?.total ?? 0
  const cycles = String(plan.pricing?.length ?? 0).padStart(2, '0')
  const revenueEstimate =
    (plan.subscriptionStats?.total ?? 0) *
    (plan.pricing?.[0] ? plan.pricing[0].price * (1 - (plan.pricing[0].discount || 0) / 100) : 0)

  return (
    <div className="grid grid-cols-2 gap-4 rounded-[10px] bg-[#2a2118] px-4 py-3.5 sm:grid-cols-4">
      <StatCell title={plan.planName} subtitle={plan.planId} emphasizeTitle />
      <StatCell label="Total user" value={String(totalUsers)} />
      <StatCell label={cyclesLabel} value={cycles} />
      <StatCell label="Total Revenue" value={formatCurrency(Math.round(revenueEstimate))} />
    </div>
  )
}

function StatCell({
  label,
  value,
  title,
  subtitle,
  emphasizeTitle,
}: {
  label?: string
  value?: string
  title?: string
  subtitle?: string
  emphasizeTitle?: boolean
}) {
  if (title) {
    return (
      <div>
        <p
          className={cn(
            'truncate text-[14px] leading-[22px] text-white',
            emphasizeTitle && 'font-semibold',
          )}
        >
          {title}
        </p>
        {subtitle ? <p className="text-[12px] leading-[18px] text-white/50">{subtitle}</p> : null}
      </div>
    )
  }

  return (
    <div>
      <p className="text-[12px] leading-[18px] text-white/50">{label}</p>
      <p className="text-[14px] leading-[22px] font-semibold text-white">{value}</p>
    </div>
  )
}

function DateField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="box-border h-[42px] w-full rounded-[8px] border border-white/10 bg-black px-3.5 text-[14px] text-white [color-scheme:dark] outline-none focus:border-white/30"
    />
  )
}

function ReasonChips({
  options,
  selected,
  onToggle,
}: {
  options: Array<{ label: string; value: string }>
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onToggle(option.value)}
            className="inline-flex h-[37px] items-center justify-center rounded-[8px] px-3 text-[12px] leading-[18px] font-medium"
            style={
              active
                ? {
                    background: `linear-gradient(180deg, ${GOLD_FROM} 0%, ${GOLD_TO} 100%)`,
                    color: '#000000',
                    border: '1px solid transparent',
                  }
                : {
                    background: '#000000',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.35)',
                  }
            }
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function AdminNotesField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[14px] text-white">
        Admin notes <span className="text-[#d3191c]">*</span>
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="box-border min-h-[119px] w-full resize-none rounded-[8px] border border-white/10 bg-black px-3.5 py-3 text-[14px] text-white outline-none focus:border-white/30"
      />
    </label>
  )
}

function ApprovalNote() {
  return (
    <p className="text-[14px] text-white/70 italic">
      Note: This action will be live once the super admin approves this action.
    </p>
  )
}

function ModalActions({
  onClose,
  onSubmit,
  submitLabel,
  submitTone,
  disabled,
}: {
  onClose: () => void
  onSubmit: () => void
  submitLabel: string
  submitTone: 'gold' | 'positive' | 'danger'
  disabled?: boolean
}) {
  return (
    <div className="flex justify-end gap-3 pt-1">
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-10 w-[218px] items-center justify-center rounded-[10px] border border-white px-4 text-[14px] font-semibold text-white hover:bg-white/5"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled}
        className={cn(
          'inline-flex h-10 w-[218px] items-center justify-center rounded-[10px] px-4 text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-60',
          submitTone === 'gold' && 'text-black',
          submitTone === 'positive' && 'bg-[#00a63e] text-white hover:bg-[#009437]',
          submitTone === 'danger' && 'bg-[#d3191c] text-white hover:bg-[#b81417]',
        )}
        style={
          submitTone === 'gold'
            ? { background: 'linear-gradient(180deg, #f6cb86 0%, #e0a263 100%)' }
            : undefined
        }
      >
        {submitLabel}
      </button>
    </div>
  )
}
