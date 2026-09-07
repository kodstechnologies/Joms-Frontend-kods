import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { SecurityQuestionsModal } from './security-questions-modal'
import { IpAddressModal } from './ip-address-modal'
import { MFA_METHOD_KEYS, countEnabledMfaMethods } from '../utils/security-settings'
import {
  blockReuseOptions,
  maxResetAttemptsOptions,
  minimumLengthOptions,
  passwordExpiryOptions,
  sessionTimeoutOptions,
} from '../config/security-options'
import type { SecuritySettings } from '../types/settings'
import { SettingsToggle } from './settings-toggle-row'

type SecurityAccessPanelProps = {
  value: SecuritySettings
  onChange: (value: SecuritySettings) => void
  onPersist?: (value: SecuritySettings) => Promise<void>
}

type IpRow = {
  id: string
  ipAddress: string
  description: string
  addedDate: string
}

const maxFailedLoginOptions = [
  { value: 3, label: '3 Attempts' },
  { value: 5, label: '5 Attempts' },
  { value: 10, label: '10 Attempts' },
]

const lockdownDurationOptions = [
  { value: 15, label: '15 Minutes' },
  { value: 30, label: '30 Minutes' },
  { value: 60, label: '60 Minutes' },
]

const captchaTriggerOptions = [
  { value: 2, label: '2 Failed Attempts' },
  { value: 3, label: '3 Failed Attempts' },
  { value: 5, label: '5 Failed Attempts' },
]

const INITIAL_ALLOWED_IPS: IpRow[] = [
  {
    id: 'allow-1',
    ipAddress: '192.168.1.1',
    description: 'Office Network',
    addedDate: '12 Jan 2026',
  },
  {
    id: 'allow-2',
    ipAddress: '192.168.1.1',
    description: 'VPN Gateway',
    addedDate: '10 Jan 2026',
  },
]

const INITIAL_BLOCKED_IPS: IpRow[] = [
  {
    id: 'block-1',
    ipAddress: '192.168.1.1',
    description: 'Suspicious activity',
    addedDate: '08 Jan 2026',
  },
  {
    id: 'block-2',
    ipAddress: '192.168.1.1',
    description: 'Repeated failed logins',
    addedDate: '05 Jan 2026',
  },
]

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
      <ChevronDown className="security-select-icon" aria-hidden="true" />
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

