import type { ColumnDef } from '@tanstack/react-table'

import { EscalationActions } from './escalation-actions'
import type { Escalation } from '../config/escalation-data'

export const escalationColumns: ColumnDef<Escalation>[] = [
  {
    id: 'escalation-id',
    accessorKey: 'escalationId',
    header: 'Escalation ID',
    cell: ({ row }) => (
      <span className="text-body-sm-semibold text-brand-text font-mono uppercase">
        {row.original.escalationId}
      </span>
    ),
  },
  {
    id: 'roles-id',
    accessorKey: 'roleId',
    header: 'Roles ID',
  },
  {
    id: 'role-name',
    accessorKey: 'roleName',
    header: 'Role Name',
  },
  {
    id: 'escalation-type',
    accessorKey: 'escalationType',
    header: 'Escalation Type',
  },
  {
    id: 'priority',
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => {
      const priority = row.original.priority

      const priorityStyles: Record<string, { bg: string; color: string }> = {
        Critical: { bg: 'rgb(211 25 28 / 15%)', color: '#D3191C' },
        High: { bg: 'rgb(245 73 0 / 15%)', color: '#F54900' },
        Medium: { bg: 'rgb(246 203 134 / 15%)', color: '#F6CB86' },
        Low: { bg: 'rgb(0 166 62 / 15%)', color: '#00A63E' },
      }

      const style = priorityStyles[priority] ?? { bg: 'rgb(255 255 255 / 10%)', color: '#ffffff' }

      return (
        <span
          className="text-body-sm-semibold inline-flex h-5 items-center rounded px-2"
          style={{ backgroundColor: style.bg, color: style.color }}
        >
          {priority}
        </span>
      )
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status

      const statusStyles: Record<string, { bg: string; color: string }> = {
        Open: { bg: 'rgb(211 25 28 / 15%)', color: '#D3191C' },
        'In Review': { bg: 'rgb(20 71 230 / 15%)', color: '#1447E6' },
        Resolved: { bg: 'rgb(0 166 62 / 15%)', color: '#00A63E' },
      }

      const style = statusStyles[status] ?? { bg: 'rgb(255 255 255 / 10%)', color: '#ffffff' }

      return (
        <span
          className="text-body-sm-semibold inline-flex h-5 items-center rounded px-2"
          style={{ backgroundColor: style.bg, color: style.color }}
        >
          {status}
        </span>
      )
    },
  },
  {
    id: 'created-on',
    accessorKey: 'createdOn',
    header: 'Created On',
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
    cell: ({ row }) => <EscalationActions escalation={row.original} />,
  },
]
