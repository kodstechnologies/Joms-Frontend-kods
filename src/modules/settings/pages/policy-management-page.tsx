import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Calendar, Clock, Eye, FileText, History, Plus, RotateCw } from 'lucide-react'
import { toast } from 'sonner'

import { SettingsFooterActions } from '../components/settings-footer-actions'
import { PolicyEditorForm } from '../components/policy-editor-form'
import {
  useCreatePolicy,
  useCreatePolicyVersion,
  usePolicies,
  usePolicy,
  usePolicyVersions,
} from '../hooks/use-policies'
import type { PolicyApplication, PolicyItem } from '../types/settings'
import {
  bumpPolicyVersion,
  defaultNotifyVia,
  resolveEffectivePayload,
  toDateInputValue,
  type PolicyEditorValues,
} from '../utils/policy-form'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

const POLICY_SETTINGS_TABS: Array<{
  key: 'platform' | 'security' | 'user' | 'expert' | 'event' | 'venue' | 'service'
  label: string
  routeTab?: string
}> = [
  { key: 'platform', label: 'Platform Controls', routeTab: 'platform' },
  { key: 'security', label: 'Security & Access', routeTab: 'security' },
  { key: 'user', label: 'User Application' },
  { key: 'expert', label: 'Expert Application', routeTab: 'expert' },
  { key: 'event', label: 'Event Management' },
  { key: 'venue', label: 'Venue Management', routeTab: 'venue' },
  { key: 'service', label: 'Service Marketplace', routeTab: 'service' },
]

