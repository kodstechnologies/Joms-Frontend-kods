import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, RotateCcw, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ManageMetricsIcon } from '@/shared/components/icons/action-button-icons'

import { useAllInvites } from '../hooks/use-rbac'
import { fetchAllInvites } from '../api/rbac-api'
import type { SubAdminInvite } from '../types/rbac'
import { InviteStatusBadge } from '../components/invite-status-badge'
import { formatInviteTimestamp } from '../utils/invite-format'
import { InviteActionModals } from '../components/invite-action-modals'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { buildDefaultTableSortFieldMap } from '@/shared/utils/table-sort-field-maps'
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

const PAGE_SIZE = 10

const SORT_FIELD_MAP = buildDefaultTableSortFieldMap([
  'inviteId',
  'username',
  'roleId',
  'roleName',
  'email',
  'sentAt',
  'status',
])

const INVITE_EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (invite: SubAdminInvite) => string }
> = {
  inviteId: { header: 'Invite ID', accessor: (invite) => exportDisplayValue(invite.inviteId) },
  username: { header: 'Username', accessor: (invite) => exportDisplayValue(invite.username) },
  roleId: { header: 'Role ID', accessor: (invite) => exportDisplayValue(invite.roleId) },
  roleName: { header: 'Role Name', accessor: (invite) => exportDisplayValue(invite.roleName) },
  email: { header: 'Email ID', accessor: (invite) => exportDisplayValue(invite.email) },
  sentAt: {
    header: 'Time stamp',
    accessor: (invite) =>
      exportDisplayValue(formatInviteTimestamp(invite.sentAt || invite.timestamp)),
  },
  status: { header: 'Status', accessor: (invite) => exportDisplayValue(invite.status) },
}

export function InvitesOverviewPage() {
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: SORT_FIELD_MAP,
    defaultSortBy: 'sentAt',
    onPageReset: () => setPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setPage(1) })
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [selectedInvite, setSelectedInvite] = useState<SubAdminInvite | null>(null)
  const [actionMode, setActionMode] = useState<'revoke' | 'reinvite' | null>(null)

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
    )
  }, [enhancedSearch.globalSearch])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'rbac-invites',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const columns = useMemo<ColumnDef<SubAdminInvite>[]>(
    () =>
      withServerSortMeta(
        [
          { accessorKey: 'inviteId', header: 'Invite ID' },
          { accessorKey: 'username', header: 'Username' },
          { accessorKey: 'roleId', header: 'Role ID' },
          { accessorKey: 'roleName', header: 'Role Name' },
          { accessorKey: 'email', header: 'Email ID' },
          {
            accessorKey: 'sentAt',
            header: 'Time stamp',
            cell: ({ row }) => formatInviteTimestamp(row.original.sentAt || row.original.timestamp),
          },
          {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => <InviteStatusBadge status={row.original.status} />,
          },
          {
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
          },
        ],
        SORT_FIELD_MAP,
      ),
    [activeDropdownId],
  )

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
          <ManageMetricsIcon className="size-5" />
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
        searchPlaceholder="Search by name, ID or profession"
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
