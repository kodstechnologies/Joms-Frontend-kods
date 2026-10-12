import type { ColumnDef } from '@tanstack/react-table'

import type { Expert } from '../../type/expert'
import { TableDateTimeCell } from '@/shared/components/table/table-datetime-cell'

import { displayExpertValue } from './expert-list-format'
import { ExpertStatusBadge } from './expert-list-shared'

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
        className="ui-table-checkbox"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        aria-label={`Select ${row.original.name}`}
        checked={selectedExpertIds.includes(row.original.expertId)}
        onChange={() => toggleOne(row.original.expertId)}
        onClick={(event) => event.stopPropagation()}
        className="ui-table-checkbox"
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
        <span className="ui-table-id uppercase">{displayExpertValue(row.original.expertId)}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span className="font-medium text-white">{displayExpertValue(row.original.name)}</span>
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

export function createExpertProfessionColumn(): ColumnDef<Expert> {
  return {
    accessorKey: 'profession',
    header: 'Profession',
    cell: ({ row }) => displayExpertValue(row.original.profession),
  }
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
    cell: ({ row }) => <TableDateTimeCell value={row.original.createdAt} emptyLabel="N/A" />,
  }
}

export function createExpertLastActiveColumn(): ColumnDef<Expert> {
  return {
    accessorKey: 'lastActive',
    header: 'Last Active',
    cell: ({ row }) => <TableDateTimeCell value={row.original.lastActive} emptyLabel="N/A" />,
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
    cell: ({ row }) => (
      <TableDateTimeCell
        value={row.original.reportedAt || row.original.createdAt}
        emptyLabel="N/A"
      />
    ),
  }
}

export function createExpertDeletedAtColumn(): ColumnDef<Expert> {
  return {
    accessorKey: 'deletedAt',
    header: 'Deleted at',
    cell: ({ row }) => (
      <TableDateTimeCell
        value={row.original.deletedAt || row.original.createdAt}
        emptyLabel="N/A"
      />
    ),
  }
}

export function createExpertStatusColumn(): ColumnDef<Expert> {
  return {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <ExpertStatusBadge status={row.original.status} />,
  }
}
