import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, Flag, History, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  completeAdminEscalation,
  fetchAdminEscalation,
  startAdminEscalationReview,
} from '@/modules/my-tasks/api/escalation-api'
import { DenyRefundModal } from '@/modules/payments/components/deny-refund-modal'
import { IssuePartialRefundModal } from '@/modules/payments/components/issue-partial-refund-modal'
import { IssueRefundModal } from '@/modules/payments/components/issue-refund-modal'
import {
  useFinanceRefund,
  useIssueRefund,
  useRejectRefund,
} from '@/modules/payments/hooks/use-finance'
import {
  formatDate,
  formatInr,
  mapRefundStatus,
  titleCase,
  apiErrorMessage,
} from '@/modules/payments/utils/finance-mappers'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

export function RefundDetails() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id = '' } = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useFinanceRefund(id)
  const escalationQuery = useQuery({
    queryKey: ['admin-escalation', 'refund', id],
    queryFn: () => fetchAdminEscalation('refund', id),
    enabled: Boolean(id),
  })
  const issueMutation = useIssueRefund()
  const rejectMutation = useRejectRefund()
  const refund = data?.data
  const escalation = escalationQuery.data?.data

  const [isIssueOpen, setIsIssueOpen] = useState(false)
  const [isDenyOpen, setIsDenyOpen] = useState(false)
  const [isPartialOpen, setIsPartialOpen] = useState(false)

  useEffect(() => {
    if (!id || !escalation || escalation.escalationStatus !== 'assigned') return
    void startAdminEscalationReview('refund', id).then(() => {
      void queryClient.invalidateQueries({ queryKey: ['admin-escalation', 'refund', id] })
      void queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
      void queryClient.invalidateQueries({ queryKey: ['all-escalations'] })
    })
  }, [escalation, id, queryClient])

  const finishEscalation = async (decision: string, decisionNote?: string) => {
    try {
      await completeAdminEscalation('refund', id, { decision, decisionNote })
    } catch {
      // Refund action already succeeded; escalation complete is best-effort
    }
    void queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
    void queryClient.invalidateQueries({ queryKey: ['all-escalations'] })
    void queryClient.invalidateQueries({ queryKey: ['admin-escalation', 'refund', id] })
  }

  if (isLoading) {
    return <p className="text-body-sm text-muted mx-20 py-8">Loading refund details...</p>
  }

  if (isError || !refund) {
    return (
      <div className="mx-20 flex flex-col gap-4 pb-8">
        <p className="text-body-sm text-brand-danger">Refund not found.</p>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/my-tasks')}
          className="ui-cta ui-cta-secondary w-fit"
        >
          Back to My Tasks
        </button>
      </div>
    )
  }

  const canAct =
    (refund.status === 'initiated' || refund.status === 'failed') &&
    escalation?.escalationStatus !== 'completed'
  const amountLabel = formatInr(refund.amount)
  const statusLabel = mapRefundStatus(refund.status)
  const escalatedBy = escalation?.escalatedByName || 'Admin'

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
          <p className="text-body-md text-muted mt-2">
            Review and take action on this escalated refund.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
          <div className="bg-brand-bg self-start rounded-xl p-5">
            <h3 className="text-body-md-semibold text-brand-text mb-6">Refund Information</h3>
            <div className="space-y-7">
              <div className="flex items-center justify-between gap-4">
                <span className="text-body-md text-muted">Refund ID</span>
                <span className="text-body-md text-brand-text">{refund.refundId}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-body-md text-muted">Transaction ID</span>
                <span className="text-body-md text-brand-text">
                  {String(refund.paymentId || '—')}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-body-md text-muted">Requested Date</span>
                <span className="text-body-md text-brand-text">{formatDate(refund.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-body-md text-muted">Status</span>
                <span className="text-body-sm-semibold bg-brand-accent/15 text-brand-accent rounded-full px-3 py-1">
                  {statusLabel}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-body-md text-muted">Escalated By</span>
                <div className="flex items-center gap-2">
                  <span className="text-body-md-medium text-brand-text underline">
                    {escalatedBy}
                  </span>
                  <span className="text-body-sm-semibold bg-brand-accent inline-flex items-center rounded-full px-2.5 py-0.5 text-black">
                    Admin
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-bg flex flex-col rounded-xl p-5">
            <h3 className="text-body-md-semibold text-brand-text mb-6">Payment Context</h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-body-md text-muted">Requested By</span>
                <span className="text-body-md text-brand-text">
                  {titleCase(refund.beneficiary) || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-body-md text-muted">Service</span>
                <span className="text-body-md text-brand-text text-right">
                  {titleCase(refund.module) || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-body-md text-muted">Refund Amount</span>
                <span className="text-body-md-semibold text-brand-text">{amountLabel}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-body-md text-muted">Payment Method</span>
                <span className="text-body-md text-brand-text">{refund.refundMode || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="bg-brand-bg rounded-xl p-5">
            <h3 className="text-body-md-semibold text-brand-text mb-4 flex items-center gap-2">
              <History className="h-4 w-4" />
              Reason
            </h3>
            <div className="radius-md bg-brand-surface p-4">
              <p className="text-body-md text-brand-text">{refund.reason || '—'}</p>
            </div>
          </div>
          <div className="bg-brand-bg rounded-xl p-5">
            <h3 className="text-body-md-semibold text-brand-text mb-4 flex items-center gap-2">
              <History className="h-4 w-4" />
              Admin Notes
            </h3>
            <div className="radius-md bg-brand-surface p-4">
              <p className="text-body-md text-brand-text leading-6">
                {escalation?.escalationNote || refund.adminNote || '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="radius-lg bg-brand-surface border border-white/10 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/my-tasks')}
            className="ui-cta ui-cta-secondary px-5"
          >
            Close
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!canAct || issueMutation.isPending}
              onClick={() => setIsIssueOpen(true)}
              className="ui-cta ui-cta-positive inline-flex items-center gap-2 px-5 disabled:opacity-50"
            >
              Issue Refund
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                <Check className="h-3 w-3" />
              </span>
            </button>
            <button
              type="button"
              disabled={!canAct || rejectMutation.isPending}
              onClick={() => setIsDenyOpen(true)}
              className="ui-cta ui-cta-negative inline-flex items-center gap-2 px-5 disabled:opacity-50"
            >
              Deny Refund
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                <X className="h-3 w-3" />
              </span>
            </button>
            <button
              type="button"
              disabled={!canAct || issueMutation.isPending}
              onClick={() => setIsPartialOpen(true)}
              className="ui-cta ui-cta-secondary bg-brand-bg hover:bg-brand-surface inline-flex items-center gap-2 px-5 disabled:opacity-50"
            >
              Partial Refund
              <Flag className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <IssueRefundModal
        open={isIssueOpen}
        originalAmount={amountLabel}
        maxRefundableAmount={refund.amount}
        onClose={() => setIsIssueOpen(false)}
        onSubmit={async ({ refundAmount, reason, adminNotes }) => {
          try {
            await issueMutation.mutateAsync({
              id,
              amount: Number(refundAmount.replace(/,/g, '')),
              reason,
              adminNotes,
            })
            await finishEscalation('issued', adminNotes || reason)
            toast.success('Refund issued')
            setIsIssueOpen(false)
            void refetch()
            navigate('/my-tasks')
          } catch (err) {
            toast.error(apiErrorMessage(err, 'Failed to issue refund'))
            throw err
          }
        }}
      />
      <DenyRefundModal
        open={isDenyOpen}
        originalAmount={amountLabel}
        onClose={() => setIsDenyOpen(false)}
        onSubmit={async ({ reason, adminNotes }) => {
          try {
            await rejectMutation.mutateAsync({ id, reason, adminNotes })
            await finishEscalation('rejected', adminNotes || reason)
            toast.success('Refund denied')
            setIsDenyOpen(false)
            void refetch()
            navigate('/my-tasks')
          } catch (err) {
            toast.error(apiErrorMessage(err, 'Failed to deny refund'))
            throw err
          }
        }}
      />
      <IssuePartialRefundModal
        open={isPartialOpen}
        originalAmount={amountLabel}
        maxRefundableAmount={refund.amount}
        onClose={() => setIsPartialOpen(false)}
        onSubmit={async ({ refundAmount, reason, adminNotes }) => {
          try {
            await issueMutation.mutateAsync({
              id,
              amount: Number(refundAmount.replace(/,/g, '')),
              reason,
              adminNotes,
            })
            await finishEscalation('partial', adminNotes || reason)
            toast.success('Partial refund issued')
            setIsPartialOpen(false)
            void refetch()
            navigate('/my-tasks')
          } catch (err) {
            toast.error(apiErrorMessage(err, 'Failed to issue partial refund'))
            throw err
          }
        }}
      />
    </div>
  )
}
