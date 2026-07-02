import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import type { Expert } from '../../type/expert'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

export const displayExpertValue = (value: unknown): string => {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'string' && value.trim() === '') return 'N/A'
  return String(value)
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
          className="group flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors hover:text-[#FBC078]"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>{title}</span>
        </button>
        <p className="pl-7 text-[12px] font-medium text-[#777777]">{breadcrumb}</p>
      </header>
      <Button
        className="w-full bg-[#E6BE73] text-black hover:bg-[#D9AE5A] md:w-auto"
        onClick={() => toast.message('Manage Metrics is coming soon')}
      >
        <BarChart3 className="size-4" />
        Manage Metrics
      </Button>
    </div>
  )
}

export function ExpertStatusBadge({ status }: { status?: string }) {
  const normalized = (status || '').toLowerCase().replace(/_/g, ' ')

  const className = cn(
    'rounded px-2 py-0.5 text-[10px] font-bold capitalize',
    normalized.includes('pending') && 'bg-amber-500/15 text-amber-300',
    normalized.includes('changes') && 'bg-amber-700/20 text-amber-200',
    normalized.includes('suspended') && 'bg-orange-500/15 text-orange-300',
    normalized.includes('active') && 'bg-green-500/10 text-green-400',
    normalized.includes('rejected') && 'bg-red-500/15 text-red-400',
    !normalized && 'bg-slate-500/10 text-slate-400',
  )

  return (
    <span className={className}>{displayExpertValue(status || 'N/A')}</span>
  )
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
    {
      accessorKey: 'profession',
      header: 'Profession',
      cell: ({ row }) => displayExpertValue(row.original.profession),
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
