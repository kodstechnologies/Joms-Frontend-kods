import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { PolicyBreadcrumb, PolicySettingsTopTabs } from '../components/policy-settings-tabs'
import { policyListPath } from '../utils/policy-navigation'
import { PolicyEditorForm } from '../components/policy-editor-form'
import { useCreatePolicyVersion, usePolicy, usePolicyVersions } from '../hooks/use-policies'
import {
  bumpPolicyVersion,
  defaultNotifyVia,
  resolveEffectivePayload,
  toDateInputValue,
  type PolicyEditorValues,
} from '../utils/policy-form'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
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
        onSuccess: () => {
          toast.success(status === 'Draft' ? 'Draft saved' : 'Policy updated')
          navigate(`/settings/policies/${id}/view?application=${application}`)
        },
        onError: () => toast.error('Failed to save policy version'),
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
      <SectionHeader title="Settings" subtitle="Update expert application policy" />
      <PolicySettingsTopTabs activeKey="expert" />

      <div className="bg-brand-bg space-y-4 rounded-2xl border border-white/10 p-4 sm:p-5">
        <PolicyBreadcrumb segments={['Platform Control', 'Policy Management', policy.title]} />
        <PolicyEditorForm
          mode="update"
          isActive={policy.status === 'Active'}
          values={values}
          onChange={updateValues}
        />
      </div>

      <div className="bg-brand-bg flex flex-col gap-3 rounded-xl border border-white/10 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="secondary"
          onClick={() => {
            setValues(initialValues)
            navigate(policyListPath(application))
          }}
        >
          Reset
        </Button>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="secondary"
            disabled={createVersionMutation.isPending}
            onClick={() => handleSave('Draft')}
          >
            Save Draft
          </Button>
          <Button disabled={createVersionMutation.isPending} onClick={() => handleSave('Active')}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

// Backward-compatible export name used by router/index.
export const PolicyDetailPage = PolicyEditPage
