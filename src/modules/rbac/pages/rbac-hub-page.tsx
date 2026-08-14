import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  BarChart3,
  Eye,
  Pencil,
  Plus,
  Settings,
  Shield,
  ShieldOff,
  Trash2,
  UserCheck,
  UserPlus,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { RbacStatsBar } from '../components/rbac-stats-bar'
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
import { useRbacStore } from '../store/rbac-store'
import type { Role, SubAdmin } from '../types/rbac'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { exportDataToFile } from '@/shared/utils/export-utils'
import type { FilterValues } from '@/shared/types/data-filter'

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

export function RbacHubPage() {
  const navigate = useNavigate()
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    roleFilterId,
    setRoleFilterId,
  } = useRbacStore()

  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [passwordResetUser, setPasswordResetUser] = useState<SubAdmin | null>(null)

  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({})

  const apiFilterParams = useMemo(() => {
    const params: Record<string, string> = {}

    Object.entries(appliedFilters).forEach(([rawKey, val]) => {
      if (val === undefined || val === null || val === '') return

      const parts = rawKey.split('.')
      const fieldId = parts.length > 1 ? parts.slice(1).join('.') : rawKey

      if (fieldId === 'location' && typeof val === 'object' && val !== null) {
        const loc = val as { state?: string; city?: string }
        if (loc.state?.trim()) params.locationState = loc.state.trim()
        if (loc.city?.trim()) params.locationCity = loc.city.trim()
        return
      }

      if (Array.isArray(val)) {
        if (val.length > 0) {
          params[fieldId] = val.join(',')
        }
        return
      }

      if (typeof val === 'object' && val !== null) {
        const range = val as { from?: string | number; to?: string | number }
        if (range.from !== undefined && range.from !== '') {
          params[`${fieldId}Min`] = String(range.from).trim()
        }
        if (range.to !== undefined && range.to !== '') {
          params[`${fieldId}Max`] = String(range.to).trim()
        }
        return
      }

      if (typeof val === 'string' && val.trim()) {
        params[fieldId] = val.trim()
        return
      }

      if (typeof val === 'number' || typeof val === 'boolean') {
        params[fieldId] = String(val)
      }
    })

    return params
  }, [appliedFilters])

  const { data: statsData, isLoading: statsLoading } = useRbacStats()
  const { data: rolesData, isLoading: rolesLoading } = useRoles({
    page: currentPage,
    limit: 10,
    search: searchQuery || undefined,
    ...apiFilterParams,
  })
  const { data: subAdminsData, isLoading: subAdminsLoading } = useSubAdmins(
    {
      page: currentPage,
      limit: 10,
      search: searchQuery || undefined,
      ...apiFilterParams,
    },
    { enabled: activeTab === 'users' && !roleFilterId },
  )
  const { data: roleUsersData, isLoading: roleUsersLoading } = useRoleUsers(
    roleFilterId || '',
    {
      page: currentPage,
      limit: 10,
      search: searchQuery || undefined,
      ...apiFilterParams,
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

  const handleExportData = useCallback(
    (values: FilterValues, format: string) => {
      if (activeTab === 'users') {
        const headers = ['User ID', 'Username', 'Email', 'Status', 'MFA Enabled', 'Last Action']
        const exportRows = subAdmins.map((user) => [
          user.adminCode || user.id,
          user.fullname || '',
          user.email || '',
          user.status || '',
          user.mfaEnabled ? 'Yes' : 'No',
          formatDateTime(user.lastActionAt),
        ])
        exportDataToFile(headers, exportRows, format, 'rbac_users_export')
      } else {
        const headers = [
          'Role ID',
          'Role Name',
          'Description',
          'Risk Level',
          'MFA Required',
          'Status',
        ]
        const exportRows = roles.map((role) => [
          role.roleCode || role.id,
          role.name || '',
          role.description || '',
          role.riskLevel || '',
          role.mfaRequired ? 'Yes' : 'No',
          role.status || '',
        ])
        exportDataToFile(headers, exportRows, format, 'rbac_roles_export')
      }
    },
    [activeTab, subAdmins, roles],
  )

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

  const roleColumns = useMemo<ColumnDef<Role>[]>(
    () => [
      { accessorKey: 'roleCode', header: 'Role ID' },
      { accessorKey: 'name', header: 'Role Name' },
      { accessorKey: 'description', header: 'Description' },
      {
        accessorKey: 'scopes',
        header: 'Scope',
        cell: ({ row }) => row.original.scopes.join(', ') || '—',
      },
      {
        accessorKey: 'permissions',
        header: 'Permissions',
        cell: ({ row }) => formatPermissions(row.original.permissions),
      },
      {
        accessorKey: 'riskLevel',
        header: 'Risk level',
        cell: ({ row }) => (
          <span className="text-brand-accent capitalize">
            {row.original.riskLevel.replace('_', ' ')}
          </span>
        ),
      },
      {
        accessorKey: 'mfaRequired',
        header: 'MFA Required',
        cell: ({ row }) => (row.original.mfaRequired ? 'Yes' : 'No'),
      },
      {
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
      {
        accessorKey: 'userCount',
        header: 'Users (No.)',
        cell: ({ row }) => String(row.original.userCount).padStart(2, '0'),
      },
      {
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
      },
    ],
    [activeDropdownId, handleDeleteRole, handleDisableRole, handleEnableRole, navigate],
  )

  const userColumns = useMemo<ColumnDef<SubAdmin>[]>(
    () => [
      { accessorKey: 'adminCode', header: 'User ID' },
      { accessorKey: 'fullname', header: 'Username' },
      {
        id: 'roleCode',
        header: 'Role ID',
        cell: ({ row }) => row.original.roles.map((r) => r.roleCode).join(', ') || '—',
      },
      {
        id: 'roleName',
        header: 'RoleName',
        cell: ({ row }) => row.original.roles.map((r) => r.name).join(', ') || '—',
      },
      {
        accessorKey: 'scopes',
        header: 'Scope',
        cell: ({ row }) => row.original.scopes.join(', ') || '—',
      },
      {
        accessorKey: 'permissions',
        header: 'Permissions',
        cell: ({ row }) => formatPermissions(row.original.permissions),
      },
      {
        accessorKey: 'mfaEnabled',
        header: 'MFA Enabled',
        cell: ({ row }) => (row.original.mfaEnabled ? 'Yes' : 'No'),
      },
      {
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
      {
        accessorKey: 'lastActionAt',
        header: 'Last action performed',
        cell: ({ row }) => formatDateTime(row.original.lastActionAt),
      },
      {
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
      },
    ],
    [activeDropdownId, handleDeleteUser, handleReactivateUser, handleSuspendUser, navigate],
  )

  const isRolesTab = activeTab === 'roles'
  const meta = isRolesTab ? rolesMeta : subAdminsMeta
  const isLoading = isRolesTab ? rolesLoading : roleFilterId ? roleUsersLoading : subAdminsLoading

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-brand-text text-2xl font-bold md:text-3xl">Role Based Access</h1>
          <p className="text-brand-muted mt-1 text-sm md:text-base">
            Comprehensive user data and admin controls.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <Button
            variant="secondary"
            className="ui-manage-metrics"
            onClick={() => navigate('/metrics/rbac-hub')}
          >
            <BarChart3 className="size-4" />
            Manage Metrics
          </Button>
          <Button
            onClick={() =>
              navigate(
                isRolesTab ? '/settings/access/roles/create' : '/settings/access/users/create',
              )
            }
          >
            <Plus className="size-4" />
            {isRolesTab ? 'Create New Role' : 'Add New User'}
          </Button>
        </div>
      </div>

      <RbacStatsBar stats={statsData?.data} isLoading={statsLoading} />

      <div className="bg-brand-surface flex w-full gap-1 rounded-xl border border-white/10 p-1">
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
              'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
              activeTab === tab
                ? 'bg-brand-surface text-brand-text shadow-sm'
                : 'text-muted hover:text-brand-text',
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

      {!isRolesTab && (statsData?.data?.invitesSent ?? 0) >= 0 ? (
        <div className="rounded-brand-lg border-brand-accent-muted bg-brand-accent/10 text-brand-text flex items-center justify-between border px-4 py-3 text-sm">
          <span>Invites Sent — {String(statsData?.data?.invitesSent ?? 0).padStart(2, '0')}</span>
          <Button variant="secondary" onClick={() => navigate('/settings/access')}>
            Review
          </Button>
        </div>
      ) : null}

      {isRolesTab ? (
        <DataTable
          columns={roleColumns}
          data={roles}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by name, ID or profession"
          onAdvancedFilter={onAdvancedFilter}
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
          isLoading={isLoading}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by name, ID or profession"
          onAdvancedFilter={onAdvancedFilter}
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
