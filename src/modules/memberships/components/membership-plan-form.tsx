import { Box, ChevronsUpDown, Plus, X } from 'lucide-react'
import { useMemo, useRef, useState, type FormEvent } from 'react'

import { RequiredMark } from '@/shared/components/form/required-mark'
import { guardUploadFile } from '@/shared/lib/upload-file'
import { DEFAULT_BILLING_CYCLES } from '../config/membership-options'
import type {
  MembershipPlan,
  MembershipPlanConfig,
  MembershipPlanConfigItem,
  MembershipPricing,
} from '../types/membership'

const SEP = 'rgba(255, 255, 255, 0.1)'

const MEMBERSHIP_FIELD_CLASS =
  'ui-input h-[42px] w-full placeholder:text-white/50 focus-visible:outline-none focus-visible:outline-offset-0 focus:border-[#155dfc] focus-visible:border-[#155dfc]'

const BILLING_CYCLE_CHIP_CLASS =
  'inline-flex h-[30px] items-center gap-1 rounded-[6px] px-2 text-[12px] leading-[18px] font-medium'

const MEMBERSHIP_DISCOUNT_FIELD_CLASS = `${MEMBERSHIP_FIELD_CLASS} pr-9`

const BASE_CYCLES = ['Weekly', '3 Months', '6 Months', 'Annual'] as const

export type MembershipPlanFormValues = {
  type: 'expert'
  planName: string
  pricing: MembershipPricing[]
  features: { planConfig: MembershipPlanConfig }
  planConfig: MembershipPlanConfig
  trialPeriodDays: number
  enableAutoRenew: boolean
  allowPlanUpgrades: boolean
  allowDowngradePlans: boolean
  iconFile: File | null
}

type MembershipPlanFormProps = {
  initialPlan?: MembershipPlan | null
  readOnly?: boolean
  onSubmit: (values: MembershipPlanFormValues) => void
}

const slugify = (label: string) =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || `item-${Date.now()}`

const PROFILE_CUSTOMIZATION_BENEFIT_ID = 'profile-customization'

const withoutProfileCustomization = (benefits: MembershipPlanConfigItem[]) =>
  benefits.filter((item) => item.id !== PROFILE_CUSTOMIZATION_BENEFIT_ID)

const defaultPlanConfig = (): MembershipPlanConfig => ({
  commissionRatePercent: 0,
  benefits: [
    { id: 'dedicated-account-manager', label: 'Dedicated Account Manager', enabled: true },
  ],
  partnerApp: [],
  eligibility: [],
  otherSettings: [],
})

const resolveInitialPlanConfig = (plan?: MembershipPlan | null): MembershipPlanConfig => {
  if (plan?.planConfig) {
    const benefits = plan.planConfig.benefits?.length
      ? withoutProfileCustomization(plan.planConfig.benefits)
      : defaultPlanConfig().benefits
    return {
      commissionRatePercent: Number(plan.planConfig.commissionRatePercent ?? 0),
      benefits,
      partnerApp: plan.planConfig.partnerApp ?? [],
      eligibility: plan.planConfig.eligibility ?? [],
      otherSettings: plan.planConfig.otherSettings ?? [],
    }
  }

  const features = plan?.features
  if (!features) return defaultPlanConfig()

  if (features.planConfig)
    return resolveInitialPlanConfig({ ...plan, planConfig: features.planConfig })

  const benefits: MembershipPlanConfigItem[] = [
    {
      id: 'dedicated-account-manager',
      label: 'Dedicated Account Manager',
      enabled: Boolean(features.dedicatedAccountManager),
    },
    ...(features.customFeatures ?? []).map((label) => ({
      id: slugify(label),
      label,
      enabled: true,
    })),
  ]

  return {
    commissionRatePercent: 0,
    benefits: withoutProfileCustomization(benefits),
    partnerApp: [],
    eligibility: [],
    otherSettings: [],
  }
}

const buildPricingState = (pricing: MembershipPricing[] = []) => {
  const cyclePool = Array.from(
    new Set([...BASE_CYCLES, ...pricing.map((item) => item.billingCycleName)]),
  )

  const selectedCycles = pricing.length
    ? pricing.map((item) => item.billingCycleName)
    : [...DEFAULT_BILLING_CYCLES]

  const pricingMap: Record<string, MembershipPricing> = {}
  for (const cycle of cyclePool) {
    const existing = pricing.find((item) => item.billingCycleName === cycle)
    pricingMap[cycle] = existing ?? { billingCycleName: cycle, price: 2999, discount: 0 }
  }

  return { selectedCycles, pricingMap, cyclePool }
}

