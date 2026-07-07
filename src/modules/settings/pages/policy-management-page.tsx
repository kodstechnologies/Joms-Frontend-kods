import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { getPolicyById, getPolicyVersions, policyItemsMock } from '../mock/policy-management.mock'
import { SettingsFooterActions } from '../components/settings-footer-actions'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

export function PolicyManagementPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Settings"
        subtitle="Track revenue, payouts, and financial performance"
        actions={[
          {
            label: 'Settings Logs',
            onClick: () => toast.message('Settings logs coming soon'),
            variant: 'secondary',
          },
        ]}
      />

      <p className="text-xs text-slate-500">
        <Link to="/settings/main" className="hover:text-white">
          Platform Control
        </Link>
        <span> / </span>
        <span className="text-white">Policy Management</span>
      </p>

      <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Policy Management</h2>
            <p className="text-sm text-slate-500">
              Manage platform policies, terms, and legal documents
            </p>
          </div>
          <Button onClick={() => toast.message('Create policy coming soon')}>
            <Plus className="size-4" />
            Create New Policy
          </Button>
        </div>

        <div className="space-y-3">
          {policyItemsMock.map((policy) => (
            <div
              key={policy.id}
              className="flex flex-col gap-4 rounded-xl border border-white/5 bg-[#141414] p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">{policy.title}</h3>
                  <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                    {policy.status}
                  </span>
                  <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                    {policy.version}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Effective: {policy.effectiveDate} · Last Updated: {policy.lastUpdated}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/settings/policies/${policy.id}`)}
                >
                  View
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/settings/policies/${policy.id}/timeline`)}
                >
                  View Timeline
                </Button>
                <Button onClick={() => toast.message('Update policy coming soon')}>Update</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SettingsFooterActions
        onReset={() => toast.message('Reset coming soon')}
        onSave={() => toast.message('Save coming soon')}
        saveDisabled
        resetDisabled
      />
    </div>
  )
}

function getStatusClass(status: string) {
  if (status === 'Active') return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
  return 'border-slate-500/25 bg-slate-500/10 text-slate-400'
}

export function PolicyTimelinePage() {
  const navigate = useNavigate()
  const { id = 'terms' } = useParams<{ id: string }>()
  const policy = getPolicyById(id)
  const versions = getPolicyVersions(id)

  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" subtitle="Policy version timeline" />
      <p className="text-xs text-slate-500">
        <Link to="/settings/main">Platform Control</Link>
        <span> / </span>
        <Link to="/settings/policies">Policy Management</Link>
        <span> / </span>
        <span className="text-white">{policy.title}</span>
      </p>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        Super Admin View: This timeline shows the complete evolution of this policy, including all
        versions, changes, and user impact data.
      </div>

      <div className="space-y-4">
        {versions.map((version, index) => (
          <div key={version.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="grid size-8 place-items-center rounded-full border border-white/10 bg-[#1a1a1a] text-xs font-bold text-white">
                {String(index + 1).padStart(2, '0')}
              </span>
              {index < versions.length - 1 ? <span className="mt-2 h-full w-px bg-white/10" /> : null}
            </div>
            <div className="flex-1 rounded-xl border border-white/5 bg-[#111111] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-white">{policy.title}</h3>
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                    getStatusClass(version.status),
                  )}
                >
                  {version.status}
                </span>
                <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                  {version.version}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Effective: {version.effectiveDate} · Last Updated: {version.lastUpdated} · By:{' '}
                {version.author}
              </p>
              <p className="mt-3 text-sm text-slate-300">{version.changeSummary}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => navigate('/settings/policies')}>
          Back
        </Button>
        <Button onClick={() => toast.message('Save coming soon')}>Save Changes</Button>
      </div>
    </div>
  )
}

export function PolicyDetailPage() {
  const navigate = useNavigate()
  const { id = 'terms' } = useParams<{ id: string }>()
  const policy = getPolicyById(id)
  const latestVersion = getPolicyVersions(id)[0]

  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" subtitle="Policy detail and editor" />
      <div className="space-y-5 rounded-2xl border border-white/10 bg-[#111111] p-6">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold text-white">{policy.title}</h2>
          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
            {policy.status}
          </span>
          <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
            {latestVersion?.version ?? policy.version}
          </span>
        </div>
        <textarea
          rows={8}
          defaultValue={latestVersion?.content ?? 'Enter Policy Content Here...'}
          className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-sm text-white"
        />
        <textarea
          rows={4}
          defaultValue={latestVersion?.changeSummary ?? ''}
          className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-sm text-white"
        />
      </div>
      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => navigate('/settings/policies')}>
          Reset
        </Button>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => toast.message('Draft saved (static)')}>
            Save Draft
          </Button>
          <Button onClick={() => toast.message('Submit coming soon')}>Submit Changes</Button>
        </div>
      </div>
    </div>
  )
}
