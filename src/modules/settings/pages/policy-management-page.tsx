import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Calendar,
  Clock,
  Eye,
  FileText,
  History,
  Plus,
  RotateCw,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'

import { SettingsFooterActions } from '../components/settings-footer-actions'
import {
  useCreatePolicy,
  usePolicies,
  usePolicy,
  usePolicyVersions,
  useUpdatePolicy,
} from '../hooks/use-policies'
import type { PolicyItem } from '../types/settings'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

const POLICY_SETTINGS_TABS: Array<{
  key:
    | 'platform'
    | 'security'
    | 'user'
    | 'expert'
    | 'event'
    | 'venue'
    | 'service'
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

function PolicySettingsTopTabs({ activeKey = 'service' }: { activeKey?: string }) {
  const navigate = useNavigate()

  return (
    <div className="rounded-xl border border-white/10 bg-[#101010] p-2">
      <div className="overflow-x-auto rounded-lg bg-[#0B0B0B] p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max min-w-full gap-1">
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
                'shrink-0 rounded-md px-3 py-1.5 text-[11px] font-medium whitespace-nowrap transition-colors',
                item.key === activeKey
                  ? 'border border-white/20 bg-[#171717] text-white'
                  : 'text-slate-400 hover:text-white',
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
      className="inline-flex items-center gap-2 rounded-lg border border-[#F0C27B]/35 bg-[#1A1A1A] px-3 py-2 text-xs font-medium text-white hover:border-[#F0C27B]/60"
    >
      <Icon className="size-3.5 text-[#F0C27B]" />
      {label}
    </button>
  )
}

function PolicyRow({ policy }: { policy: PolicyItem }) {
  const navigate = useNavigate()

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#151515] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-[#101010]">
          <FileText className="size-4 text-slate-400" />
        </div>
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-white">{policy.title}</h3>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
              {policy.status}
            </span>
            <span className="rounded-full border border-[#F0C27B]/30 bg-[#F0C27B]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#F0C27B]">
              {policy.version}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
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
  const { data: policies = [], isLoading } = usePolicies()

  return (
    <div className="space-y-6">
      <PolicySettingsTopTabs activeKey="service" />

      <div className="space-y-4 rounded-2xl border border-white/10 bg-[#111111] p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Policy Management</h2>
            <p className="mt-1 text-sm text-slate-400">
              Manage platform policies, terms, and legal documents
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/settings/policies/create')}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F0C27B] px-4 py-2.5 text-sm font-semibold text-[#050505] hover:bg-[#E6B46C]"
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
  const createMutation = useCreatePolicy()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [version, setVersion] = useState('V1.0')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [content, setContent] = useState('')
  const [changeSummary, setChangeSummary] = useState('')

  const handleCreate = (status: 'Draft' | 'Active') => {
    if (!title.trim() || !slug.trim() || !version.trim()) {
      toast.error('Title, slug, and version are required')
      return
    }

    createMutation.mutate(
      {
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        title: title.trim(),
        version: version.trim(),
        status,
        effectiveDate,
        content,
        changeSummary,
        author: 'Super Admin',
      },
      {
        onSuccess: (policy) => {
          toast.success(status === 'Draft' ? 'Draft saved' : 'Policy created')
          navigate(`/settings/policies/${policy.id}`)
        },
        onError: () => toast.error('Failed to create policy'),
      },
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" subtitle="Track revenue, payouts, and financial performance" />
      <PolicySettingsTopTabs activeKey="service" />

      <div className="space-y-4 rounded-2xl border border-white/10 bg-[#111111] p-4">
        <p className="text-xs text-slate-500">Platform Control / Policy Management / Create Policy</p>

        <section className="space-y-4 rounded-xl border border-white/10 bg-[#151515] p-4">
          <p className="text-sm font-semibold text-white">Policy Information</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] text-slate-400">Policy Name</label>
              <input
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value)
                  if (!slug) setSlug(event.target.value.toLowerCase().replace(/\s+/g, '-'))
                }}
                className="h-10 w-full rounded-lg border border-white/10 bg-[#0C0C0C] px-3 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-slate-400">Slug</label>
              <input
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                className="h-10 w-full rounded-lg border border-white/10 bg-[#0C0C0C] px-3 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-slate-400">Version</label>
              <input
                value={version}
                onChange={(event) => setVersion(event.target.value)}
                className="h-10 w-full rounded-lg border border-white/10 bg-[#0C0C0C] px-3 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-slate-400">Effective Since</label>
              <input
                value={effectiveDate}
                onChange={(event) => setEffectiveDate(event.target.value)}
                placeholder="DD/MM/YYYY"
                className="h-10 w-full rounded-lg border border-white/10 bg-[#0C0C0C] px-3 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] text-slate-400">Policy Content</label>
            <textarea
              rows={8}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Draft Policy Content Here...."
              className="w-full rounded-lg border border-white/10 bg-[#0C0C0C] px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] text-slate-400">Summary Of What Was Changed</label>
            <textarea
              rows={2}
              value={changeSummary}
              onChange={(event) => setChangeSummary(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0C0C0C] px-3 py-2 text-sm text-white"
            />
            <p className="mt-1 text-[11px] text-slate-500">This field is required for version publishing</p>
          </div>
        </section>
      </div>

      <div className="flex justify-between rounded-xl border border-white/10 bg-[#111111] px-3 py-2.5">
        <Button variant="secondary" className="h-8 text-xs" onClick={() => navigate('/settings/policies')}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="h-8 text-xs"
            disabled={createMutation.isPending}
            onClick={() => handleCreate('Draft')}
          >
            Save Draft
          </Button>
          <Button
            className="h-8 text-xs"
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
  if (status === 'Active') return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
  return 'border-slate-500/25 bg-slate-500/10 text-slate-400'
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
        <p className="text-slate-400">Policy not found.</p>
        <Button variant="secondary" onClick={() => navigate('/settings/policies')}>
          Back
        </Button>
      </div>
    )
  }

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
                  <span
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                      getStatusClass(version.status),
                    )}
                  >
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
        </div>
      </div>
    </div>
  )
}

