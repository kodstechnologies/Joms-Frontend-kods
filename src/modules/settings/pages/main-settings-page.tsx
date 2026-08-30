import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { BackupRestorePanel } from '../components/backup-restore-panel'
import { ExpertSettingsPanel } from '../components/expert-settings-panel'
import { FinanceTransactionalPanel } from '../components/finance-transactional-panel'
import { IncidentTrackingPanel } from '../components/incident-tracking-panel'
import { NotificationSettingsPanel } from '../components/notification-settings-panel'
import { PlatformSettingsPanel } from '../components/platform-settings-panel'
import { SecurityAccessPanel } from '../components/security-access-panel'
import { ServiceSettingsPanel } from '../components/service-settings-panel'
import { SettingsFooterActions } from '../components/settings-footer-actions'
import { VenueSettingsPanel } from '../components/venue-settings-panel'
import { TemplatesPage } from './templates-page'
import {
  useResetSettings,
  useSettingsDraft,
  useSettingsModule,
  useUpdateSettings,
} from '../hooks/use-settings'
import {
  expertDefaults,
  financeDefaults,
  notificationsDefaults,
  platformDefaults,
  securityDefaults,
  serviceDefaults,
  venueDefaults,
} from '../mock/settings.defaults'
import { normalizeSecuritySettings, countEnabledMfaMethods } from '../utils/security-settings'
import type { SettingsModule } from '../types/settings'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

type SettingsTab =
  | 'platform'
  | 'security'
  | 'notifications'
  | 'finance'
  | 'incident'
  | 'backup'
  | 'templates'
  | 'expert'
  | 'venue'
  | 'service'

const API_TABS: SettingsModule[] = [
  'platform',
  'security',
  'notifications',
  'finance',
  'expert',
  'venue',
  'service',
]

const STATIC_TABS: SettingsTab[] = ['incident', 'backup', 'templates']

const TABS: { key: SettingsTab; label: string }[] = [
  { key: 'platform', label: 'Platform Controls' },
  { key: 'security', label: 'Security & Access' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'finance', label: 'Finance & Transactional' },
  { key: 'incident', label: 'Incident Tracking' },
  { key: 'backup', label: 'Backup Configuration' },
  { key: 'templates', label: 'Templates' },
  { key: 'expert', label: 'Expert Application' },
  { key: 'venue', label: 'Venue Management' },
  { key: 'service', label: 'Service Marketplace' },
]

