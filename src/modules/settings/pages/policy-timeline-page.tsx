import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { PolicyBreadcrumb, PolicySettingsTopTabs } from '../components/policy-settings-tabs'
import { policyListPath } from '../utils/policy-navigation'
import { PolicyTimelineVersionItem } from '../components/policy-timeline-version-item'
import { usePolicy, usePolicyVersions } from '../hooks/use-policies'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
import { Button } from '@/shared/components/ui/button'

export function PolicyTimelinePage() {
  const navigate = useNavigate()
  const { id = 'expert-application-terms' } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const application = searchParams.get('application') ?? 'expert'

  const { data: policy, isLoading: policyLoading } = usePolicy(id)
  const { data: versions = [], isLoading: versionsLoading } = usePolicyVersions(id)

  if (policyLoading || versionsLoading) {
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
      <SectionHeader title="Settings" subtitle="Manage policy versions and review history" />
      <PolicySettingsTopTabs activeKey="expert" />

      <div className="bg-brand-bg space-y-4 rounded-2xl border border-white/10 p-4 sm:p-5">
        <PolicyBreadcrumb segments={['Platform Control', 'Policy Management', policy.title]} />

        <div className="border-brand-accent/30 bg-brand-accent/10 rounded-xl border px-4 py-3">
          <p className="text-body-sm text-white">
            <span className="text-brand-accent font-semibold">Super Admin View:</span> This timeline
            shows the complete evolution of this policy, including all versions, changes, and user
            impact data.
          </p>
        </div>

        <div className="space-y-2">
          {versions.map((version, index) => (
            <PolicyTimelineVersionItem
              key={version.id}
              index={index}
              policySlug={policy.id}
              policyTitle={policy.title}
              application={application}
              version={version}
              defaultExpanded={index === 0}
            />
          ))}
        </div>
      </div>

      <div className="bg-brand-bg flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5">
        <Button variant="secondary" onClick={() => navigate(policyListPath(application))}>
          Back
        </Button>
        <Button
          onClick={() => navigate(`/settings/policies/${id}/view?application=${application}`)}
        >
          Save Changes
        </Button>
      </div>
    </div>
  )
}
