import { ArrowLeft, Download, X } from 'lucide-react'
import { toast } from 'sonner'
import { useBranding } from '@/app/providers/use-branding'
import { PageBreadcrumb } from '@/shared/components/navigation/page-breadcrumb'
import { Button } from '@/shared/components/ui/button'
import type { PayoutItem } from '@/modules/expert/type/payout'
import { downloadInvoiceDocument, invoiceFromPayout } from '@/shared/utils/invoice-document'
import { statusBadgeClass } from '../utils/payout-status'
import { getApiErrorMessage } from '@/shared/lib/api-error'

interface ExpertPayoutDetailModalProps {
  isOpen: boolean
  onClose: () => void
  payout: PayoutItem
}

export function ExpertPayoutDetailModal({ isOpen, onClose, payout }: ExpertPayoutDetailModalProps) {
  const { logoUrl } = useBranding()

  if (!isOpen || !payout) return null

  const isCustomMilestone = payout.serviceType === 'Custom' || Boolean(payout.milestones?.length)
  const displayId =
    payout.consultationId || payout.serviceId || payout.milestoneId || payout.itemId || 'CN001'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-xs sm:p-6">
      <div className="relative my-8 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#121417] text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#16191D] px-6 py-4">
          <div>
            <button
              type="button"
              onClick={onClose}
              className="group flex items-center gap-2 text-lg font-bold text-white transition-colors hover:text-[#E5B54E]"
            >
              <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
              <span>
                {payout.serviceTitle} | {displayId}
              </span>
            </button>
            <PageBreadcrumb
              className="mt-1"
              items={[
                { label: 'Expert Management', to: '/experts/management' },
                { label: 'Payout Details', to: '/experts/management' },
                { label: 'Payout History', to: '/experts/management' },
                { label: payout.serviceTitle, isActive: true },
              ]}
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="space-y-6 rounded-xl border border-white/10 bg-[#16191D] p-6">
            <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
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
                  void downloadInvoiceDocument(
                    invoiceFromPayout(payout, { logoUrl }),
                    payout.payoutId,
                  )
                    .then(() => toast.success('Invoice downloaded'))
                    .catch((error) =>
                      toast.error(getApiErrorMessage(error, 'Failed to download invoice')),
                    )
                }}
                className="flex h-auto w-fit items-center gap-2 rounded-lg bg-[#E5B54E] px-4 py-2 text-xs font-semibold text-black hover:bg-[#d4a53d]"
              >
                <Download className="size-4" />
                <span>Download Invoice</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-3 rounded-xl border border-white/10 bg-[#1A1D21] p-5">
                <h3 className="mb-3 text-sm font-bold text-white">Booking Information</h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Booking ID</span>
                    <span className="font-semibold text-slate-200">
                      {payout.bookingId || 'BK-2045'}
                    </span>
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
                    <span className="font-semibold text-slate-200">{payout.clientName}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Client ID</span>
                    <span className="font-semibold text-slate-200">{payout.clientId}</span>
                  </div>

                  {isCustomMilestone ? (
                    <>
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Milestone Start Date</span>
                        <span className="font-semibold text-slate-200">
                          {payout.milestoneStartDate || '10 Feb 2026'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Milestone End Date</span>
                        <span className="font-semibold text-slate-200">
                          {payout.milestoneEndDate || '10 Feb 2026'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Consultation Date</span>
                        <span className="font-semibold text-slate-200">
                          {payout.consultationDate || '10 Feb 2026'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Consultation Fee</span>
                        <span className="font-semibold text-slate-200">
                          ₹{(payout.consultationFee || 3000).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Payment Method</span>
                    <span className="font-semibold text-slate-200">{payout.paymentMethod}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Transaction ID</span>
                    <span className="font-semibold text-slate-200">{payout.transactionId}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400">Payment Status</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusBadgeClass(payout.paymentStatus)}`}
                    >
                      {payout.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-white/10 bg-[#1A1D21] p-5">
                <div>
                  <h3 className="mb-3 text-sm font-bold text-white">Expert Details</h3>
                  <div className="space-y-2.5 border-b border-white/10 pb-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Expert Name</span>
                      <span className="font-semibold text-slate-200">{payout.expertName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Expert ID</span>
                      <span className="font-semibold text-slate-200">{payout.expertId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Service Category</span>
                      <span className="cursor-pointer font-semibold text-slate-200 underline">
                        {payout.serviceCategory}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-bold text-white">Payout Details</h3>
                  <div className="space-y-2.5 text-xs">
                    {isCustomMilestone ? (
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Total Milestone Fee</span>
                        <span className="font-semibold text-slate-200">
                          ₹{(payout.totalMilestoneFee || 3000).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">Consultation Fee</span>
                          <span className="font-semibold text-slate-200">
                            ₹{(payout.consultationFee || 3000).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">Platform Fee (20%)</span>
                          <span className="font-semibold text-slate-200">
                            ₹{(payout.platformFee || 600).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">Tax (18% GST)</span>
                          <span className="font-semibold text-slate-200">
                            ₹{(payout.taxAmount || 150).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="font-semibold text-slate-400">Final Payout Amount</span>
                          <span className="font-bold text-emerald-400">
                            ₹{(payout.finalPayoutAmount || 2400).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Payout ID</span>
                      <span className="font-semibold text-slate-200">
                        {payout.payoutIdFull || payout.payoutId || 'PAY-3098'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Credited On</span>
                      <span className="font-semibold text-slate-200">
                        {payout.creditedOnFull || payout.creditedOn || '15 Feb 2026'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-400">Payout Status</span>
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                        {payout.payoutStatus}
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
                      className="space-y-4 rounded-xl border border-white/10 bg-[#1A1D21] p-5"
                    >
                      <h4 className="border-b border-white/10 pb-2 text-sm font-bold text-white">
                        {m.title}
                      </h4>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                          <span className="text-slate-400">Client Paid</span>
                          <span className="font-semibold text-slate-200">
                            ₹{m.clientPaid?.toLocaleString('en-IN') ?? 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                          <span className="text-slate-400">Platform Commission (20%)</span>
                          <span className="font-semibold text-slate-200">
                            ₹{m.platformCommission?.toLocaleString('en-IN') ?? 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                          <span className="text-slate-400">Tax (18% GST)</span>
                          <span className="font-semibold text-slate-200">
                            ₹{m.taxAmount?.toLocaleString('en-IN') ?? 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                          <span className="font-semibold text-slate-400">Final Payout Amount</span>
                          <span className="font-bold text-emerald-400">
                            ₹{m.finalPayoutAmount?.toLocaleString('en-IN') ?? 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                          <span className="text-slate-400">Start Date</span>
                          <span className="font-semibold text-slate-200">{m.startDate}</span>
                        </div>
                        <div className="flex items-center justify-between pb-1.5">
                          <span className="text-slate-400">End Date</span>
                          <span className="font-semibold text-slate-200">{m.endDate}</span>
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
      </div>
    </div>
  )
}
