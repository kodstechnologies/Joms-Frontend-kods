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
  const patch = (partial: Partial<FinancialSettings>) =>
    onChange({
      ...value,
      ...partial,
      region: 'India',
      currency: 'INR',
      taxType: 'GST',
    })

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
          placeholder="Enter percentage"
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
          placeholder="Enter percentage"
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
          placeholder="Enter percentage"
          value={displayNumber(value.convenienceFeePercent)}
          onChange={(e) => patch({ convenienceFeePercent: parseOptionalNumber(e.target.value) })}
        />
      </SettingsFieldRow>

      <div className="settings-financial-grid" data-settings-group>
        <SettingsSelectField
          label="Region"
          id="financial-region"
          value="India"
          onChange={() => patch({ region: 'India' })}
        >
          <option value="India">India</option>
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
          value="INR"
          onChange={() => patch({ currency: 'INR' })}
        >
          <option value="INR">INR</option>
        </SettingsSelectField>
        <SettingsSelectField
          label="Tax type"
          id="financial-tax-type"
          value="GST"
          onChange={() => patch({ taxType: 'GST' })}
        >
          <option value="GST">GST</option>
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
