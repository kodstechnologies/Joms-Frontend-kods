import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ClipboardList, Trash2, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import createAccountIcon from '@/assets/JOMS_ICONS-2/create-account-icon.png'
import { ExportDataIcon, ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'

import { useAuthStore } from '@/modules/auth/store/auth-store'
import { DecisionActionModal } from '@/shared/components/modal/decision-action-modal'
import {
  MODERATION_CATEGORY_SLUGS,
  recordModerationReasonUsage,
} from '@/modules/settings/api/templates-api'
import { useModerationReasonOptions } from '@/modules/settings/hooks/use-templates'
import { InviteExpertReferralModal } from '../components/invite-expert-referral-modal'
import { ReferralDetailsModal } from '../components/referral-details-modal'
import { ReferralStatsBar } from '../components/referral-stats-bar'
import {
  useCreateBulkExpertInvites,
  useCreateExpertInvite,
  useDeleteExpertInvite,
  useExpertInvites,
  useReferralStats,
  useResendExpertInvite,
} from '../hooks/use-referrals'
import { fetchExpertInvites } from '../api/referral-api'
import {
  DEFAULT_REFERRALS_ACTIVE_METRIC_IDS,
  DEFAULT_REFERRALS_VISIBLE_COLUMN_IDS,
  REFERRALS_MODULE_KEY,
  REFERRALS_TABLE_COLUMNS_CATALOG,
} from '../config/referral-management-table-columns.config'
import { useReferralStore } from '../store/referral-store'
import type { ExpertInvite } from '../types/referral'
import {
  getReferralStatusClassName,
  getReferralStatusLabel,
  formatReferralDate,
  isReferralUsed,
} from '../utils/referral-format'
import { REFERRAL_METRIC_DEFINITIONS } from '../utils/referral-metrics-definitions'
import { useActiveMetricIds } from '@/modules/expert/hooks/use-active-metric-ids'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import { TableDateTimeCell } from '@/shared/components/table/table-datetime-cell'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import { apiErrorMessage as getApiErrorMessage } from '@/shared/lib/api-error'
import {
  buildReferralListQueryParams,
  createReferralFilteredExportHandler,
  exportMappedItemsToFile,
} from '@/shared/utils/export-filter-utils'
import type { FilterValues } from '@/shared/types/data-filter'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { buildCatalogSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { REFERRALS_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { useDefaultExportFormat } from '@/modules/settings/hooks/use-default-export-format'
import { fetchExperts } from '@/modules/expert/api/expert-api'
import { openPartnerProfile } from '@/modules/expert/utils/expert-application-navigation'

const REFERRAL_SORT_FIELD_MAP = buildCatalogSortFieldMap(REFERRALS_TABLE_COLUMNS_CATALOG, {
  'referred-at': 'referredAt',
  'referred-user-name': 'referredUserName',
  'referrer-user-id': 'referrerUserId',
  'referral-expiry-date': 'referralExpiryDate',
  'goal-completed-at': 'goalCompletedAt',
  'last-activity': 'lastActivity',
  'goal-progress': null,
  'reward-status': null,
  'reward-type': null,
  'reward-value': null,
  'referrer-type': null,
  'referred-entity-type': null,
  'signup-date': null,
})
import { cn } from '@/shared/lib/cn'

const DEFAULT_METRIC_IDS =
  DEFAULT_REFERRALS_ACTIVE_METRIC_IDS.length > 0
    ? DEFAULT_REFERRALS_ACTIVE_METRIC_IDS
    : REFERRAL_METRIC_DEFINITIONS.map((metric) => metric.id)

/** Figma resend: envelope with circular refresh arrow */
function ResendInvitationIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 7.5C4 6.119 5.119 5 6.5 5H17.5C18.881 5 20 6.119 20 7.5V14.5C20 15.881 18.881 17 17.5 17H6.5C5.119 17 4 15.881 4 14.5V7.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 7L12 12L18.5 7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 19.5C19.433 19.5 21 17.933 21 16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M19.25 14.75L21 16L19.25 17.25"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const dash = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

const EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (invite: ExpertInvite) => string }
> = {
  'referral-id': {
    header: 'Referral ID',
    accessor: (invite) => exportDisplayValue(invite.referralId),
  },
  'referral-code': {
    header: 'Referral Code',
    accessor: (invite) => exportDisplayValue(invite.referralCode),
  },
  'referrer-name': {
    header: 'Referrer Name',
    accessor: (invite) => exportDisplayValue(invite.referrerName),
  },
  'referrer-user-id': {
    header: 'Referrer User ID',
    accessor: (invite) => exportDisplayValue(invite.referrerUserId || invite.referrerId),
  },
  'referrer-type': {
    header: 'Referrer Type',
    accessor: (invite) => exportDisplayValue(invite.referrerType),
  },
  'referred-user-name': {
    header: 'Referred User Name',
    accessor: (invite) => exportDisplayValue(invite.referredUserName || invite.referredExpertName),
  },
  'referred-user-id': {
    header: 'Referred User ID',
    accessor: (invite) => exportDisplayValue(invite.referredUserId),
  },
  'referred-entity-type': {
    header: 'Referred Entity Type',
    accessor: (invite) => exportDisplayValue(invite.referredEntityType || 'Expert'),
  },
  'source-type': {
    header: 'Source Type',
    accessor: (invite) => exportDisplayValue(invite.sourceType),
  },
  status: {
    header: 'Status',
    accessor: (invite) => {
      const used = isReferralUsed(invite)
      return exportDisplayValue(
        used ? 'Successful' : getReferralStatusLabel(invite.status, invite.statusLabel),
      )
    },
  },
  'goal-progress': {
    header: 'Goal Progress',
    accessor: (invite) =>
      exportDisplayValue(
        invite.goalProgressPercent != null
          ? `${invite.goalProgressPercent}%`
          : `${invite.goalProgress?.signedUpCount ?? 0}/${invite.goalProgress?.maxReferrals ?? 10}`,
      ),
  },
  'reward-status': {
    header: 'Reward Status',
    accessor: (invite) => exportDisplayValue(invite.rewardStatus),
  },
  'referred-at': {
    header: 'Referred At',
    accessor: (invite) =>
      exportDisplayValue(formatReferralDate(invite.referredAt || invite.createdAt)),
  },
  'signup-date': {
    header: 'Signup Date',
    accessor: (invite) => exportDisplayValue(formatReferralDate(invite.signupDate)),
  },
  'goal-completed-at': {
    header: 'Goal Completed At',
    accessor: (invite) => exportDisplayValue(formatReferralDate(invite.goalCompletedAt)),
  },
  'referral-expiry-date': {
    header: 'Referral Expiry Date',
    accessor: (invite) =>
      exportDisplayValue(formatReferralDate(invite.referralExpiryDate || invite.expiresAt)),
  },
  'last-activity': {
    header: 'Last Activity',
    accessor: (invite) => exportDisplayValue(formatReferralDate(invite.lastActivity)),
  },
}

function buildReferralDataColumnsById(): Record<string, ColumnDef<ExpertInvite>> {
  const badge = (value?: string | null) => {
    if (!value) return '—'
    return (
      <span className="rounded bg-slate-500/10 px-2 py-0.5 text-[10px] font-bold text-slate-300 uppercase">
        {value}
      </span>
    )
  }

  return {
    'referral-id': {
      id: 'referral-id',
      header: 'Referral ID',
      accessorFn: (row) => row.referralId ?? '',
      cell: ({ row }) => <span className="ui-table-id">{dash(row.original.referralId)}</span>,
    },
    'referral-code': {
      id: 'referral-code',
      header: 'Referral Code',
      accessorFn: (row) => row.referralCode ?? '',
      cell: ({ row }) => (
        <span className="font-mono text-xs">{dash(row.original.referralCode)}</span>
      ),
    },
    'referrer-name': {
      id: 'referrer-name',
      header: 'Referrer Name',
      accessorFn: (row) => row.referrerName ?? '',
      cell: ({ row }) => dash(row.original.referrerName),
    },
    referrer: {
      id: 'referrer',
      header: 'Referrer Name',
      accessorFn: (row) => row.referrerName ?? '',
      cell: ({ row }) => dash(row.original.referrerName),
    },
    'referrer-user-id': {
      id: 'referrer-user-id',
      header: 'Referrer User ID',
      accessorFn: (row) => row.referrerUserId || row.referrerId || '',
      cell: ({ row }) => (
        <span className="ui-table-id">
          {dash(row.original.referrerUserId || row.original.referrerId)}
        </span>
      ),
    },
    'referrer-type': {
      id: 'referrer-type',
      header: 'Referrer Type',
      accessorFn: (row) => row.referrerType ?? '',
      cell: ({ row }) => badge(row.original.referrerType),
    },
    'referred-user-name': {
      id: 'referred-user-name',
      header: 'Referred User Name',
      accessorFn: (row) => row.referredUserName || row.referredExpertName || '',
      cell: ({ row }) => (
        <span className="font-medium text-white">
          {dash(row.original.referredUserName || row.original.referredExpertName)}
        </span>
      ),
    },
    'referred-expert': {
      id: 'referred-expert',
      header: 'Referred User Name',
      accessorFn: (row) => row.referredUserName || row.referredExpertName || '',
      cell: ({ row }) => dash(row.original.referredUserName || row.original.referredExpertName),
    },
    'referred-user-id': {
      id: 'referred-user-id',
      header: 'Referred User ID',
      accessorFn: (row) => row.referredUserId ?? '',
      cell: ({ row }) => <span className="ui-table-id">{dash(row.original.referredUserId)}</span>,
    },
    'referred-entity-type': {
      id: 'referred-entity-type',
      header: 'Referred Entity Type',
      accessorFn: (row) => row.referredEntityType || 'Expert',
      cell: ({ row }) => badge(row.original.referredEntityType || 'Expert'),
    },
    'source-type': {
      id: 'source-type',
      header: 'Source Type',
      accessorFn: (row) => row.sourceType ?? '',
      cell: ({ row }) => badge(row.original.sourceType),
    },
    status: {
      id: 'status',
      header: 'Status',
      accessorFn: (row) => row.status ?? '',
      cell: ({ row }) => {
        const used = isReferralUsed(row.original)
        const status = used ? 'accepted' : row.original.status
        return (
          <span
            className={cn(
              'rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
              getReferralStatusClassName(status),
            )}
          >
            {used
              ? 'Successful'
              : getReferralStatusLabel(row.original.status, row.original.statusLabel)}
          </span>
        )
      },
    },
    'goal-progress': {
      id: 'goal-progress',
      header: 'Goal Progress',
      accessorFn: (row) =>
        row.goalProgressPercent ??
        Math.min(
          100,
          Math.round(
            ((row.goalProgress?.signedUpCount ?? 0) / (row.goalProgress?.maxReferrals || 10)) * 100,
          ),
        ),
      meta: { headerClassName: 'text-center', cellClassName: 'text-center' },
      cell: ({ row }) => {
        const percent =
          row.original.goalProgressPercent ??
          Math.min(
            100,
            Math.round(
              ((row.original.goalProgress?.signedUpCount ?? 0) /
                (row.original.goalProgress?.maxReferrals || 10)) *
                100,
            ),
          )
        return (
          <div className="mx-auto flex w-28 flex-col gap-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="bg-brand-accent h-full rounded-full"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-brand-text text-xs font-medium">{percent}%</span>
          </div>
        )
      },
    },
    'reward-status': {
      id: 'reward-status',
      header: 'Reward Status',
      accessorFn: (row) => row.rewardStatus ?? '',
      cell: ({ row }) => badge(row.original.rewardStatus),
    },
    'reward-type': {
      id: 'reward-type',
      header: 'Reward Type',
      accessorFn: (row) => row.rewardType ?? '',
      cell: ({ row }) => dash(row.original.rewardType),
    },
    'reward-value': {
      id: 'reward-value',
      header: 'Reward Value',
      accessorFn: (row) => row.rewardValue ?? 0,
      cell: ({ row }) =>
        row.original.rewardValue == null
          ? '—'
          : `₹${Number(row.original.rewardValue).toLocaleString('en-IN')}`,
    },
    'referred-at': {
      id: 'referred-at',
      header: 'Referred At',
      accessorFn: (row) => row.referredAt || row.createdAt || '',
      cell: ({ row }) => (
        <TableDateTimeCell value={row.original.referredAt || row.original.createdAt} />
      ),
    },
    'created-at': {
      id: 'created-at',
      header: 'Referred At',
      accessorFn: (row) => row.referredAt || row.createdAt || '',
      cell: ({ row }) => (
        <TableDateTimeCell value={row.original.referredAt || row.original.createdAt} />
      ),
    },
    'signup-date': {
      id: 'signup-date',
      header: 'Signup Date',
      accessorFn: (row) => row.signupDate ?? '',
      cell: ({ row }) =>
        row.original.signupDate ? <TableDateTimeCell value={row.original.signupDate} /> : '—',
    },
    'goal-completed-at': {
      id: 'goal-completed-at',
      header: 'Goal Completed At',
      accessorFn: (row) => row.goalCompletedAt ?? '',
      cell: ({ row }) =>
        row.original.goalCompletedAt ? (
          <TableDateTimeCell value={row.original.goalCompletedAt} />
        ) : (
          '—'
        ),
    },
    'referral-expiry-date': {
      id: 'referral-expiry-date',
      header: 'Referral Expiry Date',
      accessorFn: (row) => row.referralExpiryDate || row.expiresAt || '',
      cell: ({ row }) => {
        const value = row.original.referralExpiryDate || row.original.expiresAt
        return value ? <TableDateTimeCell value={value} /> : '—'
      },
    },
    'last-activity': {
      id: 'last-activity',
      header: 'Last Activity',
      accessorFn: (row) => row.lastActivity ?? '',
      cell: ({ row }) =>
        row.original.lastActivity ? <TableDateTimeCell value={row.original.lastActivity} /> : '—',
    },
  }
}

export function ReferralManagementPage() {
  const navigate = useNavigate()
  const { currentPage, setCurrentPage } = useReferralStore()

  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const { buildSearchParams, globalSearch } = enhancedSearch
  const serverSort = useServerTableSort({
    sortFieldMap: REFERRAL_SORT_FIELD_MAP,
    defaultSortBy: 'referred-at',
    defaultSortOrder: 'desc',
    onPageReset: () => setCurrentPage(1),
  })
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [detailsExpert, setDetailsExpert] = useState<ExpertInvite | null>(null)
  const [deleteReferralTarget, setDeleteReferralTarget] = useState<ExpertInvite | null>(null)
  const [deleteSelectedReasons, setDeleteSelectedReasons] = useState<string[]>([])
  const [deleteAdminNotes, setDeleteAdminNotes] = useState('')
  const [deleteConfirmed, setDeleteConfirmed] = useState(false)
  const { fileFormat } = useDefaultExportFormat()

  const {
    options: deleteReasonOptions,
    reasons: deleteReasonsList,
    buildPayload: buildDeleteReasonPayload,
  } = useModerationReasonOptions(MODERATION_CATEGORY_SLUGS.deleteReferral)

  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const { data: statsData, isLoading: statsLoading } = useReferralStats()
  const listQueryParams = useMemo(
    () =>
      buildReferralListQueryParams(appliedFilters, {
        page: currentPage,
        limit: 10,
        ...buildSearchParams(),
        ...serverSort.sortParams,
      }),
    [appliedFilters, buildSearchParams, currentPage, serverSort.sortParams],
  )
  const { data: expertData, isLoading: expertLoading } = useExpertInvites(listQueryParams)
  const activeMetricIds = useActiveMetricIds(REFERRALS_MODULE_KEY, DEFAULT_METRIC_IDS)
  const tableColumnPreferencesQuery = useTableColumnPreferences(REFERRALS_MODULE_KEY)

  const catalogColumnIds = useMemo(
    () => REFERRALS_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds: DEFAULT_REFERRALS_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
  })

  const createExpertMutation = useCreateExpertInvite()
  const createBulkMutation = useCreateBulkExpertInvites()
  const deleteExpertMutation = useDeleteExpertInvite()
  const resendExpertMutation = useResendExpertInvite()

  const expertInvites = useMemo(() => expertData?.data?.invites ?? [], [expertData?.data?.invites])
  const meta = expertData?.data?.meta

  const handleApplyFilters = useCallback(
    (values: FilterValues) => {
      toast.success('Filters applied')
      setAppliedFilters(values)
      setCurrentPage(1)
    },
    [setCurrentPage],
  )

  const handleExportData = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      const result = await fetchExpertInvites(params)
      return { data: result.data?.invites ?? [] }
    }
    return createReferralFilteredExportHandler(
      fetchForExport,
      EXPORT_COLUMN_MAP,
      'referrals_export',
      {
        search: globalSearch || undefined,
      },
      { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
    )
  }, [catalogColumnIds, exportColumnIds, globalSearch])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'referral-management',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const handleResend = useCallback(
    async (id: string) => {
      setActiveDropdownId(null)
      try {
        await resendExpertMutation.mutateAsync(id)
        toast.success('Invitation resent')
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to resend invitation'))
      }
    },
    [resendExpertMutation],
  )

  const openDeleteModal = useCallback((record: ExpertInvite) => {
    setActiveDropdownId(null)
    setDeleteReferralTarget(record)
    setDeleteSelectedReasons([])
    setDeleteAdminNotes('')
    setDeleteConfirmed(false)
  }, [])

  const closeDeleteModal = useCallback(() => {
    setDeleteReferralTarget(null)
    setDeleteSelectedReasons([])
    setDeleteAdminNotes('')
    setDeleteConfirmed(false)
  }, [])

  const toggleDeleteReason = useCallback((value: string) => {
    setDeleteSelectedReasons((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
  }, [])

  const handleDeleteSubmit = useCallback(async () => {
    if (!deleteReferralTarget) return

    if (!deleteAdminNotes.trim()) {
      toast.error('Admin notes are required')
      return
    }

    const id = deleteReferralTarget.referralId || deleteReferralTarget._id
    const reasonPayload = buildDeleteReasonPayload(deleteSelectedReasons)

    try {
      await deleteExpertMutation.mutateAsync({
        id,
        payload: {
          ...reasonPayload,
          adminNotes: deleteAdminNotes.trim(),
        },
      })

      if (reasonPayload.reasonIds.length > 0) {
        recordModerationReasonUsage(reasonPayload.reasonIds).catch(() => {})
      }

      toast.success('Referral deleted successfully')
      closeDeleteModal()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete referral'))
    }
  }, [
    buildDeleteReasonPayload,
    closeDeleteModal,
    deleteAdminNotes,
    deleteExpertMutation,
    deleteReferralTarget,
    deleteSelectedReasons,
  ])

  const openReferredUserProfile = useCallback(
    async (record: ExpertInvite) => {
      const referredId = String(record.referredUserId || '').trim()
      const entityType = String(record.referredEntityType || '').toLowerCase()
      if (referredId) {
        await openPartnerProfile(
          {
            id: referredId,
            partnerId: referredId,
            serviceType: entityType.includes('venue') ? 'venue' : undefined,
          },
          navigate,
        )
        return
      }

      const email = String(record.referredExpertEmail || '')
        .trim()
        .toLowerCase()
      if (!email) {
        toast.error('This referred user has not created a profile yet.')
        return
      }

      try {
        const response = await fetchExperts({ search: email, limit: 20 })
        const match = (response.data || []).find(
          (expert) =>
            String(expert.email || '')
              .trim()
              .toLowerCase() === email,
        )
        if (!match) {
          toast.error('This referred user has not created a profile yet.')
          return
        }
        await openPartnerProfile(match, navigate)
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to open the referred user profile'))
      }
    },
    [navigate],
  )

  const renderActions = useCallback(
    (record: ExpertInvite) => {
      const id = record.referralId
      const isOpen = activeDropdownId === id

      return (
        <TableActionsDropdown
          label="Open expert referral actions"
          isOpen={isOpen}
          onOpenChange={(open) => setActiveDropdownId(open ? id : null)}
          menuWidth={200}
          maxVisibleItems={8}
        >
          <TableActionsItem
            icon={<ClipboardList className="size-3.5" strokeWidth={1.75} />}
            onClick={() => {
              setActiveDropdownId(null)
              setDetailsExpert(record)
            }}
          >
            View Details
          </TableActionsItem>
          <TableActionsItem
            icon={<ResendInvitationIcon className="size-3.5" />}
            onClick={() => handleResend(id)}
          >
            Resend Invitation
          </TableActionsItem>
          <TableActionsItem
            className="ui-table-actions-item-danger"
            icon={<Trash2 className="size-3.5" strokeWidth={1.75} />}
            onClick={() => openDeleteModal(record)}
          >
            Delete Referral
          </TableActionsItem>
          <TableActionsItem
            icon={<User className="size-3.5" strokeWidth={1.75} />}
            onClick={() => {
              setActiveDropdownId(null)
              const referrerId = String(record.referrerUserId || record.referrerId || '').trim()
              const sourceType = String(record.sourceType || '').toLowerCase()
              const referrerName = String(record.referrerName || '')
                .trim()
                .toLowerCase()
              const referrerType = String(record.referrerType || '').toLowerCase()
              const isPlatformReferrer =
                referrerType === 'admin' ||
                sourceType.includes('platform') ||
                referrerName === 'admin' ||
                (!referrerId && !sourceType.includes('expert'))

              if (isPlatformReferrer) {
                const authUser = useAuthStore.getState().user
                const isCurrentAdmin =
                  !referrerId ||
                  Boolean(
                    authUser &&
                    (String(authUser.id) === referrerId ||
                      String(authUser.subAdminId || '') === referrerId),
                  )
                navigate(
                  isCurrentAdmin
                    ? '/settings/access/my-profile'
                    : `/settings/access/users/${referrerId}`,
                )
                return
              }

              if (!referrerId) {
                toast.error('Referrer profile ID is missing.')
                return
              }

              void openPartnerProfile(
                {
                  id: referrerId,
                  partnerId: referrerId,
                  serviceType: referrerType.includes('venue') ? 'venue' : undefined,
                },
                navigate,
              )
            }}
          >
            View Referrer Profile
          </TableActionsItem>
          <TableActionsItem
            icon={<User className="size-3.5" strokeWidth={1.75} />}
            onClick={() => {
              setActiveDropdownId(null)
              void openReferredUserProfile(record)
            }}
          >
            View Referred User Profile
          </TableActionsItem>
          <TableActionsItem
            icon={<ExportDataIcon className="size-3.5" />}
            onClick={() => {
              setActiveDropdownId(null)
              void exportMappedItemsToFile(
                EXPORT_COLUMN_MAP,
                [record],
                fileFormat,
                `referral_${record.referralId}`,
                { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
              )
                .then(() => toast.success('Referral details exported'))
                .catch((error) =>
                  toast.error(getApiErrorMessage(error, 'Failed to export referral details')),
                )
            }}
          >
            Export Referral Details
          </TableActionsItem>
        </TableActionsDropdown>
      )
    },
    [
      activeDropdownId,
      catalogColumnIds,
      exportColumnIds,
      fileFormat,
      handleResend,
      navigate,
      openDeleteModal,
      openReferredUserProfile,
    ],
  )

  const expertColumns = useMemo<ColumnDef<ExpertInvite>[]>(() => {
    const dataColumnsById = buildReferralDataColumnsById()
    const visibleIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : DEFAULT_REFERRALS_VISIBLE_COLUMN_IDS

    const preferenceColumns = visibleIds.map((id) => dataColumnsById[id]).filter(Boolean)

    const actionsColumn: ColumnDef<ExpertInvite> = {
      id: 'actions',
      header: 'Actions',
      meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
      cell: ({ row }) => renderActions(row.original),
    }

    return withServerSortMeta([...preferenceColumns, actionsColumn], REFERRAL_SORT_FIELD_MAP)
  }, [renderActions, tableColumnPreferencesQuery.data])

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="referral-page-title">Referral Management</h1>
          <p className="ui-page-subtitle mt-1 text-[16px] leading-5 font-medium tracking-normal text-[#FFFFFF80]">
            Track and manage user-driven and platform-driven referrals
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <Button
            className="ui-manage-metrics ui-cta ui-cta-primary h-9 w-full px-5 md:w-auto"
            onClick={() =>
              navigate('/metrics/referrals?returnTo=/referrals/management&section=dashboard')
            }
          >
            <ManageMetricsIcon />
            Manage Metrics
          </Button>

          <Button type="button" className="w-full md:w-auto" onClick={() => setInviteOpen(true)}>
            <img src={createAccountIcon} alt="" className="size-4 shrink-0" aria-hidden="true" />
            Invite New Expert
          </Button>
        </div>
      </div>

      <ReferralStatsBar
        metrics={statsData?.data}
        isLoading={statsLoading}
        activeMetricIds={activeMetricIds}
      />

      <DataTable
        columns={expertColumns}
        data={expertInvites}
        getRowId={(row) => row.referralId}
        {...serverSort.dataTableSortProps}
        isLoading={expertLoading}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={REFERRALS_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by name, ID or email"
        onAdvancedFilter={onAdvancedFilter}
        advancedFilterVariant="primary"
        onExport={onExport}
        pagination={{
          page: currentPage,
          pageSize: meta?.limit ?? 10,
          totalItems: meta?.total ?? 0,
          totalPages: meta?.totalPages ?? 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="expert referrals"
        emptyMessage="No expert referrals found."
      />

      <InviteExpertReferralModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        isSubmitting={createExpertMutation.isPending || createBulkMutation.isPending}
        onSubmitManual={async (payload) => {
          try {
            const result = await createExpertMutation.mutateAsync(payload)
            const delivery = result?.data?.delivery
            if (payload.email && !delivery?.emailSent) {
              toast.warning(
                delivery?.note ||
                  'Invite created, but email was not delivered. Check Brevo config or use Resend.',
              )
            } else {
              toast.success('Invitation sent with your message')
            }
            setInviteOpen(false)
          } catch (err) {
            toast.error(getApiErrorMessage(err, 'Failed to send invitation'))
          }
        }}
        onSubmitBulk={async (payload) => {
          try {
            const result = await createBulkMutation.mutateAsync(payload)
            const count = result?.data?.count ?? result?.data?.invites?.length ?? 0
            const skipped = result?.data?.skipped ?? []
            if (skipped.length) {
              toast.success(
                `Created ${count} invite${count === 1 ? '' : 's'}; skipped ${skipped.length}`,
              )
            } else {
              toast.success(`Sent ${count} invite${count === 1 ? '' : 's'}`)
            }
            setInviteOpen(false)
          } catch (err) {
            toast.error(getApiErrorMessage(err, 'Failed to create bulk expert referrals'))
          }
        }}
      />

      <ReferralDetailsModal
        open={Boolean(detailsExpert)}
        onClose={() => setDetailsExpert(null)}
        expertInvite={detailsExpert}
      />

      <DecisionActionModal
        open={Boolean(deleteReferralTarget)}
        variant="delete"
        title="Delete Referral"
        description="Are you sure you want  Delete this Referral code? This will result in Deactivating the referral link."
        submitLabel="Delete Referral"
        submitIcon="none"
        heroLayout="stack"
        reasonOptions={deleteReasonOptions}
        selectedReasons={deleteSelectedReasons}
        onReasonToggle={toggleDeleteReason}
        showReasonsLabel={true}
        confirmationLabel="I confirm the documents are not approved due to above reasons."
        confirmationChecked={deleteConfirmed}
        onConfirmationChange={setDeleteConfirmed}
        adminNotes={deleteAdminNotes}
        onAdminNotesChange={setDeleteAdminNotes}
        onClose={closeDeleteModal}
        onSubmit={handleDeleteSubmit}
        isSubmitting={deleteExpertMutation.isPending}
        submitDisabled={!deleteAdminNotes.trim()}
      />

      {exportFilterModals}
    </div>
  )
}
