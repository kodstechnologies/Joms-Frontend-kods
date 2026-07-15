import type { ColumnDef } from '@tanstack/react-table'

import type { Communication } from '../mock/communication-data'
import { CommunicationActions, CommunicationStatusBadge } from './communication-table-cells'

export const communicationColumns: ColumnDef<Communication>[] = [
  {
    id: 'select',
    header: () => <input type="checkbox" className="rounded border-white/20 bg-transparent" />,
    cell: () => <input type="checkbox" className="rounded border-white/20 bg-transparent" />,
    meta: { headerClassName: 'w-10', cellClassName: 'w-10' },
    enableSorting: false,
  },
  {
    accessorKey: 'id',
    header: 'Message ID',
  },
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'channel',
    header: 'Channel',
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'audience',
    header: 'Audience',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <CommunicationStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'createdBy',
    header: 'Created By',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created On',
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
    cell: () => <CommunicationActions />,
  },
]
