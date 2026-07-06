import type { VenueSettings } from '../types/settings'
import { FinancialSettingsFields } from './financial-settings-fields'
import { SettingsFieldRow, settingsControlClass } from './settings-field-row'
import { SettingsSectionCard } from './settings-section-card'
import { SettingsToggleRow } from './settings-toggle-row'

type VenueSettingsPanelProps = {
  value: VenueSettings
  onChange: (next: VenueSettings) => void
}

export function VenueSettingsPanel({ value, onChange }: VenueSettingsPanelProps) {
  const patchBooking = (partial: Partial<VenueSettings['bookingRules']>) =>
    onChange({ ...value, bookingRules: { ...value.bookingRules, ...partial } })

  const patchPricing = (partial: Partial<VenueSettings['pricingControls']>) =>
    onChange({ ...value, pricingControls: { ...value.pricingControls, ...partial } })

  return (
    <div className="space-y-5">
      <SettingsSectionCard
        title="Venue Controls"
        description="Manage venue creation and ownership settings"
      >
        <SettingsToggleRow
          label="Venue disable/suspend"
          description="Admins can temporarily disable or suspend venues"
          checked={value.venueControls.venueDisableSuspend}
          onChange={(checked) =>
            onChange({
              ...value,
              venueControls: { venueDisableSuspend: checked },
            })
          }
        />
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Booking Rules"
        description="Configure venue booking policies and restrictions"
      >
        <SettingsFieldRow
          label="Booking window (days in advance)"
          description="How far in advance users can book venues"
        >
          <select
            className={settingsControlClass}
            value={value.bookingRules.bookingWindowDays}
            onChange={(e) => patchBooking({ bookingWindowDays: Number(e.target.value) })}
          >
            {[30, 60, 90, 120, 180].map((days) => (
              <option key={days} value={days}>
                {days} Days
              </option>
            ))}
          </select>
        </SettingsFieldRow>
        <SettingsFieldRow
          label="Minimum booking notice (hours)"
          description="Minimum notice required before event"
        >
          <select
            className={settingsControlClass}
            value={value.bookingRules.minBookingNoticeHours}
            onChange={(e) => patchBooking({ minBookingNoticeHours: Number(e.target.value) })}
          >
            {[6, 12, 24, 48, 72].map((hours) => (
              <option key={hours} value={hours}>
                {hours} Hours
              </option>
            ))}
          </select>
        </SettingsFieldRow>
        <SettingsFieldRow label="Cancellation fee (%)">
          <input
            type="number"
            className={settingsControlClass}
            value={value.bookingRules.cancellationFeePercent}
            onChange={(e) => patchBooking({ cancellationFeePercent: Number(e.target.value) })}
          />
        </SettingsFieldRow>
        <SettingsToggleRow
          label="Conflict detection"
          description="Prevent double-booking and scheduling conflicts"
          checked={value.bookingRules.conflictDetection}
          onChange={(checked) => patchBooking({ conflictDetection: checked })}
        />
        <SettingsToggleRow
          label="Blackout dates"
          description="Venue owners can mark dates as unavailable"
          checked={value.bookingRules.blackoutDates}
          onChange={(checked) => patchBooking({ blackoutDates: checked })}
        />
        <SettingsToggleRow
          label="Maintenance blocks"
          description="Schedule maintenance periods for venues"
          checked={value.bookingRules.maintenanceBlocks}
          onChange={(checked) => patchBooking({ maintenanceBlocks: checked })}
        />
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Pricing Controls"
        description="Configure venue pricing models and commission structure"
      >
        <p className="text-sm font-medium text-slate-300">Pricing Models</p>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={value.pricingControls.hourlyRates}
            onChange={(e) => patchPricing({ hourlyRates: e.target.checked })}
          />
          Hourly Rates
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={value.pricingControls.halfDayRates}
            onChange={(e) => patchPricing({ halfDayRates: e.target.checked })}
          />
          Half-Day Rates
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={value.pricingControls.fullDayRates}
            onChange={(e) => patchPricing({ fullDayRates: e.target.checked })}
          />
          Full-Day Rates
        </label>
        <p className="pt-2 text-sm font-medium text-slate-300">Advanced Pricing</p>
        <SettingsToggleRow
          label="Failed Attempts Alert"
          description="Notify admins of failed login attempts."
          checked={value.pricingControls.failedAttemptsAlert}
          onChange={(checked) => patchPricing({ failedAttemptsAlert: checked })}
        />
        <SettingsToggleRow
          label="Peak pricing"
          description="Higher rates during peak hours."
          checked={value.pricingControls.peakPricing}
          onChange={(checked) => patchPricing({ peakPricing: checked })}
        />
      </SettingsSectionCard>

      <FinancialSettingsFields
        value={value.financial}
        onChange={(financial) => onChange({ ...value, financial })}
      />
    </div>
  )
}
