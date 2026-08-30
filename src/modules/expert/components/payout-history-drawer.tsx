import { X, ArrowLeft, CalendarDays, User } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { statusBadgeClass } from '../utils/payout-status'
import { fetchExpertPayoutHistory } from '../api/expert-api'
import type { PayoutItem } from '../type/payout'

export type { PayoutItem }

interface PayoutHistoryDrawerProps {
  isOpen: boolean
  onClose: () => void
  expertId: string
  expertName?: string
}

export function PayoutHistoryDrawer({ isOpen, onClose, expertId }: PayoutHistoryDrawerProps) {
  const navigate = useNavigate()
  const toastedErrorRef = useRef<string | null>(null)

  const {
    data,
    isLoading: loading,
    isError,
    error,
  } = useQuery({
    queryKey: ['expert-payout-history', expertId],
    queryFn: () => fetchExpertPayoutHistory(expertId),
    enabled: Boolean(isOpen && expertId),
  })

  useEffect(() => {
    if (!isOpen || !isError) return
    const message = getApiErrorMessage(error) || 'Failed to load payout history'
    if (toastedErrorRef.current === message) return
    toastedErrorRef.current = message
    toast.error(message)
  }, [isOpen, isError, error])

  useEffect(() => {
    if (!isError) toastedErrorRef.current = null
  }, [isError])

  const payoutItems = data?.data?.items || data?.items || []
  const items: PayoutItem[] = Array.isArray(payoutItems) ? payoutItems : []

  if (!isOpen) return null

  const handleViewDetails = (item: PayoutItem) => {
    onClose()
    const targetId = encodeURIComponent(item.id || item.payoutId || '')
    const targetExpertId = encodeURIComponent(expertId || item.expertId || '')
    if (!targetId || !targetExpertId) {
      toast.error('Payout reference is missing.')
      return
    }
    navigate(`/experts/management/payouts/${targetExpertId}/${targetId}`)
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-white/10 bg-[#121417] text-white shadow-2xl transition-transform duration-300">
        <div className="flex items-start justify-between border-b border-white/10 p-5">
          <div>
            <button
              type="button"
              onClick={onClose}
              className="group flex items-center gap-2 text-lg font-bold text-white transition-colors hover:text-[#E5B54E]"
            >
              <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
              <span>Payout History</span>
            </button>
            <p className="mt-1 text-xs text-slate-400">
              Payments released to this expert from finance escrow / direct payouts
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`payout-skeleton-${index}`}
                className="rounded-xl border border-white/10 bg-[#1A1D21] p-5"
              >
                <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
                <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-white/5" />
                <div className="mt-2 h-3 w-2/5 animate-pulse rounded bg-white/5" />
                <div className="mt-5 h-16 animate-pulse rounded-lg bg-white/5" />
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <p>No payout records found for this expert.</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id || item.payoutId || `payout-${index}`}
                className="rounded-xl border border-white/10 bg-[#1A1D21] p-5 shadow-sm transition-all hover:border-white/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-white">
                    {item.serviceTitle || 'Payout'}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusBadgeClass(item.status)}`}
                  >
                    {item.status || 'Scheduled'}
                  </span>
                </div>

                <div className="mt-2 space-y-1 text-xs text-slate-400">
                  <p>
                    <span className="text-slate-500">Service Type:</span>{' '}
                    <span className="font-medium text-slate-200">{item.serviceType || '—'}</span>
                  </p>
                  {item.serviceType === 'Consultation' && (
                    <>
                      <p>
                        <span className="text-slate-500">Consultation ID:</span>{' '}
                        <span className="font-medium text-slate-200">
                          {item.consultationId || item.itemId || '—'}
                        </span>
                      </p>
                      <p>
                        <span className="text-slate-500">Consultation Date:</span>{' '}
                        <span className="font-medium text-slate-200">
                          {item.consultationDate || '—'}
                        </span>
                      </p>
                    </>
                  )}
                  {(item.serviceType === 'Fixed' || item.serviceType === 'Tiered') && (
                    <>
                      <p>
                        <span className="text-slate-500">Service ID:</span>{' '}
                        <span className="font-medium text-slate-200">
                          {item.serviceId || item.itemId || '—'}
                        </span>
                      </p>
                      <p>
                        <span className="text-slate-500">Service Start Date:</span>{' '}
                        <span className="font-medium text-slate-200">
                          {item.serviceStartDate || '—'}
                        </span>
                      </p>
                      <p>
                        <span className="text-slate-500">Service End Date:</span>{' '}
                        <span className="font-medium text-slate-200">
                          {item.serviceEndDate || '—'}
                        </span>
                      </p>
                    </>
                  )}
                  {item.serviceType === 'Custom' && (
                    <>
                      <p>
                        <span className="text-slate-500">Milestone ID:</span>{' '}
                        <span className="font-medium text-slate-200">
                          {item.milestoneId || item.itemId || '—'}
                        </span>
                      </p>
                      <p>
                        <span className="text-slate-500">Milestone Start Date:</span>{' '}
                        <span className="font-medium text-slate-200">
                          {item.milestoneStartDate || '—'}
                        </span>
                      </p>
                      <p>
                        <span className="text-slate-500">Milestone End Date:</span>{' '}
                        <span className="font-medium text-slate-200">
                          {item.milestoneEndDate || '—'}
                        </span>
                      </p>
                      <p>
                        <span className="text-slate-500">Milestone Completed:</span>{' '}
                        <span className="font-medium text-slate-200">
                          {item.milestoneCompleted || '—'}
                        </span>
                      </p>
                    </>
                  )}
                </div>

                <div className="mt-4 border-t border-dashed border-white/10 pt-3">
                  <h4 className="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                    Payout Details
                  </h4>
                  <div className="flex items-end justify-between">
                    <div className="space-y-1 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <User className="size-3.5 text-slate-400" />
                        <span>Payout to Expert:</span>
                        <span className="font-semibold text-white">
                          ₹{(Number(item.payoutToExpert) || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="size-3.5 text-slate-400" />
                        <span>Payout ID:</span>
                        <span className="font-semibold text-white">{item.payoutId || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="size-3.5 text-slate-400" />
                        <span>Payout Date:</span>
                        <span className="font-semibold text-white">{item.payoutDate || '—'}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleViewDetails(item)}
                      className="h-auto rounded-lg bg-[#E5B54E] px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-[#d4a53d]"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
