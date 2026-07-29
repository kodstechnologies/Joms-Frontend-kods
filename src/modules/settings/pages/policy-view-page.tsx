import { useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { PolicyBreadcrumb, PolicySettingsTopTabs } from '../components/policy-settings-tabs'
import { policyListPath } from '../utils/policy-navigation'
import { PolicyVersionReadonlyCard } from '../components/policy-version-readonly-card'
import { usePolicy, usePolicyVersions } from '../hooks/use-policies'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
import { Button } from '@/shared/components/ui/button'

export function PolicyViewPage() {
  const navigate = useNavigate()
  const { id = 'expert-application-terms' } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const versionId = searchParams.get('versionId')
  const application = searchParams.get('application') ?? 'expert'

  const { data: policy, isLoading: policyLoading } = usePolicy(id)
  const { data: versions = [], isLoading: versionsLoading } = usePolicyVersions(id)

  const selectedVersion = useMemo(() => {
    if (!versions.length) return null
    if (versionId) {
      return versions.find((item) => item.id === versionId) ?? versions[0]
    }
    return versions.find((item) => item.status === 'Active') ?? versions[0]
  }, [versionId, versions])

  if (policyLoading || versionsLoading) {
    return <div className="h-40 animate-pulse rounded-xl bg-white/5" />
  }

  if (!policy || !selectedVersion) {
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
      <SectionHeader title="Settings" subtitle="Review policy version details" />
      <PolicySettingsTopTabs activeKey="expert" />

      <div className="bg-brand-bg space-y-4 rounded-2xl border border-white/10 p-4 sm:p-5">
        <PolicyBreadcrumb segments={['Platform Control', 'Policy Management', policy.title]} />

        <PolicyVersionReadonlyCard title={policy.title} version={selectedVersion} />
      </div>

      <div className="bg-brand-bg flex flex-col gap-3 rounded-xl border border-white/10 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="secondary" onClick={() => navigate(policyListPath(application))}>
          Reset
        </Button>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(`/settings/policies/${id}/edit?application=${application}`)}
          >
            Save Draft
          </Button>
          <Button
            onClick={() => navigate(`/settings/policies/${id}/edit?application=${application}`)}
          >
            Submit Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
