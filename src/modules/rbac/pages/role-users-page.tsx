import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useRevokeRole, useRevokeSubAdminRole, useRoleUsers } from '../hooks/use-rbac'
import type { Role, SubAdmin } from '../types/rbac'
import { RevokeRoleModal } from '../components/revoke-role-modal'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { AccessViewUserIcon } from '@/shared/components/icons/action-button-icons'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { buildDefaultTableSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import { RBAC_USER_SEARCH_COLUMNS } from '@/shared/components/table/search-configs'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { uiTokens } from '@/shared/lib/design-tokens'
import { getApiErrorMessage } from '@/shared/lib/api-error'

const PAGE_SIZE = 10

const SORT_FIELD_MAP = buildDefaultTableSortFieldMap(['adminCode', 'fullname', 'roleName', 'email'])

export function RoleUsersPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [revokeRoleTarget, setRevokeRoleTarget] = useState<Role | null>(null)
  const [revokeUserRoleTarget, setRevokeUserRoleTarget] = useState<SubAdmin | null>(null)

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

  const revokeRoleMutation = useRevokeRole()
  const revokeSubAdminRoleMutation = useRevokeSubAdminRole()

  const handleRevokeRole = useCallback(
    async (targetRole: Role) => {
      try {
        const result = await revokeRoleMutation.mutateAsync(targetRole.id)
        toast.success(
          result?.data?.revokedCount
            ? `Role "${targetRole.name}" revoked from ${result.data.revokedCount} user(s)`
            : `Role "${targetRole.name}" revoked successfully`,
        )
        setRevokeRoleTarget(null)
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to revoke role'))
      }
    },
    [revokeRoleMutation],
  )

  const handleRevokeUserRole = useCallback(
    async (user: SubAdmin, roleId: string) => {
      try {
        await revokeSubAdminRoleMutation.mutateAsync({
          subAdminId: user.id,
          roleId: roleId || id,
        })
        toast.success(`Role "${role?.name || ''}" revoked from ${user.fullname}`)
        setRevokeUserRoleTarget(null)
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to revoke role from user'))
      }
    },
    [revokeSubAdminRoleMutation, id, role?.name],
  )

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
            id: 'actions',
            header: '',
            enableSorting: false,
            cell: ({ row }) => (
              <TableActionsDropdown
                label="Open user actions"
                isOpen={activeDropdownId === row.original.id}
                onOpenChange={(open) => setActiveDropdownId(open ? row.original.id : null)}
                menuWidth={180}
                maxVisibleItems={8}
              >
                <TableActionsItem
                  icon={<AccessViewUserIcon className="size-3.5 text-slate-700" />}
                  onClick={() => {
                    setActiveDropdownId(null)
                    navigate(`/settings/access/users/${row.original.id}`)
                  }}
                >
                  View user
                </TableActionsItem>
                <TableActionsItem
                  icon={<ShieldAlert className="size-3.5 text-slate-700" />}
                  onClick={() => {
                    setActiveDropdownId(null)
                    setRevokeUserRoleTarget(row.original)
                  }}
                >
                  Revoke Role
                </TableActionsItem>
              </TableActionsDropdown>
            ),
          },
        ],
        SORT_FIELD_MAP,
      ),
    [activeDropdownId, navigate],
  )

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/settings/access')}
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

      <div
        className={cn(
          uiTokens.radiusCard,
          uiTokens.borderSubtle,
          'bg-brand-surface flex flex-wrap items-center justify-between gap-4 p-6',
        )}
      >
        <div>
          <p className="text-brand-muted text-sm">
            Users assigned to <span className="text-brand-text font-medium">{role?.name}</span>
          </p>
          <p className="text-brand-muted/70 mt-0.5 text-xs">
            Total assigned:{' '}
            <span className="text-brand-text font-medium">{meta?.total ?? users.length}</span>
          </p>
        </div>
        {role ? (
          <button
            type="button"
            onClick={() => setRevokeRoleTarget(role)}
            className="text-brand-text hover:bg-brand-surface flex items-center gap-1.5 rounded-lg border border-white/15 bg-transparent px-3 py-1.5 text-xs font-medium transition-colors hover:border-white/25"
          >
            <ShieldAlert className="size-3.5 text-slate-700" />
            Revoke Role from All
          </button>
        ) : null}
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

      <RevokeRoleModal
        type="role"
        open={Boolean(revokeRoleTarget)}
        role={revokeRoleTarget}
        isSubmitting={revokeRoleMutation.isPending}
        onClose={() => setRevokeRoleTarget(null)}
        onConfirm={handleRevokeRole}
      />

      <RevokeRoleModal
        type="user"
        open={Boolean(revokeUserRoleTarget)}
        user={revokeUserRoleTarget}
        targetRoleId={id}
        targetRoleName={role?.name}
        isSubmitting={revokeSubAdminRoleMutation.isPending}
        onClose={() => setRevokeUserRoleTarget(null)}
        onConfirm={handleRevokeUserRole}
      />
    </div>
  )
}
