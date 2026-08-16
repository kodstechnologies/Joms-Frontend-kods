import { SettingsCheckboxGroup } from './settings-checkbox-group'
import { SettingsFieldRow } from './settings-field-row'
import { settingsControlClass } from './settings-control-classes'
import { SettingsSectionCard } from './settings-section-card'
import { SettingsToggleRow } from './settings-toggle-row'
import {
  backupFrequencyOptions,
  backupRetentionOptions,
  backupStorageOptions,
} from '../mock/backup.mock'
import type { BackupSettings } from '../types/settings'
import { cn } from '@/shared/lib/cn'

type BackupConfigurationPanelProps = {
  value: BackupSettings
  onChange: (value: BackupSettings) => void
}

export function BackupConfigurationPanel({ value, onChange }: BackupConfigurationPanelProps) {
  const patch = (patchValue: Partial<BackupSettings>) => onChange({ ...value, ...patchValue })

  const patchAutomatic = (patchValue: Partial<BackupSettings['automaticBackup']>) =>
    patch({ automaticBackup: { ...value.automaticBackup, ...patchValue } })

  const patchModules = (patchValue: Partial<BackupSettings['automaticBackup']['modules']>) =>
    patchAutomatic({ modules: { ...value.automaticBackup.modules, ...patchValue } })

  return (
    <div className="space-y-6">
      <SettingsSectionCard title="Automatic Backup" description="Enable/Disable Automatic Backup">
        <SettingsToggleRow
          label="Automatic Backup"
          description="Schedule recurring backups for your platform data"
          checked={value.automaticBackup.enabled}
          onChange={(checked) => patchAutomatic({ enabled: checked })}
        />
      </SettingsSectionCard>

      <SettingsSectionCard title="Backup Type" description="Choose full or partial backup scope">
        <div className="space-y-3">
          {[
            {
              key: 'full' as const,
              label: 'Full Backup',
              description:
                'Complete system backup including Users, Events, Reviews, Payments, Logs, Settings',
            },
            {
              key: 'partial' as const,
              label: 'Partial Backup',
              description: 'Select Specific Modules to backup',
            },
          ].map((option) => (
            <label
              key={option.key}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors',
                value.automaticBackup.backupType === option.key
                  ? 'border-[#F0C27B] bg-[#F0C27B]/10'
                  : 'border-white/10 bg-black/20 hover:border-white/20',
              )}
            >
              <input
                type="radio"
                name="backup-type"
                checked={value.automaticBackup.backupType === option.key}
                onChange={() => patchAutomatic({ backupType: option.key })}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium text-white">{option.label}</p>
                <p className="text-xs text-slate-500">{option.description}</p>
              </div>
            </label>
          ))}
        </div>

        {value.automaticBackup.backupType === 'partial' ? (
          <SettingsCheckboxGroup
            label="Modules"
            options={[
              { key: 'users', label: 'Users' },
              { key: 'events', label: 'Events' },
              { key: 'promo', label: 'Promo' },
              { key: 'venue', label: 'Venue' },
              { key: 'financialData', label: 'Financial Data' },
              { key: 'settings', label: 'Settings' },
            ]}
            values={value.automaticBackup.modules}
            onChange={(key, checked) =>
              patchModules({ [key]: checked } as Partial<
                BackupSettings['automaticBackup']['modules']
              >)
            }
            className="mt-4 border-t border-white/10 pt-4"
          />
        ) : null}
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Scheduling & Retention"
        description="Configure backup schedule and storage"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsFieldRow label="Backup Frequency">
            <select
              className={settingsControlClass}
              value={value.automaticBackup.frequency}
              onChange={(event) => patchAutomatic({ frequency: event.target.value })}
            >
              {backupFrequencyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </SettingsFieldRow>
          <SettingsFieldRow label="Backup Time">
            <input
              className={settingsControlClass}
              value={value.automaticBackup.backupTime}
              onChange={(event) => patchAutomatic({ backupTime: event.target.value })}
              placeholder="02:30 PM"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Retention Period">
            <select
              className={settingsControlClass}
              value={value.automaticBackup.retentionPeriod}
              onChange={(event) => patchAutomatic({ retentionPeriod: event.target.value })}
            >
              {backupRetentionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </SettingsFieldRow>
          <SettingsFieldRow label="Storage Location">
            <select
              className={settingsControlClass}
              value={value.automaticBackup.storageLocation}
              onChange={(event) => patchAutomatic({ storageLocation: event.target.value })}
            >
              {backupStorageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </SettingsFieldRow>
        </div>
      </SettingsSectionCard>
    </div>
  )
}
