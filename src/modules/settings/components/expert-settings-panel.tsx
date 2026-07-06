import type { ExpertSettings } from '../types/settings'
import { FinancialSettingsFields } from './financial-settings-fields'
import { LockedAccountsTable } from './locked-accounts-table'
import { SettingsFieldRow, settingsControlClass } from './settings-field-row'
import { SettingsSectionCard } from './settings-section-card'
import { SettingsToggleRow } from './settings-toggle-row'

type ExpertSettingsPanelProps = {
  value: ExpertSettings
  onChange: (next: ExpertSettings) => void
}

export function ExpertSettingsPanel({ value, onChange }: ExpertSettingsPanelProps) {
  const patchAccount = (partial: Partial<ExpertSettings['accountCreation']>) =>
    onChange({ ...value, accountCreation: { ...value.accountCreation, ...partial } })

  const patchSuspension = (partial: Partial<ExpertSettings['autoSuspension']>) =>
    onChange({ ...value, autoSuspension: { ...value.autoSuspension, ...partial } })

  return (
    <div className="space-y-5">
      <SettingsSectionCard
        title="Account Creation"
        description="Allow new users to create accounts"
      >
        <SettingsFieldRow
          label="Max Devices Per User"
          description="Maximum number of devices a user can register"
        >
          <input
            type="number"
            className={settingsControlClass}
            value={value.accountCreation.maxDevicesPerUser}
            onChange={(e) => patchAccount({ maxDevicesPerUser: Number(e.target.value) })}
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="Phone Verification">
          <select
            className={settingsControlClass}
            value={value.accountCreation.phoneVerification}
            onChange={(e) =>
              patchAccount({
                phoneVerification: e.target.value as ExpertSettings['accountCreation']['phoneVerification'],
              })
            }
          >
            <option value="mandatory">Mandatory</option>
            <option value="optional">Optional</option>
            <option value="disabled">Disabled</option>
          </select>
        </SettingsFieldRow>
        <SettingsFieldRow
          label="Re-verification Frequency"
          description="Days between KYC re-verification"
        >
          <input
            type="number"
            className={settingsControlClass}
            value={value.accountCreation.reVerificationDays}
            onChange={(e) => patchAccount({ reVerificationDays: Number(e.target.value) })}
          />
        </SettingsFieldRow>
        <SettingsToggleRow
          label="Duplicate Account Detection"
          description="Automatically detect and prevent duplicate accounts"
          checked={value.accountCreation.duplicateAccountDetection}
          onChange={(checked) => patchAccount({ duplicateAccountDetection: checked })}
        />
        <SettingsToggleRow
          indented
          label="Same Phone Number"
          description="Detects if a phone number is already linked to another account."
          checked={value.accountCreation.samePhoneNumber}
          onChange={(checked) => patchAccount({ samePhoneNumber: checked })}
        />
        <SettingsToggleRow
          indented
          label="Same Email ID"
          description="Prevents multiple accounts using the same email address."
          checked={value.accountCreation.sameEmailId}
          onChange={(checked) => patchAccount({ sameEmailId: checked })}
        />
        <SettingsToggleRow
          indented
          label="Same Government ID (DigiLocker)"
          description="Checks Aadhaar / PAN via DigiLocker for duplicate identity."
          checked={value.accountCreation.sameGovernmentId}
          onChange={(checked) => patchAccount({ sameGovernmentId: checked })}
        />
        <SettingsToggleRow
          label="KYC Mandatory"
          description="Require Know Your Customer verification"
          checked={value.accountCreation.kycMandatory}
          onChange={(checked) => patchAccount({ kycMandatory: checked })}
        />
      </SettingsSectionCard>

      <SettingsSectionCard title="Auto Suspension Rules">
        <SettingsToggleRow
          label="Enable Auto Suspension"
          description="Automatically suspend accounts based on rules below"
          checked={value.autoSuspension.enableAutoSuspension}
          onChange={(checked) => patchSuspension({ enableAutoSuspension: checked })}
        />
        <SettingsFieldRow
          label="Suspend after failed MFA attempts"
          description="Number of failed MFA attempts before suspension"
        >
          <input
            type="number"
            className={settingsControlClass}
            value={value.autoSuspension.failedMfaAttempts}
            onChange={(e) => patchSuspension({ failedMfaAttempts: Number(e.target.value) })}
          />
        </SettingsFieldRow>
        <SettingsFieldRow
          label="Suspend after failed logins (24hrs)"
          description="Failed login attempts in 24-hour period"
        >
          <input
            type="number"
            className={settingsControlClass}
            value={value.autoSuspension.failedLogins24h}
            onChange={(e) => patchSuspension({ failedLogins24h: Number(e.target.value) })}
          />
        </SettingsFieldRow>
        <SettingsToggleRow
          label="Suspend on new device login"
          description="Require verification when logging in from new device"
          checked={value.autoSuspension.suspendOnNewDeviceLogin}
          onChange={(checked) => patchSuspension({ suspendOnNewDeviceLogin: checked })}
        />
        <SettingsFieldRow
          label="Suspend on user reports"
          description="Request reverification when report threshold is reached"
        >
          <input
            type="number"
            className={settingsControlClass}
            value={value.autoSuspension.suspendOnUserReports}
            onChange={(e) => patchSuspension({ suspendOnUserReports: Number(e.target.value) })}
          />
        </SettingsFieldRow>
        <SettingsFieldRow
          label="Suspension duration"
          description="Default length of automatic suspensions (days)"
        >
          <input
            type="number"
            className={settingsControlClass}
            value={value.autoSuspension.suspensionDurationDays}
            onChange={(e) => patchSuspension({ suspensionDurationDays: Number(e.target.value) })}
          />
        </SettingsFieldRow>
        <SettingsToggleRow
          label="Notify Super Admin on suspension"
          description="Send email notification to Super Admin"
          checked={value.autoSuspension.notifySuperAdmin}
          onChange={(checked) => patchSuspension({ notifySuperAdmin: checked })}
        />
        <SettingsToggleRow
          label="Notify affected Admin"
          description="Send notification to account's assigned admin."
          checked={value.autoSuspension.notifyAffectedAdmin}
          onChange={(checked) => patchSuspension({ notifyAffectedAdmin: checked })}
        />
      </SettingsSectionCard>

      <LockedAccountsTable />

      <SettingsSectionCard title="Account Deletion Policy">
        <SettingsToggleRow
          label="Allow permanent deletion"
          description="Users can request permanent account deletion."
          checked={value.accountDeletion.allowPermanentDeletion}
          onChange={(checked) =>
            onChange({
              ...value,
              accountDeletion: { allowPermanentDeletion: checked },
            })
          }
        />
      </SettingsSectionCard>

      <FinancialSettingsFields
        value={value.financial}
        onChange={(financial) => onChange({ ...value, financial })}
      />
    </div>
  )
}
