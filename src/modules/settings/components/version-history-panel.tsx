import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { ArrowLeft, Briefcase, CalendarDays, Clock3, UserRound } from 'lucide-react'

import type { SettingsLog, SettingsModule } from '../types/settings'
import { useSettingsModuleVersions } from '../hooks/use-settings'
import { cn } from '@/shared/lib/cn'
import { formatDateTimeEnInSettingsVersion as formatDateTime } from '@/shared/lib/format-datetime'

type VersionHistoryPanelProps = {
  open: boolean
  module: SettingsModule | null
  onClose: () => void
}

const metaTextClass =
  "font-['Figtree',ui-sans-serif,system-ui,sans-serif] text-[14px] leading-5 font-medium tracking-normal text-white/55"
const valueTextClass =
  "font-['Figtree',ui-sans-serif,system-ui,sans-serif] text-[14px] leading-5 font-medium tracking-normal text-white"
const headerTextClass =
  "font-['Figtree',ui-sans-serif,system-ui,sans-serif] text-[14px] leading-5 font-semibold tracking-normal text-white"

function MetaRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <p className={cn(metaTextClass, 'flex items-start gap-2')}>
      <span
        className="mt-0.5 grid size-4 shrink-0 place-items-center text-white"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span>
        {label}: {value}
      </span>
    </p>
  )
}

function VersionCard({
  version,
  isFirst,
  isLast,
}: {
  version: SettingsLog
  isFirst: boolean
  isLast: boolean
}) {
  const changes = version.changes || []
  const isActive = Boolean(version.isCurrentVersion || isFirst)

  return (
    <div className="relative flex gap-4">
      <div className="relative flex w-8 shrink-0 flex-col items-center">
        {!isFirst ? <div className="absolute top-0 h-3 w-px bg-white/25" /> : null}
        <div className="bg-brand-bg z-[1] mt-3 grid size-8 place-items-center rounded-full border border-white/20">
          <Clock3 className="size-3.5 text-white" strokeWidth={1.75} />
        </div>
        {!isLast ? <div className="mt-0 w-px flex-1 bg-white/25" /> : <div className="h-3" />}
      </div>

      <article className="min-w-0 flex-1 pb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2 pt-3">
          <span
            className={cn(
              'size-2.5 shrink-0 rounded-full',
              isActive ? 'bg-[#00A63E]' : 'bg-[#E0A263]',
            )}
            aria-hidden="true"
          />
          <p className={cn(headerTextClass, 'min-w-0 flex-1')}>
            Version {version.version || '—'}
            {isActive ? ' (Current Active)' : ''}
          </p>
          {isActive ? (
            <span className="inline-flex h-[22px] items-center rounded-[10px] border border-[#00A63E]/30 bg-[#00A63E]/15 px-2.5 text-[11px] font-semibold text-[#00A63E]">
              Active
            </span>
          ) : null}
        </div>

        <div className="mb-4 space-y-2">
          <MetaRow
            icon={<CalendarDays className="size-3.5" strokeWidth={1.75} />}
            label="Changed By"
            value={version.performedBy || '—'}
          />
          <MetaRow
            icon={<Briefcase className="size-3.5" strokeWidth={1.75} />}
            label="Role"
            value={version.role || 'Admin'}
          />
          <MetaRow
            icon={<CalendarDays className="size-3.5" strokeWidth={1.75} />}
            label="Date"
            value={formatDateTime(version.createdAt)}
          />
          <MetaRow
            icon={<UserRound className="size-3.5" strokeWidth={1.75} />}
            label="Reason"
            value={version.adminNote?.trim() || '—'}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[360px] text-left">
            <thead>
              <tr className="border-b border-white/15">
                <th className={cn(headerTextClass, 'pr-3 pb-2.5')}>Setting</th>
                <th className={cn(headerTextClass, 'pr-3 pb-2.5')}>Old Value</th>
                <th className={cn(headerTextClass, 'pb-2.5')}>New Value</th>
              </tr>
            </thead>
            <tbody>
              {changes.length ? (
                changes.map((change, index) => (
                  <tr key={`${change.setting}-${index}`} className="border-b border-white/10">
                    <td className={cn(valueTextClass, 'py-2.5 pr-3')}>{change.setting}</td>
                    <td className={cn(valueTextClass, 'py-2.5 pr-3 text-white/70')}>
                      {change.oldValue == null || change.oldValue === ''
                        ? '—'
                        : String(change.oldValue)}
                    </td>
                    <td className={cn(valueTextClass, 'py-2.5')}>
                      {change.newValue == null || change.newValue === ''
                        ? '—'
                        : String(change.newValue)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className={cn(metaTextClass, 'py-3 text-center')}>
                    No changes recorded
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  )
}

export function VersionHistoryPanel({ open, module, onClose }: VersionHistoryPanelProps) {
  const { data, isLoading } = useSettingsModuleVersions(module || undefined, {
    page: 1,
    limit: 30,
  })

  if (!open || !module) return null

  const versions = data?.data ?? []

  return createPortal(
    <div className="fixed inset-0 z-[130] flex justify-end bg-black/60">
      <div className="flex h-full w-full max-w-xl flex-col border-l border-white/10 bg-[#050505]">
        <div className="flex items-start gap-3 border-b border-white/10 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="mt-1 text-white/70 transition-colors hover:text-white"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h2 className="font-['Figtree',ui-sans-serif,system-ui,sans-serif] text-[24px] leading-8 font-semibold tracking-normal text-white">
              Version History
            </h2>
            <p className="mt-1 font-['Figtree',ui-sans-serif,system-ui,sans-serif] text-[14px] leading-5 font-medium tracking-normal text-white/55">
              Track all changes and revisions made to this service before approval.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-40 animate-pulse rounded-[10px] bg-white/5" />
              ))}
            </div>
          ) : versions.length === 0 ? (
            <div className="rounded-[10px] border border-white/10 p-6 text-center text-sm text-white/50">
              No version history for this module yet.
            </div>
          ) : (
            versions.map((version, index) => (
              <VersionCard
                key={version.id}
                version={version}
                isFirst={index === 0}
                isLast={index === versions.length - 1}
              />
            ))
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
