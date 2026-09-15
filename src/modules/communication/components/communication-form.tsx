import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, CalendarDays, Check, ChevronDown } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  COMMUNICATION_AUDIENCE_OPTIONS,
  COMMUNICATION_CHANNEL_OPTIONS,
  COMMUNICATION_PRIORITY_OPTIONS,
  COMMUNICATION_TYPE_OPTIONS,
  type CommunicationAudience,
  type CommunicationChannel,
  type CommunicationDeliveryType,
  type CommunicationPriority,
  type CommunicationType,
  type CreateCommunicationPayload,
  parseCommunicationAudiences,
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
  audiences: CommunicationAudience[]
  deliveryType: CommunicationDeliveryType
  priority: CommunicationPriority
  scheduledAt: string
  subject: string
  messageContent: string
  additionalNotes: string
}

const emptyForm: FormValues = {
  title: '',
  channel: '',
  type: '',
  audiences: [],
  deliveryType: 'send-now',
  priority: 'medium',
  scheduledAt: '',
  subject: '',
  messageContent: '',
  additionalNotes: '',
}

const inputClass = 'ui-input'
const selectClass = 'ui-input appearance-none cursor-pointer [color-scheme:dark]'
const labelClass = 'text-body-sm text-muted mb-1.5 block'

const CHANNEL_VALUES = new Set(['in-app', 'email', 'push'])
const AUDIENCE_VALUES = new Set([
  'all-users',
  'experts',
  'venue-partners',
  'members',
  'admins',
  'custom-segment',
  'expert-management',
  'service-management',
  'venue-management',
  'all-partners',
])

const parsePartnerIds = (raw: string | null) =>
  (raw ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)

