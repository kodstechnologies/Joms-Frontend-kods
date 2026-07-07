import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { Communication } from '../mock/communication-data'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { cn } from '@/shared/lib/cn'

function CommunicationActions() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <TableActionsDropdown
      label="Communication actions"
      isOpen={open}
      onOpenChange={setOpen}
    >
      <TableActionsItem
        icon={<Eye className="size-4" />}
        onClick={() => {
          setOpen(false)
          navigate('/communication/view')
        }}
      >
        View Details
      </TableActionsItem>
      <TableActionsItem
        icon={<Pencil className="size-4" />}
        onClick={() => {
          setOpen(false)
          navigate('/communication/create')
        }}
      >
        Edit
      </TableActionsItem>
      <TableActionsItem
        icon={<Trash2 className="size-4" />}
        onClick={() => setOpen(false)}
      >
        Delete
      </TableActionsItem>
    </TableActionsDropdown>
  )
}

function StatusBadge({ status }: { status: Communication['status'] }) {
  if (status === 'Active') {
    return <span className="text-xs font-semibold text-brand-success">{status}</span>
  }

  const statusStyles: Record<string, string> = {
    Sent: 'border-brand-success/25 bg-brand-success/10 text-brand-success',
    Scheduled: 'border-brand-accent-muted bg-brand-accent/15 text-brand-accent',
    Draft: 'border-white/10 bg-white/5 text-brand-muted',
    Failed: 'border-brand-danger/25 bg-brand-danger/10 text-brand-danger',
  }

  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
        statusStyles[status] ?? 'border-white/10 bg-white/5 text-brand-muted',
      )}
    >
      {status}
    </span>
  )
}

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
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
