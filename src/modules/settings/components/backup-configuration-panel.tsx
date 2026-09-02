import { SettingsCheckboxGroup } from './settings-checkbox-group'
import { SettingsFieldRow } from './settings-field-row'
import { settingsControlClass } from './settings-control-classes'
import { SettingsSectionCard } from './settings-section-card'
import { SettingsToggleRow } from './settings-toggle-row'
import {
  backupFrequencyOptions,
  backupRetentionOptions,
  backupStorageOptions,
} from '../defaults/backup.defaults'
import type { BackupSettings } from '../types/settings'
import { cn } from '@/shared/lib/cn'

type BackupConfigurationPanelProps = {
  value: BackupSettings
  onChange: (value: BackupSettings) => void
}

const lockedClass = cn(settingsControlClass, 'cursor-not-allowed opacity-60')

export function BackupConfigurationPanel({ value, onChange }: BackupConfigurationPanelProps) {
  const patch = (patchValue: Partial<BackupSettings>) => onChange({ ...value, ...patchValue })

  const patchAutomatic = (patchValue: Partial<BackupSettings['automaticBackup']>) =>
    patch({ automaticBackup: { ...value.automaticBackup, ...patchValue } })

  const patchModules = (patchValue: Partial<BackupSettings['automaticBackup']['modules']>) =>
    patchAutomatic({ modules: { ...value.automaticBackup.modules, ...patchValue } })

  const storage = value.automaticBackup.storageLocation
  const cloudOnly = storage === 'Cloud Storage'
  const localSchedule = storage === 'Local Storage' || storage === 'Hybrid Storage'

  return (
    <div className="space-y-6">
      <SettingsSectionCard title="Automatic Backup" description="Turn recurring backups on or off">
        <SettingsToggleRow
          label="Automatic Backup"
          description="Runs on the schedule below when enabled"
          checked={value.automaticBackup.enabled}
          onChange={(checked) => patchAutomatic({ enabled: checked })}
        />
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Backup Type"
        description={
          cloudOnly ? 'RDS always snapshots the full cluster' : 'Applies to local JSON exports'
        }
      >
        <fieldset disabled={cloudOnly} className={cn(cloudOnly && 'opacity-60')}>
          <div className="space-y-3">
            {[
              {
                key: 'full' as const,
                label: 'Full Backup',
                description: 'Users, events, promo, venue, finance, settings',
              },
              {
                key: 'partial' as const,
                label: 'Partial Backup',
                description: 'Pick modules below',
              },
            ].map((option) => (
              <label
                key={option.key}
                className={cn(
                  'flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors',
                  cloudOnly ? 'cursor-not-allowed' : 'cursor-pointer',
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
        </fieldset>
      </SettingsSectionCard>

      <SettingsSectionCard title="Scheduling & Retention">
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsFieldRow
            label="Backup Frequency"
            description={localSchedule ? 'Local JSON schedule' : 'Set in AWS RDS'}
          >
            <select
              className={localSchedule ? settingsControlClass : lockedClass}
              value={value.automaticBackup.frequency}
              disabled={!localSchedule}
              onChange={(event) => patchAutomatic({ frequency: event.target.value })}
            >
              {backupFrequencyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </SettingsFieldRow>
          <SettingsFieldRow
            label="Backup Time"
            description={localSchedule ? 'Server local time' : 'Set in AWS RDS'}
          >
            <input
              className={localSchedule ? settingsControlClass : lockedClass}
              value={value.automaticBackup.backupTime}
              placeholder="02:30 PM"
              disabled={!localSchedule}
              onChange={(event) => patchAutomatic({ backupTime: event.target.value })}
            />
          </SettingsFieldRow>
          <SettingsFieldRow
            label="Retention Period"
            description={cloudOnly ? 'Set in AWS RDS' : 'Old local JSON files'}
          >
            <select
              className={cloudOnly ? lockedClass : settingsControlClass}
              value={value.automaticBackup.retentionPeriod}
              disabled={cloudOnly}
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
