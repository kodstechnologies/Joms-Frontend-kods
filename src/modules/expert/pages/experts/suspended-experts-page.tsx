import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useExperts } from '../../hooks/use-expert'
import type { Expert } from '../../type/expert'
import {
  createExpertBaseColumns,
  createExpertCreatedAtColumn,
  createExpertLastActiveColumn,
  createExpertSelectColumn,
  createExpertServiceTypeColumn,
  createExpertStatusColumn,
  ExpertListHeader,
  useExpertListSelection,
} from './expert-list-shared'
import { DataTable } from '@/shared/components/table/data-table'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

export function ExpertSuspendedExpertsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  const { data, isLoading } = useExperts({
    page: currentPage,
    limit: 10,
    status: 'suspended',
    search: searchQuery,
  })

  const experts = data?.data || []
  const meta = data?.meta
  const selection = useExpertListSelection(experts)

  const columns = useMemo<ColumnDef<Expert>[]>(
    () => [
      createExpertSelectColumn({
        allVisibleSelected: selection.allVisibleSelected,
        someVisibleSelected: selection.someVisibleSelected,
        selectedExpertIds: selection.selectedExpertIds,
        toggleVisible: selection.toggleVisible,
        toggleOne: selection.toggleOne,
      }),
      ...createExpertBaseColumns(),
      createExpertStatusColumn(),
      createExpertServiceTypeColumn(),
      createExpertCreatedAtColumn(),
      createExpertLastActiveColumn(),
      {
        id: 'actions',
        header: 'Actions',
        meta: {
          headerClassName: 'pr-5 text-right',
          cellClassName: 'relative pr-5 text-right',
        },
        cell: ({ row }) => {
          const expert = row.original
          const isOpen = activeDropdownId === expert.expertId

          return (
            <TableActionsDropdown
              label={`Open actions for ${expert.name}`}
              isOpen={isOpen}
              onOpenChange={(open) =>
                setActiveDropdownId(open ? expert.expertId : null)
              }
              menuWidth={176}
            >
              <TableActionsItem
                icon={<Eye className="size-3.5" aria-hidden="true" />}
                onClick={() => {
                  setActiveDropdownId(null)
                  navigate(`/experts/management/profile/${expert.id}`)
                }}
              >
                View Expert
              </TableActionsItem>
            </TableActionsDropdown>
          )
        },
      },
    ],
    [activeDropdownId, navigate, selection],
  )

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <ExpertListHeader
        title="Suspended Experts"
        breadcrumb="User Management / Suspended Users"
      />

      <DataTable
        columns={columns}
        data={experts}
        getRowId={(expert) => expert.expertId}
        isLoading={isLoading}
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value)
          setCurrentPage(1)
        }}
        searchPlaceholder="Search by name, ID or profession"
        onAdvancedFilter={() => toast.message('Advanced filters are coming soon')}
        onExport={() => toast.message('Expert export is coming soon')}
        pagination={{
          page: currentPage,
          pageSize: meta?.pagination.limit || 10,
          totalItems: meta?.pagination.total || 0,
          totalPages: meta?.pagination.pages || 1,
          onPageChange: setCurrentPage,
        }}
        resourceLabel="users"
        emptyMessage="No suspended experts found."
      />
    </div>
  )
}
