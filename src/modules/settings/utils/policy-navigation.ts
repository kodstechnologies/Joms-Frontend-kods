export const POLICY_SETTINGS_TABS: Array<{
  key: 'platform' | 'security' | 'user' | 'expert' | 'event' | 'venue' | 'service'
  label: string
  routeTab?: string
}> = [
  { key: 'platform', label: 'Platform Controls', routeTab: 'platform' },
  { key: 'security', label: 'Security & Access', routeTab: 'security' },
  { key: 'user', label: 'User Application' },
  { key: 'expert', label: 'Expert Application', routeTab: 'expert' },
  { key: 'event', label: 'Event Management' },
  { key: 'venue', label: 'Venue Management', routeTab: 'venue' },
  { key: 'service', label: 'Service Marketplace', routeTab: 'service' },
]

export function policyListPath(application = 'expert') {
  return `/settings/policies?application=${application}`
}

export function policyViewPath(id: string, application = 'expert', versionId?: string) {
  const params = new URLSearchParams({ application })
  if (versionId) params.set('versionId', versionId)
  return `/settings/policies/${id}/view?${params.toString()}`
}

export function policyEditPath(id: string, application = 'expert') {
  return `/settings/policies/${id}/edit?application=${application}`
}

export function policyTimelinePath(id: string, application = 'expert') {
  return `/settings/policies/${id}/timeline?application=${application}`
}

export function policyCreatePath(application = 'expert') {
  return `/settings/policies/create?application=${application}`
}

export function platformControlsPath() {
  return '/settings/main'
}
