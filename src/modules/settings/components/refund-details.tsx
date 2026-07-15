import { useNavigate } from 'react-router-dom'
import { ArrowLeft, History, Check, X, Flag } from 'lucide-react'

export function RefundDetails() {
  const navigate = useNavigate()

  return (
    <div className="mx-20 flex flex-col gap-5 pb-8">
      <div>
        <div className="mb-4 -ml-10 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md p-1 text-white transition hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <h1 className="text-[28px] leading-none font-semibold text-white">Refund</h1>
        </div>

        <p className="-ml-10 text-sm text-slate-400">
          My Tasks /<span className="ml-1 font-medium text-white">Refund Approvals</span>
        </p>
      </div>

      <div className="rounded-xl border border-[#242424] bg-[#171717] px-6 py-6">
        <div className="border-b border-[#2A2A2A] pb-5">
          <h2 className="text-xl font-semibold text-white">Refund Details</h2>

          <p className="mt-2 text-sm text-slate-400">Provide details about your consultation</p>
        </div>

        <div className="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
          <div className="self-start rounded-xl bg-black p-5">
            <h3 className="mb-6 text-sm font-semibold text-white">Refund Information</h3>

            <div className="space-y-7">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Refund ID</span>

                <span className="text-sm text-white">PAY-2026-00045</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Transaction ID</span>

                <span className="text-sm text-white">TXN-987654321</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Requested Date</span>

                <span className="text-sm text-white">2026-01-12</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Status</span>

                <span className="rounded-full bg-[#4F3B12] px-3 py-1 text-xs font-semibold text-[#F6C978]">
                  Pending
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Escalated By</span>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white underline">John Doe</span>

                  <span className="inline-flex items-center rounded-full bg-[#F6C978] px-2.5 py-0.5 text-[10px] leading-4 font-semibold text-black">
                    Admin
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-xl bg-black p-5">
            <h3 className="mb-6 text-sm font-semibold text-white">Refund Information</h3>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Requested By</span>

                <span className="text-sm text-white">Rajesh Kumar</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Service</span>

                <span className="text-right text-sm text-white">
                  Financial Planning Consultation
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Refund Amount</span>

                <span className="text-sm font-semibold text-white">₹15,000</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Payment Method</span>

                <span className="text-sm text-white">UPI</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="mt-6 rounded-xl bg-black p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
              <History className="h-4 w-4" />
              Reason
            </h3>

            <div className="rounded-lg bg-[#171717] p-4">
              <p className="text-sm text-white">Service not delivered as promised</p>
            </div>
          </div>

          <div className="-mt-16 h-40 rounded-xl bg-black p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
              <History className="h-4 w-4" />
              Admin Notes
            </h3>

            <div className="rounded-lg bg-[#171717] p-4">
              <p className="text-sm leading-6 text-white">
                Client claims expert did not show up for scheduled consultation.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#242424] bg-[#171717] px-5 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('')}
            className="rounded-lg border border-[#444] px-5 py-2 text-sm text-white transition hover:border-[#F0C27B]"
          >
            Close
          </button>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg bg-[#16A34A] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#15803D]">
              Issue Refund
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                <Check className="h-3 w-3" />
              </span>
            </button>

            <button className="flex items-center gap-2 rounded-lg bg-[#DC2626] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#B91C1C]">
              Deny Refund
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                <X className="h-3 w-3" />
              </span>
            </button>

            <button className="flex items-center gap-2 rounded-lg bg-[#0F0F0F] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#1A1A1A]">
              Partial Refund
              <Flag className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
