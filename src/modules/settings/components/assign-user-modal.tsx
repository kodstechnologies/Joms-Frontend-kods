import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

import { useSubAdmins } from '@/modules/rbac/hooks/use-rbac'
import { RequiredMark } from '@/shared/components/form/required-mark'

import type { IncidentRow } from '../types/settings'

type AssignUserModalProps = {
  open: boolean
  incident: IncidentRow | null
  onClose: () => void
  onSubmit: (department: string, user: string, assigneeId: string) => void
}

export function AssignUserModal({ open, incident, onClose, onSubmit }: AssignUserModalProps) {
  const [department, setDepartment] = useState('')
  const [userId, setUserId] = useState('')
  const [wasOpen, setWasOpen] = useState(open)

  const subAdminsQuery = useSubAdmins({ page: 1, limit: 500, status: 'active' }, { enabled: open })

  const subAdmins = useMemo(() => subAdminsQuery.data?.data ?? [], [subAdminsQuery.data?.data])

  const departmentOptions = useMemo(() => {
    const values = subAdmins.map((item) => item.department?.trim()).filter(Boolean) as string[]
    return [...new Set(values)].sort((a, b) => a.localeCompare(b))
  }, [subAdmins])

  const users = useMemo(() => {
    if (!department) return []
    return subAdmins.filter((item) => item.department === department)
  }, [department, subAdmins])

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setDepartment('')
      setUserId('')
    }
  }

  if (!open) return null

  const selectedUser = users.find((item) => item.id === userId)

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <div className="ui-modal-shell max-w-[480px]">
        <div className="ui-modal-header">
          <div>
            <h2 className="text-h2 text-brand-text">Assign User</h2>
            <p className="text-body-sm text-muted mt-1">
              {incident ? `Assign owner for ${incident.incidentId}` : 'Select department & users'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-brand-muted rounded-full p-1.5 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="icon-lg" aria-hidden="true" />
          </button>
        </div>

        <div className="ui-modal-body space-y-4">
          <label className="block space-y-2">
            <span className="text-body-md-medium text-brand-text">
              Select Department <RequiredMark />
            </span>
            <select
              className="ui-input"
              value={department}
              onChange={(event) => {
                setDepartment(event.target.value)
                setUserId('')
              }}
              disabled={subAdminsQuery.isLoading}
            >
              <option value="">Select here</option>
              {departmentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-body-md-medium text-brand-text">
              Select User <RequiredMark />
            </span>
            <select
              className="ui-input"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              disabled={!department || subAdminsQuery.isLoading}
            >
              <option value="">Select user here</option>
              {users.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.fullname || `${option.firstName} ${option.lastName}`.trim()}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="ui-modal-footer">
          <button type="button" onClick={onClose} className="ui-modal-btn ui-modal-btn-cancel">
            Cancel
          </button>
          <button
            type="button"
            disabled={!department || !userId || !selectedUser}
            onClick={() =>
              onSubmit(
                department,
                selectedUser?.fullname ||
                  `${selectedUser?.firstName || ''} ${selectedUser?.lastName || ''}`.trim(),
                userId,
              )
            }
            className="ui-modal-btn ui-modal-btn-gold"
          >
            Assign User
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
