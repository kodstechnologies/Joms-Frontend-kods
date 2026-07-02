import { ArrowLeft, Save } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  MembershipPlanForm,
  type MembershipPlanFormValues,
} from '../components/membership-plan-form'
import {
  useCreateMembership,
  useMembership,
  useUpdateMembership,
} from '../hooks/use-memberships'
import { Button } from '@/shared/components/ui/button'

export function MembershipPlanFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)

  const { data, isLoading } = useMembership(id ?? '')
  const plan = data?.data

  const createMutation = useCreateMembership()
  const updateMutation = useUpdateMembership()

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleSubmit = async (values: MembershipPlanFormValues) => {
    if (!values.planName) {
      toast.error('Plan name is required')
      return
    }

    if (!values.pricing.length) {
      toast.error('Select at least one billing cycle')
      return
    }

    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({
          id,
          payload: {
            type: plan?.type ?? values.type,
            planName: values.planName,
            pricing: values.pricing,
            features: values.features,
            trialPeriodDays: values.trialPeriodDays,
            enableAutoRenew: values.enableAutoRenew,
            allowPlanUpgrades: values.allowPlanUpgrades,
            allowDowngradePlans: values.allowDowngradePlans,
            updatedBy: 'Admin',
            icon: values.iconFile,
          },
        })
        toast.success('Membership plan updated')
      } else {
        await createMutation.mutateAsync({
          type: values.type,
          planName: values.planName,
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
      }

      navigate('/memberships/plans')
    } catch {
      toast.error(isEditMode ? 'Failed to update membership plan' : 'Failed to create membership plan')
    }
  }

  if (isEditMode && isLoading) {
    return <p className="text-sm text-slate-400">Loading plan details...</p>
  }

  if (isEditMode && !plan) {
    return <p className="text-sm text-rose-300">Membership plan not found.</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/memberships/plans')}
            className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/5"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">
              {isEditMode ? 'Edit Membership Plan' : 'Create Membership Plan'}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {isEditMode
                ? `Update configuration for ${plan?.planName}`
                : 'Configure membership plan details and features'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/memberships/plans')}>
            Cancel
          </Button>
          <Button type="submit" form="membership-plan-form" disabled={isSubmitting}>
            <Save className="size-4" />
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Plan'}
          </Button>
        </div>
      </div>

      <MembershipPlanForm initialPlan={plan ?? null} onSubmit={handleSubmit} />
    </div>
  )
}
