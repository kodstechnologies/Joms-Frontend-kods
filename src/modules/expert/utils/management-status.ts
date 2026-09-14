import { cn } from '@/shared/lib/cn'

export type ManagementStatusKey = 'pending' | 'approved' | 'suspended' | 'deleted' | 'rejected'

const normalizeStatusToken = (status: string | null | undefined) =>
  (status || '').toLowerCase().replace(/_/g, ' ').trim()

export const normalizeManagementStatus = (
  status: string | null | undefined,
  options?: { isSuspend?: boolean; isDeleted?: boolean },
): ManagementStatusKey => {
  if (options?.isDeleted) return 'deleted'
  if (options?.isSuspend) return 'suspended'

  const normalized = normalizeStatusToken(status)

  if (['deleted', 'delete', 'deactivated', 'inactive'].includes(normalized)) {
    return 'deleted'
  }
  if (['suspended', 'suspend', 'blocked'].includes(normalized)) {
    return 'suspended'
  }
  if (['rejected', 'reject'].includes(normalized)) {
    return 'rejected'
  }
  if (['approved', 'approve', 'live', 'active'].includes(normalized)) {
    return 'approved'
  }
  if (['pending', 'in review', 'preview', 'draft', 'submitted'].includes(normalized)) {
    return 'pending'
  }

  return 'pending'
}

export const formatManagementStatusLabel = (key: ManagementStatusKey): string => {
  switch (key) {
    case 'pending':
      return 'Pending'
    case 'approved':
      return 'Approved'
    case 'suspended':
      return 'Suspended'
    case 'deleted':
      return 'Deleted'
    case 'rejected':
      return 'Reject'
  }
}

export const getManagementStatusClassName = (key: ManagementStatusKey) =>
  cn(
    'rounded px-2 py-0.5 text-[10px] font-bold uppercase',
    key === 'pending'
      ? 'bg-amber-500/10 text-amber-500'
      : key === 'approved'
        ? 'bg-green-500/10 text-green-500'
        : key === 'suspended'
          ? 'bg-purple-500/10 text-purple-400'
          : key === 'deleted' || key === 'rejected'
            ? 'bg-red-500/10 text-red-400'
            : 'bg-slate-500/10 text-slate-500',
  )

export const getManagementStatusDisplay = (
  status: string | null | undefined,
  options?: { isSuspend?: boolean; isDeleted?: boolean },
) => {
  const key = normalizeManagementStatus(status, options)
  return {
    key,
    label: formatManagementStatusLabel(key),
    className: getManagementStatusClassName(key),
  }
}

const formatListingStatusLabel = (status: string | null | undefined, key: ManagementStatusKey) => {
  if (key === 'deleted') return 'Deleted'
  if (key === 'suspended') return 'Suspended'
  if (key === 'rejected') return 'Rejected'

  const normalized = normalizeStatusToken(status)
  if (['live', 'instant', 'approved', 'published', 'active'].includes(normalized)) {
    return 'Live'
  }
  if (['in review', 'submitted', 'pending'].includes(normalized)) {
    return 'Review Pending'
  }
  if (['preview', 'draft'].includes(normalized)) {
    return 'Preview'
  }
  if (normalized === 'closed') {
    return 'Closed'
  }
  if (normalized === 'paused') {
    return 'Paused'
  }

  return formatManagementStatusLabel(key)
}

const getProfileServiceListingStatusClassName = (
  status: string | null | undefined,
  key: ManagementStatusKey,
) => {
  const normalized = normalizeStatusToken(status)
  const base = 'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase'

  if (key === 'deleted' || key === 'rejected') {
    return cn(base, 'bg-[#FF3B30]/50 text-white')
  }
  if (key === 'suspended') {
    return cn(base, 'bg-[#AF52DE]/50 text-white')
  }
  if (['preview', 'draft', 'closed', 'paused'].includes(normalized)) {
    return cn(base, 'bg-white/50 text-[#050505]')
  }
  if (
    ['live', 'instant', 'approved', 'published', 'active'].includes(normalized) ||
    key === 'approved'
  ) {
    return cn(base, 'bg-[#4CD964]/50 text-white')
  }
  if (['in review', 'submitted', 'pending'].includes(normalized) || key === 'pending') {
    return cn(base, 'bg-[#FFCC00]/50 text-[#050505]')
  }

  return cn(base, 'bg-white/50 text-[#050505]')
}

export const isSubmittedListingStatus = (status: string | null | undefined) => {
  const normalized = normalizeStatusToken(status)
  return Boolean(normalized) && !['preview', 'draft'].includes(normalized)
}

/** Partner-facing labels for services, consultations, venues, and spaces. */
export const getListingStatusDisplay = (
  status: string | null | undefined,
  options?: { isSuspend?: boolean; isDeleted?: boolean },
) => {
  const key = normalizeManagementStatus(status, options)
  return {
    key,
    label: formatListingStatusLabel(status, key),
    className: getManagementStatusClassName(key),
  }
}

/** Overlay chips on expert profile service listing thumbnails. */
export const getProfileServiceListingStatusDisplay = (
  status: string | null | undefined,
  options?: { isSuspend?: boolean; isDeleted?: boolean },
) => {
  const key = normalizeManagementStatus(status, options)
  return {
    key,
    label: formatListingStatusLabel(status, key),
    className: getProfileServiceListingStatusClassName(status, key),
  }
}
