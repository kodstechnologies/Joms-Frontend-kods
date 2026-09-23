import { useMemo, useState } from 'react'

import { BaseModal } from '@/shared/components/modal/base-modal'
import { DecisionActionModal } from '@/shared/components/modal/decision-action-modal'
import type { SupportAgent } from '../api/support-api'
import { SupportAvatar } from './support-avatar'
import { cn } from '@/shared/lib/cn'

type SupportAgentPickerModalProps = {
  open: boolean
  title: string
  agents: SupportAgent[]
  isLoading?: boolean
  currentAssigneeId?: string | null
  isSubmitting?: boolean
  confirmLabel?: string
  selectedBadgeLabel?: string
  onClose: () => void
  onSelect: (agent: SupportAgent) => void | Promise<void>
}

export function SupportAgentPickerModal({
  open,
  title,
  agents,
  isLoading = false,
  currentAssigneeId,
  isSubmitting = false,
  confirmLabel,
  selectedBadgeLabel = 'Assigned',
  onClose,
  onSelect,
}: SupportAgentPickerModalProps) {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const requiresConfirm = Boolean(confirmLabel)

  const filteredAgents = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return agents
    return agents.filter((agent) => {
      const haystack = `${agent.name} ${agent.email || ''} ${agent.role || ''}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [agents, search])

  const selectedAgent = filteredAgents.find((agent) => agent.id === selectedId) ?? null

  const handleClose = () => {
    setSearch('')
    setSelectedId(null)
    onClose()
  }

  const handleCardClick = (agent: SupportAgent) => {
    if (isSubmitting) return
    if (requiresConfirm) {
      setSelectedId(agent.id)
      return
    }
    void onSelect(agent)
  }

  return (
    <BaseModal
      open={open}
      title={title}
      onClose={handleClose}
      className="max-w-lg"
      bodyClassName="space-y-4"
    >
      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by name, email or role"
        className="ui-input w-full"
      />

      <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
        {isLoading ? (
          <p className="text-body-sm text-muted py-8 text-center">Loading team members…</p>
        ) : filteredAgents.length === 0 ? (
          <p className="text-body-sm text-muted py-8 text-center">No team members found.</p>
        ) : (
          filteredAgents.map((agent) => {
            const isCurrent = Boolean(currentAssigneeId) && currentAssigneeId === agent.id
            const isSelected = requiresConfirm && selectedId === agent.id
            return (
              <button
                key={agent.id}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleCardClick(agent)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border bg-white/5 px-3 py-3 text-left transition-colors hover:border-white/20 hover:bg-white/10 disabled:opacity-60',
                  isSelected ? 'border-brand-accent bg-brand-accent/10' : 'border-white/10',
                )}
              >
                <SupportAvatar name={agent.name} src={agent.avatarUrl} sizeClassName="size-10" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-body-md-semibold text-brand-text truncate">{agent.name}</p>
                    {isCurrent ? (
                      <span className="text-body-sm-semibold bg-brand-accent/15 text-brand-accent shrink-0 rounded px-2 py-0.5">
                        {selectedBadgeLabel}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-body-sm text-muted truncate">
                    {agent.role || 'Team member'}
                    {agent.email ? ` · ${agent.email}` : ''}
                  </p>
                </div>
              </button>
            )
          })
        )}
      </div>

      {requiresConfirm ? (
        <div className="flex gap-3 pt-1">
          <button type="button" className="ui-cta ui-cta-ghost flex-1" onClick={handleClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-cta ui-cta-primary flex-1"
            disabled={!selectedAgent || isSubmitting}
            onClick={() => {
              if (!selectedAgent) return
              void onSelect(selectedAgent)
            }}
          >
            {confirmLabel}
          </button>
        </div>
      ) : null}
    </BaseModal>
  )
}

export function ReassignTicketModal(
  props: Omit<SupportAgentPickerModalProps, 'title' | 'confirmLabel' | 'selectedBadgeLabel'>,
) {
  if (!props.open) return null
  return (
    <SupportNameSelectModal
      {...props}
      title="Reassign ticket"
      description="Are you sure you want to reassign this ticket? This ticket will be handled by the selected party."
      submitLabel="Assign"
    />
  )
}

export function AssignTicketModal(
  props: Omit<SupportAgentPickerModalProps, 'title' | 'confirmLabel' | 'selectedBadgeLabel'>,
) {
  if (!props.open) return null
  return (
    <SupportNameSelectModal
      {...props}
      title="Assign ticket"
      description="Are you sure you want to assign this ticket? This ticket will be handled by the selected party."
      submitLabel="Assign"
    />
  )
}

function SupportNameSelectModal({
  open,
  agents,
  isLoading = false,
  isSubmitting = false,
  title,
  description,
  submitLabel,
  onClose,
  onSelect,
}: Omit<SupportAgentPickerModalProps, 'confirmLabel' | 'selectedBadgeLabel'> & {
  description: string
  submitLabel: string
}) {
  const [selectedId, setSelectedId] = useState('')

  const options = useMemo(
    () =>
      agents.map((agent) => ({
        label: agent.name,
        value: agent.id,
      })),
    [agents],
  )

  return (
    <DecisionActionModal
      open={open}
      variant="escalate"
      title={title}
      description={description}
      submitLabel={submitLabel}
      showAdminNotes={false}
      escalationOptions={options}
      selectedEscalationOption={selectedId}
      onEscalationOptionChange={setSelectedId}
      onClose={onClose}
      onSubmit={() => {
        const agent = agents.find((item) => item.id === selectedId)
        if (!agent) return
        void onSelect(agent)
      }}
      isSubmitting={isSubmitting}
      submitDisabled={!selectedId || isLoading}
    />
  )
}

export function EscalateTicketModal(
  props: Omit<SupportAgentPickerModalProps, 'title' | 'confirmLabel' | 'selectedBadgeLabel'>,
) {
  if (!props.open) return null
  return (
    <SupportNameSelectModal
      {...props}
      title="Escalate ticket"
      description="Are you sure you want to escalate this ticket? This ticket will be reviewed by the selected parties."
      submitLabel="Escalate"
    />
  )
}
