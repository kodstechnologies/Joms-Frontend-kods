import { ArrowLeft, Calendar, TrendingUp, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

const analyticsMetrics = [
  { label: 'Sent', value: '20' },
  { label: 'Delivered', value: '20' },
  { label: 'Opened', value: '20' },
  { label: 'Clicked', value: '20' },
  { label: 'Failed', value: '20' },
  { label: 'Bounced', value: '20' },
]

export function CommunicationDetails() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-4 pb-8 md:gap-6">
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-text transition-colors hover:text-brand-accent"
        >
          <ArrowLeft className="size-4" />
          Communication Management
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
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-2xl font-semibold text-brand-text">Order Confirmation (Copy)</h2>
            <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-brand-muted">
              <div className="flex items-center gap-2">
                <User className="size-4" />
                System Auto
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-4" />
                Not Scheduled
              </div>
            </div>
          </div>

          <span className="rounded-full border border-brand-success/25 bg-brand-success/10 px-4 py-1.5 text-sm font-semibold text-brand-success">
            Sent
          </span>
        </div>

        <div className="mt-6 rounded-brand-lg border border-white/10 bg-[#0F0F0F] px-6 py-5 sm:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <p className="text-xs text-brand-muted">Type</p>
              <p className="mt-2 text-sm font-medium text-brand-text">Email</p>
            </div>
            <div>
              <p className="text-xs text-brand-muted">Audience</p>
              <p className="mt-2 text-sm font-medium text-brand-text">User</p>
            </div>
            <div>
              <p className="text-xs text-brand-muted">Channel</p>
              <p className="mt-2 text-sm font-medium text-brand-text">Transaction</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="mb-3 text-sm font-semibold text-brand-text">Message Content</h3>
          <div className="rounded-brand-lg border border-white/10 bg-[#0F0F0F] px-5 py-4">
            <p className="text-sm leading-6 text-brand-text">
              Thank you for your order! Your order #45678 has been confirmed and is being processed.
            </p>
          </div>
        </div>

        <div className="my-8 border-t border-white/10" />

        <h3 className="mb-5 text-sm font-semibold text-brand-text">Delivery Analytics</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {analyticsMetrics.map((item) => (
            <div
              key={item.label}
              className={cn(
                uiTokens.radiusCard,
                uiTokens.borderSubtle,
                'bg-[#0F0F0F] p-5',
              )}
            >
              <p className="text-xs font-semibold tracking-wide text-brand-muted">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-brand-text">{item.value}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-brand-success/25 bg-brand-success/10 px-2 py-0.5 text-[11px] font-semibold text-brand-success">
                  <TrendingUp className="size-3" />
                  6.7%
                </span>
                <span className="text-xs text-brand-muted">vs last month</span>
              </div>
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
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Close
          </Button>
          <Button type="button" onClick={() => navigate('/communication/create')}>
            Edit Communication
          </Button>
        </div>
      </section>
    </div>
  )
}
