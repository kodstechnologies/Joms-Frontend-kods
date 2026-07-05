import { cn } from '@/shared/lib/cn'

export type ManagementStatusKey =
  | 'pending'
  | 'approved'
  | 'suspended'
  | 'deleted'
  | 'rejected'

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
  if (
    ['pending', 'in review', 'preview', 'draft', 'submitted'].includes(normalized)
  ) {
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
      return 'Suspend'
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
