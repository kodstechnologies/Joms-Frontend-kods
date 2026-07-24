import { ArrowLeft, Pencil, Plus, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  MembershipPlanForm,
  type MembershipPlanFormValues,
} from '../components/membership-plan-form'
import { useCreateMembership, useMembership, useUpdateMembership } from '../hooks/use-memberships'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

/** Edit / Create plan page — matches Create Membership Figma shell */
export function MembershipPlanFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)

  const { data, isLoading } = useMembership(id ?? '')
  const plan = data?.data

  const createMutation = useCreateMembership()
  const updateMutation = useUpdateMembership()

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleClose = () => navigateBackOrFallback(navigate, '/memberships/plans')

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
            type: 'expert',
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
          type: 'expert',
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

      handleClose()
    } catch {
      toast.error(
        isEditMode ? 'Failed to update membership plan' : 'Failed to create membership plan',
      )
    }
  }

  if (isEditMode && isLoading) {
    return <p className="text-body-md text-white/50">Loading plan details...</p>
  }

  if (isEditMode && !plan) {
    return <p className="text-body-md text-brand-danger">Membership plan not found.</p>
  }

  return (
    <div className="flex justify-center py-2">
      {/* Figma shell: 701 wide, black panel — same as Create Membership */}
      <div
        className="flex w-full max-w-[701px] flex-col overflow-hidden rounded-[16px] border border-white/10 bg-black text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
        style={{ minHeight: 'min(90vh, 1458px)' }}
      >
        <div
          className="flex shrink-0 items-start justify-between gap-3 px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="flex min-w-0 items-start gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="mt-0.5 rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Back"
            >
              <ArrowLeft className="size-5" strokeWidth={1.75} />
            </button>
            <div>
              <h1 className="text-[20px] leading-7 font-semibold text-white">
                {isEditMode ? 'Edit Membership' : 'Create Membership'}
              </h1>
              <p className="mt-1 text-[14px] leading-[22px] text-white/50">
                {isEditMode
                  ? `Update configuration for ${plan?.planName ?? 'plan'}`
                  : 'Configure membership plan details and features'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <MembershipPlanForm
            key={plan?._id ?? 'create'}
            initialPlan={plan ?? null}
            onSubmit={handleSubmit}
          />
        </div>

        <div
          className="flex shrink-0 items-center justify-end gap-3 px-6 py-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-10 min-w-[120px] items-center justify-center rounded-[10px] border border-white bg-transparent px-4 text-[14px] leading-[22px] font-semibold text-white transition-colors hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="membership-plan-form"
            disabled={isSubmitting}
            className="ui-cta ui-cta-primary min-w-[120px]"
          >
            {isEditMode ? (
              <>
                <Pencil className="size-4" strokeWidth={1.75} />
                {isSubmitting ? 'Saving...' : 'Save'}
              </>
            ) : (
              <>
                <Plus className="size-4" strokeWidth={2.25} />
                {isSubmitting ? 'Creating...' : 'Create'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
