import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { PolicyBreadcrumb, PolicySettingsTopTabs } from '../components/policy-settings-tabs'
import { PolicyTimelineVersionItem } from '../components/policy-timeline-version-item'
import { usePolicy, usePolicyVersions } from '../hooks/use-policies'
import { policyListPath } from '../utils/policy-navigation'
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
    <div className="policy-page space-y-6">
      <PolicyBreadcrumb current={policy.title} application={application} />
      <PolicySettingsTopTabs activeKey="platform" />

      <div className="policy-timeline-panel">
        <div className="policy-timeline-admin-banner">
          <p>
            <span className="policy-timeline-admin-label">Super Admin View:</span> This timeline
            shows the complete evolution of this policy, including all versions, changes, and user
            impact data.
          </p>
        </div>

        <div className="policy-timeline-list">
          {versions.length === 0 ? (
            <p className="text-muted text-body-sm py-6 text-center">No versions yet.</p>
          ) : (
            versions.map((version, index) => (
              <PolicyTimelineVersionItem
                key={version.id}
                index={index}
                policySlug={policy.id}
                policyTitle={policy.title}
                application={application}
                version={version}
                defaultExpanded={index === 0}
              />
            ))
          )}
        </div>
      </div>

      <div className="settings-page-footer">
        <Button
          variant="secondary"
          className="settings-page-footer-reset"
          onClick={() => navigate(policyListPath(application))}
        >
          Back
        </Button>
        <Button
          variant="primary"
          className="settings-page-footer-save"
          onClick={() => {
            toast.message('All timeline data is saved')
            navigate(policyListPath(application))
          }}
        >
          Save Changes
        </Button>
      </div>
    </div>
  )
}
