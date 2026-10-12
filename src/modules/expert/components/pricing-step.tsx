import { useState } from 'react'
import { ChevronRight, Trash2, X } from 'lucide-react'
import clockIcon from '@/assets/JOMS_ICONS-2/icons8-clock-24.svg'

import {
  createDefaultWeeklyAvailability,
  type BlockedDateEntry,
  type VenueFormData,
  type WeeklyAvailabilityEntry,
} from '../utils/venue-form'
import { RequiredMark } from '@/shared/components/form/required-mark'
import { useVenuePublicSettings } from '@/modules/settings/hooks/use-venue-public-settings'

interface PricingStepProps {
  venueData: VenueFormData
  setVenueData: React.Dispatch<React.SetStateAction<VenueFormData>>
}

export const PricingStep = ({ venueData, setVenueData }: PricingStepProps) => {
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const { data: venueSettings } = useVenuePublicSettings()
  const pricingControls = venueSettings?.pricingControls
  const blackoutDatesEnabled = venueSettings?.bookingRules.blackoutDates !== false

  const allowBaseRates =
    pricingControls?.hourlyRates !== false || pricingControls?.fullDayRates !== false
  const hasExistingWeekend = Boolean(venueData.weekendPrice)
  const hasExistingPeak = Boolean(venueData.reservationFee)
  const hasExistingBlackout = (venueData.blockedDates?.length || 0) > 0

  const allowWeekend = Boolean(pricingControls?.weekendPricing) || hasExistingWeekend
  const allowPeak = Boolean(pricingControls?.peakPricing) || hasExistingPeak
  const allowBlackout = blackoutDatesEnabled || hasExistingBlackout
  const allowFullDay = pricingControls?.fullDayRates !== false
  const allowHourlyOnly =
    pricingControls?.hourlyRates !== false && pricingControls?.fullDayRates === false

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
      ).map((entry, i) => (i === index ? { ...entry, [field]: value } : entry)),
    }))
  }

  const addBlockedDate = () => {
    if (!allowBlackout) return
    setVenueData((prev) => ({
      ...prev,
      blockedDates: [
        ...(prev.blockedDates || []),
        { date: '', from: '09:00', to: '18:00' } as BlockedDateEntry,
      ],
    }))
  }

  const updateBlockedDate = (index: number, field: keyof BlockedDateEntry, value: string) => {
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
      <div className="mx-auto w-full max-w-[1140px]">
        <div className="animate-in fade-in slide-in-from-right-4 bg-brand-surface rounded-lg border border-white/5 p-6 shadow-xl duration-300">
          <h2 className="text-lg font-semibold text-white">Set Pricing</h2>

          <p className="text-muted mb-8 text-sm">Provide details about your service offering</p>

          {!allowBaseRates && (
            <p className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              Hourly and full-day rates are disabled in Venue Management settings.
              {allowWeekend
                ? ' Weekday price is not required. Enter weekend pricing to continue.'
                : ' Enable at least one rate type to set pricing.'}
            </p>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Service <RequiredMark />
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

            {allowFullDay && (
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Set Days {allowHourlyOnly ? null : <RequiredMark />}
                </label>

                <input
                  type="number"
                  min={1}
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
            )}

            {allowBaseRates && (
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  {allowHourlyOnly ? 'Hourly / Weekday' : 'Weekday'} <RequiredMark />
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
            )}

            {allowWeekend && (
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Weekend <RequiredMark />
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
            )}

            {allowPeak && (
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Peak pricing</label>

                <input
                  type="text"
                  value={venueData.reservationFee || ''}
                  onChange={(e) =>
                    setVenueData((prev) => ({
                      ...prev,
                      reservationFee: e.target.value,
                    }))
                  }
                  placeholder="₹5,000.00"
                  className="h-12 w-full rounded-full border border-black bg-black px-5 text-white outline-none"
                />
              </div>
            )}

            <div className="col-span-2">
              <button
                type="button"
                onClick={() => setShowAvailabilityModal(true)}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-black bg-black px-5 text-white"
              >
                <span>
                  Set Availability
                  <span className="text-muted ml-2 text-xs">
                    ({enabledDaysCount} days
                    {blackoutDatesEnabled && blockedDates.length > 0
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/80">
          <div className="ui-modal-shell max-h-[90vh] w-[650px] max-w-[650px] overflow-y-auto">
            <div className="ui-modal-header">
              <div>
                <h2 className="text-h2 font-semibold text-white">Schedule Date & Time</h2>

                <p className="text-muted mt-1 text-sm">Set time & date regarding availability</p>
              </div>

              <button
                type="button"
                onClick={() => setShowAvailabilityModal(false)}
                aria-label="Close"
              >
                <X size={22} className="text-white" />
              </button>
            </div>

            <div className="ui-modal-body">
              <div className="mb-6">
                <div className="mb-4 grid grid-cols-3 text-sm font-medium text-white">
                  <span>Availability</span>
                  <span>From</span>
                  <span>To</span>
                </div>

                <div className="space-y-3">
                  {weeklyAvailability.map((entry, index) => (
                    <div key={entry.day} className="grid grid-cols-3 items-center gap-4">
                      <label className="flex items-center gap-2 text-sm text-white">
                        <input
                          type="checkbox"
                          checked={entry.enabled}
                          onChange={(e) => updateDay(index, 'enabled', e.target.checked)}
                        />
                        {entry.day}
                      </label>

                      <div className="relative">
                        <input
                          type="time"
                          value={entry.from}
                          disabled={!entry.enabled}
                          onChange={(e) => updateDay(index, 'from', e.target.value)}
                          className="w-full rounded bg-black px-2 py-1.5 text-xs text-white disabled:opacity-40 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:z-10 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                        />
                        <img
                          src={clockIcon}
                          alt=""
                          className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 opacity-70 invert"
                        />
                      </div>

                      <div className="relative">
                        <input
                          type="time"
                          value={entry.to}
                          disabled={!entry.enabled}
                          onChange={(e) => updateDay(index, 'to', e.target.value)}
                          className="w-full rounded bg-black px-2 py-1.5 text-xs text-white disabled:opacity-40 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:z-10 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                        />
                        <img
                          src={clockIcon}
                          alt=""
                          className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 opacity-70 invert"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {blackoutDatesEnabled ? (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Unavailability</h3>
                    <button
                      type="button"
                      onClick={addBlockedDate}
                      className="ui-cta ui-cta-outline px-4 py-1.5 text-xs"
                    >
                      Add More
                    </button>
                  </div>

                  {blockedDates.length === 0 ? (
                    <p className="text-muted rounded bg-black p-3 text-xs">
                      No blocked dates added.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {blockedDates.map((entry, index) => (
                        <div key={index} className="flex items-end gap-3 rounded-lg bg-black p-3">
                          <div>
                            <label className="text-muted mb-1 block text-xs">Date</label>
                            <input
                              type="date"
                              value={entry.date}
                              onChange={(e) => updateBlockedDate(index, 'date', e.target.value)}
                              className="ui-input bg-brand-surface rounded px-3 py-2 text-xs"
                            />
                          </div>

                          <div className="relative w-full">
                            <label className="text-muted mb-1 block text-xs">Time</label>
                            <div className="relative">
                              <input
                                type="time"
                                value={entry.from}
                                onChange={(e) => updateBlockedDate(index, 'from', e.target.value)}
                                className="ui-input bg-brand-surface w-full rounded px-3 py-2 text-xs [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:z-10 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                              />
                              <img
                                src={clockIcon}
                                alt=""
                                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 opacity-70 invert"
                              />
                            </div>
                          </div>

                          <div className="relative w-full">
                            <label className="text-muted mb-1 block text-xs">To</label>
                            <div className="relative">
                              <input
                                type="time"
                                value={entry.to}
                                onChange={(e) => updateBlockedDate(index, 'to', e.target.value)}
                                className="ui-input bg-brand-surface w-full rounded px-3 py-2 text-xs [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:z-10 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                              />
                              <img
                                src={clockIcon}
                                alt=""
                                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 opacity-70 invert"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeBlockedDate(index)}
                            className="ui-cta ui-cta-negative flex h-9 w-9 items-center justify-center p-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted rounded bg-black p-3 text-xs">
                  Blackout dates are disabled in Venue Management settings.
                </p>
              )}

              <div className="ui-modal-footer mt-8 justify-between">
                <button
                  type="button"
                  onClick={() => setShowAvailabilityModal(false)}
                  className="ui-modal-btn ui-modal-btn-cancel w-32 flex-none"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => setShowAvailabilityModal(false)}
                  className="ui-modal-btn ui-modal-btn-gold w-40 flex-none"
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
