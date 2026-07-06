import type { FinancialSettings } from '../types/settings'
import { SettingsFieldRow, settingsControlClass } from './settings-field-row'
import { SettingsSectionCard } from './settings-section-card'

type FinancialSettingsFieldsProps = {
  value: FinancialSettings
  onChange: (next: FinancialSettings) => void
  title?: string
}

export function FinancialSettingsFields({
  value,
  onChange,
  title = 'Event Financial & Transaction Settings',
}: FinancialSettingsFieldsProps) {
  const patch = (partial: Partial<FinancialSettings>) => onChange({ ...value, ...partial })

  return (
    <SettingsSectionCard title={title} description="Controls money flow, accounting, and payouts.">
      <p className="text-sm font-medium text-slate-300">Pricing & Fees</p>
      <SettingsFieldRow
        label="Platform Commission (%)"
        description="Percentage taken by platform per transaction."
      >
        <input
          type="number"
          className={settingsControlClass}
          value={value.platformCommissionPercent}
          onChange={(e) => patch({ platformCommissionPercent: Number(e.target.value) })}
        />
      </SettingsFieldRow>
      <SettingsFieldRow
        label="Expert Revenue Share (%)"
        description="Percentage experts receive per transaction."
      >
        <input
          type="number"
          className={settingsControlClass}
          value={value.expertRevenueSharePercent}
          onChange={(e) => patch({ expertRevenueSharePercent: Number(e.target.value) })}
        />
      </SettingsFieldRow>
      <SettingsFieldRow
        label="Convenience Fee (%)"
        description="Additional processing fee charged to users."
      >
        <input
          type="number"
          className={settingsControlClass}
          value={value.convenienceFeePercent}
          onChange={(e) => patch({ convenienceFeePercent: Number(e.target.value) })}
        />
      </SettingsFieldRow>
      <div className="grid gap-4 sm:grid-cols-2">
        <SettingsFieldRow label="Region">
          <select
            className={settingsControlClass}
            value={value.region}
            onChange={(e) => patch({ region: e.target.value })}
          >
            <option value="India">India</option>
            <option value="UAE">UAE</option>
            <option value="USA">USA</option>
          </select>
        </SettingsFieldRow>
        <SettingsFieldRow label="Tax rate">
          <input
            type="number"
            placeholder="%"
            className={settingsControlClass}
            value={value.taxRate ?? ''}
            onChange={(e) =>
              patch({ taxRate: e.target.value === '' ? null : Number(e.target.value) })
            }
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="Currency">
          <select
            className={settingsControlClass}
            value={value.currency}
            onChange={(e) => patch({ currency: e.target.value })}
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="AED">AED</option>
          </select>
        </SettingsFieldRow>
        <SettingsFieldRow label="Tax type" description="Choose tax type.">
          <select
            className={settingsControlClass}
            value={value.taxType}
            onChange={(e) => patch({ taxType: e.target.value })}
          >
            <option value="GST">GST</option>
            <option value="VAT">VAT</option>
            <option value="None">None</option>
          </select>
        </SettingsFieldRow>
      </div>
    </SettingsSectionCard>
  )
}
