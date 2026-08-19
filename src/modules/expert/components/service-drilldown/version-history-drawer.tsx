import { useState } from 'react'
import { ArrowLeft, History, X } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { useServiceRevisionSnapshot, useServiceRevisions } from '../../hooks/use-service-drilldown'
import type { ServiceRevision } from '../../type/service-drilldown'
import { EmptyState, ShimmerBlock } from './drilldown-primitives'
import { DASH, formatCurrency, formatDateTime, titleCase } from './drilldown-format'

type VersionHistoryDrawerProps = {
  open: boolean
  serviceId: string
  onClose: () => void
}

const outcomeStyles: Record<ServiceRevision['outcome'], string> = {
  approved: 'bg-brand-positive/15 text-brand-positive',
  rejected: 'bg-brand-danger/15 text-red-400',
  pending: 'bg-brand-accent/15 text-brand-accent',
}

type SnapshotShape = {
  title?: string
  description?: string
  status?: string
  pricingType?: string
  fixedPricing?: { price?: number; discountPercent?: number }
  customPricing?: { minPrice?: number; maxPrice?: number }
  tieredPricing?: { tiers?: { name?: string; price?: number }[] }
  rejectionReason?: string | null
  adminNote?: string | null
}

function SnapshotView({
  serviceId,
  revisionId,
  onBack,
}: {
  serviceId: string
  revisionId: string
  onBack: () => void
}) {
  const { data, isLoading } = useServiceRevisionSnapshot(serviceId, revisionId)
  const revision = data?.data
  const snapshot = (revision?.snapshot || {}) as SnapshotShape

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="text-body-sm text-muted hover:text-brand-text flex items-center gap-2 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to version history
      </button>

      {isLoading ? (
        <div className="space-y-3">
          <ShimmerBlock className="h-5 w-2/3" />
          <ShimmerBlock className="h-20 w-full" />
          <ShimmerBlock className="h-16 w-full" />
        </div>
      ) : !revision ? (
        <EmptyState message="This version could not be loaded." />
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-white/5 bg-black p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-body-md font-semibold text-white">
                Version {revision.versionNumber}
              </p>
              <span className="text-muted text-[10px]">{formatDateTime(revision.resolvedAt)}</span>
            </div>
            <p className="text-body-sm text-muted mt-1">
              {revision.actionLabel}
              {revision.actorName ? ` by ${revision.actorName}` : ''}
              {revision.actorRole ? ` (${revision.actorRole})` : ''}
            </p>
          </div>

          <div className="rounded-lg border border-white/5 bg-black p-4">
            <p className="text-body-sm text-muted">Title</p>
            <p className="text-body-sm mt-1 font-semibold text-white">{snapshot.title || DASH}</p>

            <p className="text-body-sm text-muted mt-3">Description</p>
            <p className="text-body-sm mt-1 leading-relaxed text-white">
              {snapshot.description || DASH}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-body-sm text-muted">Status</p>
                <p className="text-body-sm mt-1 font-semibold text-white">
                  {titleCase(snapshot.status)}
                </p>
              </div>
              <div>
                <p className="text-body-sm text-muted">Pricing model</p>
                <p className="text-body-sm mt-1 font-semibold text-white">
                  {titleCase(snapshot.pricingType)}
                </p>
              </div>
            </div>

            {snapshot.pricingType === 'fixed' && snapshot.fixedPricing ? (
              <p className="text-body-sm mt-3 text-white">
                {formatCurrency(snapshot.fixedPricing.price)}
                {snapshot.fixedPricing.discountPercent
                  ? ` · ${snapshot.fixedPricing.discountPercent}% off`
                  : ''}
              </p>
            ) : null}

            {snapshot.pricingType === 'custom' && snapshot.customPricing ? (
              <p className="text-body-sm mt-3 text-white">
                {formatCurrency(snapshot.customPricing.minPrice)} –{' '}
                {formatCurrency(snapshot.customPricing.maxPrice)}
              </p>
            ) : null}

            {snapshot.pricingType === 'tiered' && snapshot.tieredPricing?.tiers?.length ? (
              <ul className="text-body-sm mt-3 space-y-1 text-white">
                {snapshot.tieredPricing.tiers.map((tier) => (
                  <li key={tier.name}>
                    {titleCase(tier.name)} — {formatCurrency(tier.price)}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {revision.rejectionReason || revision.reasonFor.length > 0 || revision.note ? (
            <div className="border-brand-danger/30 rounded-lg border bg-black p-4">
              {revision.reasonFor.length > 0 ? (
                <div className="mb-2 flex flex-wrap gap-2">
                  {revision.reasonFor.map((reason) => (
                    <span
                      key={reason}
                      className="rounded-full border border-white/20 px-2.5 py-1 text-[10px] text-white"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              ) : null}
              {revision.rejectionReason ? (
                <p className="text-body-sm text-white">{revision.rejectionReason}</p>
              ) : null}
              {revision.note ? (
                <p className="text-body-sm text-muted mt-2">Admin note: {revision.note}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export function VersionHistoryDrawer({ open, serviceId, onClose }: VersionHistoryDrawerProps) {
  const [activeRevisionId, setActiveRevisionId] = useState<string | null>(null)
  const { data, isLoading } = useServiceRevisions(serviceId, open)
  const revisions = data?.data ?? []

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70"
      role="presentation"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Version history"
        className="bg-brand-surface flex h-full w-full max-w-[520px] flex-col border-l border-white/10"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-2">
            <History className="text-brand-accent size-4" aria-hidden="true" />
            <h2 className="text-h2 text-brand-text">Version History</h2>
          </div>
          <button
            type="button"
            aria-label="Close version history"
            onClick={onClose}
            className="text-brand-muted grid size-6 place-items-center rounded-full transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeRevisionId ? (
            <SnapshotView
              serviceId={serviceId}
              revisionId={activeRevisionId}
              onBack={() => setActiveRevisionId(null)}
            />
          ) : isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, index) => (
                <ShimmerBlock key={index} className="h-24 w-full" />
              ))}
            </div>
          ) : revisions.length === 0 ? (
            <EmptyState message="No version history recorded for this service yet." />
          ) : (
            <ol className="space-y-3">
              {revisions.map((revision) => (
                <li key={revision._id} className="rounded-lg border border-white/5 bg-black p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-body-sm font-semibold text-white">
                        Version {revision.versionNumber} · {revision.actionLabel}
                      </p>
                      <p className="text-muted mt-1 text-[10px]">
                        Raised {formatDateTime(revision.raisedAt)}
                      </p>
                      <p className="text-muted text-[10px]">
                        Resolved {formatDateTime(revision.resolvedAt)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase',
                        outcomeStyles[revision.outcome],
                      )}
                    >
                      {revision.outcome}
                    </span>
                  </div>

                  {revision.actorName ? (
                    <p className="text-body-sm text-muted mt-2">
                      By {revision.actorName}
                      {revision.actorRole ? ` · ${revision.actorRole}` : ''}
                    </p>
                  ) : null}

                  {revision.rejectionReason ? (
                    <p className="text-body-sm mt-2 text-red-300">{revision.rejectionReason}</p>
                  ) : null}

                  {revision.hasSnapshot ? (
                    <button
                      type="button"
                      onClick={() => setActiveRevisionId(revision._id)}
                      className="text-brand-accent mt-3 text-[11px] font-semibold hover:underline"
                    >
                      {revision.outcome === 'rejected'
                        ? 'View Rejected Service'
                        : 'View Updated Service'}
                    </button>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </div>
      </aside>
    </div>
  )
}
