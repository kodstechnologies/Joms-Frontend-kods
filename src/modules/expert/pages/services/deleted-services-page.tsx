import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, Eye, RotateCcw, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { formatDeletedAt } from '../../constants/soft-delete'
import { useRestoreService, useServices } from '../../hooks/use-services'
import type { Service } from '../../type/service'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

export function DeletedServicesPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  const { data, isLoading } = useServices({
    page: currentPage,
    limit: 10,
    status: 'deleted',
    search: searchQuery,
  })
  const restoreServiceMutation = useRestoreService()

  const services = data?.data || []
  const meta = data?.meta

  const handleRestore = useCallback(
    (service: Service) => {
      restoreServiceMutation.mutate(service._id, {
        onSuccess: () => toast.success('Service restored successfully'),
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } }
          toast.error(err?.response?.data?.message || 'Failed to restore service.')
        },
      })
    },
    [restoreServiceMutation],
  )

  const columns = useMemo<ColumnDef<Service>[]>(
    () => [
      {
        accessorKey: 'serviceid',
        header: 'Service ID',
        cell: ({ row }) => (
          <span className="font-mono text-xs uppercase">{row.original.serviceid || '—'}</span>
        ),
      },
      { accessorKey: 'title', header: 'Service Name' },
      { accessorKey: 'serviceType', header: 'Type' },
      { accessorKey: 'expertName', header: 'Expert Name' },
      {
        accessorKey: 'reason',
        header: 'Reason',
        cell: ({ row }) => row.original.reason || '—',
      },
      {
        accessorKey: 'deletedAt',
        header: 'Deleted At',
        cell: ({ row }) => formatDeletedAt(row.original.deletedAt),
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
        cell: ({ row }) => {
          const service = row.original
          const isOpen = activeDropdownId === service._id

          return (
            <TableActionsDropdown
              label={`Open actions for ${service.title}`}
              isOpen={isOpen}
              onOpenChange={(open) => setActiveDropdownId(open ? service._id : null)}
              menuWidth={192}
            >
              <TableActionsItem
                icon={<Eye className="size-3.5" />}
                onClick={() => {
                  setActiveDropdownId(null)
                  navigate(
                    `/services/management/view/${service._id}?type=${encodeURIComponent(service.serviceType)}`,
                  )
                }}
              >
                View Details
              </TableActionsItem>
              <TableActionsItem
                icon={<RotateCcw className="size-3.5" />}
                onClick={() => {
                  setActiveDropdownId(null)
                  handleRestore(service)
                }}
              >
                Restore Service
              </TableActionsItem>
              <TableActionsItem
                icon={<Upload className="size-3.5" />}
                onClick={() => {
                  setActiveDropdownId(null)
                  toast.message('Export Data is coming soon')
                }}
              >
                Export Data
              </TableActionsItem>
            </TableActionsDropdown>
          )
        },
      },
    ],
    [activeDropdownId, handleRestore, navigate],
  )

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <header className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigate('/services/management')}
          className="group flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>Deleted Services</span>
        </button>
        <div className="flex items-center gap-1.5 pl-7 text-[12px] font-medium text-[#777777]">
          <span>Service Management</span>
          <span className="text-[#333333]">/</span>
          <span className="font-bold text-white">Deleted Services</span>
        </div>
      </header>

      <DataTable
        columns={columns}
        data={services}
        getRowId={(service) => service._id}
        isLoading={isLoading}
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value)
          setCurrentPage(1)
        }}
        searchPlaceholder="Search by name, ID or category"
        onAdvancedFilter={() => toast.message('Advanced filters are coming soon')}
        onExport={() => toast.message('Service export is coming soon')}
        pagination={{
          page: currentPage,
          pageSize: meta?.pagination.limit || 10,
          totalItems: meta?.pagination.total || 0,
          totalPages: meta?.pagination.pages || 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="services"
        emptyMessage="No deleted services found."
      />
    </div>
  )
}
