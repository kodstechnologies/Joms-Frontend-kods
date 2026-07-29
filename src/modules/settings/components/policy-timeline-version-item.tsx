import { useState } from 'react'
import { Calendar, ChevronDown, Clock, FileText, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { PolicyVersion } from '../types/settings'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

type PolicyTimelineVersionItemProps = {
  index: number
  policySlug: string
  policyTitle: string
  application: string
  version: PolicyVersion
  defaultExpanded?: boolean
}

function getStatusClass(status: string) {
  if (status === 'Active') {
    return 'border-brand-positive/25 bg-brand-positive/10 text-brand-positive'
  }
  return 'border-white/25 bg-white/10 text-muted'
}

export function PolicyTimelineVersionItem({
  index,
  policySlug,
  policyTitle,
  application,
  version,
  defaultExpanded = false,
}: PolicyTimelineVersionItemProps) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const stepLabel = String(index + 1).padStart(2, '0')

  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div className="bg-brand-accent text-body-sm grid size-8 shrink-0 place-items-center rounded-full font-semibold text-black">
          {stepLabel}
        </div>
        <div className="mt-2 w-px flex-1 bg-white/10" />
      </div>

      <article className="bg-brand-surface mb-4 flex-1 rounded-xl border border-white/10 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <FileText className="text-muted size-4" />
              <h3 className="text-body-md-semibold text-white">{policyTitle}</h3>
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

          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="text-body-sm text-muted inline-flex items-center gap-1 hover:text-white"
          >
            {expanded ? 'Collapse' : 'Expand'}
            <ChevronDown className={cn('size-4 transition-transform', expanded && 'rotate-180')} />
          </button>
        </div>

        {expanded ? (
          <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-body-sm-semibold mb-2 text-white">What was changed</p>
              <p className="text-body-sm text-muted whitespace-pre-wrap">
                {version.changeSummary || 'No change summary provided for this version.'}
              </p>
            </div>
            <Button
              className="h-9"
              onClick={() =>
                navigate(
                  `/settings/policies/${policySlug}/view?application=${application}&versionId=${version.id}`,
                )
              }
            >
              View Full Version
            </Button>
          </div>
        ) : null}
      </article>
    </div>
  )
}
