import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, ExternalLink, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  approveMembershipUpgradeEscalation,
  denyMembershipUpgradeEscalation,
  fetchAdminEscalation,
  startAdminEscalationReview,
} from '@/modules/my-tasks/api/escalation-api'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { apiErrorMessage } from '@/modules/payments/utils/finance-mappers'

export function MembershipUpgradeDetails() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id = '' } = useParams<{ id: string }>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const escalationQuery = useQuery({
    queryKey: ['admin-escalation', 'membership_upgrade', id],
    queryFn: () => fetchAdminEscalation('membership_upgrade', id),
    enabled: Boolean(id),
  })

  const escalation = escalationQuery.data?.data
  const metadata = useMemo(
    () => (escalation?.metadata || {}) as Record<string, unknown>,
    [escalation?.metadata],
  )
  const changeType = String(metadata.changeType || 'upgrade').toLowerCase()
  const isDowngrade = changeType === 'downgrade'
  const isExtend = changeType === 'extend'
  const actionLabel = isExtend ? 'Extend' : isDowngrade ? 'Downgrade' : 'Upgrade'

  const formatEndDate = (value: unknown) => {
    if (!value) return '—'
    const date = new Date(String(value))
    if (Number.isNaN(date.getTime())) return String(value)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  useEffect(() => {
    if (!id || !escalation || escalation.escalationStatus !== 'assigned') return
    void startAdminEscalationReview('membership_upgrade', id).then(() => {
      void queryClient.invalidateQueries({
        queryKey: ['admin-escalation', 'membership_upgrade', id],
      })
      void queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
      void queryClient.invalidateQueries({ queryKey: ['all-escalations'] })
    })
  }, [escalation, id, queryClient])

  if (escalationQuery.isLoading) {
    return (
      <p className="mx-20 py-8 text-sm text-slate-400">
        Loading {actionLabel.toLowerCase()} details...
      </p>
    )
  }

  if (!escalation) {
    return (
      <div className="mx-20 flex flex-col gap-4 pb-8">
        <p className="text-sm text-red-400">
          Membership {actionLabel.toLowerCase()} escalation not found.
        </p>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/my-tasks')}
          className="w-fit rounded-lg border border-[#444] px-5 py-2 text-sm text-white"
        >
          Back to My Tasks
        </button>
      </div>
    )
  }

  const canAct = escalation.escalationStatus !== 'completed'
  const username = String(metadata.username || escalation.entityTitle || '—')
  const partnerId = String(metadata.partnerId || escalation.partnerId || '')
  const sourceApp = String(metadata.sourceApp || 'User App')
  const currentPlan = String(metadata.currentPlanName || '—')
  const targetPlan = String(metadata.newPlanName || '—')
  const requestedEndDate = formatEndDate(metadata.endDate)
  const currentExpiresAt = formatEndDate(metadata.currentExpiresAt)
  const reasons = Array.isArray(metadata.reasons)
    ? (metadata.reasons as string[]).join(', ')
    : String(metadata.reasons || escalation.escalationNote || '—')
  const adminNote = String(
    metadata.adminNotes || escalation.escalationNote || escalation.decisionNote || '—',
  )

  const handleApprove = async () => {
    setIsSubmitting(true)
    try {
      await approveMembershipUpgradeEscalation(id, {
        decisionNote: `Approved via My Tasks`,
      })
      void queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
      void queryClient.invalidateQueries({ queryKey: ['all-escalations'] })
      toast.success(`Membership ${actionLabel.toLowerCase()} approved`)
      navigate('/my-tasks')
    } catch (err) {
      toast.error(apiErrorMessage(err, `Failed to approve ${actionLabel.toLowerCase()}`))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeny = async () => {
    setIsSubmitting(true)
    try {
      await denyMembershipUpgradeEscalation(id, {
        decisionNote: `Denied via My Tasks`,
      })
      void queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
      void queryClient.invalidateQueries({ queryKey: ['all-escalations'] })
      toast.success(`Membership ${actionLabel.toLowerCase()} denied`)
      navigate('/my-tasks')
    } catch (err) {
      toast.error(apiErrorMessage(err, `Failed to deny ${actionLabel.toLowerCase()}`))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-20 flex flex-col gap-5 pb-8">
      <div>
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/my-tasks')}
          className="mb-3 flex items-center gap-2 text-sm text-white transition hover:text-[#F0C27B]"
        >
          <ArrowLeft className="-ml-10 h-4 w-4" />
          Membership {actionLabel}
        </button>
        <p className="ml-10 text-sm text-slate-400">
          My Tasks /<span className="ml-1 font-medium text-white">Membership {actionLabel}</span>
        </p>
      </div>

      <div className="rounded-xl border border-[#242424] bg-[#171717] px-6 py-6">
        <div className="border-b border-[#2A2A2A] pb-5">
          <h2 className="text-xl font-semibold text-white">{actionLabel} Details</h2>
          <p className="mt-2 text-sm text-slate-400">Verify and approve the below details.</p>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-slate-400">Username</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-medium text-white">{username}</span>
                {partnerId ? (
                  <Link to={`/experts/management/profile/${partnerId}`}>
                    <ExternalLink className="h-4 w-4 text-white" />
                  </Link>
                ) : (
                  <ExternalLink className="h-4 w-4 text-white/40" />
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-400">Source App</p>
              <p className="mt-2 text-sm font-medium text-white">{sourceApp}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Current Plan</p>
              <p className="mt-2 text-sm font-medium text-white">{currentPlan}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">
                {isExtend
                  ? 'Requested End Date'
                  : isDowngrade
                    ? 'Downgrading Plan'
                    : 'Upgrading Plan'}
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                {isExtend ? requestedEndDate : targetPlan}
              </p>
            </div>
          </div>

          {isExtend ? (
            <div className="mt-8">
              <p className="text-sm text-slate-400">Current Expiry</p>
              <p className="mt-2 text-sm font-medium text-white">{currentExpiresAt}</p>
            </div>
          ) : null}

          <div className="mt-8">
            <p className="text-sm text-slate-400">Escalated by</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm font-medium text-white underline">
                {escalation.escalatedByName || 'Admin'}
              </span>
              <ExternalLink className="h-4 w-4 text-white" />
              <span className="inline-flex items-center rounded-full bg-[#F6C978] px-2.5 py-0.5 text-[10px] leading-4 font-semibold text-black">
                Admin
              </span>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm text-slate-400">Reason for {actionLabel}</p>
            <p className="mt-3 text-sm leading-7 text-white">{reasons || '—'}</p>
          </div>

          <div className="mt-8">
            <p className="text-sm text-slate-400">Admin Note</p>
            <p className="mt-3 text-sm leading-7 text-white">{adminNote || '—'}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#242424] bg-[#171717] px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/my-tasks')}
            className="rounded-lg border border-[#444] px-5 py-2 text-sm text-white transition hover:border-[#F0C27B]"
          >
            Close
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!canAct || isSubmitting}
              onClick={() => void handleApprove()}
              className="flex items-center gap-2 rounded-lg bg-[#16A34A] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#15803D] disabled:opacity-50"
            >
              Approve
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                <Check className="h-3 w-3" />
              </span>
            </button>
            <button
              type="button"
              disabled={!canAct || isSubmitting}
              onClick={() => void handleDeny()}
              className="flex items-center gap-2 rounded-lg bg-[#DC2626] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#B91C1C] disabled:opacity-50"
            >
              Deny {actionLabel}
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                <X className="h-3 w-3" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
