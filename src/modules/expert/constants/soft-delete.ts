import type { DecisionActionModalOption } from '@/shared/components/modal/decision-action-modal'

export const ADMIN_DELETE_REASON_OPTIONS: DecisionActionModalOption[] = [
  { label: 'Spam', value: 'spam' },
  { label: 'Abuse', value: 'abuse' },
  { label: 'Harassment', value: 'harassment' },
  { label: 'Impersonation', value: 'impersonation' },
  { label: 'Policy violation', value: 'policy_violation' },
  { label: 'Misconduct', value: 'misconduct' },
]

export const SOFT_DELETE_GRACE_DAYS = 21

export type SoftDeletePayload = {
  selectedReasons: string[]
  reasonDetails?: string
  adminNotes: string
}

export const formatDeletedReason = (reason?: string | null) => reason || '—'

export const formatDeletedAt = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const getDaysRemainingUntilPermanentDelete = (deletedAt?: string | null) => {
  if (!deletedAt) return null
  const deletedDate = new Date(deletedAt)
  if (Number.isNaN(deletedDate.getTime())) return null

  const expiry = new Date(deletedDate)
  expiry.setDate(expiry.getDate() + SOFT_DELETE_GRACE_DAYS)

  const remainingMs = expiry.getTime() - Date.now()
  return Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)))
}
