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

type FormValues = {
  title: string
  channel: CommunicationChannel | ''
  type: CommunicationType | ''
  audience: CommunicationAudience | ''
  deliveryType: CommunicationDeliveryType
  scheduledAt: string
  subject: string
  messageContent: string
  additionalNotes: string
}

const emptyForm: FormValues = {
  title: '',
  channel: '',
  type: '',
  audience: '',
  deliveryType: 'send-now',
  scheduledAt: '',
  subject: '',
  messageContent: '',
  additionalNotes: '',
}

const inputClass = 'ui-input'
const selectClass = 'ui-input appearance-none cursor-pointer'
const labelClass = 'text-body-sm text-muted mb-1.5 block'

export function CommunicationForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit') ?? ''
  const isEditMode = Boolean(editId)

  const optionsQuery = useCommunicationOptions()
  const existingQuery = useCommunication(editId)
  const createMutation = useCreateCommunication()
  const updateMutation = useUpdateCommunication()

  if (isEditMode && existingQuery.isLoading) {
    return <div className="text-muted py-16 text-center text-sm">Loading communication...</div>
  }

  if (isEditMode && existingQuery.isError) {
    return (
      <div className="mx-auto flex w-full max-w-[1091px] flex-col gap-4">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/communication/management')}
          className="group text-h3 hover:text-brand-accent text-brand-text flex w-fit items-center gap-2 tracking-tight transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          Edit Communication
        </button>
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {getApiErrorMessage(existingQuery.error) || 'Failed to load communication for editing.'}
        </div>
      </div>
    )
  }

  const item = existingQuery.data
  const initialValues: FormValues =
    isEditMode && item
      ? {
          title: item.title ?? '',
          channel: item.channel ?? '',
          type: item.type ?? '',
          audience: item.audience ?? '',
          deliveryType: item.deliveryType ?? 'send-now',
          scheduledAt: toDateTimeLocalValue(item.scheduledAt),
          subject: item.subject ?? '',
          messageContent: item.messageContent ?? '',
          additionalNotes: item.additionalNotes ?? '',
        }
      : emptyForm

  // Remount when switching create/edit so form state resets without setState-in-effect
  return (
    <CommunicationFormFields
      key={editId || 'create'}
      initialValues={initialValues}
      isEditMode={isEditMode}
      editId={editId}
      audiences={optionsQuery.data?.audiences}
      channels={optionsQuery.data?.channels}
      types={optionsQuery.data?.types}
      isSubmitting={createMutation.isPending || updateMutation.isPending}
      onCreate={(payload, handlers) => createMutation.mutate(payload, handlers)}
      onUpdate={(id, payload, handlers) => updateMutation.mutate({ id, payload }, handlers)}
    />
  )
}

type CommunicationFormFieldsProps = {
  initialValues: FormValues
  isEditMode: boolean
  editId: string
  audiences?: typeof COMMUNICATION_AUDIENCE_OPTIONS
  channels?: typeof COMMUNICATION_CHANNEL_OPTIONS
  types?: typeof COMMUNICATION_TYPE_OPTIONS
  isSubmitting: boolean
  onCreate: (
    payload: CreateCommunicationPayload,
    handlers: { onSuccess: () => void; onError: (error: unknown) => void },
  ) => void
  onUpdate: (
    id: string,
    payload: CreateCommunicationPayload,
    handlers: { onSuccess: () => void; onError: (error: unknown) => void },
  ) => void
}

