import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Clock,
  Eye,
  Pencil,
  Settings,
  Shield,
  ShieldOff,
  SlidersHorizontal,
  Trash2,
  UserCheck,
  UserPlus,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import createIcon from '@/assets/JOMS_ICONS-2/icons8-create.svg'
import { RbacStatsBar } from '../components/rbac-stats-bar'
import { RBAC_HUB_MODULE_KEY } from '../config/rbac-metrics.config'
import {
  DEFAULT_RBAC_HUB_ROLES_VISIBLE_COLUMN_IDS,
  DEFAULT_RBAC_HUB_USERS_VISIBLE_COLUMN_IDS,
  RBAC_HUB_ROLES_COLUMN_PREFIX,
  RBAC_HUB_ROLES_TABLE_COLUMNS_CATALOG,
  RBAC_HUB_USERS_COLUMN_PREFIX,
  RBAC_HUB_USERS_TABLE_COLUMNS_CATALOG,
} from '../config/rbac-hub-table-columns.config'
import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import { UpdatePasswordModal } from '../components/update-password-modal'
import {
  useDeleteRole,
  useDisableRole,
  useEnableRole,
  useDeleteSubAdmin,
  useRoleUsers,
  useRoles,
  useRbacStats,
  useSubAdmins,
  useSuspendSubAdmin,
  useReactivateSubAdmin,
  useUpdateSubAdminPassword,
} from '../hooks/use-rbac'
import { fetchRoleUsers, fetchRoles, fetchSubAdmins } from '../api/rbac-api'
import { useRbacStore } from '../store/rbac-store'
import type { Role, SubAdmin } from '../types/rbac'
import { DataTable } from '@/shared/components/table/data-table'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { useEnhancedSearch } from '@/shared/hooks/use-enhanced-search'
import { withServerSortMeta } from '@/shared/utils/table-sort'
import { buildCatalogSortFieldMap } from '@/shared/utils/table-sort-field-maps'
import {
  RBAC_ROLE_SEARCH_COLUMNS,
  RBAC_USER_SEARCH_COLUMNS,
} from '@/shared/components/table/search-configs'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { exportDisplayValue } from '@/shared/utils/export-utils'
import {
  buildRbacListQueryParams,
  createRbacFilteredExportHandler,
} from '@/shared/utils/export-filter-utils'
import type { FilterValues } from '@/shared/types/data-filter'

const EXPORT_USER_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (u: SubAdmin) => string }
> = {
  adminCode: { header: 'User ID', accessor: (u) => exportDisplayValue(u.adminCode || u.id) },
  fullname: { header: 'Username', accessor: (u) => exportDisplayValue(u.fullname) },
  roleCode: {
    header: 'Role ID',
    accessor: (u) => exportDisplayValue(u.roles.map((r) => r.roleCode).join(', ')),
  },
  roleName: {
    header: 'RoleName',
    accessor: (u) => exportDisplayValue(u.roles.map((r) => r.name).join(', ')),
  },
  scopes: { header: 'Scope', accessor: (u) => exportDisplayValue(u.scopes.join(', ')) },
  permissions: {
    header: 'Permissions',
    accessor: (u) => exportDisplayValue(formatPermissions(u.permissions)),
  },
  mfaEnabled: { header: 'MFA Enabled', accessor: (u) => exportDisplayValue(u.mfaEnabled) },
  status: { header: 'Status', accessor: (u) => exportDisplayValue(u.status) },
  lastActionAt: {
    header: 'Last action performed',
    accessor: (u) => exportDisplayValue(formatDateTime(u.lastActionAt)),
  },
}

