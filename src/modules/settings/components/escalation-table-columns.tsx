import type { ColumnDef } from '@tanstack/react-table'

import { EscalationActions } from './escalation-actions'
import type { Escalation } from '../mock/escalation-data'
import { cn } from '@/shared/lib/cn'

function PriorityPill({ priority }: { priority: string }) {
  const tone = priority.toLowerCase().replace(/\s+/g, '-')
  return <span className={cn('escalation-priority-pill', `is-${tone}`)}>{priority}</span>
}

function StatusPill({ status }: { status: string }) {
  const label = status === 'In Review' ? 'In-Review' : status
  const tone = label.toLowerCase().replace(/\s+/g, '-')
  return <span className={cn('escalation-status-pill', `is-${tone}`)}>{label}</span>
}

export const escalationColumns: ColumnDef<Escalation>[] = [
  {
    id: 'escalation-id',
    accessorKey: 'escalationId',
    header: 'Escalation ID',
    cell: ({ row }) => <span className="escalation-cell-primary">{row.original.escalationId}</span>,
  },
  {
    id: 'roles-id',
    accessorKey: 'roleId',
    header: 'Roles ID',
    cell: ({ row }) => <span className="escalation-cell-primary">{row.original.roleId}</span>,
  },
  {
    id: 'role-name',
    accessorKey: 'roleName',
    header: 'Role Name',
    cell: ({ row }) => <span className="escalation-cell-primary">{row.original.roleName}</span>,
  },
  {
    id: 'escalation-type',
    accessorKey: 'escalationType',
    header: 'Escalation Type',
    cell: ({ row }) => (
      <span className="escalation-cell-primary">{row.original.escalationType}</span>
    ),
  },
  {
    id: 'priority',
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => <PriorityPill priority={row.original.priority} />,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusPill status={row.original.status} />,
  },
  {
    id: 'created-on',
    accessorKey: 'createdOn',
    header: 'Created On',
    cell: ({ row }) => <span className="escalation-cell-muted">{row.original.createdOn}</span>,
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
    cell: ({ row }) => <EscalationActions escalation={row.original} />,
  },
]
