import { ArrowLeft, Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { fetchExpertPayoutDetail } from '../../api/expert-api'
import type { PayoutItem } from '../../type/payout'

export function ExpertPayoutDetailPage() {
  const params = useParams<{ expertId?: string; payoutId?: string }>()
  const navigate = useNavigate()

  const resolvedPayoutId = params.payoutId || params.expertId || 'payout-01'
  const resolvedExpertId = params.payoutId ? params.expertId || 'EX001' : 'EX001'

  const [payout, setPayout] = useState<PayoutItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [prevKey, setPrevKey] = useState(`${resolvedExpertId}-${resolvedPayoutId}`)

  const currentKey = `${resolvedExpertId}-${resolvedPayoutId}`

  if (currentKey !== prevKey) {
    setPrevKey(currentKey)
    setLoading(true)
    setError(null)
  }

  useEffect(() => {
    fetchExpertPayoutDetail(resolvedExpertId, resolvedPayoutId)
      .then((data) => {
        const item = data?.data?.item || data?.data || data?.item || data
        if (item && (item.id || item.payoutId || item.bookingId)) {
          setPayout(item as PayoutItem)
        } else {
          setError('Payout record details not found.')
        }
      })
      .catch((err) => {
        console.error('Failed to load expert payout details:', err)
        setError('Failed to load payout details from server.')
      })
      .finally(() => setLoading(false))
  }, [resolvedExpertId, resolvedPayoutId])

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center text-sm text-slate-400">
        Loading payout details...
      </div>
    )
  }

  if (error || !payout) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/experts/management')}
          className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Expert Management</span>
        </button>
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6 text-center text-rose-400">
          <p>{error || 'Payout details not found.'}</p>
          <Button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/experts/management')}
            className="mt-4 bg-white/10 text-xs font-semibold text-white hover:bg-white/20"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const isCustomMilestone = payout.serviceType === 'Custom' || Boolean(payout.milestones?.length)
  const displayId =
    payout.consultationId ||
    payout.serviceId ||
    payout.milestoneId ||
    payout.itemId ||
    payout.payoutId ||
    '—'
  const serviceTitle = payout.serviceTitle || 'Payout Details'

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 text-white sm:p-6 lg:p-8">
      {/* Header Bar */}
      <div className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/experts/management')}
            className="group flex items-center gap-2 text-xl font-bold text-white transition-colors hover:text-[#E5B54E]"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>
              {serviceTitle} | {displayId}
            </span>
          </button>
          <p className="mt-1 text-xs text-slate-400">
            Expert Management / Payout Details / Payout History / {serviceTitle}
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="space-y-6 rounded-2xl border border-white/10 bg-[#16191D] p-6 shadow-xl">
        {/* Booking Details Header & Download Action */}
        <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Booking Details</h2>
            <p className="text-xs text-slate-400">
              Provide details about your{' '}
              {payout.serviceType === 'Consultation' ? 'Consultation' : 'Service'}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => toast.success('Invoice download started')}
            className="flex h-auto w-fit items-center gap-2 rounded-lg bg-[#E5B54E] px-4 py-2.5 text-xs font-semibold text-black shadow-md hover:bg-[#d4a53d]"
          >
            <Download className="size-4" />
            <span>Download Invoice</span>
          </Button>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column: Booking Information */}
          <div className="space-y-3 rounded-xl border border-white/10 bg-[#1A1D21] p-5">
            <h3 className="mb-3 text-sm font-bold text-white">Booking Information</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Booking ID</span>
                <span className="font-semibold text-slate-200">{payout.bookingId || '—'}</span>
              </div>

              {payout.serviceType === 'Consultation' ? (
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Consultation ID</span>
                  <span className="font-semibold text-slate-200">{displayId}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Service ID</span>
                  <span className="font-semibold text-slate-200">{displayId}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Client Name</span>
                <span className="font-semibold text-slate-200">{payout.clientName || '—'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Client ID</span>
                <span className="font-semibold text-slate-200">{payout.clientId || '—'}</span>
              </div>

              {isCustomMilestone ? (
                <>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Milestone Start Date</span>
                    <span className="font-semibold text-slate-200">
                      {payout.milestoneStartDate || '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Milestone End Date</span>
                    <span className="font-semibold text-slate-200">
                      {payout.milestoneEndDate || '—'}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Consultation Date</span>
                    <span className="font-semibold text-slate-200">
                      {payout.consultationDate || '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Consultation Fee</span>
                    <span className="font-semibold text-slate-200">
                      ₹{(Number(payout.consultationFee) || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Payment Method</span>
                <span className="font-semibold text-slate-200">{payout.paymentMethod || '—'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Transaction ID</span>
                <span className="font-semibold text-slate-200">{payout.transactionId || '—'}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Payment Status</span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                  {payout.paymentStatus || 'Successful'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Expert Details & Payout Details */}
          <div className="space-y-5 rounded-xl border border-white/10 bg-[#1A1D21] p-5">
            {/* Expert Details */}
            <div>
              <h3 className="mb-3 text-sm font-bold text-white">Expert Details</h3>
              <div className="space-y-3 border-b border-white/10 pb-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Expert Name</span>
                  <span className="font-semibold text-slate-200">{payout.expertName || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Expert ID</span>
                  <span className="font-semibold text-slate-200">{payout.expertId || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Service Category</span>
                  <span className="cursor-pointer font-semibold text-slate-200 underline hover:text-amber-400">
                    {payout.serviceCategory || 'Legal'}
                  </span>
                </div>
              </div>
            </div>

            {/* Payout Details */}
            <div>
              <h3 className="mb-3 text-sm font-bold text-white">Payout Details</h3>
              <div className="space-y-3 text-xs">
                {isCustomMilestone ? (
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Total Milestone Fee</span>
                    <span className="font-semibold text-slate-200">
                      ₹{(Number(payout.totalMilestoneFee) || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Consultation Fee</span>
                      <span className="font-semibold text-slate-200">
                        ₹{(Number(payout.consultationFee) || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Platform Fee (20%)</span>
                      <span className="font-semibold text-slate-200">
                        ₹{(Number(payout.platformFee) || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Tax (18% GST)</span>
                      <span className="font-semibold text-slate-200">
                        ₹{(Number(payout.taxAmount) || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="font-semibold text-slate-400">Final Payout Amount</span>
                      <span className="font-bold text-emerald-400">
                        ₹{(Number(payout.finalPayoutAmount) || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Payout ID</span>
                  <span className="font-semibold text-slate-200">
                    {payout.payoutIdFull || payout.payoutId || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Credited On</span>
                  <span className="font-semibold text-slate-200">
                    {payout.creditedOnFull || payout.creditedOn || payout.payoutDate || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">Payout Status</span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                    {payout.payoutStatus || payout.status || 'Successful'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Milestone Breakdown Section (If Custom / Milestone) */}
        {isCustomMilestone && payout.milestones && payout.milestones.length > 0 && (
          <div className="space-y-4 border-t border-white/10 pt-4">
            <h3 className="text-base font-bold text-white">Milestone Breakdown</h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {payout.milestones.map((m) => (
                <div
                  key={m.id}
                  className="space-y-4 rounded-xl border border-white/10 bg-[#1A1D21] p-5 shadow-sm"
                >
                  <h4 className="border-b border-white/10 pb-2 text-sm font-bold text-white">
                    {m.title}
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                      <span className="text-slate-400">Client Paid</span>
                      <span className="font-semibold text-slate-200">
                        ₹{(Number(m.clientPaid) || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                      <span className="text-slate-400">Platform Commission (20%)</span>
                      <span className="font-semibold text-slate-200">
                        ₹{(Number(m.platformCommission) || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                      <span className="text-slate-400">Tax (18% GST)</span>
                      <span className="font-semibold text-slate-200">
                        ₹{(Number(m.taxAmount) || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                      <span className="font-semibold text-slate-400">Final Payout Amount</span>
                      <span className="font-bold text-emerald-400">
                        ₹{(Number(m.finalPayoutAmount) || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                      <span className="text-slate-400">Start Date</span>
                      <span className="font-semibold text-slate-200">{m.startDate || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between pb-1.5">
                      <span className="text-slate-400">End Date</span>
                      <span className="font-semibold text-slate-200">{m.endDate || '—'}</span>
                    </div>
                  </div>

                  {/* Payment Timeline */}
                  {m.paymentTimeline && (
                    <div className="mt-3 border-t border-white/10 pt-3">
                      <h5 className="mb-2 text-xs font-bold text-white">Payment Timeline</h5>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Milestone Funded</span>
                          <span className="font-medium text-slate-300">
                            {m.paymentTimeline.milestoneFunded || '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Milestone Approved by User</span>
                          <span className="font-medium text-slate-300">
                            {m.paymentTimeline.milestoneApprovedByUser || '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Payout released to Expert</span>
                          <span className="font-medium text-slate-300">
                            {m.paymentTimeline.payoutReleasedToExpert || '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Milestone Completed</span>
                          <span className="font-medium text-slate-300">
                            {m.paymentTimeline.milestoneCompleted || '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
