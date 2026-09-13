import { ArrowLeft, Pencil, Save, X } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  MembershipPlanForm,
  type MembershipPlanFormValues,
} from '../components/membership-plan-form'
import { useCreateMembership, useMembership, useUpdateMembership } from '../hooks/use-memberships'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

export function MembershipPlanFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isViewMode = Boolean(id) && location.pathname.endsWith('/view')
  const isEditMode = Boolean(id) && !isViewMode

  const { data, isLoading } = useMembership(id ?? '')
  const plan = data?.data

  const createMutation = useCreateMembership()
  const updateMutation = useUpdateMembership()

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleClose = () => navigateBackOrFallback(navigate, '/memberships/plans')

  const handleSubmit = async (values: MembershipPlanFormValues) => {
    if (isViewMode) return

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
            planConfig: values.planConfig,
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
          planConfig: values.planConfig,
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

  if ((isEditMode || isViewMode) && isLoading) {
    return <p className="text-body-md text-white/50">Loading plan details...</p>
  }

  if ((isEditMode || isViewMode) && !plan) {
    return <p className="text-body-md text-brand-danger">Membership plan not found.</p>
  }

  const title = isViewMode
    ? 'View Membership'
    : isEditMode
      ? 'Edit Membership'
      : 'Create Membership'
  const subtitle = isViewMode
    ? `Plan details for ${plan?.planName ?? 'plan'}`
    : isEditMode
      ? `Update configuration for ${plan?.planName ?? 'plan'}`
      : 'Configure membership plan details and features'

  return (
    <div className="flex justify-center py-2">
      <div
        className="create-membership-modal flex w-full flex-col overflow-hidden text-white"
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
              <h1 className="create-membership-title">{title}</h1>
              <p className="create-membership-subtitle mt-1">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="create-membership-close-btn"
            aria-label="Close"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <MembershipPlanForm
            key={plan?._id ?? 'create'}
            initialPlan={plan ?? null}
            readOnly={isViewMode}
            onSubmit={handleSubmit}
          />
        </div>

        <div
          className="flex shrink-0 items-center justify-end gap-3 px-6 py-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          <button type="button" onClick={handleClose} className="create-membership-cancel-btn">
            {isViewMode ? 'Close' : 'Cancel'}
          </button>
          {isViewMode && id ? (
            <button
              type="button"
              onClick={() => navigate(`/memberships/plans/${id}/edit`)}
              className="ui-cta ui-cta-primary min-w-[120px]"
            >
              <Pencil className="size-4" strokeWidth={1.75} />
              Edit
            </button>
          ) : (
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
                  <Save className="size-4" strokeWidth={2} />
                  {isSubmitting ? 'Creating...' : 'Create'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
