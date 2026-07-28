import { ArrowLeft, Calendar, User } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { useCommunication } from '../hooks/use-communications'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

const statusBadgeClass: Record<string, string> = {
  Sent: 'border-brand-success/25 bg-brand-success/10 text-brand-success',
  Scheduled: 'border-brand-accent-muted bg-brand-accent/15 text-brand-accent',
  Draft: 'border-white/10 bg-white/5 text-brand-muted',
  Failed: 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger',
  Active: 'border-brand-success/25 bg-brand-success/10 text-brand-success',
}

export function CommunicationDetails() {
  const navigate = useNavigate()
  const { id = '' } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useCommunication(id)

  if (isLoading) {
    return (
      <div className="text-brand-muted py-16 text-center text-sm">Loading communication...</div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-brand-muted text-sm">Communication not found.</p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/communication/management')}
        >
          Back to list
        </Button>
      </div>
    )
  }

  const analyticsMetrics = [
    { label: 'Sent', value: data.analytics.sent },
    { label: 'Delivered', value: data.analytics.delivered },
    { label: 'Opened', value: data.analytics.opened },
    { label: 'Clicked', value: data.analytics.clicked },
    { label: 'Failed', value: data.analytics.failed },
    { label: 'Bounced', value: data.analytics.bounced },
  ]

  const scheduleLabel = data.scheduledAt
    ? new Date(data.scheduledAt).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : data.deliveryType === 'send-now'
      ? 'Send Now'
      : 'Not Scheduled'

  return (
    <div className="flex flex-col gap-4 pb-8 md:gap-6">
      <div>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/communication/management')}
          className="text-brand-text hover:text-brand-accent mb-3 flex items-center gap-2 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="size-4" />
          Communication Management
        </button>

        <p className="text-brand-muted text-sm">
          Communication management /
          <span className="text-brand-text ml-1 font-medium">{data.messageId}</span>
        </p>
      </div>

      <section
        className={cn(
          uiTokens.radiusCard,
          uiTokens.borderSubtle,
          'bg-brand-surface p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:p-8',
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-brand-text text-2xl font-semibold">{data.title}</h2>
            <div className="text-brand-muted mt-4 flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <User className="size-4" />
                {data.createdBy}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-4" />
                {scheduleLabel}
              </div>
            </div>
          </div>

          <span
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-semibold',
              statusBadgeClass[data.statusLabel] ?? 'text-brand-muted border-white/10 bg-white/5',
            )}
          >
            {data.statusLabel}
          </span>
        </div>

        <div className="rounded-brand-lg mt-6 border border-white/10 bg-[#0F0F0F] px-6 py-5 sm:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <p className="text-brand-muted text-xs">Type</p>
              <p className="text-brand-text mt-2 text-sm font-medium">{data.typeLabel}</p>
            </div>
            <div>
              <p className="text-brand-muted text-xs">Audience</p>
              <p className="text-brand-text mt-2 text-sm font-medium">{data.audienceLabel}</p>
            </div>
            <div>
              <p className="text-brand-muted text-xs">Channel</p>
              <p className="text-brand-text mt-2 text-sm font-medium">{data.channelLabel}</p>
            </div>
          </div>
        </div>

        {data.subject ? (
          <div className="mt-8">
            <h3 className="text-brand-text mb-3 text-sm font-semibold">Subject</h3>
            <div className="rounded-brand-lg border border-white/10 bg-[#0F0F0F] px-5 py-4">
              <p className="text-brand-text text-sm leading-6">{data.subject}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-8">
          <h3 className="text-brand-text mb-3 text-sm font-semibold">Message Content</h3>
          <div className="rounded-brand-lg border border-white/10 bg-[#0F0F0F] px-5 py-4">
            <p className="text-brand-text text-sm leading-6 whitespace-pre-wrap">
              {data.messageContent}
            </p>
          </div>
        </div>

        {data.additionalNotes ? (
          <div className="mt-8">
            <h3 className="text-brand-text mb-3 text-sm font-semibold">Additional Notes</h3>
            <div className="rounded-brand-lg border border-white/10 bg-[#0F0F0F] px-5 py-4">
              <p className="text-brand-text text-sm leading-6">{data.additionalNotes}</p>
            </div>
          </div>
        ) : null}

        <div className="my-8 border-t border-white/10" />

        <h3 className="text-brand-text mb-2 text-sm font-semibold">Delivery Analytics</h3>
        <p className="text-brand-muted mb-5 text-xs">{data.deliveryMeta.note}</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {analyticsMetrics.map((item) => (
            <div
              key={item.label}
              className={cn(uiTokens.radiusCard, uiTokens.borderSubtle, 'bg-[#0F0F0F] p-5')}
            >
              <p className="text-brand-muted text-xs font-semibold tracking-wide">{item.label}</p>
              <p className="text-brand-text mt-2 text-3xl font-semibold tracking-tight">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        className={cn(
          uiTokens.radiusCard,
          uiTokens.borderSubtle,
          'bg-brand-surface px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)]',
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigateBackOrFallback(navigate, '/communication/management')}
          >
            Close
          </Button>
          <Button type="button" onClick={() => navigate(`/communication/create?edit=${data.id}`)}>
            Edit Communication
          </Button>
        </div>
      </section>
    </div>
  )
}