const EXPORT_ROLE_COLUMN_MAP: Record<string, { header: string; accessor: (r: Role) => string }> = {
  roleCode: { header: 'Role ID', accessor: (r) => exportDisplayValue(r.roleCode || r.id) },
  name: { header: 'Role Name', accessor: (r) => exportDisplayValue(r.name) },
  description: { header: 'Description', accessor: (r) => exportDisplayValue(r.description) },
  scopes: { header: 'Scope', accessor: (r) => exportDisplayValue(r.scopes.join(', ')) },
  permissions: {
    header: 'Permissions',
    accessor: (r) => exportDisplayValue(formatPermissions(r.permissions)),
  },
  riskLevel: {
    header: 'Risk level',
    accessor: (r) => exportDisplayValue(r.riskLevel.replace('_', ' ')),
  },
  mfaRequired: { header: 'MFA Required', accessor: (r) => exportDisplayValue(r.mfaRequired) },
  status: {
    header: 'Status',
    accessor: (r) => exportDisplayValue(r.status === 'active' ? 'Active' : 'Disabled'),
  },
  userCount: {
    header: 'Users (No.)',
    accessor: (r) => exportDisplayValue(String(r.userCount).padStart(2, '0')),
  },
}

const formatPermissions = (permissions: string[]) => {
  if (!permissions.length) return '—'
  const labels = permissions.map((p) => p.split('.')[1] || p)
  return labels.slice(0, 2).join(', ') + (labels.length > 2 ? '…' : '')
}

const formatDateTime = (value?: string) => {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'numeric',
    year: 'numeric',
  })
}

