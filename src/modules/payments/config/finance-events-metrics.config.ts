/**
 * Finance Events — optional metrics (columns-first; empty product KPI set OK).
 */

export const FINANCE_EVENTS_MODULE_KEY = 'finance-events'

export type FinanceEventsMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

export const FINANCE_EVENTS_METRICS_CATALOG: FinanceEventsMetricCatalogItem[] = []

export const FINANCE_EVENTS_MAX_ACTIVE_METRICS = 0

export const DEFAULT_FINANCE_EVENTS_METRIC_IDS: string[] = []
