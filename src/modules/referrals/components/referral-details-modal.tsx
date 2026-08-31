import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

import type { ExpertInvite } from '../types/referral'
import {
  formatInviteDetailDateTime,
  getInvitedByLabel,
  getReferralStatusLabel,
} from '../utils/referral-format'
import { cn } from '@/shared/lib/cn'

type ReferralDetailsModalProps = {
  open: boolean
  onClose: () => void
  expertInvite?: ExpertInvite | null
}

export function ReferralDetailsModal({ open, onClose, expertInvite }: ReferralDetailsModalProps) {
  if (!open || !expertInvite) return null

  const isPlatformReferral = expertInvite.sourceType === 'Platform Referral'
  const status = expertInvite.status
  const statusTone =
    status === 'accepted' ? 'is-active' : status === 'pending' ? 'is-pending' : 'is-default'
  const statusLabel = status === 'accepted' ? 'Active' : getReferralStatusLabel(status)

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div className="invite-details-modal flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="invite-details-header flex items-center justify-between">
          <h2 className="invite-details-title">
            {isPlatformReferral ? 'Invites Details' : 'Referral Details'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="invite-details-close-btn"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="invite-details-body">
          {isPlatformReferral ? (
            <>
              <div className="invite-details-col">
                <DetailCell label="Invite Link" value={expertInvite.inviteLink || '—'} truncate />
                <DetailCell
                  label="Invited by"
                  value={getInvitedByLabel(expertInvite.referrerName)}
                />
                <StatusField label="Status" statusLabel={statusLabel} tone={statusTone} />
              </div>

              <div className="invite-details-col">
                <DetailCell label="Invited Expert" value={expertInvite.referredExpertName || '—'} />
                <DetailCell
                  label="Invited at"
                  value={formatInviteDetailDateTime(expertInvite.createdAt)}
                  date
                />
                <GoalProgressField
                  signedUpCount={
                    expertInvite.goalProgress?.signedUpCount ?? (status === 'accepted' ? 1 : 0)
                  }
                  maxReferrals={expertInvite.goalProgress?.maxReferrals || 10}
                  percent={expertInvite.goalProgressPercent}
                />
              </div>
            </>
          ) : (
            <>
              <div className="invite-details-col">
                <DetailCell
                  label="Referral Code"
                  value={expertInvite.referralCode || expertInvite.referralId || '—'}
                />
                <DetailCell label="Referred by" value={expertInvite.referrerName || '—'} />
                <StatusField label="Status" statusLabel={statusLabel} tone={statusTone} />
              </div>

              <div className="invite-details-col">
                <DetailCell label="Referred user" value={expertInvite.referredExpertName || '—'} />
                <DetailCell
                  label="Referred at"
                  value={formatInviteDetailDateTime(expertInvite.createdAt)}
                  date
                />
                <GoalProgressField
                  signedUpCount={
                    expertInvite.goalProgress?.signedUpCount ?? (status === 'accepted' ? 1 : 0)
                  }
                  maxReferrals={expertInvite.goalProgress?.maxReferrals || 10}
                  percent={expertInvite.goalProgressPercent}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

function DetailCell({
  label,
  value,
  truncate,
  date,
}: {
  label: string
  value: string
  truncate?: boolean
  date?: boolean
}) {
  return (
    <div className="invite-detail-field">
      <p className="invite-detail-label">{label}</p>
      <p
        className={cn(
          'invite-detail-value',
          date && 'invite-detail-value-date',
          truncate && 'invite-detail-value-truncate',
        )}
      >
        {value}
      </p>
    </div>
  )
}

function StatusField({
  label,
  statusLabel,
  tone,
}: {
  label: string
  statusLabel: string
  tone: 'is-active' | 'is-pending' | 'is-default'
}) {
  return (
    <div className="invite-detail-field">
      <p className="invite-detail-label">{label}</p>
      <span className={cn('invite-details-status-badge', tone)}>{statusLabel}</span>
    </div>
  )
}

function GoalProgressField({
  signedUpCount,
  maxReferrals,
  percent,
}: {
  signedUpCount: number
  maxReferrals: number
  percent?: number | null
}) {
  const calculatedPercent =
    percent ?? Math.min(100, Math.max(0, Math.round((signedUpCount / (maxReferrals || 10)) * 100)))

  return (
    <div className="invite-detail-field">
      <p className="invite-detail-label">Goal Progress</p>
      <div className="flex w-full max-w-[200px] flex-col gap-1.5 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-white">
            {signedUpCount} / {maxReferrals}
          </span>
          <span className="text-brand-text font-medium">{calculatedPercent}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="bg-brand-accent h-full rounded-full transition-all duration-300"
            style={{ width: `${calculatedPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
