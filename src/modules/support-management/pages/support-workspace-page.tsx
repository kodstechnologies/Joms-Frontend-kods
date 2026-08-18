import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ReassignTicketModal, EscalateTicketModal } from '../components/reassign-ticket-modal'
import { TicketCasePanel } from '../components/ticket-case-panel'
import { TicketFilterPanel } from '../components/ticket-filter-panel'
import { TicketIntelligencePanel } from '../components/ticket-intelligence-panel'
import { TicketMessagesPanel } from '../components/ticket-messages-panel'
import { TicketQueuePanel } from '../components/ticket-queue-panel'
import {
  useAssignSupportTicket,
  useEscalateSupportTicket,
  useResolveSupportTicket,
  useSendSupportMessage,
  useSupportAgents,
  useSupportTicket,
  useSupportTickets,
  useLiveSupportUpdates,
  useUpdateSupportTicket,
} from '../hooks/use-support'
import { useSupportStore } from '../store/support-store'
import type { TicketPriority, TicketStatus } from '../types/support'
import {
  getApiErrorMessage,
  getPriorityLabel,
  getStatusLabel,
  isTerminalTicketStatus,
} from '../utils/support-format'
import { openVenuePartnerProfile } from '@/modules/expert/utils/expert-application-navigation'
import { cn } from '@/shared/lib/cn'

