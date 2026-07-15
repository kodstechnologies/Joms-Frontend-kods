import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { communicationColumns } from '../../components/communication-table-columns'
import { communicationData } from '../../mock/communication-data'
import { DataTable } from '@/shared/components/table/data-table'
import { StatCard } from '@/shared/components/dashboard/stat-card'
import { Button } from '@/shared/components/ui/button'

const PAGE_SIZE = 10

export function CommunicationListPage() {
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  const filteredData = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return communicationData

    return communicationData.filter(
      (item) =>
        item.id.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query) ||
        item.channel.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        item.audience.toLowerCase().includes(query) ||
        item.createdBy.toLowerCase().includes(query),
    )
  }, [searchValue])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE))
  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredData.slice(start, start + PAGE_SIZE)
  }, [filteredData, page])

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-brand-text text-2xl font-bold md:text-3xl">
            Communication Management
          </h1>
          <p className="text-brand-muted mt-1 text-sm md:text-base">
            Comprehensive user data and admin controls.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <Button
            variant="secondary"
            onClick={() => toast.info('Metrics configuration coming soon')}
          >
            <BarChart3 className="size-4" />
            Manage Metrics
          </Button>
          <Button onClick={() => navigate('/communication/create')}>
            <Plus className="size-4" />
            Create Communication
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <StatCard
          title="Total messages sent"
          value="20"
          trend={{ direction: 'up', percentage: 6.7, label: 'vs last month' }}
        />
        <StatCard
          title="Active campaigns"
          value="38"
          hint="60.0% of total"
          trend={{ direction: 'up', percentage: 5.5, label: 'vs last quarter' }}
        />
        <StatCard title="Channels used" value="3" />
        <StatCard
          title="Scheduled messages"
          value="10"
          trend={{ direction: 'up', percentage: 12.5, label: 'vs last month' }}
        />
        <StatCard
          title="Failed/Undelivered"
          value="20"
          trend={{ direction: 'up', percentage: 6.7, label: 'vs last month' }}
        />
      </div>

      <DataTable
        columns={communicationColumns}
        data={paginatedData}
        getRowId={(row) => `${row.id}-${row.title}`}
        searchValue={searchValue}
        onSearchChange={(value) => {
          setSearchValue(value)
          setPage(1)
        }}
        searchPlaceholder="Search by name, ID or profession"
        onAdvancedFilter={() => toast.info('Advanced filters coming soon')}
        onExport={() => toast.info('Export coming soon')}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          totalItems: filteredData.length,
          totalPages,
          onPageChange: setPage,
        }}
        resourceLabel="users"
      />
    </div>
  )
}
