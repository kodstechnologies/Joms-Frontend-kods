import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import { ExtendSuspensionModal } from './extend-suspension-modal'
import { SettingsToggle } from './settings-toggle-row'
import { suspensionDurationOptions } from '../config/finance-options'
import type { FinanceTransactionalSettings } from '../types/settings'
import { extendMembershipSuspension } from '@/modules/memberships/api/membership-subscription-api'
import { cn } from '@/shared/lib/cn'

type FinanceTransactionalPanelProps = {
  value: FinanceTransactionalSettings
  onChange: (value: FinanceTransactionalSettings) => void
}

const PAYOUT_OPTIONS = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'fortnightly', label: 'Fortnightly' },
  { key: 'monthly', label: 'Monthly' },
] as const

const PAYMENT_METHOD_OPTIONS = [
  { key: 'creditCard', label: 'Credit Card' },
  { key: 'debitCard', label: 'Debit Card' },
  { key: 'paypal', label: 'Paypal' },
  { key: 'bankTransfer', label: 'Bank Transfer' },
  { key: 'cryptocurrency', label: 'Cryptocurrency' },
] as const

function FinanceToggleRow({
  label,
  description,
  checked,
  onChange,
  descriptionBelow,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  descriptionBelow?: boolean
}) {
  return (
    <div className={cn('finance-toggle-block', descriptionBelow && 'is-desc-below')}>
      <div className="finance-toggle-row">
        <div className="finance-toggle-copy">
          <p className="finance-toggle-label">{label}</p>
          {description && !descriptionBelow ? (
            <p className="finance-toggle-desc">{description}</p>
          ) : null}
        </div>
        <SettingsToggle
          checked={checked}
          onChange={onChange}
          ariaLabel={label}
          showCaption={false}
        />
      </div>
      {description && descriptionBelow ? (
        <p className="finance-toggle-desc finance-toggle-desc-below">{description}</p>
      ) : null}
    </div>
  )
}

