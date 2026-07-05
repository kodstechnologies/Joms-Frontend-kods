import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { Expert } from '../../type/expert'
import { getManagementStatusDisplay } from '../../utils/management-status'
import { Button } from '@/shared/components/ui/button'

export const displayExpertValue = (value: unknown): string => {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'string' && value.trim() === '') return 'N/A'
  return String(value)
}

export const formatListingExpertId = (id?: string | null) => {
  if (!id?.trim()) return 'N/A'
  return `EXP-${id.slice(-4).toUpperCase()}`
}

export const formatApplicationExpertId = (id?: string | null) => {
  if (!id?.trim()) return 'N/A'
  return `#EXP${id.slice(-4).toUpperCase()}`
}

export const formatExpertDateTime = (value?: string | null) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ExpertListHeader({
  title,
  breadcrumb,
}: {
  title: string
  breadcrumb: string
}) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <header className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigate('/experts/management')}
          className="group flex w-fit items-center gap-2 font-heading text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>{title}</span>
        </button>
        <p className="pl-7 text-[12px] font-medium text-[#777777]">{breadcrumb}</p>
      </header>
      <Button
        className="w-full bg-[#E6BE73] text-black hover:bg-[#D9AE5A] md:w-auto"
        onClick={() => navigate('/experts/dashboard/metrics')}
      >
        <BarChart3 className="size-4" />
        Manage Metrics
      </Button>
    </div>
  )
}

export function ExpertStatusBadge({ status }: { status?: string }) {
  const { label, className } = getManagementStatusDisplay(status)

  return <span className={className}>{displayExpertValue(label)}</span>
}

export function useExpertListSelection(experts: Expert[]) {
  const [selectedExpertIds, setSelectedExpertIds] = useState<string[]>([])

  const visibleExpertIds = useMemo(
    () => experts.map((expert) => expert.expertId),
    [experts],
  )

  const allVisibleSelected =
    visibleExpertIds.length > 0 &&
    visibleExpertIds.every((id) => selectedExpertIds.includes(id))
  const someVisibleSelected = visibleExpertIds.some((id) =>
    selectedExpertIds.includes(id),
  )

  const toggleVisible = useCallback(() => {
    setSelectedExpertIds((currentIds) => {
      if (allVisibleSelected) {
        return currentIds.filter((id) => !visibleExpertIds.includes(id))
      }
      return Array.from(new Set([...currentIds, ...visibleExpertIds]))
    })
  }, [allVisibleSelected, visibleExpertIds])

  const toggleOne = useCallback((expertId: string) => {
    setSelectedExpertIds((currentIds) =>
      currentIds.includes(expertId)
        ? currentIds.filter((id) => id !== expertId)
        : [...currentIds, expertId],
    )
  }, [])

  return {
    selectedExpertIds,
    allVisibleSelected,
    someVisibleSelected,
    toggleVisible,
    toggleOne,
  }
}

export function createExpertSelectColumn({
  allVisibleSelected,
  someVisibleSelected,
  selectedExpertIds,
  toggleVisible,
  toggleOne,
}: {
  allVisibleSelected: boolean
  someVisibleSelected: boolean
  selectedExpertIds: string[]
  toggleVisible: () => void
  toggleOne: (expertId: string) => void
}): ColumnDef<Expert> {
  return {
    id: 'select',
    header: () => (
      <input
        type="checkbox"
        aria-label="Select all experts"
        checked={allVisibleSelected}
        ref={(input) => {
          if (input) {
            input.indeterminate = someVisibleSelected && !allVisibleSelected
          }
        }}
        onChange={toggleVisible}
        className="rounded border-slate-700 bg-transparent"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        aria-label={`Select ${row.original.name}`}
        checked={selectedExpertIds.includes(row.original.expertId)}
        onChange={() => toggleOne(row.original.expertId)}
        onClick={(event) => event.stopPropagation()}
        className="rounded border-slate-700 bg-transparent"
      />
    ),
    meta: {
      headerClassName: 'pl-5',
      cellClassName: 'pl-5',
    },
  }
}

export function createExpertBaseColumns(): ColumnDef<Expert>[] {
  return [
    {
      accessorKey: 'expertId',
      header: 'Expert ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs uppercase">
          {displayExpertValue(row.original.expertId)}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span className="font-medium text-white">
          {displayExpertValue(row.original.name)}
        </span>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email ID',
      cell: ({ row }) => displayExpertValue(row.original.email),
    },
  ]
}

export function createExpertServiceTypeColumn(): ColumnDef<Expert> {
  return {
    accessorKey: 'serviceType',
    header: 'Service Type',
    cell: ({ row }) => displayExpertValue(row.original.serviceType),
  }
}

export function createExpertCreatedAtColumn(): ColumnDef<Expert> {
  return {
    accessorKey: 'createdAt',
    header: 'Created at',
    cell: ({ row }) => formatExpertDateTime(row.original.createdAt),
  }
}

export function createExpertLastActiveColumn(): ColumnDef<Expert> {
  return {
    accessorKey: 'lastActive',
    header: 'Last Active',
    cell: ({ row }) => formatExpertDateTime(row.original.lastActive),
  }
}

export function createExpertReasonColumn(): ColumnDef<Expert> {
  return {
    accessorKey: 'reason',
    header: 'Reason',
    cell: ({ row }) => displayExpertValue(row.original.reason),
  }
}

export function createExpertReportedAtColumn(): ColumnDef<Expert> {
  return {
    accessorKey: 'reportedAt',
    header: 'Reported at',
    cell: ({ row }) =>
      formatExpertDateTime(row.original.reportedAt || row.original.createdAt),
  }
}

export function createExpertDeletedAtColumn(): ColumnDef<Expert> {
  return {
    accessorKey: 'deletedAt',
    header: 'Deleted at',
    cell: ({ row }) =>
      formatExpertDateTime(row.original.deletedAt || row.original.createdAt),
  }
}

export function createExpertStatusColumn(): ColumnDef<Expert> {
  return {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <ExpertStatusBadge status={row.original.status} />,
  }
}
