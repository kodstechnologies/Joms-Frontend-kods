import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import { PolicyBreadcrumb, PolicySettingsTopTabs } from '../components/policy-settings-tabs'
import { PolicyEditorForm } from '../components/policy-editor-form'
import { useCreatePolicyVersion, usePolicy, usePolicyVersions } from '../hooks/use-policies'
import {
  bumpPolicyVersion,
  defaultNotifyVia,
  formatPolicyNotificationToast,
  resolveEffectivePayload,
  toDateInputValue,
  type PolicyEditorValues,
} from '../utils/policy-form'
import { policyListPath, policyViewPath } from '../utils/policy-navigation'
import { Button } from '@/shared/components/ui/button'

export function PolicyEditPage() {
  const navigate = useNavigate()
  const { id = 'expert-application-terms' } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const application = searchParams.get('application') ?? 'expert'

  const { data: policy, isLoading: policyLoading } = usePolicy(id)
  const { data: versions = [] } = usePolicyVersions(id)
  const createVersionMutation = useCreatePolicyVersion(id)

  const latestVersion = versions[0]
  const initialValues = useMemo<PolicyEditorValues>(
    () => ({
      title: policy?.title ?? '',
      slug: policy?.slug ?? policy?.id ?? id,
      currentVersion: latestVersion?.version ?? policy?.version ?? 'V1.0',
      newVersion: bumpPolicyVersion(latestVersion?.version ?? policy?.version ?? 'V1.0'),
      effectiveSince: latestVersion?.effectiveDate ?? policy?.effectiveDate ?? '',
      content: latestVersion?.content ?? policy?.content ?? '',
      changeSummary: '',
      effectiveTiming: 'today',
      futureEffectiveDate: toDateInputValue(new Date()),
      requireReConsent: latestVersion?.requireReConsent ?? true,
      blockAppUsageUntilAccepted: latestVersion?.blockAppUsageUntilAccepted ?? true,
      notifyVia: latestVersion?.notifyVia ?? defaultNotifyVia(),
    }),
    [id, latestVersion, policy],
  )

  const baselineKey = `${id}|${latestVersion?.id ?? 'none'}`
  const [values, setValues] = useState<PolicyEditorValues>(initialValues)
  const [loadedBaseline, setLoadedBaseline] = useState(baselineKey)

  if (loadedBaseline !== baselineKey) {
    setLoadedBaseline(baselineKey)
    setValues(initialValues)
  }

  const updateValues = (patch: Partial<PolicyEditorValues>) => {
    setValues((current) => ({ ...current, ...patch }))
  }

  const handleSave = (status: 'Draft' | 'Active') => {
    if (!values.newVersion.trim()) {
      toast.error('New version is required')
      return
    }
    if (status === 'Active' && !values.changeSummary.trim()) {
      toast.error('Change summary is required before publishing')
      return
    }

    const effective = resolveEffectivePayload(values)
    createVersionMutation.mutate(
      {
        version: values.newVersion.trim(),
        status,
        effectiveDate: effective.effectiveDate,
        effectiveAt: effective.effectiveAt,
        content: values.content,
        changeSummary: values.changeSummary,
        author: latestVersion?.author ?? policy?.author ?? 'Super Admin',
        requireReConsent: values.requireReConsent,
        blockAppUsageUntilAccepted: values.blockAppUsageUntilAccepted,
        notifyVia: values.notifyVia,
      },
      {
        onSuccess: (result) => {
          toast.success(status === 'Draft' ? 'Draft saved' : 'Policy updated')
          const notifyNote = formatPolicyNotificationToast(result.notifications)
          if (notifyNote && status === 'Active') {
            toast.info(notifyNote)
          }
          navigate(policyViewPath(id, application))
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to save policy version')),
      },
    )
  }

  if (policyLoading) {
    return <div className="h-40 animate-pulse rounded-xl bg-white/5" />
  }

  if (!policy) {
    return (
      <div className="space-y-4">
        <p className="text-muted">Policy not found.</p>
        <Button variant="secondary" onClick={() => navigate(policyListPath(application))}>
          Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PolicyBreadcrumb current={policy.title} application={application} />
      <PolicySettingsTopTabs activeKey="platform" />

      <PolicyEditorForm
        mode="update"
        isActive={policy.status === 'Active'}
        values={values}
        onChange={updateValues}
      />

      <div className="settings-page-footer">
        <Button
          variant="secondary"
          className="settings-page-footer-reset"
          onClick={() => {
            setValues(initialValues)
            navigate(policyListPath(application))
          }}
        >
          Reset
        </Button>
        <div className="policy-page-footer-actions">
          <Button
            variant="ghost"
            disabled={createVersionMutation.isPending}
            onClick={() => handleSave('Draft')}
            className="policy-page-footer-draft"
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            disabled={createVersionMutation.isPending}
            onClick={() => handleSave('Active')}
            className="settings-page-footer-save"
          >
            Submit Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

export const PolicyDetailPage = PolicyEditPage