export function FinanceTransactionalPanel({ value, onChange }: FinanceTransactionalPanelProps) {
  const [extendSuspensionOpen, setExtendSuspensionOpen] = useState(false)
  const [extendSuspensionSubmitting, setExtendSuspensionSubmitting] = useState(false)
  const [customPayoutEnabled, setCustomPayoutEnabled] = useState(
    () => value.expertsPayout.custom.trim().length > 0,
  )

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
    <div className="finance-settings-panel">
      <div className="finance-settings-top-grid">
        <section className="finance-settings-card">
          <div className="finance-settings-card-head">
            <h2 className="finance-settings-card-title">Escrow System</h2>
            <p className="finance-settings-card-subtitle">Manage escrow settings</p>
          </div>
          <FinanceToggleRow
            label="Enable Escrow System"
            description="Letting users opt escrow model for secure transaction on the platform."
            descriptionBelow
            checked={value.escrow.enableEscrowSystem}
            onChange={(checked) => patchEscrow({ enableEscrowSystem: checked })}
          />
        </section>

        <section className="finance-settings-card">
          <div className="finance-settings-card-head">
            <h2 className="finance-settings-card-title">Experts Payout</h2>
            <p className="finance-settings-card-subtitle">Frequency of payouts</p>
          </div>
          <p className="finance-settings-subheading">Set Experts Payout Frequency</p>
          <div className="finance-payout-row">
            {PAYOUT_OPTIONS.map((option) => (
              <label key={option.key} className="finance-check-item">
                <input
                  type="checkbox"
                  checked={Boolean(value.expertsPayout[option.key])}
                  onChange={(event) =>
                    patchPayout({
                      [option.key]: event.target.checked,
                    } as Partial<FinanceTransactionalSettings['expertsPayout']>)
                  }
                  className="finance-checkbox"
                />
                <span>{option.label}</span>
              </label>
            ))}
            <label className="finance-check-item finance-check-custom">
              <input
                type="checkbox"
                checked={customPayoutEnabled}
                onChange={(event) => {
                  const enabled = event.target.checked
                  setCustomPayoutEnabled(enabled)
                  if (!enabled) patchPayout({ custom: '' })
                }}
                className="finance-checkbox"
              />
              <span>Custom</span>
              <input
                id="finance-payout-custom"
                className="finance-control finance-payout-custom-input"
                value={value.expertsPayout.custom}
                onChange={(event) => {
                  const next = event.target.value
                  setCustomPayoutEnabled(true)
                  patchPayout({ custom: next })
                }}
                placeholder="Enter here"
                onFocus={() => setCustomPayoutEnabled(true)}
              />
            </label>
          </div>
        </section>
      </div>

      <section className="finance-settings-card">
        <div className="finance-settings-card-head is-divided">
          <h2 className="finance-settings-card-title">Payment Methods</h2>
          <p className="finance-settings-card-subtitle">Payment options available to users</p>
        </div>
        <p className="finance-settings-subheading is-muted">Supported Payment Methods</p>
        <div className="finance-toggle-list">
          {PAYMENT_METHOD_OPTIONS.map((option) => (
            <FinanceToggleRow
              key={option.key}
              label={option.label}
              checked={Boolean(value.paymentMethods[option.key])}
              onChange={(checked) =>
                patchMethods({
                  [option.key]: checked,
                } as Partial<FinanceTransactionalSettings['paymentMethods']>)
              }
            />
          ))}
        </div>
      </section>

      <section className="finance-settings-card">
        <div className="finance-settings-card-head is-divided">
          <h2 className="finance-settings-card-title">Payment Gateways</h2>
          <p className="finance-settings-card-subtitle">Active payment processing providers</p>
        </div>
        <p className="finance-settings-subheading is-muted">Enabled Payment Gateway</p>
        <div className="finance-toggle-list">
          <FinanceToggleRow
            label="razorpay"
            checked={value.paymentGateways.razorpay}
            onChange={(checked) => patchGateways({ razorpay: checked })}
          />
        </div>
        <div className="finance-gateway-fields">
          <div className="finance-field">
            <label className="finance-field-label" htmlFor="finance-retry-attempts">
              Payment Retry Logic
            </label>
            <p className="finance-field-hint">
              Number of automatic retry attempts for failed payments.
            </p>
            <input
              id="finance-retry-attempts"
              type="number"
              min={1}
              max={10}
              className="finance-control"
              value={String(value.paymentGateways.paymentRetryAttempts).padStart(2, '0')}
              onChange={(event) =>
                patchGateways({ paymentRetryAttempts: Number(event.target.value) || 1 })
              }
            />
          </div>
          <div className="finance-field">
            <label className="finance-field-label" htmlFor="finance-retry-interval">
              Retry Interval (hours)
            </label>
            <p className="finance-field-hint">Time between payment retry attempts.</p>
            <input
              id="finance-retry-interval"
              type="number"
              min={1}
              max={168}
              className="finance-control"
              value={value.paymentGateways.retryIntervalHours}
              onChange={(event) =>
                patchGateways({ retryIntervalHours: Number(event.target.value) || 1 })
              }
            />
          </div>
        </div>
      </section>

      <section className="finance-settings-card">
        <div className="finance-settings-card-head is-divided">
          <h2 className="finance-settings-card-title">Membership Suspension Rules</h2>
        </div>
        <div className="finance-toggle-list">
          <FinanceToggleRow
            label="Enable Auto Suspension"
            description="Turn on automatic suspension for members who violate payment rules."
            checked={value.membershipSuspension.enableAutoSuspension}
            onChange={(checked) => patchSuspension({ enableAutoSuspension: checked })}
          />
          <FinanceToggleRow
            label="Suspend After Non-Payment"
            description="Define the grace period after subscription expiry before suspension."
            checked={value.membershipSuspension.suspendAfterNonPayment}
            onChange={(checked) => patchSuspension({ suspendAfterNonPayment: checked })}
          />
        </div>

        <div className="finance-field finance-field-stack">
          <div className="finance-duration-head">
            <div>
              <p className="finance-field-label">Suspension Duration</p>
              <p className="finance-field-hint">Set how long the suspension remains active.</p>
            </div>
            <button
              type="button"
              className="finance-extend-link"
              onClick={() => setExtendSuspensionOpen(true)}
            >
              Extend Suspension
            </button>
          </div>
          <div className="finance-select-wrap">
            <select
              className={cn('finance-control', 'finance-select')}
              value={value.membershipSuspension.suspensionDuration}
              onChange={(event) => patchSuspension({ suspensionDuration: event.target.value })}
            >
              {suspensionDurationOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="finance-select-icon" aria-hidden="true" />
          </div>
        </div>

        <FinanceToggleRow
          label="Notify Member on Suspension"
          description="Inform members when their account is suspended due to payment issues."
          checked={value.membershipSuspension.notifyMemberOnSuspension}
          onChange={(checked) => patchSuspension({ notifyMemberOnSuspension: checked })}
        />
      </section>

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
            const message = getApiErrorMessage(error, 'Failed to extend suspension')
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
