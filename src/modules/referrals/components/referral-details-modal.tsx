import { X } from 'lucide-react'

import type { ExpertInvite } from '../types/referral'
import {
  formatInviteDetailDateTime,
  getInvitedByLabel,
  getReferralStatusClassName,
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

  const status = expertInvite.status

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div className="ui-modal-shell max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="ui-modal-header">
          <h2 className="text-h4 text-brand-text">Expert Invite Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-brand-text rounded-brand-md p-1.5 hover:bg-white/5"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="ui-modal-body grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                  'text-body-sm inline-flex rounded-full px-4 py-1 font-semibold',
                  status === 'active' || status === 'accepted'
                    ? 'bg-brand-positive text-white'
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
      <p className="text-muted text-body-md">{label}</p>
      <div className="text-brand-text text-body-md font-semibold">{value}</div>
    </div>
  )
}
