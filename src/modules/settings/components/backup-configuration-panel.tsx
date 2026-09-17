import { ChevronDown } from 'lucide-react'

import { SettingsToggle } from './settings-toggle-row'
import {
  backupFrequencyOptions,
  backupRetentionOptions,
  backupStorageOptions,
} from '../config/backup.config'
import type { BackupSettings } from '../types/settings'
import { cn } from '@/shared/lib/cn'

type BackupConfigurationPanelProps = {
  value: BackupSettings
  onChange: (value: BackupSettings) => void
}

const MODULE_OPTIONS = [
  { key: 'users', label: 'Users' },
  { key: 'promo', label: 'Expert' },
  { key: 'events', label: 'Event' },
  { key: 'venue', label: 'Venue' },
  { key: 'financialData', label: 'Financial Data' },
  { key: 'settings', label: 'Settings' },
] as const

export function BackupConfigurationPanel({ value, onChange }: BackupConfigurationPanelProps) {
  const patch = (patchValue: Partial<BackupSettings>) => onChange({ ...value, ...patchValue })

  const patchAutomatic = (patchValue: Partial<BackupSettings['automaticBackup']>) =>
    patch({ automaticBackup: { ...value.automaticBackup, ...patchValue } })

  const patchModules = (patchValue: Partial<BackupSettings['automaticBackup']['modules']>) =>
    patchAutomatic({ modules: { ...value.automaticBackup.modules, ...patchValue } })

  const backup = value.automaticBackup
  const storage = backup.storageLocation
  const cloudOnly = storage === 'Cloud Storage'
  const localSchedule = storage === 'Local Storage' || storage === 'Hybrid Storage'
  const isPartial = !cloudOnly && backup.backupType === 'partial'

  const setStorageLocation = (nextStorage: string) => {
    if (nextStorage === 'Cloud Storage') {
      patchAutomatic({ storageLocation: nextStorage, backupType: 'full' })
      return
    }
    // Leaving Cloud: keep an explicit type. Default to full so "Run Backup"
    // matches the locked Cloud full-cluster expectation users just left.
    const nextType =
      backup.backupType === 'partial' || backup.backupType === 'full'
        ? backup.backupType
        : 'full'
    patchAutomatic({
      storageLocation: nextStorage,
      backupType: cloudOnly ? 'full' : nextType,
    })
  }

  return (
    <div className="backup-config-panel">
      <section className="backup-config-auto-card">
        <div className="backup-config-auto-copy">
          <h2 className="backup-config-auto-title">Automatic Backup</h2>
          <p className="backup-config-auto-desc">Enable Scheduled Automatic Backup</p>
        </div>
        <SettingsToggle
          checked={backup.enabled}
          onChange={(checked) => patchAutomatic({ enabled: checked })}
          ariaLabel="Automatic Backup"
          showCaption={false}
        />
      </section>

      <section className="backup-config-type-section">
        <h3 className="backup-config-section-label">Backup Type</h3>
        {cloudOnly ? (
          <p className="backup-config-hint">
            Cloud (RDS) always snapshots the full cluster — partial module backups are local/hybrid
            only.
          </p>
        ) : null}
        <div className={cn('backup-config-type-list', cloudOnly && 'is-locked')}>
          <button
            type="button"
            className={cn('backup-config-type-card', backup.backupType === 'full' && 'is-selected')}
            onClick={() => {
              if (cloudOnly) return
              patchAutomatic({ backupType: 'full' })
            }}
            aria-pressed={backup.backupType === 'full'}
            disabled={cloudOnly}
          >
            <span className={cn('backup-config-radio', backup.backupType === 'full' && 'is-on')} />
            <span className="backup-config-type-copy">
              <span className="backup-config-type-title">Full Backup</span>
              <span className="backup-config-type-desc">
                Complete system backup including: Users, Events, Reviews, Payments, Logs, Settings
              </span>
            </span>
          </button>

          <div className={cn('backup-config-partial-wrap', isPartial && 'is-selected')}>
            <button
              type="button"
              className={cn('backup-config-type-card', isPartial && 'is-selected')}
              onClick={() => {
                if (cloudOnly) return
                patchAutomatic({ backupType: 'partial' })
              }}
              aria-pressed={isPartial}
              disabled={cloudOnly}
            >
              <span className={cn('backup-config-radio', isPartial && 'is-on')} />
              <span className="backup-config-type-copy">
                <span className="backup-config-type-title">Partial Backup</span>
                <span className="backup-config-type-desc">Select Specific Module to backup</span>
              </span>
            </button>

            {isPartial ? (
              <div className="backup-config-modules">
                {MODULE_OPTIONS.map((option) => {
                  const checked = Boolean(backup.modules[option.key])
                  return (
                    <label key={option.key} className="backup-config-module-item">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          patchModules({
                            [option.key]: event.target.checked,
                          } as Partial<BackupSettings['automaticBackup']['modules']>)
                        }
                        className="backup-config-checkbox"
                      />
                      <span>{option.label}</span>
                    </label>
                  )
                })}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="backup-config-fields">
        <div className="backup-config-field">
          <label className="backup-config-field-label" htmlFor="backup-frequency">
            Backup Frequency
          </label>
          {!localSchedule ? (
            <p className="backup-config-hint">Automated schedule is managed in AWS RDS</p>
          ) : null}
          <div className="backup-config-select-wrap">
            <select
              id="backup-frequency"
              className={cn(
                'backup-config-control backup-config-select',
                !localSchedule && 'is-locked',
              )}
              value={backup.frequency}
              disabled={!localSchedule}
              onChange={(event) => patchAutomatic({ frequency: event.target.value })}
            >
              {backupFrequencyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="backup-config-select-icon" aria-hidden="true" />
          </div>
        </div>

        <div className="backup-config-field">
          <label className="backup-config-field-label" htmlFor="backup-time">
            Backup Time
          </label>
          {!localSchedule ? (
            <p className="backup-config-hint">Backup window is managed in AWS RDS</p>
          ) : null}
          <input
            id="backup-time"
            className={cn('backup-config-control', !localSchedule && 'is-locked')}
            value={backup.backupTime}
            placeholder="02:30 PM"
            disabled={!localSchedule}
            onChange={(event) => patchAutomatic({ backupTime: event.target.value })}
          />
        </div>

        <div className="backup-config-field">
          <label className="backup-config-field-label" htmlFor="backup-retention">
            Retention Period
          </label>
          {cloudOnly ? (
            <p className="backup-config-hint">Retention is managed in AWS RDS</p>
          ) : null}
          <div className="backup-config-select-wrap">
            <select
              id="backup-retention"
              className={cn(
                'backup-config-control backup-config-select',
                cloudOnly && 'is-locked',
              )}
              value={backup.retentionPeriod}
              disabled={cloudOnly}
              onChange={(event) => patchAutomatic({ retentionPeriod: event.target.value })}
            >
              {backupRetentionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="backup-config-select-icon" aria-hidden="true" />
          </div>
        </div>

        <div className="backup-config-field">
          <label className="backup-config-field-label" htmlFor="backup-storage">
            Storage Location
          </label>
          <div className="backup-config-select-wrap">
            <select
              id="backup-storage"
              className="backup-config-control backup-config-select"
              value={backup.storageLocation}
              onChange={(event) => setStorageLocation(event.target.value)}
            >
              {backupStorageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="backup-config-select-icon" aria-hidden="true" />
          </div>
        </div>
      </section>
    </div>
  )
}
