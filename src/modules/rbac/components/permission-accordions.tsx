import { useMemo } from 'react'

import type { PermissionCatalog } from '../types/rbac'
import { cn } from '@/shared/lib/cn'

type PermissionAccordionsProps = {
  catalog: PermissionCatalog
  selected: string[]
  onChange: (permissions: string[]) => void
}

export function PermissionAccordions({ catalog, selected, onChange }: PermissionAccordionsProps) {
  const modules = useMemo(() => Object.entries(catalog), [catalog])

  const togglePermission = (key: string) => {
    if (selected.includes(key)) {
      onChange(selected.filter((p) => p !== key))
      return
    }
    onChange([...selected, key])
  }

  const toggleModule = (moduleKey: string, enabled: boolean) => {
    const keys = catalog[moduleKey]?.permissions.map((p) => p.key) ?? []
    if (enabled) {
      onChange(Array.from(new Set([...selected, ...keys])))
      return
    }
    onChange(selected.filter((p) => !keys.includes(p)))
  }

  const enabledScopes = modules.filter(([, mod]) =>
    mod.permissions.some((p) => selected.includes(p.key)),
  ).length

  const highRiskCount = modules.reduce((count, [, mod]) => {
    return (
      count +
      mod.permissions.filter((p) => p.risk === 'high' && selected.includes(p.key)).length
    )
  }, 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
        <span>{enabledScopes} Scopes Enabled</span>
        <span>{selected.length} Permissions Enabled</span>
        <span className="text-amber-400">{highRiskCount} High-Risk Permissions</span>
      </div>

      {modules.map(([moduleKey, module]) => {
        const moduleKeys = module.permissions.map((p) => p.key)
        const enabledCount = moduleKeys.filter((k) => selected.includes(k)).length
        const allEnabled = enabledCount === moduleKeys.length && moduleKeys.length > 0

        return (
          <div
            key={moduleKey}
            className="overflow-hidden rounded-xl border border-white/10 bg-[#141414]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-white">{module.label}</h3>
                <p className="text-sm text-slate-400">
                  {enabledCount}/{moduleKeys.length} Enabled
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleModule(moduleKey, !allEnabled)}
                className={cn(
                  'relative h-7 w-12 rounded-full transition-colors',
                  allEnabled ? 'bg-amber-400' : 'bg-slate-600',
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
                const isOn = selected.includes(permission.key)
                return (
                  <div
                    key={permission.key}
                    className="flex items-center justify-between gap-4 px-5 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-200">{permission.label}</span>
                      {permission.risk === 'high' ? (
                        <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-300">
                          High Risk
                        </span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePermission(permission.key)}
                      className={cn(
                        'relative h-6 w-10 rounded-full transition-colors',
                        isOn ? 'bg-amber-400' : 'bg-slate-600',
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
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
