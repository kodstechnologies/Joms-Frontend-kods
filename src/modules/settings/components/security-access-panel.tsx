import { Link } from 'react-router-dom'

import { SettingsSectionCard } from './settings-section-card'
import { SettingsToggleRow } from './settings-toggle-row'
import { Button } from '@/shared/components/ui/button'

export function SecurityAccessPanel() {
  return (
    <div className="space-y-6">
      <SettingsSectionCard
        title="Security & Access"
        description="Manage authentication, roles, and admin access controls"
      >
        <SettingsToggleRow
          label="Two-Factor Authentication"
          description="Require MFA for all admin accounts"
          checked
          onChange={() => undefined}
        />
        <SettingsToggleRow
          label="Session Timeout"
          description="Auto logout inactive admins after 30 minutes"
          checked
          onChange={() => undefined}
        />
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div>
            <p className="text-sm font-medium text-white">Role Based Access Control</p>
            <p className="text-xs text-slate-500">
              Manage roles, permissions, and sub-admin accounts
            </p>
          </div>
          <Link to="/settings/access">
            <Button>Open RBAC</Button>
          </Link>
        </div>
      </SettingsSectionCard>
      <p className="text-xs text-slate-500">
        Advanced security policies will be connected to backend APIs in a later release.
      </p>
    </div>
  )
}
