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
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

const fieldClassName =
  'h-11 border-white/10 bg-[#0F0F0F] text-brand-text placeholder:text-brand-muted'

const toDateTimeLocalValue = (iso: string | null | undefined) => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

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
          deliveryType === 'schedule'
            ? 'Communication scheduled'
            : 'Communication saved (delivery providers will be connected later)',
        )
        navigate(`/communication/view/${data.id}`)
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <form className="flex flex-col gap-4 md:gap-6" onSubmit={handleSubmit}>
      <div>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/communication/management')}
          className="text-brand-text hover:text-brand-accent mb-3 flex items-center gap-2 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="size-4" />
          {isEditMode ? 'Edit Communication' : 'Create Communication'}
        </button>

        <p className="text-brand-muted text-sm">
          Communication management /
          <span className="text-brand-text ml-1 font-medium">
            {isEditMode ? 'Edit Communication' : 'Create Communication'}
          </span>
        </p>
      </div>

      <section
        className={cn(
          uiTokens.radiusCard,
          uiTokens.borderSubtle,
          'bg-brand-surface p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:p-8',
        )}
      >
        <div className="border-b border-white/10 pb-5">
          <h2 className="text-brand-text text-lg font-semibold">
            {isEditMode ? 'Edit Communication' : 'Create New Communication'}
          </h2>
          <p className="text-brand-muted mt-1 text-sm">
            Send updates, announcements, or important messages to your audience.
          </p>
          <p className="text-brand-muted mt-2 text-xs">
            In-app, push, and email provider delivery will be connected later.
          </p>
        </div>

        <div className="mt-8 space-y-5">
          <div>
            <label className="text-brand-text mb-2 block text-sm font-medium">
              Communication Title (internal use only)
            </label>
            <Input
              type="text"
              placeholder="Enter communication Title"
              className={fieldClassName}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="text-brand-text mb-2 block text-sm font-medium">Channel Type</label>
              <select
                className={cn(
                  'text-brand-text flex h-11 w-full border px-3 text-sm outline-none',
                  uiTokens.radiusSoft,
                  uiTokens.focusRing,
                  fieldClassName,
                )}
                value={channel}
                onChange={(event) => setChannel(event.target.value as CommunicationChannel)}
                required
              >
                <option value="">Select channel</option>
                {channelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-brand-text mb-2 block text-sm font-medium">
                Communication Type
              </label>
              <select
                className={cn(
                  'text-brand-text flex h-11 w-full border px-3 text-sm outline-none',
                  uiTokens.radiusSoft,
                  uiTokens.focusRing,
                  fieldClassName,
                )}
                value={type}
                onChange={(event) => setType(event.target.value as CommunicationType)}
                required
              >
                <option value="">Select</option>
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-brand-text mb-2 block text-sm font-medium">Audience</label>
            <select
              className={cn(
                'text-brand-text flex h-11 w-full border px-3 text-sm outline-none',
                uiTokens.radiusSoft,
                uiTokens.focusRing,
                fieldClassName,
              )}
              value={audience}
              onChange={(event) => setAudience(event.target.value as CommunicationAudience)}
              required
            >
              <option value="">Select audience</option>
              {audienceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div
            className={cn(
              'grid gap-5',
              deliveryType === 'schedule' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1',
            )}
          >
            <div>
              <label className="text-brand-text mb-2 block text-sm font-medium">
                Set Time & Date
              </label>
              <div className="mt-2 flex flex-wrap items-center gap-6">
                <label className="text-brand-text flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={deliveryType === 'send-now'}
                    onChange={() => setDeliveryType('send-now')}
                    className="accent-brand-accent"
                  />
                  Send Now
                </label>
                <label className="text-brand-text flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={deliveryType === 'schedule'}
                    onChange={() => setDeliveryType('schedule')}
                    className="accent-brand-accent"
                  />
                  Schedule
                </label>
              </div>
            </div>

            {deliveryType === 'schedule' && (
              <div>
                <label className="text-brand-text mb-2 flex items-center gap-1 text-sm font-medium">
                  Add Date & Time
                  <span className="group text-brand-muted relative cursor-help text-xs">ⓘ</span>
                  <span className="sr-only">Time Format: 24 Hours</span>
                </label>
                <Input
                  type="datetime-local"
                  className={fieldClassName}
                  value={scheduledAt}
                  onChange={(event) => setScheduledAt(event.target.value)}
                  required={deliveryType === 'schedule'}
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-brand-text mb-2 block text-sm font-medium">Subject Line</label>
            <Input
              type="text"
              placeholder="Enter Message"
              className={fieldClassName}
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
          </div>

          <div>
            <label className="text-brand-text mb-2 block text-sm font-medium">
              Message Content
            </label>
            <textarea
              rows={4}
              placeholder="Enter Message"
              value={messageContent}
              onChange={(event) => setMessageContent(event.target.value)}
              required
              className={cn(
                'text-brand-text placeholder:text-brand-muted min-h-[96px] w-full resize-y border px-3 py-2.5 text-sm outline-none',
                uiTokens.radiusSoft,
                uiTokens.focusRing,
                fieldClassName,
              )}
            />
          </div>

          <div>
            <label className="text-brand-text mb-2 block text-sm font-medium">
              Additional Notes
            </label>
            <Input
              type="text"
              placeholder="Enter Message"
              className={fieldClassName}
              value={additionalNotes}
              onChange={(event) => setAdditionalNotes(event.target.value)}
            />
          </div>
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
          <Button type="submit" disabled={isSubmitting || (isEditMode && existingQuery.isLoading)}>
            {isSubmitting ? 'Saving...' : 'Submit'}
          </Button>
        </div>
      </section>
    </form>
  )
}
