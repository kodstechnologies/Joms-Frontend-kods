import { Save, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { DEFAULT_BILLING_CYCLES } from '../mock/membership-metrics.mock'
import { useCreateMembership } from '../hooks/use-memberships'
import type { MembershipFeatures, MembershipPricing, MembershipType } from '../types/membership'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

type CreateMembershipModalProps = {
  open: boolean
  defaultType?: MembershipType
  onClose: () => void
}

const defaultFeatures = (): MembershipFeatures => ({
  accessToBasicNetworkingFeatures: true,
  joinCommunities: { enabled: true, count: 5 },
  platformHostedEvents: { enabled: true, count: 3 },
  profileCustomization: true,
  dedicatedAccountManager: false,
  customFeatures: [],
})

export function CreateMembershipModal({
  open,
  defaultType = 'user',
  onClose,
}: CreateMembershipModalProps) {
  const createMutation = useCreateMembership()
  const [type, setType] = useState<MembershipType>(defaultType)
  const [planName, setPlanName] = useState('')
  const [selectedCycles, setSelectedCycles] = useState<string[]>([...DEFAULT_BILLING_CYCLES])
  const [pricing, setPricing] = useState<Record<string, MembershipPricing>>(() =>
    Object.fromEntries(
      DEFAULT_BILLING_CYCLES.map((cycle) => [
        cycle,
        { billingCycleName: cycle, price: 2499, discount: 0 },
      ]),
    ),
  )
  const [features, setFeatures] = useState<MembershipFeatures>(defaultFeatures)
  const [trialPeriodDays, setTrialPeriodDays] = useState(0)
  const [enableAutoRenew, setEnableAutoRenew] = useState(true)
  const [allowPlanUpgrades, setAllowPlanUpgrades] = useState(true)
  const [allowDowngradePlans, setAllowDowngradePlans] = useState(true)
  const [iconFile, setIconFile] = useState<File | null>(null)

  const pricingList = useMemo(
    () => selectedCycles.map((cycle) => pricing[cycle]).filter(Boolean),
    [pricing, selectedCycles],
  )

  if (!open) return null

  const toggleCycle = (cycle: string) => {
    setSelectedCycles((current) => {
      if (current.includes(cycle)) {
        return current.filter((item) => item !== cycle)
      }

      setPricing((prev) => ({
        ...prev,
        [cycle]: prev[cycle] ?? { billingCycleName: cycle, price: 2499, discount: 0 },
      }))

      return [...current, cycle]
    })
  }

  const handleSubmit = async () => {
    if (!planName.trim()) {
      toast.error('Plan name is required')
      return
    }

    if (!pricingList.length) {
      toast.error('Select at least one billing cycle')
      return
    }

    try {
      await createMutation.mutateAsync({
        type,
        planName: planName.trim(),
        pricing: pricingList,
        features,
        trialPeriodDays,
        enableAutoRenew,
        allowPlanUpgrades,
        allowDowngradePlans,
        updatedBy: 'Admin',
        icon: iconFile,
      })

      toast.success('Membership plan created')
      onClose()
    } catch {
      toast.error('Failed to create membership plan')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111111] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Create Membership</h2>
            <p className="text-xs text-slate-400">Configure membership plan details and features</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-white/10">
            <X className="size-4 text-slate-300" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Basic Information</h3>
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <label className="block space-y-2">
                <span className="text-xs text-slate-400">Plan Name *</span>
                <Input
                  value={planName}
                  onChange={(event) => setPlanName(event.target.value)}
                  placeholder="Basic Plan"
                  className="border-white/10 bg-black text-white"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs text-slate-400">Type *</span>
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value as MembershipType)}
                  className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white"
                >
                  <option value="user">Users</option>
                  <option value="expert">Experts</option>
                </select>
              </label>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-slate-400">Billing Cycle format</span>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_BILLING_CYCLES.map((cycle) => (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => toggleCycle(cycle)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium',
                      selectedCycles.includes(cycle)
                        ? 'border-amber-400/40 bg-amber-400/10 text-amber-200'
                        : 'border-white/10 text-slate-400',
                    )}
                  >
                    {cycle}
                  </button>
                ))}
              </div>
            </div>

            <label className="block space-y-2">
              <span className="text-xs text-slate-400">Plan Icon</span>
              <Input
                type="file"
                accept="image/*"
                onChange={(event) => setIconFile(event.target.files?.[0] ?? null)}
                className="border-white/10 bg-black text-white"
              />
            </label>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Pricing Information</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {selectedCycles.map((cycle) => (
                <div key={cycle} className="rounded-xl border border-white/10 bg-black/40 p-3">
                  <p className="mb-3 text-xs font-medium text-slate-300">{cycle} Price *</p>
                  <Input
                    type="number"
                    min={0}
                    value={pricing[cycle]?.price ?? 0}
                    onChange={(event) =>
                      setPricing((prev) => ({
                        ...prev,
                        [cycle]: {
                          ...prev[cycle],
                          billingCycleName: cycle,
                          price: Number(event.target.value),
                        },
                      }))
                    }
                    className="mb-3 border-white/10 bg-black text-white"
                  />
                  <p className="mb-2 text-xs text-slate-400">Discount %</p>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={pricing[cycle]?.discount ?? 0}
                    onChange={(event) =>
                      setPricing((prev) => ({
                        ...prev,
                        [cycle]: {
                          ...prev[cycle],
                          billingCycleName: cycle,
                          discount: Number(event.target.value),
                        },
                      }))
                    }
                    className="border-white/10 bg-black text-white"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Plan Features</h3>
            <FeatureToggle
              label="Access to basic networking features"
              checked={features.accessToBasicNetworkingFeatures}
              onChange={(checked) =>
                setFeatures((prev) => ({ ...prev, accessToBasicNetworkingFeatures: checked }))
              }
            />
            <FeatureToggle
              label="Join Communities"
              checked={features.joinCommunities.enabled}
              count={features.joinCommunities.count}
              onToggle={(checked) =>
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
            <FeatureToggle
              label="Platform Hosted Events"
              checked={features.platformHostedEvents.enabled}
              count={features.platformHostedEvents.count}
              onToggle={(checked) =>
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
            <FeatureToggle
              label="Profile customization"
              checked={features.profileCustomization}
              onChange={(checked) =>
                setFeatures((prev) => ({ ...prev, profileCustomization: checked }))
              }
            />
            <FeatureToggle
              label="Dedicated Account Manager"
              checked={features.dedicatedAccountManager}
              onChange={(checked) =>
                setFeatures((prev) => ({ ...prev, dedicatedAccountManager: checked }))
              }
            />
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-xs text-slate-400">Trial Period (days)</span>
              <Input
                type="number"
                min={0}
                value={trialPeriodDays}
                onChange={(event) => setTrialPeriodDays(Number(event.target.value))}
                className="border-white/10 bg-black text-white"
              />
            </label>
            <div className="space-y-2 rounded-xl border border-white/10 bg-black/30 p-4">
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

        <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            <Save className="size-4" />
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function FeatureToggle({
  label,
  checked,
  onChange,
  count,
  onToggle,
  onCountChange,
}: {
  label: string
  checked: boolean
  onChange?: (checked: boolean) => void
  count?: number
  onToggle?: (checked: boolean) => void
  onCountChange?: (count: number) => void
}) {
  const isChecked = checked
  const handleChange = onChange ?? onToggle ?? (() => undefined)

  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(event) => handleChange(event.target.checked)}
          className="size-4 accent-amber-400"
        />
        <span className="text-sm text-slate-200">{label}</span>
      </div>
      {typeof count === 'number' ? (
        <Input
          type="number"
          min={0}
          value={count}
          onChange={(event) => onCountChange?.(Number(event.target.value))}
          className="h-8 w-20 border-white/10 bg-black text-white"
        />
      ) : null}
    </div>
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
    <label className="flex items-center gap-2 text-sm text-slate-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-amber-400"
      />
      {label}
    </label>
  )
}
