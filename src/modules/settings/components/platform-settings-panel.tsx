import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CloudUpload } from 'lucide-react'
import { toast } from 'sonner'

import { ChooseErrorTemplateModal } from './choose-error-template-modal'
import { SettingsFieldRow, settingsControlClass } from './settings-field-row'
import { SettingsSectionCard } from './settings-section-card'
import { SettingsToggleRow } from './settings-toggle-row'
import {
  currencyOptions,
  dateFormatOptions,
  exportFormatOptions,
  languageOptions,
  refreshIntervalOptions,
  timezoneOptions,
} from '../mock/platform-options.mock'
import type { PlatformSettings } from '../types/settings'
import { Button } from '@/shared/components/ui/button'

type PlatformSettingsPanelProps = {
  value: PlatformSettings
  onChange: (value: PlatformSettings) => void
}

export function PlatformSettingsPanel({ value, onChange }: PlatformSettingsPanelProps) {
  const navigate = useNavigate()
  const [errorTemplateOpen, setErrorTemplateOpen] = useState(false)

  const updateApplication = (patch: Partial<PlatformSettings['applicationSettings']>) => {
    onChange({
      ...value,
      applicationSettings: { ...value.applicationSettings, ...patch },
    })
  }

  const updateDisplay = (patch: Partial<PlatformSettings['displayPreferences']>) => {
    onChange({
      ...value,
      displayPreferences: { ...value.displayPreferences, ...patch },
    })
  }

  const updateGeneral = (patch: Partial<PlatformSettings['generalSettings']>) => {
    onChange({
      ...value,
      generalSettings: { ...value.generalSettings, ...patch },
    })
  }

  return (
    <div className="space-y-6">
      <SettingsSectionCard
        title="Application Settings"
        description="Configure basic application information"
      >
        <SettingsFieldRow label="Application Name">
          <input
            className={settingsControlClass}
            value={value.applicationSettings.applicationName}
            onChange={(event) => updateApplication({ applicationName: event.target.value })}
          />
        </SettingsFieldRow>
        <div className="grid gap-4 pt-2 sm:grid-cols-2">
          {['Logo', 'Favicon'].map((label) => (
            <div key={label} className="space-y-2">
              <p className="text-xs font-medium text-slate-300">{label}</p>
              <button
                type="button"
                onClick={() => toast.message(`${label} upload coming soon`)}
                className="flex h-[72px] w-[72px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-white/20 bg-[#0E0E0E] text-slate-300 transition-colors hover:border-white/35 hover:text-white"
              >
                <CloudUpload className="size-4" />
                <span className="text-[10px]">Upload</span>
              </button>
            </div>
          ))}
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Display Preferences"
        description="Customize display and localization settings"
      >
        <SettingsFieldRow label="Timezone">
          <select
            className={settingsControlClass}
            value={value.displayPreferences.timezone}
            onChange={(event) => updateDisplay({ timezone: event.target.value })}
          >
            {timezoneOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </SettingsFieldRow>
        <SettingsFieldRow label="Date & Time Format">
          <select
            className={settingsControlClass}
            value={value.displayPreferences.dateTimeFormat}
            onChange={(event) => updateDisplay({ dateTimeFormat: event.target.value })}
          >
            {dateFormatOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </SettingsFieldRow>
        <SettingsFieldRow label="Default Currency">
          <select
            className={settingsControlClass}
            value={value.displayPreferences.defaultCurrency}
            onChange={(event) => updateDisplay({ defaultCurrency: event.target.value })}
          >
            {currencyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </SettingsFieldRow>
        <SettingsFieldRow label="Language Settings">
          <select
            className={settingsControlClass}
            value={value.displayPreferences.language}
            onChange={(event) => updateDisplay({ language: event.target.value })}
          >
            {languageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </SettingsFieldRow>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="General Settings"
        description="Configure system behavior and maintenance options"
      >
        <SettingsFieldRow label="Auto-Refresh Interval">
          <select
            className={settingsControlClass}
            value={value.generalSettings.autoRefreshInterval}
            onChange={(event) => updateGeneral({ autoRefreshInterval: event.target.value })}
          >
            {refreshIntervalOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </SettingsFieldRow>
        <SettingsFieldRow label="Default Export Format">
          <select
            className={settingsControlClass}
            value={value.generalSettings.defaultExportFormat}
            onChange={(event) => updateGeneral({ defaultExportFormat: event.target.value })}
          >
            {exportFormatOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </SettingsFieldRow>
        <SettingsToggleRow
          label="Maintenance Mode"
          description="Enable or disable system maintenance mode"
          checked={value.generalSettings.maintenanceMode}
          onChange={(checked) => updateGeneral({ maintenanceMode: checked })}
          className="rounded-lg border border-white/10 bg-[#0D0D0D] px-3"
        />
        <SettingsFieldRow label="Custom Error Messages">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-start">
            <textarea
              className="min-h-[88px] w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-white/20"
              value={value.generalSettings.customErrorMessage}
              onChange={(event) => updateGeneral({ customErrorMessage: event.target.value })}
            />
            <Button
              variant="secondary"
              className="h-10 shrink-0"
              onClick={() => setErrorTemplateOpen(true)}
            >
              Choose Template
            </Button>
          </div>
        </SettingsFieldRow>
        <SettingsFieldRow label="Support Email">
          <input
            className={settingsControlClass}
            value={value.generalSettings.supportEmail}
            onChange={(event) => updateGeneral({ supportEmail: event.target.value })}
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="Support Phone Number">
          <input
            className={settingsControlClass}
            value={value.generalSettings.supportPhone}
            onChange={(event) => updateGeneral({ supportPhone: event.target.value })}
          />
        </SettingsFieldRow>
        <div className="space-y-3 border-t border-white/5 pt-4">
          <p className="text-sm font-medium text-white">Policy Management</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { label: 'Policy Management', to: '/settings/policies' },
              { label: 'Terms & Condition Management', to: '/settings/policies/terms' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-[#141414] px-4 py-3"
              >
                <span className="text-sm text-slate-300">{item.label}</span>
                <Button variant="secondary" onClick={() => navigate(item.to)}>
                  View
                </Button>
              </div>
            ))}
          </div>
        </div>
      </SettingsSectionCard>

      <ChooseErrorTemplateModal
        open={errorTemplateOpen}
        currentMessage={value.generalSettings.customErrorMessage}
        onClose={() => setErrorTemplateOpen(false)}
        onApply={(message) => {
          updateGeneral({ customErrorMessage: message })
          setErrorTemplateOpen(false)
        }}
      />
    </div>
  )
}
