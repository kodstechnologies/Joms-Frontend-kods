import { Save, X } from 'lucide-react'
import { toast } from 'sonner'

import { MembershipPlanForm, type MembershipPlanFormValues } from './membership-plan-form'
import { useCreateMembership } from '../hooks/use-memberships'

type CreateMembershipModalProps = {
  open: boolean
  onClose: () => void
}

export function CreateMembershipModal({ open, onClose }: CreateMembershipModalProps) {
  const createMutation = useCreateMembership()

  if (!open) return null

  const handleSubmit = async (values: MembershipPlanFormValues) => {
    if (!values.planName.trim()) {
      toast.error('Plan name is required')
      return
    }

    if (!values.pricing.length) {
      toast.error('Select at least one billing cycle')
      return
    }

    try {
      await createMutation.mutateAsync({
        type: 'expert',
        planName: values.planName.trim(),
        pricing: values.pricing,
        features: values.features,
        planConfig: values.planConfig,
        trialPeriodDays: values.trialPeriodDays,
        enableAutoRenew: values.enableAutoRenew,
        allowPlanUpgrades: values.allowPlanUpgrades,
        allowDowngradePlans: values.allowDowngradePlans,
        updatedBy: 'Admin',
        icon: values.iconFile,
      })

      toast.success('Membership plan created')
      onClose()
    } catch {
      toast.error('Failed to create membership plan')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div
        className="create-membership-modal flex w-full flex-col overflow-hidden text-white"
        style={{ maxHeight: 'min(1458px, 92vh)' }}
      >
        <div
          className="flex shrink-0 items-start justify-between gap-3 px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div>
            <h2 className="create-membership-title">Create Membership</h2>
            <p className="create-membership-subtitle mt-1">
              Configure membership plan details and features
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="create-membership-close-btn"
            aria-label="Close"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <MembershipPlanForm onSubmit={handleSubmit} />
        </div>

        <div
          className="flex shrink-0 items-center justify-end gap-3 px-6 py-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          <button type="button" onClick={onClose} className="create-membership-cancel-btn">
            Cancel
          </button>
          <button
            type="submit"
            form="membership-plan-form"
            disabled={createMutation.isPending}
            className="ui-cta ui-cta-primary min-w-[120px]"
          >
            <Save className="size-4" strokeWidth={2} />
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
