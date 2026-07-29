import { useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  COMMUNICATION_AUDIENCE_OPTIONS,
  COMMUNICATION_CHANNEL_OPTIONS,
  COMMUNICATION_TYPE_OPTIONS,
  type CommunicationAudience,
  type CommunicationChannel,
  type CommunicationDeliveryType,
  type CommunicationType,
  type CreateCommunicationPayload,
} from '../api/communication-api'
import {
  useCommunication,
  useCommunicationOptions,
  useCreateCommunication,
  useUpdateCommunication,
} from '../hooks/use-communications'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { cn } from '@/shared/lib/cn'

const toDateTimeLocalValue = (iso: string | null | undefined) => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// Shared field styles
const inputClass = 'ui-input'
const selectClass = 'ui-input appearance-none cursor-pointer'
const labelClass = 'text-body-sm text-muted mb-1.5 block'

export function CommunicationForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit') ?? ''

  const optionsQuery = useCommunicationOptions()
  const existingQuery = useCommunication(editId)
  const createMutation = useCreateCommunication()
  const updateMutation = useUpdateCommunication()

  const [title, setTitle] = useState('')
  const [channel, setChannel] = useState<CommunicationChannel | ''>('')
  const [type, setType] = useState<CommunicationType | ''>('')
  const [audience, setAudience] = useState<CommunicationAudience | ''>('')
  const [deliveryType, setDeliveryType] = useState<CommunicationDeliveryType>('send-now')
  const [scheduledAt, setScheduledAt] = useState('')
  const [subject, setSubject] = useState('')
  const [messageContent, setMessageContent] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [hydratedItem, setHydratedItem] = useState(existingQuery.data)

  const audienceOptions = useMemo(
    () => optionsQuery.data?.audiences ?? COMMUNICATION_AUDIENCE_OPTIONS,
    [optionsQuery.data?.audiences],
  )
  const channelOptions = useMemo(
    () => optionsQuery.data?.channels ?? COMMUNICATION_CHANNEL_OPTIONS,
    [optionsQuery.data?.channels],
  )
  const typeOptions = useMemo(
    () => optionsQuery.data?.types ?? COMMUNICATION_TYPE_OPTIONS,
    [optionsQuery.data?.types],
  )

  const item = existingQuery.data
  if (item && item !== hydratedItem) {
    setHydratedItem(item)
    setTitle(item.title)
    setChannel(item.channel)
    setType(item.type)
    setAudience(item.audience)
    setDeliveryType(item.deliveryType)
    setScheduledAt(toDateTimeLocalValue(item.scheduledAt))
    setSubject(item.subject)
    setMessageContent(item.messageContent)
    setAdditionalNotes(item.additionalNotes)
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const isEditMode = Boolean(editId)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim() || !channel || !type || !audience || !messageContent.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (deliveryType === 'schedule' && !scheduledAt) {
      toast.error('Please select a date and time for scheduling')
      return
    }

    const payload: CreateCommunicationPayload = {
      title: title.trim(),
      channel,
      type,
      audience,
      deliveryType,
      scheduledAt: deliveryType === 'schedule' ? new Date(scheduledAt).toISOString() : null,
      subject: subject.trim(),
      messageContent: messageContent.trim(),
      additionalNotes: additionalNotes.trim(),
    }

    if (isEditMode) {
      updateMutation.mutate(
        { id: editId, payload },
        {
          onSuccess: (data) => {
            toast.success('Communication updated')
            navigate(`/communication/view/${data.id}`)
          },
          onError: (error) => toast.error(getApiErrorMessage(error)),
        },
      )
      return
    }

    createMutation.mutate(payload, {
      onSuccess: (data) => {
        toast.success(
          deliveryType === 'schedule' ? 'Communication scheduled' : 'Communication saved',
        )
        navigate(`/communication/view/${data.id}`)
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/communication/management')}
          className="group text-h3 hover:text-brand-accent text-brand-text flex w-fit items-center gap-2 tracking-tight transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          {isEditMode ? 'Edit Communication' : 'Create Communication'}
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
          <span className="text-brand-text font-semibold">
            {isEditMode ? 'Edit Communication' : 'Send email'}
          </span>
        </p>
      </div>

      {/* Form card */}
      <div className="radius-lg bg-brand-surface border border-white/[0.06] p-5 sm:p-6">
        {/* Card header */}
        <div className="mb-6 border-b border-white/[0.06] pb-5">
          <h2 className="text-h4 text-brand-text">
            {isEditMode ? 'Edit Communication' : 'Create New Communication Template'}
          </h2>
          <p className="text-body-sm text-muted mt-1">
            Send updates, announcements, or important messages to your audience.
          </p>
          <p className="text-body-sm text-muted mt-1 opacity-60">
            In-app, push, and email provider delivery will be connected later.
          </p>
        </div>

        <div className="space-y-5">
          {/* Communication Title */}
          <div>
            <label className={labelClass}>Communication Title (internal use only)</label>
            <input
              type="text"
              placeholder="Enter communication Title"
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Channel Type + Communication Type */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>Channel Type</label>
              <select
                className={selectClass}
                value={channel}
                onChange={(e) => setChannel(e.target.value as CommunicationChannel)}
                required
              >
                <option value="">In App Notification</option>
                {channelOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Communication Type</label>
              <select
                className={selectClass}
                value={type}
                onChange={(e) => setType(e.target.value as CommunicationType)}
                required
              >
                <option value="">Select</option>
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Audience */}
          <div>
            <label className={labelClass}>Audience</label>
            <div className="relative">
              <select
                className={cn(inputClass, audience ? 'text-transparent' : '')}
                value={audience}
                onChange={(e) => setAudience(e.target.value as CommunicationAudience)}
                required
              >
                <option value="">Enter Audience Type</option>
                {audienceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {audience ? (
                <span
                  className="text-body-sm-semibold pointer-events-none absolute top-1/2 left-3 inline-flex h-[26px] -translate-y-1/2 items-center gap-2 rounded-full px-3 text-black"
                  style={{ background: 'linear-gradient(135deg, #F6CB86 0%, #E0A263 100%)' }}
                >
                  {audienceOptions.find((o) => o.value === audience)?.label ?? audience}
                  <span className="opacity-70">✕</span>
                </span>
              ) : null}
            </div>
          </div>

          {/* Set Time & Date */}
          <div>
            <label className={labelClass}>Set Time & Date</label>
            <div
              className={cn(
                'grid gap-5',
                deliveryType === 'schedule' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1',
              )}
            >
              <div className="flex items-center gap-6">
                <label className="text-body-sm text-brand-text flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    checked={deliveryType === 'send-now'}
                    onChange={() => setDeliveryType('send-now')}
                    className="accent-white"
                  />
                  Send Now
                </label>
                <label className="text-body-sm text-brand-text flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    checked={deliveryType === 'schedule'}
                    onChange={() => setDeliveryType('schedule')}
                    className="accent-white"
                  />
                  Schedule
                </label>
              </div>

              {deliveryType === 'schedule' && (
                <div>
                  <label className={cn(labelClass, 'flex items-center gap-1')}>
                    Add Date & Time
                    <span className="text-muted text-xs opacity-60">(dd-mm-yyyy, --:--)</span>
                  </label>
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required={deliveryType === 'schedule'}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Subject Line */}
          <div>
            <label className={labelClass}>Subject Line</label>
            <input
              type="text"
              placeholder="Enter Message"
              className={inputClass}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Message Content */}
          <div>
            <label className={labelClass}>Message Content</label>
            <textarea
              rows={4}
              placeholder="Enter Message"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              required
              className="ui-textarea"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className={labelClass}>Additional Notes</label>
            <input
              type="text"
              placeholder="Enter Message"
              className={inputClass}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
            />
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
          type="submit"
          disabled={isSubmitting || (isEditMode && existingQuery.isLoading)}
          className="ui-cta ui-cta-primary"
        >
          {isSubmitting ? 'Saving...' : 'Submit'}
        </button>
      </div>
    </form>
  )
}
