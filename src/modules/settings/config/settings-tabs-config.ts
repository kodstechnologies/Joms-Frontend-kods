import type { SettingsModule } from '../types/settings'

export type SettingsTab =
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

export const SETTINGS_API_TABS: SettingsModule[] = [
  'platform',
  'security',
  'notifications',
  'finance',
  'expert',
  'venue',
  'service',
]

export const SETTINGS_STATIC_TABS: SettingsTab[] = ['incident', 'backup', 'templates']

export const SETTINGS_TABS: { key: SettingsTab; label: string }[] = [
  { key: 'platform', label: 'Platform Controls' },
  { key: 'security', label: 'Security & Access' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'finance', label: 'Finance & Transactional Settings' },
  { key: 'incident', label: 'Incident Tracking' },
  { key: 'backup', label: 'Backup Configuration' },
  { key: 'templates', label: 'Templates' },
  { key: 'expert', label: 'Expert Application' },
  { key: 'venue', label: 'Venue Management' },
  { key: 'service', label: 'Service Marketplace' },
]

export function isSettingsTab(value: string | null | undefined): value is SettingsTab {
  return SETTINGS_TABS.some((tab) => tab.key === value)
}
