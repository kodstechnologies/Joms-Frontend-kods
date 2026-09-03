import type { ModuleMetricsDefinition } from './types'
import { FINANCE_MODULE_METRICS } from './finance'
import { EXPERT_ECOSYSTEM_MODULE_METRICS } from './expert-ecosystem'
import { SUPPORT_SETTINGS_MODULE_METRICS } from './support-settings'
import { GROWTH_MODULE_METRICS } from './growth'

export type { MetricsCatalogItem, ModuleMetricsDefinition } from './types'

export const MODULE_METRICS_REGISTRY: Record<string, ModuleMetricsDefinition> = {
  ...FINANCE_MODULE_METRICS,
  ...GROWTH_MODULE_METRICS,
  ...SUPPORT_SETTINGS_MODULE_METRICS,
  ...EXPERT_ECOSYSTEM_MODULE_METRICS,
}

export const getModuleMetricsDefinition = (moduleKey: string) => MODULE_METRICS_REGISTRY[moduleKey]
