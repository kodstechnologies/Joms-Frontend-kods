import { SettingsFieldRow } from './settings-field-row'
import { settingsControlClass } from './settings-control-classes'
import { SettingsSectionCard } from './settings-section-card'
import { SettingsToggleRow } from './settings-toggle-row'

export function UserApplicationPanel() {
  return (
    <div className="space-y-6">
      <SettingsSectionCard
        title="User Application"
        description="Configure end-user onboarding and account policies"
      >
        <SettingsToggleRow
          label="Allow New User Registration"
          description="Enable public sign-up for new users"
          checked
          onChange={() => undefined}
        />
        <SettingsToggleRow
          label="Email Verification Required"
          description="Users must verify email before accessing the app"
          checked
          onChange={() => undefined}
        />
        <SettingsFieldRow label="Max Devices Per User">
          <input className={settingsControlClass} defaultValue="3" disabled />
        </SettingsFieldRow>
        <SettingsFieldRow label="Profile Completion Threshold">
          <input className={settingsControlClass} defaultValue="70%" disabled />
        </SettingsFieldRow>
      </SettingsSectionCard>
      <p className="text-xs text-slate-500">
        User application settings are static for now and will be saved via backend APIs later.
      </p>
    </div>
  )
}
