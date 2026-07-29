import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import type { Communication } from '../api/communication-api'
import { useDeleteCommunication } from '../hooks/use-communications'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import eyeIcon from '@/assets/JOMS_ICONS/icons8-eye.svg'
import editIcon from '@/assets/JOMS_ICONS/icons8-edit-file.svg'
import deleteIcon from '@/assets/JOMS_ICONS/icons8-delete.svg'

export function CommunicationActions({ communication }: { communication: Communication }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const deleteMutation = useDeleteCommunication()

  return (
    <TableActionsDropdown
      label="Communication actions"
      isOpen={open}
      onOpenChange={setOpen}
      menuWidth={180}
    >
      <TableActionsItem
        icon={<img src={eyeIcon} alt="" className="size-3.5" aria-hidden="true" />}
        className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
        onClick={() => {
          setOpen(false)
          navigate(`/communication/view/${communication.id}`)
        }}
      >
        View Details
      </TableActionsItem>
      <TableActionsItem
        icon={<img src={editIcon} alt="" className="size-3.5" aria-hidden="true" />}
        className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
        onClick={() => {
          setOpen(false)
          navigate(`/communication/create?edit=${communication.id}`)
        }}
      >
        Edit
      </TableActionsItem>
      <TableActionsItem
        icon={<img src={deleteIcon} alt="" className="size-3.5" aria-hidden="true" />}
        className="text-brand-danger hover:bg-brand-danger/10 hover:text-brand-danger"
        onClick={() => {
          setOpen(false)
          deleteMutation.mutate(communication.id, {
            onSuccess: () => toast.success('Communication deleted'),
            onError: (error) => toast.error(getApiErrorMessage(error)),
          })
        }}
      >
        Delete
      </TableActionsItem>
    </TableActionsDropdown>
  )
}

export function CommunicationStatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, { bg: string; color: string }> = {
    Sent: { bg: 'rgb(0 166 62 / 15%)', color: '#00A63E' },
    Active: { bg: 'rgb(0 166 62 / 15%)', color: '#00A63E' },
    Scheduled: { bg: 'rgb(246 203 134 / 15%)', color: '#F6CB86' },
    Draft: { bg: 'rgb(255 255 255 / 10%)', color: '#B3B3B3' },
    Failed: { bg: 'rgb(211 25 28 / 15%)', color: '#D3191C' },
  }

  const style = statusStyles[status] ?? { bg: 'rgb(255 255 255 / 10%)', color: '#B3B3B3' }

  return (
    <span
      className="text-body-sm-semibold inline-flex h-5 items-center rounded px-2"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {status}
    </span>
  )
}
