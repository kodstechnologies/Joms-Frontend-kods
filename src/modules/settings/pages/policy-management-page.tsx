import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, FileText, History, Plus, RotateCw } from 'lucide-react'
import calendarIcon from '@/assets/JOMS_ICONS-2/icons8-calendar.svg'
import { toast } from 'sonner'

import { SettingsFooterActions } from '../components/settings-footer-actions'
import { PolicyBreadcrumb, PolicySettingsTopTabs } from '../components/policy-settings-tabs'
import { PolicyEditorForm } from '../components/policy-editor-form'
import { useCreatePolicy, usePolicies } from '../hooks/use-policies'
import type { PolicyApplication, PolicyItem } from '../types/settings'
import {
  defaultNotifyVia,
  formatPolicyDateUs,
  formatPolicyNotificationToast,
  resolveEffectivePayload,
  toDateInputValue,
  type PolicyEditorValues,
} from '../utils/policy-form'
import {
  platformControlsPath,
  policyCreatePath,
  policyEditPath,
  policyListPath,
  policyTimelinePath,
  policyViewPath,
} from '../utils/policy-navigation'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

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
    <button type="button" onClick={onClick} className="policy-row-action-btn">
      <Icon className="policy-row-action-icon" aria-hidden />
      <span>{label}</span>
    </button>
  )
}

function PolicyRow({ policy, application }: { policy: PolicyItem; application: string }) {
  const navigate = useNavigate()
  const status = policy.status || 'Active'

  return (
    <article className="policy-list-row">
      <div className="policy-list-row-main">
        <div className="policy-list-row-title-line">
          <FileText className="policy-list-doc-icon" aria-hidden />
          <h3 className="policy-list-row-title">{policy.title}</h3>
          <span
            className={cn(
              'policy-status-badge',
              status === 'Active' ? 'policy-status-badge--active' : 'policy-status-badge--muted',
            )}
          >
            {status}
          </span>
          <span className="policy-version-badge">{policy.version}</span>
        </div>

        <div className="policy-list-row-meta">
          <span className="policy-meta-item">
            <img
              src={calendarIcon}
              alt="calendar"
              className="policy-meta-icon"
              aria-hidden="true"
            />
            <span className="policy-meta-label">Effective:</span>
            <span className="policy-meta-value">{policy.effectiveDate || '—'}</span>
          </span>
          <span className="policy-meta-item">
            <img
              src={calendarIcon}
              alt="calendar"
              className="policy-meta-icon"
              aria-hidden="true"
            />
            <span className="policy-meta-label">Last Updated:</span>
            <span className="policy-meta-value">{policy.lastUpdated || '—'}</span>
          </span>
        </div>
      </div>

      <div className="policy-list-row-actions">
        <PolicyActionButton
          label="View"
          icon={Eye}
          onClick={() => navigate(policyViewPath(policy.id, application))}
        />
        <PolicyActionButton
          label="View Timeline"
          icon={History}
          onClick={() => navigate(policyTimelinePath(policy.id, application))}
        />
        <PolicyActionButton
          label="Update"
          icon={RotateCw}
          onClick={() => navigate(policyEditPath(policy.id, application))}
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
    <div className="policy-page space-y-6">
      <PolicyBreadcrumb application={application} />
      <PolicySettingsTopTabs activeKey="platform" />

      <div className="policy-list-panel">
        <div className="policy-list-header">
          <div>
            <h2 className="policy-list-heading">Policy Management</h2>
            <p className="policy-list-subheading">
              Manage platform policies, terms, and legal documents
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(policyCreatePath(application))}
            className="ui-cta ui-cta-primary policy-create-btn"
          >
            <Plus className="size-4" aria-hidden />
            Create New Policy
          </button>
        </div>

        {isLoading ? (
          <div className="policy-list-stack">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="policy-list-row policy-list-row--skeleton" />
            ))}
          </div>
        ) : policies.length === 0 ? (
          <p className="text-muted text-body-sm py-8 text-center">No policies found.</p>
        ) : (
          <div className="policy-list-stack">
            {policies.map((policy) => (
              <PolicyRow key={policy.id} policy={policy} application={application} />
            ))}
          </div>
        )}
      </div>

      <SettingsFooterActions
        onReset={() => navigate(platformControlsPath(), { state: { settingsTab: 'platform' } })}
        onSave={() => toast.message('All policies are saved')}
      />
    </div>
  )
}

function toPolicySlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function PolicyCreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const application = (searchParams.get('application') as PolicyApplication | null) ?? 'expert'
  const createMutation = useCreatePolicy()
  const initialValues = (): PolicyEditorValues => ({
    title: '',
    slug: '',
    currentVersion: '—',
    newVersion: 'V1.0',
    effectiveSince: formatPolicyDateUs(new Date()),
    content: '',
    changeSummary: '',
    effectiveTiming: 'today',
    futureEffectiveDate: toDateInputValue(new Date()),
    requireReConsent: true,
    blockAppUsageUntilAccepted: true,
    notifyVia: defaultNotifyVia(),
  })
  const [values, setValues] = useState<PolicyEditorValues>(initialValues)

  const updateValues = (patch: Partial<PolicyEditorValues>) => {
    setValues((current) => ({ ...current, ...patch }))
  }

  const handleCreate = (status: 'Draft' | 'Active') => {
    if (!values.title.trim() || !values.newVersion.trim()) {
      toast.error('Policy name and new version are required')
      return
    }
    if (status === 'Active' && !values.changeSummary.trim()) {
      toast.error('Change summary is required before publishing')
      return
    }

    const effective = resolveEffectivePayload(values)
    const slug = toPolicySlug(values.slug || values.title)
    if (!slug) {
      toast.error('Could not derive a valid policy slug from the name')
      return
    }

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
        onSuccess: (result) => {
          toast.success(status === 'Draft' ? 'Draft saved' : 'Policy published')
          const notifyNote = formatPolicyNotificationToast(result.notifications)
          if (notifyNote && status === 'Active') {
            toast.info(notifyNote)
          }
          navigate(policyListPath(application))
        },
        onError: () => toast.error('Failed to create policy'),
      },
    )
  }

  return (
    <div className="space-y-6">
      <PolicyBreadcrumb
        current={values.title.trim() || 'Create Policy'}
        application={application}
      />
      <PolicySettingsTopTabs activeKey="platform" />

      <PolicyEditorForm
        mode="create"
        isActive
        values={values}
        onChange={(patch) => {
          if (typeof patch.title === 'string') {
            updateValues({
              ...patch,
              slug: toPolicySlug(patch.title),
            })
            return
          }
          updateValues(patch)
        }}
      />

      <div className="settings-page-footer">
        <Button
          variant="secondary"
          className="settings-page-footer-reset"
          onClick={() => {
            setValues(initialValues())
            navigate(policyListPath(application))
          }}
        >
          Reset
        </Button>
        <div className="policy-page-footer-actions">
          <Button
            variant="ghost"
            disabled={createMutation.isPending}
            onClick={() => handleCreate('Draft')}
            className="policy-page-footer-draft"
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            disabled={createMutation.isPending}
            onClick={() => handleCreate('Active')}
            className="settings-page-footer-save"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
