import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { SecurityQuestionsModal } from './security-questions-modal'
import { SettingsCheckboxGroup } from './settings-checkbox-group'
import { SettingsFieldRow, settingsControlClass } from './settings-field-row'
import { SettingsSectionCard } from './settings-section-card'
import { SettingsToggleRow } from './settings-toggle-row'
import {
  blockReuseOptions,
  maxResetAttemptsOptions,
  minimumLengthOptions,
  passwordExpiryOptions,
  sessionTimeoutOptions,
} from '../mock/security-options.mock'
import type { SecuritySettings } from '../types/settings'
import { Button } from '@/shared/components/ui/button'

type SecurityAccessPanelProps = {
  value: SecuritySettings
  onChange: (value: SecuritySettings) => void
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
    <div className="space-y-6">
      <SettingsSectionCard
        title="Session Timeout"
        description="Configure automatic logout duration for inactive sessions"
      >
        <SettingsFieldRow
          label="Session Timeout Duration"
          description="Users will be logged out after this period of inactivity"
        >
          <select
            className={settingsControlClass}
            value={value.sessionTimeout.durationMinutes}
            onChange={(event) => patchSession(Number(event.target.value))}
          >
            {sessionTimeoutOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </SettingsFieldRow>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Password & MFA Settings"
        description="Configure password policies and multi-factor authentication"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsFieldRow label="Minimum Length">
            <select
              className={settingsControlClass}
              value={value.passwordPolicy.minimumLength}
              onChange={(event) => patchPassword({ minimumLength: Number(event.target.value) })}
            >
              {minimumLengthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </SettingsFieldRow>
          <SettingsFieldRow label="Password Expiry">
            <select
              className={settingsControlClass}
              value={value.passwordPolicy.passwordExpiryDays}
              onChange={(event) =>
                patchPassword({ passwordExpiryDays: Number(event.target.value) })
              }
            >
              {passwordExpiryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </SettingsFieldRow>
        </div>
        <SettingsCheckboxGroup
          label="Must Include"
          options={[
            { key: 'requireUppercase', label: 'Uppercase Letter (A-Z)' },
            { key: 'requireNumber', label: 'Number (0-9)' },
            { key: 'requireLowercase', label: 'Lowercase Letter (a-z)' },
            { key: 'requireSpecialChar', label: 'Special Character (!@#$%^&*)' },
          ]}
          values={{
            requireUppercase: value.passwordPolicy.requireUppercase,
            requireNumber: value.passwordPolicy.requireNumber,
            requireLowercase: value.passwordPolicy.requireLowercase,
            requireSpecialChar: value.passwordPolicy.requireSpecialChar,
          }}
          onChange={(key, checked) =>
            patchPassword({ [key]: checked } as Partial<SecuritySettings['passwordPolicy']>)
          }
        />
        <SettingsToggleRow
          label="Multi-Factor Authentication (MFA)"
          description="Require MFA for all admin users"
          checked={value.mfa.requireForAllAdmins}
          onChange={(checked) => patchMfa({ requireForAllAdmins: checked })}
        />
        <SettingsCheckboxGroup
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
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Password Reset Policy"
        description="Configure password reset methods and restrictions"
      >
        <SettingsCheckboxGroup
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
                className="text-xs font-medium text-[#F0C27B] hover:underline"
              >
                Manage Security Questions
              </button>
            ) : null
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsFieldRow label="Max Reset Attempts">
            <select
              className={settingsControlClass}
              value={value.passwordReset.maxResetAttempts}
              onChange={(event) => patchReset({ maxResetAttempts: Number(event.target.value) })}
            >
              {maxResetAttemptsOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </SettingsFieldRow>
          <SettingsFieldRow label="Block Reuse Of Old Passwords">
            <select
              className={settingsControlClass}
              value={value.passwordReset.blockReuseCount}
              onChange={(event) => patchReset({ blockReuseCount: Number(event.target.value) })}
            >
              {blockReuseOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </SettingsFieldRow>
        </div>
        <SettingsToggleRow
          label="Alert Super Admins on Suspicious Resets"
          checked={value.passwordReset.alertSuperAdminsOnSuspiciousResets}
          onChange={(checked) => patchReset({ alertSuperAdminsOnSuspiciousResets: checked })}
        />
      </SettingsSectionCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <QuickLinkCard
          title="Locked Accounts"
          description="Manage accounts that have been locked due to security reasons"
          onView={() => navigate('/settings/security/locked-accounts')}
        />
        <QuickLinkCard
          title="Admin Login Audit Trials"
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
          toast.success('Security questions updated')
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
    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
      <Button variant="secondary" className="mt-4 h-8 text-xs" onClick={onView}>
        View
      </Button>
    </div>
  )
}