function PolicySettingsTopTabs({ activeKey = 'platform' }: { activeKey?: string }) {
  const navigate = useNavigate()

  return (
    <div className="settings-top-tabs">
      <div className="settings-top-tabs-scroll">
        <div className="settings-top-tabs-row">
          {POLICY_SETTINGS_TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                if (item.routeTab) {
                  navigate('/settings/main', { state: { settingsTab: item.routeTab } })
                }
              }}
              className={cn(
                'settings-top-tab',
                item.key === activeKey && 'settings-top-tab--active',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function PolicyActionButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string
  icon: typeof Eye
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-brand-accent/35 bg-brand-surface text-body-sm-medium hover:border-brand-accent/60 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-white"
    >
      <Icon className="text-brand-accent size-3.5" />
      {label}
    </button>
  )
}

function PolicyRow({ policy }: { policy: PolicyItem }) {
  const navigate = useNavigate()

  return (
    <article className="bg-brand-surface flex flex-col gap-4 rounded-xl border border-white/10 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="bg-brand-surface grid size-10 shrink-0 place-items-center rounded-lg border border-white/10">
          <FileText className="text-muted size-4" />
        </div>
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-body-md-semibold text-white">{policy.title}</h3>
            <span className="border-brand-positive/30 bg-brand-positive/10 text-body-sm text-brand-positive rounded-full border px-2.5 py-0.5 font-semibold">
              {policy.status}
            </span>
            <span className="border-brand-accent/30 bg-brand-accent/10 text-body-sm text-brand-accent rounded-full border px-2.5 py-0.5 font-semibold">
              {policy.version}
            </span>
          </div>
          <div className="text-body-sm text-muted flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              Effective: {policy.effectiveDate}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" />
              Last Updated: {policy.lastUpdated}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 lg:justify-end">
        <PolicyActionButton
          label="View"
          icon={Eye}
          onClick={() => navigate(`/settings/policies/${policy.id}`)}
        />
        <PolicyActionButton
          label="View Timeline"
          icon={History}
          onClick={() => navigate(`/settings/policies/${policy.id}/timeline`)}
        />
        <PolicyActionButton
          label="Update"
          icon={RotateCw}
          onClick={() => navigate(`/settings/policies/${policy.id}`)}
        />
      </div>
    </article>
  )
}

export function PolicyManagementPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const application = (searchParams.get('application') as PolicyApplication | null) ?? 'expert'
  const { data: policies = [], isLoading } = usePolicies(application)

  return (
    <div className="space-y-6">
      <PolicySettingsTopTabs activeKey="expert" />

      <div className="bg-brand-bg space-y-4 rounded-2xl border border-white/10 p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-h4 text-white">Policy Management</h2>
            <p className="text-body-md text-muted mt-1">
              Manage expert application policies, terms, and legal documents
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/settings/policies/create?application=${application}`)}
            className="ui-cta ui-cta-primary"
          >
            <Plus className="size-4" />
            Create New Policy
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {policies.map((policy) => (
              <PolicyRow key={policy.id} policy={policy} />
            ))}
          </div>
        )}

        <SettingsFooterActions
          onReset={() => toast.message('Reset coming soon')}
          onSave={() => toast.message('Save coming soon')}
          saveDisabled
          resetDisabled
        />
      </div>
    </div>
  )
}

export function PolicyCreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const application = (searchParams.get('application') as PolicyApplication | null) ?? 'expert'
  const createMutation = useCreatePolicy()
  const [values, setValues] = useState<PolicyEditorValues>(() => ({
    title: '',
    slug: '',
    currentVersion: 'V1.0',
    newVersion: 'V1.0',
    effectiveSince: '',
    content: '',
    changeSummary: '',
    effectiveTiming: 'today',
    futureEffectiveDate: toDateInputValue(new Date()),
    requireReConsent: true,
    blockAppUsageUntilAccepted: true,
    notifyVia: defaultNotifyVia(),
  }))

  const updateValues = (patch: Partial<PolicyEditorValues>) => {
    setValues((current) => ({ ...current, ...patch }))
  }

  const handleCreate = (status: 'Draft' | 'Active') => {
    if (!values.title.trim() || !values.slug.trim() || !values.newVersion.trim()) {
      toast.error('Policy name, slug, and version are required')
      return
    }
    if (status === 'Active' && !values.changeSummary.trim()) {
      toast.error('Change summary is required before publishing')
      return
    }

    const effective = resolveEffectivePayload(values)
    const slug = values.slug.trim().toLowerCase().replace(/\s+/g, '-')

    createMutation.mutate(
      {
        slug,
        title: values.title.trim(),
        application,
        version: values.newVersion.trim(),
        status,
        effectiveDate: effective.effectiveDate,
        effectiveAt: effective.effectiveAt,
        content: values.content,
        changeSummary: values.changeSummary,
        author: 'Super Admin',
        requireReConsent: values.requireReConsent,
        blockAppUsageUntilAccepted: values.blockAppUsageUntilAccepted,
        notifyVia: values.notifyVia,
      },
      {
        onSuccess: (policy) => {
          toast.success(status === 'Draft' ? 'Draft saved' : 'Policy published')
          navigate(`/settings/policies/${policy.id}`)
        },
        onError: () => toast.error('Failed to create policy'),
      },
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" subtitle="Create expert application policy" />
      <PolicySettingsTopTabs activeKey="expert" />

      <div className="bg-brand-bg space-y-4 rounded-2xl border border-white/10 p-4">
        <p className="text-body-sm text-muted">
          Platform Control / Policy Management / Create Policy
        </p>
        <PolicyEditorForm
          mode="create"
          showSlug
          values={values}
          onChange={(patch) => {
            if (patch.title && !values.slug) {
              updateValues({
                ...patch,
                slug: patch.title.toLowerCase().replace(/\s+/g, '-'),
              })
              return
            }
            updateValues(patch)
          }}
        />
      </div>

      <div className="bg-brand-bg flex justify-between rounded-xl border border-white/10 px-3 py-2.5">
        <Button
          variant="secondary"
          className="text-body-sm h-8"
          onClick={() => navigate(`/settings/policies?application=${application}`)}
        >
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="text-body-sm h-8"
            disabled={createMutation.isPending}
            onClick={() => handleCreate('Draft')}
          >
            Save Draft
          </Button>
          <Button
            className="text-body-sm h-8"
            disabled={createMutation.isPending}
            onClick={() => handleCreate('Active')}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

function getStatusClass(status: string) {
  if (status === 'Active')
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  return 'border-white/25 bg-white/10 text-muted'
}

export function PolicyTimelinePage() {
  const navigate = useNavigate()
  const { id = 'terms' } = useParams<{ id: string }>()
  const { data: policy, isLoading: policyLoading } = usePolicy(id)
  const { data: versions = [], isLoading: versionsLoading } = usePolicyVersions(id)

  if (policyLoading || versionsLoading) {
    return <div className="h-40 animate-pulse rounded-xl bg-white/5" />
  }

  if (!policy) {
    return (
      <div className="space-y-4">
        <p className="text-muted">Policy not found.</p>
        <Button variant="secondary" onClick={() => navigate('/settings/policies')}>
          Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" subtitle="Manage policy versions and review history" />

      <div className="bg-brand-bg space-y-3 rounded-2xl border border-white/10 p-4">
        <div className="bg-brand-surface flex items-center justify-between rounded-lg border border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <FileText className="text-muted size-4" />
            <span className="text-body-md-semibold text-white">{policy.title}</span>
            <span className="border-brand-accent/25 bg-brand-accent/10 text-body-sm text-brand-accent rounded-full border px-2 py-0.5 font-semibold">
              {policy.version}
            </span>
          </div>
          <Button variant="secondary" onClick={() => navigate(`/settings/policies/${policy.id}`)}>
            View
          </Button>
        </div>

        <div className="bg-brand-bg rounded-xl border border-white/10 p-4">
          <p className="text-body-sm-semibold mb-2 text-white">Version History</p>
          <div className="space-y-3">
            {versions.map((version) => (
              <div
                key={version.id}
                className="bg-brand-surface rounded-lg border border-white/10 p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-body-md-semibold text-white">{version.version}</span>
                  <span
                    className={cn(
                      'text-body-sm rounded-full border px-2 py-0.5 font-semibold',
                      getStatusClass(version.status),
                    )}
                  >
                    {version.status}
                  </span>
                  <span className="text-body-sm text-muted">{version.lastUpdated}</span>
                </div>
                <p className="text-body-sm text-muted mt-1">{version.changeSummary}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => navigate('/settings/policies')}>
            Back
          </Button>
        </div>
      </div>
    </div>
  )
}

export function PolicyDetailPage() {
  const navigate = useNavigate()
  const { id = 'expert-application-terms' } = useParams<{ id: string }>()
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
          navigate(`/settings/policies/${id}`)
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
        <Button
          variant="secondary"
          onClick={() => navigate('/settings/policies?application=expert')}
        >
          Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Settings"
        subtitle="Track revenue, payouts, and financial performance"
        actions={[
          {
            label: 'Settings Logs',
            onClick: () => navigate('/settings/logs'),
            variant: 'secondary',
          },
        ]}
      />
      <PolicySettingsTopTabs activeKey="platform" />

      <p className="policy-page-breadcrumb">
        Platform Control / Policy Management / {policy.title}
      </p>

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
          onClick={() => setValues(initialValues)}
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
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
