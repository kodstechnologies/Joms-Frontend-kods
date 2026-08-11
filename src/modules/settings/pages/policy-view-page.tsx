import { useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { PolicyBreadcrumb, PolicySettingsTopTabs } from '../components/policy-settings-tabs'
import { PolicyVersionReadonlyCard } from '../components/policy-version-readonly-card'
import { usePolicy, usePolicyVersions } from '../hooks/use-policies'
import { policyEditPath, policyListPath } from '../utils/policy-navigation'
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
      <PolicyBreadcrumb current={policy.title} application={application} />
      <PolicySettingsTopTabs activeKey="platform" />

      <div className="bg-brand-bg space-y-4 rounded-2xl border border-white/10 p-4 sm:p-5">
        <PolicyVersionReadonlyCard title={policy.title} version={selectedVersion} />
      </div>

      <div className="settings-page-footer">
        <Button
          variant="secondary"
          className="settings-page-footer-reset"
          onClick={() => navigate(policyListPath(application))}
        >
          Reset
        </Button>
        <div className="policy-page-footer-actions">
          <Button
            variant="ghost"
            className="policy-page-footer-draft"
            onClick={() => {
              toast.message('Open Update to save a draft')
              navigate(policyEditPath(id, application))
            }}
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            className="settings-page-footer-save"
            onClick={() => navigate(policyEditPath(id, application))}
          >
            Submit Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
