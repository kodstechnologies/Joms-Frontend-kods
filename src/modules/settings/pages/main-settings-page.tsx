import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { EventManagementPanel } from '../components/event-management-panel'
import { ExpertSettingsPanel } from '../components/expert-settings-panel'
import { PlatformSettingsPanel } from '../components/platform-settings-panel'
import { SecurityAccessPanel } from '../components/security-access-panel'
import { ServiceSettingsPanel } from '../components/service-settings-panel'
import { SettingsFooterActions } from '../components/settings-footer-actions'
import { UserApplicationPanel } from '../components/user-application-panel'
import { VenueSettingsPanel } from '../components/venue-settings-panel'
import {
  useResetSettings,
  useSettingsModule,
  useUpdateSettings,
} from '../hooks/use-settings'
import {
  expertDefaults,
  platformDefaults,
  serviceDefaults,
  venueDefaults,
} from '../mock/settings.defaults'
import type {
  ExpertSettings,
  PlatformSettings,
  ServiceSettings,
  SettingsModule,
  VenueSettings,
} from '../types/settings'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

type SettingsTab =
  | 'platform'
  | 'security'
  | 'user'
  | 'expert'
  | 'event'
  | 'venue'
  | 'service'

const API_TABS: SettingsModule[] = ['platform', 'expert', 'venue', 'service']

const TABS: { key: SettingsTab; label: string }[] = [
  { key: 'platform', label: 'Platform Controls' },
  { key: 'security', label: 'Security & Access' },
  { key: 'user', label: 'User Application' },
  { key: 'expert', label: 'Expert Application' },
  { key: 'event', label: 'Event Management' },
  { key: 'venue', label: 'Venue Management' },
  { key: 'service', label: 'Service Marketplace' },
]

export function MainSettingsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<SettingsTab>('platform')

  const platformQuery = useSettingsModule('platform')
  const expertQuery = useSettingsModule('expert')
  const venueQuery = useSettingsModule('venue')
  const serviceQuery = useSettingsModule('service')

  const [platformConfig, setPlatformConfig] = useState<PlatformSettings>(platformDefaults)
  const [expertConfig, setExpertConfig] = useState<ExpertSettings>(expertDefaults)
  const [venueConfig, setVenueConfig] = useState<VenueSettings>(venueDefaults)
  const [serviceConfig, setServiceConfig] = useState<ServiceSettings>(serviceDefaults)

  useEffect(() => {
    if (platformQuery.data?.config) setPlatformConfig(platformQuery.data.config)
  }, [platformQuery.data])

  useEffect(() => {
    if (expertQuery.data?.config) setExpertConfig(expertQuery.data.config)
  }, [expertQuery.data])

  useEffect(() => {
    if (venueQuery.data?.config) setVenueConfig(venueQuery.data.config)
  }, [venueQuery.data])

  useEffect(() => {
    if (serviceQuery.data?.config) setServiceConfig(serviceQuery.data.config)
  }, [serviceQuery.data])

  const updatePlatform = useUpdateSettings('platform')
  const updateExpert = useUpdateSettings('expert')
  const updateVenue = useUpdateSettings('venue')
  const updateService = useUpdateSettings('service')
  const resetPlatform = useResetSettings('platform')
  const resetExpert = useResetSettings('expert')
  const resetVenue = useResetSettings('venue')
  const resetService = useResetSettings('service')

  const isApiTab = API_TABS.includes(activeTab as SettingsModule)

  const isLoading =
    (activeTab === 'platform' && platformQuery.isLoading) ||
    (activeTab === 'expert' && expertQuery.isLoading) ||
    (activeTab === 'venue' && venueQuery.isLoading) ||
    (activeTab === 'service' && serviceQuery.isLoading)

  const isSaving =
    updatePlatform.isPending ||
    updateExpert.isPending ||
    updateVenue.isPending ||
    updateService.isPending

  const isResetting =
    resetPlatform.isPending ||
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
    platformQuery.isError || expertQuery.isError || venueQuery.isError || serviceQuery.isError

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Settings"
        subtitle="Track revenue, payouts, and financial performance"
        actions={[
          {
            label: 'Settings Logs',
            onClick: () => navigate('/settings/logs'),
            variant: 'secondary',
          },
        ]}
      />

      <div className="rounded-2xl border border-white/10 bg-[#111111] p-3 sm:p-4">
        <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-[#0F0F0F] p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-[#1a1a1a] text-white shadow-[0_10px_30px_rgba(0,0,0,0.45)]'
                  : 'text-slate-400 hover:text-white',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && isApiTab ? (
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-8 text-sm text-slate-400">
          Loading settings...
        </div>
      ) : (
        <>
          {activeTab === 'platform' ? (
            <PlatformSettingsPanel value={platformConfig} onChange={setPlatformConfig} />
          ) : null}
          {activeTab === 'security' ? <SecurityAccessPanel /> : null}
          {activeTab === 'user' ? <UserApplicationPanel /> : null}
          {activeTab === 'expert' ? (
            <ExpertSettingsPanel value={expertConfig} onChange={setExpertConfig} />
          ) : null}
          {activeTab === 'event' ? <EventManagementPanel /> : null}
          {activeTab === 'venue' ? (
            <VenueSettingsPanel value={venueConfig} onChange={setVenueConfig} />
          ) : null}
          {activeTab === 'service' ? (
            <ServiceSettingsPanel value={serviceConfig} onChange={setServiceConfig} />
          ) : null}

          <SettingsFooterActions
            onReset={handleReset}
            onSave={handleSave}
            isSaving={isSaving}
            isResetting={isResetting}
            saveDisabled={!isApiTab}
            resetDisabled={!isApiTab}
          />
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
