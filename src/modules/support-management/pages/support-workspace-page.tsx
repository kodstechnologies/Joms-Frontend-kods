import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

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
  useSupportTicket,
  useSupportTickets,
  useLiveSupportUpdates,
  useUpdateSupportTicket,
} from '../hooks/use-support'
import { useSupportStore } from '../store/support-store'
import type { TicketStatus } from '../types/support'
import {
  getApiErrorMessage,
  getPriorityLabel,
  getStatusLabel,
  isTerminalTicketStatus,
} from '../utils/support-format'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { cn } from '@/shared/lib/cn'

export function SupportWorkspacePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
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
  const ticket = detailQuery.data?.data?.ticket
  const messages = detailQuery.data?.data?.messages ?? []
  const activities = detailQuery.data?.data?.activities ?? []

  const sendMutation = useSendSupportMessage()
  const escalateMutation = useEscalateSupportTicket()
  const resolveMutation = useResolveSupportTicket()
  const assignMutation = useAssignSupportTicket()
  const updateMutation = useUpdateSupportTicket()
  const { connected, joinTicket, sendSupportMessage } = useLiveSupportUpdates()

  useEffect(() => {
    if (!selectedTicketId || !connected) return
    joinTicket(selectedTicketId)
  }, [selectedTicketId, connected, joinTicket])

  const selectedQueue = queue.find((t) => t.id === selectedTicketId) ?? queue[0] ?? null

  return (
    <div className="space-y-4">
      <div>
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
        <p className="text-body-md text-muted mt-1">
          Decision-centric workspace for high-impact tickets requiring approval, enforcement, or
          oversight.
        </p>
      </div>

      <div className="grid min-h-[calc(100vh-220px)] grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-3">
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

        <div className="radius-lg bg-brand-surface flex flex-col gap-4 border border-white/10 p-5 lg:col-span-5">
          <div className="radius-lg bg-brand-bg flex gap-1 border border-white/5 p-1">
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

          {!selectedQueue ? (
            <p className="text-body-md text-muted py-10 text-center">No tickets in queue.</p>
          ) : workspaceTab === 'intelligence' ? (
            <TicketIntelligencePanel
              title={ticket?.subject ?? selectedQueue.subject}
              ticketId={ticket?.id ?? selectedQueue.id}
              createdAt={ticket?.createdAt ?? selectedQueue.createdAt}
              dueIn={ticket?.dueIn ?? '—'}
              eventName={ticket?.eventContext?.name || '—'}
              eventDate={ticket?.eventContext?.date || '—'}
              issueName={ticket?.issueContext?.name || ticket?.issueType || '—'}
              issueDetail={ticket?.issueContext?.detail || ticket?.description || '—'}
              activities={activities}
            />
          ) : (
            <TicketMessagesPanel
              title={ticket?.subject ?? selectedQueue.subject}
              ticketId={ticket?.id ?? selectedQueue.id}
              createdAt={ticket?.createdAt ?? selectedQueue.createdAt}
              dueIn={ticket?.dueIn ?? '—'}
              assignedTo={ticket?.assignedTo ?? 'Unassigned'}
              messages={messages}
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

        <div className="lg:col-span-4">
          <TicketCasePanel
            reporterName={ticket?.reporter ?? selectedQueue?.reporter ?? '—'}
            reporterId={ticket?.reporterId ?? '—'}
            reporterType={ticket?.reporterType ?? selectedQueue?.reporterType}
            pastTicketsCount={ticket?.pastTicketsCount ?? 0}
            assignedTo={ticket?.assignedTo ?? 'Unassigned'}
            status={ticket ? getStatusLabel(ticket.status) : '—'}
            priority={ticket ? getPriorityLabel(ticket.priority) : '—'}
            module={ticket?.module || '—'}
            issueType={ticket?.issueType || '—'}
            comments={ticket?.comments || ''}
            escalationPathway={ticket?.escalationPathway || 'None'}
            statusValue={ticket?.status}
            onStatusChange={async (status) => {
              if (!selectedTicketId) return
              try {
                await updateMutation.mutateAsync({ id: selectedTicketId, payload: { status } })
                toast.success(`Status updated to ${getStatusLabel(status as TicketStatus)}`)
              } catch (err) {
                toast.error(getApiErrorMessage(err, 'Failed to update status'))
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
                navigate(`/venues/management/profile/${reporterId}`)
                return
              }
              if (reporterType === 'expert') {
                navigate(`/experts/management/profile/${reporterId}`)
                return
              }
              toast.message('Profile view not available for this reporter type')
            }}
            onReassign={async () => {
              if (!selectedTicketId || !user) return
              try {
                await assignMutation.mutateAsync({
                  id: selectedTicketId,
                  payload: {
                    assignedToId: user.id,
                    assignedToName: user.fullname,
                  },
                })
                toast.success(`Ticket assigned to ${user.fullname}`)
              } catch (err) {
                toast.error(getApiErrorMessage(err, 'Failed to reassign ticket'))
              }
            }}
            onEscalate={async () => {
              if (!selectedTicketId) return
              try {
                await escalateMutation.mutateAsync({ id: selectedTicketId })
                toast.success('Ticket escalated')
              } catch (err) {
                toast.error(getApiErrorMessage(err, 'Failed to escalate ticket'))
              }
            }}
            onResolve={async () => {
              if (!selectedTicketId) return
              try {
                await resolveMutation.mutateAsync({
                  id: selectedTicketId,
                  payload: { comments: ticket?.comments },
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
    </div>
  )
}
