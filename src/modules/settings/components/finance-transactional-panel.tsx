import { useState } from 'react'
import { toast } from 'sonner'

import { ExtendSuspensionModal } from './extend-suspension-modal'
import { SettingsCheckboxGroup } from './settings-checkbox-group'
import { SettingsFieldRow } from './settings-field-row'
import { settingsControlClass } from './settings-control-classes'
import { SettingsSectionCard } from './settings-section-card'
import { SettingsToggleRow } from './settings-toggle-row'
import { suspensionDurationOptions } from '../config/finance-options'
import type { FinanceTransactionalSettings } from '../types/settings'
import { extendMembershipSuspension } from '@/modules/memberships/api/membership-subscription-api'
import { Button } from '@/shared/components/ui/button'

type FinanceTransactionalPanelProps = {
  value: FinanceTransactionalSettings
  onChange: (value: FinanceTransactionalSettings) => void
}

export function FinanceTransactionalPanel({ value, onChange }: FinanceTransactionalPanelProps) {
  const [extendSuspensionOpen, setExtendSuspensionOpen] = useState(false)
  const [extendSuspensionSubmitting, setExtendSuspensionSubmitting] = useState(false)

  const patch = (patchValue: Partial<FinanceTransactionalSettings>) =>
    onChange({ ...value, ...patchValue })

  const patchEscrow = (patchValue: Partial<FinanceTransactionalSettings['escrow']>) =>
    patch({ escrow: { ...value.escrow, ...patchValue } })

  const patchPayout = (patchValue: Partial<FinanceTransactionalSettings['expertsPayout']>) =>
    patch({ expertsPayout: { ...value.expertsPayout, ...patchValue } })

  const patchMethods = (patchValue: Partial<FinanceTransactionalSettings['paymentMethods']>) =>
    patch({ paymentMethods: { ...value.paymentMethods, ...patchValue } })

  const patchGateways = (patchValue: Partial<FinanceTransactionalSettings['paymentGateways']>) =>
    patch({ paymentGateways: { ...value.paymentGateways, ...patchValue } })

  const patchSuspension = (
    patchValue: Partial<FinanceTransactionalSettings['membershipSuspension']>,
  ) => patch({ membershipSuspension: { ...value.membershipSuspension, ...patchValue } })

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsSectionCard title="Escrow System" description="Manage escrow settings">
          <SettingsToggleRow
            label="Enable Escrow System"
            description="Mirrors Service Marketplace escrow setting. Both must be enabled for escrow payouts."
            checked={value.escrow.enableEscrowSystem}
            onChange={(checked) => patchEscrow({ enableEscrowSystem: checked })}
          />
        </SettingsSectionCard>

        <SettingsSectionCard title="Experts Payout" description="Frequency of payouts">
          <SettingsCheckboxGroup
            label="Set Experts Payout Frequency"
            options={[
              { key: 'daily', label: 'Daily' },
              { key: 'weekly', label: 'Weekly' },
              { key: 'fortnightly', label: 'Fortnightly' },
              { key: 'monthly', label: 'Monthly' },
            ]}
            values={{
              daily: value.expertsPayout.daily,
              weekly: value.expertsPayout.weekly,
              fortnightly: value.expertsPayout.fortnightly,
              monthly: value.expertsPayout.monthly,
            }}
            onChange={(key, checked) =>
              patchPayout({ [key]: checked } as Partial<
                FinanceTransactionalSettings['expertsPayout']
              >)
            }
          />
          <SettingsFieldRow label="Custom">
            <input
              className={settingsControlClass}
              value={value.expertsPayout.custom}
              onChange={(event) => patchPayout({ custom: event.target.value })}
              placeholder="Enter custom payout rule"
            />
          </SettingsFieldRow>
        </SettingsSectionCard>
      </div>

      <SettingsSectionCard title="Payment Methods" description="Payment options available to users">
        <SettingsToggleRow
          label="Credit Card"
          checked={value.paymentMethods.creditCard}
          onChange={(checked) => patchMethods({ creditCard: checked })}
        />
        <SettingsToggleRow
          label="Debit Card"
          checked={value.paymentMethods.debitCard}
          onChange={(checked) => patchMethods({ debitCard: checked })}
        />
        <SettingsToggleRow
          label="Paypal"
          checked={value.paymentMethods.paypal}
          onChange={(checked) => patchMethods({ paypal: checked })}
        />
        <SettingsToggleRow
          label="Bank Transfer"
          checked={value.paymentMethods.bankTransfer}
          onChange={(checked) => patchMethods({ bankTransfer: checked })}
        />
        <SettingsToggleRow
          label="Cryptocurrency"
          checked={value.paymentMethods.cryptocurrency}
          onChange={(checked) => patchMethods({ cryptocurrency: checked })}
        />
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Payment Gateways"
        description="Active payment processing providers"
      >
        <SettingsToggleRow
          label="razorpay"
          checked={value.paymentGateways.razorpay}
          onChange={(checked) => patchGateways({ razorpay: checked })}
        />
        <div className="grid gap-4 pt-2 sm:grid-cols-2">
          <SettingsFieldRow
            label="Payment Retry Logic"
            description="Number of automatic retry attempts for failed payments"
          >
            <input
              type="number"
              min={1}
              max={10}
              className={settingsControlClass}
              value={value.paymentGateways.paymentRetryAttempts}
              onChange={(event) =>
                patchGateways({ paymentRetryAttempts: Number(event.target.value) || 1 })
              }
            />
          </SettingsFieldRow>
          <SettingsFieldRow
            label="Retry Interval (hours)"
            description="Time between payment retry attempts"
          >
            <input
              type="number"
              min={1}
              max={168}
              className={settingsControlClass}
              value={value.paymentGateways.retryIntervalHours}
              onChange={(event) =>
                patchGateways({ retryIntervalHours: Number(event.target.value) || 1 })
              }
            />
          </SettingsFieldRow>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard title="Membership Suspension Rules">
        <SettingsToggleRow
          label="Enable Auto Suspension"
          description="Turn on automatic suspension for members who violate payment rules"
          checked={value.membershipSuspension.enableAutoSuspension}
          onChange={(checked) => patchSuspension({ enableAutoSuspension: checked })}
        />
        <SettingsToggleRow
          label="Suspend After Non-Payment"
          description="Define the grace period after subscription expiry before suspension"
          checked={value.membershipSuspension.suspendAfterNonPayment}
          onChange={(checked) => patchSuspension({ suspendAfterNonPayment: checked })}
        />
        <SettingsFieldRow
          label="Suspension Duration"
          description="Set how long the suspension remains active"
        >
          <select
            className={settingsControlClass}
            value={value.membershipSuspension.suspensionDuration}
            onChange={(event) => patchSuspension({ suspensionDuration: event.target.value })}
          >
            {suspensionDurationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </SettingsFieldRow>
        <div className="flex justify-end border-t border-white/5 pt-3">
          <Button
            variant="secondary"
            className="h-8 text-xs"
            onClick={() => setExtendSuspensionOpen(true)}
          >
            Extend Suspension
          </Button>
        </div>
        <SettingsToggleRow
          label="Notify Member on Suspension"
          description="Inform members when their account is suspended due to payment issues"
          checked={value.membershipSuspension.notifyMemberOnSuspension}
          onChange={(checked) => patchSuspension({ notifyMemberOnSuspension: checked })}
        />
      </SettingsSectionCard>

      <ExtendSuspensionModal
        open={extendSuspensionOpen}
        onClose={() => setExtendSuspensionOpen(false)}
        isSubmitting={extendSuspensionSubmitting}
        onSubmit={async ({ subscriptionId, startDate, endDate, adminNotes }) => {
          setExtendSuspensionSubmitting(true)
          try {
            await extendMembershipSuspension(subscriptionId, {
              startDate,
              endDate,
              adminNotes: adminNotes || undefined,
            })
            setExtendSuspensionOpen(false)
            toast.success('Membership suspension extended')
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to extend suspension'
            toast.error(message)
            throw error instanceof Error ? error : new Error(message)
          } finally {
            setExtendSuspensionSubmitting(false)
          }
        }}
      />
    </div>
  )
}
