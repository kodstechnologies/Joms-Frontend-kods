import { useNavigate } from 'react-router-dom'

import { SETTINGS_TABS, type SettingsTab } from '../config/settings-tabs-config'
import { cn } from '@/shared/lib/cn'

type SettingsTopTabsProps = {
  activeTab: SettingsTab
  onTabChange?: (tab: SettingsTab) => void
}

export function SettingsTopTabs({ activeTab, onTabChange }: SettingsTopTabsProps) {
  const navigate = useNavigate()

  const handleTabClick = (tab: SettingsTab) => {
    if (onTabChange) {
      onTabChange(tab)
      return
    }

    navigate(`/settings/main?tab=${tab}`, { state: { settingsTab: tab } })
  }

  return (
    <nav className="settings-tabs" aria-label="Settings sections">
      <div className="settings-tabs-inner">
        {SETTINGS_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabClick(tab.key)}
            className={cn('settings-tab', activeTab === tab.key && 'is-active')}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
