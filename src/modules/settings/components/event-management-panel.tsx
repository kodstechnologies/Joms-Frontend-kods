import { SettingsFieldRow } from './settings-field-row'
import { settingsControlClass } from './settings-control-classes'
import { SettingsSectionCard } from './settings-section-card'
import { SettingsToggleRow } from './settings-toggle-row'

export function EventManagementPanel() {
  return (
    <div className="space-y-6">
      <SettingsSectionCard
        title="Event Management"
        description="Configure event creation, ticketing, and payout rules"
      >
        <SettingsToggleRow
          label="Allow New Event Creation"
          description="Experts and organizers can publish new events"
          checked
          onChange={() => undefined}
        />
        <SettingsToggleRow
          label="Require Event Approval"
          description="Events must be reviewed before going live"
          checked
          onChange={() => undefined}
        />
        <SettingsFieldRow label="Default Ticket Commission">
          <input className={settingsControlClass} defaultValue="15%" disabled />
        </SettingsFieldRow>
        <SettingsFieldRow label="Refund Window (days)">
          <input className={settingsControlClass} defaultValue="7" disabled />
        </SettingsFieldRow>
      </SettingsSectionCard>
      <p className="text-xs text-slate-500">
        Event management settings are static for now and will be saved via backend APIs later.
      </p>
    </div>
  )
}
