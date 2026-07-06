import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { ExpertSettingsPanel } from '../components/expert-settings-panel'
import { ServiceSettingsPanel } from '../components/service-settings-panel'
import { SettingsFooterActions } from '../components/settings-footer-actions'
import { VenueSettingsPanel } from '../components/venue-settings-panel'
import {
  useResetSettings,
  useSettingsModule,
  useUpdateSettings,
} from '../hooks/use-settings'
import {
  expertDefaults,
  serviceDefaults,
  venueDefaults,
} from '../mock/settings.defaults'
import type {
  ExpertSettings,
  ServiceSettings,
  SettingsModule,
  VenueSettings,
} from '../types/settings'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

const TABS: { key: SettingsModule; label: string }[] = [
  { key: 'expert', label: 'Expert Application' },
  { key: 'venue', label: 'Venue Management' },
  { key: 'service', label: 'Service Marketplace' },
]

export function MainSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsModule>('expert')

  const expertQuery = useSettingsModule('expert')
  const venueQuery = useSettingsModule('venue')
  const serviceQuery = useSettingsModule('service')

  const [expertConfig, setExpertConfig] = useState<ExpertSettings>(expertDefaults)
  const [venueConfig, setVenueConfig] = useState<VenueSettings>(venueDefaults)
  const [serviceConfig, setServiceConfig] = useState<ServiceSettings>(serviceDefaults)

  useEffect(() => {
    if (expertQuery.data?.config) setExpertConfig(expertQuery.data.config)
  }, [expertQuery.data])

  useEffect(() => {
    if (venueQuery.data?.config) setVenueConfig(venueQuery.data.config)
  }, [venueQuery.data])

  useEffect(() => {
    if (serviceQuery.data?.config) setServiceConfig(serviceQuery.data.config)
  }, [serviceQuery.data])

  const updateExpert = useUpdateSettings('expert')
  const updateVenue = useUpdateSettings('venue')
  const updateService = useUpdateSettings('service')
  const resetExpert = useResetSettings('expert')
  const resetVenue = useResetSettings('venue')
  const resetService = useResetSettings('service')

  const isLoading =
    (activeTab === 'expert' && expertQuery.isLoading) ||
    (activeTab === 'venue' && venueQuery.isLoading) ||
    (activeTab === 'service' && serviceQuery.isLoading)

  const isSaving =
    updateExpert.isPending || updateVenue.isPending || updateService.isPending
  const isResetting =
    resetExpert.isPending || resetVenue.isPending || resetService.isPending

  const handleSave = async () => {
    try {
      if (activeTab === 'expert') {
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
    try {
      if (activeTab === 'expert') {
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

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Settings"
        subtitle="Configure expert, venue, and service marketplace controls"
        actions={[
          {
            label: 'Settings Logs',
            onClick: () => toast.message('Settings logs coming soon'),
            variant: 'secondary',
          },
        ]}
      />

      <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-[#111111] p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-[#1a1a1a] text-white'
                : 'text-slate-400 hover:text-white',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-8 text-sm text-slate-400">
          Loading settings...
        </div>
      ) : (
        <>
          {activeTab === 'expert' ? (
            <ExpertSettingsPanel value={expertConfig} onChange={setExpertConfig} />
          ) : null}
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
          />
        </>
      )}

      {(expertQuery.isError || venueQuery.isError || serviceQuery.isError) && !isLoading ? (
        <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <span>Could not load live settings. Showing local defaults until the service is available.</span>
          <Button
            variant="secondary"
            onClick={() => {
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
