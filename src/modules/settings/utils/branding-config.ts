import { platformDefaults } from '@/modules/settings/config/settings.config'
import type {
  BackupSettings,
  ExpertSettings,
  FinanceTransactionalSettings,
  ModuleSettingsMap,
  NotificationSettings,
  PlatformSettings,
  SecuritySettings,
  ServiceSettings,
  SettingsModule,
  SettingsResponse,
  VenueSettings,
} from '@/modules/settings/types/settings'
import {
  backupDefaults,
  expertDefaults,
  financeDefaults,
  notificationsDefaults,
  securityDefaults,
  serviceDefaults,
  venueDefaults,
} from '@/modules/settings/config/settings.config'

export const GENERAL_BRANDING = {
  productTitle: 'Command Operations Centre',
  applicationName: 'JOMS Applications',
  defaultFaviconUrl: '/favicon.ico',
  timezone: platformDefaults.displayPreferences.timezone,
  dateTimeFormat: platformDefaults.displayPreferences.dateTimeFormat,
} as const

export type BrandingState = {
  applicationName: string
  logoUrl: string
  faviconUrl: string
  timezone: string
  dateTimeFormat: string
  productTitle: string
}

export const DEFAULT_BRANDING: BrandingState = {
  applicationName: GENERAL_BRANDING.applicationName,
  logoUrl: '',
  faviconUrl: GENERAL_BRANDING.defaultFaviconUrl,
  timezone: GENERAL_BRANDING.timezone,
  dateTimeFormat: GENERAL_BRANDING.dateTimeFormat,
  productTitle: GENERAL_BRANDING.productTitle,
}

const defaultsByModule: ModuleSettingsMap = {
  platform: platformDefaults,
  security: securityDefaults,
  notifications: notificationsDefaults,
  finance: financeDefaults,
  backup: backupDefaults,
  expert: expertDefaults,
  venue: venueDefaults,
  service: serviceDefaults,
}

export const getModuleDefaults = <M extends SettingsModule>(module: M): ModuleSettingsMap[M] =>
  structuredClone(defaultsByModule[module])

export const getModulePlaceholder = <M extends SettingsModule>(
  module: M,
): SettingsResponse<ModuleSettingsMap[M]> => ({
  module,
  config: getModuleDefaults(module),
  updatedAt: null,
  updatedBy: null,
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const mergeWithDefaults = <T>(defaults: T, incoming: unknown): T => {
  if (incoming == null) return defaults
  if (!isRecord(defaults) || !isRecord(incoming)) return (incoming as T) ?? defaults

  const merged: Record<string, unknown> = { ...defaults }
  for (const key of Object.keys(defaults)) {
    const value = incoming[key]
    if (value == null) continue
    const defaultValue = merged[key]
    merged[key] =
      isRecord(defaultValue) && isRecord(value) ? mergeWithDefaults(defaultValue, value) : value
  }
  return merged as T
}

export type BrandingConfigSource = {
  applicationSettings?: {
    applicationName?: string
    logoUrl?: string
    faviconUrl?: string
  } | null
  displayPreferences?: {
    timezone?: string
    dateTimeFormat?: string
  } | null
}

export const resolveBranding = (
  config?: BrandingConfigSource | PlatformSettings | null,
  options?: { preferDefaultsOnEmpty?: boolean },
): BrandingState => {
  const preferDefaults = options?.preferDefaultsOnEmpty !== false
  const application = config?.applicationSettings
  const display = config?.displayPreferences

  const applicationName =
    application?.applicationName?.trim() || (preferDefaults ? DEFAULT_BRANDING.applicationName : '')

  return {
    applicationName: applicationName || DEFAULT_BRANDING.applicationName,
    logoUrl: application?.logoUrl?.trim() || '',
    faviconUrl: application?.faviconUrl?.trim() || DEFAULT_BRANDING.faviconUrl,
    timezone: display?.timezone?.trim() || DEFAULT_BRANDING.timezone,
    dateTimeFormat: display?.dateTimeFormat?.trim() || DEFAULT_BRANDING.dateTimeFormat,
    productTitle: DEFAULT_BRANDING.productTitle,
  }
}

export type {
  BackupSettings,
  ExpertSettings,
  FinanceTransactionalSettings,
  NotificationSettings,
  SecuritySettings,
  ServiceSettings,
  VenueSettings,
}
