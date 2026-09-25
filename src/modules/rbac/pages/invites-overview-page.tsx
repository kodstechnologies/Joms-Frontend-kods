import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, Copy, RotateCcw, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'

import { useAllInvites } from '../hooks/use-rbac'
import { fetchAllInvites } from '../api/rbac-api'
import type { SubAdminInvite } from '../types/rbac'
import { InviteStatusBadge } from '../components/invite-status-badge'
import { formatInviteTimestamp } from '../utils/invite-format'
import { InviteActionModals } from '../components/invite-action-modals'
import {
  DEFAULT_RBAC_HUB_INVITES_VISIBLE_COLUMN_IDS,
  RBAC_HUB_INVITES_COLUMN_PREFIX,
  RBAC_HUB_INVITES_TABLE_COLUMNS_CATALOG,
} from '../config/rbac-hub-table-columns.config'
import { RBAC_HUB_MODULE_KEY } from '../config/rbac-metrics.config'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { buildCatalogSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { RBAC_INVITE_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import type { FilterValues } from '@/shared/types/data-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  createPrefixedListExportHandler,
  buildPrefixedListQueryParams,
} from '@/shared/utils/export-filter-utils'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'

const PAGE_SIZE = 10

const SORT_FIELD_MAP = buildCatalogSortFieldMap(RBAC_HUB_INVITES_TABLE_COLUMNS_CATALOG, {
  'invites-invite-id': 'inviteId',
  'invites-username': 'username',
  'invites-email': 'email',
  'invites-role-id': 'roleId',
  'invites-role-name': 'roleName',
  'invites-scope': null,
  'invites-sent-at': 'sentAt',
  'invites-expiry': null,
  'invites-status': 'status',
})

const INVITE_EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (invite: SubAdminInvite) => string }
> = {
  'invites-invite-id': {
    header: 'Invite ID',
    accessor: (invite) => exportDisplayValue(invite.inviteId),
  },
  'invites-username': {
    header: 'Username',
    accessor: (invite) => exportDisplayValue(invite.username),
  },
  'invites-email': { header: 'Email ID', accessor: (invite) => exportDisplayValue(invite.email) },
  'invites-role-id': {
    header: 'Role ID',
    accessor: (invite) => exportDisplayValue(invite.roleId || invite.roleCode),
  },
  'invites-role-name': {
    header: 'Role Name',
    accessor: (invite) => exportDisplayValue(invite.roleName),
  },
  'invites-scope': { header: 'Scope', accessor: () => '—' },
  'invites-sent-at': {
    header: 'Invitation Sent At',
    accessor: (invite) =>
      exportDisplayValue(formatInviteTimestamp(invite.sentAt || invite.timestamp)),
  },
  'invites-expiry': { header: 'Invitation Expiry', accessor: () => '—' },
  'invites-status': {
    header: 'Status',
    accessor: (invite) => exportDisplayValue(invite.status),
  },
}

