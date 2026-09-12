import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeftRight, Briefcase, Calendar, Clock, Flag, Layers, ListTree } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

import {
  useAdminChatMessages,
  useAdminChatThread,
  useAdminOrderDetail,
  useAdminServiceDetail,
  useFlagChatMessage,
  useFlagChatThread,
} from '../../hooks/use-service-drilldown'
import { useAdminConsultationBooking } from '../../hooks/use-consultation-drilldown'
import { EmptyState, ShimmerBlock } from '../../components/service-drilldown/drilldown-primitives'
import {
  DASH,
  formatDate,
  formatMessageDate,
  formatMessageTime,
  titleCase,
} from '../../components/service-drilldown/drilldown-format'
import { DrilldownHeader, PersonAvatar } from '../../components/service-drilldown/engagement-chrome'
import {
  consultationBookingPath,
  consultationPerformancePath,
  serviceDetailPath,
  serviceOrderDetailPath,
} from '../../lib/service-navigation'

const PAGE_SIZE = 50

export function MonitorMessagesPage() {
  const {
    expertId = '',
    serviceId = '',
    consultationId = '',
    orderId = '',
    bookingId = '',
  } = useParams<{
    expertId: string
    serviceId: string
    consultationId: string
    orderId: string
    bookingId: string
  }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isConsultation = Boolean(consultationId)
  const engagementId = bookingId || orderId
  const orderType = (searchParams.get('type') as 'order' | 'proposal' | null) ?? 'order'

  const [page, setPage] = useState(1)
  const [flaggedOnly, setFlaggedOnly] = useState(false)

  const orderQuery = useAdminOrderDetail(isConsultation ? undefined : orderId, orderType)
  const serviceQuery = useAdminServiceDetail(isConsultation ? undefined : serviceId)
  const bookingQuery = useAdminConsultationBooking(isConsultation ? bookingId : undefined)
  const order = orderQuery.data?.data
  const booking = bookingQuery.data?.data
  const threadId = (isConsultation ? booking?.threadId : order?.links.threadId) ?? undefined
  const threadQuery = useAdminChatThread(threadId)
  const thread = threadQuery.data?.data
  const messagesQuery = useAdminChatMessages(threadId, { page, limit: PAGE_SIZE, flaggedOnly })
  const messages = useMemo(
    () => messagesQuery.data?.data.messages ?? [],
    [messagesQuery.data?.data.messages],
  )
  const pages = messagesQuery.data?.data.pages ?? 1
  const flagMessage = useFlagChatMessage(threadId)
  const flagThread = useFlagChatThread(threadId)

  const expertName =
    (isConsultation ? booking?.expert?.name : order?.expert?.name) ||
    thread?.participants.partner.name ||
    'Expert'
  const clientName =
    (isConsultation ? booking?.client.name : order?.client.name) ||
    thread?.participants.user.name ||
    'Client'
  const listingTitle = isConsultation
    ? booking?.title || 'Consultation'
    : order?.links.serviceTitle || order?.engagement.title || 'Service Title'
  const listingExpert = isConsultation
    ? booking?.expert?.name || expertName
    : serviceQuery.data?.data.expert?.name || expertName
  const backPath = isConsultation
    ? consultationBookingPath(expertId, consultationId, engagementId)
    : serviceOrderDetailPath(expertId, serviceId, orderId, orderType)
  const listingPath = isConsultation
    ? consultationPerformancePath(expertId, consultationId)
    : serviceDetailPath(expertId, serviceId)
  const expertAvatar = isConsultation ? booking?.expert?.avatarUrl : order?.expert?.avatarUrl
  const clientAvatar = isConsultation ? booking?.client.avatarUrl : order?.client.avatarUrl
  const expertRole = isConsultation
    ? booking?.expert?.profession || booking?.expert?.serviceType || 'Expert'
    : order?.expert?.profession || order?.expert?.serviceType || 'Expert'
  const clientRole = isConsultation
    ? booking?.client.role || 'Client'
    : order?.client.role || 'Client'

  const grouped = useMemo(() => {
    const groups: { date: string; items: typeof messages }[] = []
    messages.forEach((message) => {
      const key = formatMessageDate(message.createdAt)
      const last = groups[groups.length - 1]
      if (last && last.date === key) last.items.push(message)
      else groups.push({ date: key, items: [message] })
    })
    return groups
  }, [messages])

  const toggleMessageFlag = async (messageId: string, isFlagged: boolean) => {
    try {
      await flagMessage.mutateAsync({ messageId, isFlagged: !isFlagged })
      toast.success(isFlagged ? 'Flag removed' : 'Message flagged')
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to update the message flag.')
    }
  }

  const toggleThreadFlag = async () => {
    if (!thread) return
    try {
      await flagThread.mutateAsync({ isFlagged: !thread.adminFlag.isFlagged })
      toast.success(thread.adminFlag.isFlagged ? 'Conversation unflagged' : 'Conversation flagged')
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to update the conversation flag.')
    }
  }

  const lastMessageLabel = (() => {
    if (!thread?.lastMessage.at) return DASH
    const at = new Date(thread.lastMessage.at)
    const time = formatMessageTime(thread.lastMessage.at)
    if (at.toDateString() === new Date().toDateString()) return `Today at ${time}`
    return `${formatDate(thread.lastMessage.at)} at ${time}`
  })()
  const isLoading =
    (isConsultation ? bookingQuery.isLoading : orderQuery.isLoading) || threadQuery.isLoading
  const pricingModel = isConsultation
    ? booking?.durationLabel || 'Consultation'
    : order?.engagement.pricingType === 'milestone'
      ? 'Milestone-based'
      : order?.engagement.pricingLabel || DASH
  const isActive = isConsultation
    ? booking?.status === 'scheduled'
    : !['approved', 'terminated', 'disputed'].includes(String(order?.engagement.workStatus))
  const hasContext = isConsultation ? Boolean(booking) : Boolean(order)

  return (
    <div className="flex w-full flex-col gap-5 pb-8 text-white">
      <DrilldownHeader
        title={isConsultation ? 'Consultation Performance' : 'Service Details'}
        onBack={() => navigateBackOrFallback(navigate, backPath)}
        crumbs={[
          { label: 'Expert Management', onClick: () => navigate('/experts/management') },
          {
            label: listingExpert,
            onClick: () => navigate(`/experts/management/profile/${expertId}`),
          },
          {
            label: isConsultation ? 'Consultation Performance' : 'Service listing',
            onClick: () => navigate(listingPath),
          },
          { label: listingTitle },
          { label: clientName },
          { label: 'Monitor Messages' },
        ]}
      />

      {isLoading ? (
        <ShimmerBlock className="h-40 w-full" />
      ) : !threadId || !thread || !hasContext ? (
        <EmptyState message="This engagement has no chat thread yet." />
      ) : (
        <>
          <section className="rounded-2xl bg-[#1A1A1A] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <PersonAvatar name={expertName} src={expertAvatar} />
                  <div>
                    <p className="text-sm font-semibold text-white">{expertName}</p>
                    <p className="text-muted text-[11px]">{expertRole}</p>
                  </div>
                </div>
                <ArrowLeftRight className="text-muted size-5" />
                <div className="flex items-center gap-3">
                  <PersonAvatar name={clientName} src={clientAvatar} />
                  <div>
                    <p className="text-sm font-semibold text-white">{clientName}</p>
                    <p className="text-muted text-[11px]">{clientRole}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className={cn(
                    'h-9 gap-2 rounded-lg border-red-500 text-red-400 hover:bg-red-500/10',
                    thread.adminFlag.isFlagged && 'bg-red-500/10',
                  )}
                  onClick={toggleThreadFlag}
                  disabled={flagThread.isPending}
                >
                  <Flag
                    className="size-3.5"
                    fill={thread.adminFlag.isFlagged ? 'currentColor' : 'none'}
                  />
                  {thread.adminFlag.isFlagged ? 'Unflag Conversation' : 'Flag Conversation'}
                </Button>
                {!isConsultation ? (
                  <Button
                    variant="outline"
                    className="h-9 gap-2 rounded-lg"
                    onClick={() =>
                      navigate(serviceOrderDetailPath(expertId, serviceId, orderId, orderType))
                    }
                  >
                    <ListTree className="size-3.5" />
                    View in Timeline
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white">
              <span className="flex items-center gap-2">
                <Briefcase className="size-4" /> {listingTitle}
              </span>
              <span className="flex items-center gap-2">
                <Layers className="size-4" /> {pricingModel}
              </span>
              <span className="flex items-center gap-2">
                <span
                  className={cn('size-2 rounded-full', isActive ? 'bg-emerald-500' : 'bg-white/30')}
                />
                {isConsultation
                  ? titleCase(booking?.status)
                  : isActive
                    ? 'Active'
                    : order?.engagement.workStatusLabel || 'Closed'}
              </span>
            </div>

            <div className="text-muted mt-4 flex flex-wrap gap-x-8 gap-y-2 text-[12px]">
              <span className="flex items-center gap-2">
                <Calendar className="size-3.5" /> Started:{' '}
                {formatDate(
                  thread.startedAt ||
                    (isConsultation ? booking?.startAt : order?.engagement.startDate),
                )}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="size-3.5" /> {isConsultation ? 'Ends' : 'Expected End'}:{' '}
                {formatDate(isConsultation ? booking?.endAt : order?.engagement.endDate)}
              </span>
              {!isConsultation ? (
                <span className="flex items-center gap-2">
                  <Flag className="size-3.5 text-white" /> Current Phase:{' '}
                  <span className="text-white">{order?.engagement.currentPhase || DASH}</span>
                </span>
              ) : null}
              <span className="flex items-center gap-2">
                <Clock className="size-3.5" /> Last Message: {lastMessageLabel}
              </span>
            </div>

            {thread.adminFlag.isFlagged ? (
              <p className="mt-4 text-[12px] text-red-300">
                Conversation flagged internally
                {thread.adminFlag.flaggedByName ? ` by ${thread.adminFlag.flaggedByName}` : ''}
                {thread.adminFlag.flaggedAt ? ` · ${formatDate(thread.adminFlag.flaggedAt)}` : ''}.
                This is not shown to the client or expert.
              </p>
            ) : null}
          </section>

          <section className="min-h-[420px]">
            {messagesQuery.isLoading ? (
              <div className="space-y-3">
                <ShimmerBlock className="h-16 w-2/3" />
                <ShimmerBlock className="ml-auto h-16 w-2/3" />
              </div>
            ) : messages.length === 0 ? (
              <EmptyState
                message={flaggedOnly ? 'No flagged messages.' : 'No messages exchanged yet.'}
              />
            ) : (
              <div className="space-y-6">
                {grouped.map((group) => (
                  <div key={group.date} className="space-y-4">
                    <div className="flex justify-center">
                      <span className="rounded-full bg-[#1A1A1A] px-4 py-1 text-[11px] text-white/80">
                        {group.date}
                      </span>
                    </div>
                    {group.items.map((message) => {
                      const fromExpert = message.senderType === 'partner'
                      const flagButton = (
                        <button
                          type="button"
                          onClick={() =>
                            toggleMessageFlag(message._id, message.adminFlag.isFlagged)
                          }
                          disabled={flagMessage.isPending}
                          aria-label={
                            message.adminFlag.isFlagged ? 'Remove message flag' : 'Flag message'
                          }
                          className={cn(
                            'inline-flex size-5 shrink-0 items-center justify-center',
                            fromExpert ? 'text-red-600' : 'text-white/45',
                            message.adminFlag.isFlagged && 'text-red-500',
                          )}
                        >
                          <Flag
                            className="size-3.5"
                            fill={message.adminFlag.isFlagged ? 'currentColor' : 'none'}
                          />
                        </button>
                      )

                      return (
                        <div
                          key={message._id}
                          className={cn('flex', fromExpert ? 'justify-end' : 'justify-start')}
                        >
                          <div className="max-w-[70%]">
                            <p
                              className={cn(
                                'text-muted mb-1 text-[11px]',
                                fromExpert ? 'text-right' : 'text-left',
                              )}
                            >
                              {message.senderName || (fromExpert ? expertName : clientName)}{' '}
                              {formatMessageTime(message.createdAt)}
                            </p>
                            <div
                              className={cn(
                                'inline-flex max-w-full flex-nowrap items-center gap-2 rounded-2xl px-4 py-3 text-sm leading-relaxed',
                                fromExpert
                                  ? 'bg-brand-accent text-black'
                                  : 'bg-[#111111] text-white',
                              )}
                            >
                              {fromExpert ? flagButton : null}
                              {message.isDeleted ? (
                                <p className="min-w-0 italic opacity-70">
                                  This message was deleted.
                                </p>
                              ) : (
                                <p className="min-w-0 break-words whitespace-pre-wrap">
                                  {message.text || message.fileName}
                                </p>
                              )}
                              {fromExpert ? null : flagButton}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}

            {pages > 1 ? (
              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
                <span className="text-muted text-[11px]">
                  Page {page} of {pages}
                </span>
                <Button
                  variant="secondary"
                  disabled={page >= pages}
                  onClick={() => setPage((current) => Math.min(pages, current + 1))}
                >
                  Next
                </Button>
              </div>
            ) : null}

            <div className="mt-4">
              <Button
                variant="ghost"
                className="text-muted h-auto px-0 text-[11px]"
                onClick={() => setFlaggedOnly((v) => !v)}
              >
                {flaggedOnly ? 'Show all messages' : 'Show flagged only'}
              </Button>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
