import { Plus, X, BadgeCheck } from 'lucide-react'
import { useMemo, useRef, useState, type FormEvent } from 'react'

import { RequiredMark } from '@/shared/components/form/required-mark'
import { DEFAULT_BILLING_CYCLES } from '../mock/membership-metrics.mock'
import type { MembershipFeatures, MembershipPlan, MembershipPricing } from '../types/membership'

/** Figma: #FFFFFF @ 10% */
const SEP = 'rgba(255, 255, 255, 0.1)'

const BASE_CYCLES = ['Weekly', '3 Months', '6 Months', 'Annual'] as const

export type MembershipPlanFormValues = {
  type: 'expert'
  planName: string
  pricing: MembershipPricing[]
  features: MembershipFeatures
  trialPeriodDays: number
  enableAutoRenew: boolean
  allowPlanUpgrades: boolean
  allowDowngradePlans: boolean
  iconFile: File | null
}

type MembershipPlanFormProps = {
  initialPlan?: MembershipPlan | null
  onSubmit: (values: MembershipPlanFormValues) => void
}

const defaultFeatures = (): MembershipFeatures => ({
  accessToBasicNetworkingFeatures: false,
  joinCommunities: { enabled: true, count: 10 },
  platformHostedEvents: { enabled: true, count: 10 },
  profileCustomization: false,
  dedicatedAccountManager: false,
  customFeatures: [],
})

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

