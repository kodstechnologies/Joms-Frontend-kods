import { useState } from 'react'
import { ChevronRight, Trash2, X } from 'lucide-react'

import {
  createDefaultWeeklyAvailability,
  type BlockedDateEntry,
  type VenueFormData,
  type WeeklyAvailabilityEntry,
} from '../utils/venue-form'

interface PricingStepProps {
  venueData: VenueFormData
  setVenueData: React.Dispatch<React.SetStateAction<VenueFormData>>
}

export const PricingStep = ({ venueData, setVenueData }: PricingStepProps) => {
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)

  const weeklyAvailability =
    venueData.weeklyAvailability?.length > 0
      ? venueData.weeklyAvailability
      : createDefaultWeeklyAvailability()

  const blockedDates = venueData.blockedDates || []

  const updateDay = (
    index: number,
    field: keyof WeeklyAvailabilityEntry,
    value: string | boolean,
  ) => {
    setVenueData((prev) => ({
      ...prev,
      weeklyAvailability: (prev.weeklyAvailability?.length
        ? prev.weeklyAvailability
        : createDefaultWeeklyAvailability()
      ).map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry,
      ),
    }))
  }

  const addBlockedDate = () => {
    setVenueData((prev) => ({
      ...prev,
      blockedDates: [
        ...(prev.blockedDates || []),
        { date: '', from: '09:00', to: '18:00' } as BlockedDateEntry,
      ],
    }))
  }

  const updateBlockedDate = (
    index: number,
    field: keyof BlockedDateEntry,
    value: string,
  ) => {
    setVenueData((prev) => ({
      ...prev,
      blockedDates: (prev.blockedDates || []).map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry,
      ),
    }))
  }

  const removeBlockedDate = (index: number) => {
    setVenueData((prev) => ({
      ...prev,
      blockedDates: (prev.blockedDates || []).filter((_, i) => i !== index),
    }))
  }

  const enabledDaysCount = weeklyAvailability.filter((d) => d.enabled).length

  return (
    <>
      <div className="mx-auto w-full max-w-[850px]">
        <div className="animate-in fade-in slide-in-from-right-4 rounded-lg border border-white/5 bg-[#151515] p-6 shadow-xl duration-300">
          <h2 className="text-lg font-semibold text-white">Set Pricing</h2>

          <p className="mb-8 text-sm text-slate-400">
            Provide details about your service offering
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Service *
              </label>

              <select
                value={venueData.serviceType || 'entire_space'}
                onChange={(e) =>
                  setVenueData((prev) => ({
                    ...prev,
                    serviceType: e.target.value,
                  }))
                }
                className="h-12 w-full rounded-full border border-black bg-black px-5 text-white outline-none"
              >
                <option value="entire_space">Entire Space</option>
                <option value="per_guest">Per Guest</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Set Days *
              </label>

              <input
                type="number"
                value={venueData.setDays || ''}
                onChange={(e) =>
                  setVenueData((prev) => ({
                    ...prev,
                    setDays: e.target.value,
                  }))
                }
                placeholder="01"
                className="h-12 w-full rounded-full border border-black bg-black px-5 text-center text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Weekday *
              </label>

              <input
                type="text"
                value={venueData.weekdayPrice || ''}
                onChange={(e) =>
                  setVenueData((prev) => ({
                    ...prev,
                    weekdayPrice: e.target.value,
                  }))
                }
                placeholder="₹55,000.00"
                className="h-12 w-full rounded-full border border-black bg-black px-5 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Weekend *
              </label>

              <input
                type="text"
                value={venueData.weekendPrice || ''}
                onChange={(e) =>
                  setVenueData((prev) => ({
                    ...prev,
                    weekendPrice: e.target.value,
                  }))
                }
                placeholder="₹55,000.00"
                className="h-12 w-full rounded-full border border-black bg-black px-5 text-white outline-none"
              />
            </div>

            <div className="col-span-2">
              <button
                type="button"
                onClick={() => setShowAvailabilityModal(true)}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-black bg-black px-5 text-white"
              >
                <span>
                  Set Availability
                  <span className="ml-2 text-xs text-slate-500">
                    ({enabledDaysCount} days
                    {blockedDates.length > 0
                      ? `, ${blockedDates.length} blocked`
                      : ''}
                    )
                  </span>
                </span>

                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAvailabilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="max-h-[90vh] w-[650px] overflow-y-auto rounded-2xl bg-[#121212]">
            <div className="flex items-center justify-between border-b border-slate-800 p-6">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Schedule Date & Time
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Set time & date regarding availability
                </p>
              </div>

              <button onClick={() => setShowAvailabilityModal(false)}>
                <X size={22} className="text-white" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="mb-4 grid grid-cols-3 text-sm font-medium text-white">
                  <span>Availability</span>
                  <span>From</span>
                  <span>To</span>
                </div>

                <div className="space-y-3">
                  {weeklyAvailability.map((entry, index) => (
                    <div
                      key={entry.day}
                      className="grid grid-cols-3 items-center gap-4"
                    >
                      <label className="flex items-center gap-2 text-sm text-white">
                        <input
                          type="checkbox"
                          checked={entry.enabled}
                          onChange={(e) =>
                            updateDay(index, 'enabled', e.target.checked)
                          }
                        />
                        {entry.day}
                      </label>

                      <input
                        type="time"
                        value={entry.from}
                        disabled={!entry.enabled}
                        onChange={(e) =>
                          updateDay(index, 'from', e.target.value)
                        }
                        className="rounded bg-black px-2 py-1 text-xs text-white disabled:opacity-40"
                      />

                      <input
                        type="time"
                        value={entry.to}
                        disabled={!entry.enabled}
                        onChange={(e) => updateDay(index, 'to', e.target.value)}
                        className="rounded bg-black px-2 py-1 text-xs text-white disabled:opacity-40"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">
                    Unavailability
                  </h3>
                  <button
                    type="button"
                    onClick={addBlockedDate}
                    className="rounded border border-slate-600 px-4 py-1.5 text-xs text-white hover:bg-white/5"
                  >
                    Add More
                  </button>
                </div>

                {blockedDates.length === 0 ? (
                  <p className="rounded bg-black p-3 text-xs text-slate-500">
                    No blocked dates added.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {blockedDates.map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-end gap-3 rounded-lg bg-black p-3"
                      >
                        <div>
                          <label className="mb-1 block text-xs text-slate-400">
                            Date
                          </label>
                          <input
                            type="date"
                            value={entry.date}
                            onChange={(e) =>
                              updateBlockedDate(index, 'date', e.target.value)
                            }
                            className="rounded bg-[#1a1a1a] px-3 py-2 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs text-slate-400">
                            Time
                          </label>
                          <input
                            type="time"
                            value={entry.from}
                            onChange={(e) =>
                              updateBlockedDate(index, 'from', e.target.value)
                            }
                            className="rounded bg-[#1a1a1a] px-3 py-2 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs text-slate-400">
                            To
                          </label>
                          <input
                            type="time"
                            value={entry.to}
                            onChange={(e) =>
                              updateBlockedDate(index, 'to', e.target.value)
                            }
                            className="rounded bg-[#1a1a1a] px-3 py-2 text-xs text-white"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeBlockedDate(index)}
                          className="flex h-9 w-9 items-center justify-center rounded-md bg-red-500/90 text-white"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setShowAvailabilityModal(false)}
                  className="w-32 rounded-lg border border-slate-500 py-3 text-sm text-white"
                >
                  Cancel
                </button>

                <button
                  onClick={() => setShowAvailabilityModal(false)}
                  className="w-40 rounded-lg bg-[#F5C37A] py-3 text-sm font-medium text-black"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
