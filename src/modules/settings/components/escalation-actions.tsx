import { useState } from 'react'
import { User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

import type { Escalation } from '../mock/escalation-data'

type EscalationActionsProps = {
  escalation: Escalation
}

export function EscalationActions({ escalation }: EscalationActionsProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleView = () => {
    setOpen(false)

    if (escalation.applicationUrl) {
      navigate(escalation.applicationUrl)
      return
    }

    navigate('/settings/escalations')
  }

  return (
    <div className="flex items-center justify-center">
      <TableActionsDropdown label="Escalation Actions" isOpen={open} onOpenChange={setOpen}>
        <TableActionsItem icon={<User className="size-3.5 text-slate-700" />} onClick={handleView}>
          View Details
        </TableActionsItem>
      </TableActionsDropdown>
    </div>
  )
}
