import { AlertTriangle, ChevronDown, Layers, Shield } from 'lucide-react'
import { useMemo, useState } from 'react'

import type { PermissionCatalog } from '../types/rbac'
import {
  PERMISSION_LEVEL_LABELS,
  PERMISSION_LEVELS,
  grantsToMap,
  mapToGrants,
  type PermissionLevel,
} from '@/shared/lib/permissions'
import { cn } from '@/shared/lib/cn'

type PermissionAccordionsProps = {
  catalog: PermissionCatalog
  selected: string[]
  onChange: (permissions: string[]) => void
}

const LEVEL_SHORT_LABEL: Partial<Record<PermissionLevel, string>> = {
  [PERMISSION_LEVELS.FULL]: 'Full',
  [PERMISSION_LEVELS.READ_ONLY]: 'Read',
  [PERMISSION_LEVELS.SCOPED]: 'Scoped',
  [PERMISSION_LEVELS.SECONDARY_APPROVAL]: 'Approval',
  [PERMISSION_LEVELS.RESTRICTED]: 'Restricted',
  [PERMISSION_LEVELS.SANDBOX]: 'Sandbox',
}

export function PermissionAccordions({ catalog, selected, onChange }: PermissionAccordionsProps) {
  const modules = useMemo(() => Object.entries(catalog), [catalog])
  const selectedMap = useMemo(() => grantsToMap(selected), [selected])
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({})

  const setPermissionLevel = (key: string, level?: PermissionLevel) => {
    const next = { ...selectedMap }
    if (!level) {
      delete next[key]
    } else {
      next[key] = level
    }
    onChange(mapToGrants(next))
  }

  const togglePermission = (key: string) => {
    if (selectedMap[key]) {
      setPermissionLevel(key, undefined)
      return
    }
    setPermissionLevel(key, PERMISSION_LEVELS.FULL)
  }

  const toggleModule = (moduleKey: string, enabled: boolean) => {
    const keys = catalog[moduleKey]?.permissions.map((p) => p.key) ?? []
    const next = { ...selectedMap }
    keys.forEach((key) => {
      if (enabled) {
        next[key] = next[key] || PERMISSION_LEVELS.FULL
      } else {
        delete next[key]
      }
    })
    onChange(mapToGrants(next))
  }

  const enabledScopes = modules.filter(([, mod]) =>
    mod.permissions.some((p) => Boolean(selectedMap[p.key])),
  ).length

  const highRiskCount = modules.reduce((count, [, mod]) => {
    return (
      count +
      mod.permissions.filter(
        (p) => (p.risk === 'high' || p.risk === 'very_high') && Boolean(selectedMap[p.key]),
      ).length
    )
  }, 0)

  const firstModuleKey = modules[0]?.[0]
  const isModuleOpen = (moduleKey: string) => {
    if (moduleKey in openModules) return Boolean(openModules[moduleKey])
    return moduleKey === firstModuleKey
  }

  return (
    <div className="create-role-perm">
      <div className="create-role-perm-summary">
        <span className="create-role-perm-summary-item">
          <Layers className="size-4 shrink-0" aria-hidden="true" />
          {enabledScopes} Scopes Enabled
        </span>
        <span className="create-role-perm-summary-item">
          <Shield className="size-4 shrink-0" aria-hidden="true" />
          {selected.length} Permissions Enabled
        </span>
        <span className="create-role-perm-summary-item is-risk">
          <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
          {highRiskCount} High-Risk Permissions
        </span>
      </div>

      <div className="create-role-perm-modules">
        {modules.map(([moduleKey, module]) => {
          const moduleKeys = module.permissions.map((p) => p.key)
          const enabledCount = moduleKeys.filter((k) => Boolean(selectedMap[k])).length
          const allEnabled = enabledCount === moduleKeys.length && moduleKeys.length > 0
          const open = isModuleOpen(moduleKey)

          return (
            <div key={moduleKey} className="create-role-perm-module">
              <div className="create-role-perm-module-header">
                <button
                  type="button"
                  className="create-role-perm-module-toggle"
                  aria-expanded={open}
                  onClick={() =>
                    setOpenModules((prev) => ({
                      ...prev,
                      [moduleKey]: !isModuleOpen(moduleKey),
                    }))
                  }
                >
                  <ChevronDown
                    className={cn('create-role-perm-chevron size-4 shrink-0', open && 'is-open')}
                    aria-hidden="true"
                  />
                  <span className="create-role-perm-module-name">{module.label}</span>
                  <span className="create-role-perm-count-badge">
                    {enabledCount}/{moduleKeys.length} Enabled
                  </span>
                </button>

                <button
                  type="button"
                  aria-label={`${allEnabled ? 'Disable' : 'Enable'} all ${module.label} permissions`}
                  onClick={() => toggleModule(moduleKey, !allEnabled)}
                  className={cn('create-role-switch', allEnabled && 'is-on')}
                >
                  <span className="create-role-switch-knob" />
                </button>
              </div>

              {open ? (
                <div className="create-role-perm-module-body">
                  <p className="create-role-perm-section-label">Permissions</p>
                  <div className="create-role-perm-rows">
                    {module.permissions.map((permission) => {
                      const currentLevel = selectedMap[permission.key]
                      const isOn = Boolean(currentLevel)
                      const isHighRisk =
                        permission.risk === 'high' || permission.risk === 'very_high'

                      return (
                        <div key={permission.key} className="create-role-perm-row">
                          <div className="create-role-perm-row-meta">
                            <span className="create-role-perm-row-name">{permission.label}</span>
                            {isHighRisk ? (
                              <span className="create-role-high-risk-badge">High Risk</span>
                            ) : null}
                          </div>

                          <div className="create-role-perm-row-controls">
                            {isOn ? (
                              <select
                                value={currentLevel}
                                aria-label={`${permission.label} access level`}
                                onChange={(event) =>
                                  setPermissionLevel(
                                    permission.key,
                                    event.target.value as PermissionLevel,
                                  )
                                }
                                className="create-role-level-select"
                              >
                                {Object.entries(PERMISSION_LEVEL_LABELS).map(([value, label]) => (
                                  <option key={value} value={value}>
                                    {LEVEL_SHORT_LABEL[value as PermissionLevel] || label}
                                  </option>
                                ))}
                              </select>
                            ) : null}

                            <button
                              type="button"
                              aria-label={`${isOn ? 'Disable' : 'Enable'} ${permission.label}`}
                              onClick={() => togglePermission(permission.key)}
                              className={cn('create-role-switch', isOn && 'is-on')}
                            >
                              <span className="create-role-switch-knob" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