const formatRiskLevel = (value?: string) => {
  if (!value) return '—'
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const ROLES_SORT_FIELD_MAP = buildCatalogSortFieldMap(RBAC_HUB_ROLES_TABLE_COLUMNS_CATALOG)
const USERS_SORT_FIELD_MAP = buildCatalogSortFieldMap(RBAC_HUB_USERS_TABLE_COLUMNS_CATALOG)

export function RbacHubPage() {
  const navigate = useNavigate()
  const { activeTab, setActiveTab, currentPage, setCurrentPage, roleFilterId, setRoleFilterId } =
    useRbacStore()

  const enhancedSearch = useEnhancedSearch({ onSearchChange: () => setCurrentPage(1) })
  const rolesServerSort = useServerTableSort({
    sortFieldMap: ROLES_SORT_FIELD_MAP,
    onPageReset: () => setCurrentPage(1),
  })
  const usersServerSort = useServerTableSort({
    sortFieldMap: USERS_SORT_FIELD_MAP,
    onPageReset: () => setCurrentPage(1),
  })
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [passwordResetUser, setPasswordResetUser] = useState<SubAdmin | null>(null)

  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const apiFilterParams = useMemo(() => buildRbacListQueryParams(appliedFilters), [appliedFilters])

  const { data: statsData, isLoading: statsLoading } = useRbacStats()
  const { data: rolesData, isLoading: rolesLoading } = useRoles({
    ...apiFilterParams,
    ...enhancedSearch.buildSearchParams(),
    ...rolesServerSort.sortParams,
    page: currentPage,
    limit: 10,
  })
  const { data: subAdminsData, isLoading: subAdminsLoading } = useSubAdmins(
    {
      ...apiFilterParams,
      ...enhancedSearch.buildSearchParams(),
      ...usersServerSort.sortParams,
      page: currentPage,
      limit: 10,
    },
    { enabled: activeTab === 'users' && !roleFilterId },
  )
  const { data: roleUsersData, isLoading: roleUsersLoading } = useRoleUsers(
    roleFilterId || '',
    {
      ...apiFilterParams,
      ...enhancedSearch.buildSearchParams(),
      ...usersServerSort.sortParams,
      page: currentPage,
      limit: 10,
    },
    { enabled: activeTab === 'users' && Boolean(roleFilterId) },
  )

  const disableRoleMutation = useDisableRole()
  const enableRoleMutation = useEnableRole()
  const deleteRoleMutation = useDeleteRole()
  const suspendMutation = useSuspendSubAdmin()
  const reactivateMutation = useReactivateSubAdmin()
  const deleteSubAdminMutation = useDeleteSubAdmin()
  const updatePasswordMutation = useUpdateSubAdminPassword()
  const tableColumnPreferencesQuery = useTableColumnPreferences(RBAC_HUB_MODULE_KEY)

  const roles = useMemo(() => rolesData?.data ?? [], [rolesData?.data])
  const rolesMeta = rolesData?.meta
  const subAdmins = useMemo(
    () => (roleFilterId ? (roleUsersData?.data.users ?? []) : (subAdminsData?.data ?? [])),
    [roleFilterId, roleUsersData?.data, subAdminsData?.data],
  )
  const subAdminsMeta = roleFilterId ? roleUsersData?.meta : subAdminsData?.meta
  const filteredRoleName = roleFilterId ? roleUsersData?.data.role.name : null

  const handleApplyFilters = useCallback(
    (values: FilterValues) => {
      toast.success('Filters applied')
      setAppliedFilters(values)
      setCurrentPage(1)
    },
    [setCurrentPage],
  )

  const handleExportData = useMemo(() => {
    if (activeTab === 'users') {
      const fetchUsers = async (params: Record<string, unknown>) => {
        if (roleFilterId) {
          const result = await fetchRoleUsers(roleFilterId, params)
          return { data: result.data?.users ?? [] }
        }
        return fetchSubAdmins(params)
      }
      return createRbacFilteredExportHandler(
        fetchUsers,
        EXPORT_USER_COLUMN_MAP,
        'rbac_users_export',
        { search: enhancedSearch.globalSearch || undefined },
      )
    }
    return createRbacFilteredExportHandler(
      fetchRoles,
      EXPORT_ROLE_COLUMN_MAP,
      'rbac_roles_export',
      { search: enhancedSearch.globalSearch || undefined },
    )
  }, [activeTab, enhancedSearch.globalSearch, roleFilterId])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'rbac-management',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  const handleDisableRole = useCallback(
    async (id: string) => {
      try {
        await disableRoleMutation.mutateAsync(id)
        toast.success('Role disabled')
      } catch {
        toast.error('Failed to disable role')
      }
      setActiveDropdownId(null)
    },
    [disableRoleMutation],
  )

  const handleEnableRole = useCallback(
    async (id: string) => {
      try {
        await enableRoleMutation.mutateAsync(id)
        toast.success('Role enabled')
      } catch {
        toast.error('Failed to enable role')
      }
      setActiveDropdownId(null)
    },
    [enableRoleMutation],
  )

  const handleDeleteRole = useCallback(
    async (id: string) => {
      try {
        await deleteRoleMutation.mutateAsync(id)
        toast.success('Role removed')
      } catch {
        toast.error('Failed to remove role')
      }
      setActiveDropdownId(null)
    },
    [deleteRoleMutation],
  )

  const handleSuspendUser = useCallback(
    async (id: string) => {
      try {
        await suspendMutation.mutateAsync(id)
        toast.success('User suspended')
      } catch {
        toast.error('Failed to suspend user')
      }
      setActiveDropdownId(null)
    },
    [suspendMutation],
  )

  const handleReactivateUser = useCallback(
    async (id: string) => {
      try {
        await reactivateMutation.mutateAsync(id)
        toast.success('User reactivated')
      } catch {
        toast.error('Failed to reactivate user')
      }
      setActiveDropdownId(null)
    },
    [reactivateMutation],
  )

  const handleDeleteUser = useCallback(
    async (id: string) => {
      try {
        await deleteSubAdminMutation.mutateAsync(id)
        toast.success('User removed')
      } catch {
        toast.error('Failed to remove user')
      }
      setActiveDropdownId(null)
    },
    [deleteSubAdminMutation],
  )

  const handlePasswordReset = useCallback(
    async (payload: { oldPassword: string; newPassword: string; confirmNewPassword: string }) => {
      if (!passwordResetUser) return

      if (payload.newPassword !== payload.confirmNewPassword) {
        toast.error('New password and confirmation do not match')
        return
      }

      try {
        await updatePasswordMutation.mutateAsync({
          id: passwordResetUser.id,
          payload,
        })
        toast.success('Password updated successfully')
        setPasswordResetUser(null)
      } catch (error: unknown) {
        const message =
          error &&
          typeof error === 'object' &&
          'response' in error &&
          error.response &&
          typeof error.response === 'object' &&
          'data' in error.response &&
          error.response.data &&
          typeof error.response.data === 'object' &&
          'message' in error.response.data &&
          typeof error.response.data.message === 'string'
            ? error.response.data.message
            : 'Failed to update password'
        toast.error(message)
      }
    },
    [passwordResetUser, updatePasswordMutation],
  )

  const roleColumns = useMemo<ColumnDef<Role>[]>(() => {
    const dataColumnsById: Record<string, ColumnDef<Role>> = {
      'roles-role-id': { id: 'roles-role-id', accessorKey: 'roleCode', header: 'Role ID' },
      'roles-name': {
        id: 'roles-name',
        accessorKey: 'name',
        header: 'Role Name',
        cell: ({ row }) => (
          <span className="inline-flex rounded-md border border-white/10 bg-[#141414] px-2.5 py-1 text-xs font-medium text-white">
            {row.original.name}
          </span>
        ),
      },
      'roles-description': {
        id: 'roles-description',
        accessorKey: 'description',
        header: 'Description',
      },
      'roles-scope': {
        id: 'roles-scope',
        accessorKey: 'scopes',
        header: 'Scope',
        cell: ({ row }) => row.original.scopes.join(', ') || '—',
      },
      'roles-permissions': {
        id: 'roles-permissions',
        accessorKey: 'permissions',
        header: 'Permissions',
        cell: ({ row }) => formatPermissions(row.original.permissions),
      },
      'roles-risk-level': {
        id: 'roles-risk-level',
        accessorKey: 'riskLevel',
        header: 'Risk level',
        cell: ({ row }) => (
          <span className="text-brand-text font-medium">
            {formatRiskLevel(row.original.riskLevel)}
          </span>
        ),
      },
      'roles-mfa-required': {
        id: 'roles-mfa-required',
        accessorKey: 'mfaRequired',
        header: 'MFA Required',
        cell: ({ row }) => (row.original.mfaRequired ? 'Yes' : 'No'),
      },
      'roles-status': {
        id: 'roles-status',
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={cn(
              'text-body-sm-semibold rounded-full border px-2.5 py-0.5',
              row.original.status === 'active'
                ? 'border-brand-success/25 bg-brand-success/10 text-brand-success'
                : 'border-brand-muted/25 text-brand-muted bg-white/5',
            )}
          >
            {row.original.status === 'active' ? 'Active' : 'Disabled'}
          </span>
        ),
      },
      'roles-user-count': {
        id: 'roles-user-count',
        accessorKey: 'userCount',
        header: 'Users (No.)',
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => navigate(`/settings/access/roles/${row.original.id}/users`)}
            className="text-brand-text hover:text-brand-accent font-medium underline underline-offset-2"
          >
            {String(row.original.userCount).padStart(2, '0')}
          </button>
        ),
      },
    }

    const catalogIds = RBAC_HUB_ROLES_TABLE_COLUMNS_CATALOG.map((column) => column.id)
    const savedIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds.filter((id) =>
          id.startsWith(RBAC_HUB_ROLES_COLUMN_PREFIX),
        )
      : DEFAULT_RBAC_HUB_ROLES_VISIBLE_COLUMN_IDS
    const preferenceColumns = sortIdsByCatalogOrder(
      savedIds.filter((id) => catalogIds.includes(id)),
      catalogIds,
    )
      .map((id) => dataColumnsById[id])
      .filter(Boolean)

    const actionsColumn: ColumnDef<Role> = {
      id: 'actions',
      header: 'Actions',
      meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
      cell: ({ row }) => (
        <TableActionsDropdown
          label="Open role actions"
          isOpen={activeDropdownId === row.original.id}
          onOpenChange={(open) => setActiveDropdownId(open ? row.original.id : null)}
        >
          <TableActionsItem
            icon={<Pencil className="size-3.5" />}
            onClick={() => navigate(`/settings/access/roles/${row.original.id}/edit`)}
          >
            Edit permission
          </TableActionsItem>
          <TableActionsItem
            icon={<Trash2 className="text-brand-danger size-3.5" />}
            onClick={() => handleDeleteRole(row.original.id)}
          >
            <span className="text-brand-danger">Remove Role</span>
          </TableActionsItem>
          {row.original.status === 'active' ? (
            <TableActionsItem
              icon={<ShieldOff className="size-3.5" />}
              onClick={() => handleDisableRole(row.original.id)}
            >
              Disable Role
            </TableActionsItem>
          ) : (
            <TableActionsItem
              icon={<Shield className="text-brand-success size-3.5" />}
              onClick={() => handleEnableRole(row.original.id)}
            >
              <span className="text-brand-success">Enable Role</span>
            </TableActionsItem>
          )}
          <TableActionsItem
            icon={<Settings className="size-3.5" />}
            onClick={() => navigate(`/settings/access/roles/${row.original.id}/edit`)}
          >
            Edit scope
          </TableActionsItem>
          <TableActionsItem
            icon={<UserPlus className="size-3.5" />}
            onClick={() => navigate('/settings/access/users/create')}
          >
            Assign new user
          </TableActionsItem>
          <TableActionsItem
            icon={<Eye className="size-3.5" />}
            onClick={() => navigate(`/settings/access/roles/${row.original.id}/logs`)}
          >
            View Logs
          </TableActionsItem>
        </TableActionsDropdown>
      ),
    }

    return withServerSortMeta([...preferenceColumns, actionsColumn], ROLES_SORT_FIELD_MAP)
  }, [
    activeDropdownId,
    handleDeleteRole,
    handleDisableRole,
    handleEnableRole,
    navigate,
    tableColumnPreferencesQuery.data,
  ])

  const userColumns = useMemo<ColumnDef<SubAdmin>[]>(() => {
    const dataColumnsById: Record<string, ColumnDef<SubAdmin>> = {
      'users-admin-code': { id: 'users-admin-code', accessorKey: 'adminCode', header: 'User ID' },
      'users-fullname': { id: 'users-fullname', accessorKey: 'fullname', header: 'Username' },
      'users-role-id': {
        id: 'users-role-id',
        accessorFn: (row) => row.roles.map((r) => r.roleCode).join(', '),
        header: 'Role ID',
        cell: ({ row }) => row.original.roles.map((r) => r.roleCode).join(', ') || '—',
      },
      'users-role-name': {
        id: 'users-role-name',
        accessorFn: (row) => row.roles.map((r) => r.name).join(', '),
        header: 'RoleName',
        cell: ({ row }) => row.original.roles.map((r) => r.name).join(', ') || '—',
      },
      'users-scope': {
        id: 'users-scope',
        accessorKey: 'scopes',
        header: 'Scope',
        cell: ({ row }) => row.original.scopes.join(', ') || '—',
      },
      'users-permissions': {
        id: 'users-permissions',
        accessorKey: 'permissions',
        header: 'Permissions',
        cell: ({ row }) => formatPermissions(row.original.permissions),
      },
      'users-mfa-enabled': {
        id: 'users-mfa-enabled',
        accessorKey: 'mfaEnabled',
        header: 'MFA Enabled',
        cell: ({ row }) => (row.original.mfaEnabled ? 'Yes' : 'No'),
      },
      'users-status': {
        id: 'users-status',
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={cn(
              'text-body-sm-semibold rounded-full border px-2.5 py-0.5',
              row.original.status === 'active'
                ? 'border-brand-success/25 bg-brand-success/10 text-brand-success'
                : 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger',
            )}
          >
            {row.original.status === 'active' ? 'Active' : row.original.status}
          </span>
        ),
      },
      'users-last-action': {
        id: 'users-last-action',
        accessorKey: 'lastActionAt',
        header: 'Last action performed',
        cell: ({ row }) => formatDateTime(row.original.lastActionAt),
      },
    }

    const catalogIds = RBAC_HUB_USERS_TABLE_COLUMNS_CATALOG.map((column) => column.id)
    const savedIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds.filter((id) =>
          id.startsWith(RBAC_HUB_USERS_COLUMN_PREFIX),
        )
      : DEFAULT_RBAC_HUB_USERS_VISIBLE_COLUMN_IDS
    const preferenceColumns = sortIdsByCatalogOrder(
      savedIds.filter((id) => catalogIds.includes(id)),
      catalogIds,
    )
      .map((id) => dataColumnsById[id])
      .filter(Boolean)

    const actionsColumn: ColumnDef<SubAdmin> = {
      id: 'actions',
      header: 'Actions',
      meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
      cell: ({ row }) => (
        <TableActionsDropdown
          label="Open user actions"
          isOpen={activeDropdownId === row.original.id}
          onOpenChange={(open) => setActiveDropdownId(open ? row.original.id : null)}
        >
          <TableActionsItem
            icon={<Eye className="size-3.5" />}
            onClick={() => navigate(`/settings/access/users/${row.original.id}`)}
          >
            View user
          </TableActionsItem>
          <TableActionsItem
            icon={<Pencil className="size-3.5" />}
            onClick={() => navigate(`/settings/access/users/create?edit=${row.original.id}`)}
          >
            Change role
          </TableActionsItem>
          <TableActionsItem
            icon={<Eye className="size-3.5" />}
            onClick={() => navigate(`/settings/access/users/${row.original.id}/logs`)}
          >
            View user logs
          </TableActionsItem>
          <TableActionsItem
            icon={<Settings className="size-3.5" />}
            onClick={() => {
              setPasswordResetUser(row.original)
              setActiveDropdownId(null)
            }}
          >
            Password reset
          </TableActionsItem>
          <TableActionsItem
            icon={<Trash2 className="text-brand-danger size-3.5" />}
            onClick={() => handleDeleteUser(row.original.id)}
          >
            <span className="text-brand-danger">Remove User</span>
          </TableActionsItem>
          {row.original.status === 'active' ? (
            <TableActionsItem
              icon={<ShieldOff className="text-brand-danger size-3.5" />}
              onClick={() => handleSuspendUser(row.original.id)}
            >
              <span className="text-brand-danger">Suspend user</span>
            </TableActionsItem>
          ) : (
            <TableActionsItem
              icon={<UserCheck className="text-brand-success size-3.5" />}
              onClick={() => handleReactivateUser(row.original.id)}
            >
              <span className="text-brand-success">Reactivate user</span>
            </TableActionsItem>
          )}
        </TableActionsDropdown>
      ),
    }

    return withServerSortMeta([...preferenceColumns, actionsColumn], USERS_SORT_FIELD_MAP)
  }, [
    activeDropdownId,
    handleDeleteUser,
    handleReactivateUser,
    handleSuspendUser,
    navigate,
    tableColumnPreferencesQuery.data,
  ])

  const isRolesTab = activeTab === 'roles'
  const meta = isRolesTab ? rolesMeta : subAdminsMeta
  const isLoading = isRolesTab ? rolesLoading : roleFilterId ? roleUsersLoading : subAdminsLoading

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="referral-page-title">Role Based Access</h1>
          <p className="referral-page-subtitle mt-1">Comprehensive user data and admin controls.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <Button
            className="ui-manage-metrics h-9 w-full rounded-xl bg-[#FBC078] px-5 text-sm font-semibold text-black shadow-none hover:bg-[#EEB46A] md:w-auto"
            onClick={() => navigate('/metrics/rbac-hub')}
          >
            <SlidersHorizontal className="size-4" />
            Manage Metrics
          </Button>
          <Button
            type="button"
            className="h-9 w-full md:w-auto"
            onClick={() =>
              navigate(
                isRolesTab ? '/settings/access/roles/create' : '/settings/access/users/create',
              )
            }
          >
            <img src={createIcon} alt="" className="size-4" aria-hidden="true" />
            {isRolesTab ? 'Create New Role' : 'Add New User'}
          </Button>
        </div>
      </div>

      <RbacStatsBar stats={statsData?.data} isLoading={statsLoading} />

      <div className="flex w-full gap-1 rounded-xl border border-white/10 bg-[#141414] p-1">
        {(['roles', 'users'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              if (tab === 'roles') {
                setRoleFilterId(null)
              }
              setActiveTab(tab)
            }}
            className={cn(
              'flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors',
              activeTab === tab
                ? 'bg-[#1f1f1f] text-white shadow-sm'
                : 'text-white/55 hover:text-white',
            )}
          >
            {tab === 'roles' ? 'Admin Roles' : 'Users'}
          </button>
        ))}
      </div>

      {!isRolesTab && roleFilterId && filteredRoleName ? (
        <div className="rounded-brand-lg text-brand-text flex items-center justify-between border border-white/10 bg-white/5 px-4 py-3 text-sm">
          <span>
            Showing users assigned to <span className="font-semibold">{filteredRoleName}</span>
          </span>
          <button
            type="button"
            onClick={() => setRoleFilterId(null)}
            className="text-brand-accent hover:text-brand-gold-from underline underline-offset-2"
          >
            Clear filter
          </button>
        </div>
      ) : null}

      {!isRolesTab ? (
        <div className="flex items-center justify-between rounded-xl border border-[#E0A263]/35 bg-[#E0A263]/12 px-4 py-3">
          <span className="text-brand-text flex items-center gap-2 text-sm font-medium">
            <Clock className="size-4 text-[#E0A263]" aria-hidden="true" />
            Invites Sent: {String(statsData?.data?.invitesSent ?? 0).padStart(2, '0')}
          </span>
          <Button
            variant="secondary"
            className="h-9 rounded-lg border-white/25 px-4 text-sm font-semibold"
            onClick={() => navigate('/settings/access/invites')}
          >
            Review
          </Button>
        </div>
      ) : null}

      {isRolesTab ? (
        <DataTable
          columns={roleColumns}
          data={roles}
          getRowId={(row) => row.id}
          {...rolesServerSort.dataTableSortProps}
          isLoading={isLoading}
          searchValue={enhancedSearch.globalSearch}
          onSearchChange={enhancedSearch.setGlobalSearch}
          searchableColumns={RBAC_ROLE_SEARCH_COLUMNS}
          columnSearches={enhancedSearch.columnSearches}
          onColumnSearchChange={enhancedSearch.setColumnSearch}
          onColumnSearchRemove={enhancedSearch.removeColumnSearch}
          onClearAllSearches={enhancedSearch.clearAll}
          searchPlaceholder="Search by name, ID or profession"
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
          resourceLabel="roles"
          emptyMessage="No roles found."
        />
      ) : (
        <DataTable
          columns={userColumns}
          data={subAdmins}
          getRowId={(row) => row.id}
          {...usersServerSort.dataTableSortProps}
          isLoading={isLoading}
          searchValue={enhancedSearch.globalSearch}
          onSearchChange={enhancedSearch.setGlobalSearch}
          searchableColumns={RBAC_USER_SEARCH_COLUMNS}
          columnSearches={enhancedSearch.columnSearches}
          onColumnSearchChange={enhancedSearch.setColumnSearch}
          onColumnSearchRemove={enhancedSearch.removeColumnSearch}
          onClearAllSearches={enhancedSearch.clearAll}
          searchPlaceholder="Search by name, ID or profession"
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
          resourceLabel="users"
          emptyMessage="No sub-admins found."
        />
      )}

      <UpdatePasswordModal
        open={Boolean(passwordResetUser)}
        userName={passwordResetUser?.fullname}
        isSubmitting={updatePasswordMutation.isPending}
        onClose={() => setPasswordResetUser(null)}
        onSubmit={handlePasswordReset}
      />

      {exportFilterModals}
    </div>
  )
}
