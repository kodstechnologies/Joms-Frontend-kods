import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

const fieldClassName = 'h-11 border-white/10 bg-[#0F0F0F] text-brand-text placeholder:text-brand-muted'

export function CommunicationForm() {
  const navigate = useNavigate()
  const [deliveryType, setDeliveryType] = useState<'sendNow' | 'schedule'>('sendNow')

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-text transition-colors hover:text-brand-accent"
        >
          <ArrowLeft className="size-4" />
          Create Communication
        </button>

        <p className="text-sm text-brand-muted">
          Communication management /
          <span className="ml-1 font-medium text-brand-text">Create Communication</span>
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
          <h2 className="text-lg font-semibold text-brand-text">Create New Communication Template</h2>
          <p className="mt-1 text-sm text-brand-muted">
            Send updates, announcements, or important messages to your audience.
          </p>
        </div>

        <div className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-text">
              Communication Title (internal use only)
            </label>
            <Input
              type="text"
              placeholder="Enter communication Title"
              className={fieldClassName}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-brand-text">Channel Type</label>
              <select
                className={cn(
                  'flex h-11 w-full border px-3 text-sm text-brand-text outline-none',
                  uiTokens.radiusSoft,
                  uiTokens.focusRing,
                  fieldClassName,
                )}
                defaultValue="In App Notification"
              >
                <option>In App Notification</option>
                <option>Email</option>
                <option>Push Notification</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-brand-text">
                Communication Type
              </label>
              <select
                className={cn(
                  'flex h-11 w-full border px-3 text-sm text-brand-text outline-none',
                  uiTokens.radiusSoft,
                  uiTokens.focusRing,
                  fieldClassName,
                )}
                defaultValue=""
              >
                <option value="">Select</option>
                <option>Transactional</option>
                <option>Marketing</option>
                <option>Announcement</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-text">Audience</label>
            <Input type="text" placeholder="Enter Audience Type" className={fieldClassName} />
          </div>

          <div
            className={cn(
              'grid gap-5',
              deliveryType === 'schedule' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1',
            )}
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-brand-text">Set Time & Date</label>
              <div className="mt-2 flex flex-wrap items-center gap-6">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-text">
                  <input
                    type="radio"
                    checked={deliveryType === 'sendNow'}
                    onChange={() => setDeliveryType('sendNow')}
                    className="accent-brand-accent"
                  />
                  Send Now
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-text">
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
                <label className="mb-2 flex items-center gap-1 text-sm font-medium text-brand-text">
                  Add Date & Time
                  <span className="group relative cursor-help text-xs text-brand-muted">ⓘ</span>
                  <span className="sr-only">Time Format: 24 Hours</span>
                </label>
                <Input
                  type="datetime-local"
                  className={fieldClassName}
                  placeholder="dd-mm-yyyy, --:--"
                />
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-text">Subject Line</label>
            <Input type="text" placeholder="Enter Message" className={fieldClassName} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-text">Message Content</label>
            <textarea
              rows={4}
              placeholder="Enter Message"
              className={cn(
                'min-h-[96px] w-full resize-y border px-3 py-2.5 text-sm text-brand-text outline-none placeholder:text-brand-muted',
                uiTokens.radiusSoft,
                uiTokens.focusRing,
                fieldClassName,
              )}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-text">Additional Notes</label>
            <Input type="text" placeholder="Enter Message" className={fieldClassName} />
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
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Close
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </section>
    </div>
  )
}
