import { Save, X } from 'lucide-react'
import { toast } from 'sonner'

import { MembershipPlanForm, type MembershipPlanFormValues } from './membership-plan-form'
import { useCreateMembership } from '../hooks/use-memberships'
import type { MembershipType } from '../types/membership'
type CreateMembershipModalProps = {
  open: boolean
  defaultType?: MembershipType
  onClose: () => void
}

export function CreateMembershipModal({
  open,
  defaultType = 'expert',
  onClose,
}: CreateMembershipModalProps) {
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
      <div className="ui-modal-shell max-h-[92vh] max-w-3xl overflow-y-auto">
        <div className="ui-modal-header">
          <div>
            <h2 className="text-h4 text-brand-text">Create Membership</h2>
            <p className="text-muted text-body-sm">
              Configure membership plan details and features
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-brand-text rounded-brand-md p-2 hover:bg-white/10"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="ui-modal-body">
          <MembershipPlanForm defaultType={defaultType} onSubmit={handleSubmit} />
        </div>

        <div className="ui-modal-footer justify-end">
          <button type="button" className="ui-cta ui-cta-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            form="membership-plan-form"
            disabled={createMutation.isPending}
            className="ui-cta ui-cta-primary"
          >
            <Save className="size-4" />
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
