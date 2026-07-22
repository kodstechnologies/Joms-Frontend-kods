import { useState } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

type ScheduleMaintenanceModalProps = {
  open: boolean
  onClose: () => void
}

export function ScheduleMaintenanceModal({ open, onClose }: ScheduleMaintenanceModalProps) {
  const [startDate, setStartDate] = useState('2025-11-22')
  const [endDate, setEndDate] = useState('2025-11-23')
  const [startTime, setStartTime] = useState('19:00')
  const [endTime, setEndTime] = useState('20:00')

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <div className="ui-modal-shell">
        <div className="ui-modal-header">
          <div>
            <h2 className="text-h2 text-brand-text">Schedule Maintenance</h2>
            <p className="text-body-sm text-muted mt-1">Enter Start Date & End Date and time</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-brand-muted rounded-full p-1.5 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="icon-lg" aria-hidden="true" />
          </button>
        </div>

        <div className="ui-modal-body">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-body-md text-brand-text space-y-2">
              Start Date
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="ui-input [color-scheme:dark]"
              />
            </label>
            <label className="text-body-md text-brand-text space-y-2">
              End Date
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="ui-input [color-scheme:dark]"
              />
            </label>
            <label className="text-body-md text-brand-text space-y-2">
              Start Time
              <input
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="ui-input [color-scheme:dark]"
              />
            </label>
            <label className="text-body-md text-brand-text space-y-2">
              End Time
              <input
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="ui-input [color-scheme:dark]"
              />
            </label>
          </div>
        </div>

        <div className="ui-modal-footer flex-col-reverse sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setStartDate('2025-11-22')
              setEndDate('2025-11-23')
              setStartTime('19:00')
              setEndTime('20:00')
            }}
            className="ui-cta ui-cta-outline w-full sm:w-auto"
          >
            Reset
          </button>
          <div className="flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="ui-cta ui-cta-outline w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                toast.success('Maintenance scheduled (static preview)')
                onClose()
              }}
              className="ui-cta ui-cta-primary w-full sm:w-auto"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
