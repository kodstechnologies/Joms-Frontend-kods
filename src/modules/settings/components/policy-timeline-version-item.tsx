import { useState } from 'react'
import { Calendar, ChevronDown, FileText, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { PolicyVersion } from '../types/settings'
import { policyViewPath } from '../utils/policy-navigation'
import { cn } from '@/shared/lib/cn'

type PolicyTimelineVersionItemProps = {
  index: number
  policySlug: string
  policyTitle: string
  application: string
  version: PolicyVersion
  defaultExpanded?: boolean
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
  const status = version.status || 'Active'
  const author = version.author?.trim() || 'John Deo(Super Admin)'

  return (
    <div className={cn('policy-timeline-row', expanded && 'is-expanded')}>
      <div className="policy-timeline-rail" aria-hidden>
        <div className="policy-timeline-node">{stepLabel}</div>
        <div className="policy-timeline-line" />
      </div>

      <article className={cn('policy-timeline-card', expanded && 'policy-timeline-card--expanded')}>
        <div className="policy-timeline-card-top">
          <div className="policy-timeline-card-body">
            <div className="policy-list-row-title-line">
              <FileText className="policy-list-doc-icon" aria-hidden />
              <h3 className="policy-list-row-title">{policyTitle}</h3>
              <span
                className={cn(
                  'policy-status-badge',
                  status === 'Active'
                    ? 'policy-status-badge--active'
                    : 'policy-status-badge--muted',
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
              <span className="policy-meta-value">{author}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="policy-timeline-expand-btn"
            aria-expanded={expanded}
          >
            {expanded ? 'Collapse' : 'Expand'}
            <ChevronDown
              className={cn('policy-timeline-expand-icon', expanded && 'is-open')}
              aria-hidden
            />
          </button>
        </div>

        {expanded ? (
          <div className="policy-timeline-card-expanded">
            <div className="policy-timeline-change-section">
              <p className="policy-timeline-change-heading">What was changed</p>
              <div className="policy-timeline-change-box">
                <p>{version.changeSummary || 'No change summary provided for this version.'}</p>
              </div>
            </div>

            <button
              type="button"
              className="policy-timeline-view-full-btn"
              onClick={() => navigate(policyViewPath(policySlug, application, version.id))}
            >
              View Full Version
            </button>
          </div>
        ) : null}
      </article>
    </div>
  )
}
