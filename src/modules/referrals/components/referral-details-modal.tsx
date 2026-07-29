import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

import type { ExpertInvite } from '../types/referral'
import {
  formatInviteDetailDateTime,
  getInvitedByLabel,
  getReferralStatusLabel,
} from '../utils/referral-format'

type ReferralDetailsModalProps = {
  open: boolean
  onClose: () => void
  expertInvite?: ExpertInvite | null
}

export function ReferralDetailsModal({ open, onClose, expertInvite }: ReferralDetailsModalProps) {
  if (!open || !expertInvite) return null

  const status = expertInvite.status
  const statusClass =
    status === 'active' || status === 'accepted'
      ? 'status-badge-accepted-solid'
      : status === 'pending'
        ? 'status-badge-pending'
        : 'status-badge-default'

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div className="invite-details-modal flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="invite-details-header flex items-center justify-between">
          <h2 className="invite-details-title">Invites Details</h2>
          <button type="button" onClick={onClose} className="invite-details-close-btn">
            <X className="size-4" />
          </button>
        </div>

        {/* Body — 2-col grid */}
        <div className="invite-details-body">
          {/* Left col */}
          <div className="flex flex-col gap-5">
            <DetailCell label="Invite Link" value={expertInvite.inviteLink} truncate />
            <DetailCell label="Invited by" value={getInvitedByLabel(expertInvite.invitedBy)} />
            <div className="flex flex-col gap-1.5">
              <p className="invite-detail-label">Status</p>
              <span className={`${statusClass} inline-flex items-center capitalize`}>
                {getReferralStatusLabel(status)}
              </span>
            </div>
          </div>

          {/* Right col */}
          <div className="flex flex-col gap-5">
            <DetailCell label="Invited Expert" value={expertInvite.invitedExpertName} />
            <DetailCell
              label="Invited at"
              value={formatInviteDetailDateTime(expertInvite.createdAt)}
            />
          </div>
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
}: {
  label: string
  value: React.ReactNode
  truncate?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="invite-detail-label">{label}</p>
      {typeof value === 'string' ? (
        <p className={`invite-detail-value ${truncate ? 'invite-detail-value-truncate' : ''}`}>
          {value}
        </p>
      ) : (
        <div className="invite-detail-value">{value}</div>
      )}
    </div>
  )
}
