import { useState } from 'react'
import { ChevronDown, Clock, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import {
  CaseEscalationIcon,
  CaseIssueTypeIcon,
  CaseModuleIcon,
  CasePriorityIcon,
  CaseTicketStatusIcon,
} from './case-panel-field-icons'

import {
  PRIORITY_SELECT_OPTIONS,
  SUPPORT_ESCALATION_PATHWAY_OPTIONS,
  SUPPORT_ISSUE_TYPE_OPTIONS,
  SUPPORT_MODULE_OPTIONS,
  getReporterTypeLabel,
  toSelectOptions,
  type SelectOption,
} from '../utils/support-format'
import { SupportAvatar } from './support-avatar'
import { cn } from '@/shared/lib/cn'

const truncateReporterId = (id: string, visible = 8) => {
  const value = String(id || '').trim()
  if (!value || value === '—') return value
  if (value.length <= visible + 1) return value
  return `${value.slice(0, visible)}…`
}

type TicketCasePanelProps = {
  reporterName: string
  reporterId: string
  reporterType?: string
  reporterAvatarUrl?: string
  pastTicketsCount: number
  assignedTo: string
  assignedToAvatarUrl?: string
  status: string
  priority: string
  module: string
  issueType: string
  comments: string
  escalationPathway?: string
  statusValue?: string
  fieldsDisabled?: boolean
  onStatusChange?: (status: string) => void
  onPriorityChange?: (priority: string) => void
  onModuleChange?: (module: string) => void
  onIssueTypeChange?: (issueType: string) => void
  onEscalationPathwayChange?: (pathway: string) => void
  onCommentsChange?: (comments: string) => void
  onEscalate?: () => void
  onResolve?: () => void
  onCloseTicket?: () => void
  onReassign?: () => void
  onViewProfile?: () => void
}

export function TicketCasePanel({
  reporterName,
  reporterId,
  reporterType = 'user',
  reporterAvatarUrl,
  pastTicketsCount,
  assignedTo,
  assignedToAvatarUrl,
  status,
  priority,
  module,
  issueType,
  comments,
  escalationPathway = 'None',
  statusValue,
  fieldsDisabled = false,
  onStatusChange,
  onPriorityChange,
  onModuleChange,
  onIssueTypeChange,
  onEscalationPathwayChange,
  onCommentsChange,
  onEscalate,
  onResolve,
  onCloseTicket,
  onReassign,
  onViewProfile,
}: TicketCasePanelProps) {
  const [commentDraft, setCommentDraft] = useState(comments)
  const actionsDisabled = fieldsDisabled

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#141414]">
      <div className="shrink-0 space-y-5 border-b border-white/[0.06] p-4">
        <div>
          <p className="text-body-xs text-muted font-medium tracking-wide uppercase">
            Case Reporter
          </p>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <SupportAvatar
                name={reporterName}
                src={reporterAvatarUrl}
                sizeClassName="size-10 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-body-sm text-brand-text truncate font-semibold">
                  {reporterName}
                </p>
                <span className="border-brand-positive/30 bg-brand-positive/10 text-brand-positive mt-1.5 inline-flex h-[18px] max-w-full items-center rounded-full border px-2 text-[10px] font-semibold tracking-wide whitespace-nowrap uppercase">
                  {getReporterTypeLabel(reporterType)}
                </span>
              </div>
            </div>
            <div className="max-w-[110px] shrink-0 text-right">
              <p className="text-muted text-[10px] font-medium tracking-wide uppercase">
                System ID
              </p>
              <p
                className="text-muted mt-0.5 truncate text-[10px]"
                title={`User ID: ${reporterId}`}
              >
                User ID: {truncateReporterId(reporterId)}
              </p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Link to={`/support/past-tickets/${reporterId}`} className="min-w-0 flex-1">
              <button
                type="button"
                className="bg-brand-accent flex h-9 w-full items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-black transition-opacity hover:opacity-90"
              >
                <Clock className="size-3.5 shrink-0" />
                <span className="truncate">Past Tickets</span>
                <span className="inline-flex size-[18px] shrink-0 items-center justify-center rounded-full bg-black/20 text-[9px] font-bold">
                  {pastTicketsCount}
                </span>
              </button>
            </Link>
            <button
              type="button"
              className="bg-brand-accent flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-black transition-opacity hover:opacity-90"
              onClick={onViewProfile ?? (() => toast.message('Profile unavailable'))}
            >
              <User className="size-3.5 shrink-0" />
              <span className="truncate">View Profile</span>
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-body-xs text-muted font-medium tracking-wide uppercase">
              Assigned To
            </p>
            <button
              type="button"
              className="text-body-sm text-brand-text underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={actionsDisabled || !onReassign}
              onClick={onReassign}
            >
              Reassign
            </button>
          </div>
          <div className="mt-2 flex h-[42px] items-center gap-2.5 rounded-lg border border-white/[0.06] bg-[#050505] px-3">
            <SupportAvatar
              name={assignedTo}
              src={assignedToAvatarUrl}
              sizeClassName="size-7"
              fallback="icon"
            />
            <span className="text-body-sm text-brand-text truncate">{assignedTo}</span>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto overscroll-contain p-4">
        <SelectField
          label="Ticket Status"
          icon={<CaseTicketStatusIcon />}
          value={statusValue || status}
          options={[
            { value: 'open', label: 'Open' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'on_hold', label: 'On Hold' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'closed', label: 'Closed' },
          ]}
          disabled={fieldsDisabled}
          onChange={onStatusChange}
        />
        <SelectField
          label="Priority"
          icon={<CasePriorityIcon />}
          value={priority}
          options={PRIORITY_SELECT_OPTIONS}
          disabled={fieldsDisabled}
          onChange={onPriorityChange}
        />
        <SelectField
          label="Module"
          icon={<CaseModuleIcon />}
          value={module}
          options={toSelectOptions(SUPPORT_MODULE_OPTIONS, module)}
          placeholder="Select module"
          disabled={fieldsDisabled}
          onChange={onModuleChange}
        />
        <SelectField
          label="Issue Type"
          icon={<CaseIssueTypeIcon />}
          value={issueType}
          options={toSelectOptions(SUPPORT_ISSUE_TYPE_OPTIONS, issueType)}
          placeholder="Select issue type"
          disabled={fieldsDisabled}
          onChange={onIssueTypeChange}
        />

        <label className="block space-y-2">
          <span className="text-body-xs text-muted">Comments</span>
          <textarea
            value={commentDraft}
            disabled={fieldsDisabled || !onCommentsChange}
            placeholder="Internal notes for this ticket only"
            onChange={(event) => setCommentDraft(event.target.value)}
            onBlur={() => {
              if (!onCommentsChange || commentDraft === comments) return
              onCommentsChange(commentDraft)
            }}
            className="text-body-sm text-brand-text placeholder:text-muted/60 min-h-[120px] w-full resize-none rounded-lg border border-white/[0.08] bg-[#050505] px-3 py-2.5 outline-none disabled:opacity-60"
          />
          <span className="text-body-xs text-muted block">
            Saved on this ticket only. Not sent to chat or Zoho.
          </span>
        </label>

        <SelectField
          label="Escalation Pathway"
          icon={<CaseEscalationIcon />}
          value={escalationPathway}
          options={toSelectOptions(SUPPORT_ESCALATION_PATHWAY_OPTIONS, escalationPathway)}
          disabled={fieldsDisabled}
          onChange={onEscalationPathwayChange}
        />
      </div>

      <div className="flex shrink-0 gap-2 border-t border-white/[0.06] p-4">
        <button
          type="button"
          className="ui-cta ui-cta-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={actionsDisabled || !onEscalate}
          onClick={onEscalate}
        >
          Escalate
        </button>
        <button
          type="button"
          className="ui-cta ui-cta-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={actionsDisabled || !onResolve}
          onClick={onResolve}
        >
          Mark as Resolved
        </button>
        <button
          type="button"
          className="ui-cta ui-cta-ghost flex-1 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={actionsDisabled || !onCloseTicket}
          onClick={onCloseTicket}
        >
          Close
        </button>
      </div>
    </div>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled = false,
  icon,
}: {
  label: string
  value: string
  options?: SelectOption[]
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  icon?: React.ReactNode
}) {
  const resolvedValue = value && value !== '—' ? value : ''
  if (options?.length && onChange) {
    return (
      <label className="block space-y-1.5">
        <span className="text-body-xs text-muted">{label}</span>
        <div className="relative flex h-[42px] items-center rounded-lg border border-white/[0.08] bg-[#050505] px-3">
          {icon ? (
            <span className="pointer-events-none relative z-[1] mr-2 shrink-0">{icon}</span>
          ) : null}
          <select
            value={resolvedValue}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
            className={cn(
              'text-body-sm text-brand-text absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent pr-8 outline-none disabled:cursor-not-allowed disabled:opacity-60',
              icon ? 'pl-10' : 'pl-3',
            )}
          >
            {placeholder ? (
              <option value="" className="text-brand-text bg-[#050505]">
                {placeholder}
              </option>
            ) : null}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="text-brand-text bg-[#050505]"
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="text-muted pointer-events-none relative ml-auto size-4 shrink-0" />
        </div>
      </label>
    )
  }

  return (
    <label className="block space-y-1.5">
      <span className="text-body-xs text-muted">{label}</span>
      <div className="flex h-[42px] items-center justify-between rounded-lg border border-white/[0.08] bg-[#050505] px-3">
        <span className="text-body-sm text-brand-text">{value || placeholder || '—'}</span>
        <ChevronDown className="text-muted size-4 shrink-0" />
      </div>
    </label>
  )
}
