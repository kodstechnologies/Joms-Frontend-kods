import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Mail, SlidersHorizontal, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import createIcon from '@/assets/JOMS_ICONS-2/icons8-create.svg'

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
import {
  buildReferralListQueryParams,
  createReferralFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import type { FilterValues } from '@/shared/types/data-filter'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

const DEFAULT_METRIC_IDS =
  DEFAULT_REFERRALS_ACTIVE_METRIC_IDS.length > 0
    ? DEFAULT_REFERRALS_ACTIVE_METRIC_IDS
    : REFERRAL_METRIC_DEFINITIONS.map((metric) => metric.id)

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

function getApiErrorMessage(err: unknown, fallback: string) {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback
  )
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
  const { searchQuery, setSearchQuery, currentPage, setCurrentPage } = useReferralStore()

  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [detailsExpert, setDetailsExpert] = useState<ExpertInvite | null>(null)

  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const { data: statsData, isLoading: statsLoading } = useReferralStats()
  const listQueryParams = useMemo(
    () =>
      buildReferralListQueryParams(appliedFilters, {
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
      }),
    [appliedFilters, currentPage, searchQuery],
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
        search: searchQuery || undefined,
      },
      { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
    )
  }, [catalogColumnIds, exportColumnIds, searchQuery])

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

  const handleDelete = useCallback(
    async (id: string) => {
      setActiveDropdownId(null)
      try {
        await deleteExpertMutation.mutateAsync(id)
        toast.success('Expert referral deleted')
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to delete referral'))
      }
    },
    [deleteExpertMutation],
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
          menuWidth={210}
        >
          <TableActionsItem
            icon={<Eye className="size-3.5" />}
            onClick={() => {
              setActiveDropdownId(null)
              setDetailsExpert(record)
            }}
          >
            View Details
          </TableActionsItem>
          <TableActionsItem icon={<Mail className="size-3.5" />} onClick={() => handleResend(id)}>
            Resend Invitation
          </TableActionsItem>
          <TableActionsItem
            icon={<Trash2 className="size-3.5 text-rose-300" />}
            onClick={() => handleDelete(id)}
          >
            <span className="text-rose-300">Delete Referral</span>
          </TableActionsItem>
        </TableActionsDropdown>
      )
    },
    [activeDropdownId, handleDelete, handleResend],
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

    return [...preferenceColumns, actionsColumn]
  }, [renderActions, tableColumnPreferencesQuery.data])

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="referral-page-title">Referral Management</h1>
          <p className="referral-page-subtitle mt-1">
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
            <SlidersHorizontal className="size-4" />
            Manage Metrics
          </Button>

          <Button type="button" className="w-full md:w-auto" onClick={() => setInviteOpen(true)}>
            <img src={createIcon} alt="create" className="size-4" />
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
        isLoading={expertLoading}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
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

      {exportFilterModals}
    </div>
  )
}
