import { X } from 'lucide-react'

import type { ExpertInvite } from '../types/referral'
import {
  formatInviteDetailDateTime,
  getInvitedByLabel,
  getReferralStatusClassName,
  getReferralStatusLabel,
} from '../utils/referral-format'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

type ReferralDetailsModalProps = {
  open: boolean
  onClose: () => void
  expertInvite?: ExpertInvite | null
}

export function ReferralDetailsModal({
  open,
  onClose,
  expertInvite,
}: ReferralDetailsModalProps) {
  if (!open || !expertInvite) return null

  const status = expertInvite.status

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          'w-full max-w-2xl border border-white/10 bg-brand-surface shadow-2xl',
          uiTokens.radiusCard,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="text-lg font-semibold text-brand-text">Expert Invite Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-brand-md p-1.5 text-brand-muted hover:bg-white/5 hover:text-brand-text"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 px-6 py-6 sm:grid-cols-2">
          <DetailCell label="Invite Link" value={expertInvite.inviteLink} />
          <DetailCell label="Invited Expert" value={expertInvite.invitedExpertName} />
          <DetailCell label="Invited by" value={getInvitedByLabel(expertInvite.invitedBy)} />
          <DetailCell
            label="Invited at"
            value={formatInviteDetailDateTime(expertInvite.createdAt)}
          />
          <DetailCell
            label="Status"
            value={
              <span
                className={cn(
                  'inline-flex rounded-full px-4 py-1 text-xs font-semibold',
                  status === 'active' || status === 'accepted'
                    ? 'bg-emerald-500 text-white'
                    : getReferralStatusClassName(status),
                )}
              >
                {getReferralStatusLabel(status)}
              </span>
            }
          />
        </div>
      </div>
    </div>
  )
}

function DetailCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-brand-muted">{label}</p>
      <div className="text-sm font-semibold text-brand-text">{value}</div>
    </div>
  )
}
