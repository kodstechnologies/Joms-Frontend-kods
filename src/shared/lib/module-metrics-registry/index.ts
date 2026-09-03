import type { ModuleMetricsDefinition } from './types'
import { FINANCE_MODULE_METRICS } from './finance'
import { EXPERT_ECOSYSTEM_MODULE_METRICS } from './expert-ecosystem'
import { SUPPORT_SETTINGS_MODULE_METRICS } from './support-settings'
import { GROWTH_MODULE_METRICS } from './growth'

export type { MetricsCatalogItem, ModuleMetricsDefinition } from './types'

const DOMAIN_METRICS = [
  FINANCE_MODULE_METRICS,
  GROWTH_MODULE_METRICS,
  SUPPORT_SETTINGS_MODULE_METRICS,
  EXPERT_ECOSYSTEM_MODULE_METRICS,
] as const

export function getModuleMetricsDefinition(moduleKey: string) {
  for (const domain of DOMAIN_METRICS) {
    const definition = domain[moduleKey]
    if (definition) return definition
  }
  return undefined
}

/** Flat key→definition map for tests and callers that iterate all modules. */
export const MODULE_METRICS_REGISTRY: Record<string, ModuleMetricsDefinition> = Object.assign(
  {},
  ...DOMAIN_METRICS,
)
