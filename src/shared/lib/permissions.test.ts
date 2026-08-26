import { describe, expect, it } from 'vitest'

import {
  formatPermissionGrant,
  grantsToMap,
  hasModulePermissionAccess,
  hasPermissionGrant,
  indexPermissionGrants,
  levelMeetsRequirement,
  mapToGrants,
  normalizePermissionGrant,
  normalizePermissionKey,
  normalizeUserPermissions,
  parsePermissionGrant,
  PERMISSION_LEVELS,
  PERMISSION_LEVEL_OPTIONS,
} from './permissions'

describe('permissions', () => {
  it('parses, formats, and normalizes grants', () => {
    expect(parsePermissionGrant('')).toEqual({ key: '', level: PERMISSION_LEVELS.FULL })
    expect(parsePermissionGrant('finance.view')).toEqual({
      key: 'finance.view',
      level: PERMISSION_LEVELS.FULL,
    })
    expect(parsePermissionGrant('finance.view:read_only').level).toBe(PERMISSION_LEVELS.READ_ONLY)
    expect(formatPermissionGrant('')).toBe('')
    expect(formatPermissionGrant('finance.view')).toBe('finance.view')
    expect(formatPermissionGrant('finance.view', PERMISSION_LEVELS.SCOPED)).toBe(
      'finance.view:scoped',
    )
    expect(normalizePermissionKey('events.view')).toBe('venues.view')
    expect(normalizePermissionGrant('events.update:read_only')).toBe('venues.update:read_only')
    expect(indexPermissionGrants(['', 'finance.view:full']).get('finance.view')).toBe('full')
    expect(PERMISSION_LEVEL_OPTIONS.length).toBeGreaterThan(3)
  })

  it('evaluates level and module access', () => {
    expect(levelMeetsRequirement(PERMISSION_LEVELS.FULL, PERMISSION_LEVELS.FULL)).toBe(true)
    expect(levelMeetsRequirement(PERMISSION_LEVELS.SCOPED, PERMISSION_LEVELS.READ_ONLY)).toBe(true)
    expect(levelMeetsRequirement(PERMISSION_LEVELS.RESTRICTED, PERMISSION_LEVELS.READ_ONLY)).toBe(
      false,
    )
    expect(levelMeetsRequirement(PERMISSION_LEVELS.FULL, PERMISSION_LEVELS.SCOPED)).toBe(true)
    expect(
      levelMeetsRequirement(PERMISSION_LEVELS.FULL, PERMISSION_LEVELS.SECONDARY_APPROVAL),
    ).toBe(true)
    expect(levelMeetsRequirement(PERMISSION_LEVELS.SANDBOX, PERMISSION_LEVELS.SCOPED)).toBe(false)

    expect(hasPermissionGrant([], 'finance.view', PERMISSION_LEVELS.FULL, true)).toBe(true)
    expect(hasPermissionGrant(['finance.view'], 'finance.view')).toBe(true)
    expect(hasPermissionGrant(['finance.view:restricted'], 'finance.view')).toBe(false)
    expect(hasPermissionGrant(['other.view'], 'finance.view')).toBe(false)
    expect(hasModulePermissionAccess([], 'finance', true)).toBe(true)
    expect(hasModulePermissionAccess(['finance.view'], 'finance')).toBe(true)
    expect(hasModulePermissionAccess(['finance.view:restricted'], 'finance.')).toBe(false)
    expect(grantsToMap(['finance.view:read_only'])['finance.view']).toBe(
      PERMISSION_LEVELS.READ_ONLY,
    )
    expect(mapToGrants({ 'finance.view': PERMISSION_LEVELS.FULL, skip: undefined })).toEqual([
      'finance.view',
    ])
    expect(normalizeUserPermissions(['events.view', 'events.view'])).toEqual(['venues.view'])
  })
})
