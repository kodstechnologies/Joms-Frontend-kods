import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ReassignTicketModal, EscalateTicketModal } from '../components/reassign-ticket-modal'
import { TicketCasePanel } from '../components/ticket-case-panel'
import {
  EMPTY_WORKSPACE_QUEUE_FILTERS,
  TicketFilterPanel,
  type WorkspaceQueueFilters,
} from '../components/ticket-filter-panel'
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
  resolveTicketIntelligenceContext,
} from '../utils/support-format'
import { openVenuePartnerProfile } from '@/modules/expert/utils/expert-application-navigation'
import { cn } from '@/shared/lib/cn'

const ticketDetailMatchesSelection = (
  selectedId: string | undefined,
  detailTicket: { id?: string; _id?: string } | undefined,
) => {
  if (!selectedId || !detailTicket) return false
  const normalized = selectedId.trim()
  return detailTicket.id === normalized || detailTicket._id === normalized
}

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

  const [appliedFilters, setAppliedFilters] = useState<WorkspaceQueueFilters>(
    EMPTY_WORKSPACE_QUEUE_FILTERS,
  )
  const [draftFilters, setDraftFilters] = useState<WorkspaceQueueFilters>(
    EMPTY_WORKSPACE_QUEUE_FILTERS,
  )

  const queueQueryParams = useMemo(
    () => ({
      page: 1,
      limit: 50,
      search: searchQuery || undefined,
      tab: 'all' as const,
      includeClosed: true,
      scope: 'workspace' as const,
      status: appliedFilters.status || undefined,
      module: appliedFilters.module || undefined,
      priority: appliedFilters.priority || undefined,
    }),
    [appliedFilters.module, appliedFilters.priority, appliedFilters.status, searchQuery],
  )

  const queueQuery = useSupportTickets(queueQueryParams)
  const queue = queueQuery.data?.data?.queue ?? []
  const totalTickets = queueQuery.data?.data?.meta?.total ?? queue.length

  useEffect(() => {
    if (!showFilters) return
    setDraftFilters(appliedFilters)
  }, [appliedFilters, showFilters])

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(draftFilters)
    setShowFilters(false)
    toast.success('Filters applied')
  }, [draftFilters, setShowFilters])

  const handleClearFilters = useCallback(() => {
    setDraftFilters(EMPTY_WORKSPACE_QUEUE_FILTERS)
    setAppliedFilters(EMPTY_WORKSPACE_QUEUE_FILTERS)
    setShowFilters(false)
    toast.message('Filters cleared')
  }, [setShowFilters])

  const hasActiveFilters = Boolean(
    appliedFilters.status || appliedFilters.module || appliedFilters.priority,
  )

  useEffect(() => {
    if (!queue.length) return
    if (!selectedTicketId || !queue.some((t) => t.id === selectedTicketId)) {
      setSelectedTicketId(queue[0].id)
    }
  }, [queue, selectedTicketId, setSelectedTicketId])

  const detailQuery = useSupportTicket(selectedTicketId || undefined)
  const detail = detailQuery.data?.data
  const detailMatchesSelection = ticketDetailMatchesSelection(selectedTicketId, detail?.ticket)

  const handleRefreshQueue = useCallback(async () => {
    try {
      await Promise.all([
        queueQuery.refetch(),
        selectedTicketId ? detailQuery.refetch() : Promise.resolve(),
      ])
      toast.success('Queue refreshed')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to refresh queue'))
    }
  }, [detailQuery, queueQuery, selectedTicketId])

  const ticket = detailMatchesSelection ? detail?.ticket : undefined
  const messages = detailMatchesSelection ? (detail?.messages ?? []) : []
  const activities = detailMatchesSelection ? (detail?.activities ?? []) : []
  const detailLoading =
    Boolean(selectedTicketId) &&
    (detailQuery.isLoading || (detailQuery.isFetching && !detailMatchesSelection))
  const messagesLoading = detailLoading

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

  const intelligenceContext = useMemo(
    () => resolveTicketIntelligenceContext(ticket, selectedQueue?.subject),
    [ticket, selectedQueue?.subject],
  )

  return (
    <div className="-my-4 flex h-[calc(100dvh-var(--brand-topbar-height))] min-h-0 flex-col gap-3 overflow-hidden md:-my-6">
      <div className="shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-h2 text-brand-text font-semibold tracking-tight">
            Support Management 00
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

      <div className="grid h-full min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[337px_minmax(0,1fr)_334px] lg:grid-rows-1">
        <div className="flex h-full min-h-0 flex-col">
          <TicketQueuePanel
            tickets={queue}
            selectedId={selectedQueue?.id ?? ''}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelect={setSelectedTicketId}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onRefresh={() => {
              void handleRefreshQueue()
            }}
            disableClientFilter
            showFilters={showFilters}
            hasActiveFilters={hasActiveFilters}
            isRefreshing={queueQuery.isFetching}
            totalCount={totalTickets}
            isLoading={queueQuery.isLoading}
            filterPanel={
              <TicketFilterPanel
                values={draftFilters}
                onChange={(field, value) => {
                  setDraftFilters((current) => ({ ...current, [field]: value }))
                }}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
              />
            }
          />
        </div>

        <div className="mx-auto flex h-full min-h-0 w-full max-w-[597px] flex-col gap-3 overflow-hidden rounded-xl border border-white/[0.08] bg-[#141414] p-4">
          <div className="flex h-10 shrink-0 gap-1 rounded-lg border border-white/[0.06] bg-[#050505] p-1">
            {(['intelligence', 'messages'] as const).map((tab) => {
              const isActive = workspaceTab === tab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setWorkspaceTab(tab)}
                  className={cn(
                    'flex flex-1 items-center justify-center rounded-md px-4 py-1.5 text-[12px] leading-[18px] font-medium capitalize transition-colors',
                    isActive
                      ? 'text-brand-text bg-[#141414] shadow-sm'
                      : 'text-muted hover:text-brand-text hover:bg-white/[0.02]',
                  )}
                >
                  {tab === 'intelligence' ? 'Intelligence' : 'Messages'}
                </button>
              )
            })}
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
                status={ticket?.status ?? selectedQueue?.status}
                eventName={intelligenceContext.eventName}
                eventDate={intelligenceContext.eventDate}
                issueName={intelligenceContext.issueName}
                issueDetail={intelligenceContext.issueDetail}
                activities={activities}
                isLoading={detailLoading}
              />
            ) : (
              <TicketMessagesPanel
                key={selectedQueue.id}
                title={ticket?.subject ?? selectedQueue.subject}
                ticketId={ticket?.id ?? selectedQueue.id}
                createdAt={ticket?.createdAt ?? selectedQueue.createdAt}
                dueIn={ticket?.dueIn ?? '—'}
                status={ticket?.status ?? selectedQueue?.status}
                assignedTo={ticket?.assignedTo ?? 'Unassigned'}
                messages={messages}
                isLoading={messagesLoading}
                isSending={sendMutation.isPending}
                active={workspaceTab === 'messages'}
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

        <div className="flex h-full min-h-0 flex-col">
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
              if (reporterType === 'expert' || reporterType === 'service_partner') {
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
