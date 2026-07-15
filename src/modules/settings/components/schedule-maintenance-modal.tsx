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
      <div className="w-full max-w-[560px] rounded-2xl border border-white/10 bg-[#141414] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-bold text-white">Schedule Maintenance</h2>
            <p className="mt-1 text-[12px] text-[#888888]">Enter Start Date & End Date and time</p>
          </div>
          <button type="button" onClick={onClose} className="text-[#888888] hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-300">
            Start Date
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 text-white"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            End Date
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 text-white"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            Start Time
            <input
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 text-white"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            End Time
            <input
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 text-white"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() => {
              setStartDate('2025-11-22')
              setEndDate('2025-11-23')
              setStartTime('19:00')
              setEndTime('20:00')
            }}
            className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Reset
          </button>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                toast.success('Maintenance scheduled (static preview)')
                onClose()
              }}
              className="rounded-xl bg-[#F0C27B] px-5 py-2.5 text-sm font-semibold text-[#050505]"
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
