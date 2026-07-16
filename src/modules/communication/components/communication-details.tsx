import { ArrowLeft, Calendar, TrendingUp, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
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
          onClick={() => navigateBackOrFallback(navigate, '/communication/management')}
          className="text-brand-text hover:text-brand-accent mb-3 flex items-center gap-2 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="size-4" />
          Communication Management
        </button>

        <p className="text-brand-muted text-sm">
          Communication management /
          <span className="text-brand-text ml-1 font-medium">Create Communication</span>
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
            <h2 className="text-brand-text text-2xl font-semibold">Order Confirmation (Copy)</h2>
            <div className="text-brand-muted mt-4 flex flex-wrap items-center gap-6 text-sm">
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

          <span className="border-brand-success/25 bg-brand-success/10 text-brand-success rounded-full border px-4 py-1.5 text-sm font-semibold">
            Sent
          </span>
        </div>

        <div className="rounded-brand-lg mt-6 border border-white/10 bg-[#0F0F0F] px-6 py-5 sm:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <p className="text-brand-muted text-xs">Type</p>
              <p className="text-brand-text mt-2 text-sm font-medium">Email</p>
            </div>
            <div>
              <p className="text-brand-muted text-xs">Audience</p>
              <p className="text-brand-text mt-2 text-sm font-medium">User</p>
            </div>
            <div>
              <p className="text-brand-muted text-xs">Channel</p>
              <p className="text-brand-text mt-2 text-sm font-medium">Transaction</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-brand-text mb-3 text-sm font-semibold">Message Content</h3>
          <div className="rounded-brand-lg border border-white/10 bg-[#0F0F0F] px-5 py-4">
            <p className="text-brand-text text-sm leading-6">
              Thank you for your order! Your order #45678 has been confirmed and is being processed.
            </p>
          </div>
        </div>

        <div className="my-8 border-t border-white/10" />

        <h3 className="text-brand-text mb-5 text-sm font-semibold">Delivery Analytics</h3>

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
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="border-brand-success/25 bg-brand-success/10 text-brand-success inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold">
                  <TrendingUp className="size-3" />
                  6.7%
                </span>
                <span className="text-brand-muted text-xs">vs last month</span>
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
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigateBackOrFallback(navigate, '/communication/management')}
          >
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
