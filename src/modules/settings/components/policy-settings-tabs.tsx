import { useNavigate } from 'react-router-dom'

import {
  platformControlsPath,
  POLICY_SETTINGS_TABS,
  policyListPath,
} from '../utils/policy-navigation'
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
                  navigate(platformControlsPath(), { state: { settingsTab: item.routeTab } })
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

type PolicyBreadcrumbProps = {
  current?: string
  application?: string
}

export function PolicyBreadcrumb({ current, application = 'expert' }: PolicyBreadcrumbProps) {
  const navigate = useNavigate()

  return (
    <nav
      className="policy-page-breadcrumb flex flex-wrap items-center gap-1.5"
      aria-label="Breadcrumb"
    >
      <button
        type="button"
        className="policy-breadcrumb-link"
        onClick={() => navigate(platformControlsPath(), { state: { settingsTab: 'platform' } })}
      >
        Platform Control
      </button>
      <span className="text-muted">/</span>
      <button
        type="button"
        className="policy-breadcrumb-link"
        onClick={() => navigate(policyListPath(application))}
      >
        Policy Management
      </button>
      {current ? (
        <>
          <span className="text-muted">/</span>
          <span className="policy-breadcrumb-current">{current}</span>
        </>
      ) : null}
    </nav>
  )
}
