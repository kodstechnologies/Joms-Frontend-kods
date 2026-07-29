import { useNavigate } from 'react-router-dom'

import { POLICY_SETTINGS_TABS } from '../utils/policy-navigation'
import { cn } from '@/shared/lib/cn'

export function PolicySettingsTopTabs({ activeKey = 'expert' }: { activeKey?: string }) {
  const navigate = useNavigate()

  return (
    <div className="bg-brand-surface rounded-xl border border-white/10 p-2">
      <div className="bg-brand-bg overflow-x-auto rounded-lg p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max min-w-full gap-1">
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
                'text-body-sm shrink-0 rounded-md px-3 py-1.5 font-medium whitespace-nowrap transition-colors',
                item.key === activeKey
                  ? 'bg-brand-surface border border-white/20 text-white'
                  : 'text-muted hover:text-white',
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
  return <p className="text-body-sm text-muted">{segments.join(' / ')}</p>
}
