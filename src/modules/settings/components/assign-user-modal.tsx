import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

import { departmentOptions, userOptionsByDepartment } from '../mock/incident-tracking.mock'
import type { IncidentRow } from '../types/settings'
import { settingsControlClass } from './settings-field-row'

type AssignUserModalProps = {
  open: boolean
  incident: IncidentRow | null
  onClose: () => void
  onSubmit: (department: string, user: string) => void
}

export function AssignUserModal({ open, incident, onClose, onSubmit }: AssignUserModalProps) {
  const [department, setDepartment] = useState('')
  const [user, setUser] = useState('')

  useEffect(() => {
    if (open) {
      setDepartment('')
      setUser('')
    }
  }, [open])

  if (!open) return null

  const users = department ? userOptionsByDepartment[department] ?? [] : []

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-[480px] rounded-2xl border border-white/10 bg-[#141414] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Assign User</h2>
            <p className="mt-1 text-xs text-slate-500">
              {incident ? `Assign owner for ${incident.incidentId}` : 'Select department & users'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-white">Select Department*</span>
            <select
              className={settingsControlClass}
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
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-white">Select User*</span>
            <select
              className={settingsControlClass}
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

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!department || !user}
            onClick={() => onSubmit(department, user)}
            className="rounded-xl bg-[#F0C27B] px-5 py-2.5 text-sm font-semibold text-[#050505] disabled:opacity-50"
          >
            Assign User
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
