import { useState } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

type ExtendSuspensionModalProps = {
  open: boolean
  onClose: () => void
  onSubmit: () => void
}

export function ExtendSuspensionModal({ open, onClose, onSubmit }: ExtendSuspensionModalProps) {
  const [startDate, setStartDate] = useState('07:00 PM')
  const [endDate, setEndDate] = useState('07:00 PM')
  const [startTime, setStartTime] = useState('07:00 PM')
  const [endTime, setEndTime] = useState('08:00 PM')

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <div className="ui-modal-shell max-w-[720px]">
        <div className="ui-modal-header">
          <div>
            <h2 className="text-h2 text-brand-text">Extend Suspension</h2>
            <p className="text-body-sm text-muted mt-1">Enter Start date & End Date and time</p>
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
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="radius-lg bg-brand-bg border border-white/10 p-4">
                <p className="text-body-md-medium text-brand-text mb-3">November 2025</p>
                <div className="text-body-sm text-muted grid grid-cols-7 gap-1 text-center">
                  {Array.from({ length: 30 }, (_, index) => {
                    const day = index + 1
                    const highlighted = day === 22 || day === 23
                    return (
                      <span
                        key={day}
                        className={
                          highlighted
                            ? 'radius-md bg-brand-accent/20 text-brand-accent py-1'
                            : 'py-1'
                        }
                      >
                        {day}
                      </span>
                    )
                  })}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-body-md text-muted">Start Date</span>
                  <input
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="ui-input"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-body-md text-muted">End Date</span>
                  <input
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="ui-input"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-body-md text-muted">Start Time</span>
                  <input
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                    className="ui-input"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-body-md text-muted">End Time</span>
                  <input
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                    className="ui-input"
                  />
                </label>
              </div>
              <div className="radius-lg bg-brand-bg grid grid-cols-2 gap-3 border border-white/10 p-3">
                <div className="text-body-md text-brand-text max-h-40 overflow-y-auto">
                  {['12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM'].map((hour) => (
                    <p key={hour} className="py-1">
                      {hour}
                    </p>
                  ))}
                </div>
                <div className="text-body-md text-brand-text max-h-40 overflow-y-auto">
                  {['00', '01', '02', '03', '04', '05', '06', '07'].map((minute) => (
                    <p key={minute} className="py-1">
                      {minute}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ui-modal-footer">
          <button type="button" onClick={onClose} className="ui-modal-btn ui-modal-btn-cancel">
            Reset
          </button>
          <button type="button" onClick={onSubmit} className="ui-modal-btn ui-modal-btn-gold">
            Submit
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
