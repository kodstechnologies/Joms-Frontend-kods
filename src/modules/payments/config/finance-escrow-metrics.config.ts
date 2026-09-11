import {
  catalogFromMetricRows,
  deriveMetricExports,
  type MetricRowTuple,
} from '@/shared/lib/define-metrics-catalog'

export const FINANCE_ESCROW_MODULE_KEY = 'finance-escrow'

export type FinanceEscrowMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

const FINANCE_ESCROW_METRIC_DEFS: MetricRowTuple[] = [
  ['active-escrows', 'Active Escrows', 'Count', 'Open escrow holds', true],
  ['held-amount', 'Held Amount', 'Currency', 'Total held in escrow', true],
  ['released-mtd', 'Released (MTD)', 'Currency', 'Released this month', true],
  ['disputed', 'Disputed', 'Count', 'Disputed escrows', true],
]

export const FINANCE_ESCROW_METRICS_CATALOG = catalogFromMetricRows(
  FINANCE_ESCROW_METRIC_DEFS,
) as FinanceEscrowMetricCatalogItem[]

const derived = deriveMetricExports(FINANCE_ESCROW_METRICS_CATALOG)
export const FINANCE_ESCROW_MAX_ACTIVE_METRICS = derived.maxActive
export const DEFAULT_FINANCE_ESCROW_METRIC_IDS = derived.defaultIds