function IpTable({ rows, actions }: { rows: IpRow[]; actions: (row: IpRow) => ReactNode }) {
  return (
    <div className="security-ip-table-wrap">
      <table className="security-ip-table">
        <thead>
          <tr>
            <th>IP Address</th>
            <th>Description</th>
            <th>Added Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.ipAddress}</td>
              <td>{row.description}</td>
              <td>{row.addedDate}</td>
              <td>
                <div className="security-ip-actions">{actions(row)}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SecurityAccessPanel({ value, onChange, onPersist }: SecurityAccessPanelProps) {
  const navigate = useNavigate()
  const [securityQuestionsOpen, setSecurityQuestionsOpen] = useState(false)

  // UI-only local state (not persisted / not sent to backend)
  const [maxFailedLogins, setMaxFailedLogins] = useState(5)
  const [failedAttemptsAlert, setFailedAttemptsAlert] = useState(true)
  const [lockdownMinutes, setLockdownMinutes] = useState(30)
  const [captchaEnabled, setCaptchaEnabled] = useState(true)
  const [captchaAfter, setCaptchaAfter] = useState(3)
  const [ipRestrictionEnabled, setIpRestrictionEnabled] = useState(true)
  const [blockedListEnabled, setBlockedListEnabled] = useState(true)
  const [allowedIps, setAllowedIps] = useState<IpRow[]>(INITIAL_ALLOWED_IPS)
  const [blockedIps, setBlockedIps] = useState<IpRow[]>(INITIAL_BLOCKED_IPS)
  const [ipModalMode, setIpModalMode] = useState<'add' | 'edit' | null>(null)
  const [editingAllowedId, setEditingAllowedId] = useState<string | null>(null)
  const [ipDraft, setIpDraft] = useState({ ipAddress: '', description: '' })

  const patch = (patchValue: Partial<SecuritySettings>) => onChange({ ...value, ...patchValue })

  const patchSession = (durationMinutes: number) => patch({ sessionTimeout: { durationMinutes } })

  const patchPassword = (patchValue: Partial<SecuritySettings['passwordPolicy']>) =>
    patch({ passwordPolicy: { ...value.passwordPolicy, ...patchValue } })

  const patchMfa = (patchValue: Partial<SecuritySettings['mfa']>) =>
    patch({ mfa: { ...value.mfa, ...patchValue } })

  const patchMfaMethod = (key: (typeof MFA_METHOD_KEYS)[number], checked: boolean) => {
    if (!checked && countEnabledMfaMethods(value.mfa) <= 1 && value.mfa[key]) {
      toast.error('At least one MFA method must stay enabled')
      return
    }
    patchMfa({ [key]: checked })
  }

  const patchReset = (patchValue: Partial<SecuritySettings['passwordReset']>) =>
    patch({ passwordReset: { ...value.passwordReset, ...patchValue } })

  const closeIpModal = () => {
    setIpModalMode(null)
    setEditingAllowedId(null)
    setIpDraft({ ipAddress: '', description: '' })
  }

  const handleSaveAllowedIp = (values: { ipAddress: string; description: string }) => {
    const ipAddress = values.ipAddress.trim()
    const description = values.description.trim() || '—'

    if (ipModalMode === 'edit' && editingAllowedId) {
      setAllowedIps((rows) =>
        rows.map((row) => (row.id === editingAllowedId ? { ...row, ipAddress, description } : row)),
      )
    } else {
      setAllowedIps((rows) => [
        {
          id: `allow-${Date.now()}`,
          ipAddress,
          description,
          addedDate: new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
        },
        ...rows,
      ])
    }
    closeIpModal()
  }

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
        <div className="security-field security-field-narrow">
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

      {/* Password & MFA Settings — single card (Figma) */}
      <section className="security-section">
        <header className="security-section-header">
          <h2 className="security-section-title">Password & MFA Settings</h2>
          <p className="security-section-desc">
            Configure password policies and multi-factor authentication
          </p>
        </header>

        <div className="security-nested-stack">
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

          <div className="security-nested-divider" />

          <div className="security-nested-block">
            <div className="security-toggle-header">
              <h3 className="security-subheading">Multi-Factor Authentication (MFA)</h3>
              <SecurityToggle
                checked={value.mfa.requireForAllSubAdmins}
                onChange={(checked) => patchMfa({ requireForAllSubAdmins: checked })}
                ariaLabel="Require MFA for all sub-admins"
              />
            </div>
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
                patchMfaMethod(key as (typeof MFA_METHOD_KEYS)[number], checked)
              }
            />
          </div>

          <div className="security-nested-divider" />

          <div className="security-nested-block">
            <h3 className="security-subheading">Password Reset Policy</h3>
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
          </div>
        </div>
      </section>

      {/* Brute-force Protection — UI only */}
      <section className="security-section">
        <header className="security-section-header">
          <h2 className="security-section-title">Brute-force Protection</h2>
          <p className="security-section-desc">
            Limit failed login attempts and harden account lockouts
          </p>
        </header>

        <div className="security-nested-stack">
          <div className="security-field security-field-narrow">
            <label className="security-field-label" htmlFor="max-failed-logins">
              Max Failed Login Attempts
            </label>
            <SecuritySelect
              id="max-failed-logins"
              value={maxFailedLogins}
              onChange={setMaxFailedLogins}
              options={maxFailedLoginOptions}
            />
          </div>

          <div className="security-inline-toggle-row">
            <div>
              <p className="security-alert-title">Failed Attempts Alert</p>
              <p className="security-section-desc">
                Notify admins when login failures approach the lockout threshold
              </p>
            </div>
            <SecurityToggle
              checked={failedAttemptsAlert}
              onChange={setFailedAttemptsAlert}
              ariaLabel="Failed Attempts Alert"
            />
          </div>

          <div className="security-field security-field-narrow">
            <label className="security-field-label" htmlFor="lockdown-duration">
              Lockdown Duration / Security Delay
            </label>
            <SecuritySelect
              id="lockdown-duration"
              value={lockdownMinutes}
              onChange={setLockdownMinutes}
              options={lockdownDurationOptions}
            />
            <p className="security-field-hint">
              Account will be locked for this duration after reaching max failed attempts
            </p>
          </div>

          <div className="security-inline-toggle-row">
            <div>
              <p className="security-alert-title">Enable CAPTCHA After Failure</p>
              <p className="security-section-desc">
                Show CAPTCHA after repeated failed login attempts
              </p>
            </div>
            <SecurityToggle
              checked={captchaEnabled}
              onChange={setCaptchaEnabled}
              ariaLabel="Enable CAPTCHA After Failure"
            />
          </div>

          {captchaEnabled ? (
            <div className="security-field security-field-narrow">
              <label className="security-field-label" htmlFor="captcha-trigger">
                Trigger CAPTCHA After
              </label>
              <SecuritySelect
                id="captcha-trigger"
                value={captchaAfter}
                onChange={setCaptchaAfter}
                options={captchaTriggerOptions}
              />
            </div>
          ) : null}
        </div>
      </section>

      {/* IP Whitelisting — UI only */}
      <section className="security-section">
        <div className="security-toggle-header security-section-header">
          <div>
            <h2 className="security-section-title">IP Whitelisting</h2>
            <p className="security-section-desc">Restrict access to approved IP addresses only</p>
          </div>
          <div className="security-toggle-with-label">
            <span className="security-toggle-side-label">Enable IP Restriction</span>
            <SecurityToggle
              checked={ipRestrictionEnabled}
              onChange={setIpRestrictionEnabled}
              ariaLabel="Enable IP Restriction"
            />
          </div>
        </div>

        {ipRestrictionEnabled ? (
          <div className="security-nested-stack">
            <div className="security-ip-toolbar">
              <h3 className="security-subheading">Allowed IP Address</h3>
              <button
                type="button"
                className="security-add-ip-btn"
                onClick={() => {
                  setEditingAllowedId(null)
                  setIpDraft({ ipAddress: '', description: '' })
                  setIpModalMode('add')
                }}
              >
                Add IP Address
              </button>
            </div>

            <IpTable
              rows={allowedIps}
              actions={(row) => (
                <>
                  <button
                    type="button"
                    className="security-ip-icon-btn"
                    aria-label={`Edit ${row.ipAddress}`}
                    onClick={() => {
                      setEditingAllowedId(row.id)
                      setIpDraft({
                        ipAddress: row.ipAddress,
                        description: row.description === '—' ? '' : row.description,
                      })
                      setIpModalMode('edit')
                    }}
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="security-ip-icon-btn"
                    aria-label={`Delete ${row.ipAddress}`}
                    onClick={() =>
                      setAllowedIps((rows) => rows.filter((item) => item.id !== row.id))
                    }
                  >
                    <Trash2 className="size-4" />
                  </button>
                </>
              )}
            />
          </div>
        ) : null}
      </section>

      {/* Blocked IPs — UI only */}
      <section className="security-section">
        <div className="security-toggle-header security-section-header">
          <div>
            <h2 className="security-section-title">List Of Blocked IP Address</h2>
            <p className="security-section-desc">Review and unlock blocked IP addresses</p>
          </div>
          <SecurityToggle
            checked={blockedListEnabled}
            onChange={setBlockedListEnabled}
            ariaLabel="List Of Blocked IP Address"
          />
        </div>

        {blockedListEnabled ? (
          <IpTable
            rows={blockedIps}
            actions={(row) => (
              <button
                type="button"
                className="security-unlock-btn"
                onClick={() => setBlockedIps((rows) => rows.filter((item) => item.id !== row.id))}
              >
                Unlock
              </button>
            )}
          />
        ) : null}
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

      <IpAddressModal
        open={ipModalMode !== null}
        mode={ipModalMode === 'edit' ? 'edit' : 'add'}
        initialValues={ipDraft}
        onClose={closeIpModal}
        onSubmit={handleSaveAllowedIp}
      />

      <SecurityQuestionsModal
        open={securityQuestionsOpen}
        config={value.securityQuestionsConfig}
        onClose={() => setSecurityQuestionsOpen(false)}
        onSubmit={async (config) => {
          const nextConfig = { ...value, securityQuestionsConfig: config }
          onChange(nextConfig)

          if (!onPersist) {
            setSecurityQuestionsOpen(false)
            toast.success('Security questions updated — save settings to apply')
            return
          }

          try {
            await onPersist(nextConfig)
            setSecurityQuestionsOpen(false)
            toast.success('Security questions saved')
          } catch {
            toast.error('Failed to save security questions')
          }
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
