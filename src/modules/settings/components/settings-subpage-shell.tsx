import type { PropsWithChildren } from 'react'
import { useNavigate } from 'react-router-dom'

import type { SettingsTab } from '../config/settings-tabs-config'
import { SettingsTopTabs } from './settings-top-tabs'
import { SectionHeader } from '@/shared/components/dashboard/section-header'

type SettingsSubpageShellProps = PropsWithChildren<{
  activeTab?: SettingsTab
}>

export function SettingsSubpageShell({
  activeTab = 'platform',
  children,
}: SettingsSubpageShellProps) {
  const navigate = useNavigate()

  return (
    <div className="settings-subpage">
      <SectionHeader
        title="Settings"
        subtitle="Track metrics, payouts, and financial performance"
        actions={[
          {
            label: 'Settings Logs',
            onClick: () => navigate('/settings/logs'),
            variant: 'secondary',
          },
        ]}
      />
      <SettingsTopTabs activeTab={activeTab} />
      <div className="settings-subpage-body">{children}</div>
    </div>
  )
}