function CommunicationFormFields({
  initialValues,
  isEditMode,
  editId,
  audiences,
  channels,
  types,
  isSubmitting,
  onCreate,
  onUpdate,
}: CommunicationFormFieldsProps) {
  const navigate = useNavigate()

  const [title, setTitle] = useState(initialValues.title)
  const [channel, setChannel] = useState<CommunicationChannel | ''>(initialValues.channel)
  const [type, setType] = useState<CommunicationType | ''>(initialValues.type)
  const [audience, setAudience] = useState<CommunicationAudience | ''>(initialValues.audience)
  const [deliveryType, setDeliveryType] = useState<CommunicationDeliveryType>(
    initialValues.deliveryType,
  )
  const [scheduledAt, setScheduledAt] = useState(initialValues.scheduledAt)
  const [subject, setSubject] = useState(initialValues.subject)
  const [messageContent, setMessageContent] = useState(initialValues.messageContent)
  const [additionalNotes, setAdditionalNotes] = useState(initialValues.additionalNotes)

  const audienceOptions = useMemo(() => {
    const options = audiences ?? COMMUNICATION_AUDIENCE_OPTIONS
    return options.filter((opt) => opt.value !== 'all-users')
  }, [audiences])

  const channelOptions = useMemo(() => channels ?? COMMUNICATION_CHANNEL_OPTIONS, [channels])
  const typeOptions = useMemo(() => types ?? COMMUNICATION_TYPE_OPTIONS, [types])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim() || !channel || !type || !audience || !messageContent.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (channel === 'email' && !subject.trim()) {
      toast.error('Subject line is required for email')
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
      onUpdate(editId, payload, {
        onSuccess: () => {
          toast.success('Communication updated')
          navigate('/communication/management')
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      })
      return
    }

    onCreate(payload, {
      onSuccess: () => {
        toast.success(
          deliveryType === 'schedule' ? 'Communication scheduled' : 'Communication saved',
        )
        navigate('/communication/management')
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <form className="mx-auto flex w-full max-w-[1091px] flex-col gap-6" onSubmit={handleSubmit}>
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
            {isEditMode ? 'Edit Communication' : 'Create Communication'}
          </span>
        </p>
      </div>

      <div className="bg-brand-surface w-full rounded-[10px] border border-white/[0.06] p-5 sm:p-6">
        <div className="mb-6 border-b border-white/[0.06] pb-5">
          <h2 className="text-h4 text-brand-text">
            {isEditMode ? 'Edit Communication' : 'Create New Communication Template'}
          </h2>
          <p className="text-body-sm text-muted mt-1">
            Send updates, announcements, or important messages to your audience.
          </p>
        </div>

        <div className="space-y-5">
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

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>Channel Type</label>
              <select
                className={selectClass}
                value={channel}
                onChange={(e) => setChannel(e.target.value as CommunicationChannel)}
                required
              >
                <option value="">Select channel type</option>
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

          <div>
            <label className={labelClass}>Audience</label>
            <div className="relative">
              <select
                className={cn(selectClass, audience ? 'text-transparent' : '')}
                value={audience}
                onChange={(e) => setAudience(e.target.value as CommunicationAudience)}
                required
              >
                <option value="">Select audience</option>
                {audienceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {audience ? (
                <button
                  type="button"
                  onClick={() => setAudience('')}
                  className="text-body-sm-semibold absolute top-1/2 left-3 inline-flex h-[26px] -translate-y-1/2 items-center gap-2 rounded-full px-3 text-black"
                  style={{ background: 'linear-gradient(135deg, #F6CB86 0%, #E0A263 100%)' }}
                >
                  {audienceOptions.find((o) => o.value === audience)?.label ?? audience}
                  <span className="opacity-70">✕</span>
                </button>
              ) : null}
            </div>
          </div>

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

          <div>
            <label className={labelClass}>
              Subject Line
              {channel === 'email' ? <span className="text-brand-danger"> *</span> : null}
            </label>
            <input
              type="text"
              placeholder={channel === 'email' ? 'Enter email subject' : 'Enter Message'}
              className={inputClass}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required={channel === 'email'}
            />
          </div>

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

      <div className="bg-brand-surface flex w-full items-center justify-between rounded-[10px] border border-white/[0.06] px-5 py-4">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/communication/management')}
          className="ui-cta ui-cta-ghost"
        >
          Close
        </button>
        <button type="submit" disabled={isSubmitting} className="ui-cta ui-cta-primary">
          {isSubmitting ? 'Saving...' : 'Submit'}
        </button>
      </div>
    </form>
  )
}
