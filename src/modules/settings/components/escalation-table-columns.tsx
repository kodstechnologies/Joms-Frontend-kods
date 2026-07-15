import type { ColumnDef } from '@tanstack/react-table'

import { EscalationActions } from './escalation-actions'
import type { Escalation } from '../mock/escalation-data'

export const escalationColumns: ColumnDef<Escalation>[] = [
  {
    accessorKey: 'escalationId',
    header: 'Escalation ID',
  },
  {
    accessorKey: 'roleId',
    header: 'Roles ID',
  },
  {
    accessorKey: 'roleName',
    header: 'Role Name',
  },
  {
    accessorKey: 'escalationType',
    header: 'Escalation Type',
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => {
      const priority = row.original.priority

      const priorityStyles: Record<string, string> = {
        Critical: 'bg-red-500/15 text-red-400',
        High: 'bg-orange-500/15 text-orange-400',
        Medium: 'bg-amber-500/15 text-amber-400',
        Low: 'bg-emerald-500/15 text-emerald-400',
      }

      return (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            priorityStyles[priority] ?? 'bg-slate-500/15 text-slate-300'
          }`}
        >
          {priority}
        </span>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status

      const statusStyles: Record<string, string> = {
        Open: 'bg-red-500/15 text-red-400',
        'In Review': 'bg-amber-500/15 text-amber-400',
        Resolved: 'bg-emerald-500/15 text-emerald-400',
      }

      return (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            statusStyles[status] ?? 'bg-slate-500/15 text-slate-300'
          }`}
        >
          {status}
        </span>
      )
    },
  },
  {
    accessorKey: 'createdOn',
    header: 'Created On',
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    cell: ({ row }) => <EscalationActions escalation={row.original} />,
  },
]
