import { useState } from 'react'
import { User } from 'lucide-react'

import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { useOpenEscalation } from '@/modules/my-tasks/hooks/use-open-escalation'

import type { Escalation } from '../defaults/escalation-data'

type EscalationActionsProps = {
  escalation: Escalation
}

export function EscalationActions({ escalation }: EscalationActionsProps) {
  const [open, setOpen] = useState(false)
  const openEscalation = useOpenEscalation()

  const handleView = () => {
    setOpen(false)
    openEscalation({
      entityType: escalation.entityType,
      entityId: escalation.entityId,
      venueId: escalation.venueId,
      serviceType: escalation.serviceType,
      applicationUrl: escalation.applicationUrl,
    })
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
