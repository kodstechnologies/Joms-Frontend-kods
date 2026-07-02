import { Save, X } from 'lucide-react'
import { toast } from 'sonner'

import { MembershipPlanForm, type MembershipPlanFormValues } from './membership-plan-form'
import { useCreateMembership } from '../hooks/use-memberships'
import type { MembershipType } from '../types/membership'
import { Button } from '@/shared/components/ui/button'

type CreateMembershipModalProps = {
  open: boolean
  defaultType?: MembershipType
  onClose: () => void
}

export function CreateMembershipModal({
  open,
  defaultType = 'user',
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
        type: values.type || defaultType,
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
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111111] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Create Membership</h2>
            <p className="text-xs text-slate-400">Configure membership plan details and features</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-white/10">
            <X className="size-4 text-slate-300" />
          </button>
        </div>

        <div className="px-6 py-5">
          <MembershipPlanForm defaultType={defaultType} onSubmit={handleSubmit} />
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="membership-plan-form" disabled={createMutation.isPending}>
            <Save className="size-4" />
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  )
}