export function SupportWorkspacePage() {
  const navigate = useNavigate()
  const {
    searchQuery,
    setSearchQuery,
    selectedTicketId,
    setSelectedTicketId,
    workspaceTab,
    setWorkspaceTab,
    showFilters,
    setShowFilters,
  } = useSupportStore()

  const queueQuery = useSupportTickets({
    page: 1,
    limit: 50,
    search: searchQuery || undefined,
    tab: 'all',
    activeOnly: true,
    scope: 'workspace',
  })
  const queue = (queueQuery.data?.data?.queue ?? []).filter(
    (ticket) => !isTerminalTicketStatus(ticket.status),
  )

  useEffect(() => {
    if (!queue.length) return
    if (!selectedTicketId || !queue.some((t) => t.id === selectedTicketId)) {
      setSelectedTicketId(queue[0].id)
    }
  }, [queue, selectedTicketId, setSelectedTicketId])

  const detailQuery = useSupportTicket(selectedTicketId || undefined)
  const detail = detailQuery.data?.data
  const detailMatchesSelection =
    Boolean(selectedTicketId) && detail?.ticket?.id === selectedTicketId
  const ticket = detailMatchesSelection ? detail?.ticket : undefined
  const messages = detailMatchesSelection ? (detail?.messages ?? []) : []
  const activities = detailMatchesSelection ? (detail?.activities ?? []) : []
  const messagesLoading =
    Boolean(selectedTicketId) && (detailQuery.isFetching || !detailMatchesSelection)

  const sendMutation = useSendSupportMessage()
  const escalateMutation = useEscalateSupportTicket()
  const resolveMutation = useResolveSupportTicket()
  const assignMutation = useAssignSupportTicket()
  const updateMutation = useUpdateSupportTicket()
  const [reassignOpen, setReassignOpen] = useState(false)
  const [escalateOpen, setEscalateOpen] = useState(false)
  const agentsQuery = useSupportAgents()
  const { connected, joinTicket, leaveTicket, sendSupportMessage } = useLiveSupportUpdates()

  useEffect(() => {
    if (!selectedTicketId || !connected) return undefined
    joinTicket(selectedTicketId)
    return () => {
      leaveTicket(selectedTicketId)
    }
  }, [selectedTicketId, connected, joinTicket, leaveTicket])

  useEffect(() => {
    const main = document.querySelector('main')
    if (!main) return undefined
    const previousOverflow = main.style.overflow
    main.style.overflow = 'hidden'
    return () => {
      main.style.overflow = previousOverflow
    }
  }, [])

  const selectedQueue = queue.find((t) => t.id === selectedTicketId) ?? queue[0] ?? null

  return (
    <div className="-my-4 flex h-[calc(100dvh-var(--brand-topbar-height))] min-h-0 flex-col gap-3 overflow-hidden md:-my-6">
      <div className="shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-h2 text-brand-text font-semibold tracking-tight">
            Support Management
          </h1>
          <span className="text-body-sm-semibold border-brand-positive/30 bg-brand-positive/10 text-brand-positive inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5">
            <span className="bg-brand-positive size-1.5 rounded-full" />
            Live Context Active
          </span>
          <span
            className={cn(
              'text-body-sm-semibold inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5',
              connected
                ? 'border-brand-positive/30 bg-brand-positive/10 text-brand-positive'
                : 'text-muted border-white/10',
            )}
          >
            <span
              className={cn(
                'size-1.5 rounded-full',
                connected ? 'bg-brand-positive' : 'bg-white/30',
              )}
            />
            {connected ? 'Socket live' : 'Socket offline'}
          </span>
        </div>
        <p className="text-body-sm text-muted mt-0.5">
          Decision-centric workspace for high-impact tickets requiring approval, enforcement, or
          oversight.
        </p>
      </div>

      <div className="grid h-full min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-12 lg:grid-rows-1">
        <div className="flex h-full min-h-0 flex-col lg:col-span-3">
          <TicketQueuePanel
            tickets={queue}
            selectedId={selectedQueue?.id ?? ''}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelect={setSelectedTicketId}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onRefresh={() => {
              void queueQuery.refetch()
            }}
            disableClientFilter
            showFilters={showFilters}
            filterPanel={
              <TicketFilterPanel
                onApply={() => setShowFilters(false)}
                onClear={() => setShowFilters(false)}
              />
            }
          />
        </div>

        <div className="radius-lg bg-brand-surface flex h-full min-h-0 flex-col gap-3 overflow-hidden border border-white/10 p-4 lg:col-span-5">
          <div className="radius-lg bg-brand-bg flex shrink-0 gap-1 border border-white/5 p-1">
            {(['intelligence', 'messages'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setWorkspaceTab(tab)}
                className={cn(
                  'text-body-md-medium flex-1 rounded-lg px-4 py-2.5 capitalize transition-colors',
                  workspaceTab === tab
                    ? 'bg-brand-surface text-brand-text'
                    : 'text-brand-text hover:bg-white/5',
                )}
              >
                {tab === 'intelligence' ? 'Intelligence' : 'Messages'}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            {!selectedQueue ? (
              <p className="text-body-md text-muted py-10 text-center">No tickets in queue.</p>
            ) : workspaceTab === 'intelligence' ? (
              <TicketIntelligencePanel
                key={selectedQueue.id}
                title={ticket?.subject ?? selectedQueue.subject}
                ticketId={ticket?.id ?? selectedQueue.id}
                createdAt={ticket?.createdAt ?? selectedQueue.createdAt}
                dueIn={ticket?.dueIn ?? '—'}
                eventName={ticket?.eventContext?.name || '—'}
                eventDate={ticket?.eventContext?.date || '—'}
                issueName={ticket?.issueContext?.name || ticket?.issueType || '—'}
                issueDetail={ticket?.issueContext?.detail || ticket?.description || '—'}
                activities={activities}
                isLoading={messagesLoading}
              />
            ) : (
              <TicketMessagesPanel
                key={selectedQueue.id}
                title={ticket?.subject ?? selectedQueue.subject}
                ticketId={ticket?.id ?? selectedQueue.id}
                createdAt={ticket?.createdAt ?? selectedQueue.createdAt}
                dueIn={ticket?.dueIn ?? '—'}
                assignedTo={ticket?.assignedTo ?? 'Unassigned'}
                messages={messages}
                isLoading={messagesLoading}
                isSending={sendMutation.isPending}
                onSend={async (content) => {
                  if (!selectedTicketId) return
                  try {
                    if (connected) {
                      const result = await sendSupportMessage({
                        ticketId: selectedTicketId,
                        id: selectedTicketId,
                        content,
                        message: content,
                      })
                      if (result.success) return
                      if (result.message && result.message !== 'Socket not connected') {
                        throw new Error(result.message)
                      }
                    }
                    await sendMutation.mutateAsync({ id: selectedTicketId, content })
                  } catch (err) {
                    toast.error(getApiErrorMessage(err, 'Failed to send message'))
                  }
                }}
              />
            )}
          </div>
        </div>

        <div className="flex h-full min-h-0 flex-col lg:col-span-4">
          <TicketCasePanel
            key={selectedTicketId || 'no-ticket'}
            reporterName={ticket?.reporter ?? selectedQueue?.reporter ?? '—'}
            reporterId={ticket?.reporterId ?? '—'}
            reporterType={ticket?.reporterType ?? selectedQueue?.reporterType}
            reporterAvatarUrl={ticket?.reporterAvatarUrl}
            pastTicketsCount={ticket?.pastTicketsCount ?? 0}
            assignedTo={ticket?.assignedTo ?? 'Unassigned'}
            assignedToAvatarUrl={ticket?.assignedToAvatarUrl}
            status={ticket ? getStatusLabel(ticket.status) : '—'}
            priority={ticket?.priority || ''}
            module={ticket?.module || ''}
            issueType={ticket?.issueType || ''}
            comments={ticket?.comments || ''}
            escalationPathway={ticket?.escalationPathway || 'None'}
            statusValue={ticket?.status}
            fieldsDisabled={!ticket || updateMutation.isPending}
            onStatusChange={async (status) => {
              if (!selectedTicketId || status === ticket?.status) return
              try {
                await updateMutation.mutateAsync({ id: selectedTicketId, payload: { status } })
                toast.success(`Status updated to ${getStatusLabel(status as TicketStatus)}`)
              } catch (err) {
                toast.error(getApiErrorMessage(err, 'Failed to update status'))
              }
            }}
            onPriorityChange={async (priority) => {
              if (!selectedTicketId || !priority || priority === ticket?.priority) return
              try {
                await updateMutation.mutateAsync({ id: selectedTicketId, payload: { priority } })
                toast.success(`Priority updated to ${getPriorityLabel(priority as TicketPriority)}`)
              } catch (err) {
                toast.error(getApiErrorMessage(err, 'Failed to update priority'))
              }
            }}
            onModuleChange={async (module) => {
              if (!selectedTicketId || module === (ticket?.module || '')) return
              try {
                await updateMutation.mutateAsync({ id: selectedTicketId, payload: { module } })
                toast.success(module ? `Module updated to ${module}` : 'Module cleared')
              } catch (err) {
                toast.error(getApiErrorMessage(err, 'Failed to update module'))
              }
            }}
            onIssueTypeChange={async (issueType) => {
              if (!selectedTicketId || issueType === (ticket?.issueType || '')) return
              try {
                await updateMutation.mutateAsync({ id: selectedTicketId, payload: { issueType } })
                toast.success(
                  issueType ? `Issue type updated to ${issueType}` : 'Issue type cleared',
                )
              } catch (err) {
                toast.error(getApiErrorMessage(err, 'Failed to update issue type'))
              }
            }}
            onCommentsChange={async (comments) => {
              if (!selectedTicketId || comments === (ticket?.comments || '')) return
              try {
                await updateMutation.mutateAsync({
                  id: selectedTicketId,
                  payload: { comments },
                })
              } catch (err) {
                toast.error(getApiErrorMessage(err, 'Failed to save comments'))
              }
            }}
            onEscalationPathwayChange={async (escalationPathway) => {
              if (
                !selectedTicketId ||
                escalationPathway === (ticket?.escalationPathway || 'None')
              ) {
                return
              }
              try {
                await updateMutation.mutateAsync({
                  id: selectedTicketId,
                  payload: { escalationPathway },
                })
                toast.success(`Escalation pathway updated to ${escalationPathway}`)
              } catch (err) {
                toast.error(getApiErrorMessage(err, 'Failed to update escalation pathway'))
              }
            }}
            onViewProfile={() => {
              const reporterId = ticket?.reporterId
              const reporterType = ticket?.reporterType
              if (!reporterId) {
                toast.message('Reporter profile unavailable')
                return
              }
              if (reporterType === 'venue_partner') {
                void openVenuePartnerProfile(reporterId, navigate)
                return
              }
              if (reporterType === 'expert') {
                navigate(`/experts/management/profile/${reporterId}`)
                return
              }
              toast.message('Profile view not available for this reporter type')
            }}
            onReassign={() => {
              if (!selectedTicketId) return
              setReassignOpen(true)
            }}
            onEscalate={() => {
              if (!selectedTicketId) return
              setEscalateOpen(true)
            }}
            onResolve={async () => {
              if (!selectedTicketId) return
              try {
                await resolveMutation.mutateAsync({
                  id: selectedTicketId,
                })
                toast.success('Ticket marked as resolved')
              } catch (err) {
                toast.error(getApiErrorMessage(err, 'Failed to resolve ticket'))
              }
            }}
            onCloseTicket={async () => {
              if (!selectedTicketId) return
              try {
                await updateMutation.mutateAsync({
                  id: selectedTicketId,
                  payload: { status: 'closed' },
                })
                toast.success('Ticket closed')
              } catch (err) {
                toast.error(getApiErrorMessage(err, 'Failed to close ticket'))
              }
            }}
          />
        </div>
      </div>

      <ReassignTicketModal
        open={reassignOpen}
        agents={agentsQuery.data?.data?.agents ?? []}
        isLoading={agentsQuery.isFetching}
        currentAssigneeId={ticket?.assignedToId}
        isSubmitting={assignMutation.isPending}
        onClose={() => setReassignOpen(false)}
        onSelect={async (agent) => {
          if (!selectedTicketId) return
          try {
            await assignMutation.mutateAsync({
              id: selectedTicketId,
              payload: {
                assignedToId: agent.id,
                assignedToName: agent.name,
                assignedToAvatarUrl: agent.avatarUrl,
              },
            })
            setReassignOpen(false)
            toast.success(`Ticket assigned to ${agent.name}`)
          } catch (err) {
            toast.error(getApiErrorMessage(err, 'Failed to reassign ticket'))
          }
        }}
      />

      <EscalateTicketModal
        open={escalateOpen}
        agents={agentsQuery.data?.data?.agents ?? []}
        isLoading={agentsQuery.isFetching}
        currentAssigneeId={ticket?.assignedToId}
        isSubmitting={escalateMutation.isPending}
        onClose={() => setEscalateOpen(false)}
        onSelect={async (agent) => {
          if (!selectedTicketId) return
          try {
            await escalateMutation.mutateAsync({
              id: selectedTicketId,
              payload: {
                assignedToId: agent.id,
                assignedToName: agent.name,
                assignedToAvatarUrl: agent.avatarUrl,
              },
            })
            setEscalateOpen(false)
            toast.success(`Ticket escalated to ${agent.name}`)
          } catch (err) {
            toast.error(getApiErrorMessage(err, 'Failed to escalate ticket'))
          }
        }}
      />
    </div>
  )
}
