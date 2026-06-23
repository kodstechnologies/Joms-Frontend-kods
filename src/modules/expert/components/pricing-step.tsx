import { useState } from 'react'
import { ChevronRight, X } from 'lucide-react'

interface PricingStepProps {
  venueData: any
  setVenueData: React.Dispatch<React.SetStateAction<any>>
}

export const PricingStep = ({
  venueData,
  setVenueData,
}: PricingStepProps) => {
  const [showAvailabilityModal, setShowAvailabilityModal] =
    useState(false)

  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]

  return (
    <>
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-slate-800 bg-[#121212] p-8">
          <h2 className="text-lg font-semibold text-white">
            Set Pricing
          </h2>

          <p className="mb-8 text-sm text-slate-400">
            Provide details about your service offering
          </p>

          <div className="grid grid-cols-2 gap-6">
            {/* Service */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Service *
              </label>

              <select
                value={venueData.serviceType || 'entire_space'}
                onChange={(e) =>
                  setVenueData((prev: any) => ({
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

            {/* Set Days */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Set Days *
              </label>

              <input
                type="number"
                value={venueData.setDays || ''}
                onChange={(e) =>
                  setVenueData((prev: any) => ({
                    ...prev,
                    setDays: e.target.value,
                  }))
                }
                placeholder="01"
                className="h-12 w-full rounded-full border border-black bg-black px-5 text-center text-white outline-none"
              />
            </div>

            {/* Weekday */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Weekday *
              </label>

              <input
                type="text"
                value={
                  venueData.weekdayPrice || ''
                }
                onChange={(e) =>
                  setVenueData((prev: any) => ({
                    ...prev,
                    weekdayPrice:
                      e.target.value,
                  }))
                }
                placeholder="₹55,000.00"
                className="h-12 w-full rounded-full border border-black bg-black px-5 text-white outline-none"
              />
            </div>

            {/* Weekend */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Weekend *
              </label>

              <input
                type="text"
                value={
                  venueData.weekendPrice || ''
                }
                onChange={(e) =>
                  setVenueData((prev: any) => ({
                    ...prev,
                    weekendPrice:
                      e.target.value,
                  }))
                }
                placeholder="₹55,000.00"
                className="h-12 w-full rounded-full border border-black bg-black px-5 text-white outline-none"
              />
            </div>

            {/* Set Availability */}
            <div className="col-span-2">
              <button
                type="button"
                onClick={() =>
                  setShowAvailabilityModal(
                    true,
                  )
                }
                className="flex h-12 w-full items-center justify-between rounded-xl border border-black bg-black px-5 text-white"
              >
                <span>
                  Set Availability
                </span>

                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAvailabilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-[650px] rounded-2xl bg-[#121212]">
            <div className="flex items-center justify-between border-b border-slate-800 p-6">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Schedule Date & Time
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Set time & date regarding
                  availability
                </p>
              </div>

              <button
                onClick={() =>
                  setShowAvailabilityModal(
                    false,
                  )
                }
              >
                <X
                  size={22}
                  className="text-white"
                />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="mb-4 grid grid-cols-3 text-sm font-medium text-white">
                  <span>
                    Availability
                  </span>
                  <span>From</span>
                  <span>To</span>
                </div>

                <div className="space-y-3">
                  {days.map(day => (
                    <div
                      key={day}
                      className="grid grid-cols-3 items-center gap-4"
                    >
                      <label className="flex items-center gap-2 text-sm text-white">
                        <input
                          type="checkbox"
                          defaultChecked
                        />
                        {day}
                      </label>

                      <input
                        type="time"
                        className="rounded bg-black px-2 py-1 text-xs text-white"
                      />

                      <input
                        type="time"
                        className="rounded bg-black px-2 py-1 text-xs text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-white">
                  Unavailability
                </h3>

                <div className="flex items-end gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">
                      Date
                    </label>

                    <input
                      type="date"
                      className="rounded bg-black px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-slate-400">
                      Time
                    </label>

                    <input
                      type="time"
                      className="rounded bg-black px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-slate-400">
                      To
                    </label>

                    <input
                      type="time"
                      className="rounded bg-black px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <button className="rounded border border-slate-600 px-4 py-2 text-xs text-white">
                    Add More
                  </button>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() =>
                    setShowAvailabilityModal(
                      false,
                    )
                  }
                  className="w-32 rounded-lg border border-slate-500 py-3 text-sm text-white"
                >
                  Cancel
                </button>

                <button
                  onClick={() =>
                    setShowAvailabilityModal(
                      false,
                    )
                  }
                  className="w-40 rounded-lg bg-[#F5C37A] py-3 text-sm font-medium text-black"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}