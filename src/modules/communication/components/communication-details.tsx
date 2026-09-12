import type { SVGProps } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { useCommunication } from '../hooks/use-communications'
import { TrendBadge } from '@/shared/components/dashboard/trend-badge'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

function SolidUserIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className ?? 'size-4 shrink-0'}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  )
}

function SolidCalendarIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className ?? 'size-4 shrink-0'}
      aria-hidden="true"
      {...props}
    >
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
    </svg>
  )
}

export function CommunicationDetails() {
  const navigate = useNavigate()
  const { id = '' } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useCommunication(id)

  if (isLoading) {
    return <div className="text-muted py-16 text-center text-sm">Loading communication...</div>
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-muted text-sm">Communication not found.</p>
        <button
          type="button"
          onClick={() => navigate('/communication/management')}
          className="ui-cta ui-cta-ghost"
        >
          Back to list
        </button>
      </div>
    )
  }

  const analytics = data.analytics || {
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    failed: 0,
    bounced: 0,
  }

  const deliveryCards = [
    { title: 'Sent', value: analytics.sent ?? 0 },
    { title: 'Delivered', value: analytics.delivered ?? 0 },
    { title: 'Opened', value: analytics.opened ?? 0 },
    { title: 'Clicked', value: analytics.clicked ?? 0 },
    { title: 'Failed', value: analytics.failed ?? 0 },
    { title: 'Bounced', value: analytics.bounced ?? 0 },
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
    <div className="flex flex-col gap-6 pb-8">
      <div>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/communication/management')}
          className="group text-h3 hover:text-brand-accent text-brand-text flex w-fit items-center gap-2 tracking-tight transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Communication Management</span>
        </button>
        <p className="text-body-sm text-muted mt-2 pl-7 leading-[20px]">
          <button
            type="button"
            onClick={() => navigate('/communication/management')}
            className="hover:text-brand-text transition-colors"
          >
            Communication
          </button>
          <span> / </span>
          <span className="text-brand-text font-semibold">View Details</span>
        </p>
      </div>

      <div className="radius-lg bg-brand-surface border border-white/[0.06] p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-h4 text-brand-text">{data.title}</h2>
            <div className="text-body-sm text-muted mt-2 flex flex-wrap items-center gap-4">
              <span className="text-brand-text/90 flex items-center gap-1.5">
                <SolidUserIcon className="text-brand-text/90 size-4" />
                {data.createdBy || 'System Auto'}
              </span>
              <span className="text-brand-text/90 flex items-center gap-1.5">
                <SolidCalendarIcon className="text-brand-text/90 size-4" />
                {scheduleLabel}
              </span>
            </div>
          </div>
          <span
            className="text-body-sm-semibold inline-flex h-[31px] shrink-0 items-center rounded px-3"
            style={{ backgroundColor: 'rgb(0 166 62 / 20%)', color: '#00A63E' }}
          >
            {data.statusLabel}
          </span>
        </div>

        <div className="radius-md bg-brand-bg mb-5 grid grid-cols-2 gap-4 border border-white/[0.06] px-5 py-4 sm:grid-cols-4">
          <div>
            <p className="text-body-sm text-muted">Type</p>
            <p className="text-body-md-semibold text-brand-text mt-1">{data.typeLabel}</p>
          </div>
          <div>
            <p className="text-body-sm text-muted">Audience</p>
            <p className="text-body-md-semibold text-brand-text mt-1">{data.audienceLabel}</p>
          </div>
          <div>
            <p className="text-body-sm text-muted">Channel</p>
            <p className="text-body-md-semibold text-brand-text mt-1">{data.channelLabel}</p>
          </div>
          <div>
            <p className="text-body-sm text-muted">Priority</p>
            <p className="text-body-md-semibold text-brand-text mt-1">{data.priorityLabel}</p>
          </div>
        </div>

        <div className="radius-md bg-brand-bg mb-5 grid grid-cols-2 gap-4 border border-white/[0.06] px-5 py-4 sm:grid-cols-4">
          <div>
            <p className="text-body-sm text-muted">Message ID</p>
            <p className="text-body-md-semibold text-brand-text mt-1">{data.messageId}</p>
          </div>
          <div>
            <p className="text-body-sm text-muted">Campaign ID</p>
            <p className="text-body-md-semibold text-brand-text mt-1">{data.campaignId || '—'}</p>
          </div>
          <div>
            <p className="text-body-sm text-muted">Audience Size</p>
            <p className="text-body-md-semibold text-brand-text mt-1">{data.audienceSize || 0}</p>
          </div>
          <div>
            <p className="text-body-sm text-muted">Sent At</p>
            <p className="text-body-md-semibold text-brand-text mt-1">{data.sentAtLabel || '—'}</p>
          </div>
        </div>

        {data.subject ? (
          <div className="mb-5">
            <p className="text-body-sm-semibold text-brand-text mb-2">Subject</p>
            <div className="radius-md bg-brand-bg border border-white/[0.06] px-4 py-3">
              <p className="text-body-sm text-brand-text/80">{data.subject}</p>
            </div>
          </div>
        ) : null}

        <div className="mb-5">
          <p className="text-body-sm-semibold text-brand-text mb-2">Message Content</p>
          <div className="radius-md bg-brand-bg border border-white/[0.06] px-4 py-3">
            <p className="text-body-sm text-brand-text/80 whitespace-pre-wrap">
              {data.messageContent}
            </p>
          </div>
        </div>

        {data.additionalNotes ? (
          <div className="mb-5">
            <p className="text-body-sm-semibold text-brand-text mb-2">Additional Notes</p>
            <div className="radius-md bg-brand-bg border border-white/[0.06] px-4 py-3">
              <p className="text-body-sm text-brand-text/80">{data.additionalNotes}</p>
            </div>
          </div>
        ) : null}

        {data.failureReason ? (
          <div className="mb-5">
            <p className="text-body-sm-semibold text-brand-text mb-2">Failure Reason</p>
            <div className="radius-md bg-brand-bg border border-white/[0.06] px-4 py-3">
              <p className="text-body-sm text-brand-text/80">{data.failureReason}</p>
            </div>
          </div>
        ) : null}

        <div className="border-t border-white/[0.06] pt-5">
          <p className="text-body-sm-semibold text-brand-text mb-4">Delivery Analytics</p>
          {data.deliveryMeta?.note ? (
            <p className="text-body-sm text-muted mb-4">{data.deliveryMeta.note}</p>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {deliveryCards.map((card) => (
              <div
                key={card.title}
                className="flex min-h-[110px] flex-col justify-between rounded-xl border border-white/[0.04] bg-[#050505] p-4"
              >
                <div>
                  <p className="text-xs font-normal text-neutral-400">{card.title}</p>
                  <p className="mt-1 text-2xl font-bold text-white">{card.value}</p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <TrendBadge direction="up">6.7%</TrendBadge>
                  <span className="text-xs text-neutral-400">vs last month</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="radius-lg bg-brand-surface flex items-center justify-between border border-white/[0.06] px-5 py-4">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/communication/management')}
          className="ui-cta ui-cta-ghost"
        >
          Close
        </button>
        <button
          type="button"
          onClick={() => navigate(`/communication/create?edit=${data.id}`)}
          className="ui-cta ui-cta-primary"
        >
          Edit Communication
        </button>
      </div>
    </div>
  )
}
