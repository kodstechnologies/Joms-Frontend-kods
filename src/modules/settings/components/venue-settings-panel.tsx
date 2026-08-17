import type { VenueCancellationFeeType, VenueSettings } from '../types/settings'
import { FinancialSettingsFields } from './financial-settings-fields'
import { SettingsCheckboxGroup } from './settings-checkbox-group'
import { SettingsFieldRow } from './settings-field-row'
import { settingsControlClass } from './settings-control-classes'
import { SettingsSectionCard } from './settings-section-card'
import { SettingsToggleRow } from './settings-toggle-row'

type VenueSettingsPanelProps = {
  value: VenueSettings
  onChange: (next: VenueSettings) => void
}

const BOOKING_WINDOW_OPTIONS = [
  { value: 0, label: 'Same Day' },
  { value: 1, label: '1 Day' },
  { value: 3, label: '3 Days' },
  { value: 7, label: '7 Days' },
  { value: 14, label: '14 Days' },
  { value: 30, label: '30 Days' },
  { value: 60, label: '60 Days' },
  { value: 90, label: '90 Days' },
]

const MIN_NOTICE_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 1, label: '1 Hour' },
  { value: 2, label: '2 Hours' },
  { value: 4, label: '4 Hours' },
  { value: 6, label: '6 Hours' },
  { value: 12, label: '12 Hours' },
  { value: 24, label: '24 Hours' },
  { value: 48, label: '48 Hours' },
]

const CANCELLATION_FEE_OPTIONS: { value: VenueCancellationFeeType; label: string }[] = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'no_fee', label: 'No Fee' },
  { value: 'custom', label: 'Custom' },
]

export function VenueSettingsPanel({ value, onChange }: VenueSettingsPanelProps) {
  const patchControls = (partial: Partial<VenueSettings['venueControls']>) =>
    onChange({ ...value, venueControls: { ...value.venueControls, ...partial } })

  const patchBooking = (partial: Partial<VenueSettings['bookingRules']>) =>
    onChange({ ...value, bookingRules: { ...value.bookingRules, ...partial } })

  const patchPricing = (partial: Partial<VenueSettings['pricingControls']>) =>
    onChange({ ...value, pricingControls: { ...value.pricingControls, ...partial } })

  const setCancellationType = (cancellationFeeType: VenueCancellationFeeType) => {
    patchBooking({
      cancellationFeeType,
      cancellationFeePercent:
        cancellationFeeType === 'no_fee' ? 0 : value.bookingRules.cancellationFeePercent || 10,
      cancellationFeeCustomAmount:
        cancellationFeeType === 'custom' ? value.bookingRules.cancellationFeeCustomAmount || 0 : 0,
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Venue Management Settings</h2>
        <p className="text-sm text-slate-400">
          Configure venue controls, booking rules, and pricing
        </p>
      </div>

      <SettingsSectionCard
        title="Venue Management"
        description="Controls to add, approve, and disable venues"
      >
        <SettingsToggleRow
          label="Add venues"
          description="Allow creating new venue listings from the admin panel"
          checked={value.venueControls.allowAddVenues}
          onChange={(checked) => patchControls({ allowAddVenues: checked })}
        />
        <SettingsToggleRow
          label="Approve venues"
          description="Allow admins to approve pending venue applications"
          checked={value.venueControls.allowApproveVenues}
          onChange={(checked) => patchControls({ allowApproveVenues: checked })}
        />
        <SettingsToggleRow
          label="Disable venues"
          description="Allow admins to temporarily disable or suspend venues"
          checked={value.venueControls.allowDisableVenues}
          onChange={(checked) => patchControls({ allowDisableVenues: checked })}
        />
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Venue Booking Rules"
        description="Booking window, notice period, fees, and availability rules"
      >
        <SettingsFieldRow
          label="Booking window"
          description="How far in advance users can book venues"
        >
          <select
            className={settingsControlClass}
            value={value.bookingRules.bookingWindowDays}
            onChange={(e) => patchBooking({ bookingWindowDays: Number(e.target.value) })}
          >
            {BOOKING_WINDOW_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Minimum booking notice"
          description="Minimum time required before a booking can start"
        >
          <select
            className={settingsControlClass}
            value={value.bookingRules.minBookingNoticeHours}
            onChange={(e) => patchBooking({ minBookingNoticeHours: Number(e.target.value) })}
          >
            {MIN_NOTICE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </SettingsFieldRow>

        <SettingsFieldRow
          label="Cancellation fees"
          description="Fee policy applied when a booking is cancelled"
        >
          <select
            className={settingsControlClass}
            value={value.bookingRules.cancellationFeeType}
            onChange={(e) => setCancellationType(e.target.value as VenueCancellationFeeType)}
          >
            {CANCELLATION_FEE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </SettingsFieldRow>

        {value.bookingRules.cancellationFeeType === 'percentage' ? (
          <SettingsFieldRow label="Cancellation fee (%)" description="Percentage charged on cancel">
            <input
              type="number"
              min={0}
              max={100}
              className={settingsControlClass}
              value={value.bookingRules.cancellationFeePercent}
              onChange={(e) => patchBooking({ cancellationFeePercent: Number(e.target.value) })}
            />
          </SettingsFieldRow>
        ) : null}

        {value.bookingRules.cancellationFeeType === 'custom' ? (
          <SettingsFieldRow
            label="Custom cancellation fee (₹)"
            description="Fixed amount charged on cancel"
          >
            <input
              type="number"
              min={0}
              className={settingsControlClass}
              value={value.bookingRules.cancellationFeeCustomAmount}
              onChange={(e) =>
                patchBooking({ cancellationFeeCustomAmount: Number(e.target.value) })
              }
            />
          </SettingsFieldRow>
        ) : null}

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
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Venue Pricing"
        description="Enable pricing models available for venue spaces"
      >
        <SettingsCheckboxGroup
          label="Pricing models"
          options={[
            { key: 'hourlyRates', label: 'Hourly rates' },
            { key: 'fullDayRates', label: 'Full-day rates' },
            { key: 'weekendPricing', label: 'Weekend pricing' },
            { key: 'peakPricing', label: 'Peak pricing' },
          ]}
          values={{
            hourlyRates: value.pricingControls.hourlyRates,
            fullDayRates: value.pricingControls.fullDayRates,
            weekendPricing: value.pricingControls.weekendPricing,
            peakPricing: value.pricingControls.peakPricing,
          }}
          onChange={(key, checked) =>
            patchPricing({ [key]: checked } as Partial<VenueSettings['pricingControls']>)
          }
        />
      </SettingsSectionCard>

      <FinancialSettingsFields
        title="Venue Financial & Transaction Settings"
        value={value.financial}
        onChange={(financial) => onChange({ ...value, financial })}
      />
    </div>
  )
}
