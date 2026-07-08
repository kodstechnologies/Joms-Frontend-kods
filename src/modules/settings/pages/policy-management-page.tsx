import { useNavigate, useParams } from 'react-router-dom'
import { ChevronDown, FileText, Plus, UserRound } from 'lucide-react'
import { toast } from 'sonner'

import { getPolicyById, getPolicyVersions, policyItemsMock } from '../mock/policy-management.mock'
import { SettingsFooterActions } from '../components/settings-footer-actions'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

const SETTINGS_TOP_TABS: Array<{
  key:
    | 'platform'
    | 'security'
    | 'notifications'
    | 'finance'
    | 'incident'
    | 'backup'
    | 'expert'
    | 'venue'
    | 'service'
  label: string
}> = [
  { key: 'platform', label: 'Platform Controls' },
  { key: 'security', label: 'Security & Access' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'finance', label: 'Finance & Transactional' },
  { key: 'incident', label: 'Incident Tracking' },
  { key: 'backup', label: 'Backup Configuration' },
  { key: 'expert', label: 'Expert Application' },
  { key: 'venue', label: 'Venue Management' },
  { key: 'service', label: 'Service Marketplace' },
]

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

      <div className="rounded-xl border border-white/10 bg-[#101010] p-2">
        <div className="overflow-x-auto rounded-lg bg-[#0B0B0B] p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max min-w-full gap-1">
            {SETTINGS_TOP_TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate('/settings/main', { state: { settingsTab: item.key } })}
                className={cn(
                  'shrink-0 rounded-md px-3 py-1.5 text-[11px] font-medium whitespace-nowrap',
                  item.key === 'platform' ? 'bg-[#171717] text-white' : 'text-slate-400',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-white/10 bg-[#111111] p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Policy Management</p>
          <Button onClick={() => navigate('/settings/policies/create')}>
            <Plus className="size-4" />
            Create Policy
          </Button>
        </div>

        {policyItemsMock.map((policy, index) => (
          <section key={policy.id} className="rounded-xl border border-white/10 bg-[#151515]">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-white">{policy.title}</h3>
                  <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                    {policy.version}
                  </span>
                  <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    {policy.status}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Policy reviewed on {policy.lastUpdated} • Effective {policy.effectiveDate}
                </p>
              </div>
              <ChevronDown className="size-4 text-slate-500" />
            </div>

            {index < 2 ? (
              <div className="space-y-3 border-t border-white/10 px-4 py-3">
                <div className="rounded-lg border border-white/10 bg-[#0E0E0E] p-3">
                  <p className="mb-2 text-xs font-semibold text-white">Policy Content</p>
                  <p className="line-clamp-2 text-xs text-slate-400">
                    {getPolicyVersions(policy.id)[0]?.content ??
                      'Policy content preview will appear here for quick review.'}
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/settings/policies/${policy.id}/timeline`)}
                  >
                    View Timeline
                  </Button>
                  <Button onClick={() => navigate(`/settings/policies/${policy.id}`)}>
                    View
                  </Button>
                </div>
              </div>
            ) : null}
          </section>
        ))}

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

  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" subtitle="Track revenue, payouts, and financial performance" />

      <div className="rounded-xl border border-white/10 bg-[#101010] p-2">
        <div className="overflow-x-auto rounded-lg bg-[#0B0B0B] p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max min-w-full gap-1">
            {SETTINGS_TOP_TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate('/settings/main', { state: { settingsTab: item.key } })}
                className={cn(
                  'shrink-0 rounded-md px-3 py-1.5 text-[11px] font-medium whitespace-nowrap',
                  item.key === 'platform' ? 'bg-[#171717] text-white' : 'text-slate-400',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-[#111111] p-4">
        <p className="text-xs text-slate-500">Platform Control / Policy Management / Terms & Condition</p>

        <section className="space-y-4 rounded-xl border border-white/10 bg-[#151515] p-4">
          <p className="text-sm font-semibold text-white">Policy Information</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] text-slate-400">Policy Name</label>
              <input
                defaultValue="Terms & Condition"
                className="h-10 w-full rounded-lg border border-white/10 bg-[#0C0C0C] px-3 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-slate-400">Effective Since</label>
              <input
                defaultValue="01/07/2026"
                className="h-10 w-full rounded-lg border border-white/10 bg-[#0C0C0C] px-3 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-slate-400">Current Version</label>
              <input defaultValue="V1.2" className="h-10 w-full rounded-lg border border-white/10 bg-[#0C0C0C] px-3 text-sm text-white" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-slate-400">New Version</label>
              <input defaultValue="V2.1" className="h-10 w-full rounded-lg border border-white/10 bg-[#0C0C0C] px-3 text-sm text-white" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] text-slate-400">Policy Content</label>
            <textarea
              rows={8}
              defaultValue="Draft Policy Content Here...."
              className="w-full rounded-lg border border-white/10 bg-[#0C0C0C] px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] text-slate-400">Summary Of What Was Changed</label>
            <textarea
              rows={2}
              defaultValue="Added GDPR compliance clauses, updated data retention policy from 12 months to 24 months, and clarified third-party data sharing rules."
              className="w-full rounded-lg border border-white/10 bg-[#0C0C0C] px-3 py-2 text-sm text-white"
            />
            <p className="mt-1 text-[11px] text-slate-500">This field is required for version publishing</p>
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-white/10 bg-[#151515] p-4">
          <p className="text-sm font-semibold text-white">Version & Effective Date</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <button className="rounded-lg border border-amber-500/30 bg-amber-500/15 px-3 py-2 text-left text-xs font-semibold text-amber-200">
              Today
            </button>
            <button className="rounded-lg border border-white/10 bg-[#0C0C0C] px-3 py-2 text-left text-xs text-white">
              Future Date
            </button>
          </div>
          <input defaultValue="07/07/2026" className="h-10 w-full rounded-lg border border-white/10 bg-[#0C0C0C] px-3 text-sm text-white" />
        </section>

        <section className="space-y-3 rounded-xl border border-white/10 bg-[#151515] p-4">
          <p className="text-sm font-semibold text-white">User Re-Consent Settings</p>
          <label className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/15 px-3 py-2 text-xs text-amber-100">
            <input type="checkbox" defaultChecked />
            Require users to re-accept this policy
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0C0C0C] px-3 py-2 text-xs text-slate-200">
            <input type="checkbox" defaultChecked />
            Block app usage until accepted
          </label>
          <div className="flex flex-wrap gap-4 text-xs text-slate-300">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              Email Notification
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" />
              In-App Popup
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" />
              Push Notification
            </label>
          </div>
        </section>
      </div>

      <div className="flex justify-between rounded-xl border border-white/10 bg-[#111111] px-3 py-2.5">
        <Button variant="secondary" className="h-8 text-xs" onClick={() => navigate('/settings/policies')}>
          Reset
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" className="h-8 text-xs" onClick={() => toast.message('Draft saved')}>
            Save Draft
          </Button>
          <Button className="h-8 text-xs" onClick={() => toast.message('Submitted for approval')}>
            Save Changes
          </Button>
        </div>
      </div>
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
      <SectionHeader title="Settings" subtitle="Manage policy versions and review history" />

      <div className="space-y-3 rounded-2xl border border-white/10 bg-[#111111] p-4">
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#151515] px-4 py-3">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-slate-400" />
            <span className="text-sm font-semibold text-white">{policy.title}</span>
            <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
              {policy.version}
            </span>
          </div>
          <Button variant="secondary" onClick={() => navigate(`/settings/policies/${policy.id}`)}>
            View
          </Button>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0E0E0E] p-4">
          <p className="mb-2 text-xs font-semibold text-white">Version History</p>
          <div className="space-y-3">
            {versions.map((version) => (
              <div key={version.id} className="rounded-lg border border-white/10 bg-[#151515] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-white">{version.version}</span>
                  <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold', getStatusClass(version.status))}>
                    {version.status}
                  </span>
                  <span className="text-xs text-slate-500">{version.lastUpdated}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{version.changeSummary}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => navigate('/settings/policies')}>
            Back
          </Button>
          <Button onClick={() => toast.message('Save coming soon')}>Save Changes</Button>
        </div>
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

      <div className="space-y-3 rounded-2xl border border-white/10 bg-[#111111] p-4">
        <div className="rounded-lg border border-white/10 bg-[#151515] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-slate-400" />
              <span className="text-sm font-semibold text-white">{policy.title}</span>
              <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                {latestVersion?.version ?? policy.version}
              </span>
            </div>
            <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              {policy.status}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <UserRound className="size-3.5" />
              {latestVersion?.author ?? 'Super Admin'}
            </span>
            <span>Policy reviewed on {latestVersion?.lastUpdated ?? policy.lastUpdated}</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0E0E0E] p-3">
          <p className="mb-2 text-xs font-semibold text-white">Policy Content</p>
          <textarea
            rows={10}
            defaultValue={latestVersion?.content ?? 'Enter Policy Content Here...'}
            className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-sm text-white"
          />
        </div>
      </div>
      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => navigate('/settings/policies')}>
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => toast.message('Draft saved (static)')}>
            Save Draft
          </Button>
          <Button onClick={() => toast.message('Submit coming soon')}>Submit For Approval</Button>
        </div>
      </div>
    </div>
  )
}
