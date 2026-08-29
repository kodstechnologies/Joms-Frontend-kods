import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { toast } from 'sonner'

import {
  escalateMembershipUpgradeApplication,
  fetchEscalationAssignees,
} from '@/modules/my-tasks/api/escalation-api'
import { useMemberships } from '@/modules/memberships/hooks/use-memberships'
import type { MembershipSubscription } from '@/modules/memberships/types/membership-subscription'
import { RequiredMark } from '@/shared/components/form/required-mark'
import { cn } from '@/shared/lib/cn'

type Props = {
  open: boolean
  subscription: MembershipSubscription | null
  onClose: () => void
}

export function EscalateMembershipUpgradeModal({ open, subscription, onClose }: Props) {
  const queryClient = useQueryClient()
  const { data: plansData } = useMemberships({ type: 'expert', status: 'active', limit: 100 })

  const assigneesQuery = useQuery({
    queryKey: ['escalation-assignees', 'memberships.*'],
    queryFn: () => fetchEscalationAssignees('memberships.*'),
    enabled: open,
  })
  const fallbackAssigneesQuery = useQuery({
    queryKey: ['escalation-assignees', 'experts.*', 'membership-escalate'],
    queryFn: () => fetchEscalationAssignees('experts.*'),
    enabled: open && !assigneesQuery.isLoading && !(assigneesQuery.data?.data || []).length,
  })

  const assignees = useMemo(() => {
    const primary = assigneesQuery.data?.data || []
    if (primary.length) return primary
    return fallbackAssigneesQuery.data?.data || []
  }, [assigneesQuery.data?.data, fallbackAssigneesQuery.data?.data])

  const currentPlanId =
    typeof subscription?.membershipPlanId === 'string'
      ? subscription.membershipPlanId
      : subscription?.membershipPlanId?._id

  const upgradePlans = useMemo(
    () => (plansData?.data?.memberships || []).filter((plan) => plan._id !== currentPlanId),
    [plansData?.data?.memberships, currentPlanId],
  )

  const [planId, setPlanId] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [reason, setReason] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!open || !subscription) return null

  const selectedPlan = upgradePlans.find((plan) => plan._id === planId)
  const selectedAssignee = assignees.find((item) => item.id === assigneeId) || assignees[0]

  const handleSubmit = async () => {
    if (!planId) {
      toast.error('Select the upgrading plan')
      return
    }
    if (!selectedAssignee?.id) {
      toast.error('Select a sub-admin assignee')
      return
    }
    if (!adminNote.trim()) {
      toast.error('Admin note is required')
      return
    }

    setIsSubmitting(true)
    try {
      await escalateMembershipUpgradeApplication(subscription._id, {
        assigneeSubAdminId: selectedAssignee.id,
        assigneeName: selectedAssignee.fullname,
        adminNote: adminNote.trim(),
        partnerId: subscription.partnerId,
        username: subscription.partnerName || '',
        currentPlanId,
        currentPlanName: subscription.planName,
        newMembershipPlanId: planId,
        newPlanName: selectedPlan?.planName,
        billingCycleName: subscription.billingCycleName,
        reasons: reason.trim() ? [reason.trim()] : ['Membership upgrade escalation'],
        adminNotes: adminNote.trim(),
        sourceApp: subscription.sourceApp || 'Admin Panel',
        applicationUrl: `/settings/membership-upgrade-details/${subscription._id}`,
        entityTitle: subscription.partnerName || subscription.planName,
      })
      void queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
      void queryClient.invalidateQueries({ queryKey: ['all-escalations'] })
      toast.success('Membership upgrade escalated')
      onClose()
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to escalate membership upgrade'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/80 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="ui-modal-shell w-full max-w-[551px] !bg-[#141414]"
        role="dialog"
        aria-modal="true"
      >
        <div className="ui-modal-header !items-start">
          <div className="min-w-0 flex-1">
            <h3 className="text-[20px] leading-7 font-semibold text-white">Escalate Upgrade</h3>
            <p className="mt-1 text-[14px] leading-[22px] text-white/50">
              Assign a sub-admin to review this membership upgrade request.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="ui-modal-body min-h-0 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Upgrading Plan <RequiredMark />
            </label>
            <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="ui-input">
              <option value="">Select plan</option>
              {upgradePlans.map((plan) => (
                <option key={plan._id} value={plan._id}>
                  {plan.planName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Assign to <RequiredMark />
            </label>
            <select
              value={assigneeId || selectedAssignee?.id || ''}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="ui-input"
            >
              <option value="">Select sub-admin</option>
              {assignees.map((assignee) => (
                <option key={assignee.id} value={assignee.id}>
                  {assignee.fullname}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="ui-input"
              placeholder="Why should this upgrade be approved?"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-white/70">
              Admin note <RequiredMark />
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              className="ui-input"
              placeholder="Notes for the assignee"
            />
          </div>
        </div>

        <div className="ui-modal-footer flex justify-end gap-3">
          <button type="button" onClick={onClose} className="ui-cta ui-cta-secondary">
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => void handleSubmit()}
            className={cn('ui-cta ui-cta-primary', isSubmitting && 'opacity-60')}
          >
            {isSubmitting ? 'Escalating...' : 'Escalate'}
          </button>
        </div>
      </div>
    </div>
  )
}
