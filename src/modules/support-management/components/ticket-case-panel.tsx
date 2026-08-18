import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

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

  return (
    <div className="radius-lg bg-brand-surface flex h-full min-h-0 flex-col overflow-hidden border border-white/10">
      <div className="shrink-0 space-y-5 border-b border-white/5 p-4">
        <div>
          <p className="text-body-sm-semibold text-muted tracking-widest uppercase">
            Case Reporter
          </p>
          <div className="mt-3 flex items-center gap-3">
            <SupportAvatar name={reporterName} src={reporterAvatarUrl} sizeClassName="size-10" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-body-md-semibold text-brand-text">{reporterName}</span>
                <span className="text-body-sm-semibold bg-brand-positive/15 text-brand-positive inline-flex h-5 items-center rounded px-2 uppercase">
                  {getReporterTypeLabel(reporterType)}
                </span>
              </div>
              <p className="text-body-sm text-muted">User ID: {reporterId}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Link to={`/support/past-tickets/${reporterId}`}>
              <button type="button" className="ui-cta ui-cta-primary !h-auto px-3 py-1 text-xs">
                Past Tickets ({pastTicketsCount})
              </button>
            </Link>
            <button
              type="button"
              className="ui-cta ui-cta-primary !h-auto px-3 py-1 text-xs"
              onClick={onViewProfile ?? (() => toast.message('Profile unavailable'))}
            >
              View Profile
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-body-sm-semibold text-muted tracking-widest uppercase">
              Assigned To
            </p>
            <button
              type="button"
              className="text-body-sm text-brand-accent hover:underline"
              onClick={onReassign ?? (() => toast.message('Reassign coming soon'))}
            >
              Reassign
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <SupportAvatar name={assignedTo} src={assignedToAvatarUrl} sizeClassName="size-8" />
            <span className="text-body-md text-brand-text">{assignedTo}</span>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">
        <SelectField
          label="Ticket Status"
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
          value={priority}
          options={PRIORITY_SELECT_OPTIONS}
          disabled={fieldsDisabled}
          onChange={onPriorityChange}
        />
        <SelectField
          label="Module"
          value={module}
          options={toSelectOptions(SUPPORT_MODULE_OPTIONS, module)}
          placeholder="Select module"
          disabled={fieldsDisabled}
          onChange={onModuleChange}
        />
        <SelectField
          label="Issue Type"
          value={issueType}
          options={toSelectOptions(SUPPORT_ISSUE_TYPE_OPTIONS, issueType)}
          placeholder="Select issue type"
          disabled={fieldsDisabled}
          onChange={onIssueTypeChange}
        />

        <label className="block space-y-2">
          <span className="text-body-sm text-muted">Comments</span>
          <textarea
            value={commentDraft}
            disabled={fieldsDisabled || !onCommentsChange}
            placeholder="Internal notes for this ticket only"
            onChange={(event) => setCommentDraft(event.target.value)}
            onBlur={() => {
              if (!onCommentsChange || commentDraft === comments) return
              onCommentsChange(commentDraft)
            }}
            className="ui-textarea text-brand-text h-24 resize-none disabled:opacity-60"
          />
          <span className="text-body-sm text-muted block">
            Saved on this ticket only. Not sent to chat or Zoho.
          </span>
        </label>

        <SelectField
          label="Escalation Pathway"
          value={escalationPathway}
          options={toSelectOptions(SUPPORT_ESCALATION_PATHWAY_OPTIONS, escalationPathway)}
          disabled={fieldsDisabled}
          onChange={onEscalationPathwayChange}
        />
      </div>

      <div className="flex shrink-0 gap-2 border-t border-white/5 p-4">
        <button
          type="button"
          className="ui-cta ui-cta-primary flex-1"
          onClick={onEscalate ?? (() => toast.message('Escalation coming soon'))}
        >
          Escalate
        </button>
        <button
          type="button"
          className="ui-cta ui-cta-primary flex-1"
          onClick={onResolve ?? (() => toast.success('Ticket marked as resolved (static preview)'))}
        >
          Mark as Resolved
        </button>
        <button
          type="button"
          className="ui-cta ui-cta-ghost flex-1"
          onClick={onCloseTicket ?? (() => toast.message('Close ticket coming soon'))}
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
}: {
  label: string
  value: string
  options?: SelectOption[]
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  const resolvedValue = value && value !== '—' ? value : ''
  if (options?.length && onChange) {
    return (
      <label className="block space-y-1.5">
        <span className="text-body-sm text-muted">{label}</span>
        <div className="radius-md bg-brand-bg relative flex h-[42px] items-center border border-white/10 px-3">
          <select
            value={resolvedValue}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
            className="text-body-md text-brand-text absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent px-3 pr-8 outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placeholder ? (
              <option value="" className="bg-brand-bg text-brand-text">
                {placeholder}
              </option>
            ) : null}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-brand-bg text-brand-text"
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
      <span className="text-body-sm text-muted">{label}</span>
      <div className="radius-md bg-brand-bg flex h-[42px] items-center justify-between border border-white/10 px-3">
        <span className="text-body-md text-brand-text">{value || placeholder || '—'}</span>
        <ChevronDown className="text-muted size-4 shrink-0" />
      </div>
    </label>
  )
}
