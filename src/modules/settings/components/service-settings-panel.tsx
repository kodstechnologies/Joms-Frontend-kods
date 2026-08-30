import type { ServiceSettings } from '../types/settings'
import { SettingsFieldRow } from './settings-field-row'
import { settingsControlClass } from './settings-control-classes'
import { SettingsSectionCard } from './settings-section-card'
import { SettingsToggleRow } from './settings-toggle-row'

type ServiceSettingsPanelProps = {
  value: ServiceSettings
  onChange: (next: ServiceSettings) => void
}

export function ServiceSettingsPanel({ value, onChange }: ServiceSettingsPanelProps) {
  const patchListing = (partial: Partial<ServiceSettings['listingDetails']>) =>
    onChange({ ...value, listingDetails: { ...value.listingDetails, ...partial } })

  const patchPricing = (partial: Partial<ServiceSettings['pricingDetails']>) =>
    onChange({ ...value, pricingDetails: { ...value.pricingDetails, ...partial } })

  const patchPayout = (partial: Partial<ServiceSettings['pricingDetails']['payoutFrequency']>) =>
    patchPricing({
      payoutFrequency: { ...value.pricingDetails.payoutFrequency, ...partial },
    })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Service Marketplace Settings</h2>
        <p className="text-sm text-slate-400">
          Configure listings, pricing models, proposals, and promotions
        </p>
      </div>

      <SettingsSectionCard title="Service Listing Details">
        <SettingsToggleRow
          label="Allow new service Listings"
          description="When off, experts cannot create new services from admin or the partner app."
          checked={value.listingDetails.allowNewServiceListings}
          onChange={(checked) => patchListing({ allowNewServiceListings: checked })}
        />
        <SettingsToggleRow
          label="Allow new consultation Listings"
          description="When off, experts cannot create new consultations from admin or the partner app."
          checked={value.listingDetails.allowNewConsultationListings}
          onChange={(checked) => patchListing({ allowNewConsultationListings: checked })}
        />
      </SettingsSectionCard>

      <SettingsSectionCard title="Service Pricing Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsFieldRow label="Minimum Service Listing Pricing">
            <input
              type="number"
              className={settingsControlClass}
              value={value.pricingDetails.minServiceListingPrice}
              onChange={(e) => patchPricing({ minServiceListingPrice: Number(e.target.value) })}
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Maximum Service Listing Pricing">
            <input
              type="number"
              className={settingsControlClass}
              value={value.pricingDetails.maxServiceListingPrice}
              onChange={(e) => patchPricing({ maxServiceListingPrice: Number(e.target.value) })}
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Minimum Consultation Listing Pricing">
            <input
              type="number"
              className={settingsControlClass}
              value={value.pricingDetails.minConsultationListingPrice}
              onChange={(e) =>
                patchPricing({ minConsultationListingPrice: Number(e.target.value) })
              }
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="Maximum Consultation Listing Pricing">
            <input
              type="number"
              className={settingsControlClass}
              value={value.pricingDetails.maxConsultationListingPrice}
              onChange={(e) =>
                patchPricing({ maxConsultationListingPrice: Number(e.target.value) })
              }
            />
          </SettingsFieldRow>
        </div>

        <SettingsFieldRow label="Set Max Listing Discount">
          <select
            className={settingsControlClass}
            value={value.pricingDetails.maxListingDiscountPercent}
            onChange={(e) => patchPricing({ maxListingDiscountPercent: Number(e.target.value) })}
          >
            {[10, 20, 30, 40, 50].map((pct) => (
              <option key={pct} value={pct}>
                {pct}%
              </option>
            ))}
          </select>
        </SettingsFieldRow>

        <SettingsToggleRow
          label="Allow Single price service Listing"
          description="Letting experts list single/fixed priced service on the platform."
          checked={value.pricingDetails.allowSinglePriceListing}
          onChange={(checked) => patchPricing({ allowSinglePriceListing: checked })}
        />
        <SettingsToggleRow
          label="Allow tier price service Listing"
          description="Letting experts list tier based services on the platform."
          checked={value.pricingDetails.allowTierPriceListing}
          onChange={(checked) => patchPricing({ allowTierPriceListing: checked })}
        />
        <SettingsToggleRow
          label="Allow Custom price service Listing"
          description="Letting experts list custom/milestone priced service on the platform."
          checked={value.pricingDetails.allowCustomPriceListing}
          onChange={(checked) => patchPricing({ allowCustomPriceListing: checked })}
        />
        <SettingsToggleRow
          label="Display AI Price recommendation"
          description="Suggest experts market price range for the services they are listing."
          checked={value.pricingDetails.displayAiPriceRecommendation}
          onChange={(checked) => patchPricing({ displayAiPriceRecommendation: checked })}
        />
        <SettingsToggleRow
          label="Allow Use Of Escrow"
          description="Letting users opt escrow model for secure transaction on the platform."
          checked={value.pricingDetails.allowUseOfEscrow}
          onChange={(checked) => patchPricing({ allowUseOfEscrow: checked })}
        />

        <div className="space-y-2 border-b border-white/5 py-3">
          <p className="text-sm font-medium text-white">Set Experts Payout Frequency</p>
          <div className="flex flex-wrap gap-4 text-sm text-slate-200">
            {(
              [
                ['daily', 'Daily'],
                ['weekly', 'Weekly'],
                ['fortnightly', 'Fortnightly'],
                ['monthly', 'Monthly'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={value.pricingDetails.payoutFrequency[key]}
                  onChange={(e) => patchPayout({ [key]: e.target.checked })}
                />
                {label}
              </label>
            ))}
          </div>
          <input
            className={settingsControlClass}
            placeholder="Enter custom payout frequency"
            value={value.pricingDetails.payoutFrequency.custom}
            onChange={(e) => patchPayout({ custom: e.target.value })}
          />
        </div>

        <SettingsFieldRow label="Set Maximum Dispute Period *">
          <input
            type="number"
            className={settingsControlClass}
            value={value.pricingDetails.maxDisputePeriodDays}
            onChange={(e) => patchPricing({ maxDisputePeriodDays: Number(e.target.value) })}
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="Set Maximum Consultation follow-up Period *">
          <input
            type="number"
            className={settingsControlClass}
            value={value.pricingDetails.maxConsultationFollowUpDays}
            onChange={(e) => patchPricing({ maxConsultationFollowUpDays: Number(e.target.value) })}
          />
        </SettingsFieldRow>
      </SettingsSectionCard>

      <SettingsSectionCard title="Proposal Details" description="Manage proposal features here.">
        <SettingsToggleRow
          label="Create One time payment Proposal"
          description="Letting experts create one time payment proposals on the platform."
          checked={value.proposalDetails.createOneTimePaymentProposal}
          onChange={(checked) =>
            onChange({
              ...value,
              proposalDetails: {
                ...value.proposalDetails,
                createOneTimePaymentProposal: checked,
              },
            })
          }
        />
        <SettingsToggleRow
          label="Create milestone based Proposal"
          description="Letting experts create milestone based proposals on the platform."
          checked={value.proposalDetails.createMilestoneBasedProposal}
          onChange={(checked) =>
            onChange({
              ...value,
              proposalDetails: {
                ...value.proposalDetails,
                createMilestoneBasedProposal: checked,
              },
            })
          }
        />
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Promotional Details"
        description="Manage Promotional features here."
      >
        <SettingsFieldRow label="Set Promotional Banners limit">
          <input
            type="number"
            className={settingsControlClass}
            value={value.promotionalDetails.promotionalBannersLimit}
            onChange={(e) =>
              onChange({
                ...value,
                promotionalDetails: {
                  ...value.promotionalDetails,
                  promotionalBannersLimit: Number(e.target.value),
                },
              })
            }
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="Set Secondary banner limit">
          <input
            type="number"
            className={settingsControlClass}
            value={value.promotionalDetails.secondaryBannerLimit}
            onChange={(e) =>
              onChange({
                ...value,
                promotionalDetails: {
                  ...value.promotionalDetails,
                  secondaryBannerLimit: Number(e.target.value),
                },
              })
            }
          />
        </SettingsFieldRow>
      </SettingsSectionCard>
    </div>
  )
}
