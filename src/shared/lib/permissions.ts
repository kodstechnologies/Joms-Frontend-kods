export const PERMISSION_LEVELS = {
  FULL: 'full',
  READ_ONLY: 'read_only',
  SCOPED: 'scoped',
  SECONDARY_APPROVAL: 'secondary_approval',
  RESTRICTED: 'restricted',
  SANDBOX: 'sandbox',
} as const

export type PermissionLevel = (typeof PERMISSION_LEVELS)[keyof typeof PERMISSION_LEVELS]

export const PERMISSION_LEVEL_LABELS: Record<PermissionLevel, string> = {
  [PERMISSION_LEVELS.FULL]: 'Full Access',
  [PERMISSION_LEVELS.READ_ONLY]: 'Read Only',
  [PERMISSION_LEVELS.SCOPED]: 'Within Assigned Scope Only',
  [PERMISSION_LEVELS.SECONDARY_APPROVAL]: 'Requires Secondary Approval',
  [PERMISSION_LEVELS.RESTRICTED]: 'Restricted by System',
  [PERMISSION_LEVELS.SANDBOX]: 'Sandbox / Staging Only',
}

export const PERMISSION_LEVEL_OPTIONS = Object.entries(PERMISSION_LEVEL_LABELS).map(
  ([value, label]) => ({
    value: value as PermissionLevel,
    label,
  }),
)

const LEGACY_PERMISSION_MAP: Record<string, string> = {
  'events.view': 'venues.view',
  'events.create': 'venues.create',
  'events.update': 'venues.update',
  'events.delete': 'venues.delete',
  'events.approve': 'venues.approve',
}

export type ParsedPermissionGrant = {
  key: string
  level: PermissionLevel
}

// A grant with no level is treated as full access.
export const parsePermissionGrant = (grant = ''): ParsedPermissionGrant => {
  const value = String(grant || '').trim()
  if (!value) return { key: '', level: PERMISSION_LEVELS.FULL }

  const separatorIndex = value.indexOf(':')
  if (separatorIndex === -1) {
    return { key: value, level: PERMISSION_LEVELS.FULL }
  }

  const key = value.slice(0, separatorIndex)
  const level = (value.slice(separatorIndex + 1) || PERMISSION_LEVELS.FULL) as PermissionLevel
  return { key, level }
}

// Full access is stored as the permission key alone, with no level suffix.
export const formatPermissionGrant = (
  key: string,
  level: PermissionLevel = PERMISSION_LEVELS.FULL,
) => {
  if (!key) return ''
  if (!level || level === PERMISSION_LEVELS.FULL) return key
  return `${key}:${level}`
}

// Older events permissions are read as venue permissions.
export const normalizePermissionKey = (key: string) => LEGACY_PERMISSION_MAP[key] || key

// Rewrites a stored grant so an old events permission keeps its level under venues.
export const normalizePermissionGrant = (grant: string) => {
  const { key, level } = parsePermissionGrant(grant)
  return formatPermissionGrant(normalizePermissionKey(key), level)
}

// When the same permission is listed twice, the later level is the one that counts.
export const indexPermissionGrants = (grants: string[] = []) => {
  const map = new Map<string, PermissionLevel>()
  grants.forEach((grant) => {
    const normalized = normalizePermissionGrant(grant)
    const { key, level } = parsePermissionGrant(normalized)
    if (!key) return
    map.set(key, level)
  })
  return map
}

// Read only is met by every level except restricted. Full is met only by full. Scoped and secondary approval are also met by full.
export const levelMeetsRequirement = (
  actualLevel: PermissionLevel,
  requiredLevel: PermissionLevel = PERMISSION_LEVELS.FULL,
) => {
  if (actualLevel === requiredLevel) return true
  if (requiredLevel === PERMISSION_LEVELS.READ_ONLY) {
    return actualLevel !== PERMISSION_LEVELS.RESTRICTED
  }
  if (requiredLevel === PERMISSION_LEVELS.FULL) {
    return actualLevel === PERMISSION_LEVELS.FULL
  }
  if (requiredLevel === PERMISSION_LEVELS.SCOPED) {
    return actualLevel === PERMISSION_LEVELS.FULL || actualLevel === PERMISSION_LEVELS.SCOPED
  }
  if (requiredLevel === PERMISSION_LEVELS.SECONDARY_APPROVAL) {
    return (
      actualLevel === PERMISSION_LEVELS.FULL || actualLevel === PERMISSION_LEVELS.SECONDARY_APPROVAL
    )
  }
  return actualLevel === requiredLevel
}

// A super admin always passes. A restricted grant never does, even when the screen only asks to view.
export const hasPermissionGrant = (
  grants: string[] = [],
  requiredKey: string,
  minLevel: PermissionLevel = PERMISSION_LEVELS.FULL,
  isSuperAdmin = false,
) => {
  if (isSuperAdmin) return true
  const indexed = indexPermissionGrants(grants)
  const actualLevel = indexed.get(requiredKey)
  if (!actualLevel) return false
  if (actualLevel === PERMISSION_LEVELS.RESTRICTED) return false
  return levelMeetsRequirement(actualLevel, minLevel)
}

// A super admin can open every module. A module is open when at least one of its permissions is not restricted.
export const hasModulePermissionAccess = (
  grants: string[] = [],
  modulePrefix: string,
  isSuperAdmin = false,
) => {
  if (isSuperAdmin) return true
  const prefix = modulePrefix.endsWith('.') ? modulePrefix : `${modulePrefix}.`
  return [...indexPermissionGrants(grants).entries()].some(
    ([key, level]) => key.startsWith(prefix) && level !== PERMISSION_LEVELS.RESTRICTED,
  )
}

export const grantsToMap = (grants: string[] = []) => {
  const map: Record<string, PermissionLevel> = {}
  indexPermissionGrants(grants).forEach((level, key) => {
    map[key] = level
  })
  return map
}

export const mapToGrants = (map: Record<string, PermissionLevel | undefined>) =>
  Object.entries(map)
    .filter(([, level]) => Boolean(level))
    .map(([key, level]) => formatPermissionGrant(key, level as PermissionLevel))

// Duplicate grants are dropped after old events permissions are rewritten as venues.
export const normalizeUserPermissions = (permissions: string[] = []) => [
  ...new Set(permissions.map((grant) => normalizePermissionGrant(grant))),
]

export type PermissionModuleKey =
  | 'experts'
  | 'services'
  | 'venues'
  | 'memberships'
  | 'referrals'
  | 'finance'
  | 'settings'
  | 'support'
  | 'audit'
  | 'bulk'
