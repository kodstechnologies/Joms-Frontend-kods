import type { ColumnDef } from '@tanstack/react-table'

import type { Communication } from '../api/communication-api'
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
    accessorKey: 'messageId',
    header: 'Message ID',
  },
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'channelLabel',
    header: 'Channel',
  },
  {
    accessorKey: 'typeLabel',
    header: 'Type',
  },
  {
    accessorKey: 'audienceLabel',
    header: 'Audience',
  },
  {
    accessorKey: 'statusLabel',
    header: 'Status',
    cell: ({ row }) => <CommunicationStatusBadge status={row.original.statusLabel} />,
  },
  {
    accessorKey: 'createdBy',
    header: 'Created By',
  },
  {
    accessorKey: 'createdAtLabel',
    header: 'Created On',
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    meta: { headerClassName: 'pr-5 text-right', cellClassName: 'relative pr-5 text-right' },
    cell: ({ row }) => <CommunicationActions communication={row.original} />,
  },
]
