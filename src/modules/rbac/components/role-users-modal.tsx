import { UserRound, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useRoleUsers } from '../hooks/use-rbac'
import type { SubAdmin } from '../types/rbac'
import { RbacLoader } from './rbac-loader'

type RoleUsersModalProps = {
  open: boolean
  roleId: string
  onClose: () => void
}

function UserRow({
  user,
  onViewProfile,
}: {
  user: SubAdmin
  onViewProfile: (userId: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-brand-md border border-white/10 bg-[#0F0F0F]/60 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-[#111111]">
          {user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={user.fullname}
              className="size-full object-cover"
            />
          ) : (
            <UserRound className="size-5 text-brand-muted" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-brand-text">{user.fullname}</p>
          <p className="truncate text-xs text-brand-muted">{user.email}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onViewProfile(user.id)}
        className="shrink-0 text-xs font-medium text-brand-accent underline decoration-brand-accent/40 underline-offset-2 hover:text-brand-gold-from"
      >
        View Profile
      </button>
    </div>
  )
}

export function RoleUsersModal({ open, roleId, onClose }: RoleUsersModalProps) {
  const navigate = useNavigate()
  const { data, isLoading } = useRoleUsers(roleId, { limit: 100 }, { enabled: open && Boolean(roleId) })
  const users = data?.data.users ?? []

  const handleViewProfile = (userId: string) => {
    onClose()
    navigate(`/settings/access/users/${userId}`)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 text-brand-text"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-users-modal-title"
        className="flex max-h-[90vh] w-full max-w-[520px] flex-col overflow-hidden rounded-brand-md border border-white/10 bg-brand-surface shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 id="role-users-modal-title" className="text-[18px] font-semibold text-brand-text">
              List of Users
            </h2>
            <p className="mt-1 text-sm text-brand-muted">All the user who are the admins</p>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="rounded-full p-1 text-brand-text transition-colors hover:bg-white/10"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <RbacLoader label="Loading users..." className="min-h-[120px]" />
          ) : users.length === 0 ? (
            <p className="py-4 text-center text-sm text-brand-muted">No users assigned to this role.</p>
          ) : (
            users.map((user) => (
              <UserRow key={user.id} user={user} onViewProfile={handleViewProfile} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
