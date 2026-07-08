import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { useRoleUsers } from '../hooks/use-rbac'
import type { SubAdmin } from '../types/rbac'
import { DataTable } from '@/shared/components/table/data-table'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

const PAGE_SIZE = 10

export function RoleUsersPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading } = useRoleUsers(id, {
    page,
    limit: PAGE_SIZE,
    search: searchQuery || undefined,
  })

  const role = data?.data.role
  const users = data?.data.users ?? []
  const meta = data?.meta

  const columns = useMemo<ColumnDef<SubAdmin>[]>(
    () => [
      { accessorKey: 'adminCode', header: 'User ID' },
      {
        accessorKey: 'fullname',
        header: 'Username',
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => navigate(`/settings/access/users/${row.original.id}`)}
            className="text-left text-sm font-medium text-brand-accent underline decoration-brand-accent/40 underline-offset-2 hover:text-brand-gold-from"
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
            className="text-brand-muted transition-colors hover:text-brand-accent"
          >
            <ExternalLink className="size-4" />
          </button>
        ),
      },
    ],
    [navigate],
  )

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigate(`/settings/access/roles/${id}/logs`)}
          className="group flex w-fit items-center gap-2 font-heading text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>{role?.name || 'Role'} Users</span>
        </button>
        <div className="flex items-center gap-1.5 pl-7 text-[12px] font-medium text-[#777777]">
          <button
            type="button"
            onClick={() => navigate('/settings/access')}
            className="transition-colors hover:text-white"
          >
            Role Based Access
          </button>
          <span className="text-[#333333]">/</span>
          <span className="font-bold text-white">{role?.name || 'Role'}</span>
        </div>
      </div>

      <div className={cn(uiTokens.radiusCard, uiTokens.borderSubtle, 'bg-brand-surface p-6')}>
        <p className="text-sm text-brand-muted">
          Users assigned to <span className="font-medium text-brand-text">{role?.name}</span>
        </p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value)
          setPage(1)
        }}
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
