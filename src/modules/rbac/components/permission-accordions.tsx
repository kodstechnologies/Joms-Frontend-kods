import { useMemo } from 'react'

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

  return (
    <div className="space-y-4">
      <div className="rounded-brand-lg text-brand-muted flex flex-wrap items-center gap-4 border border-white/10 bg-white/5 px-4 py-3 text-sm">
        <span>{enabledScopes} Scopes Enabled</span>
        <span>{selected.length} Permissions Enabled</span>
        <span className="text-brand-accent">{highRiskCount} High-Risk Permissions</span>
      </div>

      <div className="rounded-brand-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-white/70">
        <p className="font-semibold text-white">Permission legend</p>
        <div className="mt-2 flex flex-wrap gap-3">
          {Object.entries(PERMISSION_LEVEL_LABELS).map(([value, label]) => (
            <span key={value}>{label}</span>
          ))}
        </div>
      </div>

      {modules.map(([moduleKey, module]) => {
        const moduleKeys = module.permissions.map((p) => p.key)
        const enabledCount = moduleKeys.filter((k) => Boolean(selectedMap[k])).length
        const allEnabled = enabledCount === moduleKeys.length && moduleKeys.length > 0

        return (
          <div
            key={moduleKey}
            className="rounded-brand-lg bg-brand-surface overflow-hidden border border-white/10"
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
              <div>
                <h3 className="text-brand-text text-base font-semibold">{module.label}</h3>
                <p className="text-brand-muted text-sm">
                  {enabledCount}/{moduleKeys.length} Enabled
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleModule(moduleKey, !allEnabled)}
                className={cn(
                  'relative h-7 w-12 rounded-full transition-colors',
                  allEnabled ? 'bg-brand-accent' : 'bg-white/20',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 size-6 rounded-full bg-white transition-transform',
                    allEnabled ? 'left-5' : 'left-0.5',
                  )}
                />
              </button>
            </div>

            <div className="divide-y divide-white/5">
              {module.permissions.map((permission) => {
                const currentLevel = selectedMap[permission.key]
                const isOn = Boolean(currentLevel)
                return (
                  <div
                    key={permission.key}
                    className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-brand-text text-sm">{permission.label}</span>
                        {permission.risk === 'high' ? (
                          <span className="bg-brand-danger/20 text-brand-danger rounded px-2 py-0.5 text-xs">
                            High Risk
                          </span>
                        ) : null}
                      </div>
                      <p className="text-brand-muted mt-1 text-xs">{permission.key}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {isOn ? (
                        <select
                          value={currentLevel}
                          onChange={(event) =>
                            setPermissionLevel(
                              permission.key,
                              event.target.value as PermissionLevel,
                            )
                          }
                          className="ui-input h-9 min-w-[180px] py-0 text-sm"
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
                        onClick={() => togglePermission(permission.key)}
                        className={cn(
                          'relative h-6 w-10 shrink-0 rounded-full transition-colors',
                          isOn ? 'bg-brand-accent' : 'bg-white/20',
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-0.5 size-5 rounded-full bg-white transition-transform',
                            isOn ? 'left-4' : 'left-0.5',
                          )}
                        />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
