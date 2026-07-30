import { useState } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

import { RequiredMark } from '@/shared/components/form/required-mark'

import { departmentOptions, userOptionsByDepartment } from '../mock/incident-tracking.mock'
import type { IncidentRow } from '../types/settings'

type AssignUserModalProps = {
  open: boolean
  incident: IncidentRow | null
  onClose: () => void
  onSubmit: (department: string, user: string) => void
}

export function AssignUserModal({ open, incident, onClose, onSubmit }: AssignUserModalProps) {
  const [department, setDepartment] = useState('')
  const [user, setUser] = useState('')
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setDepartment('')
      setUser('')
    }
  }

  if (!open) return null

  const users = department ? (userOptionsByDepartment[department] ?? []) : []

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
                setUser('')
              }}
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
              value={user}
              onChange={(event) => setUser(event.target.value)}
              disabled={!department}
            >
              <option value="">Select user here</option>
              {users.map((option) => (
                <option key={option} value={option}>
                  {option}
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
            disabled={!department || !user}
            onClick={() => onSubmit(department, user)}
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
