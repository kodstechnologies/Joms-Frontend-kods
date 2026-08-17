import type { FinancialSettings } from '../types/settings'
import { SettingsFieldRow, SettingsInputField, SettingsSelectField } from './settings-field-row'
import { settingsControlClass } from './settings-control-classes'
import { SettingsSectionCard } from './settings-section-card'

type FinancialSettingsFieldsProps = {
  value: FinancialSettings
  onChange: (next: FinancialSettings) => void
  title?: string
}

const parseOptionalNumber = (raw: string): number | null => {
  const trimmed = raw.trim()
  if (trimmed === '') return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

const displayNumber = (value: number | null | undefined) =>
  value === null || value === undefined ? '' : String(value)

export function FinancialSettingsFields({
  value,
  onChange,
  title = 'Event Financial & Transaction Settings',
}: FinancialSettingsFieldsProps) {
  const patch = (partial: Partial<FinancialSettings>) => onChange({ ...value, ...partial })

  return (
    <SettingsSectionCard title={title} description="Controls money flow, accounting, and payouts.">
      <p>Pricing & Fees</p>
      <SettingsFieldRow
        label="Platform Commission (%)"
        description="Percentage taken by platform per transaction."
      >
        <input
          type="number"
          inputMode="decimal"
          className={settingsControlClass}
          placeholder="Enter %"
          value={displayNumber(value.platformCommissionPercent)}
          onChange={(e) =>
            patch({ platformCommissionPercent: parseOptionalNumber(e.target.value) })
          }
        />
      </SettingsFieldRow>
      <SettingsFieldRow
        label="Expert Revenue Share (%)"
        description="Percentage experts receive per transaction."
      >
        <input
          type="number"
          inputMode="decimal"
          className={settingsControlClass}
          placeholder="Enter %"
          value={displayNumber(value.expertRevenueSharePercent)}
          onChange={(e) =>
            patch({ expertRevenueSharePercent: parseOptionalNumber(e.target.value) })
          }
        />
      </SettingsFieldRow>
      <SettingsFieldRow
        label="Convenience Fee (%)"
        description="Additional processing fee charged to users."
      >
        <input
          type="number"
          inputMode="decimal"
          className={settingsControlClass}
          placeholder="Enter %"
          value={displayNumber(value.convenienceFeePercent)}
          onChange={(e) => patch({ convenienceFeePercent: parseOptionalNumber(e.target.value) })}
        />
      </SettingsFieldRow>

      <div className="settings-financial-grid" data-settings-group>
        <SettingsSelectField
          label="Region"
          id="financial-region"
          value={value.region}
          onChange={(e) => patch({ region: e.target.value })}
        >
          <option value="India">India</option>
          <option value="UAE">UAE</option>
          <option value="USA">USA</option>
        </SettingsSelectField>
        <SettingsInputField
          label="Tax rate"
          id="financial-tax-rate"
          type="number"
          inputMode="decimal"
          placeholder="%"
          value={displayNumber(value.taxRate)}
          onChange={(e) => patch({ taxRate: parseOptionalNumber(e.target.value) })}
        />
        <SettingsSelectField
          label="Currency"
          id="financial-currency"
          value={value.currency}
          onChange={(e) => patch({ currency: e.target.value })}
        >
          <option value="INR">INR</option>
          <option value="USD">USD</option>
          <option value="AED">AED</option>
        </SettingsSelectField>
        <SettingsSelectField
          label="Tax type"
          id="financial-tax-type"
          value={value.taxType}
          onChange={(e) => patch({ taxType: e.target.value })}
        >
          <option value="GST">GST</option>
          <option value="VAT">VAT</option>
          <option value="None">None</option>
        </SettingsSelectField>
        <SettingsSelectField
          label="Tax handling"
          id="financial-tax-handling"
          value={value.taxHandling || 'exclusive'}
          onChange={(e) =>
            patch({
              taxHandling: e.target.value as FinancialSettings['taxHandling'],
            })
          }
        >
          <option value="inclusive">Inclusive</option>
          <option value="exclusive">Exclusive</option>
          <option value="region_based">Region Based</option>
          <option value="tax_exempt">Tax Exempt</option>
        </SettingsSelectField>
      </div>
    </SettingsSectionCard>
  )
}
