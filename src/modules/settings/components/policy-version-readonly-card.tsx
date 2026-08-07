import { Calendar, FileText, UserRound } from 'lucide-react'

import type { PolicyVersion } from '../types/settings'
import { cn } from '@/shared/lib/cn'

type PolicyVersionReadonlyCardProps = {
  title: string
  version: PolicyVersion
  className?: string
}

export function PolicyVersionReadonlyCard({
  title,
  version,
  className,
}: PolicyVersionReadonlyCardProps) {
  const status = version.status || 'Active'

  return (
    <div className={cn('policy-view-card space-y-5', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
        <div className="min-w-0 space-y-3">
          <div className="policy-list-row-title-line">
            <FileText className="policy-list-doc-icon" aria-hidden />
            <h2 className="policy-list-row-title">{title}</h2>
            <span
              className={cn(
                'policy-status-badge',
                status === 'Active' ? 'policy-status-badge--active' : 'policy-status-badge--muted',
              )}
            >
              {status}
            </span>
            <span className="policy-version-badge">{version.version}</span>
          </div>

          <div className="policy-list-row-meta">
            <span className="policy-meta-item">
              <Calendar className="policy-meta-icon" aria-hidden />
              <span className="policy-meta-label">Effective:</span>
              <span className="policy-meta-value">{version.effectiveDate || '—'}</span>
            </span>
            <span className="policy-meta-item">
              <Calendar className="policy-meta-icon" aria-hidden />
              <span className="policy-meta-label">Last Updated:</span>
              <span className="policy-meta-value">{version.lastUpdated || '—'}</span>
            </span>
          </div>

          <div className="policy-timeline-author">
            <UserRound className="policy-meta-icon" aria-hidden />
            <span className="policy-meta-label">By:</span>
            <span className="policy-meta-value">{version.author || 'Super Admin'}</span>
          </div>
        </div>

        <span
          className={cn(
            'policy-status-chip',
            status === 'Active' ? 'policy-status-chip--active' : 'policy-status-chip--muted',
          )}
        >
          {status}
        </span>
      </div>

      <section className="space-y-2">
        <p className="policy-change-label">Policy Information</p>
        <div className="policy-view-change-box">
          <p className="policy-change-label">What was changed</p>
          <p className="policy-change-text">
            {version.changeSummary || 'No change summary provided for this version.'}
          </p>
        </div>
      </section>

      <section className="space-y-2">
        <p className="policy-change-label">Policy Content</p>
        <div className="policy-view-content-box">
          <p className="text-body-md text-brand-text/85 whitespace-pre-wrap">
            {version.content || 'No policy content available for this version.'}
          </p>
        </div>
      </section>
    </div>
  )
}
