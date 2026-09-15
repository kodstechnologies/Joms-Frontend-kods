import { ArrowLeft, Download } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import { useBranding } from '@/app/providers/use-branding'
import { PageBreadcrumb } from '@/shared/components/navigation/page-breadcrumb'
import { Button } from '@/shared/components/ui/button'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { downloadInvoiceDocument, invoiceFromPayout } from '@/shared/utils/invoice-document'
import { statusBadgeClass } from '../../utils/payout-status'
import { fetchExpertPayoutDetail } from '../../api/expert-api'
import type { PayoutItem } from '../../type/payout'

function extractPayoutItem(data: unknown): PayoutItem | null {
  const raw = data as Record<string, unknown> | null
  const nested = raw?.data as Record<string, unknown> | PayoutItem | undefined
  const item =
    (nested && typeof nested === 'object' && 'item' in nested
      ? (nested.item as PayoutItem)
      : (nested as PayoutItem | undefined)) ||
    (raw?.item as PayoutItem | undefined) ||
    (raw as PayoutItem | null)
  if (item && (item.id || item.payoutId || item.bookingId)) {
    return item
  }
  return null
}

export function ExpertPayoutDetailPage() {
  const params = useParams<{ expertId?: string; payoutId?: string }>()
  const navigate = useNavigate()
  const { logoUrl } = useBranding()

  const resolvedPayoutId = params.payoutId || params.expertId || ''
  const resolvedExpertId = params.payoutId ? params.expertId || '' : ''
  const idsReady = Boolean(resolvedExpertId && resolvedPayoutId)

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['expert-payout-detail', resolvedExpertId, resolvedPayoutId],
    queryFn: () => fetchExpertPayoutDetail(resolvedExpertId, resolvedPayoutId),
    enabled: idsReady,
  })

  const payout = useMemo(() => (data ? extractPayoutItem(data) : null), [data])

  const error = !idsReady
    ? 'Payout reference is missing.'
    : isError
      ? 'Failed to load payout details from server.'
      : data && !payout
        ? 'Payout record details not found.'
        : null

  const loading = idsReady && (isLoading || (isFetching && !payout && !error))

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="h-8 w-72 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-96 animate-pulse rounded bg-white/5" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-xl bg-white/5" />
          <div className="h-80 animate-pulse rounded-xl bg-white/5" />
        </div>
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
  const isConsultation = payout.serviceType === 'Consultation'
  const displayId =
    payout.consultationId ||
    payout.serviceId ||
    payout.milestoneId ||
    payout.itemId ||
    payout.payoutId ||
    '—'
  const serviceTitle = payout.serviceTitle || 'Payout Details'
  const platformFeeLabel =
    payout.platformFeePercent != null && Number(payout.platformFeePercent) > 0
      ? `Platform Fee (${Number(payout.platformFeePercent)}%)`
      : 'Platform Fee'
  const feeLabel = isConsultation
    ? 'Consultation Fee'
    : isCustomMilestone
      ? 'Total Milestone Fee'
      : 'Service Fee'

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 text-white sm:p-6 lg:p-8">
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
          <PageBreadcrumb
            className="mt-1"
            items={[
              { label: 'Expert Management', to: '/experts/management' },
              {
                label: 'Payout Details',
                to: resolvedExpertId
                  ? `/experts/management/profile/${resolvedExpertId}`
                  : '/experts/management',
              },
              {
                label: 'Payout History',
                to: resolvedExpertId
                  ? `/experts/management/profile/${resolvedExpertId}`
                  : '/experts/management',
              },
              { label: serviceTitle, isActive: true },
            ]}
          />
        </div>
      </div>

      <div className="space-y-6 rounded-2xl border border-white/10 bg-[#16191D] p-6 shadow-xl">
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
            onClick={() => {
              void downloadInvoiceDocument(invoiceFromPayout(payout, { logoUrl }), payout.payoutId)
                .then(() => toast.success('Invoice downloaded'))
                .catch((error) =>
                  toast.error(getApiErrorMessage(error, 'Failed to download invoice')),
                )
            }}
            className="flex h-auto w-fit items-center gap-2 rounded-lg bg-[#E5B54E] px-4 py-2.5 text-xs font-semibold text-black shadow-md hover:bg-[#d4a53d]"
          >
            <Download className="size-4" />
            <span>Download Invoice</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-white/10 bg-[#1A1D21] p-5">
            <h3 className="mb-3 text-sm font-bold text-white">Booking Information</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Booking ID</span>
                <span className="font-semibold text-slate-200">{payout.bookingId || '—'}</span>
              </div>

              {isConsultation ? (
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
              ) : isConsultation ? (
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
              ) : (
                <>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Service Start Date</span>
                    <span className="font-semibold text-slate-200">
                      {payout.serviceStartDate || '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Service End Date</span>
                    <span className="font-semibold text-slate-200">
                      {payout.serviceEndDate || '—'}
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
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusBadgeClass(payout.paymentStatus)}`}
                >
                  {payout.paymentStatus || '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-5 rounded-xl border border-white/10 bg-[#1A1D21] p-5">
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
                  <span className="font-semibold text-slate-200">
                    {payout.serviceCategory || '—'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold text-white">Payout Details</h3>
              <div className="space-y-3 text-xs">
                {isCustomMilestone ? (
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Total Milestone Fee</span>
                    <span className="font-semibold text-slate-200">
                      ₹
                      {(
                        Number(payout.totalMilestoneFee ?? payout.consultationFee) || 0
                      ).toLocaleString('en-IN')}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">{feeLabel}</span>
                      <span className="font-semibold text-slate-200">
                        ₹{(Number(payout.consultationFee) || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">{platformFeeLabel}</span>
                      <span className="font-semibold text-slate-200">
                        ₹{(Number(payout.platformFee) || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Tax (GST)</span>
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
                    {payout.payoutStatus || payout.status || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                      <span className="text-slate-400">Platform Commission</span>
                      <span className="font-semibold text-slate-200">
                        ₹{(Number(m.platformCommission) || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                      <span className="text-slate-400">Tax (GST)</span>
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
