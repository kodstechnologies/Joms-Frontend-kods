import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { BarChart3, Eye, Pencil, Plus, Settings, ShieldOff, Trash2, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { RbacStatsBar } from '../components/rbac-stats-bar'
import {
  useDeleteRole,
  useDisableRole,
  useDeleteSubAdmin,
  useRoles,
  useRbacStats,
  useSubAdmins,
  useSuspendSubAdmin,
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
  const { activeTab, setActiveTab, searchQuery, setSearchQuery, currentPage, setCurrentPage } =
    useRbacStore()

  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  const { data: statsData, isLoading: statsLoading } = useRbacStats()
  const { data: rolesData, isLoading: rolesLoading } = useRoles({
    page: currentPage,
    limit: 10,
    search: searchQuery || undefined,
  })
  const { data: subAdminsData, isLoading: subAdminsLoading } = useSubAdmins({
    page: currentPage,
    limit: 10,
    search: searchQuery || undefined,
  })

  const disableRoleMutation = useDisableRole()
  const deleteRoleMutation = useDeleteRole()
  const suspendMutation = useSuspendSubAdmin()
  const deleteSubAdminMutation = useDeleteSubAdmin()

  const roles = rolesData?.data ?? []
  const rolesMeta = rolesData?.meta
  const subAdmins = subAdminsData?.data ?? []
  const subAdminsMeta = subAdminsData?.meta

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
          <span className="capitalize text-brand-accent">
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
              'rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
              row.original.status === 'active'
                ? 'border-brand-success/25 bg-brand-success/10 text-brand-success'
                : 'border-brand-muted/25 bg-white/5 text-brand-muted',
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
              icon={<Trash2 className="size-3.5 text-brand-danger" />}
              onClick={() => handleDeleteRole(row.original.id)}
            >
              <span className="text-brand-danger">Remove Role</span>
            </TableActionsItem>
            <TableActionsItem
              icon={<ShieldOff className="size-3.5" />}
              onClick={() => handleDisableRole(row.original.id)}
            >
              Disable Role
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
      },
    ],
    [activeDropdownId, handleDeleteRole, handleDisableRole, navigate],
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
              'rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
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
              onClick={() => navigate('/settings/access/users/create')}
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
              onClick={() => toast.info('Password reset email stubbed')}
            >
              Password reset
            </TableActionsItem>
            <TableActionsItem
              icon={<Trash2 className="size-3.5 text-brand-danger" />}
              onClick={() => handleDeleteUser(row.original.id)}
            >
              <span className="text-brand-danger">Remove User</span>
            </TableActionsItem>
            <TableActionsItem
              icon={<ShieldOff className="size-3.5 text-brand-danger" />}
              onClick={() => handleSuspendUser(row.original.id)}
            >
              <span className="text-brand-danger">Suspend user</span>
            </TableActionsItem>
          </TableActionsDropdown>
        ),
      },
    ],
    [activeDropdownId, handleDeleteUser, handleSuspendUser, navigate],
  )

  const isRolesTab = activeTab === 'roles'
  const meta = isRolesTab ? rolesMeta : subAdminsMeta
  const isLoading = isRolesTab ? rolesLoading : subAdminsLoading

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-bold text-brand-text md:text-3xl">Role Based Access</h1>
          <p className="mt-1 text-sm text-brand-muted md:text-base">
            Comprehensive user data and admin controls.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <Button variant="secondary" onClick={() => toast.info('Metrics configuration coming soon')}>
            <BarChart3 className="size-4" />
            Manage Metrics
          </Button>
          <Button
            onClick={() =>
              navigate(isRolesTab ? '/settings/access/roles/create' : '/settings/access/users/create')
            }
          >
            <Plus className="size-4" />
            {isRolesTab ? 'Create New Role' : 'Add New User'}
          </Button>
        </div>
      </div>

      <RbacStatsBar stats={statsData?.data} isLoading={statsLoading} />

      <div className="flex w-full gap-1 rounded-xl border border-white/10 bg-[#111111] p-1">
        {(['roles', 'users'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
              activeTab === tab
                ? 'bg-[#1a1a1a] text-white shadow-sm'
                : 'text-slate-400 hover:text-white',
            )}
          >
            {tab === 'roles' ? 'Admin Roles' : 'Users'}
          </button>
        ))}
      </div>

      {!isRolesTab && (statsData?.data?.invitesSent ?? 0) >= 0 ? (
        <div className="flex items-center justify-between rounded-brand-lg border border-brand-accent-muted bg-brand-accent/10 px-4 py-3 text-sm text-brand-text">
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
          onAdvancedFilter={() => toast.info('Advanced filters coming soon')}
          onExport={() => toast.info('Export coming soon')}
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
          onAdvancedFilter={() => toast.info('Advanced filters coming soon')}
          onExport={() => toast.info('Export coming soon')}
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
    </div>
  )
}
