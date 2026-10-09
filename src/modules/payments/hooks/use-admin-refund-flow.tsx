import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/shared/lib/api-error'
import { initiateFinanceRefund } from '../api/finance-api'
import { IssueRefundModal } from '../components/issue-refund-modal'

export type AdminRefundTarget = {
  paymentId: string
  amount: number
  currency?: string | null
  reason: string
  refundRequested: boolean
}

const formatAmount = (value: number, currency?: string | null) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 2,
  }).format(value)

export function useAdminRefundFlow({ onRefunded }: { onRefunded?: () => void } = {}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [target, setTarget] = useState<AdminRefundTarget | null>(null)

  const openRefund = useCallback((next: AdminRefundTarget) => {
    if (!next.refundRequested) {
      toast.error(
        'The client has not requested a refund for this booking. A refund can be processed only after the client raises a refund request or dispute.',
      )
      return
    }
    if (!next.paymentId.trim()) {
      toast.error('Payment ID is missing. Cannot process refund.')
      return
    }
    setTarget(next)
  }, [])

  const close = useCallback(() => setTarget(null), [])

  const maxRefundable = Math.max(0, Number(target?.amount) || 0)

  const refundModal = (
    <IssueRefundModal
      open={Boolean(target)}
      originalAmount={formatAmount(maxRefundable, target?.currency)}
      maxRefundableAmount={maxRefundable}
      defaultAmount={maxRefundable > 0 ? String(maxRefundable) : undefined}
      onClose={close}
      onSubmit={async ({ refundAmount, reason, adminNotes }) => {
        if (!target) return
        try {
          const response = await initiateFinanceRefund({
            paymentId: target.paymentId,
            amount: Number(String(refundAmount).replace(/,/g, '')),
            reason: reason || target.reason,
            adminNotes,
          })
          toast.success('Refund issued')
          setTarget(null)
          void queryClient.invalidateQueries({ queryKey: ['finance-refunds'] })
          onRefunded?.()
          const refundId = String(
            response?.data?.refund?._id || response?.data?.refund?.refundId || '',
          ).trim()
          if (refundId) navigate(`/finance/refunds/${encodeURIComponent(refundId)}`)
        } catch (error) {
          toast.error(getApiErrorMessage(error, 'Failed to refund payment'))
          throw error
        }
      }}
    />
  )

  return { openRefund, refundModal }
}
