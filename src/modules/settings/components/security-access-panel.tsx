import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { SecurityQuestionsModal } from './security-questions-modal'
import {
  blockReuseOptions,
  maxResetAttemptsOptions,
  minimumLengthOptions,
  passwordExpiryOptions,
  sessionTimeoutOptions,
} from '../mock/security-options.mock'
import type { SecuritySettings } from '../types/settings'
import { SettingsToggle } from './settings-toggle-row'

type SecurityAccessPanelProps = {
  value: SecuritySettings
  onChange: (value: SecuritySettings) => void
}

function SecuritySelect({
  id,
  value,
  onChange,
  options,
}: {
  id: string
  value: number
  onChange: (value: number) => void
  options: Array<{ value: number; label: string }>
}) {
  return (
    <div className="security-select-wrap">
      <select
        id={id}
        className="security-select"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function SecurityToggle({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  ariaLabel: string
}) {
  return <SettingsToggle checked={checked} onChange={onChange} ariaLabel={ariaLabel} />
}

function SecurityCheckboxRow({
  label,
  options,
  values,
  onChange,
  trailing,
}: {
  label: string
  options: Array<{ key: string; label: string }>
  values: Record<string, boolean>
  onChange: (key: string, checked: boolean) => void
  trailing?: ReactNode
}) {
  return (
    <div className="security-checkbox-block">
      <div className="security-checkbox-block-head">
        <p className="security-subheading">{label}</p>
        {trailing}
      </div>
      <div className="security-checkbox-row">
        {options.map((option) => (
          <label key={option.key} className="security-checkbox-item">
            <input
              type="checkbox"
              checked={values[option.key] ?? false}
              onChange={(event) => onChange(option.key, event.target.checked)}
              className="security-checkbox-input"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

export function SecurityAccessPanel({ value, onChange }: SecurityAccessPanelProps) {
  const navigate = useNavigate()
  const [securityQuestionsOpen, setSecurityQuestionsOpen] = useState(false)

  const patch = (patchValue: Partial<SecuritySettings>) => onChange({ ...value, ...patchValue })

  const patchSession = (durationMinutes: number) => patch({ sessionTimeout: { durationMinutes } })

  const patchPassword = (patchValue: Partial<SecuritySettings['passwordPolicy']>) =>
    patch({ passwordPolicy: { ...value.passwordPolicy, ...patchValue } })

  const patchMfa = (patchValue: Partial<SecuritySettings['mfa']>) =>
    patch({ mfa: { ...value.mfa, ...patchValue } })

  const patchReset = (patchValue: Partial<SecuritySettings['passwordReset']>) =>
    patch({ passwordReset: { ...value.passwordReset, ...patchValue } })

  return (
    <div className="security-access-panel">
      {/* Session timeout */}
      <section className="security-section">
        <header className="security-section-header">
          <h2 className="security-section-title">Session Timeout</h2>
          <p className="security-section-desc">
            Configure automatic logout duration for inactive sessions
          </p>
        </header>
        <div className="security-field">
          <label className="security-field-label" htmlFor="session-timeout-duration">
            Session Timeout Duration
          </label>
          <SecuritySelect
            id="session-timeout-duration"
            value={value.sessionTimeout.durationMinutes}
            onChange={patchSession}
            options={sessionTimeoutOptions}
          />
          <p className="security-field-hint">
            Users will be logged out after this period of inactivity
          </p>
        </div>
      </section>

      {/* Password & MFA Settings — password requirements */}
      <section className="security-section">
        <header className="security-section-header">
          <h2 className="security-section-title">Password & MFA Settings</h2>
          <p className="security-section-desc">
            Configure password policies and multi-factor authentication
          </p>
        </header>

        <div className="security-password-block">
          <h3 className="security-subheading">Password Requirement</h3>
          <div className="security-two-col">
            <div className="security-field">
              <label className="security-field-label" htmlFor="password-min-length">
                Minimum Length
              </label>
              <SecuritySelect
                id="password-min-length"
                value={value.passwordPolicy.minimumLength}
                onChange={(minimumLength) => patchPassword({ minimumLength })}
                options={minimumLengthOptions}
              />
            </div>
            <div className="security-field">
              <label className="security-field-label" htmlFor="password-expiry">
                Password Expiry
              </label>
              <SecuritySelect
                id="password-expiry"
                value={value.passwordPolicy.passwordExpiryDays}
                onChange={(passwordExpiryDays) => patchPassword({ passwordExpiryDays })}
                options={passwordExpiryOptions}
              />
            </div>
          </div>

          <div className="security-must-include">
            <p className="security-field-label">Must Include</p>
            <div className="security-checkbox-row">
              {(
                [
                  { key: 'requireUppercase', label: 'Uppercase Letter (A-Z)' },
                  { key: 'requireNumber', label: 'Number (0-9)' },
                  { key: 'requireLowercase', label: 'Lowercase Letter (a-z)' },
                  { key: 'requireSpecialChar', label: 'Special Character (!@#$%^&*)' },
                ] as const
              ).map((option) => (
                <label key={option.key} className="security-checkbox-item">
                  <input
                    type="checkbox"
                    checked={value.passwordPolicy[option.key]}
                    onChange={(event) => patchPassword({ [option.key]: event.target.checked })}
                    className="security-checkbox-input"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MFA */}
      <section className="security-section security-section-mfa">
        <div className="security-toggle-header">
          <div>
            <h2 className="security-section-title">Multi-Factor Authentication (MFA)</h2>
            <p className="security-section-desc">Require MFA for all admin users</p>
          </div>
          <SecurityToggle
            checked={value.mfa.requireForAllAdmins}
            onChange={(checked) => patchMfa({ requireForAllAdmins: checked })}
            ariaLabel="Require MFA for all admin users"
          />
        </div>
        <div className="security-section-divider" />
        <SecurityCheckboxRow
          label="MFA Methods"
          options={[
            { key: 'authenticatorApp', label: 'Authenticator App' },
            { key: 'smsOtp', label: 'SMS OTP' },
            { key: 'emailOtp', label: 'Email OTP' },
          ]}
          values={{
            authenticatorApp: value.mfa.authenticatorApp,
            smsOtp: value.mfa.smsOtp,
            emailOtp: value.mfa.emailOtp,
          }}
          onChange={(key, checked) =>
            patchMfa({ [key]: checked } as Partial<SecuritySettings['mfa']>)
          }
        />
      </section>

      {/* Password reset */}
      <section className="security-section">
        <header className="security-section-header">
          <h2 className="security-section-title">Password Reset Policy</h2>
          <p className="security-section-desc">Configure password reset methods and restrictions</p>
        </header>

        <SecurityCheckboxRow
          label="Reset Method"
          options={[
            { key: 'emailOtp', label: 'Email OTP' },
            { key: 'smsOtp', label: 'SMS OTP' },
            { key: 'securityQuestions', label: 'Security Questions' },
          ]}
          values={{
            emailOtp: value.passwordReset.emailOtp,
            smsOtp: value.passwordReset.smsOtp,
            securityQuestions: value.passwordReset.securityQuestions,
          }}
          onChange={(key, checked) =>
            patchReset({ [key]: checked } as Partial<SecuritySettings['passwordReset']>)
          }
          trailing={
            value.passwordReset.securityQuestions ? (
              <button
                type="button"
                onClick={() => setSecurityQuestionsOpen(true)}
                className="security-manage-link"
              >
                Manage Security Questions
              </button>
            ) : null
          }
        />

        <div className="security-two-col">
          <div className="security-field">
            <label className="security-field-label" htmlFor="max-reset-attempts">
              Max Reset Attempts
            </label>
            <SecuritySelect
              id="max-reset-attempts"
              value={value.passwordReset.maxResetAttempts}
              onChange={(maxResetAttempts) => patchReset({ maxResetAttempts })}
              options={maxResetAttemptsOptions}
            />
          </div>
          <div className="security-field">
            <label className="security-field-label" htmlFor="block-reuse">
              Block Reuse Of Old Passwords
            </label>
            <SecuritySelect
              id="block-reuse"
              value={value.passwordReset.blockReuseCount}
              onChange={(blockReuseCount) => patchReset({ blockReuseCount })}
              options={blockReuseOptions}
            />
          </div>
        </div>

        <div className="security-alert-row">
          <div>
            <p className="security-alert-title">Alert Super Admins on Suspicious Resets</p>
            <p className="security-section-desc">
              Notify when multiple reset attempts are detected
            </p>
          </div>
          <SecurityToggle
            checked={value.passwordReset.alertSuperAdminsOnSuspiciousResets}
            onChange={(checked) => patchReset({ alertSuperAdminsOnSuspiciousResets: checked })}
            ariaLabel="Alert Super Admins on Suspicious Resets"
          />
        </div>
      </section>

      {/* Quick links */}
      <div className="security-quick-links">
        <QuickLinkCard
          title="Locked Accounts"
          description="Manage accounts that have been locked due to security reasons"
          onView={() => navigate('/settings/security/locked-accounts')}
        />
        <QuickLinkCard
          title="Admin Login Audit Trails"
          description="Monitor all admin login activities and security events"
          onView={() => navigate('/settings/security/login-trails')}
        />
      </div>

      <SecurityQuestionsModal
        open={securityQuestionsOpen}
        config={value.securityQuestionsConfig}
        onClose={() => setSecurityQuestionsOpen(false)}
        onSubmit={(config) => {
          patch({ securityQuestionsConfig: config })
          setSecurityQuestionsOpen(false)
          toast.success('Security questions updated — save settings to apply')
        }}
      />
    </div>
  )
}

function QuickLinkCard({
  title,
  description,
  onView,
}: {
  title: string
  description: string
  onView: () => void
}) {
  return (
    <div className="security-quick-card">
      <div className="security-quick-card-copy">
        <h3 className="security-quick-card-title">{title}</h3>
        <p className="security-quick-card-desc">{description}</p>
      </div>
      <button type="button" onClick={onView} className="security-quick-card-view">
        View
      </button>
    </div>
  )
}
