import { useState, type FormEvent } from 'react'
import { ChevronDown, Send } from 'lucide-react'
import { toast } from 'sonner'

import {
  COMMUNICATION_TYPE_OPTIONS,
  type Communication,
  type CommunicationType,
} from '../api/communication-api'
import { useCreateCommunication } from '../hooks/use-communications'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { cn } from '@/shared/lib/cn'

const inputClass = 'ui-input'
const selectClass = 'ui-input appearance-none cursor-pointer'
const labelClass = 'text-body-sm text-muted mb-1.5 block'

export function PushAllPartnersPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<CommunicationType>('announcement')
  const [messageContent, setMessageContent] = useState('')
  const [result, setResult] = useState<Communication | null>(null)

  const createMutation = useCreateCommunication()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!title.trim() || !messageContent.trim()) {
      toast.error('Title and message are required')
      return
    }

    try {
      const created = await createMutation.mutateAsync({
        title: title.trim(),
        channel: 'push',
        type,
        audience: 'all-partners',
        deliveryType: 'send-now',
        messageContent: messageContent.trim(),
      })

      setResult(created)

      if (created.analytics.sent > 0) {
        toast.success(`Push delivered to ${created.analytics.sent} device(s)`)
        setTitle('')
        setMessageContent('')
      } else {
        toast.error(created.deliveryMeta.note || 'Push was not delivered to any device')
      }
    } catch (error) {
      setResult(null)
      toast.error(getApiErrorMessage(error))
    }
  }

  const isSending = createMutation.isPending

  return (
    <div className="bg-brand-surface w-full rounded-[10px] border border-white/[0.06]">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left sm:px-6"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/10 bg-black">
            <Send className="size-4 text-white/60" strokeWidth={1.75} />
          </span>
          <span className="min-w-0">
            <span className="text-body-md-semibold text-brand-text block">
              Send push notification to all partners
            </span>
            <span className="text-body-sm text-muted block">
              Delivers instantly to every partner device registered for push.
            </span>
          </span>
        </span>
        <ChevronDown
          className={cn('icon-sm text-muted shrink-0 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen ? (
        <form onSubmit={handleSubmit} className="space-y-5 border-t border-white/[0.06] p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_240px]">
            <div>
              <label className={labelClass}>Notification title</label>
              <input
                type="text"
                placeholder="Enter the title partners will see"
                className={inputClass}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={160}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select
                className={selectClass}
                value={type}
                onChange={(event) => setType(event.target.value as CommunicationType)}
              >
                {COMMUNICATION_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Message</label>
            <textarea
              rows={3}
              placeholder="Enter the message body"
              className="ui-textarea"
              value={messageContent}
              onChange={(event) => setMessageContent(event.target.value)}
              maxLength={5000}
              required
            />
          </div>

          {result ? (
            <div
              className={cn(
                'rounded-lg border px-4 py-3',
                result.analytics.sent > 0
                  ? 'border-brand-positive/25 bg-brand-positive/10'
                  : 'border-brand-danger/25 bg-brand-danger/10',
              )}
            >
              <p className="text-body-sm-semibold text-brand-text">
                {result.messageId} · {result.statusLabel} · delivered {result.analytics.sent},
                failed {result.analytics.failed}
              </p>
              <p className="text-body-sm text-muted mt-1">{result.deliveryMeta.note}</p>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <p className="text-body-sm text-muted">
              Audience <span className="text-brand-text">All Partners</span> · sent immediately
            </p>
            <button type="submit" disabled={isSending} className="ui-cta ui-cta-primary">
              {isSending ? 'Sending...' : 'Send push now'}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  )
}