export function CommunicationForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit') ?? ''
  const isEditMode = Boolean(editId)

  const prefillChannelRaw = searchParams.get('channel') ?? ''
  const prefillAudienceRaw = searchParams.get('audience') ?? ''
  const prefillPartnerIds = parsePartnerIds(searchParams.get('partnerIds'))
  const prefillChannel = CHANNEL_VALUES.has(prefillChannelRaw)
    ? (prefillChannelRaw as CommunicationChannel)
    : ''
  const prefillAudience = AUDIENCE_VALUES.has(prefillAudienceRaw)
    ? [prefillAudienceRaw as CommunicationAudience]
    : prefillPartnerIds.length
      ? (['experts'] as CommunicationAudience[])
      : []

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
          {getApiErrorMessage(existingQuery.error, 'Failed to load communication for editing.')}
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
          audiences: parseCommunicationAudiences(item.audience),
          deliveryType: item.deliveryType ?? 'send-now',
          priority: item.priority ?? 'medium',
          scheduledAt: toDateTimeLocalValue(item.scheduledAt),
          subject: item.subject ?? '',
          messageContent: item.messageContent ?? '',
          additionalNotes: item.additionalNotes ?? '',
        }
      : {
          ...emptyForm,
          channel: prefillChannel,
          audiences: prefillAudience,
        }

  // Remount when switching create/edit / prefill so form state resets without setState-in-effect
  const formKey =
    editId ||
    `create-${prefillChannel}-${prefillAudience.join(',') || 'all'}-${prefillPartnerIds.join(',') || 'all'}`

  return (
    <CommunicationFormFields
      key={formKey}
      initialValues={initialValues}
      isEditMode={isEditMode}
      editId={editId}
      partnerIds={isEditMode ? (item?.partnerIds ?? []) : prefillPartnerIds}
      audiences={optionsQuery.data?.audiences}
      channels={optionsQuery.data?.channels}
      types={optionsQuery.data?.types}
      priorities={optionsQuery.data?.priorities}
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
  partnerIds?: string[]
  audiences?: typeof COMMUNICATION_AUDIENCE_OPTIONS
  channels?: typeof COMMUNICATION_CHANNEL_OPTIONS
  types?: typeof COMMUNICATION_TYPE_OPTIONS
  priorities?: typeof COMMUNICATION_PRIORITY_OPTIONS
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
  partnerIds = [],
  audiences: audienceChoices,
  channels,
  types,
  priorities,
  isSubmitting,
  onCreate,
  onUpdate,
}: CommunicationFormFieldsProps) {
  const navigate = useNavigate()
  const hasTargetedRecipients = partnerIds.length > 0

  const [title, setTitle] = useState(initialValues.title)
  const [channel, setChannel] = useState<CommunicationChannel | ''>(initialValues.channel)
  const [type, setType] = useState<CommunicationType | ''>(initialValues.type)
  const [selectedAudiences, setSelectedAudiences] = useState<CommunicationAudience[]>(
    initialValues.audiences,
  )
  const [deliveryType, setDeliveryType] = useState<CommunicationDeliveryType>(
    initialValues.deliveryType,
  )
  const [priority, setPriority] = useState<CommunicationPriority>(initialValues.priority)
  const [scheduledAt, setScheduledAt] = useState(initialValues.scheduledAt)
  const [subject, setSubject] = useState(initialValues.subject)
  const [messageContent, setMessageContent] = useState(initialValues.messageContent)
  const [additionalNotes, setAdditionalNotes] = useState(initialValues.additionalNotes)
  const [audienceOpen, setAudienceOpen] = useState(false)
  const audienceRef = useRef<HTMLDivElement>(null)
  const minScheduleAt = toDateTimeLocalValue(new Date(Date.now() + 60_000).toISOString())

  const audienceOptions = useMemo(() => {
    const resolved = audienceChoices?.length ? audienceChoices : COMMUNICATION_AUDIENCE_OPTIONS
    const options = [...resolved]
    for (const value of selectedAudiences) {
      if (value && !options.some((opt) => opt.value === value)) {
        options.push({ value, label: value })
      }
    }
    return options
  }, [audienceChoices, selectedAudiences])

  useEffect(() => {
    if (!audienceOpen) return

    const onPointerDown = (event: MouseEvent) => {
      if (!audienceRef.current?.contains(event.target as Node)) {
        setAudienceOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAudienceOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [audienceOpen])

  const toggleAudience = (value: CommunicationAudience | '') => {
    if (!value || hasTargetedRecipients) return
    setSelectedAudiences((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    )
  }

  const removeAudience = (value: CommunicationAudience) => {
    if (hasTargetedRecipients) return
    setSelectedAudiences((prev) => prev.filter((item) => item !== value))
  }

  const channelOptions = useMemo(() => channels ?? COMMUNICATION_CHANNEL_OPTIONS, [channels])
  const typeOptions = useMemo(() => types ?? COMMUNICATION_TYPE_OPTIONS, [types])
  const priorityOptions = useMemo(() => priorities ?? COMMUNICATION_PRIORITY_OPTIONS, [priorities])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim() || !channel || !type || !selectedAudiences.length || !messageContent.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (channel === 'email' && !subject.trim()) {
      toast.error('Subject line is required for email')
      return
    }

    if (deliveryType === 'schedule') {
      const scheduledDate = scheduledAt ? new Date(scheduledAt) : null
      if (!scheduledDate || Number.isNaN(scheduledDate.getTime())) {
        toast.error('Please select a date and time for scheduling')
        return
      }
      if (scheduledDate.getTime() <= Date.now()) {
        toast.error('Scheduled date and time must be in the future')
        return
      }
    }

    const payload: CreateCommunicationPayload = {
      title: title.trim(),
      channel,
      type,
      audience: selectedAudiences.length === 1 ? selectedAudiences[0] : selectedAudiences,
      deliveryType,
      priority,
      scheduledAt:
        deliveryType === 'schedule' && scheduledAt ? new Date(scheduledAt).toISOString() : null,
      subject: subject.trim(),
      messageContent: messageContent.trim(),
      additionalNotes: additionalNotes.trim(),
      ...(hasTargetedRecipients ? { partnerIds } : {}),
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
            Communication
          </button>
          <span> / </span>
          <span className="text-brand-text font-semibold">
            {isEditMode ? 'Edit Communication' : 'Create Communication'}
          </span>
        </p>
      </div>

      <div className="bg-brand-surface w-full overflow-visible rounded-[10px] border border-white/[0.06] p-5 sm:p-6">
        <div className="mb-6 border-b border-white/[0.06] pb-5">
          <h2 className="text-h4 text-brand-text">
            {isEditMode ? 'Edit Communication' : 'Create New Communication Template'}
          </h2>
          <p className="text-body-sm text-muted mt-1">
            Send updates, announcements, or important messages to your audience.
          </p>
          {hasTargetedRecipients ? (
            <p className="text-body-sm mt-3 rounded-lg border border-[#e0a263]/40 bg-[#e0a263]/10 px-3 py-2 text-[#f6cb86]">
              Targeting {partnerIds.length} selected expert
              {partnerIds.length === 1 ? '' : 's'} only. This will not send to the full audience.
            </p>
          ) : null}
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
            <label className={labelClass}>Priority</label>
            <select
              className={selectClass}
              value={priority}
              onChange={(e) => setPriority(e.target.value as CommunicationPriority)}
            >
              {priorityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Audience</label>
            <div className="relative" ref={audienceRef}>
              <div
                className={cn(
                  inputClass,
                  'flex !h-auto min-h-[var(--brand-input-height,42px)] w-full items-center gap-1.5 py-1.5 pr-9 text-left',
                  hasTargetedRecipients ? 'cursor-not-allowed opacity-80' : 'cursor-pointer',
                )}
                onClick={() => {
                  if (hasTargetedRecipients) return
                  setAudienceOpen((open) => !open)
                }}
                onKeyDown={(event) => {
                  if (hasTargetedRecipients) return
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setAudienceOpen((open) => !open)
                  }
                }}
                role="combobox"
                tabIndex={hasTargetedRecipients ? -1 : 0}
                aria-haspopup="listbox"
                aria-expanded={audienceOpen}
                aria-multiselectable="true"
                aria-label="Select audience"
              >
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                  {hasTargetedRecipients ? (
                    <span
                      className="text-body-sm-semibold inline-flex h-[26px] items-center gap-2 rounded-full px-3 text-black"
                      style={{ background: 'linear-gradient(135deg, #F6CB86 0%, #E0A263 100%)' }}
                    >
                      {`${partnerIds.length} selected expert${partnerIds.length === 1 ? '' : 's'}`}
                    </span>
                  ) : selectedAudiences.length ? (
                    selectedAudiences.map((value) => (
                      <span
                        key={value}
                        className="text-body-sm-semibold inline-flex h-[26px] items-center gap-2 rounded-full px-3 text-black"
                        style={{ background: 'linear-gradient(135deg, #F6CB86 0%, #E0A263 100%)' }}
                      >
                        {audienceOptions.find((opt) => opt.value === value)?.label ?? value}
                        <button
                          type="button"
                          aria-label={`Remove ${value}`}
                          onClick={(event) => {
                            event.stopPropagation()
                            removeAudience(value)
                          }}
                          className="opacity-70 hover:opacity-100"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-muted text-sm">Select audience</span>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    'pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-white transition-transform',
                    audienceOpen && 'rotate-180',
                  )}
                />
              </div>

              {audienceOpen && !hasTargetedRecipients ? (
                <div
                  role="listbox"
                  aria-multiselectable="true"
                  className="absolute top-[calc(100%+6px)] right-0 left-0 z-50 max-h-60 overflow-y-auto rounded-[8px] border border-white/10 bg-[#050505] py-1 shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
                >
                  {audienceOptions.map((opt) => {
                    const value = opt.value as CommunicationAudience
                    const selected = selectedAudiences.includes(value)
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={cn(
                          'flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm',
                          selected
                            ? 'text-brand-accent bg-white/5'
                            : 'text-brand-text hover:text-brand-accent hover:bg-white/10',
                        )}
                        onClick={(event) => {
                          event.stopPropagation()
                          toggleAudience(value)
                        }}
                      >
                        {opt.label}
                        {selected ? <Check className="size-4 shrink-0" /> : null}
                      </button>
                    )
                  })}
                </div>
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
                    name="deliveryType"
                    value="send-now"
                    checked={deliveryType === 'send-now'}
                    onChange={() => {
                      setDeliveryType('send-now')
                      setScheduledAt('')
                    }}
                    className="accent-white"
                  />
                  Send Now
                </label>
                <label className="text-body-sm text-brand-text flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="schedule"
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
                  <div className="relative">
                    <input
                      type="datetime-local"
                      className={cn(
                        inputClass,
                        'relative cursor-pointer pr-10 [color-scheme:dark]',
                        '[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0',
                      )}
                      value={scheduledAt}
                      min={minScheduleAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      required={deliveryType === 'schedule'}
                    />
                    <CalendarDays className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-white" />
                  </div>
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
            <input
              type="text"
              placeholder="Enter Message"
              className={inputClass}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              required
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