export function MembershipPlanForm({ initialPlan, onSubmit }: MembershipPlanFormProps) {
  const initialPricing = buildPricingState(initialPlan?.pricing)
  const iconInputRef = useRef<HTMLInputElement>(null)

  const [planName, setPlanName] = useState(initialPlan?.planName ?? 'Basic Plan')
  const [availableCycles, setAvailableCycles] = useState<string[]>(initialPricing.cyclePool)
  const [selectedCycles, setSelectedCycles] = useState<string[]>(initialPricing.selectedCycles)
  const [pricing, setPricing] = useState<Record<string, MembershipPricing>>(
    initialPricing.pricingMap,
  )
  const [features, setFeatures] = useState<MembershipFeatures>(
    initialPlan?.features ?? defaultFeatures(),
  )
  const [customFeatureDraft, setCustomFeatureDraft] = useState('')
  const [addingFeature, setAddingFeature] = useState(false)
  const [addingCycle, setAddingCycle] = useState(false)
  const [cycleDraft, setCycleDraft] = useState('')
  const [trialPeriodDays, setTrialPeriodDays] = useState(initialPlan?.trialPeriodDays ?? 0)
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

  const addCustomFeature = () => {
    const value = customFeatureDraft.trim()
    if (!value) return
    setFeatures((prev) => ({
      ...prev,
      customFeatures: [...(prev.customFeatures ?? []), value],
    }))
    setCustomFeatureDraft('')
    setAddingFeature(false)
  }

  const removeCustomFeature = (index: number) => {
    setFeatures((prev) => ({
      ...prev,
      customFeatures: (prev.customFeatures ?? []).filter((_, i) => i !== index),
    }))
  }

  const handleIconChange = (file: File | null) => {
    setIconFile(file)
    if (file) setIconPreview(URL.createObjectURL(file))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit({
      type: 'expert',
      planName: planName.trim(),
      pricing: pricingList,
      features,
      trialPeriodDays,
      enableAutoRenew,
      allowPlanUpgrades,
      allowDowngradePlans,
      iconFile,
    })
  }

  return (
    <form id="membership-plan-form" onSubmit={handleSubmit} className="space-y-6">
      {/* —— Basic Information —— */}
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
              className="box-border h-[42px] w-full rounded-[8px] border border-white/10 bg-black px-3.5 text-[14px] leading-[22px] text-white outline-none placeholder:text-white/50 focus:border-[#155dfc]"
            />
          </label>

          <div className="shrink-0 space-y-2">
            <span className="block text-[12px] leading-[18px] text-white/50">
              Icon <RequiredMark />
            </span>
            <button
              type="button"
              onClick={() => iconInputRef.current?.click()}
              className="flex size-[70px] items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black transition-colors hover:border-white/25"
              aria-label="Upload plan icon"
            >
              {iconPreview ? (
                <img src={iconPreview} alt="" className="size-full object-cover" />
              ) : (
                <BadgeCheck className="size-6 text-white" />
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

        {initialPlan ? (
          <p className="text-[12px] leading-[18px] text-white/50">Plan ID: {initialPlan.planId}</p>
        ) : null}

        <div className="space-y-2">
          <span className="block text-[12px] leading-[18px] text-white/50">
            Billing Cycle format <RequiredMark />
          </span>
          <div className="flex min-h-[42px] flex-nowrap items-center gap-2 overflow-x-auto pb-1">
            {availableCycles.map((cycle) => {
              const selected = selectedCycles.includes(cycle)
              return (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => toggleCycle(cycle)}
                  className="inline-flex h-[42px] shrink-0 items-center gap-1.5 rounded-[8px] border px-3 text-[14px] leading-[22px] font-medium whitespace-nowrap transition-colors"
                  style={
                    selected
                      ? {
                          borderColor: '#ffffff',
                          backgroundColor: '#ffffff',
                          color: '#000000',
                        }
                      : {
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                          backgroundColor: 'transparent',
                          color: '#ffffff',
                        }
                  }
                >
                  {selected ? (
                    <>
                      <X className="size-3.5 shrink-0" strokeWidth={2.25} />
                      {cycle}
                    </>
                  ) : (
                    <>
                      <Plus className="size-3.5 shrink-0" strokeWidth={2.25} />
                      {cycle}
                    </>
                  )}
                </button>
              )
            })}
            {addingCycle ? (
              <div className="flex h-[42px] shrink-0 items-center gap-2">
                <input
                  value={cycleDraft}
                  onChange={(e) => setCycleDraft(e.target.value)}
                  placeholder="Name"
                  className="box-border h-[42px] w-[100px] rounded-[8px] border border-white/10 bg-black px-3 text-[14px] text-white outline-none focus:border-white/30"
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
                  className="text-[14px] font-medium text-[#f6cb86]"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddingCycle(false)
                    setCycleDraft('')
                  }}
                  className="text-white/50"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAddingCycle(true)}
                className="inline-flex h-[42px] shrink-0 items-center gap-1.5 rounded-[8px] border border-dashed border-white/20 px-3 text-[14px] leading-[22px] font-medium whitespace-nowrap text-white/70 hover:border-white/40"
              >
                <Plus className="size-3.5 shrink-0" strokeWidth={2.25} />
                Add New
              </button>
            )}
          </div>
        </div>
      </section>

      {/* —— Pricing Information —— */}
      <section className="space-y-4">
        <h3 className="text-[16px] leading-6 font-semibold text-white">Pricing Information</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-5">
          {selectedCycles.map((cycle) => (
            <div key={cycle} className="space-y-3">
              <label className="block space-y-2">
                <span className="block text-[12px] leading-[18px] text-white/50">
                  {cycle} Price <RequiredMark />
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={pricing[cycle]?.price ?? 0}
                  onChange={(e) =>
                    setPricing((prev) => ({
                      ...prev,
                      [cycle]: {
                        ...prev[cycle],
                        billingCycleName: cycle,
                        price: Number(e.target.value),
                      },
                    }))
                  }
                  required
                  className="membership-number-input box-border h-[42px] w-[150px] rounded-[8px] border border-white/10 bg-black px-3.5 text-[14px] leading-[22px] text-white outline-none focus:border-white/30"
                />
              </label>
              <label className="block space-y-2">
                <span className="block text-[12px] leading-[18px] text-white/50">Discount %</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={pricing[cycle]?.discount ?? 0}
                  onChange={(e) =>
                    setPricing((prev) => ({
                      ...prev,
                      [cycle]: {
                        ...prev[cycle],
                        billingCycleName: cycle,
                        discount: Number(e.target.value),
                      },
                    }))
                  }
                  className="membership-number-input box-border h-[42px] w-[90px] rounded-[8px] border border-white/10 bg-black px-3 text-[14px] leading-[22px] text-white outline-none focus:border-white/30"
                />
              </label>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px w-full" style={{ backgroundColor: SEP }} aria-hidden />

      {/* —— Plan Features —— */}
      <section className="space-y-1">
        <h3 className="text-[16px] leading-6 font-semibold text-white">Plan Features</h3>
        <p className="mb-2 text-[12px] leading-[18px] text-white/50">Feature list:</p>

        <FeatureRow
          label="Access to basic networking features"
          checked={features.accessToBasicNetworkingFeatures}
          onChange={(checked) =>
            setFeatures((prev) => ({ ...prev, accessToBasicNetworkingFeatures: checked }))
          }
        />
        <FeatureRow
          label="Join Communities"
          checked={features.joinCommunities.enabled}
          count={features.joinCommunities.count}
          onChange={(checked) =>
            setFeatures((prev) => ({
              ...prev,
              joinCommunities: { ...prev.joinCommunities, enabled: checked },
            }))
          }
          onCountChange={(count) =>
            setFeatures((prev) => ({
              ...prev,
              joinCommunities: { ...prev.joinCommunities, count },
            }))
          }
        />
        <FeatureRow
          label="Platform Hosted Events"
          checked={features.platformHostedEvents.enabled}
          count={features.platformHostedEvents.count}
          onChange={(checked) =>
            setFeatures((prev) => ({
              ...prev,
              platformHostedEvents: { ...prev.platformHostedEvents, enabled: checked },
            }))
          }
          onCountChange={(count) =>
            setFeatures((prev) => ({
              ...prev,
              platformHostedEvents: { ...prev.platformHostedEvents, count },
            }))
          }
        />
        <FeatureRow
          label="Profile customization"
          checked={features.profileCustomization}
          onChange={(checked) =>
            setFeatures((prev) => ({ ...prev, profileCustomization: checked }))
          }
        />
        <FeatureRow
          label="Dedicated Account Manager"
          checked={features.dedicatedAccountManager}
          onChange={(checked) =>
            setFeatures((prev) => ({ ...prev, dedicatedAccountManager: checked }))
          }
        />

        {(features.customFeatures ?? []).map((feature, index) => (
          <div
            key={`${feature}-${index}`}
            className="flex items-center justify-between gap-3 py-3"
            style={{ borderBottom: `1px solid ${SEP}` }}
          >
            <span className="text-[14px] leading-[22px] text-white">{feature}</span>
            <button
              type="button"
              onClick={() => removeCustomFeature(index)}
              className="text-white/50 hover:text-[#d3191c]"
              aria-label="Remove feature"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}

        {addingFeature ? (
          <div className="flex items-center gap-2 pt-3">
            <input
              value={customFeatureDraft}
              onChange={(e) => setCustomFeatureDraft(e.target.value)}
              placeholder="Feature name"
              className="box-border h-[42px] min-w-0 flex-1 rounded-[8px] border border-white/10 bg-black px-3.5 text-[14px] text-white outline-none focus:border-[#155dfc]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCustomFeature()
                }
              }}
            />
            <button
              type="button"
              onClick={addCustomFeature}
              className="ui-cta ui-cta-primary shrink-0"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setAddingFeature(false)
                setCustomFeatureDraft('')
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
            className="mt-3 flex h-[42px] w-full max-w-[648px] items-center justify-center rounded-[10px] border border-white/20 text-[14px] leading-[22px] font-medium text-white transition-colors hover:bg-white/5"
          >
            Add more features
          </button>
        )}
      </section>

      {/* —— Trial + Additional (Figma: 224 × 243) —— */}
      <section
        className="w-full max-w-[224px] space-y-5 rounded-[10px] border p-4"
        style={{ borderColor: SEP }}
      >
        <div className="space-y-3">
          <h3 className="text-[16px] leading-6 font-semibold text-white">
            Trial Period Management
          </h3>
          <label className="block space-y-2">
            <span className="block text-[12px] leading-[18px] text-white/50">
              Trial Period (days)
            </span>
            <input
              type="number"
              min={0}
              value={trialPeriodDays}
              onChange={(e) => setTrialPeriodDays(Number(e.target.value))}
              className="box-border h-[42px] w-full rounded-[8px] border border-white/10 bg-black px-3 text-[14px] leading-[22px] text-white outline-none focus:border-[#155dfc]"
            />
          </label>
        </div>

        <div className="h-px w-full" style={{ backgroundColor: SEP }} aria-hidden />

        <div className="space-y-3">
          <h3 className="text-[16px] leading-6 font-semibold text-white">Additional Settings</h3>
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
    </form>
  )
}

