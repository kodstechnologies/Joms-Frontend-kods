import { useNavigate } from 'react-router-dom'

import { POLICY_SETTINGS_TABS } from '../utils/policy-navigation'
import { cn } from '@/shared/lib/cn'

export function PolicySettingsTopTabs({ activeKey = 'platform' }: { activeKey?: string }) {
  const navigate = useNavigate()

  return (
    <div className="settings-top-tabs">
      <div className="settings-top-tabs-scroll">
        <div className="settings-top-tabs-row">
          {POLICY_SETTINGS_TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                if (item.routeTab) {
                  navigate('/settings/main', { state: { settingsTab: item.routeTab } })
                }
              }}
              className={cn(
                'settings-top-tab',
                item.key === activeKey && 'settings-top-tab--active',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PolicyBreadcrumb({ segments }: { segments: string[] }) {
  return <p className="policy-page-breadcrumb">{segments.join(' / ')}</p>
}
