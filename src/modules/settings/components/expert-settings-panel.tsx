import type { ExpertSettings } from '../types/settings'
import { FinancialSettingsFields } from './financial-settings-fields'
import { LockedAccountsTable } from './locked-accounts-table'
import { SettingsFieldRow } from './settings-field-row'
import { settingsControlClass } from './settings-control-classes'
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
      <div>
        <h2 className="text-lg font-semibold text-white">Expert Application Settings</h2>
        <p className="text-sm text-slate-400">
          Manage expert onboarding, suspension rules, and payouts
        </p>
      </div>

      <SettingsSectionCard
        title="Account Creation"
        description="Allow new users to create accounts"
      >
        <SettingsToggleRow
          label="Allow New Accounts"
          description="Let new experts register and create accounts on the platform"
          checked={value.accountCreation.allowNewAccounts}
          onChange={(checked) => patchAccount({ allowNewAccounts: checked })}
        />
        <SettingsFieldRow
          label="Max Devices Per User"
          description="How many devices can stay logged in on one account. Extra logins drop the oldest session (FIFO)."
        >
          <input
            type="number"
            className={settingsControlClass}
            value={value.accountCreation.maxDevicesPerUser}
            onChange={(e) => patchAccount({ maxDevicesPerUser: Number(e.target.value) })}
          />
        </SettingsFieldRow>
        <SettingsFieldRow
          label="Phone Verification"
          description="Require experts to verify phone via OTP during registration"
        >
          <select
            className={settingsControlClass}
            value={value.accountCreation.phoneVerification}
            onChange={(e) =>
              patchAccount({
                phoneVerification: e.target
                  .value as ExpertSettings['accountCreation']['phoneVerification'],
              })
            }
          >
            <option value="mandatory">Mandatory</option>
            <option value="optional">Optional</option>
          </select>
        </SettingsFieldRow>
        <SettingsFieldRow
          label="Reverification"
          description="How often approved KYC must be re-verified"
        >
          <select
            className={settingsControlClass}
            value={value.accountCreation.reVerificationDays}
            onChange={(e) =>
              patchAccount({
                reVerificationDays: Number(
                  e.target.value,
                ) as ExpertSettings['accountCreation']['reVerificationDays'],
              })
            }
          >
            <option value={90}>3 Months</option>
            <option value={180}>6 Months</option>
            <option value={365}>12 Months</option>
          </select>
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
          description="Exact numbers are always unique. This toggle also blocks phone aliases (same 10 digits with or without +91)."
          checked={value.accountCreation.samePhoneNumber}
          onChange={(checked) => patchAccount({ samePhoneNumber: checked })}
        />
        <SettingsToggleRow
          indented
          label="Same Email ID"
          description="Exact emails are always unique. This toggle also blocks aliases such as Gmail dots and +tags."
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
          description="Suspends the account until an admin unlocks it. The first device at registration is not treated as new."
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
          label="Suspension Duration"
          description="Default length of automatic and admin suspensions"
        >
          <select
            className={settingsControlClass}
            value={value.autoSuspension.suspensionDurationDays}
            onChange={(e) =>
              patchSuspension({
                suspensionDurationDays: Number(
                  e.target.value,
                ) as ExpertSettings['autoSuspension']['suspensionDurationDays'],
              })
            }
          >
            <option value={7}>7 Days</option>
            <option value={30}>30 Days</option>
            <option value={90}>90 Days</option>
            <option value={180}>180 Days</option>
            <option value={0}>Permanent</option>
          </select>
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
        title="Expert Financial & Transaction Settings"
        value={value.financial}
        onChange={(financial) => onChange({ ...value, financial })}
      />
    </div>
  )
}