export function MembershipPlanForm({
  initialPlan,
  readOnly = false,
  onSubmit,
}: MembershipPlanFormProps) {
  const initialPricing = buildPricingState(initialPlan?.pricing)
  const iconInputRef = useRef<HTMLInputElement>(null)

  const [planName, setPlanName] = useState(initialPlan?.planName ?? 'Basic Plan')
  const [availableCycles, setAvailableCycles] = useState<string[]>(initialPricing.cyclePool)
  const [selectedCycles, setSelectedCycles] = useState<string[]>(initialPricing.selectedCycles)
  const [pricing, setPricing] = useState<Record<string, MembershipPricing>>(
    initialPricing.pricingMap,
  )
  const [planConfig, setPlanConfig] = useState<MembershipPlanConfig>(() =>
    resolveInitialPlanConfig(initialPlan),
  )
  const [addingFeature, setAddingFeature] = useState(false)
  const [featureLabelDraft, setFeatureLabelDraft] = useState('')
  const [addingCycle, setAddingCycle] = useState(false)
  const [cycleDraft, setCycleDraft] = useState('')
  const [trialPeriodDays, setTrialPeriodDays] = useState(initialPlan?.trialPeriodDays ?? 0)
  const [trialFocused, setTrialFocused] = useState(false)
  const [enableAutoRenew, setEnableAutoRenew] = useState(initialPlan?.enableAutoRenew ?? true)
  const [allowPlanUpgrades, setAllowPlanUpgrades] = useState(initialPlan?.allowPlanUpgrades ?? true)
  const [allowDowngradePlans, setAllowDowngradePlans] = useState(
    initialPlan?.allowDowngradePlans ?? true,
  )
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(initialPlan?.icon ?? null)

  const pricingList = useMemo(
    () => selectedCycles.map((cycle) => pricing[cycle]).filter(Boolean),
    [pricing, selectedCycles],
  )

  const toggleCycle = (cycle: string) => {
    setSelectedCycles((current) => {
      if (current.includes(cycle)) {
        return current.filter((item) => item !== cycle)
      }
      setPricing((prev) => ({
        ...prev,
        [cycle]: prev[cycle] ?? { billingCycleName: cycle, price: 2999, discount: 0 },
      }))
      return [...current, cycle]
    })
  }

  const addCustomCycle = () => {
    const name = cycleDraft.trim()
    if (!name) return
    if (!availableCycles.includes(name)) {
      setAvailableCycles((prev) => [...prev, name])
    }
    setPricing((prev) => ({
      ...prev,
      [name]: prev[name] ?? { billingCycleName: name, price: 2999, discount: 0 },
    }))
    setSelectedCycles((prev) => (prev.includes(name) ? prev : [...prev, name]))
    setCycleDraft('')
    setAddingCycle(false)
  }

  const addBenefitFeature = () => {
    const label = featureLabelDraft.trim()
    if (!label) return
    const id = slugify(label)
    setPlanConfig((prev) => {
      if (
        prev.benefits.some(
          (item) => item.id === id || item.label.toLowerCase() === label.toLowerCase(),
        )
      ) {
        return prev
      }
      return {
        ...prev,
        benefits: [...prev.benefits, { id, label, enabled: true }],
      }
    })
    setFeatureLabelDraft('')
    setAddingFeature(false)
  }

  const removeBenefitFeature = (id: string) => {
    setPlanConfig((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((item) => item.id !== id),
    }))
  }

  const toggleBenefitFeature = (id: string, enabled: boolean) => {
    setPlanConfig((prev) => ({
      ...prev,
      benefits: prev.benefits.map((item) => (item.id === id ? { ...item, enabled } : item)),
    }))
  }

  const handleIconChange = (file: File | null) => {
    if (file && !guardUploadFile(file)) return
    setIconFile(file)
    if (file) setIconPreview(URL.createObjectURL(file))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (readOnly) return
    const sanitizedPlanConfig: MembershipPlanConfig = {
      ...planConfig,
      benefits: withoutProfileCustomization(planConfig.benefits),
    }
    onSubmit({
      type: 'expert',
      planName: planName.trim(),
      pricing: pricingList,
      planConfig: sanitizedPlanConfig,
      features: { planConfig: sanitizedPlanConfig },
      trialPeriodDays,
      enableAutoRenew,
      allowPlanUpgrades,
      allowDowngradePlans,
      iconFile,
    })
  }

  return (
    <form
      id="membership-plan-form"
      onSubmit={handleSubmit}
      className="space-y-6"
      aria-readonly={readOnly || undefined}
    >
      <fieldset disabled={readOnly} className="min-w-0 space-y-6 border-0 p-0">
        <section className="space-y-4">
          <h3 className="text-[16px] leading-6 font-semibold text-white">Basic Information</h3>

          <div className="flex items-end gap-4">
            <label className="min-w-0 flex-1 space-y-2">
              <span className="block text-[12px] leading-[18px] text-white/50">
                Plan Name <RequiredMark />
              </span>
              <input
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Basic Plan"
                required
                className={MEMBERSHIP_FIELD_CLASS}
              />
            </label>

            <div className="shrink-0 space-y-2">
              <span className="block text-[12px] leading-[18px] text-white/50">
                Icon <RequiredMark />
              </span>
              <button
                type="button"
                onClick={() => iconInputRef.current?.click()}
                className="flex size-12 items-center justify-center overflow-hidden rounded-full border border-dashed border-white/30 bg-[#050505]"
              >
                {iconPreview ? (
                  <img src={iconPreview} alt="" className="size-full object-cover" />
                ) : (
                  <Box className="size-6 text-white/35" strokeWidth={1.5} />
                )}
              </button>
              <input
                ref={iconInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleIconChange(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
        </section>

        <div className="h-px w-full" style={{ backgroundColor: SEP }} aria-hidden />

        <section className="space-y-4">
          <label className="block space-y-2">
            <span className="block text-[12px] leading-[18px] text-white/50">
              Billing Cycle format <RequiredMark />
            </span>
            <div className="flex flex-wrap gap-2">
              {availableCycles.map((cycle) => {
                const active = selectedCycles.includes(cycle)
                return (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => toggleCycle(cycle)}
                    className={
                      active
                        ? `${BILLING_CYCLE_CHIP_CLASS} bg-white text-black`
                        : `${BILLING_CYCLE_CHIP_CLASS} border border-white/30 bg-transparent font-normal text-white`
                    }
                  >
                    {active ? (
                      <X className="size-3 shrink-0" strokeWidth={2} />
                    ) : (
                      <Plus className="size-3 shrink-0" strokeWidth={2} />
                    )}
                    {cycle}
                  </button>
                )
              })}
              {addingCycle ? (
                <div className="flex items-center gap-2">
                  <input
                    value={cycleDraft}
                    onChange={(e) => setCycleDraft(e.target.value)}
                    placeholder="Cycle name"
                    className={`${MEMBERSHIP_FIELD_CLASS} h-9 w-32 px-2 text-[13px]`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCustomCycle()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addCustomCycle}
                    className="ui-cta ui-cta-primary h-9"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingCycle(true)}
                  className={`${BILLING_CYCLE_CHIP_CLASS} border border-dashed border-white/30 font-normal text-white`}
                >
                  <Plus className="size-3 shrink-0" strokeWidth={2} />
                  Add New
                </button>
              )}
            </div>
          </label>

          <h3 className="text-[16px] leading-6 font-semibold text-white">Pricing Information</h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {selectedCycles.map((cycle) => (
              <label key={`${cycle}-price`} className="block space-y-1.5">
                <span className="block text-[12px] text-white/50">
                  {cycle} Price <RequiredMark />
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={pricing[cycle]?.price ?? 0}
                  onChange={(e) =>
                    setPricing((prev) => ({
                      ...prev,
                      [cycle]: {
                        ...(prev[cycle] ?? { billingCycleName: cycle, discount: 0 }),
                        price: Number(e.target.value),
                      },
                    }))
                  }
                  className={MEMBERSHIP_FIELD_CLASS}
                />
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {selectedCycles.map((cycle) => (
              <label key={`${cycle}-discount`} className="block space-y-1.5">
                <span className="block text-[12px] text-white/50">Discount %</span>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={pricing[cycle]?.discount ?? 0}
                    onChange={(e) =>
                      setPricing((prev) => ({
                        ...prev,
                        [cycle]: {
                          ...(prev[cycle] ?? { billingCycleName: cycle, price: 0 }),
                          discount: Number(e.target.value),
                        },
                      }))
                    }
                    className={MEMBERSHIP_DISCOUNT_FIELD_CLASS}
                  />
                  <ChevronsUpDown
                    className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-white/50"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </div>
              </label>
            ))}
          </div>
        </section>

        <div className="h-px w-full" style={{ backgroundColor: SEP }} aria-hidden />

        <section className="space-y-1">
          <h3 className="text-[16px] leading-6 font-semibold text-white">Plan Features</h3>
          <p className="mb-2 text-[12px] leading-[18px] text-white/50">Feature list:</p>

          <div className="w-full max-w-[597px]">
            {planConfig.benefits.map((item) => (
              <div
                key={item.id}
                className="flex h-6 items-center justify-between gap-3"
                style={{ marginBottom: 16 }}
              >
                <span className="min-w-0 flex-1 truncate text-[14px] leading-[22px] text-white">
                  {item.label}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  <Toggle
                    checked={item.enabled !== false}
                    onChange={(checked) => toggleBenefitFeature(item.id, checked)}
                  />
                  {item.id !== 'dedicated-account-manager' ? (
                    <button
                      type="button"
                      onClick={() => removeBenefitFeature(item.id)}
                      className="text-white/40 hover:text-[#d3191c]"
                      aria-label={`Remove ${item.label}`}
                    >
                      <X className="size-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {addingFeature ? (
            <div className="flex max-w-[648px] items-center gap-2 pt-2">
              <input
                value={featureLabelDraft}
                onChange={(e) => setFeatureLabelDraft(e.target.value)}
                placeholder="Feature name"
                autoFocus
                className={MEMBERSHIP_FIELD_CLASS}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addBenefitFeature()
                  }
                }}
              />
              <button
                type="button"
                onClick={addBenefitFeature}
                className="ui-cta ui-cta-primary shrink-0"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddingFeature(false)
                  setFeatureLabelDraft('')
                }}
                className="ui-cta ui-cta-outline shrink-0"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingFeature(true)}
              className="mt-3 box-border flex h-[42px] w-full max-w-[648px] items-center justify-center rounded-[10px] border border-white/20 bg-[#050505] text-[14px] leading-[22px] font-medium text-white transition-colors hover:bg-white/5"
            >
              Add more Features
            </button>
          )}
        </section>

        <div>
          <section className="space-y-3">
            <h3 className="text-[16px] leading-6 font-semibold text-white">
              Trial Period Management
            </h3>
            <label className="block space-y-2">
              <span className="block text-[12px] leading-[18px] text-white/50">
                Trial Period (days)
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={
                  trialFocused ? String(trialPeriodDays) : String(trialPeriodDays).padStart(2, '0')
                }
                onFocus={() => setTrialFocused(true)}
                onBlur={() => setTrialFocused(false)}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '')
                  setTrialPeriodDays(digits === '' ? 0 : Number(digits))
                }}
                className={`${MEMBERSHIP_FIELD_CLASS} w-[150px]`}
              />
            </label>
          </section>

          <section className="w-[224px] space-y-3" style={{ marginTop: 42 }}>
            <h3 className="text-[16px] leading-6 font-semibold text-white">Additional Settings</h3>
            <div className="space-y-2.5">
              <CheckboxRow
                label="Enable Auto-Renew by default"
                checked={enableAutoRenew}
                onChange={setEnableAutoRenew}
              />
              <CheckboxRow
                label="Allow plan upgrades"
                checked={allowPlanUpgrades}
                onChange={setAllowPlanUpgrades}
              />
              <CheckboxRow
                label="Allow downgrade plans"
                checked={allowDowngradePlans}
                onChange={setAllowDowngradePlans}
              />
            </div>
          </section>
        </div>
      </fieldset>
    </form>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative h-[22px] w-[40px] shrink-0 rounded-full transition-colors"
      style={{
        backgroundColor: checked ? '#ffffff' : 'transparent',
        border: checked ? '1.5px solid #ffffff' : '1.5px solid rgba(255, 255, 255, 0.45)',
        boxSizing: 'border-box',
      }}
    >
      <span
        className="absolute top-1/2 block size-[14px] -translate-y-1/2 rounded-full transition-[left]"
        style={{
          left: checked ? '22px' : '3px',
          backgroundColor: checked ? '#141414' : '#ffffff',
        }}
      />
    </button>
  )
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-[12px] leading-[18px] text-white">
      <span
        className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[3px] border border-white"
        style={{ backgroundColor: checked ? '#ffffff' : 'transparent' }}
        aria-hidden
      >
        {checked ? (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span>{label}</span>
    </label>
  )
}
