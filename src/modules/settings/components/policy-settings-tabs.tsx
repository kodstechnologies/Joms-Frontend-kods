import { useNavigate } from 'react-router-dom'

import {
  platformControlsPath,
  POLICY_SETTINGS_TABS,
  policyListPath,
} from '../utils/policy-navigation'
import { PageBreadcrumb } from '@/shared/components/navigation/page-breadcrumb'
import { cn } from '@/shared/lib/cn'

export function PolicySettingsTopTabs({ activeKey = 'platform' }: { activeKey?: string }) {
  const navigate = useNavigate()

  return (
    <nav className="settings-tabs" aria-label="Settings sections">
      <div className="settings-tabs-inner">
        {POLICY_SETTINGS_TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              if (item.routeTab) {
                navigate(platformControlsPath(), { state: { settingsTab: item.routeTab } })
              }
            }}
            className={cn('settings-tab', item.key === activeKey && 'is-active')}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}

type PolicyBreadcrumbProps = {
  current?: string
  application?: string
}

export function PolicyBreadcrumb({ current, application = 'expert' }: PolicyBreadcrumbProps) {
  return (
    <PageBreadcrumb
      className="policy-page-breadcrumb"
      items={[
        {
          label: 'Settings',
          to: platformControlsPath(),
          state: { settingsTab: 'platform' },
        },
        { label: 'Policy Management', to: policyListPath(application) },
        ...(current ? [{ label: current, isActive: true }] : []),
      ]}
    />
  )
}
