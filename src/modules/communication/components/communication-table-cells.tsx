import { useState } from 'react'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { Communication } from '../mock/communication-data'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { cn } from '@/shared/lib/cn'

export function CommunicationActions() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <TableActionsDropdown label="Communication actions" isOpen={open} onOpenChange={setOpen}>
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
      <TableActionsItem icon={<Trash2 className="size-4" />} onClick={() => setOpen(false)}>
        Delete
      </TableActionsItem>
    </TableActionsDropdown>
  )
}

export function CommunicationStatusBadge({ status }: { status: Communication['status'] }) {
  if (status === 'Active') {
    return <span className="text-brand-success text-xs font-semibold">{status}</span>
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
        statusStyles[status] ?? 'text-brand-muted border-white/10 bg-white/5',
      )}
    >
      {status}
    </span>
  )
}
