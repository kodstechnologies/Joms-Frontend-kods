import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { useRoleUsers } from '../hooks/use-rbac'
import type { SubAdmin } from '../types/rbac'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { buildDefaultTableSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { RBAC_USER_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { uiTokens } from '@/shared/lib/design-tokens'

const PAGE_SIZE = 10

const SORT_FIELD_MAP = buildDefaultTableSortFieldMap(['adminCode', 'fullname', 'roleName', 'email'])

export function RoleUsersPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const serverSort = useServerTableSort({
    sortFieldMap: SORT_FIELD_MAP,
    onPageReset: () => setPage(1),
  })
  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setPage(1) })

  const { data, isLoading } = useRoleUsers(id, {
    page,
    limit: PAGE_SIZE,
    ...enhancedSearch.buildSearchParams(),
    ...serverSort.sortParams,
  })

  const role = data?.data.role
  const users = data?.data.users ?? []
  const meta = data?.meta

  const columns = useMemo<ColumnDef<SubAdmin>[]>(
    () =>
      withServerSortMeta(
        [
          { accessorKey: 'adminCode', header: 'User ID' },
          {
            accessorKey: 'fullname',
            header: 'Username',
            cell: ({ row }) => (
              <button
                type="button"
                onClick={() => navigate(`/settings/access/users/${row.original.id}`)}
                className="text-brand-accent decoration-brand-accent/40 hover:text-brand-gold-from text-left text-sm font-medium underline underline-offset-2"
              >
                {row.original.fullname}
              </button>
            ),
          },
          {
            id: 'roleName',
            header: 'Role',
            cell: ({ row }) => row.original.roles.map((item) => item.name).join(', ') || '—',
          },
          { accessorKey: 'email', header: 'Email ID' },
          {
            id: 'open',
            header: '',
            enableSorting: false,
            cell: ({ row }) => (
              <button
                type="button"
                aria-label={`Open ${row.original.fullname} details`}
                onClick={() => navigate(`/settings/access/users/${row.original.id}`)}
                className="text-brand-muted hover:text-brand-accent transition-colors"
              >
                <ExternalLink className="size-4" />
              </button>
            ),
          },
        ],
        SORT_FIELD_MAP,
      ),
    [navigate],
  )

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigate(`/settings/access/roles/${id}/logs`)}
          className="group font-heading text-h3 text-brand-text hover:text-brand-accent flex w-fit items-center gap-2 font-bold tracking-tight transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>{role?.name || 'Role'} Users</span>
        </button>
        <div className="text-body-sm-medium text-muted flex items-center gap-1.5 pl-7">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/settings/access')}
            className="hover:text-brand-text transition-colors"
          >
            Role Based Access
          </button>
          <span className="text-brand-text/30">/</span>
          <span className="text-brand-text font-bold">{role?.name || 'Role'}</span>
        </div>
      </div>

      <div className={cn(uiTokens.radiusCard, uiTokens.borderSubtle, 'bg-brand-surface p-6')}>
        <p className="text-brand-muted text-sm">
          Users assigned to <span className="text-brand-text font-medium">{role?.name}</span>
        </p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        getRowId={(row) => row.id}
        {...serverSort.dataTableSortProps}
        isLoading={isLoading}
        searchValue={enhancedSearch.globalSearch}
        onSearchChange={enhancedSearch.setGlobalSearch}
        searchableColumns={RBAC_USER_SEARCH_COLUMNS}
        columnSearches={enhancedSearch.columnSearches}
        onColumnSearchChange={enhancedSearch.setColumnSearch}
        onColumnSearchRemove={enhancedSearch.removeColumnSearch}
        onClearAllSearches={enhancedSearch.clearAll}
        searchPlaceholder="Search by name, ID or email"
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          totalItems: meta?.total ?? 0,
          totalPages: meta?.totalPages ?? 1,
          onPageChange: setPage,
        }}
        resourceLabel="users"
        emptyMessage="No users assigned to this role."
      />
    </div>
  )
}