export function MainSettingsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<SettingsTab>('platform')
  const [hydratedLocationState, setHydratedLocationState] = useState(location.state)
  const [hydratedTabQuery, setHydratedTabQuery] = useState(searchParams.get('tab'))

  const tabFromQuery = searchParams.get('tab') as SettingsTab | null
  if (tabFromQuery && tabFromQuery !== hydratedTabQuery) {
    setHydratedTabQuery(tabFromQuery)
    if (TABS.some((tab) => tab.key === tabFromQuery)) {
      setActiveTab(tabFromQuery)
    }
  }

  if (location.state !== hydratedLocationState) {
    setHydratedLocationState(location.state)
    const routedTab = (location.state as { settingsTab?: SettingsTab } | null)?.settingsTab
    if (routedTab && TABS.some((tab) => tab.key === routedTab)) {
      setActiveTab(routedTab)
    }
  }

  const platformQuery = useSettingsModule('platform')
  const securityQuery = useSettingsModule('security')
  const notificationsQuery = useSettingsModule('notifications')
  const financeQuery = useSettingsModule('finance')
  const expertQuery = useSettingsModule('expert')
  const venueQuery = useSettingsModule('venue')
  const serviceQuery = useSettingsModule('service')

  const [platformConfig, setPlatformConfig] = useSettingsDraft(platformQuery.data, platformDefaults)
  const [securityConfig, setSecurityConfig] = useSettingsDraft(
    securityQuery.data,
    securityDefaults,
    normalizeSecuritySettings,
  )
  const [notificationsConfig, setNotificationsConfig] = useSettingsDraft(
    notificationsQuery.data,
    notificationsDefaults,
  )
  const [financeConfig, setFinanceConfig] = useSettingsDraft(financeQuery.data, financeDefaults)
  const [expertConfig, setExpertConfig] = useSettingsDraft(expertQuery.data, expertDefaults)
  const [venueConfig, setVenueConfig] = useSettingsDraft(venueQuery.data, venueDefaults)
  const [serviceConfig, setServiceConfig] = useSettingsDraft(serviceQuery.data, serviceDefaults)

  const updatePlatform = useUpdateSettings('platform')
  const updateSecurity = useUpdateSettings('security')
  const updateNotifications = useUpdateSettings('notifications')
  const updateFinance = useUpdateSettings('finance')
  const updateExpert = useUpdateSettings('expert')
  const updateVenue = useUpdateSettings('venue')
  const updateService = useUpdateSettings('service')
  const resetPlatform = useResetSettings('platform')
  const resetSecurity = useResetSettings('security')
  const resetNotifications = useResetSettings('notifications')
  const resetFinance = useResetSettings('finance')
  const resetExpert = useResetSettings('expert')
  const resetVenue = useResetSettings('venue')
  const resetService = useResetSettings('service')

  const isApiTab = API_TABS.includes(activeTab as SettingsModule)
  const showFooter = isApiTab && !STATIC_TABS.includes(activeTab)

  const isLoading =
    (activeTab === 'platform' && platformQuery.isLoading) ||
    (activeTab === 'security' && securityQuery.isLoading) ||
    (activeTab === 'notifications' && notificationsQuery.isLoading) ||
    (activeTab === 'finance' && financeQuery.isLoading) ||
    (activeTab === 'expert' && expertQuery.isLoading) ||
    (activeTab === 'venue' && venueQuery.isLoading) ||
    (activeTab === 'service' && serviceQuery.isLoading)

  const isSaving =
    updatePlatform.isPending ||
    updateSecurity.isPending ||
    updateNotifications.isPending ||
    updateFinance.isPending ||
    updateExpert.isPending ||
    updateVenue.isPending ||
    updateService.isPending

  const isResetting =
    resetPlatform.isPending ||
    resetSecurity.isPending ||
    resetNotifications.isPending ||
    resetFinance.isPending ||
    resetExpert.isPending ||
    resetVenue.isPending ||
    resetService.isPending

  const handleSave = async () => {
    if (!isApiTab) {
      toast.message('This tab is static for now')
      return
    }

    try {
      if (activeTab === 'platform') {
        await updatePlatform.mutateAsync(platformConfig)
      } else if (activeTab === 'security') {
        const normalizedSecurity = normalizeSecuritySettings(securityConfig)
        if (countEnabledMfaMethods(normalizedSecurity.mfa) === 0) {
          toast.error('Enable at least one MFA method before saving')
          return
        }
        await updateSecurity.mutateAsync(normalizedSecurity)
      } else if (activeTab === 'notifications') {
        await updateNotifications.mutateAsync(notificationsConfig)
      } else if (activeTab === 'finance') {
        await updateFinance.mutateAsync(financeConfig)
      } else if (activeTab === 'expert') {
        await updateExpert.mutateAsync(expertConfig)
      } else if (activeTab === 'venue') {
        await updateVenue.mutateAsync(venueConfig)
      } else {
        await updateService.mutateAsync(serviceConfig)
      }
      toast.success(`${TABS.find((t) => t.key === activeTab)?.label} settings saved`)
    } catch {
      toast.error('Failed to save settings')
    }
  }

  const handleReset = async () => {
    if (!isApiTab) {
      toast.message('This tab is static for now')
      return
    }

    try {
      if (activeTab === 'platform') {
        const result = await resetPlatform.mutateAsync()
        setPlatformConfig(result.config)
      } else if (activeTab === 'security') {
        const result = await resetSecurity.mutateAsync()
        setSecurityConfig(result.config)
      } else if (activeTab === 'notifications') {
        const result = await resetNotifications.mutateAsync()
        setNotificationsConfig(result.config)
      } else if (activeTab === 'finance') {
        const result = await resetFinance.mutateAsync()
        setFinanceConfig(result.config)
      } else if (activeTab === 'expert') {
        const result = await resetExpert.mutateAsync()
        setExpertConfig(result.config)
      } else if (activeTab === 'venue') {
        const result = await resetVenue.mutateAsync()
        setVenueConfig(result.config)
      } else {
        const result = await resetService.mutateAsync()
        setServiceConfig(result.config)
      }
      toast.success('Settings reset to defaults')
    } catch {
      toast.error('Failed to reset settings')
    }
  }

  const hasQueryError =
    platformQuery.isError ||
    securityQuery.isError ||
    notificationsQuery.isError ||
    financeQuery.isError ||
    expertQuery.isError ||
    venueQuery.isError ||
    serviceQuery.isError

  return (
    <div className="space-y-6">
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

      <nav className="settings-tabs" aria-label="Settings sections">
        <div className="settings-tabs-inner">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn('settings-tab', activeTab === tab.key && 'is-active')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {isLoading && isApiTab ? (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-[#141414] p-6 sm:p-8">
          <div className="h-5 w-48 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-72 animate-pulse rounded bg-white/5" />
          <div className="mt-6 space-y-4">
            <div className="h-12 w-full animate-pulse rounded-xl border border-white/5 bg-white/5" />
            <div className="h-12 w-full animate-pulse rounded-xl border border-white/5 bg-white/5" />
            <div className="h-12 w-full animate-pulse rounded-xl border border-white/5 bg-white/5" />
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'platform' ? (
            <PlatformSettingsPanel value={platformConfig} onChange={setPlatformConfig} />
          ) : null}
          {activeTab === 'security' ? (
            <SecurityAccessPanel value={securityConfig} onChange={setSecurityConfig} />
          ) : null}
          {activeTab === 'notifications' ? (
            <NotificationSettingsPanel
              value={notificationsConfig}
              onChange={setNotificationsConfig}
            />
          ) : null}
          {activeTab === 'finance' ? (
            <FinanceTransactionalPanel value={financeConfig} onChange={setFinanceConfig} />
          ) : null}
          {activeTab === 'incident' ? (
            <IncidentTrackingPanel highlightIncidentId={searchParams.get('incidentId')} />
          ) : null}
          {activeTab === 'backup' ? <BackupRestorePanel /> : null}
          {activeTab === 'templates' ? <TemplatesPage embedded /> : null}
          {activeTab === 'expert' ? (
            <ExpertSettingsPanel value={expertConfig} onChange={setExpertConfig} />
          ) : null}
          {activeTab === 'venue' ? (
            <VenueSettingsPanel value={venueConfig} onChange={setVenueConfig} />
          ) : null}
          {activeTab === 'service' ? (
            <ServiceSettingsPanel value={serviceConfig} onChange={setServiceConfig} />
          ) : null}

          {showFooter ? (
            <SettingsFooterActions
              onReset={handleReset}
              onSave={handleSave}
              isSaving={isSaving}
              isResetting={isResetting}
            />
          ) : null}
        </>
      )}

      {hasQueryError && !isLoading ? (
        <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <span>
            Could not load live settings. Showing local defaults until the service is available.
          </span>
          <Button
            variant="secondary"
            onClick={() => {
              void platformQuery.refetch()
              void securityQuery.refetch()
              void notificationsQuery.refetch()
              void financeQuery.refetch()
              void expertQuery.refetch()
              void venueQuery.refetch()
              void serviceQuery.refetch()
            }}
          >
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  )
}