export function InvitesOverviewPage() {
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: SORT_FIELD_MAP,
    defaultSortBy: 'invites-sent-at',
    onPageReset: () => setPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedInvite, setSelectedInvite] = useState<SubAdminInvite | null>(null)
  const [actionMode, setActionMode] = useState<'revoke' | 'reinvite' | null>(null)
  const tableColumnPreferencesQuery = useTableColumnPreferences(RBAC_HUB_MODULE_KEY)
  const catalogColumnIds = useMemo(
    () => RBAC_HUB_INVITES_TABLE_COLUMNS_CATALOG.map((column) => column.id),
    [],
  )
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds?.filter((id) =>
      id.startsWith(RBAC_HUB_INVITES_COLUMN_PREFIX),
    ),
    defaultColumnIds: DEFAULT_RBAC_HUB_INVITES_VISIBLE_COLUMN_IDS,
    catalogColumnIds,
  })

  const listQueryParams = useMemo(
    () =>
      buildPrefixedListQueryParams(appliedFilters, {
        page,
        limit: PAGE_SIZE,
        ...enhancedSearch.buildSearchParams(),
        ...serverSort.sortParams,
      }),
    [appliedFilters, enhancedSearch, page, serverSort.sortParams],
  )

  const { data, isLoading } = useAllInvites(listQueryParams)

  const invites = data?.data.invites ?? []
  const meta = data?.meta

  const handleApplyFilters = useCallback((values: FilterValues) => {
    toast.success('Filters applied')
    setAppliedFilters(values)
    setPage(1)
  }, [])

  const handleExportData = useMemo(() => {
    const fetchForExport = async (params: Record<string, unknown>) => {
      const result = await fetchAllInvites(params)
      return { data: result.data?.invites ?? [] }
    }
    return createPrefixedListExportHandler(
      fetchForExport,
      INVITE_EXPORT_COLUMN_MAP,
      'rbac_invites_export',
      { search: enhancedSearch.globalSearch || undefined },
      { columnIds: exportColumnIds, catalogOrder: catalogColumnIds },
    )
  }, [catalogColumnIds, enhancedSearch.globalSearch, exportColumnIds])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'rbac-invites',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const columns = useMemo<ColumnDef<SubAdminInvite>[]>(() => {
    const dataColumnsById: Record<string, ColumnDef<SubAdminInvite>> = {
      'invites-invite-id': {
        id: 'invites-invite-id',
        accessorKey: 'inviteId',
        header: 'Invite ID',
      },
      'invites-username': { id: 'invites-username', accessorKey: 'username', header: 'Username' },
      'invites-email': { id: 'invites-email', accessorKey: 'email', header: 'Email ID' },
      'invites-role-id': {
        id: 'invites-role-id',
        accessorFn: (row) => row.roleId || row.roleCode,
        header: 'Role ID',
      },
      'invites-role-name': {
        id: 'invites-role-name',
        accessorKey: 'roleName',
        header: 'Role Name',
      },
      'invites-scope': { id: 'invites-scope', header: 'Scope', cell: () => '—' },
      'invites-sent-at': {
        id: 'invites-sent-at',
        accessorKey: 'sentAt',
        header: 'Invitation Sent At',
        cell: ({ row }) => formatInviteTimestamp(row.original.sentAt || row.original.timestamp),
      },
      'invites-expiry': { id: 'invites-expiry', header: 'Invitation Expiry', cell: () => '—' },
      'invites-status': {
        id: 'invites-status',
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <InviteStatusBadge status={row.original.status} />,
      },
    }

    const catalogIds = RBAC_HUB_INVITES_TABLE_COLUMNS_CATALOG.map((column) => column.id)
    const filteredSaved = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds.filter((id) =>
          id.startsWith(RBAC_HUB_INVITES_COLUMN_PREFIX),
        )
      : []
    const savedIds = filteredSaved.length
      ? filteredSaved
      : DEFAULT_RBAC_HUB_INVITES_VISIBLE_COLUMN_IDS
    const preferenceColumns = sortIdsByCatalogOrder(
      savedIds.filter((id) => catalogIds.includes(id)),
      catalogIds,
    )
      .map((id) => dataColumnsById[id])
      .filter(Boolean)

    const actionsColumn: ColumnDef<SubAdminInvite> = {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
      cell: ({ row }) => {
        if (row.original.status !== 'pending') {
          return <span className="text-brand-muted text-sm">—</span>
        }

        return (
          <TableActionsDropdown
            label="Open invite actions"
            isOpen={activeDropdownId === row.original.id}
            onOpenChange={(open) => setActiveDropdownId(open ? row.original.id : null)}
          >
            <TableActionsItem
              icon={<Copy className="size-3.5" />}
              onClick={() => {
                const inviteCode =
                  row.original.inviteCode || row.original.inviteId || row.original.id
                const inviteUrl =
                  row.original.inviteLink ||
                  `${window.location.origin}/invite/accept?code=${encodeURIComponent(inviteCode)}`
                if (navigator.clipboard?.writeText) {
                  void navigator.clipboard.writeText(inviteUrl)
                  toast.success('Invitation link copied to clipboard')
                } else {
                  toast.info(`Invite link: ${inviteUrl}`)
                }
                setActiveDropdownId(null)
              }}
            >
              Copy Invitation Link
            </TableActionsItem>
            <TableActionsItem
              icon={<RotateCcw className="size-3.5" />}
              onClick={() => {
                setSelectedInvite(row.original)
                setActionMode('reinvite')
                setActiveDropdownId(null)
              }}
            >
              Re-Invite
            </TableActionsItem>
            <TableActionsItem
              icon={<XCircle className="text-brand-danger size-3.5" />}
              onClick={() => {
                setSelectedInvite(row.original)
                setActionMode('revoke')
                setActiveDropdownId(null)
              }}
            >
              <span className="text-brand-danger">Revoke Invite</span>
            </TableActionsItem>
          </TableActionsDropdown>
        )
      },
    }

    return withServerSortMeta([...preferenceColumns, actionsColumn], SORT_FIELD_MAP)
  }, [activeDropdownId, tableColumnPreferencesQuery.data])

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/settings/access')}
            className="group font-heading text-h3 text-brand-text hover:text-brand-accent flex w-fit items-center gap-2 font-bold tracking-tight transition-colors"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>User Details</span>
          </button>
          <div className="text-body-sm-medium text-muted flex items-center gap-1.5 pl-7">
            <button
              type="button"
              onClick={() => navigateBackOrFallback(navigate, '/settings/access')}
              className="hover:text-brand-text transition-colors"
            >
              Role Based Access Control
            </button>
            <span className="text-brand-text/30">/</span>
            <span>User</span>
            <span className="text-brand-text/30">/</span>
            <span className="text-brand-text font-bold">Invites</span>
          </div>
        </div>

        <Button
          variant="secondary"
          className="ui-manage-metrics"
          onClick={() => navigate('/metrics/rbac-hub')}
        >
          <ManageMetricsIcon />
          Manage Metrics
        </Button>
      </div>

      <div>
        <h2 className="text-brand-text text-lg font-semibold">Invite Overview</h2>
      </div>

      <DataTable
        columns={columns}
        data={invites}
        getRowId={(row) => row.id}
        {...serverSort.dataTableSortProps}
        isLoading={isLoading}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={RBAC_INVITE_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by email or invite ID"
        onAdvancedFilter={onAdvancedFilter}
        advancedFilterVariant="primary"
        onExport={onExport}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          totalItems: meta?.total ?? 0,
          totalPages: meta?.totalPages ?? 1,
          onPageChange: setPage,
        }}
        resourceLabel="requests"
        emptyMessage="No invites found."
      />

      {exportFilterModals}

      <InviteActionModals
        invite={selectedInvite}
        mode={actionMode}
        onClose={() => {
          setSelectedInvite(null)
          setActionMode(null)
        }}
      />
    </div>
  )
}