export function PolicyDetailPage() {
  const navigate = useNavigate()
  const { id = 'terms' } = useParams<{ id: string }>()
  const { data: policy, isLoading: policyLoading } = usePolicy(id)
  const { data: versions = [] } = usePolicyVersions(id)
  const updateMutation = useUpdatePolicy(id)
  const [content, setContent] = useState<string | null>(null)

  const latestVersion = versions[0]
  const displayContent = content ?? policy?.content ?? latestVersion?.content ?? ''

  if (policyLoading) {
    return <div className="h-40 animate-pulse rounded-xl bg-white/5" />
  }

  if (!policy) {
    return (
      <div className="space-y-4">
        <p className="text-slate-400">Policy not found.</p>
        <Button variant="secondary" onClick={() => navigate('/settings/policies')}>
          Back
        </Button>
      </div>
    )
  }

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
              {latestVersion?.author ?? policy.author ?? 'Super Admin'}
            </span>
            <span>Policy reviewed on {latestVersion?.lastUpdated ?? policy.lastUpdated}</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0E0E0E] p-3">
          <p className="mb-2 text-xs font-semibold text-white">Policy Content</p>
          <textarea
            rows={10}
            value={displayContent}
            onChange={(event) => setContent(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-sm text-white"
          />
        </div>
      </div>
      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => navigate('/settings/policies')}>
          Back
        </Button>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            disabled={updateMutation.isPending}
            onClick={() =>
              updateMutation.mutate(
                { content: displayContent },
                {
                  onSuccess: () => toast.success('Draft saved'),
                  onError: () => toast.error('Failed to save draft'),
                },
              )
            }
          >
            Save Draft
          </Button>
          <Button
            disabled={updateMutation.isPending}
            onClick={() =>
              updateMutation.mutate(
                { content: displayContent, changeSummary: 'Content updated via admin panel' },
                {
                  onSuccess: () => toast.success('Policy updated'),
                  onError: () => toast.error('Failed to update policy'),
                },
              )
            }
          >
            Submit For Approval
          </Button>
        </div>
      </div>
    </div>
  )
}
