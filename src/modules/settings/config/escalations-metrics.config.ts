import { deriveMetricExports } from '@/shared/lib/define-metrics-catalog'

export const ESCALATIONS_MODULE_KEY = 'escalations'

export type EscalationsMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

export const ESCALATIONS_METRICS_CATALOG: EscalationsMetricCatalogItem[] = [
  {
    id: 'total-escalation',
    label: 'Total Escalation',
    type: 'Count',
    description: 'Total escalation cases',
    defaultActive: true,
  },
  {
    id: 'open-escalation',
    label: 'Open Escalation',
    type: 'Count',
    description: 'Currently open escalation cases',
    defaultActive: true,
  },
  {
    id: 'in-review',
    label: 'In Review',
    type: 'Count',
    description: 'Escalations currently in review',
    defaultActive: true,
  },
  {
    id: 'resolved',
    label: 'Resolved',
    type: 'Count',
    description: 'Resolved escalation cases',
    defaultActive: true,
  },
]

const derived = deriveMetricExports(ESCALATIONS_METRICS_CATALOG)
export const ESCALATIONS_METRIC_IDS = derived.ids
export const ESCALATIONS_METRIC_ID_SET = derived.idSet
export const DEFAULT_ESCALATIONS_METRIC_IDS = derived.defaultIds
export const ESCALATIONS_MAX_ACTIVE_METRICS = derived.maxActive
