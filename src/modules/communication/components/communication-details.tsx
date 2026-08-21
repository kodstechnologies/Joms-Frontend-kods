import { ArrowLeft, User } from 'lucide-react'
import calendarIcon from '@/assets/JOMS_ICONS-2/icons8-calendar.svg'
import { useNavigate, useParams } from 'react-router-dom'

import { useCommunication } from '../hooks/use-communications'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { StatCard } from '@/shared/components/dashboard/stat-card'

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

  const rateHint = (part: number, whole: number, label: string) =>
    whole > 0 ? `${((part / whole) * 100).toFixed(1)}% of ${label}` : undefined

  const analyticsMetrics = [
    { title: 'Sent', value: String(analytics.sent) },
    {
      title: 'Delivered',
      value: String(analytics.delivered),
      hint: rateHint(analytics.delivered, analytics.sent, 'sent'),
    },
    {
      title: 'Opened',
      value: String(analytics.opened),
      hint: rateHint(analytics.opened, analytics.delivered || analytics.sent, 'delivered'),
    },
    {
      title: 'Clicked',
      value: String(analytics.clicked),
      hint: rateHint(analytics.clicked, analytics.opened || analytics.delivered, 'opened'),
    },
    {
      title: 'Failed',
      value: String(analytics.failed),
      hint: rateHint(analytics.failed, analytics.sent, 'sent'),
    },
    {
      title: 'Open Rate',
      value: `${data.openRate ?? 0}%`,
    },
    {
      title: 'Click Rate',
      value: `${data.clickRate ?? 0}%`,
    },
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
      {/* Breadcrumb */}
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
            Communication management
          </button>
          <span> / </span>
          <span className="text-brand-text font-semibold">View Details</span>
        </p>
      </div>

      {/* Main card */}
      <div className="radius-lg bg-brand-surface border border-white/[0.06] p-5">
        {/* Title row */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-h4 text-brand-text">{data.title}</h2>
            <div className="text-body-sm text-muted mt-2 flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <User className="size-3.5" />
                {data.createdBy}
              </span>
              <span className="flex items-center gap-1.5">
                <img src={calendarIcon} alt="calendar" className="size-3.5" />
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

        {/* Type / Audience / Channel */}
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

        {/* Subject */}
        {data.subject ? (
          <div className="mb-5">
            <p className="text-body-sm-semibold text-brand-text mb-2">Subject</p>
            <div className="radius-md bg-brand-bg border border-white/[0.06] px-4 py-3">
              <p className="text-body-sm text-brand-text/80">{data.subject}</p>
            </div>
          </div>
        ) : null}

        {/* Message Content */}
        <div className="mb-5">
          <p className="text-body-sm-semibold text-brand-text mb-2">Message Content</p>
          <div className="radius-md bg-brand-bg border border-white/[0.06] px-4 py-3">
            <p className="text-body-sm text-brand-text/80 whitespace-pre-wrap">
              {data.messageContent}
            </p>
          </div>
        </div>

        {/* Additional Notes */}
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

        {/* Delivery Analytics */}
        <div className="border-t border-white/[0.06] pt-5">
          <p className="text-body-sm-semibold text-brand-text mb-1">Delivery Analytics</p>
          {data.deliveryMeta?.note ? (
            <p className="text-body-sm text-muted mb-4">{data.deliveryMeta.note}</p>
          ) : null}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {analyticsMetrics.map((metric) => (
              <StatCard
                key={metric.title}
                title={metric.title}
                value={metric.value}
                hint={metric.hint}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
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
