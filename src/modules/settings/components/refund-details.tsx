import { useNavigate } from 'react-router-dom'
import { ArrowLeft, History, Check, X, Flag } from 'lucide-react'

import { navigateBackOrFallback } from '@/shared/lib/navigation'

export function RefundDetails() {
  const navigate = useNavigate()

  return (
    <div className="mx-20 flex flex-col gap-5 pb-8">
      <div>
        <div className="mb-4 -ml-10 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/my-tasks')}
            className="text-brand-text rounded-md p-1 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <h1 className="text-h2 text-brand-text leading-none font-semibold">Refund</h1>
        </div>

        <p className="text-body-md text-muted -ml-10">
          My Tasks /
          <span className="text-body-md-medium text-brand-text ml-1">Refund Approvals</span>
        </p>
      </div>

      <div className="radius-lg bg-brand-surface border border-white/10 px-6 py-6">
        <div className="border-b border-white/10 pb-5">
          <h2 className="text-h3 text-brand-text">Refund Details</h2>

          <p className="text-body-md text-muted mt-2">Provide details about your consultation</p>
        </div>

        <div className="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
          <div className="bg-brand-bg self-start rounded-xl p-5">
            <h3 className="text-body-md-semibold text-brand-text mb-6">Refund Information</h3>

            <div className="space-y-7">
              <div className="flex items-center justify-between">
                <span className="text-body-md text-muted">Refund ID</span>

                <span className="text-body-md text-brand-text">PAY-2026-00045</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body-md text-muted">Transaction ID</span>

                <span className="text-body-md text-brand-text">TXN-987654321</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body-md text-muted">Requested Date</span>

                <span className="text-body-md text-brand-text">2026-01-12</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body-md text-muted">Status</span>

                <span className="text-body-sm-semibold bg-brand-accent/15 text-brand-accent rounded-full px-3 py-1">
                  Pending
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body-md text-muted">Escalated By</span>

                <div className="flex items-center gap-2">
                  <span className="text-body-md-medium text-brand-text underline">John Doe</span>

                  <span className="text-body-sm-semibold bg-brand-accent inline-flex items-center rounded-full px-2.5 py-0.5 text-black">
                    Admin
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-bg flex flex-col rounded-xl p-5">
            <h3 className="text-body-md-semibold text-brand-text mb-6">Refund Information</h3>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-body-md text-muted">Requested By</span>

                <span className="text-body-md text-brand-text">Rajesh Kumar</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body-md text-muted">Service</span>

                <span className="text-body-md text-brand-text text-right">
                  Financial Planning Consultation
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body-md text-muted">Refund Amount</span>

                <span className="text-body-md-semibold text-brand-text">₹15,000</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body-md text-muted">Payment Method</span>

                <span className="text-body-md text-brand-text">UPI</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="bg-brand-bg mt-6 rounded-xl p-5">
            <h3 className="text-body-md-semibold text-brand-text mb-4 flex items-center gap-2">
              <History className="h-4 w-4" />
              Reason
            </h3>

            <div className="radius-md bg-brand-surface p-4">
              <p className="text-body-md text-brand-text">Service not delivered as promised</p>
            </div>
          </div>

          <div className="bg-brand-bg -mt-16 h-40 rounded-xl p-5">
            <h3 className="text-body-md-semibold text-brand-text mb-4 flex items-center gap-2">
              <History className="h-4 w-4" />
              Admin Notes
            </h3>

            <div className="radius-md bg-brand-surface p-4">
              <p className="text-body-md text-brand-text leading-6">
                Client claims expert did not show up for scheduled consultation.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="radius-lg bg-brand-surface border border-white/10 px-5 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('')} className="ui-cta ui-cta-secondary px-5">
            Close
          </button>

          <div className="flex items-center gap-3">
            <button className="ui-cta ui-cta-positive inline-flex items-center gap-2 px-5">
              Issue Refund
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                <Check className="h-3 w-3" />
              </span>
            </button>

            <button className="ui-cta ui-cta-negative inline-flex items-center gap-2 px-5">
              Deny Refund
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                <X className="h-3 w-3" />
              </span>
            </button>

            <button className="ui-cta ui-cta-secondary bg-brand-bg hover:bg-brand-surface inline-flex items-center gap-2 px-5">
              Partial Refund
              <Flag className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