function FeatureRow({
  label,
  checked,
  onChange,
  count,
  onCountChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  count?: number
  onCountChange?: (count: number) => void
}) {
  const hasCount = typeof count === 'number'

  return (
    <div className="py-3" style={{ borderBottom: `1px solid ${SEP}` }}>
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 flex-1 text-[14px] leading-[22px] text-white">{label}</span>
        <Toggle checked={checked} onChange={onChange} />
      </div>
      {hasCount ? (
        <input
          type="number"
          min={0}
          value={count}
          disabled={!checked}
          onChange={(e) => onCountChange?.(Number(e.target.value))}
          className="membership-number-input mt-3 box-border h-[42px] w-[242px] max-w-full rounded-[8px] border border-white/10 bg-black px-3 text-[14px] leading-[22px] text-white outline-none focus:border-white/30 disabled:opacity-40"
        />
      ) : null}
    </div>
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
        // Figma: ON = white track + dark knob on right; OFF = empty track + white knob on left
        backgroundColor: checked ? '#ffffff' : 'transparent',
        border: checked ? 'none' : '1.5px solid rgba(255, 255, 255, 0.35)',
        boxSizing: 'border-box',
      }}
    >
      <span
        className="absolute top-1/2 block size-[14px] -translate-y-1/2 rounded-full transition-[left,background-color]"
        style={{
          left: checked ? '22px' : '3px',
          backgroundColor: checked ? '#0a0a0a' : '#ffffff',
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
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-white"
      />
      <span>{label}</span>
    </label>
  )
}
