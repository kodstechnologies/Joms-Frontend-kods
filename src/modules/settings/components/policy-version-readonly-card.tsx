import { Calendar, Clock, FileText, UserRound } from 'lucide-react'

import type { PolicyVersion } from '../types/settings'
import { cn } from '@/shared/lib/cn'

type PolicyVersionReadonlyCardProps = {
  title: string
  version: PolicyVersion
  className?: string
}

function getStatusClass(status: string) {
  if (status === 'Active') {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  return 'border-white/25 bg-white/10 text-muted'
}

export function PolicyVersionReadonlyCard({
  title,
  version,
  className,
}: PolicyVersionReadonlyCardProps) {
  return (
    <div
      className={cn('bg-brand-surface space-y-4 rounded-xl border border-white/10 p-4', className)}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="bg-brand-bg grid size-10 shrink-0 place-items-center rounded-lg border border-white/10">
            <FileText className="text-muted size-4" />
          </div>
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-body-md-semibold text-white">{title}</h2>
              <span
                className={cn(
                  'text-body-sm rounded-full border px-2.5 py-0.5 font-semibold',
                  getStatusClass(version.status),
                )}
              >
                {version.status}
              </span>
              <span className="border-brand-accent/30 bg-brand-accent/10 text-body-sm text-brand-accent rounded-full border px-2.5 py-0.5 font-semibold">
                {version.version}
              </span>
            </div>
            <div className="text-body-sm text-muted flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                Effective: {version.effectiveDate}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" />
                Last Updated: {version.lastUpdated}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="size-3.5" />
                By: {version.author || 'Super Admin'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-2">
        <p className="text-body-sm-semibold text-white">Policy Information</p>
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-body-sm-semibold mb-2 text-white">What was changed</p>
          <p className="text-body-sm text-muted whitespace-pre-wrap">
            {version.changeSummary || 'No change summary provided for this version.'}
          </p>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-body-sm-semibold text-white">Policy Content</p>
        <div className="bg-brand-bg max-h-[420px] overflow-y-auto rounded-xl border border-white/10 p-4">
          <p className="text-body-md text-brand-text/85 whitespace-pre-wrap">
            {version.content || 'No policy content available for this version.'}
          </p>
        </div>
      </section>
    </div>
  )
}
