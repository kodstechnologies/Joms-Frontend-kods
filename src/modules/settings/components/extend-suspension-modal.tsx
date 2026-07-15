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
      <div className="max-h-[90vh] w-full max-w-[720px] overflow-y-auto rounded-2xl border border-white/10 bg-[#141414] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Extend Suspension</h2>
            <p className="mt-1 text-xs text-slate-500">Enter Start date & End Date and time</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="mb-3 text-sm font-medium text-white">November 2025</p>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400">
                {Array.from({ length: 30 }, (_, index) => {
                  const day = index + 1
                  const highlighted = day === 22 || day === 23
                  return (
                    <span
                      key={day}
                      className={
                        highlighted ? 'rounded-md bg-[#F0C27B]/20 py-1 text-[#F0C27B]' : 'py-1'
                      }
                    >
                      {day}
                    </span>
                  )
                })}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="text-slate-400">Start Date</span>
                <input
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="h-10 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 text-white"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="text-slate-400">End Date</span>
                <input
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="h-10 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 text-white"
                />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="text-slate-400">Start Time</span>
                <input
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="h-10 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 text-white"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="text-slate-400">End Time</span>
                <input
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  className="h-10 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 text-white"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="max-h-40 overflow-y-auto text-sm text-slate-300">
                {['12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM'].map((hour) => (
                  <p key={hour} className="py-1">
                    {hour}
                  </p>
                ))}
              </div>
              <div className="max-h-40 overflow-y-auto text-sm text-slate-300">
                {['00', '01', '02', '03', '04', '05', '06', '07'].map((minute) => (
                  <p key={minute} className="py-1">
                    {minute}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#050505]"
          >
            Submit
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
